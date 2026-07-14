// server.js - Main entry point for Render
const express = require('express');
const cors = require('cors');
const trackHandler = require('./api/track');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.post('/api/track', async (req, res) => {
    await trackHandler(req, res);
});

// Health check (for Render)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Home page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hysteria Tracker API</title>
            <style>
                body { background: #080b12; color: white; font-family: Arial; text-align: center; padding: 50px; }
                h1 { color: #00ffae; }
                .status { color: #00ffae; }
            </style>
        </head>
        <body>
            <h1>🚀 Hysteria Tracker</h1>
            <p class="status">✅ API is running!</p>
            <p>Endpoint: <code>/api/track</code> (POST only)</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
