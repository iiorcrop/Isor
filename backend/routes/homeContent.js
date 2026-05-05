const express = require('express');
const router = express.Router();
const { About, Stat, Announcement } = require('../models/HomeContent');

// ABOUT ROUTES
router.get('/about', async (req, res) => {
    try {
        let about = await About.findOne();
        if (!about) about = await About.create({ 
            title: 'About ISOR', 
            content: [
                'The Indian Society of Oilseeds Research (ISOR) was established in 1984 and registered under the Societies Registration Act, headquartered at the ICAR-Directorate of Oilseeds Research (DOR), Rajendranagar, Hyderabad.',
                'ISOR is a premier scientific society dedicated to promoting research, education, and development in oilseed crops including groundnut, sunflower, safflower, soybean, mustard/rapeseed, sesame, linseed, and castor.',
                'The flagship publication — the Journal of Oilseeds Research (JOR) — is a peer-reviewed, UGC-CARE listed bi-annual journal indexed in NAAS, CAB Abstracts, and AGRIS.'
            ] 
        });
        res.json(about);
    } catch (err) { 
        console.error('DB unreachable, returning mock about');
        res.json({
            title: 'About ISOR',
            content: [
                'The Indian Society of Oilseeds Research (ISOR) was established in 1984 and registered under the Societies Registration Act, headquartered at the ICAR-Directorate of Oilseeds Research (DOR), Rajendranagar, Hyderabad.',
                'ISOR is a premier scientific society dedicated to promoting research, education, and development in oilseed crops including groundnut, sunflower, safflower, soybean, mustard/rapeseed, sesame, linseed, and castor.',
                'The flagship publication — the Journal of Oilseeds Research (JOR) — is a peer-reviewed, UGC-CARE listed bi-annual journal indexed in NAAS, CAB Abstracts, and AGRIS.'
            ]
        });
    }
});

router.put('/about', async (req, res) => {
    try {
        const about = await About.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(about);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// STATS ROUTES
router.get('/stats', async (req, res) => {
    try {
        const stats = await Stat.find().sort({ order: 1 });
        res.json(stats);
    } catch (err) { 
        console.error('DB unreachable, returning mock stats');
        res.json([
            { _id: 'stat1', label: 'Year Established', value: '1984' },
            { _id: 'stat2', label: 'Volumes Published', value: '42+' },
            { _id: 'stat3', label: 'Active Members', value: '3000+' }
        ]);
    }
});

router.post('/stats', async (req, res) => {
    try {
        const stat = new Stat(req.body);
        await stat.save();
        res.status(201).json(stat);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/stats/:id', async (req, res) => {
    try {
        const stat = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(stat);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/stats/:id', async (req, res) => {
    try {
        await Stat.findByIdAndDelete(req.params.id);
        res.json({ message: 'Stat deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ANNOUNCEMENT ROUTES
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (err) { 
        console.error('DB unreachable, returning mock announcements');
        res.json([
            { _id: 'ann1', title: 'JOR Vol. 42(1) 2025 published — Access Now', date: new Date(), badge: 'New', badgeColor: 'success' },
            { _id: 'ann2', title: 'Membership renewal 2025-26 open till May 31, 2025', date: new Date(), badge: 'Important', badgeColor: 'urgent' },
            { _id: 'ann3', title: 'ISOR Best Scientist Award 2024 nominations invited', date: new Date(), badge: 'New', badgeColor: 'success' }
        ]);
    }
});

router.post('/announcements', async (req, res) => {
    try {
        const announcement = new Announcement(req.body);
        await announcement.save();
        res.status(201).json(announcement);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/announcements/:id', async (req, res) => {
    try {
        const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(ann);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/announcements/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
