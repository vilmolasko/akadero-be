const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const EmailThread = require('../../models/EmailThread');
const { sendEmailViaResend } = require('../../utils/resend');

const generateThreadToken = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString('hex');
};

/*  Create Inquiry and Send Email to Organizer */
const contactUs = async (req, res) => {
  try {
    const { email, name, message, phone } = req.body;

    if (!email || !name || !message) {
      return res.status(400).json({
        success: false,
        message: 'email, name and message are required',
      });
    }

    const htmlFilePath = path.join(
      process.cwd(),
      'src/email-templates',
      'contact-us.html',
    );

    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    htmlContent = htmlContent
      .replace(/{{email}}/g, email)
      .replace(/{{name}}/g, name)
      .replace(/{{message}}/g, message)
      .replace(/{{phone}}/g, phone);

    const threadToken = generateThreadToken();
    const subject = `Contact Us: ${name}`;

    const thread = await EmailThread.create({
      threadToken,
      subject,
      from: {
        name,
        email,
      },
      status: 'open',
      lastMessageAt: new Date(),
      messages: [
        {
          direction: 'incoming',
          source: 'public',
          from: {
            name,
            email,
          },
          to: [
            process.env.CONTACT_US_RECEIVER || process.env.SENDING_EMAIL || '',
          ],
          subject,
          text: message,
          html: '',
          eventType: 'contact.form',
          createdAt: new Date(),
        },
      ],
    });

    const resendResponse = await sendEmailViaResend({
      to: [process.env.CONTACT_US_RECEIVER || process.env.SENDING_EMAIL],
      subject,
      html: htmlContent,
      text: `${name} (${email})\nPhone: ${phone || 'N/A'}\n\n${message}`,
      replyTo: email,
      headers: {
        'X-Akadero-Thread-Token': threadToken,
      },
    });

    thread.messages.push({
      direction: 'outgoing',
      source: 'system',
      from: {
        name: 'Akadero',
        email: process.env.RESEND_FROM_EMAIL || process.env.SENDING_EMAIL || '',
      },
      to: [process.env.CONTACT_US_RECEIVER || process.env.SENDING_EMAIL || ''],
      subject,
      text: `${name} (${email})\nPhone: ${phone || 'N/A'}\n\n${message}`,
      html: htmlContent,
      resendId: resendResponse.id || '',
      eventType: 'contact.forward',
      createdAt: new Date(),
    });

    await thread.save();

    return res.status(201).json({
      success: true,
      message: 'Contact us submitted',
      data: {
        threadId: thread._id,
      },
    });
  } catch (error) {
    console.error('Contact us Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { contactUs };
