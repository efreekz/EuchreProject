const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const PlayingRoom = require('../playingRoom.model');
const Wallet = require('../../wallet/wallet.model');
const { default: mongoose } = require('mongoose');
const GameDetails = require('../../games/games.model');
const delay = require('../../../utilities/gameTable/delay');

let lastCallCount = 0; // In-memory store for user call times
const lastCallTimePrivateRoom = new Map(); // In-memory store for user call times
const joinPrivateRoom = async ({ user, body }) => {
    try {
        let gameDetails;
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (lastCallTimePrivateRoom.has(body?.roomId)) {
            const lastCallTime = lastCallTimePrivateRoom.get(body?.roomId);

            if (currentTime - lastCallTime >= 2) {
                lastCallCount = 0;
                lastCallTimePrivateRoom.set(body?.roomId, currentTime); // Update last call time
            } else {
                // Reject the API call
                if (lastCallCount === 0) {
                    await delay(1000);
                    lastCallCount = 1
                } else if (lastCallCount === 1) {
                    await delay(1500);
                    lastCallCount = 2
                } else if (lastCallCount === 2) {
                    await delay(2100);
                    lastCallCount = 0
                }
            }
        } else {
            lastCallTimePrivateRoom.set(body?.roomId, currentTime);
        }
        if (body.gameId) {
            gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(body.gameId) })
        }

        if (body?.passKey && body?.roomId) {
            const findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(body?.roomId), status: 'playing', roomType: 'private', passKey: body?.passKey });
            if (findRoom) {
                return { msg: "Room is full", status: false, code: 400 }
            }
        }
        if (body?.passKey && body?.roomId) {
            const findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(body?.roomId), status: 'shuffling', roomType: 'private', passKey: body?.passKey });
            if (findRoom) {
                return { msg: "Room is full", status: false, code: 400 }
            }
        }
        if (body?.passKey && body?.roomId) {
            const findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(body?.roomId), status: 'finding', roomType: 'private', passKey: body?.passKey });
            if (!findRoom) {
                return { msg: "Incorrect Password", status: false, code: 400 }
            }
        }

        console.log("USER: ", user);
        const entryFees = gameDetails?.entry ? gameDetails?.entry : 500


        if (user.token.UserId != null || user.token.UserId != '') {
            const findedUser = await User.findOne({ descopeId: user.token.UserId });
            const walletDetails = await Wallet.findOne({ descopeId: user.token.UserId })
            if (walletDetails && walletDetails.balance < entryFees) {
                return { msg: "Insufficient balance for Join", status: false, code: 400 }
            }
            if (findedUser) {

                // if (findedUser && user.token.UserId) {
                //     const userId = user.token.UserId;

                //     // const alreadyJoinedRoom = await PlayingRoom.aggregate([
                //     //     {
                //     //         $match: {
                //     //             status: { $in: ['playing', 'finding'] },
                //     //             players: {
                //     //                 $elemMatch: { UserId: userId }
                //     //             }
                //     //         }
                //     //     }

                //     // ]);
                //     // if (alreadyJoinedRoom.length > 0) {
                //     // 	console.log(alreadyJoinedRoom[0]._id.toString())
                //     // 	const roomId = alreadyJoinedRoom[0]._id.toString();
                //     // 	let redisData = await client.json.get(roomId);
                //     // 	if(redisData){
                //     // 		console.log('alresdy joined room', redisData)
                //     // 		return { msg: "User Already Playing Other Game Please rejoin the user.", status: false, code: 400, data: redisData };
                //     // 	}else{
                //     // 		console.log('alresdy joined room', alreadyJoinedRoom[0])
                //     // 		return { msg: "User Already Playing Other Game Please rejoin the user.", status: false, code: 400, data: alreadyJoinedRoom[0] };
                //     // 	}
                //     // }
                // }
                const findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(body?.roomId), status: 'finding', roomType: 'private', passKey: body?.passKey });


                const playerObj = {
                    UserId: user.token.UserId,
                    email: findedUser.email,
                    value: '',
                    role: findedUser.role,
                    userName: findedUser.userName

                };
                if (findRoom) {

                    if (findRoom?.teamOne.length < 2) {
                        findRoom?.teamOne.push(playerObj);
                        findRoom?.players.push({ UserId: user.token.UserId });
                        findRoom.save();
                        if (findRoom?.players.length == 4) {
                            findRoom.status = 'shuffling';
                            lastCallTimePrivateRoom.delete(body?.roomId);
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
                            lastCallTimePrivateRoom.delete(body?.roomId);
                            return { msg: "Room Started.", status: true, code: 200, data: findRoom };
                        } else {
                            return { msg: "Room Joined.", status: true, code: 201, data: findRoom };
                        }
                    }
                } else {
                    // const playerObj = [{
                    // 	UserId: user.token.UserId,
                    // 	value: '',
                    // 	email: findedUser.email,
                    // 	role: findedUser.role,
                    // 	userName: findedUser.userName
                    // }];
                    // const player = { UserId: user.token.UserId };
                    // const createRoom = await PlayingRoom.create({ teamOne: playerObj, players: player, createrUserId: user.token.UserId, gameId: new mongoose.Types.ObjectId(body.gameId) });
                    // if (createRoom) {
                    return { msg: "Room not matching.", status: false, code: 400, data: null };

                    // }

                }

            } else {
                console.log("400 else")
                return { msg: "User Not Found", status: false, code: 400 }
            }

        }




    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = joinPrivateRoom;