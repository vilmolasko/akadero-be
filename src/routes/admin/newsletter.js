const express = require("express");
const router = express.Router();
const newsletter = require("../../controllers/admin/newsletter");
const verifyToken = require("../../middlewares/jwt");
const { getAdmin } = require("../../middlewares/getAdmin");

router.get(
  "/admin/newsletter",
  verifyToken,
  getAdmin,
  newsletter.getNewslettersByAdmin
);

module.exports = router;
