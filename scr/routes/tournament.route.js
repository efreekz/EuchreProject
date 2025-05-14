const express = require('express');
const tournamentController = require('../modules/tournament/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/register-tournament').post(authenticate, tournamentController?.joinTournament);
router.route('/join-tournament-room').post(authenticate, tournamentController?.joinTournamentRoom);

router.route('/create').post(auth('adminAccess'), tournamentController?.createTournament);
// router.route('/get-admin-wallet').post(auth('adminAccess'), getAdminWallet);
// router.route('/add-coin-in-admin').post(auth('adminAccess'), addBalanceInAdminWallet);


router.route('/get-all').get(tournamentController?.getAllTournaments);
router.route('/get-all-for-admin').get(auth('adminAccess'), tournamentController?.getAllTournamentsAdmin);

module.exports = router;