const Course = require("../../models/Course");
const Organizer = require("../../models/Organizer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

/*  Create Inquiry and Send Email to Organizer */
const createCourseInquiry = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, question } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "organizer",
      select: "email",
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "inquiry.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    htmlContent = htmlContent
      .replace(/{{firstName}}/g, firstName)
      .replace(/{{lastName}}/g, lastName)
      .replace(/{{email}}/g, email)
      .replace(/{{phone}}/g, phone)
      .replace(/{{question}}/g, question)
      .replace(/{{courseName}}/g, course.title || "Course");

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: Boolean(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SENDING_EMAIL,
      to: course.organizer.email,
      subject: `New Inquiry for ${course.title}`,
      html: htmlContent,
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted ",
    });
  } catch (error) {
    console.error("Inquiry Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const createOrganizerInquiry = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, question } = req.body;
    const { slug } = req.params;

    const organizer = await Organizer.findOne({
      slug,
    });
    if (!organizer) {
      return res
        .status(404)
        .json({ success: false, message: "Organizer not found" });
    }

    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "inquiry.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    htmlContent = htmlContent
      .replace(/{{firstName}}/g, firstName)
      .replace(/{{lastName}}/g, lastName)
      .replace(/{{email}}/g, email)
      .replace(/{{phone}}/g, phone)
      .replace(/{{question}}/g, question)
      .replace(/{{courseName}}/g, organizer.name || "Organizer");

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: Boolean(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SENDING_EMAIL,
      to: organizer.email,
      subject: `New Inquiry for ${organizer.name}`,
      html: htmlContent,
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted ",
    });
  } catch (error) {
    console.error("Inquiry Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCourseInquiry, createOrganizerInquiry };
