const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');

// Multer Config for Banner Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/banners';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// GET all banners
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET active banners
router.get('/active', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(banners);
    } catch (err) {
        console.error('Database unreachable, returning mock banners');
        const mockBanners = [
            { 
                _id: 'mock1',
                title: 'Empowering Oilseeds Innovation', 
                subtitle: 'Advancing sustainable agriculture through cutting-edge research and global collaboration.', 
                imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600',
                isActive: true
            },
            { 
                _id: 'mock2',
                title: '40 Years of Research Excellence', 
                subtitle: 'Promoting scientific education and development in oilseed crops since 1984.', 
                imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1600',
                isActive: true
            },
            { 
                _id: 'mock3',
                title: 'Journal of Oilseeds Research', 
                subtitle: 'Access the latest peer-reviewed studies and agricultural breakthroughs.', 
                imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1600',
                isActive: true
            }
        ];
        res.json(mockBanners);
    }
});

// POST add banner
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const bannerData = {
            title: req.body.title,
            subtitle: req.body.subtitle,
            link: req.body.link,
            order: req.body.order || 0,
            isActive: req.body.isActive === 'true'
        };

        if (req.file) {
            bannerData.imageUrl = `/uploads/banners/${req.file.filename}`;
        } else {
            return res.status(400).json({ message: 'Image is required' });
        }

        const banner = new Banner(bannerData);
        await banner.save();
        res.status(201).json(banner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update banner
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const bannerData = {
            title: req.body.title,
            subtitle: req.body.subtitle,
            link: req.body.link,
            order: req.body.order || 0,
            isActive: req.body.isActive === 'true'
        };

        if (req.file) {
            bannerData.imageUrl = `/uploads/banners/${req.file.filename}`;
            // Optional: delete old image file
        }

        const banner = await Banner.findByIdAndUpdate(req.params.id, bannerData, { new: true });
        res.json(banner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE banner
router.delete('/:id', async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner && banner.imageUrl) {
            const filePath = path.join(__dirname, '..', banner.imageUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
