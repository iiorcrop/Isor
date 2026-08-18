const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { PDFDocument } = require('pdf-lib');
const Member = require('../models/Member');

router.get('/:filename', async (req, res) => {
    try {
        const rawFilename = req.params.filename;
        const filename = path.basename(rawFilename);
        if (!filename.toLowerCase().endsWith('.pdf')) {
            return res.status(400).send('Invalid PDF file format');
        }

        const isExplicitUnsecure = req.query && (req.query.secure === '0' || req.query.secure === 'false' || req.query.unsecure === '1' || req.query.unsecure === 'true');
        const isSecureReq = !isExplicitUnsecure;

        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        let isActiveMember = false;
        if (token) {
            try {
                const decoded = jwt.verify(token, 'isor_secret_key_2026');
                const member = await Member.findById(decoded.id);
                if (member && member.approvalStatus === 'Approved') {
                    if (member.membershipType?.toLowerCase() === 'yearly') {
                        if (member.subscriptionEndDate && new Date() <= new Date(member.subscriptionEndDate)) {
                            isActiveMember = true;
                        }
                    } else {
                        isActiveMember = true;
                    }
                }
            } catch (e) {
                isActiveMember = false;
            }
        }

        // Fetch PDF buffer: first check local disk, else fetch from remote storage
        let fileBytes = null;
        const localPath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(localPath)) {
            fileBytes = fs.readFileSync(localPath);
        } else {
            const storageBase = (process.env.FILE_STORAGE_INTERNAL_URL || process.env.VITE_FILE_STORAGE_URL || 'https://file.iior-niger.in').replace(/\/+$/, '');
            const remoteUrl = `${storageBase}/uploads/${filename}`;
            const resp = await axios.get(remoteUrl, { responseType: 'arraybuffer', timeout: 30000 });
            fileBytes = Buffer.from(resp.data);
        }

        if (!fileBytes || fileBytes.length === 0) {
            return res.status(404).send('PDF file not found');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

        // If secure option is requested and user is not an active member, slice to first 2 pages
        if (isSecureReq && !isActiveMember) {
            try {
                const pdfDoc = await PDFDocument.load(fileBytes);
                const pageCount = pdfDoc.getPageCount();
                if (pageCount <= 2) {
                    return res.send(fileBytes);
                }
                const previewDoc = await PDFDocument.create();
                const copiedPages = await previewDoc.copyPages(pdfDoc, [0, 1]);
                copiedPages.forEach((page) => previewDoc.addPage(page));
                const previewBytes = await previewDoc.save();
                return res.send(Buffer.from(previewBytes));
            } catch (e) {
                console.error('Failed to slice PDF with pdf-lib:', e);
                return res.send(fileBytes);
            }
        }

        return res.send(fileBytes);
    } catch (err) {
        console.error('Error serving PDF:', err);
        return res.status(500).send('Error loading PDF document');
    }
});

module.exports = router;
