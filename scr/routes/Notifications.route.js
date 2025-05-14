const express = require('express');
const { createNotification, getUserNotification } = require('../modules/notifications/controllers');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/create').post(authenticate, createNotification);
router.route('/get-notifications').get(authenticate, getUserNotification);
// router.route('/join-private-room').post(authenticate, joinPrivateRoom);
// router.route('/create-private-room').post(auth("adminAccess"), createPrivateRoom);
// router.route('/check-room-status').get(authenticate, checkRoomStatus);
// router.route('/get-all-room-details').get(getAllRoomDetails);
// router.route('/get-all-private-room').get(getAllPrivateRoom);
// router.route('/get-matchmaking-history').get(authenticate, getMatchmakingHistory);
// router.route('/get-matchmaking-history-admin').get(auth("adminAccess"), getAllPrivateRoom);

module.exports = router;