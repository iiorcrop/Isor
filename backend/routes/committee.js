const express = require('express');
const router = express.Router();
const Committee = require('../models/Committee');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');

// DEDICATED UPDATE ROUTE (Using POST for maximum compatibility)
router.post('/update-member/:id', upload.single('photo'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.photoUrl = await uploadToStorageServer(req.file);
        }
        
        const member = await Committee.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        
        res.json(member);
    } catch (err) { 
        console.error('Update Error:', err);
        res.status(500).json({ message: err.message }); 
    }
});

// GET members by type
router.get('/:type', async (req, res) => {
    try {
        // If type is an ID (24 chars), it might be a mistake, handle it
        if (req.params.type.length === 24) {
             return res.status(400).json({ message: "Use PUT for updates" });
        }
        const members = await Committee.find({ committeeType: req.params.type }).sort({ order: 1, period: -1, createdAt: -1 });
        res.json(members);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ADD member (with photo)
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        console.log('Adding committee member with body:', req.body);
        console.log('File received:', req.file);
        
        const memberData = {
            ...req.body,
            photoUrl: req.file ? await uploadToStorageServer(req.file) : null
        };
        const member = new Committee(memberData);
        await member.save();
        console.log('Member saved successfully');
        res.status(201).json(member);
    } catch (err) { 
        console.error('ADD Committee Member Error:', err);
        res.status(400).json({ message: err.message }); 
    }
});

// DELETE member
router.delete('/:id', async (req, res) => {
    try {
        await Committee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
