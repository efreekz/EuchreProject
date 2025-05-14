const express = require('express');
const { createRoomandUpdate, checkRoomStatus, getAllRoomDetails,
    createPrivateRoom, getAllPrivateRoom, joinPrivateRoom,
    getMatchmakingHistory } = require('../modules/playingroom/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/create-update').post(authenticate, createRoomandUpdate);
router.route('/join-private-room').post(authenticate, joinPrivateRoom);
router.route('/create-private-room').post(auth("adminAccess"), createPrivateRoom);
router.route('/check-room-status').get(authenticate, checkRoomStatus);
router.route('/get-all-room-details').get(getAllRoomDetails);
router.route('/get-all-private-room').get(getAllPrivateRoom);
router.route('/get-matchmaking-history').get(authenticate, getMatchmakingHistory);
// router.route('/get-matchmaking-history-admin').get(auth("adminAccess"), getAllPrivateRoom);

module.exports = router;