const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const PlayingRoom = require('../../playingroom/playingRoom.model');
const Wallet = require('../../wallet/wallet.model');
const mongoose = require('mongoose');
const GameDetails = require('../../games/games.model');
const Tournament = require('../tournament.model');
const delay = require('../../../utilities/gameTable/delay');
const lastCallTournament = new Map(); // In-memory store for user call times
let tournamentCalledCount = 0; // In-memory store for user call times
const joinTournamentRoom = async ({ user, body }) => {
    try {

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (lastCallTournament.has(body?.id)) {
            const lastCallTime = lastCallTournament.get(body?.id);

            if (currentTime - lastCallTime >= 2) {
                tournamentCalledCount = 0
                lastCallTournament.set(body?.id, currentTime); // Update last call time
            } else {
                // Reject the API call
                if (tournamentCalledCount === 0) {
                    await delay(1000);
                    tournamentCalledCount = 1
                } else if (tournamentCalledCount === 1) {
                    await delay(1500);
                    tournamentCalledCount = 2
                } else if (tournamentCalledCount === 2) {
                    await delay(2100);
                    tournamentCalledCount = 0
                }
            }
        } else {
            lastCallTournament.set(body?.id, currentTime);
        }

        if (!user?.token?.UserId || !body?.id) {
            return { msg: "Invalid request parameters.", status: false, code: 400 };
        }

        const tournamentId = new mongoose.Types.ObjectId(body.id);
        const findTournament = await Tournament.findOne({ _id: tournamentId, status: "playing" });

        if (!findTournament) {
            return { msg: "Tournament not found.", status: false, code: 404 };
        }

        const gameDetails = findTournament?.gameId
            ? await GameDetails.findById(new mongoose.Types.ObjectId(findTournament?.gameId))
            : null;

        let isPlayer = false;
        if (findTournament?.registeredUsers) {
            console.log(findTournament?.registeredUsers);
            console.log('user.token.UserId', user.token.UserId);
            const currentUser = findTournament.registeredUsers.find(
                (u) => u?.descopeId && user?.token?.UserId && u.descopeId === user.token.UserId
            );

            if (!currentUser) {
                return {
                    msg: "You are not a registered player for this tournament.",
                    status: false,
                    code: 400
                };
            }

            if (currentUser?.lost) {
                return { msg: "You have already played in this tournament and lost.", status: false, code: 400 };
            }

            currentUser.status = 'joined';
        }


        const entryFees = gameDetails?.entry || 500;

        const findedUser = await User.findOne({ descopeId: user?.token?.UserId });
        if (!findedUser) {
            return { msg: "User not found.", status: false, code: 404 };
        }

        // const walletDetails = await Wallet.findOne({ descopeId: user?.token?.UserId });
        // if (!walletDetails || walletDetails.balance < entryFees) {
        //     return { msg: "Insufficient balance to join.", status: false, code: 400 };
        // }

        let findRoom = await PlayingRoom.findOne({
            status: 'finding',
            roomType: 'tournament',
            gameId: new mongoose.Types.ObjectId(findTournament.gameId),
            tournamentId:new mongoose.Types.ObjectId(body?.id)
        }).sort({ _id: -1 });

        let isAlreadyJoinedPlayer = false;
        if (findRoom && findRoom.players) {
            for (let i = 0; i < findRoom.players.length; i++) {
                if (findRoom.players[i].UserId === user.token.UserId) {
                    isAlreadyJoinedPlayer = true;
                    break;
                }
            }

            if (isAlreadyJoinedPlayer) {
                return { msg: "You are in this room already", status: false, code: 400 };
            }
        }

        const currentTimeUTC = new Date();
        const addedTime = findRoom?.dateOfCreation
            ? new Date(new Date(findRoom.dateOfCreation).getTime() + 20 * 60 * 1000)
            : null;

        const playerObj = {
            UserId: user.token.UserId,
            email: findedUser.email,
            value: '',
            role: findedUser.role,
            userName: findedUser.userName,
            paid: true,
            paidAmount: entryFees
        };

        if (findRoom) {
            if (findRoom.teamOne.length < 2) {
                findRoom.teamOne.push(playerObj);
            } else if (findRoom.teamTwo.length < 2) {
                findRoom.teamTwo.push(playerObj);
            } else {
                return { msg: "No available slots in the room.", status: false, code: 400 };
            }

            findRoom.players.push({ UserId: user.token.UserId });
            await findRoom.save();

            if (findRoom.players.length === 4) {
                findRoom.status = 'shuffling';
                await findRoom.save();
                lastCallTournament.delete(body?.id);
                return { msg: "Room started.", status: true, code: 200, data: findRoom };
            }

            return { msg: "Room joined.", status: true, code: 201, data: findRoom };
        } else {
            const newRoom = await PlayingRoom.create({
                teamOne: [playerObj],
                players: [{ UserId: user.token.UserId }],
                createrUserId: user.token.UserId,
                gameId: new mongoose.Types.ObjectId(findTournament.gameId),
                dateOfCreation: new Date().toISOString(),
                roomType: 'tournament',
                tournamentId: new mongoose.Types.ObjectId(findTournament?._id)
            });

            if (newRoom) {
                return { msg: "Room joined.", status: true, code: 201, data: newRoom };
            } else {
                return { msg: "Error creating room.", status: false, code: 500 };
            }
        }
    } catch (error) {
        console.error(error);
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = joinTournamentRoom;
