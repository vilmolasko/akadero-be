const Course = require("../../models/Course");
const Featured = require("../../models/Featured");
const mongoose = require("mongoose");
const getDashboardAnalyticsByOrganizer = async (req, res) => {
  try {
    const oid = req.organizer._id.toString();
    const { range = "3months" } = req.query;
    const now = new Date();
    let startDate = new Date();
    if (range === "7days") startDate.setDate(now.getDate() - 7);
    else if (range === "30days") startDate.setDate(now.getDate() - 30);
    else startDate.setMonth(now.getMonth() - 3);

    // 1️⃣ Fetch organizer's courses in date range
    const courses = await Course.find({
      organizer: oid,
      createdAt: { $gte: startDate, $lte: now },
    }).populate("organizer", "name email cover price schedules status");

    // 2️⃣ Total students
    const totalStudents = courses.reduce(
      (sum, course) =>
        sum +
        (course.schedules || []).reduce(
          (s, sch) => s + (sch.students || []).length,
          0
        ),
      0
    );

    // 3️⃣ Course status overview
    const statusGroups = await Course.aggregate([
      { $match: { organizer: new mongoose.Types.ObjectId(oid) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusOverview = {
      published: 0,
      pending: 0,
      completed: 0,
      canceled: 0,
    };
    statusGroups.forEach((g) => {
      const key = g._id?.toLowerCase();
      if (statusOverview[key] !== undefined) statusOverview[key] = g.count;
    });

    // 4️⃣ Total published, pending, featured
    const organizerCourses = await Course.find({ organizer: oid }).select(
      "_id status"
    );
    const totalPublished = organizerCourses.filter(
      (v) => v.status === "published"
    );
    const totalPending = organizerCourses.filter((v) => v.status === "pending");
    const courseIds = organizerCourses.map((c) => c._id);
    const totalFeatured = await Featured.countDocuments({
      course: { $in: courseIds },
    });

    // 5️⃣ Build lineChart data with income
    const dateCounts = {};
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      dateCounts[d.toISOString().split("T")[0]] = {
        courses: 0,
        organizers: 0,
        income: 0,
      };
    }

    courses.forEach((course) => {
      const dateKey = course.createdAt.toISOString().split("T")[0];
      if (dateCounts[dateKey]) {
        dateCounts[dateKey].courses += 1;

        const totalStudentsInCourse = (course.schedules || []).reduce(
          (s, sch) => s + (sch.students || []).length,
          0
        );

        dateCounts[dateKey].organizers += totalStudentsInCourse;
        dateCounts[dateKey].income += totalStudentsInCourse * course.price;
      }
    });

    const lineChart = Object.entries(dateCounts).map(([date, data]) => ({
      date,
      courses: data.courses,
      organizers: data.organizers,
      income: data.income,
    }));

    // ✅ Format Response
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalPublished: totalPublished.length,
          totalFeatured,
          totalPending: totalPending.length,
        },
        report: {
          range,
          lineChart,
        },
        overview: statusOverview,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getDashboardAnalyticsByOrganizer };
