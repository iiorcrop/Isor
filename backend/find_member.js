const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const findMember = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const members = await Member.find();
        if (members.length > 0) {
            console.log('Members Found:');
            members.forEach(m => {
                console.log(`- ID: ${m.membershipId}, Email: ${m.email}, Name: ${m.firstName} ${m.lastName}`);
            });
        } else {
            console.log('No members found in database.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findMember();
