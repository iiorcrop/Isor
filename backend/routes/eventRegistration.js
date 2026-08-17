const express = require('express');
const router = express.Router();
const EventRegistration = require('../models/EventRegistration');

// GET all event registrations (Admin)
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.eventId) {
            query.eventId = req.query.eventId;
        }
        if (req.query.status) {
            query.paymentStatus = req.query.status;
        }
        const registrations = await EventRegistration.find(query)
            .populate('eventId', 'title eventDate location price isFree')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE registration status (Approve / Reject) (Admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const { paymentStatus, rejectionReason } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const updateData = { paymentStatus };
        if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

        const registration = await EventRegistration.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );

        res.json(registration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE event registration (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await EventRegistration.findByIdAndDelete(req.params.id);
        res.json({ message: 'Registration deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
