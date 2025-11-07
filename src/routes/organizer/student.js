const express = require("express");
const router = express.Router();
const Student = require("../../controllers/organizer/student");
const verifyToken = require("../../middlewares/jwt");
const { getOrganizer } = require("../../middlewares/getOrganizer");

router.get(
  "/organizer/students",
  verifyToken,
  getOrganizer,
  Student.getStudentsByOrganizer
);

router.delete(
  "/organizer/students/:id",
  verifyToken,
  getOrganizer,
  Student.deleteStudentByOrganizer
);

module.exports = router;
