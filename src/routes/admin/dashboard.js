const express = require("express");
const router = express.Router();
const dashboard = require("../../controllers/admin/dashboard");
const verifyToken = require("../../middlewares/jwt");
const { getAdmin } = require("../../middlewares/getAdmin");

router.get(
  "/admin/dashboard-analytics",
  verifyToken,
  getAdmin,
  dashboard.getDashboardAnalyticsByAdmin
);

module.exports = router;
