const EmailThread = require('../../models/EmailThread');
const { sendEmailViaResend } = require('../../utils/resend');

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

/*  Get Email Threads by Admin */
const getEmailsByAdmin = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      search = '',
      status,
      fromEmail,
      subject,
      hasReply,
      startDate,
      endDate,
    } = req.query;

    const numericLimit = parseInt(limit) || 10;
    const numericPage = parseInt(page) || 1;

    const query = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { 'from.email': { $regex: search, $options: 'i' } },
        { 'from.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (fromEmail) {
      query['from.email'] = { $regex: fromEmail, $options: 'i' };
    }

    if (hasReply === 'true') {
      query.messages = { $elemMatch: { direction: 'outgoing' } };
    }

    if (hasReply === 'false') {
      query.messages = { $not: { $elemMatch: { direction: 'outgoing' } } };
    }

    if (startDate || endDate) {
      query.lastMessageAt = {};
      if (startDate) {
        query.lastMessageAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.lastMessageAt.$lte = new Date(endDate);
      }
    }

    const total = await EmailThread.countDocuments(query);

    const threads = await EmailThread.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(numericLimit * (numericPage - 1))
      .limit(numericLimit);

    const data = threads.map((thread) => {
      const lastMessage = thread.messages[thread.messages.length - 1] || null;
      const outgoingCount = thread.messages.filter(
        (message) => message.direction === 'outgoing',
      ).length;
      const incomingCount = thread.messages.filter(
        (message) => message.direction === 'incoming',
      ).length;

      return {
        _id: thread._id,
        threadToken: thread.threadToken,
        subject: thread.subject,
        status: thread.status,
        from: thread.from,
        incomingCount,
        outgoingCount,
        lastMessageAt: thread.lastMessageAt,
        lastMessage,
        createdAt: thread.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data,
      count: Math.ceil(total / numericLimit),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*  Get Single Email Thread by Admin */
const getEmailByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await EmailThread.findById(id);
    if (!thread) {
      return res
        .status(404)
        .json({ success: false, message: 'Email thread not found' });
    }

    return res.status(200).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*  Delete Email Thread by Admin */
const deleteEmailByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await EmailThread.findByIdAndDelete(id);
    if (!thread) {
      return res
        .status(404)
        .json({ success: false, message: 'Email thread not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email thread deleted',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*  Reply to Email Thread by Admin */
const replyToEmailByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, subject, status } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required',
      });
    }

    const thread = await EmailThread.findById(id);
    if (!thread) {
      return res
        .status(404)
        .json({ success: false, message: 'Email thread not found' });
    }

    if (!thread.from?.email) {
      return res.status(400).json({
        success: false,
        message: 'This thread has no valid recipient email',
      });
    }

    const lastIncoming = [...thread.messages]
      .reverse()
      .find((entry) => entry.direction === 'incoming' && entry.resendId);

    const resolvedSubject =
      subject ||
      (thread.subject.toLowerCase().startsWith('re:')
        ? thread.subject
        : `Re: ${thread.subject}`);

    const htmlMessage = `<p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>`;

    const resendResponse = await sendEmailViaResend({
      to: [thread.from.email],
      subject: resolvedSubject,
      text: message,
      html: htmlMessage,
      headers: {
        'X-Akadero-Thread-Token': thread.threadToken,
        ...(lastIncoming?.resendId
          ? { 'In-Reply-To': lastIncoming.resendId }
          : {}),
      },
    });

    thread.messages.push({
      direction: 'outgoing',
      source: 'admin',
      from: {
        name: req.admin?.firstName
          ? `${req.admin.firstName} ${req.admin.lastName || ''}`.trim()
          : 'Admin',
        email: process.env.RESEND_FROM_EMAIL || process.env.SENDING_EMAIL || '',
      },
      to: [thread.from.email],
      subject: resolvedSubject,
      text: message,
      html: htmlMessage,
      resendId: resendResponse.id || '',
      inReplyTo: lastIncoming?.resendId || '',
      eventType: 'admin.reply',
      createdAt: new Date(),
    });

    thread.lastMessageAt = new Date();
    if (status) {
      thread.status = status;
    }

    await thread.save();

    return res.status(200).json({
      success: true,
      message: 'Email reply sent',
      data: {
        threadId: thread._id,
        resendId: resendResponse.id || '',
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
  getEmailsByAdmin,
  getEmailByAdmin,
  deleteEmailByAdmin,
  replyToEmailByAdmin,
};
