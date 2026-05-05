const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Committee = require('./models/Committee');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const periods = await Committee.distinct('period');
    console.log('Periods in DB:', periods);
    process.exit();
}

check();
