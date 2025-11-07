const mongoose = require("mongoose");

const featuredSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    expire: {
      type: Date,
      required: true,
    },

    // 🆕 Extra fields for better control

    // To toggle on/off without deleting
    isActive: {
      type: Boolean,
      default: true,
    },

    // Optional — if you want to control where it appears (homepage, banner, sidebar)

    // Optional — show priority/order on UI (higher = more priority)
    priority: {
      type: Number,
      default: 1,
    },

    // Optional — custom title/label shown in frontend (e.g. “Deal of the Day”)
    label: {
      type: String,
      trim: true,
    },

    // Optional — store admin who created or updated this
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Featured = mongoose.model("Featured", featuredSchema);
module.exports = Featured;
