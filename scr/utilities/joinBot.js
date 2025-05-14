const ioClient = require('socket.io-client');
const getRandomAlphabeticChars = require('./getRendomUserIdBOT');
const BotNameGenerator = require('./getRandomUserNameForBots');
const PlayingRoom = require('../modules/playingroom/playingRoom.model');
const mongoose = require('mongoose');

class BotJoiner {
    constructor(roomId) {
        this.roomId = roomId;
        this.socket = ioClient('http://localhost:3001');
    }

    async generatePlayer() {
        const userId = await getRandomAlphabeticChars();
        const botNameManager = new BotNameGenerator();
        const userName = await botNameManager?.getRandomBotName();

        return {
            UserId: userId,
            email: 'bot@gmail.com',
            value: '',
            role: 'bot',
            userName: userName
        };
    }

    async findRoom() {
        return await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(this.roomId), status: 'finding', isCanceled: false });
    }

    async checkAndUpdateRoom(findRoom, playerObj) {
        if (findRoom?.players.length === 4) {
            return false; // No need to save if players are already 4
        }

        if (findRoom?.teamOne.length < 2) {
            findRoom.teamOne.push(playerObj);
        } else if (findRoom?.teamTwo.length < 2) {
            findRoom.teamTwo.push(playerObj);
        }

        findRoom.players.push({ UserId: playerObj?.UserId });

        if (findRoom?.players?.length === 4) {
            findRoom.status = 'shuffling';
        }
        const checkIsUpdated = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(this.roomId), status: 'finding' });
        if (checkIsUpdated?.players.length === 4) {
            return false; // No need to save if players are already 4
        }
        await findRoom.save();
        return true;
    }

    async joinRoom() {
        const playerObj = await this.generatePlayer();
        const findRoom = await this.findRoom();

        if (findRoom) {
            const updated = await this.checkAndUpdateRoom(findRoom, playerObj);
            if (updated) {
                await this.socket.emit('joinedRoom', { roomId: this.roomId, userId: playerObj?.UserId });
            }
        }
    }
}

module.exports = BotJoiner;
// module.exports = async (roomId) => {
//     const botJoiner = new BotJoiner(roomId);
//     await botJoiner.joinRoom();
// };
