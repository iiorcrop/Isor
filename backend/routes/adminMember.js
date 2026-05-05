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

        // If approved, generate membershipId if not exists
        if (updateFields.approvalStatus === 'Approved') {
            const memberToApprove = await Member.findById(memberId);
            if (!memberToApprove) {
                return res.status(404).json({ message: 'Member not found' });
            }

            if (!memberToApprove.membershipId) {
                const year = new Date().getFullYear();
                const type = (memberToApprove.membershipType || 'LIFE').toUpperCase();
                
                // Get count for this type and year
                const count = await Member.countDocuments({ 
                    membershipType: memberToApprove.membershipType,
                    membershipId: { $regex: `ISOR/${type}/${year}/` }
                });
                
                const nextId = (count + 1).toString().padStart(3, '0');
                updateFields.membershipId = `ISOR/${type}/${year}/${nextId}`;
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
