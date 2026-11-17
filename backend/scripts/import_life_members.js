/**
 * One-off import of legacy ISOR Life Members from the office Excel sheet.
 *
 * Usage (from backend/):
 *   node scripts/import_life_members.js --file "<path to xlsx>" --unknown-year <YYYY|token> [--out <dir>] [--commit]
 *
 * Without --commit it is a dry run: nothing is written, a preview + report is produced.
 * Every inserted document carries legacy.importBatch so the import can be rolled back with:
 *   db.members.deleteMany({ 'legacy.importBatch': '<batch>' })
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const args = process.argv.slice(2);
const getArg = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};
const FILE = getArg('file');
const SHEET = getArg('sheet', 'AP');
const UNKNOWN_YEAR = getArg('unknown-year');
const OUT_DIR = getArg('out', path.join(process.cwd(), 'migration-output'));
const COMMIT = args.includes('--commit');
const DEFAULT_PASSWORD = 'Isor@2026';
const BATCH = `life-members-${new Date().toISOString().slice(0, 10)}`;

if (!FILE || !UNKNOWN_YEAR) {
    console.error('Required: --file <xlsx> --unknown-year <value used in IDs when year is missing>');
    process.exit(1);
}

// Rows the office has asked us not to import (by legacy LM number)
const EXCLUDED = {
    1004: 'Member asked for name/membership to be deleted',
    1672: 'Noted as deceased (son requested)'
};

const INDIAN_STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
    'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal'
];
const STATE_ALIASES = {
    'new delhi': 'Delhi', 'chhattisgadh': 'Chhattisgarh', 'chattisgadh': 'Chhattisgarh', 'chattisgarh': 'Chhattisgarh',
    'chhatisgadh': 'Chhattisgarh', 'c.g.': 'Chhattisgarh', 'g.g.': 'Chhattisgarh', 'megghalaya': 'Meghalaya',
    'south west bengal': 'West Bengal', 'wb': 'West Bengal', 'maharasthra': 'Maharashtra', 'maharastra': 'Maharashtra',
    'maharasghra': 'Maharashtra', 'maharshtra': 'Maharashtra', 'mahrasthra': 'Maharashtra', 'mahrashtra': 'Maharashtra',
    'maharashra': 'Maharashtra', 'tellangana': 'Telangana', 'telengana': 'Telangana', 'telagana': 'Telangana',
    '`telangana': 'Telangana', 'uttarpradesh': 'Uttar Pradesh', 'uttar padesh': 'Uttar Pradesh',
    'orissa': 'Odisha', 'orisha': 'Odisha', 'orrisa': 'Odisha', 'uttar karnataka': 'Karnataka',
    'north kanera': 'Karnataka', 'kaarnataka': 'Karnataka', 'jammu': 'Jammu and Kashmir',
    'jammu & kashmir': 'Jammu and Kashmir', 'ut pondicherry': 'Puducherry', 'pondicherry': 'Puducherry',
    'pondicheri': 'Puducherry', 'uttarkhand': 'Uttarakhand', 't.n.': 'Tamil Nadu', 'tamilnadu': 'Tamil Nadu',
    'jarkhand': 'Jharkhand', 'mahdya pradesh': 'Madhya Pradesh', 'rajastan': 'Rajasthan',
    'kenya': 'Kenya', 'usa': 'USA', 'canada': 'Canada'
};

const str = (v) => (v === null || v === undefined ? '' : String(v)).replace(/\r\n|\r|\n/g, ', ').replace(/\s+/g, ' ').trim();
const clean = (v) => str(v).replace(/^[,;.\s]+|[,;\s]+$/g, '');
const pad4 = (n) => String(n).padStart(4, '0');

const normalizeTitle = (raw) => {
    const t = str(raw).toLowerCase().replace(/[^a-z. ]/g, '');
    if (t.startsWith('prof')) return 'Prof.';
    if (t.startsWith('mr')) return 'Mr.';
    if (t.startsWith('ms') || t.startsWith('miss') || t.startsWith('mrs')) return 'Ms.';
    return 'Dr.'; // "Dr", "Dr.,", "D" and blanks
};

const splitName = (raw) => {
    let name = str(raw).replace(/^(dr|prof|mr|ms|mrs)\.?\s+/i, '').replace(/[,\s]+$/, '').trim();
    if (name.includes(',')) {
        const [last, ...rest] = name.split(',');
        const first = rest.join(' ').trim();
        if (first) return { firstName: first, lastName: last.trim() };
        name = last.trim();
    }
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) {
        const m = parts[0].match(/^(.+\.)([^.]+)$/); // "K.Sakthivel" -> "K." + "Sakthivel"
        return m ? { firstName: m[1], lastName: m[2] } : { firstName: parts[0], lastName: '' };
    }
    return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
};

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
const extractEmails = (raw) => {
    const s = str(raw).toLowerCase().replace(/[\[\]<>:]/g, '').replace(/\s*\.\s*(com|in|org|net|edu|gov|ac|co)\b/g, '.$1');
    return [...new Set(
        s.split(/[;,/&\s]+|\(or\)|\bor\b/)
            .map(t => t.replace(/^[(.]+|[).]+$/g, ''))
            .filter(t => EMAIL_RE.test(t))
    )];
};

const normalizeMobile = (raw) => {
    const first = str(raw).split(/[/,;]/)[0];
    let d = first.replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d.length >= 6 ? d : '';
};

const extractPincode = (...vals) => {
    for (const v of vals) {
        const m = str(v).match(/(?<!\d)(\d{3})\s?(\d{3})(?!\d)/);
        if (m) return m[1] + m[2];
    }
    return '';
};

const normalizeState = (raw) => {
    const s = str(raw);
    if (!s) return '';
    const canon = INDIAN_STATES.find(x => x.toLowerCase() === s.toLowerCase());
    return canon || STATE_ALIASES[s.toLowerCase()] || s;
};

// Returns { year, date } from the free-text "Year of life membership" column
const parseYear = (raw) => {
    if (typeof raw === 'number' && raw > 20000 && raw < 60000) {
        const d = XLSX.SSF.parse_date_code(raw);
        return { year: d.y, date: new Date(Date.UTC(d.y, d.m - 1, d.d)) };
    }
    const s = str(raw);
    if (!s) return { year: null, date: null };
    let m = s.match(/^(\d{1,2})-(\d{1,2})-((?:19|20)\d\d)$/);
    if (m) return { year: +m[3], date: new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])) };
    const parsed = Date.parse(s.replace(/\.$/, ''));
    if (/[a-z]/i.test(s) && /\d{1,2},?\s+(19|20)\d\d/.test(s) && !isNaN(parsed)) {
        const d = new Date(parsed);
        return { year: d.getFullYear(), date: new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) };
    }
    m = s.match(/(?<!\d)((?:19|20)\d\d)(?!\d)/);
    if (m) return { year: +m[1], date: null };
    return { year: null, date: null };
};

const looksLikeNote = (v) => /^\d{4}(\s*-\s*\d{2,4})?$|details not found|delete/i.test(v);

const nameKey = (raw) => str(raw).toLowerCase().replace(/^(dr|prof|mr|ms)\.?\s+/, '').replace(/[^a-z]/g, '');

async function main() {
    const wb = XLSX.readFile(FILE);
    const ws = wb.Sheets[SHEET];
    if (!ws) throw new Error(`Sheet "${SHEET}" not found`);
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true })
        .map((r, i) => ({ sheetRow: i + 1, r }))
        .slice(1)
        .filter(x => x.r.some(v => str(v) !== ''));

    const skipped = [];
    const skip = (rec, reason) => skipped.push({ sheetRow: rec.sheetRow, lmNumber: rec.lmNumber || '', name: rec.rawName, email: rec.rawEmail, reason });

    // 1. Parse rows
    let candidates = rows.map(({ sheetRow, r }) => {
        const lm = str(r[0]);
        const { year, date } = parseYear(r[5]);
        const designation = clean(r[3]);
        const organization = clean(r[4]);
        const mailing = clean(r[6]);
        const location = clean(r[7]);
        let address = mailing || [organization, location].filter(Boolean).join(', ');
        if (location && !address.toLowerCase().includes(location.toLowerCase())) address = `${address}, ${location}`;
        const specialization = clean(r[13]);
        return {
            sheetRow,
            lmNumber: /^\d+$/.test(lm) ? Number(lm) : null,
            rawName: str(r[2]),
            rawEmail: str(r[11]),
            rawYear: str(r[5]),
            title: normalizeTitle(r[1]),
            ...splitName(r[2]),
            designation,
            organization,
            address: address.replace(/^,\s*/, ''),
            pincode: extractPincode(r[7], r[6]),
            state: normalizeState(r[8]),
            zone: str(r[9]),
            mobileNumber: normalizeMobile(r[10]),
            emails: extractEmails(r[11]),
            qualification: clean(r[12]),
            specialization: looksLikeNote(specialization) ? '' : specialization,
            year,
            exactDate: date
        };
    });

    // 2. Hard exclusions and unusable rows
    candidates = candidates.filter(c => {
        if (c.lmNumber && EXCLUDED[c.lmNumber]) return skip(c, EXCLUDED[c.lmNumber]), false;
        if (!c.firstName) return skip(c, 'No name in sheet'), false;
        return true;
    });

    // 3. Resolve duplicate LM numbers: merge same person, otherwise keep the more complete row
    const completeness = c => (c.emails.length ? 4 : 0) + (c.mobileNumber ? 2 : 0) + (c.year ? 1 : 0) + (c.designation ? 1 : 0);
    const byNumber = new Map();
    const needsNumber = [];
    for (const c of candidates) {
        if (!c.lmNumber) { needsNumber.push(c); continue; }
        const existing = byNumber.get(c.lmNumber);
        if (!existing) { byNumber.set(c.lmNumber, c); continue; }
        if (nameKey(existing.rawName) === nameKey(c.rawName)) {
            for (const k of Object.keys(c)) {
                if ((existing[k] === '' || existing[k] === null || (Array.isArray(existing[k]) && !existing[k].length)) && c[k]) existing[k] = c[k];
            }
            skip(c, `Duplicate of sheet row ${existing.sheetRow} (same LM ${c.lmNumber}, merged)`);
        } else {
            const [keep, move] = completeness(c) > completeness(existing) ? [c, existing] : [existing, c];
            byNumber.set(c.lmNumber, keep);
            move.numberConflict = `LM ${c.lmNumber} also used by sheet row ${keep.sheetRow}`;
            move.lmNumber = null;
            needsNumber.push(move);
        }
    }

    // 4. Existing DB state
    await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 30000 });
    const col = mongoose.connection.db.collection('members');
    const dbMembers = await col.find({}, { projection: { email: 1, membershipId: 1 } }).toArray();
    const usedEmails = new Set(dbMembers.map(m => (m.email || '').toLowerCase()));
    const usedIds = new Set(dbMembers.map(m => m.membershipId));

    // 5. Emails: numbered rows first (sheet order), then rows without a number
    const numbered = [...byNumber.values()].sort((a, b) => a.sheetRow - b.sheetRow);
    const emailOwner = new Map();
    const withEmail = [];
    for (const c of [...numbered, ...needsNumber.sort((a, b) => a.sheetRow - b.sheetRow)]) {
        if (!c.emails.length) { skip(c, 'No valid email'); continue; }
        // Primary (first) email already taken => same person listed again
        const primary = c.emails[0];
        if (usedEmails.has(primary)) {
            const owner = emailOwner.get(primary);
            skip(c, owner ? `Email ${primary} already used by sheet row ${owner.sheetRow} (${owner.rawName})` : `Email ${primary} already exists in database`);
            continue;
        }
        // Secondary addresses are often shared station inboxes; flag overlaps instead of skipping
        const overlap = c.emails.slice(1).map(e => emailOwner.get(e)).find(Boolean);
        if (overlap) c.numberConflict = `REVIEW: secondary email shared with sheet row ${overlap.sheetRow} (${overlap.rawName})`;
        usedEmails.add(primary);
        emailOwner.set(primary, c);
        c.email = primary;
        c.extraEmails = c.emails.slice(1);
        withEmail.push(c);
    }

    // Flag rows without a number whose name matches a numbered member (possible duplicate, review manually)
    const tokenKey = (raw) => str(raw).toLowerCase().replace(/^(dr|prof|mr|ms)\.?\s+/, '').split(/[^a-z]+/).filter(Boolean).sort().join(' ');
    const numberedByName = new Map(numbered.map(c => [tokenKey(c.rawName), c]));
    for (const c of withEmail.filter(c => !c.lmNumber)) {
        const match = numberedByName.get(tokenKey(c.rawName));
        if (match) c.numberConflict = [c.numberConflict, `REVIEW: same name as LM ${match.lmNumber} (sheet row ${match.sheetRow})`].filter(Boolean).join('; ');
    }

    // 6. Assign new LM numbers after the highest one in the sheet
    let nextNumber = Math.max(...rows.map(x => Number(str(x.r[0])) || 0)) + 1;
    for (const c of withEmail.filter(c => !c.lmNumber).sort((a, b) => a.sheetRow - b.sheetRow)) {
        c.lmNumber = nextNumber++;
        c.newNumber = true;
    }

    // 7. Build documents
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const now = new Date();
    const docs = [];
    const preview = [];
    for (const c of withEmail.sort((a, b) => a.lmNumber - b.lmNumber)) {
        const membershipId = `ISOR-${c.year || UNKNOWN_YEAR}-L${pad4(c.lmNumber)}`;
        if (usedIds.has(membershipId)) { skip(c, `Membership ID ${membershipId} already exists in database`); continue; }
        usedIds.add(membershipId);
        const doc = {
            membershipId,
            title: c.title,
            firstName: c.firstName,
            lastName: c.lastName,
            password: passwordHash,
            designation: c.designation,
            organization: c.organization,
            address: c.address,
            qualification: c.qualification,
            specialization: c.specialization,
            pincode: c.pincode,
            state: c.state,
            district: '',
            mandal: '',
            membershipType: 'lifetime',
            membershipYear: c.year ? String(c.year) : '',
            email: c.email,
            mobileNumber: c.mobileNumber,
            proposers: [],
            paymentStatus: 'Completed',
            role: 'member',
            isVerified: true,
            profileCompleted: Boolean(c.firstName && c.lastName && c.email && c.mobileNumber && c.address),
            subscriptionStatus: 'Active',
            subscriptionStartDate: c.exactDate || null,
            subscriptionEndDate: null,
            approvalStatus: 'Approved',
            legacy: {
                importBatch: BATCH,
                source: path.basename(FILE),
                sheet: SHEET,
                sheetRow: c.sheetRow,
                lmNumber: c.lmNumber,
                lmNumberAssigned: Boolean(c.newNumber),
                numberConflict: c.numberConflict || null,
                rawYear: c.rawYear,
                zone: c.zone,
                otherEmails: c.extraEmails
            },
            createdAt: now,
            updatedAt: now,
            __v: 0
        };
        docs.push(doc);
        preview.push({
            membershipId, lmNumber: c.lmNumber, newNumber: c.newNumber ? 'yes' : '', sheetRow: c.sheetRow,
            title: doc.title, firstName: doc.firstName, lastName: doc.lastName, email: doc.email,
            mobileNumber: doc.mobileNumber, membershipYear: doc.membershipYear, rawYear: c.rawYear,
            state: doc.state, pincode: doc.pincode, organization: doc.organization, designation: doc.designation,
            otherEmails: c.extraEmails.join('; '), note: c.numberConflict || ''
        });
    }

    // 8. Reports
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const out = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(out, XLSX.utils.json_to_sheet(preview), 'To import');
    XLSX.utils.book_append_sheet(out, XLSX.utils.json_to_sheet(skipped.sort((a, b) => a.sheetRow - b.sheetRow)), 'Skipped');
    const reportPath = path.join(OUT_DIR, `${BATCH}-${COMMIT ? 'imported' : 'dry-run'}.xlsx`);
    XLSX.writeFile(out, reportPath);

    const count = (f) => docs.filter(f).length;
    console.log(`Sheet rows: ${rows.length}`);
    console.log(`To import: ${docs.length}  (year known: ${count(d => d.membershipYear)}, year unknown: ${count(d => !d.membershipYear)}, new LM numbers: ${count(d => d.legacy.lmNumberAssigned)}, no mobile: ${count(d => !d.mobileNumber)}, single-word name: ${count(d => !d.lastName)})`);
    const reasons = {};
    skipped.forEach(s => { const k = s.reason.replace(/\d+|\(.*\)/g, '#'); reasons[k] = (reasons[k] || 0) + 1; });
    console.log(`Skipped: ${skipped.length}`, reasons);
    console.log(`Report: ${reportPath}`);

    if (COMMIT) {
        const backupPath = path.join(OUT_DIR, `members-backup-before-${BATCH}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(await col.find({}).toArray(), null, 2));
        console.log(`Backup of existing members: ${backupPath}`);
        const res = await col.insertMany(docs, { ordered: true });
        console.log(`Inserted ${res.insertedCount} members with legacy.importBatch = "${BATCH}"`);
    } else {
        console.log('Dry run only - nothing written. Re-run with --commit to import.');
    }
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error('Import failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
