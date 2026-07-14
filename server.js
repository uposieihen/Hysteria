// server.js - Main entry point for Render
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main tracking endpoint
app.post('/api/track', async (req, res) => {
    try {
        const data = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        
        // Your tracking logic here
        console.log('Visitor tracked:', { ip, data });
        
        res.status(200).json({ 
            success: true, 
            message: 'Visitor tracked',
            ip: ip
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Home page
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 Hysteria Tracker</h1>
        <p>API is running!</p>
        <p>Endpoint: <code>/api/track</code> (POST)</p>
    `);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
