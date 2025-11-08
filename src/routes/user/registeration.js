const express = require("express");
const router = express.Router();
const Registeration = require("../../controllers/user/registeration");
router.post("/registeration", Registeration.createRegistration);
module.exports = router;
