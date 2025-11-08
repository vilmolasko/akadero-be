const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

/*  Create Inquiry and Send Email to Organizer */
const contactUs = async (req, res) => {
  try {
    const { email, name, description, phone } = req.body;

    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "contact-us.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    htmlContent = htmlContent
      .replace(/{{email}}/g, email)
      .replace(/{{name}}/g, name)
      .replace(/{{description}}/g, description)
      .replace(/{{phone}}/g, phone);
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
