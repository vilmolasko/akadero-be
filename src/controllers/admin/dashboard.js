const Course = require("../../models/Course");
const User = require("../../models/User");
const Featured = require("../../models/Featured");

const getDashboardAnalyticsByAdmin = async (req, res) => {
  try {
    const { range = "3months" } = req.query;
    const now = new Date();
    const result = await Featured.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalCost" },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;
    let startDate = new Date();
    if (range === "7days") startDate.setDate(now.getDate() - 7);
    else if (range === "30days") startDate.setDate(now.getDate() - 30);
    else startDate.setMonth(now.getMonth() - 3);

    const courses = await Course.find({
      createdAt: { $gte: startDate, $lte: now },
    }).populate("organizer", "name email cover");

    const totalCourses = await Course.countDocuments();
    const totalOrganizers = await User.countDocuments({ role: "organizer" });
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
          totalCourses,
          totalOrganizers,
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

module.exports = { getDashboardAnalyticsByAdmin };
