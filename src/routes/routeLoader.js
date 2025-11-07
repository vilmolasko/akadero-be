const express = require("express");
//////////////// admin routes //////////////////////
const adminCategoryRoutes = require("./admin/category");
const adminSubCategoryRoutes = require("./admin/sub-category");
const adminCourseRoutes = require("./admin/course");
const adminLecturerRoutes = require("./admin/lecturer");
const adminNewsletterRoutes = require("./admin/newsletter");
const adminDashboardRoutes = require("./admin/dashboard");
const adminOrganizerRoutes = require("./admin/organizer");
const adminStudentRoutes = require("./admin/student");

//////////////// organizer routes ///////////////////////

const organizerCourseRoutes = require("./organizer/course");
const organizerLecturerRoutes = require("./organizer/lecturer");
const organizerRoutes = require("./organizer/organizer");
const organizerDashboardRoutes = require("./organizer/dashboard");

//////////////// user routes ///////////////////////

const authRoutes = require("./user/auth");
const userCategoryRoutes = require("./user/category");
const userSubCategoryRoutes = require("./user/sub-category");
const userCourseRoutes = require("./user/course");
const reviewCourseRoutes = require("./user/review");
const userNewsletterRoutes = require("./user/newsletter");
const delete_fileRoutes = require("./user/file-delete");
const userRoutes = require("./user/user");
const userLecturerRoutes = require("./user/lecturer");
const userOrganizerRoutes = require("./user/organizer");
const userStudentRoutes = require("./user/student");
const userInquiryRoutes = require("./user/inquiry");
const userHomeRoutes = require("./user/home");
const featuredOrganizerRoutes = require("./organizer/featured");
const featuredAdminRoutes = require("./admin/featured");
const studentOrganizerRoutes = require("./organizer/student");

const router = express.Router();

//////////////// admin routes //////////////////////
router.use("/api", adminCategoryRoutes);
router.use("/api", adminSubCategoryRoutes);
router.use("/api", adminCourseRoutes);
router.use("/api", adminLecturerRoutes);
router.use("/api", adminNewsletterRoutes);
router.use("/api", adminDashboardRoutes);

router.use("/api", adminOrganizerRoutes);
router.use("/api", adminStudentRoutes);

//////////////// organizer routes //////////////////////
router.use("/api", organizerDashboardRoutes);
router.use("/api", organizerCourseRoutes);
router.use("/api", organizerLecturerRoutes);
router.use("/api", organizerRoutes);
router.use("/api", studentOrganizerRoutes);

//////////////// user routes ///////////////////////

router.use("/api", authRoutes);
router.use("/api", userCategoryRoutes);
router.use("/api", userSubCategoryRoutes);
router.use("/api", userCourseRoutes);
router.use("/api", reviewCourseRoutes);
router.use("/api", userNewsletterRoutes);
router.use("/api", delete_fileRoutes);
router.use("/api", userRoutes);
router.use("/api", userStudentRoutes);
router.use("/api", userLecturerRoutes);
router.use("/api", userOrganizerRoutes);
router.use("/api", userInquiryRoutes);
router.use("/api", userHomeRoutes);
router.use("/api", featuredOrganizerRoutes);
router.use("/api", featuredAdminRoutes);

module.exports = router;
