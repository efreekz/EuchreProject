const express = require('express');
const { createNews, updateNews, deleteNews, getAllNews } = require('../modules/news/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/create-news').post(auth('adminAccess'), createNews);
router.route('/update-news').post(auth('adminAccess'), updateNews);
router.route('/delete-news').post(auth('adminAccess'), deleteNews);
router.route('/get-all-news').get(getAllNews);

module.exports = router;