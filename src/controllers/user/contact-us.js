const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

/*  Create Inquiry and Send Email to Organizer */
const contactUs = async (req, res) => {
  try {
    const { email, name, message, phone } = req.body;

    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "contact-us.html"
    );

    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    htmlContent = htmlContent
      .replace(/{{email}}/g, email)
      .replace(/{{name}}/g, name)
      .replace(/{{message}}/g, message)
      .replace(/{{phone}}/g, phone);
    let transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    to: process.env.SENDING_EMAIL,
      await transporter.sendMail({
        from: process.env.SENDING_EMAIL,
        to: process.env.SENDING_EMAIL,
        subject: `Nauja žinutė iš kontaktų formos nuo ${name}`,
        html: htmlContent,
      });

    return res.status(201).json({
      success: true,
      message: "Contact us submitted ",
    });
  } catch (error) {
    console.error("Contact us Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { contactUs };
