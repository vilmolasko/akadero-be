const express = require("express");
const router = express.Router();
const user = require("../../controllers/user/user");
const verifyToken = require("../../middlewares/jwt");
const { getUser } = require("../../middlewares/getUser");

router.get("/users/profile", verifyToken, getUser, user.getOneUser);
router.put("/users/profile", verifyToken, getUser, user.updateUser);
router.put("/users/change-password", verifyToken, getUser, user.changePassword);

router.get("/users/otp", user.getOTPs);

module.exports = router;
