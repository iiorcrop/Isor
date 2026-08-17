const express = require('express');
const router = express.Router();
const NationalEvent = require('../models/NationalEvent');
const EventRegistration = require('../models/EventRegistration');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');

// GET all national events (Public / Admin)
router.get('/', async (req, res) => {
    try {
        const events = await NationalEvent.find().sort({ eventDate: -1, createdAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single event details with custom fields
router.get('/:id', async (req, res) => {
    try {
        const event = await NationalEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE national event (Admin)
router.post('/', upload.single('banner'), async (req, res) => {
    try {
        let bannerImage = req.body.bannerImage || '';
        if (req.file) {
            bannerImage = await uploadToStorageServer(req.file);
        }

        let customFields = [];
        if (req.body.customFields) {
            try {
                customFields = typeof req.body.customFields === 'string' 
                    ? JSON.parse(req.body.customFields) 
                    : req.body.customFields;
            } catch (e) {
                console.error('Failed to parse customFields JSON:', e);
            }
        }

        const slug = (req.body.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        const event = new NationalEvent({
            title: req.body.title,
            slug,
            eventDate: req.body.eventDate,
            location: req.body.location,
            description: req.body.description,
            bannerImage,
            isFree: req.body.isFree === 'true' || req.body.isFree === true,
            price: Number(req.body.price || 0),
            customFields,
            isActive: req.body.isActive !== 'false' && req.body.isActive !== false
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE national event (Admin)
router.patch('/:id', upload.single('banner'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.bannerImage = await uploadToStorageServer(req.file);
        }
        if (updateData.customFields && typeof updateData.customFields === 'string') {
            try {
                updateData.customFields = JSON.parse(updateData.customFields);
            } catch (e) {}
        }
        if (updateData.isFree !== undefined) {
            updateData.isFree = updateData.isFree === 'true' || updateData.isFree === true;
        }

        const event = await NationalEvent.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE national event (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await NationalEvent.findByIdAndDelete(req.params.id);
        res.json({ message: 'National event deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUBLIC REGISTER for event
router.post('/:id/register', upload.single('screenshot'), async (req, res) => {
    try {
        const event = await NationalEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        let paymentScreenshot = '';
        if (req.file) {
            paymentScreenshot = await uploadToStorageServer(req.file);
        }

        if (!event.isFree && event.price > 0 && !paymentScreenshot) {
            return res.status(400).json({ message: 'Payment screenshot is required for paid event registrations' });
        }

        let responses = {};
        if (req.body.responses) {
            try {
                responses = typeof req.body.responses === 'string'
                    ? JSON.parse(req.body.responses)
                    : req.body.responses;
            } catch (e) {
                responses = req.body.responses;
            }
        }

        const applicantName = req.body.applicantName || responses.Name || responses.name || responses['Full Name'] || 'Applicant';
        const applicantEmail = req.body.applicantEmail || responses.Email || responses.email || 'N/A';
        const applicantPhone = req.body.applicantPhone || responses.Phone || responses.phone || responses.Mobile || '';

        const registrationNo = `EVT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        const registration = new EventRegistration({
            eventId: event._id,
            eventTitle: event.title,
            registrationNo,
            applicantName,
            applicantEmail,
            applicantPhone,
            responses,
            paymentScreenshot,
            paymentStatus: event.isFree ? 'Approved' : 'Pending'
        });

        await registration.save();
        res.status(201).json(registration);
    } catch (err) {
        console.error('Registration failed:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
