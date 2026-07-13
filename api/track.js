// api/track.js
// Vercel Serverless Function

// ===== TELEGRAM CONFIGURATION =====
// Read from environment variables (set in Vercel dashboard)
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
// ===================================

// Check if credentials are configured
if (!BOT_TOKEN || !CHAT_ID) {
    console.error('⚠️ BOT_TOKEN or CHAT_ID not set in environment variables!');
    console.error('Please add them in Vercel dashboard.');
}

// Function to send message to Telegram
async function sendToTelegram(message) {
    if (!BOT_TOKEN || !CHAT_ID) {
        throw new Error('Telegram credentials not configured');
    }
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
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
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        throw error;
    }
}

// Main handler function
export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
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

        // Get user agent
        const userAgent = req.headers['user-agent'] || data.userAgent || 'unknown';

        // Prepare message for Telegram
        const now = new Date();
        const message = `
🆕 <b>New Visitor! (via Vercel)</b>

🌐 <b>IP:</b> <code>${ip}</code>
📍 <b>Country:</b> ${data.country || 'unknown'} ${data.country_code ? `(${data.country_code})` : ''}
🏙️ <b>City:</b> ${data.city || 'unknown'}
🗺️ <b>Region:</b> ${data.region || 'unknown'}
🌍 <b>Location:</b> ${data.latitude || '?'}, ${data.longitude || '?'}
🕐 <b>Timezone:</b> ${data.timezone || 'unknown'}
🏢 <b>ISP:</b> ${data.isp || 'unknown'}
📡 <b>AS:</b> ${data.asn || 'unknown'}

💻 <b>User Agent:</b> ${userAgent}
🌐 <b>Language:</b> ${data.language || 'unknown'}
📱 <b>Languages:</b> ${data.languages ? data.languages.join(', ') : 'unknown'}
🖥️ <b>Screen:</b> ${data.screenWidth || '?'}x${data.screenHeight || '?'}
🎨 <b>Color Depth:</b> ${data.colorDepth || 'unknown'} bit
🧵 <b>CPU Cores:</b> ${data.hardwareConcurrency || 'unknown'}
💾 <b>Device Memory:</b> ${data.deviceMemory || 'unknown'} GB
🕒 <b>Time:</b> ${data.time || now.toISOString()}
🔗 <b>Referrer:</b> ${data.referrer || 'direct'}
📄 <b>Page:</b> ${data.page || 'unknown'}
📝 <b>Title:</b> ${data.title || 'unknown'}

📊 <b>Data source:</b> Vercel Serverless Function
🌐 <b>Host:</b> Vercel
        `.trim();

        // Send to Telegram
        await sendToTelegram(message);

        // Return success response
        return res.status(200).json({ 
            success: true, 
            message: 'Visitor tracked successfully',
            ip: ip
        });

    } catch (error) {
        console.error('Error in handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
