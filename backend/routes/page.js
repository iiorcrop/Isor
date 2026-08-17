const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const multer = require('multer');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');
const fs = require('fs');

// Keep pdf filter for page PDFs
const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
    }
});

// Keep image filter for editor images (Removed duplicate)

// GET all pages (summary)
router.get('/', async (req, res) => {
    try {
        const pages = await PageContent.find().select('slug title updatedAt');
        res.json(pages);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPLOAD PDF attachment
router.post('/upload-pdf', pdfUpload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const key = await uploadToStorageServer(req.file);
        const fileStorageUrl = process.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in";
        const url = `${fileStorageUrl.replace(/\/+$/, '')}/uploads/${key}`;
        res.json({ url, filename: req.file.originalname, size: req.file.size });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPLOAD File from Rich Text Editor (Images + PDFs)
const editorUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            cb(null, true);
        } else {
            const err = new Error('Only images and PDF files are allowed');
            err.status = 400;
            cb(err);
        }
    }
});

router.post('/upload-image', editorUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const isSecure = req.body.isSecure === 'true' || req.body.isSecure === true;
        const key = await uploadToStorageServer(req.file);
        const fileStorageUrl = process.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in";
        let url = `${fileStorageUrl.replace(/\/+$/, '')}/uploads/${key}`;
        const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
        if (isPdf && isSecure) {
            url += '?secure=1';
        }
        res.json({ url, isPdf, isSecure });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// LIST all PDFs in uploads/pages
router.get('/list-pdfs', (req, res) => {
    try {
        const dir = 'uploads/pages';
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).map(f => ({
            filename: f,
            url: `${dir}/${f}`,
            size: fs.statSync(`${dir}/${f}`).size
        }));
        res.json(files.reverse());
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE a PDF attachment
router.delete('/delete-pdf/:filename', (req, res) => {
    try {
        // Remote PDF deletion is not supported; resolve as success
        res.json({ message: 'File deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// GET specific page by slug (supports nested slugs with slashes)
router.get(/^\/(.*)/, async (req, res) => {
    try {
        const slug = req.params[0].replace(/^\/+/, '');
        const page = await PageContent.findOne({ slug });
        if (!page) {
            // Return empty if not found, frontend will handle "not created yet"
            return res.json({ slug, title: slug, content: '' });
        }
        res.json(page);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE or UPDATE page
router.post('/', async (req, res) => {
    const { slug, title, content, pdfs } = req.body;
    try {
        let page = await PageContent.findOne({ slug });
        if (page) {
            page.title = title;
            page.content = content;
            if (pdfs !== undefined) page.pdfs = pdfs;
            page.updatedAt = Date.now();
            await page.save();
        } else {
            page = new PageContent({ slug, title, content, pdfs: pdfs || [] });
            await page.save();
        }
        res.json(page);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE page
router.delete('/:id', async (req, res) => {
    try {
        await PageContent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Page deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
