const Lecturer = require("../../models/Lecturer");

/*  Create Lecturer by Admin */
const createLecturerByAdmin = async (req, res) => {
  try {
    const { cover, email, status, name, description } = req.body;

    // 🔒 Check if email already exists (case-insensitive)
    const existingLecturer = await Lecturer.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (existingLecturer) {
      return res.status(400).json({
        success: false,
        message: "Lecturer with this email already exists",
      });
    }

    const lecturer = await Lecturer.create({
      organizer: req.admin._id.toString(),
      cover,
      email,
      name,
      description,
      status,
    });

    res
      .status(201)
      .json({ success: true, message: "Lecturer Created", data: lecturer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/* Get All Lecturers by Admin */
const getLecturersByAdmin = async (req, res) => {
  try {
    const lecturers = await Lecturer.find({})
      .populate("organizer", "name email")
      .sort({
        createdAt: -1,
      });
    res.status(200).json({ success: true, data: lecturers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ✅ Get Single Lecturer by ID */
const getLecturerByIdByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const lecturer = await Lecturer.findOne({
      _id: id,
      organizer: req.admin._id.toString(),
    });

    if (!lecturer)
      return res
        .status(404)
        .json({ success: false, message: "Lecturer Not Found" });

    res.status(200).json({ success: true, data: lecturer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ✅ Update Lecturer */
const updateLecturerByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { cover, ...others } = req.body;

    const lecturer = await Lecturer.findOneAndUpdate(
      { _id: id, organizer: req.admin._id.toString() },
      { ...others, cover },
      { new: true }
    );

    if (!lecturer)
      return res
        .status(404)
        .json({ success: false, message: "Lecturer Not Found" });

    res
      .status(200)
      .json({ success: true, message: "Lecturer Updated", data: lecturer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ✅ Delete Lecturer */
const deleteLecturerByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const lecturer = await Lecturer.findOneAndDelete({
      _id: id,
    });

    if (!lecturer)
      return res
        .status(404)
        .json({ success: false, message: "Lecturer Not Found" });

    res.status(200).json({ success: true, message: "Lecturer Deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getAllLecturersByAdmin = async (req, res) => {
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
module.exports = {
  createLecturerByAdmin,
  getLecturersByAdmin,
  getLecturerByIdByAdmin,
  updateLecturerByAdmin,
  deleteLecturerByAdmin,
  getAllLecturersByAdmin,
};
