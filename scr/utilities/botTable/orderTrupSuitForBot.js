const client = require("../redisClient");
const { addTimePlayersSelectPlayAlone } = require("../timerTable/addTimeInPlayers");
const checkIsPlayAloneTimeOut = require("../timerTable/checkIsPlayAloneTimeOut");
const { getTimePlus30Seconds } = require("../timerTable/setTimer");
const { cehckTrumShow } = require("./passTrumpBox");
let checkIsBotTrumpSelectionForPlayAlone;
const loadModule = async () => {
    checkIsBotTrumpSelectionForPlayAlone = await require("./checkIsPlayAlonSelectionWithTrumpBox");
};
// setTimeout(async () => {
//     await loadModule();
//     console.log('order oup',typeof checkIsBotTrumpSelectionForPlayAlone)
// }, 3100); // 31 seconds timer
const handleCallSuiteSelection = async (selectedCard, roomId, io, findedRoom) => {
    let action = 2;


    if (roomId) {
        let preTrupRound = 0;
        let { teamOne, teamTwo, trumpRound, userId } = await cehckTrumShow(
            findedRoom?.teamOne,
            findedRoom?.teamTwo,
            findedRoom?.trumpRound
        );
        findedRoom.teamOne = teamOne;
        findedRoom.teamTwo = teamTwo;


        let orderPassCell = {
            action,
            Suite: selectedCard,
            trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom?.trumpRound,
            userId
        }
        preTrupRound = findedRoom?.trumpRound
        findedRoom.trumpSuit = selectedCard;
        findedRoom.trumpRound = 0;
        findedRoom.isTrumpSelected = true;
        findedRoom.isStarted = true;
        findedRoom.trumpMaker = userId;

        io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
        io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
        io.to(roomId).emit('lastAction', { action, userId });
        const timeOut = await getTimePlus30Seconds();
        // let next = {
        //     nextTurnId: isTurnData.userId,
        //     isPlayingAlone: isTurnData.isPlayingAlone
        // }
        // io.to(roomId).emit('NextTurn', { roomData: next });
        let askteamPlayerId = {
            AskTeamOrAloneId: userId,
            timeOut,
            timerCount: 27
        }
        io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

        const UpdatedDealer = await addTimePlayersSelectPlayAlone(findedRoom?.teamOne, findedRoom?.teamTwo, userId, timeOut);
        findedRoom.teamOne = UpdatedDealer?.teamOne;
        findedRoom.teamTwo = UpdatedDealer?.teamTwo
        await client.json.set(roomId, '$', findedRoom);
        setTimeout(async () => {
            await checkIsPlayAloneTimeOut(findedRoom, roomId, userId, io);
            // let updatedRoom = await checkIsPlayAloneTimeOut(findedRoom, roomId, userId, io);
            // await this.client.json.set(findedRoom._id.toString(), JSON.stringify(updatedRoom));
            // findedRoom = updatedRoom

        }, 31000); // 40 seconds timer

        let PrevTrumpshowUserId;
        for (let i = 0; i < findedRoom?.teamOne.length; i++) {
            if (findedRoom?.teamOne[i]?.isTrumpShow) PrevTrumpshowUserId = findedRoom?.teamOne[i]?.UserId;
            findedRoom.teamOne[i].isTrumpShow = false;
        }
        for (let i = 0; i < findedRoom?.teamTwo.length; i++) {
            if (findedRoom?.teamTwo[i]?.isTrumpShow) PrevTrumpshowUserId = findedRoom?.teamTwo[i]?.UserId;
            findedRoom.teamTwo[i].isTrumpShow = false;
        }

        await loadModule();
        await client.json.set(roomId, '$', findedRoom);
        const updatedRoom = await checkIsBotTrumpSelectionForPlayAlone(findedRoom, roomId, PrevTrumpshowUserId, io)
        // const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
        const updateClient = await client.json.set(roomId, '$', updatedRoom);
        return updatedRoom
    }
};
module.exports = handleCallSuiteSelection;