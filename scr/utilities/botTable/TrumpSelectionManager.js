const mongoose = require('mongoose');
const PlayingRoom = require('../../modules/playingroom/playingRoom.model'); // Adjust the import path as needed
const reciveTrumpSelectedCard = require('./reciveTrumpSelectedCard');
const removedCard = require('./removedCard');
const { getTrumpSuitFromSelectBTN } = require('./getLeadSuit');
const { cehckTrumShow } = require('./passTrumpBox');
const checkIsTurn = require('./checkIsTrun');
const { getTimePlus30Seconds } = require('../timerTable/setTimer');
const { addTimePlayersIsDealer, addTimePlayersSelectPlayAlone } = require('../timerTable/addTimeInPlayers')
const checkIsDealerTimeOut = require('../timerTable/checkIsDealerTimeOut');
const checkIsPlayAloneTimeOut = require('../timerTable/checkIsPlayAloneTimeOut');
const { updateBotRoleInMainData, updateUserToBotInMainData } = require('../updateRoomRoleToBot');
class TrumpSelectionManager {
    constructor(io, client, socket) {
        this.io = io;
        this.client = client;
        this.socket = socket;

        this.initializeSocketEvents();
    }

    initializeSocketEvents() {
        this.socket.on('TrumpCardSuitSelected', async (e) => this.handleCallSuiteSelection(e));
        this.socket.on('TrumpSelected', async (e) => this.handleOrderUp(e));
        this.socket.on('removeExtraCard', async (e) => this.handleRemoveExtraCard(e));
    }

    async handleCallSuiteSelection(e) {
        let data = e;
        let action = 2;

        if (typeof e === 'string') {
            data = JSON.parse(e);
        }

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        const { roomId, card: selectedCard } = data;
        if (roomId) {
            let findedRoom = await this.client.json.get(roomId);

            if (typeof findedRoom === 'string') {
                findedRoom = JSON.parse(findedRoom);
            };

            // findedRoom = await updateBotRoleInMainData(roomId, findedRoom, this.client, this.io);
            findedRoom = await updateUserToBotInMainData(roomId, findedRoom, this.client, this.io);

            let preTrupRound = 0;
            let { teamOne, teamTwo, trumpRound, userId } = await cehckTrumShow(
                findedRoom.teamOne,
                findedRoom.teamTwo,
                findedRoom.trumpRound
            );
            findedRoom.teamOne = teamOne;
            findedRoom.teamTwo = teamTwo;



            preTrupRound = findedRoom.trumpRound
            findedRoom.trumpSuit = selectedCard;
            findedRoom.trumpRound = 0;
            findedRoom.isTrumpSelected = true;
            findedRoom.isStarted = true;
            findedRoom.trumpMaker = userId;

            const clients = this.io.sockets.adapter.rooms.get(roomId);
            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);
            let orderPassCell = {
                action,
                Suite: selectedCard,
                trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom.trumpRound,
                userId
            }
            let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);


            this.io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            this.io.to(roomId).emit('lastAction', { action, userId });
            const timeOut = await getTimePlus30Seconds();
            // let next = {
            //     nextTurnId: isTurnData.userId,
            //     isPlayingAlone: isTurnData.isPlayingAlone
            // }
            // this.io.to(roomId).emit('NextTurn', { roomData: next });
            let askteamPlayerId = {
                AskTeamOrAloneId: userId,
                timeOut,
                timerCount: 27
            }
            this.io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

            const UpdatedDealer = await addTimePlayersSelectPlayAlone(findedRoom.teamOne, findedRoom.teamTwo, userId, timeOut);
            findedRoom.teamOne = UpdatedDealer.teamOne;
            findedRoom.teamTwo = UpdatedDealer.teamTwo
            await this.client.json.set(roomId, '$', findedRoom);
            setTimeout(async () => {
                await checkIsPlayAloneTimeOut(findedRoom, roomId, userId, this.io);
                // let updatedRoom = await checkIsPlayAloneTimeOut(findedRoom, roomId, userId, this.io);
                // console.log('after ask team or alo timer Updated', updatedRoom)
                // await this.client.json.set(findedRoom._id.toString(), JSON.stringify(updatedRoom));
                // findedRoom = updatedRoom

            }, 31000); // 40 seconds timer

            for (let i = 0; i < findedRoom.teamOne.length; i++) {
                findedRoom.teamOne[i].isTrumpShow = false;
            }
            for (let i = 0; i < findedRoom.teamTwo.length; i++) {
                findedRoom.teamTwo[i].isTrumpShow = false;
            }

            const updateClient = await this.client.json.set(roomId, '$', findedRoom);

            if (updateClient !== 'OK') {
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    { trumpSuit: selectedCard, isTrumpSelected: true, trumpRound: 0, isStarted: true },
                    { new: true }
                );
            }
        }
    }

    async handleOrderUp(e) {
        let data = e;
        let action = 1;
        if (typeof e === 'string') {
            data = JSON.parse(e);
        }

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        const { roomId, selectedCard } = data;
        let selectedCardSuit = selectedCard;
        if (selectedCard.length >= 2) {
            selectedCardSuit = getTrumpSuitFromSelectBTN(selectedCard)
        }


        let findedRoom = await this.client.json.get(roomId);
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (!findedRoom) {
            findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
        }

        // findedRoom = await updateBotRoleInMainData(roomId, findedRoom, this.client, this.io);
        findedRoom = await updateUserToBotInMainData(roomId, findedRoom, this.client, this.io);

        const { teamOnes, teamTwos, dealerId } = await reciveTrumpSelectedCard(findedRoom.teamOne, findedRoom.teamTwo, selectedCard);
        if (roomId) {
            let preTrupRound = 0;
            let { teamOne, teamTwo, trumpRound, userId } = await cehckTrumShow(
                teamOnes,
                teamTwos,
                findedRoom.trumpRound
            );


            preTrupRound = findedRoom.trumpRound;
            findedRoom.teamOne = teamOne;
            findedRoom.teamTwo = teamTwo;
            findedRoom.trumpSuit = selectedCardSuit.suit ? selectedCardSuit.suit : selectedCard;
            findedRoom.isTrumpSelected = true;
            findedRoom.trumpRound = 0;
            findedRoom.isStarted = true;
            findedRoom.trumpMaker = userId;

            const clients = this.io.sockets.adapter.rooms.get(roomId);
            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);
            let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);
            let orderPassCell = {
                action,
                Suite: selectedCard,
                trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom.trumpRound,
                userId
            }

            this.io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            this.io.to(roomId).emit('lastAction', { action, userId });
            const timeOut = await getTimePlus30Seconds();
            this.io.to(roomId).emit('NotifyDealerRemove', { roomData: { dealerId, timeOut, timerCount: 27 } });

            const UpdatedDealer = await addTimePlayersIsDealer(findedRoom.teamOne, findedRoom.teamTwo, dealerId, timeOut);
            findedRoom.teamOne = UpdatedDealer.teamOne;
            findedRoom.teamTwo = UpdatedDealer.teamTwo
            // let next = {
            //     nextTurnId: isTurnData.userId,
            //     isPlayingAlone: isTurnData.isPlayingAlone
            // }
            // io.to(roomId).emit('NextTurn', { roomData: next });

            await this.client.json.set(roomId, '$', findedRoom);
            setTimeout(async () => {
                 await checkIsDealerTimeOut(findedRoom, roomId, this.io);
                // let updatedRoom = await checkIsDealerTimeOut(findedRoom, roomId, this.io);
                // console.log('dealer timer Updated', updatedRoom)
                // await this.client.json.set(findedRoom._id.toString(), JSON.stringify(updatedRoom));
                // findedRoom = updatedRoom

            }, 31000); // 40 seconds timer
            // let next = {
            //     nextTurnId: isTurnData.userId,
            //     isPlayingAlone: isTurnData.isPlayingAlone
            // }
            // this.io.to(roomId).emit('NextTurn', { roomData: next });

            const updateClient = await this.client.json.set(roomId, '$', findedRoom);

            if (updateClient !== 'OK') {
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    { trumpSuit: selectedCard, isTrumpSelected: true, teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, trumpRound: 0, isStarted: true },
                    { new: true }
                );
            }
        }
    }

    async handleRemoveExtraCard(e) {
        let data = e;
        let action = 3;
        if (typeof e === 'string') {
            data = JSON.parse(e);
        }

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        const { roomId, card: removedCardSelected } = data;

        let findedRoom = await this.client.json.get(roomId);
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (!findedRoom) {
            findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
        }

        // findedRoom = await updateBotRoleInMainData(roomId, findedRoom, this.client, this.io);
        findedRoom = await updateUserToBotInMainData(roomId, findedRoom, this.client, this.io);
        
        const { teamOne, teamTwo, userId, AskTeamOrAloneId } = await removedCard(findedRoom.teamOne, findedRoom.teamTwo, removedCardSelected);
        findedRoom.teamOne = teamOne;
        findedRoom.teamTwo = teamTwo;
        findedRoom.isStarted = true;
        let removedCardOBJ = {
            action,
            removedCard: removedCardSelected,
            userId,
            trumpSuit: findedRoom.trumpSuit
        }

        if (roomId) {
            const clients = this.io.sockets.adapter.rooms.get(roomId);
            let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);

            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);

            this.io.to(roomId).emit('RemovedCard', { roomData: removedCardOBJ });
            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            this.io.to(roomId).emit('lastAction', { action, userId });
            const timeOut = await getTimePlus30Seconds();
            let askteamPlayerId = {
                AskTeamOrAloneId: AskTeamOrAloneId,
                timeOut,
                timerCount: 27
            }
            this.io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

            const UpdatedDealer = await addTimePlayersSelectPlayAlone(findedRoom.teamOne, findedRoom.teamTwo, AskTeamOrAloneId, timeOut);
            findedRoom.teamOne = UpdatedDealer.teamOne;
            findedRoom.teamTwo = UpdatedDealer.teamTwo
            await this.client.json.set(roomId, '$', findedRoom);
            setTimeout(async () => {
                console.log('in after ask team or alo')
                // let updatedRoom = await checkIsPlayAloneTimeOut(findedRoom, roomId, AskTeamOrAloneId, this.io);
                await checkIsPlayAloneTimeOut(findedRoom, roomId, AskTeamOrAloneId, this.io);
                // console.log('after ask team or alo timer Updated', updatedRoom)
                // await this.client.json.set(findedRoom._id.toString(), JSON.stringify(updatedRoom));
                // findedRoom = updatedRoom

            }, 31000); // 40 seconds timer

            // let next = {
            //     nextTurnId: isTurnData.userId,
            //     isPlayingAlone: isTurnData.isPlayingAlone
            // }
            // this.io.to(roomId).emit('NextTurn', { roomData: next });
            for (let i = 0; i < findedRoom.teamOne.length; i++) {
                findedRoom.teamOne[i].isTrumpShow = false;
            }
            for (let i = 0; i < findedRoom.teamTwo.length; i++) {
                findedRoom.teamTwo[i].isTrumpShow = false;
            }
            const updateClient = await this.client.json.set(roomId, '$', findedRoom);

            if (updateClient !== 'OK') {
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    { teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, isStarted: true },
                    { new: true }
                );
            }
        }
    }
}

module.exports = TrumpSelectionManager;
