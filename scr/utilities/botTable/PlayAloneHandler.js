const mongoose = require('mongoose');
const client = require('../redisClient');  // Adjust the path to your Redis client as needed
const PlayingRoom = require('../../modules/playingroom/playingRoom.model');
const checkIsTurn = require('./checkIsTrun');
const { getTimePlus30Seconds } = require('../timerTable/setTimer');
const checkIsTimeOutTurn = require('../timerTable/checkIsTimeOutTurn');
const checkIsBotTurn = require('./checkisBotTurn');
const { addTimePlayersIsTurn } = require('../timerTable/addTimeInPlayers');
const checkIsLastCardThrow = require('../checkIslastCard');
const { updateBotRoleInMainData } = require('../updateRoomRoleToBot');

class PlayAloneHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    this.socket.on('playAlone', this.handlePlayAlone.bind(this));
  }

  async handlePlayAlone(e) {
    let data = typeof e === 'string' ? JSON.parse(e) : e;
    data = typeof data === 'string' ? JSON.parse(data) : data;
    let playAlone = 1;
    const action = 'Play Alone';
    const roomId = data.roomId;
    const userId = data.userId;

    let findedRoom = await this.getRoomData(roomId);

    if (!findedRoom) {
      findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
    }

    if (findedRoom) {
      this.updateRoomState(findedRoom, userId);


      let NotifyAloneOrTeam = {
        userId,
        playingStatus: playAlone,
        trumpSuit: findedRoom.trumpSuit
      }

      const timeOut = await getTimePlus30Seconds();
      let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo, 0, timeOut);
      let next = {
        nextTurnId: isTurnData.userId,
        isPlayingAlone: isTurnData.isPlayingAlone,
        timeOut, timerCount: 30,
        leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
        trumpSuit: findedRoom.trumpSuit

      };
      findedRoom.teamOne = isTurnData.teamOne
      findedRoom.teamTwo = isTurnData.teamTwo
      this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
      this.io.to(roomId).emit('NotifyAloneOrTeam', { roomData: NotifyAloneOrTeam });
      this.io.to(roomId).emit('lastAction', { action, userId });
      this.io.to(roomId).emit('NextTurn', { roomData: next });
      const addedTimeOut = await addTimePlayersIsTurn(findedRoom.teamOne, findedRoom.teamTwo, isTurnData.userId, timeOut)
      findedRoom.teamOne = addedTimeOut.teamOne;
      findedRoom.teamTwo = addedTimeOut.teamTwo;
      let updateClient = await client.json.set(roomId, '$', findedRoom);
      findedRoom = await checkIsBotTurn(findedRoom, this.io, roomId);
      findedRoom = await checkIsLastCardThrow(findedRoom, this.io, roomId, isTurnData.userId);
      updateClient = await client.json.set(roomId, '$', findedRoom);

      setTimeout(async () => {
        await checkIsTimeOutTurn(findedRoom, this.io, roomId, isTurnData.userId)
      }, 31000); // 40 seconds timer
      if (updateClient !== 'OK') {
        await PlayingRoom.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
          findedRoom,              // Update data
          { new: true }                                  // Options
        );
      }
    }
  }

  async getRoomData(roomId) {
    let roomData = await client.json.get(roomId);
    if (typeof roomData === 'string') {
      roomData = JSON.parse(roomData);
    }
    // roomData = await updateBotRoleInMainData(roomId, roomData, client, this.io);
    return roomData;
  }

  updateRoomState(room, userId) {
    const playerInTeamOne = room.teamOne.find(player => player.UserId === userId);
    const playerInTeamTwo = room.teamTwo.find(player => player.UserId === userId);

    if (playerInTeamOne) {
      room.teamOne.forEach(player => {
        if (player.UserId !== userId) {
          player.isPartnerPlayingAlone = true;
          player.cards = [0, 0, 0, 0, 0];
        } else {
          player.isPlayAlone = true;
        }
      });
    } else if (playerInTeamTwo) {
      room.teamTwo.forEach(player => {
        if (player.UserId !== userId) {
          player.isPartnerPlayingAlone = true;
          player.cards = [0, 0, 0, 0, 0];
        } else {
          player.isPlayAlone = true;
        }
      });
    }
  }
}

module.exports = PlayAloneHandler;
