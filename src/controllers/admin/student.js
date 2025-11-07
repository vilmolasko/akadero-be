const Course = require("../../models/Course");
const Student = require("../../models/Student");

/*  Get All Students by Admin */
const getStudentsByAdmin = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", status } = req.query;

    const skip = parseInt(limit) || 10;
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;

    const totalStudents = await Student.countDocuments(query);
    const studentsData = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip * (parseInt(page) - 1 || 0))
      .limit(skip);
    const students = studentsData.map((student) => ({
      _id: student._id,
      fullName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      phone: student.phone,
      status: student.status,
    }));
    res.status(200).json({
      success: true,
      data: students,
      count: Math.ceil(totalStudents / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/* ✅ Delete Student */
const deleteStudentByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findOneAndDelete({
      _id: id,
    });

    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student Not Found" });
    await Course.updateOne(
      { _id: student.course, "schedules._id": student.scheduleId },
      { $pull: { "schedules.$.students": student._id } }
    );
    res.status(200).json({ success: true, message: "Student Deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getStudentsByAdmin, deleteStudentByAdmin };
