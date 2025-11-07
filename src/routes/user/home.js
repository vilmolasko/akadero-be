const express = require("express");
const router = express.Router();
const home = require("../../controllers/user/home");

router.get("/home/categories", home.getCategories);
router.get("/home/courses", home.getCourses);

module.exports = router;
