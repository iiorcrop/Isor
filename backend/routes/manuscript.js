const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Manuscript = require('../models/Manuscript');
const User = require('../models/User');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');

const JWT_SECRET = process.env.JWT_SECRET || 'isor_secret_key_2026';

// Middleware to authenticate user from Bearer Token
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized - Login required' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        let user = await User.findById(decoded.id);
        if (!user) {
            // Also check Member schema if not found in User
            const Member = require('../models/Member');
            const member = await Member.findById(decoded.id);
            if (!member) {
                return res.status(401).json({ message: 'User account not found' });
            }
            user = {
                _id: member._id,
                name: `${member.firstName} ${member.lastName}`,
                email: member.email,
                role: 'user'
            };
        }
        
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
};

// 1. SUBMIT MANUSCRIPT (Author)
router.post('/submit', authenticateUser, upload.single('pdf'), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and Description/Abstract are required.' });
        }

        let pdfUrl = req.body.pdfUrl;
        if (req.file) {
            pdfUrl = await uploadToStorageServer(req.file);
        }

        if (!pdfUrl) {
            return res.status(400).json({ message: 'Manuscript PDF file is required.' });
        }

        const manuscript = new Manuscript({
            title: title.trim(),
            description: description.trim(),
            pdfUrl,
            author: req.user._id,
            authorName: req.user.name || 'Author',
            authorEmail: req.user.email,
            status: 'Pending Editor Review',
            history: [{
                action: 'Manuscript Submitted',
                performedBy: req.user.name || req.user.email,
                performedById: req.user._id,
                role: req.user.role || 'author',
                comments: 'Initial submission uploaded.'
            }]
        });

        await manuscript.save();
        res.status(201).json({ message: 'Manuscript submitted successfully!', manuscript });
    } catch (err) {
        console.error('Manuscript submission error:', err);
        res.status(500).json({ message: err.message || 'Server error during manuscript submission.' });
    }
});

// 2. RESUBMIT MANUSCRIPT (Author)
router.put('/resubmit/:id', authenticateUser, upload.single('pdf'), async (req, res) => {
    try {
        const manuscript = await Manuscript.findById(req.params.id);
        if (!manuscript) {
            return res.status(404).json({ message: 'Manuscript not found.' });
        }

        if (manuscript.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized - You can only edit your own manuscripts.' });
        }

        const { title, description } = req.body;
        if (title) manuscript.title = title.trim();
        if (description) manuscript.description = description.trim();

        if (req.file) {
            manuscript.pdfUrl = await uploadToStorageServer(req.file);
        } else if (req.body.pdfUrl) {
            manuscript.pdfUrl = req.body.pdfUrl;
        }

        manuscript.status = 'Resubmitted';

        manuscript.history.push({
            action: 'Manuscript Revised & Resubmitted',
            performedBy: req.user.name || req.user.email,
            performedById: req.user._id,
            role: req.user.role || 'author',
            comments: req.body.resubmissionNotes || 'Author submitted revised manuscript.'
        });

        await manuscript.save();
        res.json({ message: 'Manuscript revised and resubmitted successfully!', manuscript });
    } catch (err) {
        console.error('Manuscript resubmission error:', err);
        res.status(500).json({ message: err.message || 'Server error during resubmission.' });
    }
});

// 3. GET AUTHOR'S MANUSCRIPTS
router.get('/my', authenticateUser, async (req, res) => {
    try {
        const manuscripts = await Manuscript.find({ author: req.user._id }).sort({ updatedAt: -1 });
        res.json(manuscripts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. GET SINGLE MANUSCRIPT DETAILS
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const manuscript = await Manuscript.findById(req.params.id);
        if (!manuscript) {
            return res.status(404).json({ message: 'Manuscript not found.' });
        }
        res.json(manuscript);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. EDITOR: GET ALL MANUSCRIPTS FOR EDITOR REVIEW
router.get('/editor/all', authenticateUser, async (req, res) => {
    try {
        // Allow editor or admin
        if (req.user.role !== 'editor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied - Editor role required.' });
        }

        const manuscripts = await Manuscript.find().sort({ updatedAt: -1 });
        res.json(manuscripts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. EDITOR: REVIEW MANUSCRIPT (Approve or Reject)
router.post('/editor/review/:id', authenticateUser, async (req, res) => {
    try {
        if (req.user.role !== 'editor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied - Editor role required.' });
        }

        const { decision, comments } = req.body; // decision: 'approve' or 'reject'
        if (!decision || !['approve', 'reject'].includes(decision)) {
            return res.status(400).json({ message: 'Invalid decision parameter. Must be "approve" or "reject".' });
        }

        if (decision === 'reject' && (!comments || !comments.trim())) {
            return res.status(400).json({ message: 'Rejection comments are required to give feedback to the author.' });
        }

        const manuscript = await Manuscript.findById(req.params.id);
        if (!manuscript) {
            return res.status(404).json({ message: 'Manuscript not found.' });
        }

        const isApprove = decision === 'approve';
        manuscript.status = isApprove ? 'Approved by Editor' : 'Rejected by Editor';

        manuscript.editorReview = {
            reviewedBy: req.user._id,
            reviewerName: req.user.name || req.user.email,
            comments: comments || (isApprove ? 'Approved by Editor for Peer Review.' : 'Rejected by Editor.'),
            status: isApprove ? 'Approved' : 'Rejected',
            reviewedAt: new Date()
        };

        manuscript.history.push({
            action: isApprove ? 'Approved by Editor' : 'Rejected by Editor',
            performedBy: req.user.name || req.user.email,
            performedById: req.user._id,
            role: 'editor',
            comments: comments || (isApprove ? 'Passed Editor screening. Sent for peer review.' : 'Editor rejected manuscript.')
        });

        await manuscript.save();
        res.json({ message: `Manuscript ${isApprove ? 'approved' : 'rejected'} by Editor!`, manuscript });
    } catch (err) {
        console.error('Editor review error:', err);
        res.status(500).json({ message: err.message });
    }
});

// 7. REVIEWER: GET ALL MANUSCRIPTS FOR PEER REVIEW
router.get('/reviewer/all', authenticateUser, async (req, res) => {
    try {
        if (req.user.role !== 'reviewer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied - Reviewer role required.' });
        }

        // Reviewers evaluate manuscripts that passed Editor approval or are assigned to them
        const manuscripts = await Manuscript.find({
            status: { $in: ['Approved by Editor', 'Approved by Reviewer', 'Rejected by Reviewer'] }
        }).sort({ updatedAt: -1 });

        res.json(manuscripts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 8. REVIEWER: REVIEW MANUSCRIPT (Approve or Reject)
router.post('/reviewer/review/:id', authenticateUser, async (req, res) => {
    try {
        if (req.user.role !== 'reviewer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied - Reviewer role required.' });
        }

        const { decision, comments } = req.body; // decision: 'approve' or 'reject'
        if (!decision || !['approve', 'reject'].includes(decision)) {
            return res.status(400).json({ message: 'Invalid decision parameter. Must be "approve" or "reject".' });
        }

        if (decision === 'reject' && (!comments || !comments.trim())) {
            return res.status(400).json({ message: 'Rejection comments are required to give peer review feedback.' });
        }

        const manuscript = await Manuscript.findById(req.params.id);
        if (!manuscript) {
            return res.status(404).json({ message: 'Manuscript not found.' });
        }

        const isApprove = decision === 'approve';
        manuscript.status = isApprove ? 'Approved by Reviewer' : 'Rejected by Reviewer';

        manuscript.reviewerReview = {
            reviewedBy: req.user._id,
            reviewerName: req.user.name || req.user.email,
            comments: comments || (isApprove ? 'Approved by Peer Reviewer for publication.' : 'Rejected by Peer Reviewer.'),
            status: isApprove ? 'Approved' : 'Rejected',
            reviewedAt: new Date()
        };

        manuscript.history.push({
            action: isApprove ? 'Approved by Peer Reviewer' : 'Rejected by Peer Reviewer',
            performedBy: req.user.name || req.user.email,
            performedById: req.user._id,
            role: 'reviewer',
            comments: comments || (isApprove ? 'Peer review passed successfully.' : 'Peer reviewer rejected manuscript.')
        });

        await manuscript.save();
        res.json({ message: `Manuscript ${isApprove ? 'accepted for publication' : 'rejected'} by Peer Reviewer!`, manuscript });
    } catch (err) {
        console.error('Reviewer review error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
