const express = require("express");
const router = express.Router();
const student = require("../../controllers/user/student");

router.post(
  "/courses/:courseId/schedules/:scheduleId/students",
  student.createStudent
);

module.exports = router;
