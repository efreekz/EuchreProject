const express = require('express');
const multer = require('multer');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const settingsController = require("../modules/settings/controllers");

const router = express.Router();

// Set up Multer storage configuration (for processing the file upload)
const storage = multer.memoryStorage(); // Store file in memory to upload directly to MinIO
const upload = multer({ storage: storage }); // Create multer instance with memory storage

// Your routes
router.route('/upload-img').post(upload.single('file'), settingsController?.uploadImg);
router.route('/add-update-settings').post(auth("adminAccess"), settingsController?.addUpdateSettings);
router.route('/get-dashboard').get(auth("adminAccess"), settingsController?.getDashboard);
router.route('/get-settings').get(settingsController?.getSettings);

module.exports = router;
