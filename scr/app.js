const express = require("express");
const path = require("path");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require('./config/config');
const RoomHandler = require('./utilities/gameTable/RoomHandler'); // Import the RoomHandler class
const TrumpBoxManager = require('./utilities/gameTable/trumpBoxManager'); // Import the RoomHandler class
const morgan = require('./config/morgan');
// authentication
const cron = require('node-cron');
const session = require('express-session');
const passport = require('passport');
const { jwtStrategy } = require('./config/jwtStrategy');

const { authLimiter } = require('./middlewares/rateLimiter');
const ApiError = require("./utilities/apiErrors");
// routes
const BotNameGenerator = require('./utilities/getRandomUserNameForBots')
const routes = require('./routes');
const { errorConverter, errorHandler } = require("./middlewares/error");

const app = express();
const http = require('http');
const ioClient = require('socket.io-client');
const server = http.createServer(app);
const { Server } = require('socket.io');
const PlayingRoom = require("./modules/playingroom/playingRoom.model");
const { default: mongoose } = require("mongoose");
const sendResponse = require("./utilities/responseHandler");
const { GameManager } = require("./utilities/gameTable/gamePlayFunctions");
const TrumpSelectionManager = require("./utilities/gameTable/TrumpSelectionManager");
const client = require('./utilities/redisClient');
const PlayAloneHandler = require("./utilities/gameTable/PlayAloneHandler");
const getRandomAlphabeticChars = require("./utilities/getRendomUserIdBOT");
const checkIsTimeOutTurn = require("./utilities/timerTable/checkIsTimeOutTurn");
const checkIsTurn = require("./utilities/gameTable/checkIsTrun");
const checkIsBotTurn = require("./utilities/botTable/checkisBotTurn");
const { getTimePlus30Seconds } = require("./utilities/timerTable/setTimer");
const { updateRoomRoleToBot, updateRoomRoleToUser, updateBotRoleInMainData, updateUserToBotInMainData } = require("./utilities/updateRoomRoleToBot");
const checkIsLastCardThrow = require("./utilities/checkIslastCard");
const checkTournamentStarted = require("./utilities/checkTournamentStarted");
const Tournament = require("./modules/tournament/tournament.model");
const GameDetails = require("./modules/games/games.model");
const TournamentSocketHandler = require("./utilities/TournamentSocketHandler");

const io = new Server(server, {
	cors: {
		origin: "*", // Change to your frontend URL for production
		methods: ["GET", "POST"],
		allowedHeaders: ["Authorization"],
		credentials: true
	}
});




if (config.env !== 'test') {
	app.use(morgan.successHandler);
	app.use(morgan.errorHandler);
}

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const corsOptions = {
	origin: "*", // Change to your frontend URL for production
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Authorization", "Content-Type"],
	credentials: true,
};
// enable cors
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Limit repeated failed requests to auth endpoints
if (config.env === 'production') {
	// Apply authLimiter middleware to authentication endpoints
	app.use('/v1/auth', authLimiter);
}

//Middleware
app.use(session({
	secret: process.env.JWT_SECRET || "nodeinitialsecretkey",
	resave: false,
	saveUninitialized: true,
}))

// User serialization and deserialization
passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

// Initialize Passport and use session middleware
app.use(passport.initialize());
app.use(passport.session());

// Register JWT authentication strategy
passport.use('jwt', jwtStrategy);

app.use('/v1', routes);
// app.use('/', (req, res) => {
// 	res.send('Server Started');
// });
// app.use('/', express.static(path.join(__dirname, 'Disk/Build')));
app.use('/', express.static(path.join(__dirname, 'Disk/Build'), {
	setHeaders: (res, filePath) => {
		if (filePath.endsWith('.gz')) {
			res.setHeader('Content-Encoding', 'gzip');
			res.setHeader('Content-Type', getContentType(filePath));
		}
	}
}));
app.use('/Build', express.static(path.join(__dirname, 'Disk/Build/Build')));
function getContentType(filePath) {
	if (filePath.endsWith('.wasm') || filePath.endsWith('.wasm.gz')) return 'application/wasm';
	if (filePath.endsWith('.js') || filePath.endsWith('.js.gz')) return 'application/javascript';
	if (filePath.endsWith('.data') || filePath.endsWith('.data.gz')) return 'application/octet-stream';
	if (filePath.endsWith('.html') || filePath.endsWith('.html.gz')) return 'text/html';
	if (filePath.endsWith('.css') || filePath.endsWith('.css.gz')) return 'text/css';
	if (filePath.endsWith('.json') || filePath.endsWith('.json.gz')) return 'application/json';
	if (filePath.endsWith('euchreBuild.loader')) return 'application/javascript'; // Handle custom file
	return 'text/plain';
}
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'Disk/Build/index.html'));
});
app.use((req, res, next) => {
	const error = new ApiError(httpStatus.NOT_FOUND, 'API Not Found');
	next(error); // Passes the error to the error-handling middleware
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);
const rooms = {};
let isTurnUpdated = false;
const playingRoom = [];
const botJoinedRoom = [];
let totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];


// const updatedRoom = {
// 	id: 123, name: "Sample Room", players: [
// 		{ userName: 'gaffar' }, { userName: 'tester' }]
// };

// const fun = async () => {
// 	// Store the initial data as JSON
// 	await client.json.set('roomIdgaffar', '$', updatedRoom);

// 	// Retrieve the data and log it
// 	const getData = await client.json.get('roomIdgaffar');
// 	console.log('Data before update:', getData);

// 	// Update the 'name' field
// 	await client.json.set('roomIdgaffar', '$.players[0].userName', 'Gaffar Shaikh');

// 	// Retrieve the updated data
// 	const updatedRedis = await client.json.get('roomIdgaffar');
// 	console.log('Data after update:', updatedRedis);
// 	await client.del('roomIdgaffar');
// 	const deleted = await client.json.get('roomIdgaffar');
// 	console.log('deleted:', deleted);
// };
// fun()


const onlineUsersByTournamentId = {
	tournamentId: ['userId']
}

io.on('connection', (socket) => {
	console.log('a user connected');

	const trumpBoxManager = new TrumpBoxManager(io, client);
	const roomHandler = new RoomHandler(io, socket, client);
	const trumpSelectionManager = new TrumpSelectionManager(io, client, socket);
	new PlayAloneHandler(io, socket);
	const tournamentHandler = new TournamentSocketHandler(io, socket, onlineUsersByTournamentId);

	socket.on('disconnect', async () => {
		try {
			let roomId = socket?.data?.roomId;
			let tournamentId = socket?.data?.tournamentId;
			let socketId = socket?.id;
			let userId = socket?.data?.UserId;
			console.log('user disconnected')
			if (roomId && socketId) {
				await updateRoomRoleToBot(roomId, socketId, client)
			} else if (tournamentId && userId) {
				tournamentHandler.disconnectTournament(tournamentId, userId)
			}
		} catch (error) {
			console.log('in disconnect', error)
		}

	});
	socket.on('cancelRoom', async (e) => {
		try {
			let data = e;


			if (typeof e === 'string') {
				data = JSON.parse(e);
			}

			if (typeof data === 'string') {
				data = JSON.parse(data);
			};

			if (!data?.roomId || !data?.userId) {
				throw new Error('Missing required fields: roomId or userId');
			}

			const findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(data?.roomId) });
			if (!findRoom) {
				console.log('Room not found:', data.roomId);
				return;
			}
			if (findRoom) {

				findRoom.players = findRoom?.players.filter(p => p?.UserId !== data?.userId);

				if (findRoom?.teamOne.length > 0) {
					findRoom.teamOne = findRoom?.teamOne.filter(p => p?.UserId !== data?.userId);
				}
				if (findRoom?.teamTwo.length > 0) {
					findRoom.teamTwo = findRoom?.teamTwo.filter(p => p?.UserId !== data?.userId);
				}
			}


			await findRoom.save();

			console.log(`User ${data.userId} removed from room ${data.roomId}`);

		} catch (error) {
			console.log('cancel room', error)
		}

	});
	socket.on('passTrumpBox', async (e) => {
		await trumpBoxManager.handlePassTrumpBox(socket, e);
	});

	socket.on('gamPlayed', async (e) => {
		try {
			let data = e;

			if (typeof e === 'string') {
				data = JSON.parse(e);
			}

			if (typeof data === 'string') {
				data = JSON.parse(data);
			}
			const roomId = data.roomId;
			const playedCard = {};


			if (roomId) {
				// playingRoom.push(roomId);
				let findedRoom = await client.json.get(roomId);
				let lastTrickUpdates = {};
				if (typeof findedRoom === 'string') {
					findedRoom = JSON.parse(findedRoom);
				}
				if (!findedRoom) {
					findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
				}
				// findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io);
				findedRoom = await updateUserToBotInMainData(roomId, findedRoom, client);

				if (findedRoom?.teamOne[0]?.isTurn == true && findedRoom?.teamOne[0]?.UserId == data?.userId) {
					findedRoom.teamOne[0].isTurn = false;
					let updatedCart = await Promise.all(findedRoom?.teamOne[0]?.cards.map((c) => {
						console.log('in map', c)
						if (c == 0) {
							return 0
						} else if (c != data?.card) {

							return c
						} else if (c == data?.card) {
							console.log("in card matched", c)
							// playedCard = { card: c, UserId: findedRoom?.teamOne[0]?.UserId }
							playedCard.card = c,
								playedCard.UserId = findedRoom?.teamOne[0]?.UserId
							return 0
						}
					}));

					if (!playedCard?.card) {
						updatedCart = await Promise.all(findedRoom?.teamOne[0]?.cards.map((c) => {
							console.log('in map', c)
							if (c == 0) {
								return 0
							} else if (c != data?.card) {

								return c
							} else if (c == data?.card) {
								console.log("in card matched", c)
								// playedCard = { card: c, UserId: findedRoom?.teamOne[0]?.UserId }
								playedCard.card = c,
									playedCard.UserId = findedRoom?.teamOne[0]?.UserId
								return 0
							}
						}));
						console.log('playedCard team one 0', findedRoom)
					}

					console.log('playedCard team one 0', data)
					findedRoom.teamOne[0].cards = updatedCart;
					findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];
					isTurnUpdated = true;
					const remaningCards = await findedRoom?.teamOne[0]?.cards.filter(c => c !== 0)
					let isPlayAlone = false
					isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);

					const cardPlayedUpdate = {
						card: playedCard?.card,
						userId: playedCard?.UserId,
						isPlayingAlone: isPlayAlone
					}
					console.log('CardPlayed', cardPlayedUpdate)
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });


					if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {
						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom?.teamTwo[0]?.isPartnerPlayingAlone) {
							findedRoom.teamOne[1].isTurn = true;

							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[1].timeOut = timeOut;
							findedRoom.teamOne[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom?.teamOne[1]?.UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0].card ? findedRoom?.playedCards[0].card : '',
								trumpSuit: findedRoom?.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId)
							}, 31000); // 40 seconds timer

							findedRoom = updatedRoom;

						} else {
							findedRoom.teamTwo[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[0].timeOut = timeOut;
							findedRoom.teamTwo[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom?.teamTwo[0]?.UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0].card ? findedRoom?.playedCards[0].card : '',
								trumpSuit: findedRoom?.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[0]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamTwo[0]?.UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}

					}
					if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length > 1) {
						let isDelay = true;
						findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
					}

				} else if (findedRoom?.teamTwo[0]?.isTurn == true && findedRoom?.teamTwo[0]?.UserId == data?.userId) {
					findedRoom.teamTwo[0].isTurn = false;

					let updatedCart = await Promise.all(findedRoom?.teamTwo[0]?.cards.map((c) => {
						console.log('in map', c)
						if (c == 0) {
							return 0
						} else if (c != data?.card) {
							return c
						} else if (c == data?.card) {
							console.log("in card matched", c)
							// playedCard = { card: c, UserId: findedRoom?.teamTwo[0]?.UserId }
							playedCard.UserId = findedRoom?.teamTwo[0]?.UserId;
							playedCard.card = c;
							return 0
						}
					}));
					if (!playedCard?.card) {
						updatedCart = await Promise.all(findedRoom?.teamTwo[0]?.cards.map((c) => {
							console.log('in map', c)
							if (c == 0) {
								return 0
							} else if (c != data?.card) {
								return c
							} else if (c == data?.card) {
								console.log("in card matched", c)
								// playedCard = { card: c, UserId: findedRoom?.teamTwo[0]?.UserId }
								playedCard.UserId = findedRoom?.teamTwo[0]?.UserId;
								playedCard.card = c;
								return 0
							}
						}));
						console.log('playedCard team two 0', findedRoom)
					}
					console.log('playedCard', data)
					findedRoom.teamTwo[0].cards = updatedCart;
					findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					const remaningCards = await findedRoom?.teamTwo[0]?.cards.filter(c => c !== 0)
					isTurnUpdated = true;

					let isPlayAlone = false
					isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);

					const cardPlayedUpdate = {
						card: playedCard?.card,
						userId: playedCard?.UserId,
						isPlayingAlone: isPlayAlone
					}
					console.log('CardPlayed', cardPlayedUpdate)
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

					if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {

						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom?.teamOne[1]?.isPartnerPlayingAlone) {
							findedRoom.teamTwo[1].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[1].timeOut = timeOut;
							findedRoom.teamTwo[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom?.teamTwo[1]?.UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0].card ? findedRoom?.playedCards[0].card : '',
								trumpSuit: findedRoom?.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamOne[1].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[1].timeOut = timeOut;
							findedRoom.teamOne[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamOne[1].UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
								trumpSuit: findedRoom?.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}

					}
					if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length > 1) {
						let isDelay = true;
						findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
					}


				} else if (findedRoom?.teamOne[1]?.isTurn == true && findedRoom?.teamOne[1]?.UserId == data?.userId) {
					findedRoom.teamOne[1].isTurn = false;

					let updatedCart = await Promise.all(findedRoom?.teamOne[1]?.cards.map((c) => {
						console.log('in map', c)
						if (c == 0) {
							return 0
						} else if (c !== data.card) {
							return c
						} else if (c == data?.card) {
							console.log("in card matched", c)
							// playedCard = { card: c, UserId: findedRoom?.teamOne[1]?.UserId };
							playedCard.UserId = findedRoom?.teamOne[1]?.UserId;
							playedCard.card = c;
							return 0
						}
					}));
					if (!playedCard?.card) {
						updatedCart = await Promise.all(findedRoom?.teamOne[1]?.cards.map((c) => {
							console.log('in map', c)
							if (c == 0) {
								return 0
							} else if (c !== data.card) {
								return c
							} else if (c == data?.card) {
								console.log("in card matched", c)
								// playedCard = { card: c, UserId: findedRoom?.teamOne[1]?.UserId };
								playedCard.UserId = findedRoom?.teamOne[1]?.UserId;
								playedCard.card = c;
								return 0
							}
						}));
						console.log('playedCard team one 1', findedRoom)
					}
					console.log('playedCard', data)
					findedRoom.teamOne[1].cards = updatedCart;
					findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					const remaningCards = await findedRoom?.teamOne[1]?.cards.filter(c => c !== 0)
					isTurnUpdated = true;
					let isPlayAlone = false
					isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);
					const cardPlayedUpdate = {
						card: playedCard?.card,
						userId: playedCard?.UserId,
						isPlayingAlone: isPlayAlone
					}
					console.log('CardPlayed', cardPlayedUpdate)
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

					if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {

						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom?.teamTwo[1]?.isPartnerPlayingAlone) {
							findedRoom.teamOne[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[0].timeOut = timeOut;
							findedRoom.teamOne[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom?.teamOne[0]?.UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamTwo[1].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[1].timeOut = timeOut;
							findedRoom.teamTwo[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom?.teamTwo[1]?.UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
								trumpSuit: findedRoom?.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}
					}
					if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length > 1) {
						let isDelay = true;
						findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
					}

				} else if (findedRoom?.teamTwo[1]?.isTurn == true && findedRoom?.teamTwo[1]?.UserId == data?.userId) {
					findedRoom.teamTwo[1].isTurn = false;

					let updatedCart = await Promise.all(findedRoom?.teamTwo[1]?.cards.map((c) => {
						console.log('in map', c)
						if (c == 0) {
							return 0
						} else if (c !== data.card) {
							return c
						} else if (c == data?.card) {
							console.log("in card matched", c)
							// playedCard = { card: c, UserId: findedRoom?.teamTwo[1]?.UserId }
							playedCard.UserId = findedRoom?.teamTwo[1]?.UserId;
							playedCard.card = c;
							return 0
						}
					}));
					if (!playedCard?.card) {
						updatedCart = await Promise.all(findedRoom?.teamTwo[1]?.cards.map((c) => {
							console.log('in map', c)
							if (c == 0) {
								return 0
							} else if (c !== data.card) {
								return c
							} else if (c == data?.card) {
								console.log("in card matched", c)
								// playedCard = { card: c, UserId: findedRoom?.teamTwo[1]?.UserId }
								playedCard.UserId = findedRoom?.teamTwo[1]?.UserId;
								playedCard.card = c;
								return 0
							}
						}));
						console.log('playedCard team tow 1', findedRoom)
					}
					console.log('playedCard', data)
					findedRoom.teamTwo[1].cards = updatedCart;
					findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					// findedRoom.teamTwo[1].isTurn = true;
					isTurnUpdated = true;
					const remaningCards = await findedRoom?.teamTwo[1]?.cards.filter(c => c !== 0)
					let isPlayAlone = false
					isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);

					const cardPlayedUpdate = {
						card: playedCard?.card,
						userId: playedCard?.UserId,
						isPlayingAlone: isPlayAlone
					}
					console.log('CardPlayed', cardPlayedUpdate)
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

					if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {

						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom?.teamOne[0]?.isPartnerPlayingAlone) {
							findedRoom.teamTwo[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[0].timeOut = timeOut;
							findedRoom.teamTwo[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom?.teamTwo[0]?.UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
								trumpSuit: findedRoom?.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[0]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamTwo[0]?.UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamOne[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[0].timeOut = timeOut;
							findedRoom.teamOne[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom?.teamOne[0]?.UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							await client.json.set(roomId, '$', findedRoom)
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}
					}
					if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length > 1) {
						let isDelay = true;
						findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
					}
				}

				isTurnUpdated = false;
				const clients = io.sockets.adapter.rooms.get(roomId);

				if (clients) {
					console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
				} else {
					console.log('No clients in the room');
				}
				// const index = playingRoom.indexOf(roomId);
				// if (index !== -1) {
				// 	playingRoom.splice(index, 1);
				// }



				if (lastTrickUpdates) {
					// io.to(roomId).emit('roundEndResult', { roundEndResult: lastTrickUpdates });
				}
				// io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
				lastTrickUpdates = {}
				const updateClient = await client.json.set(roomId, '$', findedRoom);
				if (updateClient != 'OK') {
					const updatedRoom = await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
						findedRoom,              // Update data
						{ new: true }                                  // Options
					);
				}


				if (findedRoom?.teamOnePoints && findedRoom?.teamOnePoints?.winningPoint >= 10) {
					findedRoom.teamOnePoints.isWinner = true;
					findedRoom.isStarted = false;
					findedRoom.status = 'complete';
					findedRoom.isWinner = 'teamOne';
					findedRoom.isGameEnd = true;
					await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },
						findedRoom,
						{ new: true }
					)

					// await client.del(roomId);
					const room = io.sockets.adapter.rooms.get(roomId);

					if (room) {
						// Iterate over each socket in the room
						for (const socketId of room) {
							const socket = io.sockets.sockets.get(socketId);
							if (socket) {
								// Disconnect the socket
								socket.leave(roomId);
								// socket.disconnect(true);
							}
						}
					}
					// await client.json.set(roomId, '$', findedRoom);
					await client.del(roomId);
					await client.del(`${roomId}roles`);
				}
				if (findedRoom?.teamTwoPoints && findedRoom?.teamTwoPoints?.winningPoint >= 10) {
					findedRoom.teamTwoPoints.isWinner = true;
					findedRoom.isStarted = false;
					findedRoom.status = 'complete';
					findedRoom.isWinner = 'teamTwo';
					findedRoom.isGameEnd = true;
					await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },
						findedRoom,
						{ new: true }
					);
					// await client.del(roomId);
					const room = io.sockets.adapter.rooms.get(roomId);

					if (room) {
						// Iterate over each socket in the room
						for (const socketId of room) {
							const socket = io.sockets.sockets.get(socketId);
							if (socket) {
								// Disconnect the socket
								socket.leave(roomId);
								// socket.disconnect(true);
							}
						}
					}
					// await client.json.set(roomId, '$', findedRoom);/
					await client.del(roomId);
					await client.del(`${roomId}roles`);
				}

				// const playedCardsTeamOne = findedRoom.teamOne.map((p) => {
				// 	const allZero = p.cards.every(card => card === 0);
				// 	return allZero;
				// });
				// const teamOneTrue = playedCardsTeamOne.every(c => c === true) ? true : false;
				// const playedCardsTeamTwo = findedRoom.teamTwo.map((p) => {
				// 	const allZero = p.cards.every(card => card === 0);
				// 	return allZero;
				// });
				// const teamTwoTrue = playedCardsTeamTwo.every(c => c === true) ? true : false;
				// if (teamOneTrue && teamTwoTrue) {
				// 	totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
				// }



			}
			// const index = playingRoom.indexOf(roomId);
			// if (index !== -1) {
			// 	playingRoom.splice(index, 1);
			// }
			console.log('game played success')

		} catch (error) {
			console.error('Error in shuffleCards:', error);
		}
	});
	socket.on('playWithPartner', async (e) => {
		let data = e;
		let action = 'Playing With Partner';
		let playAlone = 0

		if (typeof e === 'string') {
			data = JSON.parse(e);
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		const roomId = data.roomId;
		const userId = data.userId;
		let findedRoom = await client.json.get(roomId);
		if (typeof findedRoom === 'string') {
			findedRoom = JSON.parse(findedRoom);
		}
		if (typeof findedRoom === 'string') {
			findedRoom = JSON.parse(findedRoom);
		}
		if (!findedRoom) {
			findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
		}

		// findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io);

		io.to(roomId).emit('lastAction', { action, userId });
		let NotifyAloneOrTeam = {
			userId,
			playingStatus: playAlone,
			trumpSuit: findedRoom?.trumpSuit
		}
		io.to(roomId).emit('NotifyAloneOrTeam', { roomData: NotifyAloneOrTeam });
		findedRoom.isPlayAloneSelected = true;

		let isDelay = true;
		findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);

		const timeOut = await getTimePlus30Seconds();
		let isTurnData = await checkIsTurn(findedRoom?.teamOne, findedRoom?.teamTwo, 0, timeOut);
		findedRoom.teamOne = isTurnData?.teamOne;
		findedRoom.teamTwo = isTurnData?.teamTwo;
		let next = {
			nextTurnId: isTurnData.userId,
			isPlayingAlone: isTurnData.isPlayingAlone,
			timeOut, timerCount: 27,
			leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
			trumpSuit: findedRoom?.trumpSuit
		}
		io.to(roomId).emit('NextTurn', { roomData: next });
		await client.json.set(roomId, '$', findedRoom);
		let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
		// updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId);
		setTimeout(async () => {
			await checkIsTimeOutTurn(findedRoom, io, roomId, isTurnData?.userId)
		}, 31000); // 40 seconds timer
		await client.json.set(roomId, '$', updatedRoom);

	})

	socket.on('rejoinPlayingGame', async (e) => {
		let data = e;
		if (typeof e === 'string') {
			data = JSON.parse(e);
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		let socketId = socket.id;
		const roomId = data?.roomId;
		const userId = data?.userId;
		console.log('rejoin data', data)

		const updated = await updateRoomRoleToUser(userId, roomId, socketId, client, socket);

		if (updated === 'OK') {
			console.log('ok')

			// socket.join(roomId);
		} else {
			const updated = await updateRoomRoleToUser(userId, roomId, socketId, client, socket);
			if (updated === 'OK') {
				// socket.join(roomId);
				console.log('ok')
			}

		};

		io.to(roomId).emit('isRejoined', { roomData: { isJoined: updated === 'OK' ? true : false, userId, } });


	});

	socket.on('cancelMatchMaking', async (e) => {
		let data = e;

		if (typeof e === 'string') {
			data = JSON.parse(e);
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}

		const roomId = data?.roomId;
		console.log('cancel matchmaking event called', roomId);
		if(roomId){
			await PlayingRoom.findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(roomId), status: 'finding', roomType: 'public', isCanceled: false },
				{ $set: { isCanceled: true, status: 'canceled' } },
				{ new: true }
			);
		}

	});

	// socket.on('joinBot', async (e) => {
	// 	let data = e;

	// 	if (typeof e === 'string') {
	// 		data = JSON.parse(e);
	// 	}

	// 	if (typeof data === 'string') {
	// 		data = JSON.parse(data);
	// 	}
	// 	const userId = await getRandomAlphabeticChars();
	// 	const botNameManager = await new BotNameGenerator();
	// 	const userName = await botNameManager.getRandomBotName()
	// 	const socket = ioClient('http://localhost:3001');
	// 	const roomId = data?.roomId;
	// 	const findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId), status: 'finding' });

	// 	const playerObj = {
	// 		UserId: userId,
	// 		email: 'bot@gmail.com',
	// 		value: '',
	// 		role: 'bot',
	// 		userName: userName

	// 	};
	// 	if (findRoom && !botJoinedRoom.includes(roomId)) {
	// 		botJoinedRoom.push(roomId)

	// 		if (findRoom?.teamOne.length < 2) {
	// 			findRoom?.teamOne.push(playerObj);
	// 			findRoom?.players.push({ UserId: userId });
	// 			if (findRoom?.players.length == 4) {
	// 				findRoom.status = 'shuffling';
	// 				await findRoom.save();
	// 				const index = botJoinedRoom.indexOf(roomId);
	// 				if (index !== -1) {
	// 					botJoinedRoom.splice(index, 1);
	// 				}
	// 				await socket.emit('joinedRoom', { roomId, userId });
	// 			} else {
	// 				await findRoom.save();
	// 				const index = botJoinedRoom.indexOf(roomId);
	// 				if (index !== -1) {
	// 					botJoinedRoom.splice(index, 1);
	// 				}
	// 				await socket.emit('joinedRoom', { roomId, userId });
	// 			}


	// 		} else if (findRoom?.teamTwo.length < 2) {
	// 			findRoom?.teamTwo.push(playerObj);
	// 			findRoom?.players.push({ UserId: userId });
	// 			if (findRoom?.players.length == 4) {
	// 				findRoom.status = 'shuffling';
	// 				await findRoom.save();
	// 				const index = botJoinedRoom.indexOf(roomId);
	// 				if (index !== -1) {
	// 					botJoinedRoom.splice(index, 1);
	// 				}
	// 				await socket.emit('joinedRoom', { roomId, userId });
	// 			} else {
	// 				await findRoom.save();
	// 				const index = botJoinedRoom.indexOf(roomId);
	// 				if (index !== -1) {
	// 					botJoinedRoom.splice(index, 1);
	// 				}
	// 				await socket.emit('joinedRoom', { roomId, userId });

	// 			}

	// 		}

	// 		const index = botJoinedRoom.indexOf(roomId);
	// 		if (index !== -1) {
	// 			botJoinedRoom.splice(index, 1);
	// 		}
	// 	}
	// })
});




cron.schedule('*/1 * * * *', async () => {
	console.log('Running task every 5 minutes');
	await checkTournamentStarted()
	// Your task logic goes here
});



module.exports = { app, server };