const express = require("express");
const {
  getFeaturedCoursesByOrganizer,
} = require("../../controllers/organizer/featured");
const verifyToken = require("../../middlewares/jwt");
const { getOrganizer } = require("../../middlewares/getOrganizer");

const router = express.Router();

// Organizer: get their own featured courses with pagination
router.get(
  "/organizer/featured-courses",
  verifyToken,
  getOrganizer,
  getFeaturedCoursesByOrganizer
);

module.exports = router;
