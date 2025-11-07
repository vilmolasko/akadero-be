const express = require("express");
const router = express.Router();
const Inquiry = require("../../controllers/user/inquiry");
router.post("/course/inquiry/:courseId", Inquiry.createCourseInquiry);
router.post("/organizer/inquiry/:slug", Inquiry.createOrganizerInquiry);
module.exports = router;
