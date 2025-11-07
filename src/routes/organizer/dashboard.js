const express = require("express");
const router = express.Router();
const dashboard = require("../../controllers/organizer/dashboard");
const verifyToken = require("../../middlewares/jwt");
const { getOrganizer } = require("../../middlewares/getOrganizer");

router.get(
  "/organizer/dashboard-analytics",
  verifyToken,
  getOrganizer,
  dashboard.getDashboardAnalyticsByOrganizer
);

module.exports = router;
