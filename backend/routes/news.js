const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToStorageServer } = require('../utils/fileUploader');
const NewsTicker = require('../models/NewsTicker');

const upload = multer({ 
    storage: multer.memoryStorage(),
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
            isPdf: req.body.isPdf === 'true' || req.body.isPdf === true,
            isActive: req.body.isActive === 'true' || req.body.isActive === true,
            isNewItem: req.body.isNewItem === 'true' || req.body.isNewItem === true,
            order: req.body.order || 0
        };

        if (req.file) {
            newsData.pdfUrl = await uploadToStorageServer(req.file);
            newsData.isPdf = true;
        } else if (req.body.pdfUrl) {
            newsData.pdfUrl = req.body.pdfUrl;
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
            isPdf: req.body.isPdf === 'true' || req.body.isPdf === true,
            isActive: req.body.isActive === 'true' || req.body.isActive === true,
            isNewItem: req.body.isNewItem === 'true' || req.body.isNewItem === true,
            order: req.body.order || 0
        };

        if (req.file) {
            newsData.pdfUrl = await uploadToStorageServer(req.file);
            newsData.isPdf = true;
        } else if (req.body.pdfUrl) {
            newsData.pdfUrl = req.body.pdfUrl;
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
        // Since files are stored on remote server, we don't delete them from local filesystem.
        await NewsTicker.findByIdAndDelete(req.params.id);
        res.json({ message: 'News deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
