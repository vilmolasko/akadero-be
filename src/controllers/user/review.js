const Review = require("../../models/Review");
const Course = require("../../models/Course");

/*  Create Review for a Course */
const createReviewByUser = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { firstName, lastName, email, review, rating } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const newReview = await Review.create({
      course: courseId,
      firstName,
      lastName,
      email,
      review,
      rating,
    });

    const allReviews = await Review.find({ course: courseId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    course.reviews = avgRating;
    await course.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get All Reviews by Course ID */
const getReviewsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId }).sort({
      createdAt: -1,
    });

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this course",
      });
    }

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReviewByUser,
  getReviewsByCourseId,
};
