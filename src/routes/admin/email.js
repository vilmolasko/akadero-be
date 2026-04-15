const express = require('express');
const router = express.Router();
const email = require('../../controllers/admin/email');
const verifyToken = require('../../middlewares/jwt');
const { getAdmin } = require('../../middlewares/getAdmin');

router.get('/admin/emails', verifyToken, getAdmin, email.getEmailsByAdmin);
router.get('/admin/emails/:id', verifyToken, getAdmin, email.getEmailByAdmin);
router.post(
  '/admin/emails/:id/reply',
  verifyToken,
  getAdmin,
  email.replyToEmailByAdmin,
);
router.delete(
  '/admin/emails/:id',
  verifyToken,
  getAdmin,
  email.deleteEmailByAdmin,
);

module.exports = router;
