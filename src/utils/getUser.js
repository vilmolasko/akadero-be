const Users = require("../models/User");
const Organizer = require("../models/Organizer");

exports.getUser = async (req, requireVerify = true) => {
  const user = await Users.findById(req.user._id);
  if (!user) {
    throw new Error("User Not Found.");
  }

  // If verification is required and user is not verified
  if (requireVerify && !user.isVerified) {
    throw new Error("User Email Is Not Verified.");
  }

  return user;
};

exports.getAdmin = async (req) => {
  if (!req.user) {
    throw new Error("You Must Be Logged In.");
  }

  const user = await Users.findById(req.user._id);
  if (!user) {
    throw new Error("User Not Found.");
  }
  // if (!user.role.includes("admin")) {
  //   throw new Error("Access Denied.");
  // }

  return user;
};

exports.getOrganizer = async (req) => {
  if (!req.user) {
    throw new Error("You Must Be Logged In.");
  }

  const user = await Users.findById(req.user._id);
  if (!user) {
    throw new Error("User Not Found.");
  }
  const organizer = await Organizer.findOne({
    organizer: user?._id.toString(),
  });
  if (!organizer) {
    throw new Error("Organizer not found.");
  }
  if (organizer.status !== "approved") {
    throw new Error("Organizer not approved.");
  }
  if (!user.role.includes("organizer")) {
    throw new Error("Access Denied.");
  }

  return organizer;
};
