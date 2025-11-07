const express = require("express");
const router = express.Router();
const Student = require("../../controllers/admin/student");
const verifyToken = require("../../middlewares/jwt");

router.get(
  "/admin/students",
  verifyToken,

  Student.getStudentsByAdmin
);

router.delete(
  "/admin/students/:id",
  verifyToken,

  Student.deleteStudentByAdmin
);

module.exports = router;
