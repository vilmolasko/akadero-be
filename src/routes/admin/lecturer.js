const express = require("express");
const router = express.Router();
const Lecturer = require("../../controllers/admin/lecturer");
const verifyToken = require("../../middlewares/jwt");
const { getAdmin } = require("../../middlewares/getAdmin");

router.post(
  "/admin/lecturers",
  verifyToken,
  getAdmin,
  Lecturer.createLecturerByAdmin
);

router.get(
  "/admin/lecturers",
  verifyToken,
  getAdmin,
  Lecturer.getLecturersByAdmin
);

router.get(
  "/admin/lecturers/:id",
  verifyToken,
  getAdmin,
  Lecturer.getLecturerByIdByAdmin
);

router.put(
  "/admin/lecturers/:id",
  verifyToken,
  getAdmin,
  Lecturer.updateLecturerByAdmin
);

router.delete(
  "/admin/lecturers/:id",
  verifyToken,
  getAdmin,
  Lecturer.deleteLecturerByAdmin
);
router.get("/admin/lecturers/all", Lecturer.getAllLecturersByAdmin);
module.exports = router;
