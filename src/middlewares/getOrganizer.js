const { getOrganizer: getOrganizerHelper } = require("../utils/getUser");

const getOrganizer = async (req, res, next) => {
  try {
    const organizer = await getOrganizerHelper(req);
    req.organizer = organizer;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message || "Access Denied",
    });
  }
};

module.exports = { getOrganizer };
