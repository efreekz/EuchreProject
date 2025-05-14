const delay = require("./gameTable/delay");
const { getRemainingSeconds } = require("./timerTable/setTimer");

let userUpdating = {}
async function updateRoomRoleToBot(roomId, socketId, client) {
    try {
        let isUpdated = false;

        // Fetch or initialize user roles
        let roomData = await client.json.get(roomId);
        if (typeof roomData === 'string') {
            roomData = JSON.parse(roomData);
        }
        let userRoles = await client.json.get(`${roomId}roles`);
        if (!userRoles && roomData) {
            userRoles = {};
            await client.json.set(`${roomId}roles`, '$', userRoles);
        }

        // Fetch room data

        if (!roomData) {
            console.log('room not found: ' + roomId);
        }

        if (roomData) {


            const updateTeamRole = async (team) => {
                if (team) {
                    return team.map(player => {
                        if ((player?.socketId === socketId || userRoles[`${player?.UserId}SocketId`] === socketId ) && (player?.role === 'user')) {
                            isUpdated = true;
                            userRoles[player?.UserId] = 'bot';
                            userRoles[`${player?.UserId}UserId`] = player?.UserId;
                            userRoles[`${player?.UserId}SocketId`] = player?.socketId;
                            player.role = 'bot';
                        }
                        return player;
                    });
                }
            };

            // Update roles in both teams
            roomData.teamOne = await updateTeamRole(roomData?.teamOne);
            roomData.teamTwo = await updateTeamRole(roomData?.teamTwo);

            // Update user roles if any changes were made
            console.log('userRoles out of if', userRoles)
            if (isUpdated) {
                console.log('userRoles', userRoles)
                await client.json.set(`${roomId}roles`, '$', userRoles);
            }
        }
        return roomData;
    } catch (error) {
        console.error('Error updating room role to bot:', error);
        throw error;
    }
}


async function updateRoomRoleToUser(userId, roomId, socketId, client, socket) {
    try {

        let avlableMatch = await client.json.get(roomId);
        if (typeof avlableMatch === 'string') {
            avlableMatch = JSON.parse(avlableMatch);
        }
        if (typeof avlableMatch === 'string') {
            avlableMatch = JSON.parse(avlableMatch);
        }
        if (avlableMatch?._id !== roomId) {

            socket.emit('isMatchOver', { isMatchOver: true });
            return
        } else {
            let totalTrickPoint = avlableMatch?.teamOnePoints?.trikPoint + avlableMatch?.teamTwoPoints?.trikPoint
            if ((avlableMatch?.teamOnePoints?.winningPoint >= 9 || avlableMatch?.teamTwoPoints?.winningPoint >= 9) && totalTrickPoint >= 2) {
                socket.emit('isMatchOver', { isMatchOver: true });
            } else {
                socket.data.roomId = roomId;
                socket.emit('isMatchOver', { isMatchOver: false });
            }
        }
        // function getTrumpSuitFromSelectBTN(leadCard) {
        //     const getCardDetails = (cardString) => {
        //         const rank = cardString.slice(0, -1);  // Everything except the last character is the rank
        //         const suitChar = cardString.slice(-1); // Last character is the suit
        //         const suitMap = {
        //             's': 's',
        //             'h': 'h',
        //             'd': 'd',
        //             'c': 'c'
        //         };
        //         return {
        //             rank,
        //             suit: suitMap[suitChar] || 'unknown'  // Handle invalid suit gracefully
        //         };
        //     };
        //     const cardDetails = getCardDetails(leadCard);
        //     return {
        //         rank: cardDetails?.rank,
        //         suit: cardDetails?.suit
        //     };
        // };

        let isUpdate = false;

        let findedRoom;
        let findUserRoles = await client.json.get(`${roomId}roles`)


        if (roomId) {
            findedRoom = await client.json.get(roomId);
        }
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (!findUserRoles && findedRoom) {
            findUserRoles = {};
            await client.json.set(`${roomId}roles`, '$', findUserRoles);
        }
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }

        if (findedRoom && findUserRoles) {
            let isTeam = '';
            let isTeamPlayerIndex;
            const updateTeamRole = async (team, teamName) => {
                return team.map((player, index) => {
                    if (player?.UserId === userId) {
                        isUpdate = true
                        player.role = 'user';
                        findUserRoles[player?.UserId] = 'user';
                        findUserRoles[`${player?.UserId}SocketId`] = socketId;
                        findUserRoles[`${player?.UserId}UserId`] = player?.UserId;
                        player.socketId = socketId;
                        isTeam = teamName;
                        isTeamPlayerIndex = index
                    }
                    return player;
                });
            };

            const [updatedTeamOne, updatedTeamTwo] = await Promise.all([
                updateTeamRole(findedRoom?.teamOne, 'teamOne'),
                updateTeamRole(findedRoom?.teamTwo, 'teamTwo')
            ]);

            findedRoom.teamOne = await updatedTeamOne;
            findedRoom.teamTwo = await updatedTeamTwo;


            // Store the updated room data back to Redis
            // if (isUpdate) {

            //     let { dealerId, players, isTrumpSelected, nextTurnId, nextTurnTimeOut, showTrumpBoxTimeOut, showTrumpBoxId, isCardRemovedByDealer, isPlayAloneORNotSelectedId, isPlayAloneORNotSelected, dealerRemoveCardTimeOut, isPlayAlonorNotTimeOUt } = await getPlayers(findedRoom);

            //     if (nextTurnTimeOut) {
            //         nextTurnTimeOut = await getRemainingSeconds(nextTurnTimeOut)
            //     };
            //     if (dealerRemoveCardTimeOut) {
            //         dealerRemoveCardTimeOut = await getRemainingSeconds(nextTurnTimeOut)
            //     };
            //     if (showTrumpBoxTimeOut) {
            //         showTrumpBoxTimeOut = await getRemainingSeconds(showTrumpBoxTimeOut)
            //     };
            //     if (isPlayAlonorNotTimeOUt) {
            //         isPlayAlonorNotTimeOUt = await getRemainingSeconds(showTrumpBoxTimeOut)
            //     };
            //     let rejoinData = {
            //         players: players,
            //         kitty: findedRoom?.totalCards,
            //         dealerId: dealerId ? dealerId : null,
            //         leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
            //         playedCards: findedRoom?.playedCards.length > 0 ? findedRoom?.playedCards : [],
            //         teamOnePoints: findedRoom?.teamOnePoints ? findedRoom?.teamOnePoints : null,
            //         teamTwoPoints: findedRoom?.teamTwoPoints ? findedRoom?.teamTwoPoints : null,
            //     }

            //     if (isTrumpSelected) {
            //         rejoinData.isTrumpSelected = isTrumpSelected;
            //         rejoinData.trumpSuit = findedRoom?.trumpSuit;
            //         rejoinData.trumpMaker = findedRoom?.trumpMaker;
            //         rejoinData.nextTurnId = nextTurnId;
            //         rejoinData.nextTurnTimeOut = nextTurnTimeOut ? nextTurnTimeOut : 0;
            //         rejoinData.isCardRemovedByDealer = isCardRemovedByDealer;
            //         rejoinData.dealerRemoveCardTimeOut = dealerRemoveCardTimeOut ? dealerRemoveCardTimeOut : 0;
            //         rejoinData.isPlayAloneORNotSelected = isPlayAloneORNotSelected;
            //         rejoinData.isPlayAloneORNotSelectedId = isPlayAloneORNotSelectedId;
            //         rejoinData.isPlayAloneOrNotTimeOut = isPlayAlonorNotTimeOUt ? isPlayAlonorNotTimeOUt : 0;
            //     } else if (!isTrumpSelected) {
            //         let disabledSuite;
            //         if (findedRoom?.trumpRound === 1) {
            //             let desabledCard = await getTrumpSuitFromSelectBTN(findedRoom?.totalCards[0]);
            //             disabledSuite = desabledCard?.suit;
            //         }
            //         rejoinData.isTrumpSelected = isTrumpSelected;
            //         rejoinData.trumpRound = findedRoom?.trumpRound;
            //         rejoinData.disabledSuite = disabledSuite;
            //         rejoinData.showTrumpBoxTimeOut = showTrumpBoxTimeOut ? showTrumpBoxTimeOut : 0;
            //         rejoinData.showTrumpBoxId = showTrumpBoxId;
            //     }
            //     // await client.json.set(`${roomId}roles`, '$', findUserRoles);
            //     // await client.json.set(roomId, `$.${isTeam}[${isTeamPlayerIndex}].role`, 'user');
            //     // await client.json.set(roomId, `$.${isTeam}[${isTeamPlayerIndex}].socketId`, socketId);
            //     // await client.json.set(roomId, '$', findedRoom);


            //     socket.emit('rejoinData', { roomData: rejoinData });
            const updateRoles = await client.json.set(`${roomId}roles`, '$', findUserRoles);
            console.log('updateRoles', updateRoles)
            return updateRoles  // Return the updated room data if needed for further use
            // }
        }


    } catch (error) {
        console.error('Error updating room role to user:', error);
        throw error;  // Rethrow the error for the caller to handle
    }
}

const getPlayers = async (findedRoom) => {
    let dealerId = null;
    let isTrumpSelected = true;
    let isCardRemovedByDealer = false;
    let dealerRemoveCardTimeOut = '';
    let isPlayAloneORNotSelected = false;
    let isPlayAloneORNotSelectedId = '';
    let isPlayAlonorNotTimeOUt = '';
    let nextTurnId = false;
    let nextTurnTimeOut = false;

    let showTrumpBoxId = '';
    let showTrumpBoxTimeOut = '';



    const playersPromises = findedRoom?.players.map(async (player) => {
        let matchedPlayer = null;
        const playerUserId = player?.UserId;
        findedRoom?.teamOne.find((e, index) => {
            if (e?.isDealer) {
                dealerId = e?.UserId;

                if ((e?.cards && e?.cards.length > 5) && findedRoom?.isTrumpSelected) {
                    isCardRemovedByDealer = false;
                    dealerRemoveCardTimeOut = e?.timeOut;

                } else if ((e?.cards && e?.cards.length <= 5) && findedRoom?.isTrumpSelected) {
                    isCardRemovedByDealer = true;
                }
            }
            if (findedRoom?.isPlayAloneSelected) {
                isPlayAloneORNotSelected = true;
                isPlayAloneORNotSelectedId = e?.UserId;;
                isPlayAlonorNotTimeOUt = e?.timeOut;
            }
            if (e?.isTurn) {
                nextTurnId = e?.UserId;
                nextTurnTimeOut = e?.timeOut;
            }


            if (e?.isTrumpShow && isTrumpSelected) {
                isTrumpSelected = false;
                showTrumpBoxTimeOut = e?.timeOut;
                showTrumpBoxId = e?.UserId;
            } else if (e?.isTrumpShow === false && findedRoom?.isTrumpSelected) {
                isTrumpSelected = true;
            }

            if (e?.UserId === playerUserId) {
                matchedPlayer = { ...e, indexInTeam: index, team: 'teamOne' };
                if (Array.isArray(matchedPlayer?.cards)) {
                    matchedPlayer.cards = matchedPlayer?.cards.map(card => card === 0 ? null : card);
                }
                return true;
            }
            return false;
        });

        if (!matchedPlayer || matchedPlayer == null) {
            findedRoom?.teamTwo.find((e, index) => {
                if (e?.isDealer) {
                    dealerId = e?.UserId;

                    if ((e?.cards && e?.cards.length > 5) && findedRoom?.isTrumpSelected) {
                        isCardRemovedByDealer = false;
                        dealerRemoveCardTimeOut = e?.timeOut;

                    } else if ((e?.cards && e?.cards.length <= 5) && findedRoom?.isTrumpSelected) {
                        isCardRemovedByDealer = true;

                    }
                }
                if (findedRoom?.isPlayAloneSelected) {
                    isPlayAloneORNotSelected = true;
                    isPlayAloneORNotSelectedId = e?.UserId;
                    isPlayAlonorNotTimeOUt = e?.timeOut;
                }
                if (e?.isTurn) {
                    nextTurnId = e?.UserId;
                    nextTurnTimeOut = e?.timeOut;
                }
                if (e?.isTrumpShow && isTrumpSelected) {
                    isTrumpSelected = false;
                    showTrumpBoxTimeOut = e?.timeOut;
                    showTrumpBoxId = e?.UserId;
                } else if (e?.isTrumpShow === false && findedRoom?.isTrumpSelected) {
                    isTrumpSelected = true;
                }
                if (e?.UserId === playerUserId) {
                    matchedPlayer = { ...e, indexInTeam: index, team: 'teamTwo' };
                    if (Array.isArray(matchedPlayer?.cards)) {
                        matchedPlayer.cards = matchedPlayer?.cards.map(card => card === 0 ? null : card);
                    }
                    return true;
                }
                return false;
            });
        }

        return matchedPlayer || null;
    });

    const playersResults = await Promise.all(playersPromises);

    isTrumpSelected = findedRoom?.isTrumpSelected;

    const filteredPlayers = playersResults.filter((player) => player !== null);

    // Return both the dealerId and the filtered players

    return {
        showTrumpBoxTimeOut,
        showTrumpBoxId,
        dealerId,
        players: filteredPlayers,
        isTrumpSelected,
        nextTurnTimeOut,
        nextTurnId,
        isCardRemovedByDealer,
        dealerRemoveCardTimeOut,
        isPlayAloneORNotSelected,
        isPlayAloneORNotSelectedId,
        isPlayAlonorNotTimeOUt
    };
}

function getTrumpSuitFromSelectBTN(leadCard) {
    const getCardDetails = (cardString) => {
        const rank = cardString.slice(0, -1);  // Everything except the last character is the rank
        const suitChar = cardString.slice(-1); // Last character is the suit
        const suitMap = {
            's': 's',
            'h': 'h',
            'd': 'd',
            'c': 'c'
        };
        return {
            rank,
            suit: suitMap[suitChar] || 'unknown'  // Handle invalid suit gracefully
        };
    };
    const cardDetails = getCardDetails(leadCard);
    return {
        rank: cardDetails?.rank,
        suit: cardDetails?.suit
    };
};

async function updateBotRoleInMainData(roomId, findedRoom, client, io, isDelay) {
    try {
        let isUpdate = false;


        // Parse findedRoom if it's a string
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }

        // Get user roles from Redis
        let findUserRoles = await client.json.get(`${roomId}roles`);

        if (findedRoom && findUserRoles) {
            const updateTeamRole = async (team) => {
                return Promise.all(team.map(async (player) => {
                    const newRole = findUserRoles[player?.UserId];
                    const roleUserId = findUserRoles[`${player?.UserId}UserId`];
                    const newSocketId = findUserRoles[`${player?.UserId}SocketId`];
                    if ((roleUserId === player?.UserId && !userUpdating[player?.UserId]) && (newRole === "user")) {
                        isUpdate = true;
                        userUpdating[player?.UserId] = true;
                        player.role = newRole ? newRole : player?.role;
                        player.socketId = newSocketId ? newSocketId : player?.socketId;



                        console.log('in player matched from role')
                        if (isUpdate && newSocketId) {

                            let { dealerId, players, isTrumpSelected, nextTurnId, nextTurnTimeOut, showTrumpBoxTimeOut, showTrumpBoxId, isCardRemovedByDealer, isPlayAloneORNotSelectedId, isPlayAloneORNotSelected, dealerRemoveCardTimeOut, isPlayAlonorNotTimeOUt } = await getPlayers(findedRoom);

                            if (nextTurnTimeOut) {
                                nextTurnTimeOut = await getRemainingSeconds(nextTurnTimeOut)
                            };
                            if (dealerRemoveCardTimeOut) {
                                dealerRemoveCardTimeOut = await getRemainingSeconds(nextTurnTimeOut)
                            };
                            if (showTrumpBoxTimeOut) {
                                showTrumpBoxTimeOut = await getRemainingSeconds(showTrumpBoxTimeOut)
                            };
                            if (isPlayAlonorNotTimeOUt) {
                                isPlayAlonorNotTimeOUt = await getRemainingSeconds(showTrumpBoxTimeOut)
                            };
                            let rejoinData = {
                                players: players,
                                kitty: findedRoom?.totalCards,
                                dealerId: dealerId ? dealerId : null,
                                leadSuit: findedRoom?.playedCards.length > 0 && findedRoom?.playedCards[0]?.card ? findedRoom?.playedCards[0]?.card : '',
                                playedCards: findedRoom?.playedCards.length > 0 ? findedRoom?.playedCards : [],
                                teamOnePoints: findedRoom?.teamOnePoints ? findedRoom?.teamOnePoints : null,
                                teamTwoPoints: findedRoom?.teamTwoPoints ? findedRoom?.teamTwoPoints : null,
                            }

                            if (isTrumpSelected) {
                                rejoinData.isTrumpSelected = isTrumpSelected;
                                rejoinData.trumpSuit = findedRoom?.trumpSuit;
                                rejoinData.trumpMaker = findedRoom?.trumpMaker;
                                rejoinData.nextTurnId = nextTurnId;
                                rejoinData.nextTurnTimeOut = nextTurnTimeOut ? nextTurnTimeOut : 0;
                                rejoinData.isCardRemovedByDealer = isCardRemovedByDealer;
                                rejoinData.dealerRemoveCardTimeOut = dealerRemoveCardTimeOut ? dealerRemoveCardTimeOut : 0;
                                rejoinData.isPlayAloneORNotSelected = isPlayAloneORNotSelected;
                                rejoinData.isPlayAloneORNotSelectedId = isPlayAloneORNotSelectedId;
                                rejoinData.isPlayAloneOrNotTimeOut = isPlayAlonorNotTimeOUt ? isPlayAlonorNotTimeOUt : 0;
                            } else if (!isTrumpSelected) {
                                let disabledSuite;
                                if (findedRoom?.trumpRound === 1) {
                                    let desabledCard = await getTrumpSuitFromSelectBTN(findedRoom?.totalCards[0]);
                                    disabledSuite = desabledCard?.suit;
                                }
                                rejoinData.isTrumpSelected = isTrumpSelected;
                                rejoinData.trumpRound = findedRoom?.trumpRound;
                                rejoinData.disabledSuite = disabledSuite;
                                rejoinData.showTrumpBoxTimeOut = showTrumpBoxTimeOut ? showTrumpBoxTimeOut : 0;
                                rejoinData.showTrumpBoxId = showTrumpBoxId;
                            }


                            const socket = io.sockets.sockets.get(newSocketId);
                            // await client.json.set(`${roomId}roles`, '$', findUserRoles);
                            // await client.json.set(roomId, `$.${isTeam}[${isTeamPlayerIndex}].role`, 'user');
                            // await client.json.set(roomId, `$.${isTeam}[${isTeamPlayerIndex}].socketId`, socketId);
                            // await client.json.set(roomId, '$', findedRoom);

                            if (socket) {
                                console.log('rejoinData', rejoinData)

                                socket.emit('rejoinData', { roomData: rejoinData });
                                // Emit event to the specific socket

                                findUserRoles[player.UserId] = '';
                                findUserRoles[`${player.UserId}UserId`] = '';
                                findUserRoles[`${player.UserId}SocketId`] = '';

                                await client.json.set(`${roomId}roles`, '$', findUserRoles);

                                socket.join(roomId); // Join the room
                                socket.data.roomId = roomId;

                                if (isDelay === true) {
                                    await delay(500);
                                }
                            } else {
                                console.log('Socket not found for ID: ' + newSocketId);
                            }
                            // await client.json.set(`${roomId}roles`, '$', findUserRoles);;  // Return the updated room data if needed for further use
                        }
                        delete userUpdating[player?.UserId];
                    } else {
                        isUpdate = false;
                        delete userUpdating[player?.UserId];
                    }
                    return player;
                }));
            };

            findedRoom.teamOne = await updateTeamRole(findedRoom?.teamOne);
            findedRoom.teamTwo = await updateTeamRole(findedRoom?.teamTwo);
        }

        return findedRoom;  // Return the updated room data if needed for further use

    } catch (error) {
        console.error('Error updating room role to main data :', error);
        throw error;  // Rethrow the error for the caller to handle
    }
}
async function updateUserToBotInMainData(roomId, findedRoom, client) {
    try {
        let isUpdate = false;

        // Parse findedRoom if it's a string
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }

        // Get user roles from Redis
        let findUserRoles = await client.json.get(`${roomId}roles`);

        if (findedRoom && findUserRoles) {
            const updateTeamRole = async (team) => {
                return Promise.all(team.map(async (player) => {
                    try {
                        const newRole = findUserRoles[player?.UserId];
                        const roleUserId = findUserRoles[`${player?.UserId}UserId`];
                        if ((roleUserId === player?.UserId) && (newRole === 'bot' && player?.role === 'user')) {
                            console.log(`Updating player ${player?.UserId} role to bot`);
                            isUpdate = true;
                            player.role = newRole ? newRole : player?.role;
                        }
                    } catch (error) {
                        console.error('Error updating player role:', player, error);
                    }
                    return player;
                }));
            };

            findedRoom.teamOne = await updateTeamRole(findedRoom?.teamOne);
            findedRoom.teamTwo = await updateTeamRole(findedRoom?.teamTwo);
        }

        return findedRoom;  // Return the updated room data if needed for further use

    } catch (error) {
        console.error('Error updating room role to user from main data:', error);
        throw error;  // Rethrow the error for the caller to handle
    }
}



module.exports = { updateRoomRoleToBot, updateRoomRoleToUser, updateBotRoleInMainData, updateUserToBotInMainData };
