const client = require("../redisClient");
const { addTimePlayersSelectPlayAlone } = require("../timerTable/addTimeInPlayers");
const checkIsPlayAloneTimeOut = require("../timerTable/checkIsPlayAloneTimeOut");
const { getTimePlus30Seconds } = require("../timerTable/setTimer");
const { updateBotRoleInMainData } = require("../updateRoomRoleToBot");
const checkIsBotTrumpSelectionForPlayAlone = require("./checkIsPlayAlonSelectionWithTrumpBox");
const checkIsTurn = require("./checkIsTrun");
const removedCard = require("./removedCard");
const handleRemoveExtraCard = async (removedCardSelected, roomId, findedRoom, io) => {
    let action = 3;



    const { teamOne, teamTwo, userId, AskTeamOrAloneId } = await removedCard(findedRoom?.teamOne, findedRoom?.teamTwo, removedCardSelected);
    findedRoom.teamOne = teamOne;
    findedRoom.teamTwo = teamTwo;
    findedRoom.isStarted = true;
    let removedCardOBJ = {
        action,
        removedCard: removedCardSelected,
        userId,
        trumpSuit: findedRoom?.trumpSuit
    }

    if (roomId) {
        //for check next turn is true for is parter playing alone aur not
        await checkIsTurn(findedRoom?.teamOne, findedRoom?.teamTwo);


        io.to(roomId).emit('RemovedCard', { roomData: removedCardOBJ });
        io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
        io.to(roomId).emit('lastAction', { action, userId });
        let isDelay = true;
        findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
        const timeOut = await getTimePlus30Seconds();
        let askteamPlayerId = {
            AskTeamOrAloneId: AskTeamOrAloneId,
            timeOut,
            timerCount: 27
        }
        io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

        const UpdatedDealer = await addTimePlayersSelectPlayAlone(findedRoom?.teamOne, findedRoom?.teamTwo, AskTeamOrAloneId, timeOut);
        findedRoom.teamOne = UpdatedDealer?.teamOne;
        findedRoom.teamTwo = UpdatedDealer?.teamTwo
        await client.json.set(roomId, '$', findedRoom);
        setTimeout(async () => {
            await checkIsPlayAloneTimeOut(findedRoom, roomId, AskTeamOrAloneId, io);
            // let updatedRoom = await checkIsPlayAloneTimeOut(findedRoom, roomId, AskTeamOrAloneId, io);
            // await this.client.json.set(findedRoom._id.toString(), JSON.stringify(updatedRoom));
            // findedRoom = updatedRoom

        }, 31000); // 40 seconds timer

        // let next = {
        //     nextTurnId: isTurnData.userId,
        //     isPlayingAlone: isTurnData.isPlayingAlone
        // }
        // io.to(roomId).emit('NextTurn', { roomData: next });
        let PrevTrumpshowUserId;
        for (let i = 0; i < findedRoom?.teamOne.length; i++) {
            if (findedRoom?.teamOne[i]?.isTrumpShow) PrevTrumpshowUserId = findedRoom?.teamOne[i]?.UserId;
            findedRoom.teamOne[i].isTrumpShow = false;
        }
        for (let i = 0; i < findedRoom.teamTwo.length; i++) {
            if (findedRoom?.teamTwo[i]?.isTrumpShow) PrevTrumpshowUserId = findedRoom?.teamTwo[i]?.UserId;
            findedRoom.teamTwo[i].isTrumpShow = false;
        }

        await client.json.set(roomId, '$', findedRoom);
        const updatedRoom = await checkIsBotTrumpSelectionForPlayAlone(findedRoom, roomId, PrevTrumpshowUserId, io)
        const updateClient = await client.json.set(roomId, '$', updatedRoom);
        return updatedRoom
    }
};
module.exports = handleRemoveExtraCard;