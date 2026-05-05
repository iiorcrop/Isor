const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const NewsTicker = require('../models/NewsTicker');

// Multer Config for PDF Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/news';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs are allowed'), false);
        }
    }
});

// GET all news (default)
router.get('/', async (req, res) => {
    try {
        const news = await NewsTicker.find().sort({ order: 1, createdAt: -1 });
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all news (for admin)
router.get('/admin', async (req, res) => {
    try {
        const news = await NewsTicker.find().sort({ order: 1, createdAt: -1 });
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET active news (for frontend)
router.get('/active', async (req, res) => {
    try {
        const news = await NewsTicker.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add news
router.post('/', upload.single('pdf'), async (req, res) => {
    try {
        const newsData = {
            text: req.body.text,
            link: req.body.link,
            isPdf: req.body.isPdf === 'true',
            isActive: req.body.isActive === 'true',
            isNewItem: req.body.isNewItem === 'true',
            order: req.body.order || 0
        };

        if (req.file) {
            newsData.pdfUrl = `/uploads/news/${req.file.filename}`;
            newsData.isPdf = true;
        }

        const news = new NewsTicker(newsData);
        await news.save();
        res.status(201).json(news);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update news
router.put('/:id', upload.single('pdf'), async (req, res) => {
    try {
        const newsData = {
            text: req.body.text,
            link: req.body.link,
            isPdf: req.body.isPdf === 'true',
            isActive: req.body.isActive === 'true',
            isNewItem: req.body.isNewItem === 'true',
            order: req.body.order || 0
        };

        if (req.file) {
            newsData.pdfUrl = `/uploads/news/${req.file.filename}`;
            newsData.isPdf = true;
        }

        const news = await NewsTicker.findByIdAndUpdate(req.params.id, newsData, { new: true });
        res.json(news);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE news
router.delete('/:id', async (req, res) => {
    try {
        const news = await NewsTicker.findById(req.params.id);
        if (news && news.pdfUrl) {
            const filePath = path.join(__dirname, '..', news.pdfUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await NewsTicker.findByIdAndDelete(req.params.id);
        res.json({ message: 'News deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
