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

const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const jwt = require('jsonwebtoken');
const Member = require('./models/Member');

// PDF protection middleware for static uploads
app.get('/uploads/*path', async (req, res, next) => {
    try {
        if (!req.path.toLowerCase().endsWith('.pdf')) return next();
        const reqPath = req.path.replace(/^\/uploads[/\\]+/, '');
        const fullFilePath = path.join(__dirname, 'uploads', reqPath);

        if (!fs.existsSync(fullFilePath)) {
            return next();
        }

        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        let isActiveMember = false;
        if (token) {
            try {
                const decoded = jwt.verify(token, 'isor_secret_key_2026');
                const member = await Member.findById(decoded.id);
                if (member && member.approvalStatus === 'Approved') {
                    if (member.membershipType === 'Annual' || member.membershipType === 'Yearly') {
                        if (member.subscriptionEndDate && new Date() <= new Date(member.subscriptionEndDate)) {
                            isActiveMember = true;
                        }
                    } else {
                        isActiveMember = true;
                    }
                }
            } catch (e) {
                isActiveMember = false;
            }
        }

        res.setHeader('Content-Type', 'application/pdf');

        if (isActiveMember) {
            return res.sendFile(fullFilePath);
        } else {
            // Sliced 2 pages for public & inactive users
            const fileBytes = fs.readFileSync(fullFilePath);
            const pdfDoc = await PDFDocument.load(fileBytes);
            if (pdfDoc.getPageCount() <= 2) {
                return res.sendFile(fullFilePath);
            }
            const previewDoc = await PDFDocument.create();
            const copiedPages = await previewDoc.copyPages(pdfDoc, [0, 1]);
            copiedPages.forEach((page) => previewDoc.addPage(page));
            const previewBytes = await previewDoc.save();
            return res.send(Buffer.from(previewBytes));
        }
    } catch (err) {
        next();
    }
});

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
