const express = require('express');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const authValidation = require("../modules/auth/auth.validations")
const authController = require("../modules/auth/controllers")

const router = express.Router();

router.route('/renew-token  ').post(authController.refreshAuth)
router.route('/register-admin').post(validate(authValidation.registerAdmin), authController.registerAdmin)
router.route('/login-admin').post(validate(authValidation.loginAdmin), authController.loginAdmin)
router.route('/get-current-user').get(auth("adminAccess"), authController.getCurrentUser)



module.exports = router;