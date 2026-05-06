const express = require('express');
const app = express();

app.get('/api/ping', (req, res) => {
    console.log('Ping hit');
    res.json({ status: 'ok' });
});

app.listen(5000, () => {
    console.log('Barebones server on 5000');
});
