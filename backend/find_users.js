const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const findUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find();
        console.log('Users Found:');
        users.forEach(u => {
            console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findUsers();
