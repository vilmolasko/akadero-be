const Course = require("../../models/Course");
const Featured = require("../../models/Featured");
const mongoose = require("mongoose");
const getDashboardAnalyticsByOrganizer = async (req, res) => {
  try {
    const oid = req.organizer._id.toString();
    const { range = "3months" } = req.query;
    const now = new Date();
    const result = await Featured.aggregate([
      // 1️⃣ Join course data
      {
        $lookup: {
          from: "courses", // collection name in Mongo
          localField: "course", // Featured.course = courseId
          foreignField: "_id", // match Course._id
          as: "courseData",
        },
      },

      // 2️⃣ Unwind the course array
      { $unwind: "$courseData" },

      // 3️⃣ Filter by organizer ID
      {
        $match: {
          "courseData.organizer": new mongoose.Types.ObjectId(oid),
        },
      },

      // 4️⃣ Group and sum revenue
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalCost" },
        },
      },
    ]);
    const organizerCourses = await Course.find({ organizer: oid }).select(
      "_id"
    );
    const courseIds = organizerCourses.map((c) => c._id);
    const totalFeatured = await Featured.countDocuments({
      course: { $in: courseIds },
    });

    const totalRevenue = result[0]?.totalRevenue || 0;
    let startDate = new Date();
    if (range === "7days") startDate.setDate(now.getDate() - 7);
    else if (range === "30days") startDate.setDate(now.getDate() - 30);
    else startDate.setMonth(now.getMonth() - 3);
    const courses = await Course.find({
      organizer: oid,
      createdAt: { $gte: startDate, $lte: now },
    }).populate("organizer", "name email cover");
    const totalStudents = courses.reduce(
      (sum, course) =>
        sum +
        (course.schedules || []).reduce(
          (s, sch) => s + (sch.students || []).length,
          0
        ),
      0
    );
    const statusGroups = await Course.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(oid),
        },
      },
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

    const dateCounts = {};
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      dateCounts[d.toISOString().split("T")[0]] = 0;
    }

    courses.forEach((course) => {
      const dateKey = course.createdAt.toISOString().split("T")[0];
      if (dateCounts[dateKey] !== undefined) {
        dateCounts[dateKey]++;
      }
    });

    const lineChartData = Object.entries(dateCounts).map(([date, count]) => ({
      date,
      courses: count,
      organizers: Math.floor(count / 2),
    }));

    // ✅ Format Response
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalCourses: courseIds.length,
          totalFeatured,
          revenue: totalRevenue,
        },
        report: {
          range,
          lineChart: lineChartData,
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
