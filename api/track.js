// api/track.js
// Vercel Serverless Function

// ===== TELEGRAM CONFIGURATION =====
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
// ===================================

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed. Use POST.',
            message: 'This endpoint accepts POST requests only'
        });
    }

    try {
        // Check if credentials are configured
        if (!BOT_TOKEN || !CHAT_ID) {
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'Telegram credentials not configured'
            });
        }

        const data = req.body;
        
        // Get real IP from Vercel headers
        const ip = req.headers['x-forwarded-for'] || 
                   req.headers['client-ip'] || 
                   data.ip || 'unknown';

        const userAgent = req.headers['user-agent'] || data.userAgent || 'unknown';
        const now = new Date();

        // Prepare message for Telegram
        const message = `
🆕 <b>New Visitor! (via Vercel)</b>

🌐 <b>IP:</b> <code>${ip}</code>
📍 <b>Country:</b> ${data.country || 'unknown'}
🏙️ <b>City:</b> ${data.city || 'unknown'}
🗺️ <b>Region:</b> ${data.region || 'unknown'}
🏢 <b>ISP:</b> ${data.isp || 'unknown'}

💻 <b>User Agent:</b> ${userAgent}
🌐 <b>Language:</b> ${data.language || 'unknown'}
🖥️ <b>Screen:</b> ${data.screenWidth || '?'}x${data.screenHeight || '?'}
🕒 <b>Time:</b> ${now.toISOString()}
🔗 <b>Referrer:</b> ${data.referrer || 'direct'}
📄 <b>Page:</b> ${data.page || 'unknown'}

📊 <b>Data source:</b> Vercel Serverless Function
        `.trim();

        // Send to Telegram
        await sendToTelegram(message);

        return res.status(200).json({ 
            success: true, 
            message: 'Visitor tracked successfully',
            ip: ip
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
}
