const Featured = require("../../models/Featured");
const Course = require("../../models/Course");
const getFeaturedCoursesByOrganizer = async (req, res) => {
  try {
    const oid = req.organizer._id.toString();
    const { limit = 10, page = 1, search = "" } = req.query;

    const take = parseInt(limit);
    const skip = take * (parseInt(page) - 1);

    // 🧩 Step 1: find courses belonging to this organizer
    const courseQuery = { organizer: oid };
    if (search) {
      courseQuery.title = { $regex: search, $options: "i" };
    }

    const organizerCourses = await Course.find(courseQuery).select("_id");

    if (organizerCourses.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        totalPages: 0,
      });
    }

    const courseIds = organizerCourses.map((c) => c._id);

    // 🧩 Step 2: find featured courses linked to those course IDs
    const total = await Featured.countDocuments({ course: { $in: courseIds } });

    const featuredCourses = await Featured.find({ course: { $in: courseIds } })
      .populate({
        path: "course",
        select: "title cover organizer",
        populate: {
          path: "organizer",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take);

    // 🧩 Step 3: Format response (optional, you can adjust if needed)
    const formatted = featuredCourses.map((item) => ({
      _id: item._id,
      title: item.course?.title || "",
      cover: item.course?.cover || "",
      organizer: item.course?.organizer,

      totalCost: item.totalCost,
      discount: item.discount,
      expire: item.expire,
      isActive: item.isActive,
      label: item.label,
      position: item.position,
      priority: item.priority,
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching featured courses by organizer:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getFeaturedCoursesByOrganizer };
