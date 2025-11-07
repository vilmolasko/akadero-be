const express = require("express");
const router = express.Router();
const Lecturer = require("../../controllers/user/lecturer");

router.get("/lecturers", Lecturer.getLecturers);
router.get("/lecturers/all", Lecturer.getAllLecturers);
router.get("/lecturers/:id", Lecturer.getSingleLecturer);

module.exports = router;
