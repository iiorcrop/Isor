const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'isor_secret_key_2026';

// Helper to format user response data
const formatUserData = (user) => ({
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber || '',
    organization: user.organization || '',
    designation: user.designation || '',
    city: user.city || '',
    role: user.role || 'user',
    status: user.status || 'Active',
    createdAt: user.createdAt
});

// 1. REGISTER GENERAL USER (No payment/pricing step)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, mobileNumber, organization, designation, city } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, Email, and Password are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const newUser = new User({
            name: name.trim(),
            username: normalizedEmail,
            email: normalizedEmail,
            password, // Hashed automatically in User schema pre-save
            mobileNumber: mobileNumber || '',
            organization: organization || '',
            designation: designation || '',
            city: city || '',
            role: 'user',
            status: 'Active'
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: formatUserData(newUser)
        });
    } catch (err) {
        console.error('User registration error:', err);
        res.status(500).json({ message: err.message || 'Server error during registration.' });
    }
});

// 2. LOGIN GENERAL USER
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide Email and Password.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password. Please try again.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful!',
            token,
            user: formatUserData(user)
        });
    } catch (err) {
        console.error('User login error:', err);
        res.status(500).json({ message: err.message || 'Server error during login.' });
    }
});

// 3. GET CURRENT USER PROFILE
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized - No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(formatUserData(user));
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
});

// 4. UPDATE USER PROFILE
router.put('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized - No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const { name, mobileNumber, organization, designation, city } = req.body;

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (name !== undefined) user.name = name;
        if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
        if (organization !== undefined) user.organization = organization;
        if (designation !== undefined) user.designation = designation;
        if (city !== undefined) user.city = city;

        await user.save();

        res.json({
            message: 'Profile updated successfully!',
            user: formatUserData(user)
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error updating profile.' });
    }
});

module.exports = router;
