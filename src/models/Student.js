const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);
module.exports = Student;
