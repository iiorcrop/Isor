const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Global Request Logger for Debugging (Moved to top)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // 5 second timeout
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/topbar', require('./routes/topbar'));
app.use('/api/header', require('./routes/header'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/news', require('./routes/news'));
app.use('/api/banner', require('./routes/banner'));
app.use('/api/quicklinks', require('./routes/quickLinks'));
app.use('/api/home-content', require('./routes/homeContent'));
app.use('/api/membership', require('./routes/membership'));
app.use('/api/admin/members', require('./routes/adminMember'));
app.use('/api/admin/payment-settings', require('./routes/paymentSettings'));
app.use('/api/committees', require('./routes/committee'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/events', require('./routes/event'));
app.use('/api/footer', require('./routes/footer'));
app.use('/api/pages', require('./routes/page'));

app.get('/api/ping', (req, res) => res.json({ status: 'ok', message: 'Backend is reachable' }));

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Maximum limit is 1GB.' });
    }
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
