const { GameManager } = require("./gamePlayFunctions");
const client = require("../redisClient");
const PlayingRoom = require("../../modules/playingroom/playingRoom.model");
const { getTimePlus30Seconds } = require("../timerTable/setTimer");
const { default: mongoose } = require("mongoose");
const { updateBotRoleInMainData } = require("../updateRoomRoleToBot");
let checkIsLastCardThrow;
let checkIsBotTurn;
let checkIsTimeOutTurn;
const loadModule = async () => {
    checkIsTimeOutTurn = await require("../timerTable/checkIsTimeOutTurn");
    checkIsBotTurn = await require("./checkisBotTurn");
    checkIsLastCardThrow = await require("../checkIslastCard");
};
// setTimeout(async () => {

// await loadModule();
//     console.log('checkIsLastCardThrow',checkIsLastCardThrow)
// }, 3100); // 31 seconds timer
const botGamePlay = async (findedRoom, playedCard, roomId, io) => {
    try {

        if (roomId) {
            let lastTrickUpdates = {};

            if (findedRoom?.teamOne[0]?.isTurn == true) {
                try {
                    findedRoom.teamOne[0].isTurn = false;
                    const updatedCart = await Promise.all(findedRoom?.teamOne[0]?.cards.map((c) => {
                        if (c == 0) {
                            return 0
                        } else if (c !== playedCard) {

                            return c
                        } else {
                            playedCard = { card: c ? c : playedCard, UserId: findedRoom?.teamOne[0]?.UserId }
                            return 0
                        }
                    }));
                    findedRoom.teamOne[0].cards = updatedCart;
                    findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

                    const remaningCards = await findedRoom?.teamOne[0]?.cards.filter(c => c !== 0)
                    let isPlayAlone = false
                    isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);
                    const cardPlayedUpdate = {
                        card: playedCard?.card,
                        userId: playedCard?.UserId,
                        isPlayingAlone: isPlayAlone
                    }

                    io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });


                    if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {
                        const gameManager = new GameManager(findedRoom, io);
                        const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                        lastTrickUpdates = lastTrickUpdate
                        findedRoom = udpatedFindedRooom;
                        isPlayAlone = false;
                    } else {
                        if (findedRoom?.teamTwo[0]?.isPartnerPlayingAlone) {
                            findedRoom.teamOne[1].isTurn = true
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamOne[1].timeOut = timeOut
                            findedRoom.teamOne[1].timerCount = 30
                            let next = {
                                nextTurnId: findedRoom?.teamOne[1]?.UserId,
                                isPlayingAlone: true,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId)
                            }, 31000); // 40 seconds timer

                        } else {
                            findedRoom.teamTwo[0].isTurn = true;
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamTwo[0].timeOut = timeOut;
                            findedRoom.teamTwo[0].timerCount = 30;
                            let next = {
                                nextTurnId: findedRoom.teamTwo[0].UserId,
                                isPlayingAlone: false,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[0].UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom.teamTwo[0].UserId)
                            }, 31000); // 40 seconds timer

                        }

                    }
                    if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length >= 1) {
                        let isDelay = true;
                        findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
                    }
                } catch (e) {
                    console.log('irror in team one 0 ', e)
                }
            } else if (findedRoom?.teamTwo[0].isTurn == true) {
                try {
                    findedRoom.teamTwo[0].isTurn = false;

                    const updatedCart = await Promise.all(findedRoom?.teamTwo[0]?.cards.map((c) => {
                        if (c == 0) {
                            return 0
                        } else if (c !== playedCard) {
                            return c
                        } else {
                            playedCard = { card: c ? c : playedCard, UserId: findedRoom?.teamTwo[0]?.UserId }
                            return 0
                        }
                    }));
                    findedRoom.teamTwo[0].cards = updatedCart;
                    findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];


                    const remaningCards = await findedRoom?.teamTwo[0]?.cards.filter(c => c !== 0)
                    let isPlayAlone = false
                    isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);
                    const cardPlayedUpdate = {
                        card: playedCard?.card,
                        userId: playedCard?.UserId,
                        isPlayingAlone: isPlayAlone
                    }

                    io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

                    if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {

                        const gameManager = new GameManager(findedRoom, io);
                        const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                        lastTrickUpdates = lastTrickUpdate
                        findedRoom = udpatedFindedRooom;
                        isPlayAlone = false;
                    } else {
                        if (findedRoom.teamOne[1].isPartnerPlayingAlone) {
                            findedRoom.teamTwo[1].isTurn = true;
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamTwo[1].timeOut = timeOut;
                            findedRoom.teamTwo[1].timerCount = 30;
                            let next = {
                                nextTurnId: findedRoom?.teamTwo[1]?.UserId,
                                isPlayingAlone: true,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId)
                            }, 31000); // 40 seconds timer


                        } else {
                            findedRoom.teamOne[1].isTurn = true;
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamOne[1].timeOut = timeOut;
                            findedRoom.teamOne[1].timerCount = 30;
                            let next = {
                                nextTurnId: findedRoom?.teamOne[1]?.UserId,
                                isPlayingAlone: false,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0].card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom?.teamOne[1]?.UserId)
                            }, 31000); // 40 seconds timer

                        }

                    }
                    if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length >= 1) {
                        let isDelay = true;
                        findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
                    }

                } catch (e) {
                    console.log('irror in team twos 0 ', e)
                }
            } else if (findedRoom?.teamOne[1]?.isTurn == true) {
                try {
                    findedRoom.teamOne[1].isTurn = false;

                    const updatedCart = await Promise.all(findedRoom?.teamOne[1]?.cards.map((c) => {
                        if (c == 0) {
                            return 0
                        } else if (c !== playedCard) {
                            return c
                        } else {
                            playedCard = { card: c ? c : playedCard, UserId: findedRoom?.teamOne[1]?.UserId }
                            return 0
                        }
                    }));
                    findedRoom.teamOne[1].cards = updatedCart;
                    findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];


                    const remaningCards = await findedRoom?.teamOne[1]?.cards.filter(c => c !== 0)
                    let isPlayAlone = false
                    isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);

                    const cardPlayedUpdate = {
                        card: playedCard?.card,
                        userId: playedCard?.UserId,
                        isPlayingAlone: isPlayAlone
                    }

                    io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

                    if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {

                        const gameManager = new GameManager(findedRoom, io);
                        const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                        lastTrickUpdates = lastTrickUpdate
                        findedRoom = udpatedFindedRooom;
                        isPlayAlone = false;
                    } else {
                        if (findedRoom?.teamTwo[1]?.isPartnerPlayingAlone) {
                            findedRoom.teamOne[0].isTurn = true;
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamOne[0].timeOut = timeOut;
                            findedRoom.teamOne[0].timerCount = 30;
                            let next = {
                                nextTurnId: findedRoom?.teamOne[0]?.UserId,
                                isPlayingAlone: true,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId)
                            }, 31000); // 40 seconds timer

                        } else {
                            findedRoom.teamTwo[1].isTurn = true;
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamTwo[1].timeOut = timeOut;
                            findedRoom.teamTwo[1].timerCount = 30;
                            let next = {
                                nextTurnId: findedRoom.teamTwo[1].UserId,
                                isPlayingAlone: false,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom?.teamTwo[1]?.UserId)
                            }, 31000); // 40 seconds timer

                        }
                    }
                    if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length >= 1) {
                        let isDelay = true;
                        findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
                    }
                } catch (e) {
                    console.log('irror in team one 1 ', e)
                }
            } else if (findedRoom?.teamTwo[1]?.isTurn == true) {
                try {
                    findedRoom.teamTwo[1].isTurn = false;

                    const updatedCart = await Promise.all(findedRoom?.teamTwo[1]?.cards.map((c) => {
                        if (c == 0) {
                            return 0
                        } else if (c !== playedCard) {
                            return c
                        } else {
                            playedCard = { card: c ? c : playedCard, UserId: findedRoom?.teamTwo[1]?.UserId }
                            return 0
                        }
                    }));
                    findedRoom.teamTwo[1].cards = updatedCart;
                    findedRoom?.playedCards.length > 0 && findedRoom?.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];


                    // findedRoom.teamTwo[1].isTurn = true;
                    const remaningCards = await findedRoom?.teamTwo[1]?.cards.filter(c => c !== 0)
                    let isPlayAlone = false
                    isPlayAlone = await findedRoom?.teamOne.some(player => player?.isPlayAlone === true) || findedRoom?.teamTwo.some(player => player?.isPlayAlone === true);

                    const cardPlayedUpdate = {
                        card: playedCard?.card,
                        userId: playedCard?.UserId,
                        isPlayingAlone: isPlayAlone
                    }

                    io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

                    if (findedRoom?.playedCards.length == 4 || (findedRoom?.playedCards.length == 3 && isPlayAlone)) {

                        const gameManager = new GameManager(findedRoom, io);
                        const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                        lastTrickUpdates = lastTrickUpdate
                        findedRoom = udpatedFindedRooom;
                        isPlayAlone = false;
                    } else {
                        if (findedRoom?.teamOne[0]?.isPartnerPlayingAlone) {
                            findedRoom.teamTwo[0].isTurn = true;
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamTwo[0].timeOut = timeOut;
                            findedRoom.teamTwo[0].timerCount = 30;
                            let next = {
                                nextTurnId: findedRoom?.teamTwo[0]?.UserId,
                                isPlayingAlone: true,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamTwo[0]?.UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom?.teamTwo[0]?.UserId)
                            }, 31000); // 40 seconds timer

                        } else {
                            findedRoom.teamOne[0].isTurn = true;
                            const timeOut = await getTimePlus30Seconds();

                            findedRoom.teamOne[0].timeOut = timeOut;
                            findedRoom.teamOne[0].timerCount = 30;
                            let next = {
                                nextTurnId: findedRoom?.teamOne[0]?.UserId,
                                isPlayingAlone: false,
                                timeOut, timerCount: 30,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                trumpSuit: findedRoom?.trumpSuit

                            }
                            io.to(roomId).emit('NextTurn', { roomData: next });
                            await loadModule();
                            await client.json.set(roomId, '$', findedRoom);
                            let UpdatedfindedRoom = await checkIsBotTurn(findedRoom, io, roomId);
                            UpdatedfindedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId);
                            await client.json.set(roomId, '$', UpdatedfindedRoom);
                            setTimeout(async () => {
                                await loadModule();
                                await checkIsTimeOutTurn(UpdatedfindedRoom, io, roomId, findedRoom?.teamOne[0]?.UserId)
                            }, 31000); // 40 seconds timer

                        }
                    }
                    if ((findedRoom?.playedCards.length < 4 || isPlayAlone && findedRoom?.playedCards.length < 3) && remaningCards.length >= 1) {
                        let isDelay = true;
                        findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay);
                    }

                } catch (e) {
                    console.log('irror in team twos 1 ', e)
                }
            }


            if (lastTrickUpdates) {
                // io.to(roomId).emit('roundEndResult', { roundEndResult: lastTrickUpdates });
            }
            // io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            lastTrickUpdates = {}
            const updateClient = await client.json.set(roomId, '$', findedRoom);

            if (findedRoom?.teamOnePoints && findedRoom?.teamOnePoints?.winningPoint >= 10) {
                findedRoom.teamOnePoints.isWinner = true;
                findedRoom.isStarted = false;
                findedRoom.status = 'complete';
                findedRoom.isWinner = 'teamOne';
                findedRoom.isGameEnd = true;
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    findedRoom,
                    { new: true }
                )
                // await client.del(roomId);
                const room = io.sockets.adapter.rooms.get(roomId);

                if (room) {
                    // Iterate over each socket in the room
                    for (const socketId of room) {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket) {
                            // Disconnect the socket
                            socket.leave(roomId);
                            // socket.disconnect(true);
                        }
                    }
                }
                // await client.json.set(roomId, '$', findedRoom);
                await client.del(roomId);
            }
            if (findedRoom?.teamTwoPoints && findedRoom?.teamTwoPoints?.winningPoint >= 10) {
                findedRoom.teamTwoPoints.isWinner = true;
                findedRoom.isStarted = false;
                findedRoom.status = 'complete';
                findedRoom.isWinner = 'teamTwo';
                findedRoom.isGameEnd = true;
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    findedRoom,
                    { new: true }
                );
                // await client.del(roomId);
                const room = io.sockets.adapter.rooms.get(roomId);

                if (room) {
                    // Iterate over each socket in the room
                    for (const socketId of room) {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket) {
                            // Disconnect the socket
                            socket.leave(roomId);
                            // socket.disconnect(true);
                        }
                    }
                }
                // await client.json.set(roomId, '$', findedRoom);
                await client.del(roomId);
                await client.del(`${roomId}roles`);
            }

            // const playedCardsTeamOne = findedRoom.teamOne.map((p) => {
            // 	const allZero = p.cards.every(card => card === 0);
            // 	return allZero;
            // });
            // const teamOneTrue = playedCardsTeamOne.every(c => c === true) ? true : false;
            // const playedCardsTeamTwo = findedRoom.teamTwo.map((p) => {
            // 	const allZero = p.cards.every(card => card === 0);
            // 	return allZero;
            // });
            // const teamTwoTrue = playedCardsTeamTwo.every(c => c === true) ? true : false;
            // if (teamOneTrue && teamTwoTrue) {
            // 	totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
            // }
            return findedRoom
        }

    } catch (error) {
        console.error('Error in shuffleCards:', error);
    }
};
module.exports = botGamePlay;