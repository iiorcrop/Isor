const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const bcrypt = require('bcryptjs');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await Member.findOneAndUpdate(
            { membershipId: 'ISOR-TEST-001' },
            { password: hashedPassword },
            { new: true }
        );
        
        if (result) {
            console.log('Password reset for ISOR-TEST-001 to: password123');
        } else {
            console.log('Member ISOR-TEST-001 not found.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
