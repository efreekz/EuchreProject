const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const PlayingRoom = require('../playingRoom.model');
const Wallet = require('../../wallet/wallet.model');
const { default: mongoose } = require('mongoose');
const GameDetails = require('../../games/games.model');
const BotJoiner = require('../../../utilities/joinBot');
const delay = require('../../../utilities/gameTable/delay');
let lastCallTime = 0; // In-memory store for user call times

const createRoomandUPdate = async ({ user, body }) => {
	try {
		let gameDetails;
		const roomHandler = async () => {
			if (body.gameId) {
				gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(body.gameId) })
			}

			const entryFees = gameDetails?.entry ? gameDetails?.entry : 500


			if (user.token.UserId != null || user.token.UserId != '') {
				const findedUser = await User.findOne({ descopeId: user.token.UserId });
				const walletDetails = await Wallet.findOne({ descopeId: user.token.UserId })
				if (walletDetails && walletDetails.balance < entryFees) {
					return { msg: "Insufficient balance for Join", status: false, code: 400 }
				}
				if (findedUser) {

					if (findedUser && user.token.UserId) {
						// const userId = user.token.UserId;

						// const alreadyJoinedRoom = await PlayingRoom.aggregate([
						// 	{
						// 		$match: {
						// 			status: { $in: ['playing', 'finding'] },
						// 			players: {
						// 				$elemMatch: { UserId: userId }
						// 			}
						// 		}
						// 	}

						// ]);
						// if (alreadyJoinedRoom.length > 0) {
						// 	console.log(alreadyJoinedRoom[0]._id.toString())
						// 	const roomId = alreadyJoinedRoom[0]._id.toString();
						// 	let redisData = await client.json.get(roomId);
						// 	if(redisData){
						// 		console.log('alresdy joined room', redisData)
						// 		return { msg: "User Already Playing Other Game Please rejoin the user.", status: false, code: 400, data: redisData };
						// 	}else{
						// 		console.log('alresdy joined room', alreadyJoinedRoom[0])
						// 		return { msg: "User Already Playing Other Game Please rejoin the user.", status: false, code: 400, data: alreadyJoinedRoom[0] };
						// 	}
						// }
					}
					let findRoom = await PlayingRoom.findOne({ status: 'finding', roomType: 'public', isCanceled: false, gameId: new mongoose.Types.ObjectId(body.gameId) }).sort({ _id: 1 });;

					let dateOfCreation;
					let currentTime
					let addedTime
					let currentTimeUTC
					if (findRoom && findRoom?.dateOfCreation) {
						dateOfCreation = new Date(findRoom.dateOfCreation); // Convert dateOfCreation to Date object
						currentTime = new Date(); // Get current time
						currentTimeUTC = new Date(currentTime.toISOString()); // Convert local time to UTC
						addedTime = new Date(dateOfCreation.getTime() + 19 * 1000);
					}

					const playerObj = {
						UserId: user.token.UserId,
						email: findedUser.email,
						value: '',
						role: findedUser.role,
						userName: findedUser.userName

					};

					if (findRoom && addedTime > currentTimeUTC) {

						if (findRoom?.teamOne.length < 2) {
							findRoom?.teamOne.push(playerObj);
							findRoom?.players.push({ UserId: user.token.UserId });
							findRoom.save();
							if (findRoom?.players.length == 4) {
								findRoom.status = 'shuffling';
								return { msg: "Room Started.", status: true, code: 200, data: findRoom };
							} else {
								return { msg: "Room Joined.", status: true, code: 201, data: findRoom };
							}

						} else if (findRoom?.teamTwo.length < 2) {
							findRoom?.teamTwo.push(playerObj);
							findRoom?.players.push({ UserId: user.token.UserId });
							findRoom.save();
							if (findRoom?.players.length == 4) {
								findRoom.status = 'shuffling';
								return { msg: "Room Started.", status: true, code: 200, data: findRoom };
							} else {
								return { msg: "Room Joined.", status: true, code: 201, data: findRoom };
							}
						}
					} else {
						if (findRoom) {
							findRoom.isCanceled = true;
							await findRoom.save();
						}
						const playerObj = [{
							UserId: user.token.UserId,
							value: '',
							email: findedUser.email,
							role: findedUser.role,
							userName: findedUser.userName
						}];
						const player = { UserId: user.token.UserId };
						const dateOfCreation = new Date();
						const createRoom = await PlayingRoom.create({ teamOne: playerObj, players: player, createrUserId: user.token.UserId, gameId: new mongoose.Types.ObjectId(body.gameId), dateOfCreation: dateOfCreation.toISOString() });
						if (createRoom) {
							// setTimeout(async () => {
							// 	const Joiner = new BotJoiner(createRoom?._id);
							// 	await Joiner?.joinRoom();
							// }, 8000); // 40 seconds timer
							setTimeout(async () => {
								let findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(createRoom?._id), status: 'finding', roomType: 'public', isCanceled: false });;
								if (findRoom?.players.length === 4) {
									return false; // No need to save if players are already 4
								}
								const remaningPlayers = 4 - findRoom?.players.length;
								for (let i = 0; i < remaningPlayers; i++) {
									const Joiner = new BotJoiner(createRoom?._id);
									await delay(500)
									await Joiner?.joinRoom();
								}
							}, 20000); // 40 seconds timer
							return { msg: "Room Joined.", status: true, code: 201, data: createRoom };

						}

					}

				} else {
					return { msg: "User Not Found", status: false, code: 400 }
				}

			}
		}
		const createNew = async () => {
			if (body.gameId) {
				gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(body.gameId) })
			}

			const entryFees = gameDetails?.entry ? gameDetails?.entry : 500


			if (user.token.UserId != null || user.token.UserId != '') {
				const findedUser = await User.findOne({ descopeId: user.token.UserId });
				const walletDetails = await Wallet.findOne({ descopeId: user.token.UserId })
				if (walletDetails && walletDetails?.balance < entryFees) {
					return { msg: "Insufficient balance for Join", status: false, code: 400 }
				}
				if (findedUser) {
					const playerObj = [{
						UserId: user.token.UserId,
						value: '',
						email: findedUser.email,
						role: findedUser.role,
						userName: findedUser.userName
					}];
					const player = { UserId: user.token.UserId };
					const dateOfCreation = new Date();
					const createRoom = await PlayingRoom.create({ teamOne: playerObj, players: player, createrUserId: user.token.UserId, gameId: new mongoose.Types.ObjectId(body.gameId), dateOfCreation: dateOfCreation.toISOString() });
					if (createRoom) {
						// setTimeout(async () => {
						// 	const Joiner = new BotJoiner(createRoom?._id);
						// 	await Joiner?.joinRoom();
						// }, 8000); // 40 seconds timer
						setTimeout(async () => {
							let findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(createRoom?._id), status: 'finding', roomType: 'public', isCanceled: false });;
							if (findRoom?.players.length === 4) {
								return false; // No need to save if players are already 4
							}
							const remaningPlayers = 4 - findRoom?.players.length;
							for (let i = 0; i < remaningPlayers; i++) {
								const Joiner = new BotJoiner(createRoom?._id);
								await delay(500)
								await Joiner?.joinRoom();
							}
						}, 20000); // 40 seconds timer
						return { msg: "Room Joined.", status: true, code: 201, data: createRoom };

					}



				} else {
					return { msg: "User Not Found", status: false, code: 400 }
				}

			}
		}

		const currentTimeInSecond = Math.floor(Date.now() / 1000);

		// if (lastCallTimes.has(user.token.UserId)) {
		// const lastCallTime = lastCallTimes.get(user.token.UserId);

		// Check if the difference is even
		if (currentTimeInSecond - lastCallTime >= 2) {
			// Process the API call
			lastCallTime = currentTimeInSecond;
			return await roomHandler();
			// return res.status(200).json({ message: "API processed successfully." });
		} else {
			// Reject the API call
			console.log('in reject api')
			return await createNew();
			// return res.status(429).json({ message: "API can only be called on even intervals." });
		}
		// } else {
		// 	console.log('continuew in else', lastCallTimes)
		// 	// First call, process and store the current time
		// 	lastCallTimes.set(user.token.UserId, currentTimeInSecond);
		// 	return await roomHandler();
		// 	// return res.status(200).json({ message: "API processed successfully." });
		// }







	} catch (error) {
		return { msg: error.message, status: false, code: 500 };
	}
};

module.exports = createRoomandUPdate;