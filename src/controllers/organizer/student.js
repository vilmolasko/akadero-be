const Student = require("../../models/Student");
const Course = require("../../models/Course");

/*  Get All Courses by Organizer */
const getStudentsByOrganizer = async (req, res) => {
  try {
    const organizerId = req.organizer._id;
    const { limit = 10, page = 1, search = "", course } = req.query;

    const skip = parseInt(limit) * (parseInt(page) - 1);

    // ✅ 1) Get all course IDs that belong to this organizer
    const courseIds = await Course.find({ organizer: organizerId }).distinct(
      "_id"
    );

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        totalPages: 0,
      });
    }

    // ✅ 2) Build student query
    const query = {
      course: { $in: courseIds },
    };

    // ✅ 3) If course slug filter exists
    if (course) {
      const currentCourse = await Course.findOne({
        slug: course,
        organizer: organizerId,
      });

      if (!currentCourse) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Course Not Found For This Organizer",
          });
      }

      query.course = currentCourse._id;
    }

    // ✅ 4) Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ 5) Count matching students
    const total = await Student.countDocuments(query);

    // ✅ 6) Fetch students
    const students = await Student.find(query)
      .populate("course", "title cover slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: students,
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*  Delete Course by Slug */
const deleteStudentByOrganizer = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student Not Found" });

    res.status(200).json({
      success: true,
      message: "Student Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentsByOrganizer,
  deleteStudentByOrganizer,
};
