const express = require('express');
const { addBalanceInWallet, getWalletBalanceByUserId, getAdminWallet, addBalanceFromAdmin, addBalanceInAdminWallet } = require('../modules/wallet/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/add-claim-coin').post(authenticate, addBalanceInWallet);


router.route('/add-coin').post(auth('adminAccess'), addBalanceFromAdmin);
router.route('/get-admin-wallet').post(auth('adminAccess'), getAdminWallet);
router.route('/add-coin-in-admin').post(auth('adminAccess'), addBalanceInAdminWallet);


router.route('/get-user-wallet').get(authenticate, getWalletBalanceByUserId);

module.exports = router;