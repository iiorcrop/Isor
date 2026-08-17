const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

// Helper to check if request belongs to active member
const isActiveMemberRequest = async (req) => {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) return false;

    try {
        const decoded = jwt.verify(token, 'isor_secret_key_2026');
        const member = await Member.findById(decoded.id);
        if (!member) return false;

        // Auto expire check
        if (member.membershipType?.toLowerCase() === 'yearly' && member.subscriptionEndDate) {
            if (new Date() > new Date(member.subscriptionEndDate)) {
                return false;
            }
        }

        return member.approvalStatus === 'Approved' && (member.subscriptionStatus === 'Active' || !member.subscriptionStatus);
    } catch (err) {
        return false;
    }
};

// Helper: Get sliced 2-page PDF buffer
const getSlicedPdfBuffer = async (fullFilePath) => {
    try {
        const fileBytes = fs.readFileSync(fullFilePath);
        const pdfDoc = await PDFDocument.load(fileBytes);
        const totalPages = pdfDoc.getPageCount();

        if (totalPages <= 2) {
            return fileBytes;
        }

        const previewDoc = await PDFDocument.create();
        const copiedPages = await previewDoc.copyPages(pdfDoc, [0, 1]);
        copiedPages.forEach((page) => previewDoc.addPage(page));

        const previewBytes = await previewDoc.save();
        return Buffer.from(previewBytes);
    } catch (err) {
        console.error('PDF Slicing Error:', err);
        return fs.readFileSync(fullFilePath);
    }
};

// GET all active journals
router.get('/', async (req, res) => {
    try {
        const journals = await Journal.find({ isActive: true }).sort('-year -order');
        res.json(journals);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET Journal PDF (2 pages for public/inactive users, full pages for active members)
router.get('/:id/pdf', async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal || !journal.pdfUrl) {
            return res.status(404).json({ message: 'Journal PDF not found' });
        }

        let relativePath = journal.pdfUrl.replace(/^[/\\]+/, '');
        if (relativePath.startsWith('uploads/')) {
            relativePath = relativePath.replace(/^uploads[/\\]+/, '');
        }
        const fullFilePath = path.join(__dirname, '../uploads', relativePath);

        if (!fs.existsSync(fullFilePath)) {
            return res.status(404).json({ message: 'Journal PDF file does not exist on server' });
        }

        const isActive = await isActiveMemberRequest(req);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${(journal.title || 'journal').replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);

        if (isActive) {
            // Serve Full PDF to active members
            return res.sendFile(fullFilePath);
        } else {
            // Serve 2-Page Restricted PDF to public / inactive members
            const slicedBuffer = await getSlicedPdfBuffer(fullFilePath);
            return res.send(slicedBuffer);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all journals (Admin)
router.get('/admin', async (req, res) => {
    try {
        const journals = await Journal.find().sort('-year -order');
        res.json(journals);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE journal
router.post('/', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const journalData = {
            ...req.body,
            coverImageUrl: (req.files && req.files['cover']) ? await uploadToStorageServer(req.files['cover'][0]) : (req.body.coverImageUrl || null),
            pdfUrl: (req.files && req.files['pdf']) ? await uploadToStorageServer(req.files['pdf'][0]) : (req.body.pdfUrl || null)
        };
        const journal = new Journal(journalData);
        await journal.save();
        res.status(201).json(journal);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE journal
router.patch('/:id', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.files && req.files['cover']) updateData.coverImageUrl = await uploadToStorageServer(req.files['cover'][0]);
        if (req.files && req.files['pdf']) updateData.pdfUrl = await uploadToStorageServer(req.files['pdf'][0]);

        const journal = await Journal.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(journal);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE journal
router.delete('/:id', async (req, res) => {
    try {
        await Journal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Journal deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
