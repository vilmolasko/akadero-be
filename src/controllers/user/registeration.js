// const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

/*  Create Inquiry and Send Email to Organizer */
const createRegistration = async (req, res) => {
  try {
    const { email, company, description, phone, plan } = req.body;

    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "registeration.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    htmlContent = htmlContent
      .replace(/{{plan}}/g, plan)
      .replace(/{{email}}/g, email)
      .replace(/{{company}}/g, company)
      .replace(/{{description}}/g, description)
      .replace(/{{phone}}/g, phone);
    let transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SENDING_EMAIL,
      to: process.env.SENDING_EMAIL,
      subject: `New Registeration for ${company}`,
      html: htmlContent,
    });

    return res.status(201).json({
      success: true,
      message: "Registeration submitted ",
    });
  } catch (error) {
    console.error("Registeration Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { createRegistration };
