const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { sendEmail, templates } = require('../utils/emailService');

// GET all members with filters
router.get('/', async (req, res) => {
    try {
        const { type, status, search } = req.query;
        let query = {};

        if (type && type !== 'All') query.membershipType = type;
        if (status && status !== 'All') query.approvalStatus = status;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { membershipId: { $regex: search, $options: 'i' } }
            ];
        }

        const members = await Member.find(query).sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update member status (e.g., Verify payment / Approve)
router.patch('/:id/status', async (req, res) => {
    try {
        const updateFields = { ...req.body };
        const memberId = req.params.id;

        // If approved, set subscription dates, payment completed, and generate membershipId if not exists
        if (updateFields.approvalStatus === 'Approved') {
            const memberToApprove = await Member.findById(memberId);
            if (!memberToApprove) {
                return res.status(404).json({ message: 'Member not found' });
            }

            updateFields.paymentStatus = 'Completed';
            updateFields.subscriptionStatus = 'Active';
            updateFields.subscriptionStartDate = new Date();

            const memType = (updateFields.membershipType || memberToApprove.membershipType || 'Yearly');
            if (memType === 'Annual' || memType === 'Yearly') {
                // 1 Year subscription expiry
                updateFields.subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            } else {
                // Lifetime subscription - no expiration
                updateFields.subscriptionEndDate = null;
            }

            if (!memberToApprove.membershipId) {
                const year = new Date().getFullYear();
                const typeCode = (memType === 'Life' || memType === 'Lifetime') ? 'L' : 'A';
                const count = await Member.countDocuments({ membershipId: { $exists: true, $ne: '' } });
                const sequence = (count + 1).toString().padStart(4, '0');
                updateFields.membershipId = `ISOR-${year}-${typeCode}${sequence}`;
            }

            if (!memberToApprove.enrollmentId) {
                const year = new Date().getFullYear();
                const enrCount = await Member.countDocuments({ enrollmentId: { $exists: true, $ne: '' } });
                const sequence = (enrCount + 1).toString().padStart(4, '0');
                updateFields.enrollmentId = `ENR-${year}-${sequence}`;
            }
        }

        const member = await Member.findByIdAndUpdate(
            memberId, 
            { $set: updateFields }, 
            { new: true }
        );

        if (!member) {
            return res.status(404).json({ message: 'Member update failed' });
        }

        // Send Notification Email (non-blocking)
        try {
            if (updateFields.approvalStatus === 'Approved') {
                const template = templates.approved(`${member.title} ${member.firstName}`, member.membershipId);
                sendEmail(member.email, template.subject, template.html);
            } else if (updateFields.approvalStatus === 'Rejected' || updateFields.paymentStatus === 'Rejected') {
                const template = templates.rejected(`${member.title} ${member.firstName}`);
                sendEmail(member.email, template.subject, template.html);
            }
        } catch (emailErr) {
            console.error('Email notification failed (non-blocking):', emailErr.message);
        }

        res.json(member);
    } catch (err) {
        console.error('Status update error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
