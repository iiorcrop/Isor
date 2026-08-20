const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users (Admin Dashboard)
router.get('/', async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};

        if (role && role !== 'all') {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { organization: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE Editor or Reviewer User Account (Admin)
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role, mobileNumber, organization, designation, city } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, Email, Password, and Role are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const user = new User({
            name: name.trim(),
            username: normalizedEmail,
            email: normalizedEmail,
            password, // Auto-hashed in User pre-save hook
            role: role.toLowerCase(), // 'editor', 'reviewer', 'user'
            mobileNumber: mobileNumber || '',
            organization: organization || '',
            designation: designation || '',
            city: city || '',
            status: 'Active'
        });

        await user.save();

        res.status(201).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                designation: user.designation,
                status: user.status
            }
        });
    } catch (err) {
        console.error('Admin user creation error:', err);
        res.status(500).json({ message: err.message || 'Server error creating user.' });
    }
});

// UPDATE User Role or Status (Admin)
router.put('/:id/role', async (req, res) => {
    try {
        const { role, status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();
        res.json({ message: 'User updated successfully!', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE User (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User account removed.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
