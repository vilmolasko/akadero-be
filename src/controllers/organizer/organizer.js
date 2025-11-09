const Organizer = require("../../models/Organizer");
const Course = require("../../models/Course");

/*  Create Organizer */
const createOrganizer = async (req, res) => {
  try {
    const { logo, cover, ...others } = req.body;

    const existingOrganizer = await Organizer.findOne({
      organizer: req.user._id.toString(),
    });

    if (existingOrganizer) {
      return res.status(400).json({
        success: false,
        message: "You have already created your organizer profile",
      });
    }

    const newOrganizer = await Organizer.create({
      organizer: req.user._id.toString(),
      logo,
      cover,
      ...others,
    });

    res.status(201).json({
      success: true,
      message: "Organizer profile created successfully",
      data: newOrganizer,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyOrganizerProfile = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ organizer: req.organizer._id });

    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer profile not found" });
    }

    const courses = await Course.find({ organizer: req.organizer._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: { organizer, courses },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/* ✅ Update Organizer */
const updateOrganizer = async (req, res) => {
  try {
    const { logo, cover, ...others } = req.body;

    const organizer = await Organizer.findOneAndUpdate(
      { organizer: req.organizer._id },
      { ...others, logo, cover },
      { new: true }
    );

    if (!organizer)
      return res
        .status(404)
        .json({ success: false, message: "Organizer Not Found" });

    res
      .status(200)
      .json({ success: true, message: "Organizer Updated", data: organizer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrganizer,
  getMyOrganizerProfile,
  updateOrganizer,
};
