const express = require("express");
const router = express.Router();
const Course = require("../../controllers/organizer/course");
const verifyToken = require("../../middlewares/jwt");
const { getOrganizer } = require("../../middlewares/getOrganizer");

router.post(
  "/organizer/courses",
  verifyToken,
  getOrganizer,
  Course.createCourseByOrganizer
);
router.get(
  "/organizer/courses",
  verifyToken,
  getOrganizer,
  Course.getCoursesByOrganizer
);
router.get(
  "/organizer/all-courses",
  verifyToken,
  getOrganizer,
  Course.getAllCoursesByOrganizer
);
router.get(
  "/organizer/courses/:slug",
  verifyToken,
  getOrganizer,
  Course.getCourseBySlugByOrganizer
);
router.put(
  "/organizer/courses/:slug",
  verifyToken,
  getOrganizer,
  Course.updateCourseBySlugByOrganizer
);
router.delete(
  "/organizer/courses/:slug",
  verifyToken,
  getOrganizer,
  Course.deleteCourseBySlugByOrganizer
);

module.exports = router;
