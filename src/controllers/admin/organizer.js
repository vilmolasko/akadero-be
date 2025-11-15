const User = require("../../models/User");
const Organizer = require("../../models/Organizer");
const Course = require("../../models/Course");

/*  Get all users managed by admin */
const getUsersByAdmin = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", status } = req.query;
    const skip = parseInt(limit) * (parseInt(page) - 1);
    const query = {};

    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;
    const total = await Course.countDocuments(query);
    const organizers = await Organizer.find(query)
      .select(["name", "logo", "cover", "_id", "email", "status"])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: organizers,
      totalPages: Math.ceil(total / parseInt(limit)),
      total: total,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const toggleOrganizerApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Organizer.findById(id);
    console.log(user, "asda");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    user.status = user.status === "approved" ? "rejected" : "approved";
    await user.save();

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getOrganizerByIdByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1, search = "", status } = req.query;
    const skip = parseInt(limit) * (parseInt(page) - 1);

    // 🔹 Check if organizer exists
    const organizer = await Organizer.findById(id);
    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer Not Found" });
    }

    // 🔹 Build query for courses by this organizer
    const query = { organizer: organizer.organizer };
    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;

    // 🔹 Get total count
    const total = await Course.countDocuments(query);

    // 🔹 Get paginated + populated + selected fields courses
    const courses = await Course.find(query)
      .populate("organizer", "name email logo")
      .populate("lecturers", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const formattedCourses = courses.map((course) => ({
      ...course.toObject(),
      lecturersCount: course.lecturers?.length || 0,
      categoryName: course.category?.name || "",
      slug: course.slug,
    }));

    res.status(200).json({
      success: true,
      data: {
        organizer,
        courses: formattedCourses,
      },
      totalPages: Math.ceil(total / parseInt(limit)),
      totalCourses: total,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsersByAdmin,
  toggleOrganizerApproval,
  getOrganizerByIdByAdmin,
};
