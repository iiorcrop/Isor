const express = require('express');
const router = express.Router();
const MenuSettings = require('../models/MenuSettings');

// GET menu items
router.get('/', async (req, res) => {
    try {
        let menu = await MenuSettings.findOne();
        if (!menu) {
            // Seed default menu if none exists
            menu = await MenuSettings.create({
                items: [
                    { label: 'Home', link: '/', isDropdown: false },
                    { label: 'About ISOR', link: '#', isDropdown: true, children: [{ label: 'Overview', link: '/overview' }] },
                    { label: 'Journal', link: '#', isDropdown: true, children: [{ label: 'Current Issue', link: '/journal/current' }] },
                    { label: 'Membership', link: '#', isDropdown: true, children: [{ label: 'Online Enrollment', link: '/membership' }] },
                    { label: 'Committees', link: '#', isDropdown: true, children: [
                        { label: 'Executive Committee', link: '/committees/Executive' },
                        { label: 'Editorial Committee', link: '/committees/Editorial' },
                        { label: 'Advisory Board', link: '/committees/Advisory' },
                        { label: 'Past Presidents', link: '/committees/PastPresidents' }
                    ] },
                    { label: 'Events', link: '#', isDropdown: true, children: [{ label: 'Conferences', link: '/events/conferences' }] },
                    { label: 'Downloads', link: '/downloads', isDropdown: false },
                    { label: 'Contact', link: '/contact', isDropdown: false }
                ]
            });
        }
        res.json(menu);
    } catch (err) {
        console.error('DB unreachable, returning mock menu');
        res.json({
            items: [
                { label: 'Home', link: '/', isDropdown: false },
                { label: 'About ISOR', link: '#', isDropdown: true, children: [{ label: 'Overview', link: '/overview' }] },
                { label: 'Journal', link: '#', isDropdown: true, children: [{ label: 'Current Issue', link: '/journal/current' }] },
                { label: 'Membership', link: '#', isDropdown: true, children: [{ label: 'Online Enrollment', link: '/membership' }] },
                { label: 'Committees', link: '#', isDropdown: true, children: [
                    { label: 'Executive Committee', link: '/committees/Executive' },
                    { label: 'Editorial Committee', link: '/committees/Editorial' },
                    { label: 'Advisory Board', link: '/committees/Advisory' },
                    { label: 'Past Presidents', link: '/committees/PastPresidents' }
                ] },
                { label: 'Downloads', link: '/downloads', isDropdown: false },
                { label: 'Contact', link: '/contact', isDropdown: false }
            ]
        });
    }
});

// POST update menu
router.post('/', async (req, res) => {
    try {
        let menu = await MenuSettings.findOne();
        if (menu) {
            menu = await MenuSettings.findOneAndUpdate({}, { items: req.body.items }, { new: true });
        } else {
            menu = await MenuSettings.create({ items: req.body.items });
        }
        res.json(menu);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
