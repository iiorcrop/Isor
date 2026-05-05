const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const approveMember = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await Member.findOneAndUpdate(
            { membershipId: 'ISOR-TEST-001' },
            { approvalStatus: 'Approved', paymentStatus: 'Completed' },
            { new: true }
        );
        
        if (result) {
            console.log('Member ISOR-TEST-001 has been Approved.');
        } else {
            console.log('Member ISOR-TEST-001 not found.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

approveMember();
