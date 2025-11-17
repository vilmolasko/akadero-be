const Lecturer = require("../../models/Lecturer");

/* ✅ Create Lecturer by Organizer */
const createLecturerByOrganizer = async (req, res) => {
  try {
    const { cover, email, status, name, description } = req.body;

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
      organizer: req.organizer._id.toString(),
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

/* ✅ Get All Lecturers by Organizer */
const getLecturersByOrganizer = async (req, res) => {
  try {
    const lecturers = await Lecturer.find({
      organizer: req.organizer._id.toString(),
    })
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
const getLecturerByIdByOrganizer = async (req, res) => {
  try {
    const { id } = req.params;

    const lecturer = await Lecturer.findOne({
      _id: id,
      organizer: req.organizer._id.toString(),
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
const updateLecturerByOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const { cover, ...others } = req.body;

    const lecturer = await Lecturer.findOneAndUpdate(
      { _id: id, organizer: req.organizer._id.toString() },
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
const deleteLecturerByOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");
    const lecturer = await Lecturer.findByIdAndDelete(id);

    if (!lecturer)
      return res
        .status(404)
        .json({ success: false, message: "Lecturer Not Found" });

    res.status(200).json({ success: true, message: "Lecturer Deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getAllLecturersByOrganizer = async (req, res) => {
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
  createLecturerByOrganizer,
  getLecturersByOrganizer,
  getLecturerByIdByOrganizer,
  updateLecturerByOrganizer,
  deleteLecturerByOrganizer,
  getAllLecturersByOrganizer,
};
