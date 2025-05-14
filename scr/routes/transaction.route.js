const express = require('express');
const { createTransaction,getAdminsTransations, getTransactionByUserId, getAllTransactions } = require('../modules/transactions/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/get-user-transactions').get(authenticate, getTransactionByUserId);
router.route('/get-all-transactions').get(getAllTransactions);
router.route('/create-transaction').post(authenticate, createTransaction);
router.route('/get-admin-transactions').post(auth('adminAccess'), getAdminsTransations);


module.exports = router;