const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// WhatsApp Client Setup
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // Set to false to debug
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// QR Code on first-time auth
client.on('qr', (qr) => {
  console.log('🔷 QR Code Received - Scan it using WhatsApp');
  qrcode.generate(qr, { small: true });
});

// When WhatsApp is ready
client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

// Initialize WhatsApp
client.initialize();

// Endpoint to send message
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Number and message are required' });
  }

  try {
    // Format: 91XXXXXXXXXX@c.us
    const formattedNumber = `91${number}@c.us`;

    // Check if number exists (optional)
    const isRegistered = await client.isRegisteredUser(formattedNumber);
    if (!isRegistered) {
      return res.status(400).json({ error: '❌ Number is not registered on WhatsApp' });
    }

    // Send message
    await client.sendMessage(formattedNumber, message);
    res.json({ success: true, message: '✅ Message sent!' });
  } catch (err) {
    console.error('❌ Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('🟢 WhatsApp server is running!');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
