const express = require('express');
const authRoutes = require("./auth.route")
const userRoutes = require("./user.route")
const playingRoomRoutes = require("./playingRoom.route")
const levelRoutes = require("./game.route")
const storeRoutes = require("./store.route")
const walletRoutes = require("./wallet.route")
const typeRoutes = require("./types.route")
const Transaction = require("./transaction.route")
const News = require("./news.route")
const Settings = require("./settings.route")
const tournamentRoutes = require("./tournament.route")
const Notifications = require("./Notifications.route")
const router = express.Router();

const defaultRoutes = [
	{
		path: '/auth',
		route: authRoutes,
	},
	{
		path: '/user',
		route: userRoutes,
	},
	{
		path: '/playing-room',
		route: playingRoomRoutes,
	},
	{
		path: '/tournament',
		route: tournamentRoutes,
	},
	{
		path: '/game',
		route: levelRoutes,
	},
	{
		path: '/type',
		route: typeRoutes,
	},
	{
		path: '/store',
		route: storeRoutes,
	},
	{
		path: '/wallet',
		route: walletRoutes,
	},
	{
		path: '/transaction',
		route: Transaction,
	},
	{
		path: '/news',
		route: News,
	},
	{
		path: '/notifications',
		route: Notifications,
	},
	{
		path: '/setting',
		route: Settings,
	},
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

module.exports = router;