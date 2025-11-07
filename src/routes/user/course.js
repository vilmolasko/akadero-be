const express = require("express");
const router = express.Router();
const Course = require("../../controllers/user/course");

router.get("/courses", Course.getCourses);
router.get("/all-courses", Course.getAllCourses);
router.get("/courses/:slug", Course.getCourseBySlug);
router.get("/filters", Course.getFilters);
router.get("/filters/:category", Course.getFiltersByCategory);
router.get("/filters/:category/:subcategory", Course.getFiltersBySubCategories);
router.get("/category/courses/:category", Course.getCoursesByCategory);
router.get("/subcategory/courses/:subcategory", Course.getCoursesBySubCategory);

module.exports = router;
