const express = require("express");
const router = express.Router();
const Organizer = require("../../controllers/organizer/organizer");
const verifyToken = require("../../middlewares/jwt");
const { getOrganizer } = require("../../middlewares/getOrganizer");

/*  Create Organizer (by Organizer user) */
router.post("/organizer/profile", verifyToken, Organizer.createOrganizer);

/*  Get Single Organizer by ID */
router.get(
  "/organizer/profile",
  verifyToken,
  getOrganizer,
  Organizer.getMyOrganizerProfile
);

/*  Update Organizer */
router.put(
  "/organizer/profile",
  verifyToken,
  getOrganizer,
  Organizer.updateOrganizer
);

module.exports = router;
