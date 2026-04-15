const mongoose = require('mongoose');

const EmailParticipantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
  },
  { _id: false },
);

const EmailMessageSchema = new mongoose.Schema(
  {
    direction: {
      type: String,
      enum: ['incoming', 'outgoing'],
      required: true,
    },
    source: {
      type: String,
      enum: ['webhook', 'admin', 'public', 'system'],
      required: true,
    },
    from: {
      type: EmailParticipantSchema,
      required: true,
    },
    to: {
      type: [String],
      default: [],
    },
    subject: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    html: {
      type: String,
      default: '',
    },
    resendId: {
      type: String,
      default: '',
      index: true,
    },
    inReplyTo: {
      type: String,
      default: '',
    },
    eventType: {
      type: String,
      default: '',
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const EmailThreadSchema = new mongoose.Schema(
  {
    threadToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    from: {
      type: EmailParticipantSchema,
      required: true,
    },
    messages: {
      type: [EmailMessageSchema],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

EmailThreadSchema.index({ 'from.email': 1, createdAt: -1 });

const EmailThread =
  mongoose.models.EmailThread ||
  mongoose.model('EmailThread', EmailThreadSchema);

module.exports = EmailThread;
