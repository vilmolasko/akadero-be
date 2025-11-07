const express = require("express");
const router = express.Router();
const organizer = require("../../controllers/user/organizer");

router.get("/organizers/all", organizer.getAllOrganizers);

router.get("/organizers", organizer.getOrganizers);
router.get("/organizers/:id", organizer.getOrganizerById);

module.exports = router;
