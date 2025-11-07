const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const { singleFileDelete } = require("../../utils/uploader");

/*  Create Category by Admin */
const createCategoryByAdmin = async (req, res) => {
  try {
    const { cover, ...others } = req.body;

    await Category.create({
      ...others,
      cover: {
        ...cover,
      },
    });

    res.status(201).json({ success: true, message: "Category Created" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get All Categories by Admin */
const getCategoriesByAdmin = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", status } = req.query;

    const skip = parseInt(limit) || 10;
    const query = { name: { $regex: search, $options: "i" } };

    if (status) query.status = status;

    const totalCategories = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip * (parseInt(page) - 1 || 0))
      .limit(skip);

    res.status(200).json({
      success: true,
      data: categories,
      count: Math.ceil(totalCategories / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get Category by Slug (Admin) */
const getCategoryBySlugByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category Not Found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*  Update Category by Slug (Admin) */
const updateCategoryBySlugByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    const { cover, ...others } = req.body;

    await Category.findOneAndUpdate(
      { slug },
      {
        ...others,
        cover: {
          ...cover,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Category Updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Delete Category by Slug (Admin) */
const deleteCategoryBySlugByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOneAndDelete({ slug });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category Not Found" });
    }

    // Delete related SubCategories
    await SubCategory.deleteMany({ _id: { $in: category.subCategories } });

    // Delete cover file (if exists)
    if (category.cover) {
      await singleFileDelete(req, category.cover._id);
    }

    res
      .status(200)
      .json({ success: true, message: "Category Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCategoriesByAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCategoryByAdmin,
  getCategoriesByAdmin,
  getCategoryBySlugByAdmin,
  updateCategoryBySlugByAdmin,
  deleteCategoryBySlugByAdmin,
  getAllCategoriesByAdmin,
};
