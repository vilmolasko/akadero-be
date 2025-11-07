const mongoose = require("mongoose");

const lecturerSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cover: {
      _id: { type: String },
      url: { type: String },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
    },
  },
  { timestamps: true }
);

const Lecturer =
  mongoose.models.Lecturer || mongoose.model("Lecturer", lecturerSchema);
module.exports = Lecturer;
