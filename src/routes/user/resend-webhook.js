const express = require('express');
const router = express.Router();
const resendWebhook = require('../../controllers/webhooks/resend');

router.post('/webhooks/resend/email', resendWebhook.handleResendEmailWebhook);

module.exports = router;
