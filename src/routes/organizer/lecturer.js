const express = require("express");
const router = express.Router();
const Lecturer = require("../../controllers/organizer/lecturer");
const verifyToken = require("../../middlewares/jwt");
const { getOrganizer } = require("../../middlewares/getOrganizer");

router.post(
  "/organizer/lecturers",
  verifyToken,
  getOrganizer,
  Lecturer.createLecturerByOrganizer
);

router.get(
  "/organizer/lecturers",
  verifyToken,
  getOrganizer,
  Lecturer.getLecturersByOrganizer
);

router.get(
  "/organizer/lecturers/:id",
  verifyToken,
  getOrganizer,
  Lecturer.getLecturerByIdByOrganizer
);

router.put(
  "/organizer/lecturers/:id",
  verifyToken,
  getOrganizer,
  Lecturer.updateLecturerByOrganizer
);

router.delete(
  "/organizer/lecturers/:id",
  verifyToken,
  getOrganizer,
  Lecturer.deleteLecturerByOrganizer
);
router.get("/organizer/lecturers/all", Lecturer.getAllLecturersByOrganizer);
module.exports = router;
