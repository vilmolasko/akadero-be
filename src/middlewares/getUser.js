const { getUser: getUserHelper } = require("../utils/getUser");

const getUser = async (req, res, next) => {
  try {
    const user = await getUserHelper(req);
    req.userData = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || "Unauthorized",
    });
  }
};

module.exports = { getUser };
