const express = require("express");
const router = express.Router();
const organizer = require("../../controllers/admin/organizer");
const verifyToken = require("../../middlewares/jwt");
const { getAdmin } = require("../../middlewares/getAdmin");

router.get("/admin/users", verifyToken, getAdmin, organizer.getUsersByAdmin);

router.put(
  "/admin/users/status/:id",
  verifyToken,
  getAdmin,
  organizer.toggleOrganizerApproval
);

router.get("/admin/organizers/:id", organizer.getOrganizerByIdByAdmin);
module.exports = router;
