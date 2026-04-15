const parseEmailAddress = (value = '') => {
  if (!value) {
    return { name: '', email: '' };
  }

  const input = String(value).trim();
  const angleBracketMatch = input.match(/^(.*)<([^>]+)>$/);
  if (angleBracketMatch) {
    return {
      name: angleBracketMatch[1].trim().replace(/^"|"$/g, ''),
      email: angleBracketMatch[2].trim().toLowerCase(),
    };
  }

  return {
    name: '',
    email: input.toLowerCase(),
  };
};

const toEmailArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(','))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const getHeaderValue = (headers, headerName) => {
  if (!headers) return '';

  if (Array.isArray(headers)) {
    const lowerName = headerName.toLowerCase();
    const found = headers.find((header) => {
      const key = header?.name || header?.key;
      return String(key || '').toLowerCase() === lowerName;
    });
    return found?.value || '';
  }

  const directValue =
    headers[headerName] ||
    headers[headerName.toLowerCase()] ||
    headers[headerName.toUpperCase()];

  if (Array.isArray(directValue)) {
    return directValue[0] || '';
  }

  return directValue || '';
};

const normalizeIncomingEmailPayload = (payload = {}) => {
  const data = payload.data || payload.email || payload;
  const headers = data.headers || payload.headers || {};

  const fromRaw =
    data.from || data.sender || data.from_email || payload.from || '';
  const from = parseEmailAddress(fromRaw);

  const to = toEmailArray(data.to || data.recipients || payload.to);
  const subject =
    data.subject || payload.subject || getHeaderValue(headers, 'subject') || '';

  const inReplyTo =
    data.in_reply_to ||
    payload.in_reply_to ||
    getHeaderValue(headers, 'In-Reply-To') ||
    '';

  const threadToken =
    getHeaderValue(headers, 'X-Akadero-Thread-Token') ||
    payload.threadToken ||
    '';

  return {
    eventType: payload.type || payload.event || 'email.received',
    from,
    to,
    subject,
    text: data.text || data.text_body || payload.text || '',
    html: data.html || data.html_body || payload.html || '',
    resendId: data.id || data.message_id || payload.id || '',
    inReplyTo,
    threadToken,
    receivedAt: data.created_at || payload.created_at || new Date(),
    rawPayload: payload,
  };
};

const sendEmailViaResend = async ({
  to,
  subject,
  html,
  text,
  replyTo,
  headers,
  from,
}) => {
  const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASSWORD;

  if (!apiKey) {
    throw new Error('Resend API key is missing in environment variables');
  }

  const sender =
    from || process.env.RESEND_FROM_EMAIL || process.env.SENDING_EMAIL;
  if (!sender) {
    throw new Error(
      'Sender email is missing. Set RESEND_FROM_EMAIL or SENDING_EMAIL',
    );
  }

  const recipients = toEmailArray(to);
  if (!recipients.length) {
    throw new Error('At least one recipient email is required');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender,
      to: recipients,
      subject,
      html,
      text,
      reply_to: replyTo,
      headers,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      data?.message || data?.error || 'Unable to send email using Resend';
    throw new Error(errorMessage);
  }

  return data;
};

module.exports = {
  normalizeIncomingEmailPayload,
  parseEmailAddress,
  sendEmailViaResend,
};
