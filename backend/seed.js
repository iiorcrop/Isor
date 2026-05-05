const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const Banner = require('./models/Banner');
const NewsTicker = require('./models/NewsTicker');
const QuickLink = require('./models/QuickLink');
const { About, Stat, Announcement } = require('./models/HomeContent');
const MenuSettings = require('./models/MenuSettings');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Seed Admin
        const adminExists = await User.findOne({ email: 'admin@isor.com' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                email: 'admin@isor.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin user created');
        }

        // 2. Seed News Ticker
        if (await NewsTicker.countDocuments() === 0) {
            await NewsTicker.create([
                { text: 'New Membership Registrations open for 2025-26 — Apply Online Now', isActive: true, isNewItem: true },
                { text: 'ISOR Annual General Meeting 2024 — Proceedings now available', isActive: true, isNewItem: false }
            ]);
            console.log('News ticker seeded');
        }

        // 3. Seed Banners
        if (await Banner.countDocuments() === 0) {
            await Banner.create([
                { 
                    title: 'Empowering Oilseeds Innovation', 
                    subtitle: 'Advancing sustainable agriculture through cutting-edge research and global collaboration.', 
                    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600',
                    isActive: true,
                    order: 0
                },
                { 
                    title: '40 Years of Research Excellence', 
                    subtitle: 'Promoting scientific education and development in oilseed crops since 1984.', 
                    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1600',
                    isActive: true,
                    order: 1
                },
                { 
                    title: 'Journal of Oilseeds Research', 
                    subtitle: 'Access the latest peer-reviewed studies and agricultural breakthroughs.', 
                    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1600',
                    isActive: true,
                    order: 2
                }
            ]);
            console.log('Banners seeded');
        }

        // 4. Seed Quick Links
        await QuickLink.deleteMany({});
        if (true) {
            await QuickLink.create([
                { title: 'Journal Info', icon: 'BookOpen', link: '/about-journal', order: 0 },
                { title: 'Membership', icon: 'Users', link: '/membership', order: 1 },
                { title: 'Events', icon: 'Calendar', link: '/events', order: 2 },
                { title: 'Committees', icon: 'Users', link: '/committee/Executive', order: 3 },
                { title: 'Submit MS', icon: 'PenTool', link: '/submit', order: 4 }
            ]);
            console.log('Quick links seeded');
        }

        // 5. Seed About
        if (await About.countDocuments() === 0) {
            await About.create({
                title: 'About ISOR',
                content: [
                    'The Indian Society of Oilseeds Research (ISOR) was established in 1984 and registered under the Societies Registration Act, headquartered at the ICAR-Directorate of Oilseeds Research (DOR), Rajendranagar, Hyderabad.',
                    'ISOR is a premier scientific society dedicated to promoting research, education, and development in oilseed crops including groundnut, sunflower, safflower, soybean, mustard/rapeseed, sesame, linseed, and castor.',
                    'The flagship publication — the Journal of Oilseeds Research (JOR) — is a peer-reviewed, UGC-CARE listed bi-annual journal indexed in NAAS, CAB Abstracts, and AGRIS.'
                ]
            });
            console.log('About content seeded');
        }

        // 6. Seed Stats
        if (await Stat.countDocuments() === 0) {
            await Stat.create([
                { label: 'Year Established', value: '1984', order: 0 },
                { label: 'Volumes Published', value: '42+', order: 1 },
                { label: 'Active Members', value: '3000+', order: 2 }
            ]);
            console.log('Stats seeded');
        }

        // 7. Seed Announcements
        if (await Announcement.countDocuments() === 0) {
            await Announcement.create([
                { title: 'JOR Vol. 42(1) 2025 published — Access Now', date: new Date('2025-04-10'), badge: 'New', badgeColor: 'success' },
                { title: 'Membership renewal 2025-26 open till May 31, 2025', date: new Date('2025-04-01'), badge: 'Important', badgeColor: 'urgent' },
                { title: 'ISOR Best Scientist Award 2024 nominations invited', date: new Date('2025-03-15'), badge: 'New', badgeColor: 'success' }
            ]);
            console.log('Announcements seeded');
        }

        // 8. Seed Menu
        await MenuSettings.deleteMany({});
        if (true) {
            await MenuSettings.create({
                items: [
                    { label: 'Home', link: '/', isDropdown: false },
                    { 
                        label: 'About ISOR', 
                        link: '#', 
                        isDropdown: true,
                        children: [
                            { label: 'History & Background', link: '/history' },
                            { label: 'Executive Committee', link: '/committee/Executive' },
                            { label: 'Editorial Board', link: '/committee/Editorial' },
                            { label: 'Constitution', link: '/constitution' },
                            { label: 'Memorandum', link: '/memorandum' }
                        ]
                    },
                    { 
                        label: 'Journal', 
                        link: '#', 
                        isDropdown: true,
                        children: [
                            { label: 'About JOR', link: '/about-journal' },
                            { label: 'Editorial Policy', link: '/editorial-policy' },
                            { label: 'Archives', link: '/archives' },
                            { label: 'Submit Manuscript', link: '/submit' }
                        ]
                    },
                    { 
                        label: 'Membership', 
                        link: '#', 
                        isDropdown: true,
                        children: [
                            { label: 'Overview', link: '/membership-info' },
                            { label: 'Apply Online', link: '/membership' },
                            { label: 'Member Benefits', link: '/benefits' },
                            { label: 'Member Search', link: '/member-search' }
                        ]
                    },
                    { 
                        label: 'Committees', 
                        link: '#', 
                        isDropdown: true,
                        children: [
                            { label: 'Executive Committee', link: '/committee/Executive' },
                            { label: 'Editorial Board', link: '/committee/Editorial' },
                            { label: 'Advisory Board', link: '/committee/Advisory' },
                            { label: 'Past Presidents', link: '/committee/PastPresidents' }
                        ]
                    },
                    { 
                        label: 'Events', 
                        link: '#', 
                        isDropdown: true,
                        children: [
                            { label: 'Conferences', link: '/events/conferences' },
                            { label: 'Workshops', link: '/events/workshops' },
                            { label: 'Upcoming Seminars', link: '/events/seminars' }
                        ]
                    },
                    { label: 'Downloads', link: '/downloads', isDropdown: false },
                    { label: 'Contact', link: '/contact', isDropdown: false }
                ]
            });
            console.log('Menu seeded');
        }

        console.log('Seeding completed successfully');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
