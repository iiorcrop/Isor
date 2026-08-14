const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { uploadToStorageServer } = require('../utils/fileUploader');
const { generateMembershipId, generateEnrollmentId } = require('../utils/idGenerator');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) cb(null, true);
        else cb(new Error('Only JPG, PNG and PDF files are allowed'));
    }
});

// Helper: Check and auto-expire subscription if past end date
const checkSubscriptionExpiry = async (member) => {
    if (member && (member.membershipType === 'Annual' || member.membershipType === 'Yearly') && member.subscriptionEndDate) {
        if (new Date() > new Date(member.subscriptionEndDate) && member.subscriptionStatus === 'Active') {
            member.subscriptionStatus = 'Expired';
            await member.save();
        }
    }
    return member;
};

// Helper: Format member response
const formatMemberData = (member) => ({
    _id: member._id,
    membershipId: member.membershipId,
    enrollmentId: member.enrollmentId || member.membershipId,
    title: member.title || 'Dr.',
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
    membershipYear: member.membershipYear,
    profileCompleted: member.profileCompleted || (Boolean(member.firstName && member.lastName && member.email && member.mobileNumber && member.address)),
    subscriptionStatus: member.subscriptionStatus || (member.approvalStatus === 'Approved' ? 'Active' : 'Pending'),
    subscriptionStartDate: member.subscriptionStartDate,
    subscriptionEndDate: member.subscriptionEndDate,
    amountPaid: member.amountPaid,
    approvalStatus: member.approvalStatus,
    paymentStatus: member.paymentStatus,
    paymentProofUrl: member.paymentProofUrl,
    createdAt: member.createdAt
});

// PUBLIC CERTIFICATE VERIFICATION BY ENROLLMENT ID OR MEMBERSHIP ID
router.get('/verify/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier.trim();
        let member = await Member.findOne({
            $or: [
                { enrollmentId: { $regex: new RegExp(`^${identifier}$`, 'i') } },
                { membershipId: { $regex: new RegExp(`^${identifier}$`, 'i') } }
            ]
        });

        if (!member) {
            return res.status(404).json({ 
                isValid: false, 
                message: 'No active membership record found matching this Enrollment ID or Membership ID.' 
            });
        }

        member = await checkSubscriptionExpiry(member);

        res.json({
            isValid: member.approvalStatus === 'Approved',
            isExpired: member.subscriptionStatus === 'Expired',
            enrollmentId: member.enrollmentId || member.membershipId,
            membershipId: member.membershipId,
            title: member.title || 'Dr.',
            firstName: member.firstName,
            lastName: member.lastName,
            fullName: `${member.title || 'Dr.'} ${member.firstName} ${member.lastName}`,
            membershipType: member.membershipType,
            subscriptionStatus: member.subscriptionStatus || (member.approvalStatus === 'Approved' ? 'Active' : 'Pending'),
            approvalStatus: member.approvalStatus,
            subscriptionStartDate: member.subscriptionStartDate,
            subscriptionEndDate: member.subscriptionEndDate,
            organization: member.organization,
            designation: member.designation,
            qualification: member.qualification,
            specialization: member.specialization,
            createdAt: member.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET PUBLIC PAYMENT & SUBSCRIPTION INFO FOR CLIENT RENDER
router.get('/payment-info', async (req, res) => {
    try {
        const PaymentSettings = require('../models/PaymentSettings');
        let settings = await PaymentSettings.findOne();
        if (!settings) {
            settings = await PaymentSettings.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 1. ENROLLMENT / SIGNUP (Mandatory fields: FNAME, LNAME, EMAIL, MOBILENUMBER, ADDRESS)
router.post('/enroll', upload.single('paymentProof'), async (req, res) => {
    try {
        const { title, firstName, lastName, email, mobileNumber, address, password, membershipType, designation, organization, qualification, specialization, membershipYear } = req.body;

        if (!firstName || !lastName || !email || !mobileNumber || !address) {
            return res.status(400).json({ message: 'First Name, Last Name, Email, Mobile Number, and Communication Address are mandatory.' });
        }

        const existingMember = await Member.findOne({ email: email.toLowerCase() });
        if (existingMember) return res.status(400).json({ message: 'Email already registered' });

        const typeToUse = membershipType || 'Annual';
        const membershipId = await generateMembershipId(typeToUse);
        const enrollmentId = await generateEnrollmentId();
        const hashedPassword = await bcrypt.hash(password || 'Isor@2026', 10);

        const newMember = new Member({
            title: title || 'Dr.',
            firstName,
            lastName,
            email: email.toLowerCase(),
            mobileNumber,
            address,
            password: hashedPassword,
            membershipType: typeToUse,
            membershipYear: membershipYear || new Date().getFullYear().toString(),
            designation,
            organization,
            qualification,
            specialization,
            membershipId,
            enrollmentId,
            profileCompleted: true,
            subscriptionStatus: 'Pending',
            paymentStatus: req.file ? 'Pending' : 'Pending',
            approvalStatus: 'Pending',
            paymentProofUrl: req.file ? await uploadToStorageServer(req.file) : null
        });

        await newMember.save();

        const token = jwt.sign({ id: newMember._id, role: 'member' }, 'isor_secret_key_2026', { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'Enrollment submitted successfully!', 
            token,
            membershipId,
            member: formatMemberData(newMember)
        });
    } catch (err) {
        console.error('Enrollment error:', err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'record';
            return res.status(400).json({ message: `A member with this ${field} already exists.` });
        }
        res.status(500).json({ message: err.message });
    }
});

// 2. MEMBER LOGIN (By Email or Membership ID)
router.post('/login', async (req, res) => {
    try {
        const { membershipId, email, password } = req.body;
        const identifier = membershipId || email;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide Email/Membership ID and Password' });
        }

        let member = await Member.findOne({
            $or: [
                { membershipId: identifier.trim() },
                { email: identifier.trim().toLowerCase() }
            ]
        });
        
        if (!member) return res.status(404).json({ message: 'Member account not found' });

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Check & update yearly expiry if needed
        member = await checkSubscriptionExpiry(member);

        const token = jwt.sign({ id: member._id, role: 'member' }, 'isor_secret_key_2026', { expiresIn: '7d' });

        res.json({
            token,
            member: formatMemberData(member)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. GET CURRENT MEMBER STATUS
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'isor_secret_key_2026');
        
        let member = await Member.findById(decoded.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        member = await checkSubscriptionExpiry(member);
        res.json(formatMemberData(member));
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

// 4. SUBMIT SUBSCRIPTION & PAYMENT PROOF SCREENSHOT
router.post('/submit-subscription', upload.single('paymentProof'), async (req, res) => {
    try {
        const { memberId, membershipType, transactionId } = req.body;
        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        if (membershipType) {
            member.membershipType = membershipType;
        }
        if (transactionId) {
            member.transactionId = transactionId;
        }
        if (req.file) {
            member.paymentProofUrl = await uploadToStorageServer(req.file);
        }

        member.paymentStatus = 'Pending';
        member.approvalStatus = 'Pending';
        member.subscriptionStatus = 'Pending';
        await member.save();

        res.json({
            message: 'Subscription payment proof submitted successfully! Awaiting admin verification.',
            member: formatMemberData(member)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. RESUBMIT PAYMENT PROOF
router.post('/resubmit-proof', upload.single('paymentProof'), async (req, res) => {
    try {
        const { memberId } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Please upload payment proof' });

        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        member.paymentProofUrl = await uploadToStorageServer(req.file);
        member.paymentStatus = 'Pending';
        member.approvalStatus = 'Pending';
        member.subscriptionStatus = 'Pending';
        await member.save();

        res.json({ message: 'Proof resubmitted successfully! Awaiting review.', member: formatMemberData(member) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const member = await Member.findOne({ email: email ? email.toLowerCase() : '' });
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        member.password = hashedPassword;
        await member.save();

        console.log(`Reset password for ${email}: ${tempPassword}`);
        res.json({ message: `A temporary password (${tempPassword}) has been issued.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 7. UPDATE / SETUP MEMBER PROFILE
router.put('/profile', async (req, res) => {
    try {
        const { memberId, title, firstName, lastName, email, mobileNumber, designation, organization, address, qualification, specialization, membershipYear } = req.body;
        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        if (title !== undefined) member.title = title;
        if (firstName !== undefined) member.firstName = firstName;
        if (lastName !== undefined) member.lastName = lastName;
        if (email !== undefined) member.email = email.toLowerCase();
        if (mobileNumber !== undefined) member.mobileNumber = mobileNumber;
        if (address !== undefined) member.address = address;
        if (designation !== undefined) member.designation = designation;
        if (organization !== undefined) member.organization = organization;
        if (qualification !== undefined) member.qualification = qualification;
        if (specialization !== undefined) member.specialization = specialization;
        if (membershipYear !== undefined) member.membershipYear = membershipYear;

        // Verify mandatory fields
        const isMandatoryComplete = Boolean(
            member.firstName && member.lastName && member.email && member.mobileNumber && member.address
        );

        member.profileCompleted = isMandatoryComplete;
        await member.save();

        res.json({ 
            message: isMandatoryComplete ? 'Profile set up successfully!' : 'Profile updated.', 
            member: formatMemberData(member) 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
