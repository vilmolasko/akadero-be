const Course = require("../../models/Course");
const Lecturer = require("../../models/Lecturer");
const User = require("../../models/User");

const { singleFileDelete } = require("../../utils/uploader.js");

/*  Create Course by Organizer */
const createCourseByOrganizer = async (req, res) => {
  try {
    const {
      cover,

      lecturers = [],
      slug,
      organizer,
      schedules = [],
      ...others
    } = req.body;
    const organizerId = req.organizer._id.toString();

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
      organizer: organizerId,
      slug,
    });

    res.status(201).json({
      success: true,
      message: "Course Created",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get All Courses by Organizer */
const getCoursesByOrganizer = async (req, res) => {
  try {
    const oid = req.organizer._id.toString();

    const { limit = 10, page = 1, search = "", status } = req.query;
    const skip = parseInt(limit) * (parseInt(page) - 1);

    // Build query
    const query = {
      organizer: oid,
    };
    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;

    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate("organizer", "name email cover")
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
      data: formattedCourses,
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getAllCoursesByOrganizer = async (req, res) => {
  try {
    const oid = req.organizer._id.toString();

    // Build query
    const query = {
      organizer: oid,
      status: "published",
    };

    const courses = await Course.find(query)
      .select(["title", "slug", "_id"])
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get Single Course by Slug */
const getCourseBySlugByOrganizer = async (req, res) => {
  try {
    const { slug } = req.params;
    const oid = req.organizer._id.toString();
    const course = await Course.findOne({ slug: slug, organizer: oid });

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
const updateCourseBySlugByOrganizer = async (req, res) => {
  try {
    const { slug } = req.params;
    const oid = req.organizer._id.toString();
    const { cover, lecturers = [], ...others } = req.body;

    if (lecturers && lecturers.length > 0) {
      const existingLecturers = await Lecturer.find({
        _id: { $in: lecturers },
      });

      if (existingLecturers.length !== lecturers.length) {
        return res.status(400).json({
          success: false,
          message: "One or more lecturer IDs are invalid or not owned by you.",
        });
      }
    }

    const course = await Course.findOneAndUpdate(
      { slug: slug },
      {
        ...others,
        cover: {
          ...cover,
        },
        lecturers,
        organizer: oid,
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
const deleteCourseBySlugByOrganizer = async (req, res) => {
  try {
    const { slug } = req.params;
    const oid = req.organizer._id.toString();
    const course = await Course.findOneAndDelete({ slug, organizer: oid });
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
  createCourseByOrganizer,
  getCoursesByOrganizer,
  getAllCoursesByOrganizer,
  getCourseBySlugByOrganizer,
  updateCourseBySlugByOrganizer,
  deleteCourseBySlugByOrganizer,
};
