const crypto = require('crypto');
const EmailThread = require('../../models/EmailThread');
const { normalizeIncomingEmailPayload } = require('../../utils/resend');

const generateThreadToken = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString('hex');
};

const findExistingThread = async (emailPayload) => {
  if (emailPayload.inReplyTo) {
    const byReplyTo = await EmailThread.findOne({
      'messages.resendId': emailPayload.inReplyTo,
    });
    if (byReplyTo) return byReplyTo;
  }

  if (emailPayload.threadToken) {
    const byToken = await EmailThread.findOne({
      threadToken: emailPayload.threadToken,
    });
    if (byToken) return byToken;
  }

  return EmailThread.findOne({
    'from.email': emailPayload.from.email,
    subject: emailPayload.subject,
  }).sort({ updatedAt: -1 });
};

const handleResendEmailWebhook = async (req, res) => {
  try {
    const normalized = normalizeIncomingEmailPayload(req.body);
    if (!normalized.from.email) {
      return res.status(200).json({
        success: true,
        message: 'Ignored callback without sender email',
      });
    }

    const existingThread = await findExistingThread(normalized);
    const thread =
      existingThread ||
      new EmailThread({
        threadToken: normalized.threadToken || generateThreadToken(),
        subject: normalized.subject || 'No Subject',
        from: {
          name: normalized.from.name || '',
          email: normalized.from.email,
        },
        status: 'open',
        messages: [],
      });

    if (normalized.resendId) {
      const alreadyStored = thread.messages.some(
        (entry) => entry.resendId === normalized.resendId,
      );
      if (alreadyStored) {
        return res.status(200).json({
          success: true,
          message: 'Webhook already processed',
          data: {
            id: thread._id,
            threadToken: thread.threadToken,
          },
        });
      }
    }

    thread.subject = thread.subject || normalized.subject || 'No Subject';
    thread.lastMessageAt = new Date(normalized.receivedAt || Date.now());

    thread.messages.push({
      direction: 'incoming',
      source: 'webhook',
      from: {
        name: normalized.from.name || '',
        email: normalized.from.email,
      },
      to: normalized.to,
      subject: normalized.subject,
      text: normalized.text,
      html: normalized.html,
      resendId: normalized.resendId,
      inReplyTo: normalized.inReplyTo,
      eventType: normalized.eventType,
      payload: normalized.rawPayload,
      createdAt: new Date(normalized.receivedAt || Date.now()),
    });

    await thread.save();

    return res.status(200).json({
      success: true,
      message: 'Webhook processed',
      data: {
        id: thread._id,
        threadToken: thread.threadToken,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  handleResendEmailWebhook,
};
