const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, "Name is required."],
      index: true,
    },
    metaTitle: {
      type: String,
      required: [true, "Meta title is required."],
      maxlength: [60, "Meta title cannot exceed 60 characters."],
    },
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    metaDescription: {
      type: String,
      required: [true, "Meta description is required."],
      maxlength: [160, "Meta description cannot exceed 160 characters."],
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
      required: true,
    },

    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
module.exports = Category;
