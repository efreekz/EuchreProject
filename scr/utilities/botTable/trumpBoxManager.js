const { passTrumpBox } = require("./passTrumpBox.js");
const { shuffleCards, } = require("./shuffleCards.js");

// TrumpBoxManager.js
const PlayingRoom = require("../../modules/playingroom/playingRoom.model.js");
const { default: mongoose } = require("mongoose");
const createDealer = require("./createDealer.js");
const checkIsTurn = require("./checkIsTrun.js");
const { getTrumpSuitFromSelectBTN } = require("./getLeadSuit.js");
const { getTimePlus30Seconds } = require("../timerTable/setTimer.js");
const { addTimePlayersisTrumpShow } = require("../timerTable/addTimeInPlayers.js");
const delay = require("./delay.js");
const { updateBotRoleInMainData } = require("../updateRoomRoleToBot.js");
let checkIsBotTrumpSelection;
let checkIsTrumpTimeOut;
const loadModule = async () => {
  checkIsTrumpTimeOut = await require("../timerTable/checkIsTrumTimeOut.js");
  checkIsBotTrumpSelection = await require("./checkisTrumpSelection.js");
};
// setTimeout(async () => {
//     await loadModule();
//     console.log('checkIsTrumpTimeOut',typeof checkIsTrumpTimeOut)
// }, 3100); // 31 seconds timer
class TrumpBoxManager {
  constructor(io, client) {
    this.io = io;
    this.client = client;
  }

  async handlePassTrumpBox(findedRoom, roomId) {

    console.log('bot passed');
    if (roomId) {
      let action = 0
      let isDealed = false;
      let disabledSuite = ""

      
      let { teamOne, teamTwo, trumpRound, userId, isShowTrumpBoxNewUser } = await passTrumpBox(
        findedRoom?.teamOne,
        findedRoom?.teamTwo,
        findedRoom?.trumpRound
      );

      findedRoom.teamOne = teamOne;
      findedRoom.teamTwo = teamTwo;
      findedRoom.trumpRound = trumpRound;


      let orderPassCell = {
        action,
        Suite: '',
        trumpRound,
        userId
      }




      if (trumpRound === 2) {
        isDealed = true;
        // const isDelay = true;
        // this.findedRoom = await updateBotRoleInMainData(findedRoom?._id.toString(), findedRoom, this.client, this.io, isDelay);
        findedRoom = await this.resetRound(findedRoom); // Capture the updated findedRoom
      } else if (trumpRound === 1) {
        let desabledCard = await getTrumpSuitFromSelectBTN(findedRoom?.totalCards[0]);
        disabledSuite = desabledCard?.suit;
      }
      const timeOut = await getTimePlus30Seconds();
      const addedTimeOut = await addTimePlayersisTrumpShow(findedRoom?.teamOne, findedRoom?.teamTwo, isShowTrumpBoxNewUser, timeOut)

      findedRoom.teamOne = addedTimeOut?.teamOne;
      findedRoom.teamTwo = addedTimeOut?.teamTwo;
      let NotifyTrumpSelectorPlayer = {
        userId: isShowTrumpBoxNewUser,
        trumpRound,
        disabledSuite,
        timeOut,
        timerCount: 27
      }
      let isDelay = true;
      findedRoom = await updateBotRoleInMainData(roomId, findedRoom, this.client, this.io, isDelay);

      this.io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
      if (!isDealed) {
        this.io.to(roomId).emit('NotifyTrumpSelectorPlayer', { roomData: NotifyTrumpSelectorPlayer });


        await this.client.json.set(findedRoom?._id.toString(), '$', findedRoom);

        setTimeout(async () => {
          await loadModule();
          // const updatedRoom = await checkIsTrumpTimeOut(findedRoom, this.io, findedRoom._id.toString());
          await checkIsTrumpTimeOut(findedRoom, this.io, findedRoom?._id.toString());
          // console.log('updated rooom in selector trum timer', updatedRoom)
          // await this.client.json.set(findedRoom._id.toString(), '$', updatedRoom);

        }, 31000); // 40 seconds timer
      }
      let updatedRoom = this.notifyClients(roomId, findedRoom, action, userId, isDealed);
      await loadModule();
      updatedRoom = await checkIsBotTrumpSelection(findedRoom, this.io, roomId)

      return updatedRoom
    }
  }


  async resetRound(findedRoom) {
    findedRoom.trumpRound = 0;
    const { teamOne, teamTwo } = await createDealer(findedRoom?.teamOne, findedRoom?.teamTwo);
    findedRoom.teamOne = teamOne;
    findedRoom.teamTwo = teamTwo;
    // Pass findedRoom to dealCards to update it within that method
    const udpatedFindedRooom = await this.dealCards(findedRoom);
    findedRoom = udpatedFindedRooom;
    findedRoom.totalCards = udpatedFindedRooom?.totalCards;

    findedRoom.status = 'playing';

    return findedRoom; // Return the updated findedRoom
  }

  async dealCards(findedRoom) {
    const shufflecards = new shuffleCards(4);
    const dealtCards = await shufflecards.dealCards();
    const updatedteamOne = await Promise.all(
      findedRoom?.teamOne.map(async (player, index) => {
        const indexNumber = `player${index + 1}`
        const card = dealtCards?.players[indexNumber];
        return { ...player, cards: card }; // Return the updated player object
      })
    );
    const updatedteamTwo = await Promise.all(
      findedRoom?.teamTwo.map(async (player, index) => {
        const indexNumber = `player${(2 + index) + 1}`
        const card = dealtCards?.players[indexNumber];
        return { ...player, cards: card }; // Return the updated player object
      })
    );

    findedRoom.totalCards = dealtCards?.trumpSelectionCards;
    findedRoom.teamOne = updatedteamOne;
    findedRoom.teamTwo = updatedteamTwo;
    return findedRoom; // Return the updated findedRoom
  }


  async notifyClients(roomId, roomData, action, userId, isDealed) {
    const clients = this.io.sockets.adapter.rooms.get(roomId);
    if (clients) {
      console.log('Clients in room:', [...clients]);
    } else {
      console.log('No clients in the room');
    }
    let { dealerId, players } = await this.getPlayers(roomData);
    if (isDealed) {
      let isTurnData = await checkIsTurn(roomData?.teamOne, roomData?.teamTwo);
      let InitializeRound = {
        players,
        kitty: roomData?.totalCards,
        dealerId
      }

      this.io.to(roomId).emit('InitializeRound', { roomData: InitializeRound });
      await delay(5000);
      const timeOut = await getTimePlus30Seconds();
      const addedTimeOut = await addTimePlayersisTrumpShow(roomData?.teamOne, roomData?.teamTwo, isTurnData?.userId, timeOut)

      roomData.teamOne = addedTimeOut?.teamOne;
      roomData.teamTwo = addedTimeOut?.teamTwo;
      let NotifyTrumpSelectorPlayer = {
        userId: isTurnData?.userId,
        trumpRound: 0,
        disabledSuite: '',
        timeOut,
        timerCount: 27
      }
      this.io.to(roomId).emit('NotifyTrumpSelectorPlayer', { roomData: NotifyTrumpSelectorPlayer });
      await this.client.json.set(roomData._id.toString(), '$', roomData);

      setTimeout(async () => {
        await checkIsTrumpTimeOut(roomData, this.io, roomData?._id.toString());
        // const updatedRoom = await checkIsTrumpTimeOut(roomData, this.io, roomData._id.toString());
        // console.log('updated rooom in selector trum timer', updatedRoom)
        // await this.client.json.set(roomData._id.toString(), '$', updatedRoom);

      }, 31000); // 40 seconds timer
      // let next = {
      //   nextTurnId: isTurnData.userId,
      //   isPlayingAlone: isTurnData.isPlayingAlone
      // }
      // this.io.to(roomId).emit('NextTurn', { roomData: next });
    }



    this.io.to(roomId).emit('roomUpdates', { roomData });
    this.io.to(roomId).emit('lastAction', { action, userId });

    return roomData
  }
  async getPlayers(findedRoom) {
    let dealerId = null;

    const playersPromises = findedRoom?.players.map(async (player) => {
      const playerUserId = player?.UserId;
      let matchedPlayer = null;
      findedRoom?.teamOne.find((e, index) => {
        if (e?.isDealer) {
          dealerId = e?.UserId;
        }
        if (e?.UserId === playerUserId) {
          matchedPlayer = { ...e, indexInTeam: index, team: 'teamOne' };
          return true;
        }
        return false;
      });

      if (!matchedPlayer || matchedPlayer == null) {

        findedRoom?.teamTwo.find((e, index) => {
          if (e?.isDealer) {
            dealerId = e?.UserId;
          }
          if (e?.UserId === playerUserId) {
            matchedPlayer = { ...e, indexInTeam: index, team: 'teamTwo' };
            return true;
          }
          return false;
        });
      }

      return matchedPlayer || null;
    });

    const playersResults = await Promise.all(playersPromises);

    const filteredPlayers = playersResults.filter((player) => player !== null);

    // Return both the dealerId and the filtered players
    return {
      dealerId,
      players: filteredPlayers
    };
  }

}

module.exports = TrumpBoxManager;
