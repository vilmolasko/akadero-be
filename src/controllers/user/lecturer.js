const Lecturer = require("../../models/Lecturer");
const Course = require("../../models/Course");

const getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: lecturers,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getLecturers = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", status } = req.query;
    const skip = parseInt(limit) || 10;

    const query = {
      name: { $regex: search, $options: "i" },
    };
    if (status) query.status = status;

    const total = await Lecturer.countDocuments(query);
    const lecturers = await Lecturer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip * (parseInt(page) - 1 || 0))
      .limit(skip);

    res.status(200).json({
      success: true,
      data: lecturers,
      total,
      totalPages: Math.ceil(total / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ✅ Get Single Lecturer with Their Courses */
const getSingleLecturer = async (req, res) => {
  try {
    const { id } = req.params;

    const lecturer = await Lecturer.findById(id);
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    const courses = await Course.find({ lecturers: lecturer._id }).select([
      "title",
      "slug",
      "price",
      "schedules",
    ]);

    res.status(200).json({
      success: true,
      data: {
        lecturer,
        courses,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getAllLecturers,
  getLecturers,
  getSingleLecturer,
};
