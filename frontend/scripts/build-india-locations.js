/**
 * Builds src/data/indiaLocations.json - { State: { District: [Mandal/Tehsil] } } -
 * from the GeoNames India postal dataset, which is licensed CC BY 4.0.
 *
 * Usage:
 *   curl -LO https://download.geonames.org/export/zip/IN.zip && unzip IN.zip
 *   node scripts/build-india-locations.js src/data/indiaLocations.json
 *
 * GeoNames columns: country, postcode, place, admin1(state), code1,
 * admin2(district), code2, admin3(subdistrict), code3, lat, lng, accuracy
 */
const fs = require('fs');
const path = require('path');

const SRC = process.env.GEONAMES_IN || path.join(process.cwd(), 'IN.txt');
const OUT = process.argv[2];

// GeoNames spellings -> the canonical names used in INDIAN_STATES.
const STATE_ALIASES = {
    'Andaman & Nicobar Islands': 'Andaman and Nicobar Islands',
    'Jammu & Kashmir': 'Jammu and Kashmir',
    'Pondicherry': 'Puducherry',
    'Orissa': 'Odisha',
    'Uttaranchal': 'Uttarakhand'
};

// Ladakh was carved out of Jammu & Kashmir after this dataset was compiled.
const LADAKH_DISTRICTS = new Set(['leh', 'kargil']);

const JUNK = new Set(['na', 'n.a', 'n.a.', 'null', 'none', 'nil', '-', '--']);

const key = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const isUsable = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 3) return false;
    if (JUNK.has(trimmed.toLowerCase())) return false;
    if (!/[a-zA-Z]{3}/.test(trimmed)) return false;
    return true;
};

const isSubsequence = (a, b) => {
    let i = 0;
    for (let j = 0; j < b.length && i < a.length; j++) {
        if (a[i] === b[j]) i++;
    }
    return i === a.length;
};

/**
 * The same place is spelled several ways across rows ("Rajendra Nagar",
 * "Rajendranagar"). Collapse them on an alphanumeric-only key and keep the
 * spelling that appears in the most postal rows.
 *
 * A one-off row is also dropped when a well-established name in the same group
 * is its letter-for-letter expansion or contraction ("Kargl" -> "Kargil"), which
 * is how vowel-dropped abbreviations show up in the source data.
 */
const pickBest = (counts) => {
    const best = new Map(); // normalized key -> { name, count }
    for (const [name, count] of counts) {
        const k = key(name);
        const current = best.get(k);
        if (!current) best.set(k, { name, count });
        else if (count > current.count) best.set(k, { name, count: current.count + count });
        else current.count += count;
    }

    // Second pass: transliteration variants ("Kanayannoor" / "Kanayanur") share a
    // consonant skeleton. Only merge on skeletons long enough to be distinctive.
    const bySkeleton = new Map();
    for (const [k, entry] of best) {
        const skeleton = k.replace(/(.)\1+/g, '$1').replace(/(?!^)[aeiou]/g, '');
        if (skeleton.length < 5) continue;
        const current = bySkeleton.get(skeleton);
        if (!current) {
            bySkeleton.set(skeleton, { key: k, count: entry.count });
        } else if (entry.count > current.count) {
            best.delete(current.key);
            bySkeleton.set(skeleton, { key: k, count: current.count + entry.count });
        } else {
            best.delete(k);
            current.count += entry.count;
        }
    }

    const entries = Array.from(best.entries());
    return entries
        .filter(([k, entry]) => !entries.some(([otherKey, other]) =>
            otherKey !== k &&
            entry.count === 1 &&
            other.count >= 3 &&
            (isSubsequence(k, otherKey) || isSubsequence(otherKey, k))
        ))
        .map(([, entry]) => entry.name)
        .sort((a, b) => a.localeCompare(b));
};

const rows = fs.readFileSync(SRC, 'utf8').split('\n');
const tree = new Map(); // state -> district -> Map(mandal -> count)

for (const row of rows) {
    if (!row.trim()) continue;
    const cols = row.split('\t');
    let state = (cols[3] || '').trim();
    const district = (cols[5] || '').trim();
    const mandal = (cols[7] || '').trim();
    if (!isUsable(state) || !isUsable(district) || !isUsable(mandal)) continue;

    state = STATE_ALIASES[state] || state;
    if (state === 'Jammu and Kashmir' && LADAKH_DISTRICTS.has(key(district))) {
        state = 'Ladakh';
    }

    if (!tree.has(state)) tree.set(state, new Map());
    const districts = tree.get(state);
    if (!districts.has(district)) districts.set(district, new Map());
    const mandals = districts.get(district);
    mandals.set(mandal, (mandals.get(mandal) || 0) + 1);
}

// Districts are deduped the same way, merging their mandal lists.
const out = {};
for (const state of Array.from(tree.keys()).sort((a, b) => a.localeCompare(b))) {
    const districtCounts = new Map();
    for (const [district, mandals] of tree.get(state)) {
        let total = 0;
        for (const count of mandals.values()) total += count;
        districtCounts.set(district, total);
    }
    const districtNames = pickBest(districtCounts);
    const canonicalByKey = new Map(districtNames.map(name => [key(name), name]));

    const merged = new Map(); // canonical district -> Map(mandal -> count)
    for (const [district, mandals] of tree.get(state)) {
        const canonical = canonicalByKey.get(key(district));
        if (!merged.has(canonical)) merged.set(canonical, new Map());
        const target = merged.get(canonical);
        for (const [mandal, count] of mandals) {
            target.set(mandal, (target.get(mandal) || 0) + count);
        }
    }

    out[state] = {};
    for (const district of districtNames) {
        out[state][district] = pickBest(merged.get(district));
    }
}

fs.writeFileSync(OUT, JSON.stringify(out));

const states = Object.keys(out);
const districts = states.reduce((sum, s) => sum + Object.keys(out[s]).length, 0);
const mandals = states.reduce(
    (sum, s) => sum + Object.values(out[s]).reduce((n, list) => n + list.length, 0), 0
);
console.log(`states: ${states.length}\ndistricts: ${districts}\nmandals: ${mandals}`);
console.log(`bytes: ${fs.statSync(OUT).size}`);
