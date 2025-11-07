const Organizer = require("../../models/Organizer");
const Course = require("../../models/Course");

/*  Get  Organizers  */
const getOrganizers = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "" } = req.query;

    const skip = parseInt(limit) || 10;
    const query = {
      name: { $regex: search, $options: "i" },
      status: "approved",
    };
    const totalOrganizers = await Organizer.find(query);

    const organizers = await Organizer.find(query, null, {
      skip: skip * (parseInt(page) - 1 || 0),
      limit: skip,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: organizers,
      totalPages: Math.ceil(totalOrganizers.length / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/*  Get Single Organizer by ID */
const getOrganizerById = async (req, res) => {
  try {
    const { id } = req.params;

    const organizer = await Organizer.findById(id);

    if (!organizer)
      return res
        .status(404)
        .json({ success: false, message: "Organizer Not Found" });

    const courses = await Course.find({
      organizer: organizer.organizer._id,
    })
      .select(["title", "schedules"])
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { organizer, courses } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getAllOrganizers = async (req, res) => {
  try {
    const organizersData = await Organizer.find()
      .select(["name", "cover", "_id", "email", "status"])
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: organizersData,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrganizerById,
  getOrganizers,
  getAllOrganizers,
};
