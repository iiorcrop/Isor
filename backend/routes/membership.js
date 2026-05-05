const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Config for Payment Proofs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/payments';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `proof-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) cb(null, true);
        else cb(new Error('Only JPG, PNG and PDF files are allowed'));
    }
});

// Helper: Generate Unique Membership ID
const generateMembershipId = async (type) => {
    const year = new Date().getFullYear();
    const count = await Member.countDocuments();
    const sequence = (count + 1).toString().padStart(4, '0');
    const prefix = type === 'Life' ? 'L' : type === 'Student' ? 'S' : 'A';
    return `ISOR-${year}-${prefix}${sequence}`;
};

// 1. ENROLLMENT (Registration)
router.post('/enroll', upload.single('paymentProof'), async (req, res) => {
    try {
        const { email, password, membershipType } = req.body;

        // Check if exists
        const existingMember = await Member.findOne({ email });
        if (existingMember) return res.status(400).json({ message: 'Email already registered' });

        // Generate ID and Hash Password
        const membershipId = await generateMembershipId(membershipType);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newMember = new Member({
            ...req.body,
            membershipId,
            password: hashedPassword,
            paymentProofUrl: req.file ? req.file.path.replace(/\\/g, '/') : null
        });

        await newMember.save();

        // Send Enrollment Email (non-blocking, won't fail registration)
        try {
            const { sendEmail, templates } = require('../utils/emailService');
            const emailTemplate = templates.enrollment(`${newMember.title} ${newMember.firstName}`, membershipId);
            sendEmail(newMember.email, emailTemplate.subject, emailTemplate.html);
        } catch (emailErr) {
            console.error('Enrollment email failed:', emailErr.message);
        }

        res.status(201).json({ 
            message: 'Enrollment successful!', 
            membershipId,
            member: { name: newMember.name, email: newMember.email }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. MEMBER LOGIN
router.post('/login', async (req, res) => {
    try {
        const { membershipId, password } = req.body;
        const member = await Member.findOne({ membershipId });
        
        if (!member) return res.status(404).json({ message: 'Membership ID not found' });

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate Token
        const token = jwt.sign({ id: member._id, role: 'member' }, 'isor_secret_key_2026', { expiresIn: '1d' });

        res.json({
            token,
            member: {
                _id: member._id,
                membershipId: member.membershipId,
                title: member.title,
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                mobileNumber: member.mobileNumber,
                designation: member.designation,
                organization: member.organization,
                qualification: member.qualification,
                specialization: member.specialization,
                address: member.address,
                membershipType: member.membershipType,
                approvalStatus: member.approvalStatus,
                paymentStatus: member.paymentStatus,
                createdAt: member.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. RESUBMIT PAYMENT PROOF
router.post('/resubmit-proof', upload.single('paymentProof'), async (req, res) => {
    try {
        const { memberId } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Please upload payment proof' });

        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        member.paymentProofUrl = req.file.path.replace(/\\/g, '/');
        member.paymentStatus = 'Pending';
        member.approvalStatus = 'Pending'; // Reset to pending for re-review
        await member.save();

        res.json({ message: 'Proof resubmitted successfully! Awaiting review.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. FORGOT PASSWORD (Simple Version)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const member = await Member.findOne({ email });
        if (!member) return res.status(404).json({ message: 'Member not found' });

        // Generate a temporary reset token or a new random password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        member.password = hashedPassword;
        await member.save();

        // In a real app, send this password via email
        console.log(`Reset password for ${email}: ${tempPassword}`);

        res.json({ message: 'A temporary password has been sent to your email.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
