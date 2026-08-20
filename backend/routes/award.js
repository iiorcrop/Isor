const express = require('express');
const router = express.Router();
const Award = require('../models/Award');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');

// GET all awards (Public / Admin)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.active === 'true') {
            filter.isActive = true;
        }
        const awards = await Award.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(awards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single award details by ID
router.get('/:id', async (req, res) => {
    try {
        const award = await Award.findById(req.params.id);
        if (!award) return res.status(404).json({ message: 'Award not found' });
        res.json(award);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE award (Admin)
router.post('/', upload.fields([
    { name: 'mainPhoto', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), async (req, res) => {
    try {
        let mainPhotoUrl = req.body.mainPhoto || '';
        let documentUrl = req.body.documentUrl || '';

        if (req.files && req.files['mainPhoto'] && req.files['mainPhoto'][0]) {
            mainPhotoUrl = await uploadToStorageServer(req.files['mainPhoto'][0]);
        }
        if (req.files && req.files['document'] && req.files['document'][0]) {
            documentUrl = await uploadToStorageServer(req.files['document'][0]);
        }

        const award = new Award({
            title: req.body.title,
            awardBy: req.body.awardBy || 'Indian Society of Oilseeds Research (ICAR)',
            category: req.body.category || 'General',
            cashPrize: req.body.cashPrize || '',
            frequency: req.body.frequency || 'Annual',
            eligibility: req.body.eligibility || '',
            description: req.body.description || '',
            mainPhoto: mainPhotoUrl,
            documentUrl: documentUrl,
            applicationDeadline: req.body.applicationDeadline || '',
            isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
            order: Number(req.body.order || 0)
        });

        await award.save();
        res.status(201).json({ message: 'Award created successfully', award });
    } catch (err) {
        console.error('Error creating award:', err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE award (Admin)
router.put('/:id', upload.fields([
    { name: 'mainPhoto', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), async (req, res) => {
    try {
        const award = await Award.findById(req.params.id);
        if (!award) return res.status(404).json({ message: 'Award not found' });

        if (req.files && req.files['mainPhoto'] && req.files['mainPhoto'][0]) {
            award.mainPhoto = await uploadToStorageServer(req.files['mainPhoto'][0]);
        } else if (req.body.mainPhoto !== undefined) {
            award.mainPhoto = req.body.mainPhoto;
        }

        if (req.files && req.files['document'] && req.files['document'][0]) {
            award.documentUrl = await uploadToStorageServer(req.files['document'][0]);
        } else if (req.body.documentUrl !== undefined) {
            award.documentUrl = req.body.documentUrl;
        }

        if (req.body.title !== undefined) award.title = req.body.title;
        if (req.body.awardBy !== undefined) award.awardBy = req.body.awardBy;
        if (req.body.category !== undefined) award.category = req.body.category;
        if (req.body.cashPrize !== undefined) award.cashPrize = req.body.cashPrize;
        if (req.body.frequency !== undefined) award.frequency = req.body.frequency;
        if (req.body.eligibility !== undefined) award.eligibility = req.body.eligibility;
        if (req.body.description !== undefined) award.description = req.body.description;
        if (req.body.applicationDeadline !== undefined) award.applicationDeadline = req.body.applicationDeadline;
        if (req.body.isActive !== undefined) {
            award.isActive = req.body.isActive === 'true' || req.body.isActive === true;
        }
        if (req.body.order !== undefined) award.order = Number(req.body.order);

        await award.save();
        res.json({ message: 'Award updated successfully', award });
    } catch (err) {
        console.error('Error updating award:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE award (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const award = await Award.findByIdAndDelete(req.params.id);
        if (!award) return res.status(404).json({ message: 'Award not found' });
        res.json({ message: 'Award deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
