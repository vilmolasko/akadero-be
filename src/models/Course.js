const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide a category id"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Please provide a sub-category id"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    metaTitle: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    type: {
      type: [String], // e.g. ["Seminars", "Conferences"]
      default: [],
    },
    isFeatured: {
      type: Boolean,
    },
    level: {
      type: String,
      default: "Not specified",
    },

    compensated: {
      type: String,
      default: "Not refundable",
    },

    graduationDocument: {
      type: Boolean,
      default: false,
    },

    language: {
      type: [String],
      default: [],
    },

    duration: {
      type: String,
      default: "",
    },

    schedules: [
      {
        date: Date,
        location: String,
        seats: Number,
        comment: String,
        students: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
          },
        ],
      },
    ],

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      // required: true,
    },

    lecturers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecturer",
      },
    ],

    status: {
      type: String,
      enum: ["published", "pending", "completed", "canceled"],
      default: "published",
    },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
module.exports = Course;
