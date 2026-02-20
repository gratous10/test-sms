const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

let pendingRequests = {};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Welcome! Please enter your 2FA code.');
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (pendingRequests[chatId]) {
        if (msg.text === 'Accept') {
            bot.sendMessage(chatId, '2FA code accepted. Redirecting...');
            // Logic to redirect to the next page
            delete pendingRequests[chatId]; // Clear the request after acceptance
        } else if (msg.text === 'Reject') {
            bot.sendMessage(chatId, '2FA code rejected. Please try again.');
            delete pendingRequests[chatId];
        }
    }
});

function send2FACode(code, chatId) {
    pendingRequests[chatId] = true;
    bot.sendMessage(chatId, `Your 2FA code is: ${code}`, {
        reply_markup: {
            keyboard: [['Accept', 'Reject']],
            one_time_keyboard: true,
        },
    });
}

module.exports = { send2FACode };