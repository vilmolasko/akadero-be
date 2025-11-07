const Featured = require("../../models/Featured");
const Course = require("../../models/Course");

/**
 * @desc    Create a new Featured Course
 * @route   POST /api/featured-courses
 * @access  Admin
 */
const createFeaturedCourse = async (req, res) => {
  try {
    const {
      course,
      totalCost,
      discount,
      expire,
      isActive,
      position,
      priority,
      label,
      createdBy,
    } = req.body;

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course already featured
    const existing = await Featured.findOne({
      course,
      $or: [
        { expire: { $gte: new Date() } }, // not expired
        { isActive: true }, // still active
      ],
    });
    if (existing) {
      return res.status(400).json({ message: "Course is already featured" });
    }

    const newFeatured = await Featured.create({
      course,
      totalCost,
      discount,
      expire,
      isActive,
      position,
      priority,
      label,
      createdBy,
    });

    res.status(201).json({
      message: "Featured course created successfully",
      featured: newFeatured,
    });
  } catch (error) {
    console.error("Error creating featured course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Edit/Update Featured Course
 * @route   PUT /api/featured-courses/:id
 * @access  Admin
 */
const updateFeaturedCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const featured = await Featured.findById(id);
    if (!featured) {
      return res.status(404).json({ message: "Featured course not found" });
    }

    const updated = await Featured.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      message: "Featured course updated successfully",
      featured: updated,
    });
  } catch (error) {
    console.error("Error updating featured course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all Featured Courses
 * @route   GET /api/featured-courses
 * @access  Admin / Public
 */

const getFeaturedCoursesByAdmin = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", status } = req.query;
    const skip = parseInt(limit) * (parseInt(page) - 1);

    // Base query
    const query = {};

    // 🔹 Filter by search keyword (course title)
    if (search) {
      const courseIds = await Course.find(
        { title: { $regex: search, $options: "i" } },
        "_id"
      );
      query.course = { $in: courseIds.map((c) => c._id) };
    }

    // 🔹 Status filter logic
    const now = new Date();

    if (status === "active") {
      // Active: not expired & isActive = true
      query.isActive = true;
      query.expire = { $gte: now };
    } else if (status === "inactive") {
      // Inactive: not expired but isActive = false
      query.isActive = false;
      query.expire = { $gte: now };
    } else if (status === "expired") {
      // Expired: date already passed
      query.expire = { $lt: now };
    }

    // Count total featured courses
    const total = await Featured.countDocuments(query);

    // Fetch featured with pagination
    const featuredCourses = await Featured.find(query)
      .populate({
        path: "course",
        select: "title cover price organizer",
        populate: {
          path: "organizer",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Format data
    const formatted = featuredCourses.map((item) => ({
      _id: item._id,
      title: item.course?.title || "",
      cover: item.course?.cover || "",
      organizer: item.course?.organizer?.name,
      organizerCover: item.course?.organizer?.cover?.url,
      totalCost: item.totalCost,
      discount: item.discount,
      expire: item.expire,
      isActive: item.isActive,
      createdAt: item.createdAt,
    }));

    // Response
    res.status(200).json({
      success: true,
      data: formatted,
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
/**
 * @desc    Get Featured Course by ID
 * @route   GET /api/featured-courses/:id
 * @access  Admin
 */
const getFeaturedCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const featured = await Featured.findById(id).populate({
      path: "course",
      select: "title price thumbnail organizer",
      populate: {
        path: "organizer",
        select: "_id name",
      },
    });

    if (!featured) {
      return res.status(404).json({ message: "Featured course not found" });
    }

    res.status(200).json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete Featured Course
 * @route   DELETE /api/featured-courses/:id
 * @access  Admin
 */
const deleteFeaturedCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Featured.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Featured course not found" });
    }

    res.status(200).json({ message: "Featured course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  createFeaturedCourse,
  updateFeaturedCourse,
  getFeaturedCoursesByAdmin,
  getFeaturedCourseById,
  deleteFeaturedCourse,
};
