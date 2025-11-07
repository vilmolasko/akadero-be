const Course = require("../../models/Course");
const Student = require("../../models/Student");

const createStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const { courseId, scheduleId } = req.params;

    const student = await Student.create({
      course: courseId,
      scheduleId,
      firstName,
      lastName,
      email,
      phone,
    });

    await Course.updateOne(
      { _id: courseId, "schedules._id": scheduleId },
      { $push: { "schedules.$.students": student._id } }
    );

    res.status(201).json({
      success: true,
      message: "Student enrolled successfully!",
      data: student,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createStudent };
