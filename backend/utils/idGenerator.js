const Member = require('../models/Member');

/**
 * Generates a unique, non-colliding Membership ID (e.g., ISOR-2026-A0007)
 * @param {string} type - Membership type ('Annual', 'Life', 'Student', etc.)
 * @returns {Promise<string>}
 */
const generateMembershipId = async (type) => {
    const year = new Date().getFullYear();
    const prefix = (type === 'Life' || type === 'Lifetime') ? 'L' : ((type === 'Student') ? 'S' : 'A');

    const members = await Member.find({ membershipId: { $exists: true, $ne: '' } }, 'membershipId');
    let maxSeq = 0;
    for (const m of members) {
        if (!m.membershipId) continue;
        const match = m.membershipId.match(/\d+$/);
        if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxSeq) maxSeq = num;
        }
    }

    let seq = maxSeq + 1;
    let candidateId = `ISOR-${year}-${prefix}${seq.toString().padStart(4, '0')}`;
    while (await Member.exists({ membershipId: candidateId })) {
        seq++;
        candidateId = `ISOR-${year}-${prefix}${seq.toString().padStart(4, '0')}`;
    }
    return candidateId;
};

/**
 * Generates a unique, non-colliding Enrollment ID (e.g., ENR-2026-0007)
 * @returns {Promise<string>}
 */
const generateEnrollmentId = async () => {
    const year = new Date().getFullYear();

    const members = await Member.find({ enrollmentId: { $exists: true, $ne: '' } }, 'enrollmentId');
    let maxSeq = 0;
    for (const m of members) {
        if (!m.enrollmentId) continue;
        const match = m.enrollmentId.match(/\d+$/);
        if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxSeq) maxSeq = num;
        }
    }

    let seq = maxSeq + 1;
    let candidateId = `ENR-${year}-${seq.toString().padStart(4, '0')}`;
    while (await Member.exists({ enrollmentId: candidateId })) {
        seq++;
        candidateId = `ENR-${year}-${seq.toString().padStart(4, '0')}`;
    }
    return candidateId;
};

module.exports = {
    generateMembershipId,
    generateEnrollmentId
};
