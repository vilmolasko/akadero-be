const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const fs = require("fs");
const path = require("path");

/*  Register a new user (Sign Up) */
const signUp = async (req, res) => {
  try {
    const request = req.body;
    const UserCount = await User.countDocuments();
    const existingUser = await User.findOne({ email: request.email });

    if (existingUser) {
      return res.status(400).json({
        UserCount,
        success: false,
        message: "User With This Email Already Exists",
      });
    }
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });
    const role = UserCount === 0 ? "admin" : "organizer";
    const status = UserCount === 0 ? "active" : "active";

    const user = await User.create({
      ...request,
      otp,
      role,
      status,
    });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    if (role !== "admin") {
      //  Send OTP email
      const htmlFilePath = path.join(
        process.cwd(),
        "src/email-templates",
        "otp.html"
      );
      let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

      // ✅ Replace {{otp}} and {{email}} placeholders
      htmlContent = htmlContent
        .replace(/{{\s*otp\s*}}/g, otp)
        .replace(/{{\s*email\s*}}/g, user.email);

      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: Number(process.env.SMTP_PORT),
        secure: Boolean(process.env.SMTP_SECURE),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      let mailOptions = {
        from: process.env.SENDING_EMAIL,
        to: user.email,
        subject: "Verify your email",
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);

      //  (Optional) Notify admin if a new organizer registers

      await transporter.sendMail({
        from: process.env.SENDING_EMAIL,
        to: process.env.SENDING_EMAIL,
        subject: "New Organizer Registration Pending Approval",
        html: `<p>A new organizer <b>${user.firstName} ${user.lastName}</b> has signed up and is awaiting approval.</p>`,
      });
    }
    res.status(201).json({
      success: true,
      message:
        role === "admin"
          ? "Admin account created successfully."
          : "Organizer account created successfully and awaiting admin approval.",
      otp,
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
/*  Log in an existing user (Sign In) */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    if (!user.password) {
      return res
        .status(404)
        .json({ success: false, message: "User Password Not Found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Login Successfully",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        cover: user.cover,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        zip: user.zip,
        state: user.state,
        about: user.about,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/*  Send reset password link to user's email */
const forgetPassword = async (req, res) => {
  try {
    const request = req.body;
    const user = await User.findOne({ email: request.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const resetPasswordLink = `${request.origin}/auth/reset-password/${token}`;
    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "forget.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    htmlContent = htmlContent.replace(
      /href="javascript:void\(0\);"/g,
      `href="${resetPasswordLink}"`
    );

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: Boolean(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.SENDING_EMAIL,
      to: user.email,
      subject: "Verify your email",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Forgot Password Email Sent Successfully.",
      token,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*  Reset user password using token */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid Or Expired Token. Please Request A New One.",
        err: err.message,
      });
    }

    const user = await User.findById(decoded._id).select("password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    if (!newPassword || !user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Data. Both NewPassword And User Password Are Required.",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New Password Must Be Different From The Old Password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully.",
      user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*  Verify user OTP code */
const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "OTP Has Already Been Verified" });
    }

    if (otp === user.otp) {
      user.isVerified = true;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "OTP Verified Successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*  Resend OTP code to user */
const resendOtp = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      isVerified: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found or Already Verified",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });
    await User.findByIdAndUpdate(user._id, { otp: otp.toString() });

    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "otp.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    htmlContent = htmlContent.replace(/<h1>[\s\d]*<\/h1>/g, `<h1>${otp}</h1>`);
    htmlContent = htmlContent.replace(/usingyourmail@gmail\.com/g, user.email);

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: Boolean(process.env.SMTP_SECURE),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.SENDING_EMAIL,
      to: user.email,
      subject: "Verify your email",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: "OTP Resent Successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  signUp,
  signIn,
  forgetPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
};
