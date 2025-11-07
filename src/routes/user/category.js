const express = require('express');
const router = express.Router();
const Category = require('../../controllers/user/category');

router.get('/categories', Category.getCategories);
router.get('/header/all-categories', Category.getAllHeaderCategories);
router.get('/categories/all', Category.getAllCategories);
router.get('/categories-slugs', Category.getCategoriesSlugs);
router.get('/categories/:slug', Category.getCategoryBySlug);

module.exports = router;
