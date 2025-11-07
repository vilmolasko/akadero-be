const Course = require("../../models/Course");
const Categories = require("../../models/Category");

/*  Get All Courses by Organizer */
const getCourses = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", status } = req.query;
    const skip = parseInt(limit) || 5;

    const query = {
      title: { $regex: search, $options: "i" },
    };
    if (status) query.status = status;

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
      totalPages: Math.ceil(total / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//  Get All Categories (Public )
const getCategories = async (req, res) => {
  try {
    const categories = await Categories.find({ status: "active" })
      .sort({ createdAt: -1 })
      .select(["name", "slug", "cover", "subCategories"])
      .populate({
        path: "subCategories",
        select: ["name", "slug", "cover"],
      });

    const dataWithCounts = await Promise.all(
      categories.map(async (category) => {
        const categoryCourseCount = await Course.countDocuments({
          category: category._id,
        });

        const subCategoriesWithCount = await Promise.all(
          category.subCategories.map(async (sub) => {
            const subCourseCount = await Course.countDocuments({
              subCategory: sub._id,
            });
            return {
              ...sub._doc,
              coursesCount: subCourseCount,
            };
          })
        );

        return {
          ...category._doc,
          coursesCount: categoryCourseCount,
          subCategories: subCategoriesWithCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: dataWithCounts,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCourses,
  getCategories,
};
