const express = require("express");
const {
  createReviewByUser,
  getReviewsByCourseId,
} = require("../../controllers/user/review");

const router = express.Router();

router.post("/reviews/:courseId", createReviewByUser);

router.get("/reviews/:courseId", getReviewsByCourseId);

module.exports = router;
