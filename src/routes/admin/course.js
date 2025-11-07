const express = require("express");
const router = express.Router();
const Course = require("../../controllers/admin/course");
const verifyToken = require("../../middlewares/jwt");
const { getAdmin } = require("../../middlewares/getAdmin");

router.post(
  "/admin/courses",
  verifyToken,
  getAdmin,
  Course.createCourseByAdmin
);
router.get("/admin/courses", verifyToken, getAdmin, Course.getCoursesByAdmin);
router.get(
  "/admin/courses/:slug",
  verifyToken,
  getAdmin,
  Course.getCourseBySlugByAdmin
);
router.put(
  "/admin/courses/:slug",
  verifyToken,
  getAdmin,
  Course.updateCourseBySlugByAdmin
);
router.delete(
  "/admin/courses/:slug",
  verifyToken,
  getAdmin,
  Course.deleteCourseBySlugByAdmin
);

module.exports = router;
