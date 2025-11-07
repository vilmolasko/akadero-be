const express = require("express");
const {
  createFeaturedCourse,
  updateFeaturedCourse,
  getFeaturedCoursesByAdmin,
  getFeaturedCourseById,
  deleteFeaturedCourse,
} = require("../../controllers/admin/featured");
const verifyToken = require("../../middlewares/jwt");
const { getAdmin } = require("../../middlewares/getAdmin");
const router = express.Router();

// Create new featured course
router.post("/admin/featured", verifyToken, getAdmin, createFeaturedCourse);

// Edit existing featured course
router.put("/admin/featured/:id", verifyToken, getAdmin, updateFeaturedCourse);

// Get all featured courses
router.get("/admin/featured", verifyToken, getAdmin, getFeaturedCoursesByAdmin);

// Get one featured course
router.get("/admin/featured/:id", verifyToken, getAdmin, getFeaturedCourseById);

// Delete featured course
router.delete(
  "/admin/featured/:id",
  verifyToken,
  getAdmin,
  deleteFeaturedCourse
);

module.exports = router;
