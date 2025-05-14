const PlayingRoom = require("../../modules/playingroom/playingRoom.model");
const { cehckTrumShow } = require("./passTrumpBox");
const checkIsTurn = require("./checkIsTrun");
const { getTrumpSuitFromSelectBTN } = require("./getLeadSuit");
const reciveTrumpSelectedCard = require("./reciveTrumpSelectedCard");
const client = require("../redisClient");
const checkIsBotDealer = require("./checkIsBotDealer");
const checkIsDealerTimeOut = require("../timerTable/checkIsDealerTimeOut");
const { addTimePlayersIsDealer } = require("../timerTable/addTimeInPlayers");
const { getTimePlus30Seconds } = require("../timerTable/setTimer");
const handleOrderUp = async (e) => {
    let data = e;
    let action = 1;

    let { findedRoom, roomId, io, selectedCard } = data;
    let selectedCardSuit = selectedCard;
    if (selectedCard.length >= 2) {
        selectedCardSuit = getTrumpSuitFromSelectBTN(selectedCard)
    }

    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }

    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }
    // let findedRoom = await client.json.get(roomId);

    const { teamOnes, teamTwos, dealerId } = await reciveTrumpSelectedCard(findedRoom?.teamOne, findedRoom?.teamTwo, selectedCard);
    if (roomId) {
        let preTrupRound = 0;
        let { teamOne, teamTwo, trumpRound, userId } = await cehckTrumShow(
            teamOnes,
            teamTwos,
            findedRoom?.trumpRound
        );


        preTrupRound = findedRoom?.trumpRound;
        findedRoom.teamOne = teamOne;
        findedRoom.teamTwo = teamTwo;
        findedRoom.trumpSuit = selectedCardSuit?.suit ? selectedCardSuit?.suit : selectedCard;
        findedRoom.isTrumpSelected = true;
        findedRoom.trumpRound = 0;
        // findedRoom.isStarted = true;
        findedRoom.trumpMaker = userId;

        const clients = io.sockets.adapter.rooms.get(roomId);
        console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);
        let isTurnData = await checkIsTurn(findedRoom?.teamOne, findedRoom?.teamTwo);
        let orderPassCell = {
            action,
            Suite: selectedCard,
            trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom?.trumpRound,
            userId
        }

        io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
        io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
        io.to(roomId).emit('lastAction', { action, userId });
        const timeOut = await getTimePlus30Seconds();
        io.to(roomId).emit('NotifyDealerRemove', { roomData: { dealerId, timeOut, timerCount: 27 } });

        const UpdatedDealer = await addTimePlayersIsDealer(findedRoom?.teamOne, findedRoom?.teamTwo, dealerId, timeOut);
        findedRoom.teamOne = UpdatedDealer?.teamOne;
        findedRoom.teamTwo = UpdatedDealer?.teamTwo
        // let next = {
        //     nextTurnId: isTurnData.userId,
        //     isPlayingAlone: isTurnData.isPlayingAlone
        // }
        // io.to(roomId).emit('NextTurn', { roomData: next });

        await client.json.set(roomId, '$', findedRoom);
        setTimeout(async () => {
            await checkIsDealerTimeOut(findedRoom, roomId, io);
            // let updatedRoom = await checkIsDealerTimeOut(findedRoom, roomId, io);
            // await this.client.json.set(findedRoom._id.toString(), JSON.stringify(updatedRoom));
            // findedRoom = updatedRoom

        }, 31000); // 40 seconds timer
        const updatedRom = await checkIsBotDealer(findedRoom, roomId, io);
        const updateClient = await client.json.set(roomId, '$', updatedRom);

        if (updateClient !== 'OK') {
            await PlayingRoom.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(roomId) },
                { trumpSuit: selectedCard, isTrumpSelected: true, teamOne: findedRoom?.teamOne, teamTwo: findedRoom?.teamTwo, trumpRound: 0, isStarted: true },
                { new: true }
            );
        }
        return updatedRom
    }
};
module.exports = handleOrderUp;