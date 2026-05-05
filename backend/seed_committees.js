const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Committee = require('./models/Committee');

const seedCommittees = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing committees to avoid confusion
        await Committee.deleteMany({ committeeType: 'Executive' });

        const members = [
            // Latest Committee (2024-2026)
            {
                name: 'Dr. D.K. Yadava',
                designation: 'PRESIDENT',
                organization: 'ADG (Seeds), ICAR, New Delhi',
                period: '2024-2026',
                committeeType: 'Executive',
                order: 1
            },
            {
                name: 'Dr. R.K. Mathur',
                designation: 'VICE-PRESIDENT',
                organization: 'Director, ICAR-IIOR, Hyderabad',
                period: '2024-2026',
                committeeType: 'Executive',
                order: 2
            },
            {
                name: 'Dr. G.D. Satish Kumar',
                designation: 'GENERAL SECRETARY',
                organization: 'Principal Scientist, ICAR-IIOR, Hyderabad',
                period: '2024-2026',
                committeeType: 'Executive',
                order: 3
            },
            {
                name: 'Dr. Ramesh Naik',
                designation: 'JOINT SECRETARY',
                organization: 'Scientist, ICAR-IIOR, Hyderabad',
                period: '2024-2026',
                committeeType: 'Executive',
                order: 4
            },

            // Past Committee (2022-2024)
            {
                name: 'Dr. A. Vishnuvardhan Reddy',
                designation: 'PRESIDENT',
                organization: 'Former Director, ICAR-IIOR, Hyderabad',
                period: '2022-2024',
                committeeType: 'Executive',
                order: 1
            },
            {
                name: 'Dr. Sujatha M.',
                designation: 'VICE-PRESIDENT',
                organization: 'Principal Scientist, ICAR-IIOR, Hyderabad',
                period: '2022-2024',
                committeeType: 'Executive',
                order: 2
            },
            {
                name: 'Dr. C. Sarada',
                designation: 'GENERAL SECRETARY',
                organization: 'Principal Scientist, ICAR-IIOR, Hyderabad',
                period: '2022-2024',
                committeeType: 'Executive',
                order: 3
            }
        ];

        await Committee.create(members);
        console.log('Executive Committees seeded successfully with 2 periods!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedCommittees();
