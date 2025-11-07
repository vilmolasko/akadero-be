const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cover: {
      _id: {
        type: String,
        required: [true, "Image id is required."],
      },
      url: {
        type: String,
        required: [true, "Image url is required."],
      },
    },
    logo: {
      _id: {
        type: String,
        required: [true, "Image id is required."],
      },
      url: {
        type: String,
        required: [true, "Image url is required."],
      },
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      maxlength: [100, "Slug cannot exceed 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    address: {
      type: String,
      required: true,
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    phone: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Organizer =
  mongoose.models.Organizer || mongoose.model("Organizer", OrganizerSchema);
module.exports = Organizer;
