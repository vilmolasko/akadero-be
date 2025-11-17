const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema(
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
      maxlength: [60, "Name cannot exceed 100 characters."],
    },
    metaTitle: {
      type: String,
      required: [true, "Meta Title is required."],
      maxlength: [60, "Meta Title cannot exceed 60 characters."],
    },
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    metaDescription: {
      type: String,
      required: [true, "Meta Description is required."],
      maxlength: [160, "Meta Description cannot exceed 160 characters."],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
      required: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const SubCategory =
  mongoose.models.SubCategory ||
  mongoose.model("SubCategory", SubCategorySchema);
module.exports = SubCategory;
