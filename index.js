const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Client is ready!');
});

client.initialize();

app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Number and message required' });
  }

  try {
    const formattedNumber = `91${number}@c.us`; // Replace 91 with country code if needed
    await client.sendMessage(formattedNumber, message);
    res.json({ success: true, message: '✅ Message sent!' });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});


app.get('/', (req, res) => {
  res.send('🟢 WhatsApp Server is running!');
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
