const Course = require("../../models/Course");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const Featured = require("../../models/Featured");

/*  Get All Courses by Organizer */
const getCourses = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      search = "",
      status,
      place,
      compensated,
      typeOfTraining,
      date_from,
      date_to,
      category,
      subcategory,
    } = req.query;

    const skip = parseInt(limit) || 10;

    const query = {
      title: { $regex: search, $options: "i" },
    };

    if (status) query.status = status;
    if (compensated) query.compensated = compensated;

    if (typeOfTraining) {
      query.type = {
        $in: Array.isArray(typeOfTraining) ? typeOfTraining : [typeOfTraining],
      };
    }

    if (place) {
      query["schedules.location"] = {
        $in: Array.isArray(place) ? place : [place],
      };
    }

    if (date_from || date_to) {
      query["schedules.date"] = {};
      if (date_from) query["schedules.date"].$gte = new Date(date_from);
      if (date_to) query["schedules.date"].$lte = new Date(date_to);
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category }).select(
        "_id"
      );
      query.category = categoryDoc ? categoryDoc._id : null;
    }

    if (subcategory) {
      const subCatDoc = await SubCategory.findOne({ slug: subcategory }).select(
        "_id"
      );
      query.subcategory = subCatDoc ? subCatDoc._id : null;
    }

    // ✅ 1. Get all active + not expired featured courses
    const activeFeatured = await Featured.find({
      isActive: true,
      expire: { $gt: new Date() },
    }).select(["course", "label"]);

    // ✅ 2. Create lookup map: courseId → { label }
    const featuredMap = {};
    activeFeatured.forEach((f) => {
      featuredMap[f.course.toString()] = {
        label: f.label || null,
      };
    });

    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .select([
        "title",
        "slug",
        "organizer",
        "cover",
        "price",
        "description",
        "duration",
        "category",
        "subcategory",
        "lecturers",
      ])
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip * (parseInt(page) - 1 || 0))
      .limit(skip);

    // ✅ 3. Attach featured fields to every course
    const formattedCourses = courses.map((course) => {
      const id = course._id.toString();

      const isFeatured = featuredMap[id] ? true : false;
      const featuredLabel = featuredMap[id]?.label || null;

      return {
        ...course.toObject(),
        lecturersCount: course.lecturers?.length || 0,
        categoryName: course.category?.name || "",
        subCategoryName: course.subCategory?.name || "",
        categorySlug: course.category?.slug || "",
        subCategorySlug: course.subCategory?.slug || "",
        featured: isFeatured,
        featuredLabel: featuredLabel,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedCourses,
      total,
      totalPages: Math.ceil(total / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({
        createdAt: -1,
      })
      .select(["title", "slug", "cover"]);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/*  Get Single Course by Slug */
const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug }).populate([
      { path: "category" },
      { path: "organizer" },
      { path: "lecturers" },
    ]);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course Not Found" });

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get All Course Filters */
const getFilters = async (req, res) => {
  try {
    const places = await Course.distinct("schedules.location");
    const compensated = await Course.distinct("compensated");
    const types = await Course.distinct("type");

    const clean = (arr) => arr.filter((v) => v && v.trim() !== "");

    res.status(200).json({
      success: true,
      filters: {
        place: clean(places),
        compensated: clean(compensated),
        typeOfTraining: clean(types),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch filters",
      error: error.message,
    });
  }
};

/*  Get Filters by Category */
const getFiltersByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const query = { category: categoryDoc._id };

    const places = await Course.distinct("schedules.location", query);
    const compensated = await Course.distinct("compensated", query);
    const types = await Course.distinct("type", query);

    const clean = (arr) => arr.filter((v) => v && v.trim() !== "");

    res.status(200).json({
      success: true,
      filters: {
        place: clean(places),
        compensated: clean(compensated),
        typeOfTraining: clean(types),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch filters by category",
      error: error.message,
    });
  }
};

/*  Get Filters by Subcategory */
const getFiltersBySubCategories = async (req, res) => {
  try {
    const { category, subcategory } = req.params;

    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const subCatDoc = await SubCategory.findOne({
      slug: subcategory,
    });
    if (!subCatDoc)
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });

    const query = {
      category: categoryDoc._id,
      subCategory: subCatDoc._id,
    };

    const places = await Course.distinct("schedules.location", query);
    const compensated = await Course.distinct("compensated", query);
    const types = await Course.distinct("type", query);

    const clean = (arr) => arr.filter((v) => v && v.trim() !== "");

    res.status(200).json({
      success: true,
      filters: {
        place: clean(places),
        compensated: clean(compensated),
        typeOfTraining: clean(types),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch filters by subcategory",
      error: error.message,
    });
  }
};
/*  Get Courses by Category */
const getCoursesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = parseInt(limit) || 10;
    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const query = { category: categoryDoc._id };

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .select([
        "title",
        "slug",
        "cover",
        "price",
        "description",
        "duration",
        "category",
      ])
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip * (parseInt(page) - 1 || 0))
      .limit(skip);
    const formattedCourses = courses.map((course) => ({
      ...course.toObject(),
      lecturersCount: course.lecturers?.length || 0,
      categoryName: course.category?.name || "",
      slug: course.slug,
    }));
    res.status(200).json({
      success: true,
      data: formattedCourses,
      total,
      totalPages: Math.ceil(total / skip),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses by category",
      error: error.message,
    });
  }
};

/*  Get Courses by Subcategory */
const getCoursesBySubCategory = async (req, res) => {
  try {
    const { subcategory } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = parseInt(limit) || 10;

    const subCatDoc = await SubCategory.findOne({
      slug: subcategory,
    });
    if (!subCatDoc)
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });

    const query = {
      subCategory: subCatDoc._id,
    };

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .select([
        "title",
        "slug",
        "cover",
        "price",
        "description",
        "duration",
        "category",
        "subcategory",
      ])
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ createdAt: -1 })
      .skip(skip * (parseInt(page) - 1 || 0))
      .limit(skip);
    const formattedCourses = courses.map((course) => ({
      ...course.toObject(),
      lecturersCount: course.lecturers?.length || 0,
      categoryName: course.category?.name || "",
      slug: course.slug,
    }));
    res.status(200).json({
      success: true,
      data: formattedCourses,
      total,
      totalPages: Math.ceil(total / skip),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses by subcategory",
      error: error.message,
    });
  }
};
module.exports = {
  getCourses,
  getAllCourses,
  getCourseBySlug,
  getFilters,
  getFiltersByCategory,
  getFiltersBySubCategories,
  getCoursesBySubCategory,
  getCoursesByCategory,
};
