const express = require('express');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const storeController = require("../modules/types/controller")

const router = express.Router();


router.route('/addtype').post(auth(), storeController.addType)




module.exports = router;