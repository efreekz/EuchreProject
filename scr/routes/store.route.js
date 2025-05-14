const express = require('express');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const storeController = require("../modules/store/controller")

const router = express.Router();


router.route('/addPackage').post(auth(), storeController.addPackages)
router.route('/getStoreDataByType/:type').get(storeController.getStoreDataByType)




module.exports = router;