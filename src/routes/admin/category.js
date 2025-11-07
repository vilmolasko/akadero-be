const express = require('express');
const router = express.Router();
const Category = require('../../controllers/admin/category');

const verifyToken = require('../../middlewares/jwt');
const { getAdmin } = require('../../middlewares/getAdmin');

router.post(
  '/admin/categories',
  verifyToken,
  getAdmin,
  Category.createCategoryByAdmin
);
router.get(
  '/admin/categories',
  verifyToken,
  getAdmin,
  Category.getCategoriesByAdmin
);
router.get(
  '/admin/categories/:slug',
  verifyToken,
  getAdmin,
  Category.getCategoryBySlugByAdmin
);
router.put(
  '/admin/categories/:slug',
  verifyToken,
  getAdmin,
  Category.updateCategoryBySlugByAdmin
);
router.delete(
  '/admin/categories/:slug',
  verifyToken,
  getAdmin,
  Category.deleteCategoryBySlugByAdmin
);
router.get('/admin/categories/all', Category.getAllCategoriesByAdmin);

module.exports = router;
