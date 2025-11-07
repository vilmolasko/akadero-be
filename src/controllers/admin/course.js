const Course = require("../../models/Course");
const Lecturer = require("../../models/Lecturer");
const Organizer = require("../../models/Organizer");
const { singleFileDelete } = require("../../utils/uploader.js");

/*  Create Course by Admin */
const createCourseByAdmin = async (req, res) => {
  try {
    const {
      cover,
      status,
      lecturers = [],
      slug,
      organizer,
      schedules = [],
      ...others
    } = req.body;

    const organizerExists = await Organizer.findOne({ _id: organizer });
    if (!organizerExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID",
      });
    }

    await Course.create({
      ...others,
      cover: {
        ...cover,
      },
      lecturers,
      schedules: schedules.map((s) => ({
        ...s,
        students: Array.isArray(s.students) ? s.students : [],
      })),
      organizer,
      slug,
      status,
    });

    res.status(201).json({ success: true, message: "Course Created" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get All Courses by Admin */
const getCoursesByAdmin = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      organizer,
      category,
      search = "",
      status,
    } = req.query;
    const skip = parseInt(limit) * (parseInt(page) - 1);

    // Build query
    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;
    if (organizer) query.organizer = organizer;
    if (category) query.category = category;

    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate({
        path: "organizer",
        select: ["name", "email", "cover"],
      })
      .populate({
        path: "lecturers",
        select: ["name"],
      })
      .populate({
        path: "category",
        select: ["name"],
      })

      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: courses,
      count: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get Single Course by Slug */
const getCourseBySlugByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug: slug });

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course Not Found" });

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Update Course by Slug */
const updateCourseBySlugByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    const { cover, lecturers = [], organizer, ...others } = req.body;
    const organizerExists = await Organizer.findOne({ _id: organizer });
    if (!organizerExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID",
      });
    }

    const course = await Course.findOneAndUpdate(
      { slug: slug },
      {
        ...others,
        cover: {
          ...cover,
        },
        lecturers,
        organizer,
      },
      { new: true }
    );

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course Not Found" });

    res.status(200).json({ success: true, message: "Course Updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Delete Course by Slug */
const deleteCourseBySlugByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOneAndDelete({ slug });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course Not Found" });

    if (course.cover) await singleFileDelete(req, course.cover);

    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCourseByAdmin,
  getCoursesByAdmin,
  getCourseBySlugByAdmin,
  updateCourseBySlugByAdmin,
  deleteCourseBySlugByAdmin,
};
