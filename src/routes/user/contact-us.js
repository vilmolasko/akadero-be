const express = require("express");
const router = express.Router();
const contactUs = require("../../controllers/user/contact-us");
router.post("/contact-us", contactUs.contactUs);
module.exports = router;
