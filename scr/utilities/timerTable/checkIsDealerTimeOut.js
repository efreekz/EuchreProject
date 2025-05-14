const delay = require('../botTable/delay')
const EuchreBotPlayer = require('../../botDemo');
const handleRemoveExtraCard = require('../botTable/removeCardByDealer');
const client = require('../redisClient');
const { isCurrentTimeGreaterThan } = require('./setTimer');
const { updateBotRoleInMainData, updateUserToBotInMainData } = require('../updateRoomRoleToBot');


const checkIsDealerTimeOut = async (oldData, roomId, io) => {
    let findedRoom = await client.json.get(roomId);
    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }
    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }

    // findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io);
    findedRoom = await updateUserToBotInMainData(roomId, findedRoom, client, io);

    if (findedRoom && findedRoom?.isGameEnd) {
        await client.del(roomId);
        await client.del(`${roomId}roles`);
    } else if (findedRoom && (findedRoom?.teamOne[0]?.isDealer == true) && findedRoom?.teamOne[0]?.cards.length > 5) {

        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamOne[0]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await delay(1000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamOne[0]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamOne[0]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamOne[0]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamTwo[0].isDealer == true ) && findedRoom.teamTwo[0].cards.length > 5) {

        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         return findedRoom
        //     }

        //     await delay(1000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;

        //     if ((findedRoom.teamOne[1].isDealer == true ) && findedRoom.teamOne[1].cards.length > 5) {

        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             return findedRoom
        //         }

        //         await delay(1000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;

        //         if ((findedRoom.teamTwo[1].isDealer == true ) && findedRoom.teamTwo[1].cards.length > 5) {

        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 return findedRoom
        //             }

        //             await delay(1000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;

        //             if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     return findedRoom
        //                 }

        //                 await delay(1000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamTwo[0].isDealer == true ) && findedRoom.teamTwo[0].cards.length > 5) {

        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         return findedRoom
        //                     }

        //                     await delay(1000);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //                     await euchreBot.setDealer(true);
        //                     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //                     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                     findedRoom = await updatedRoom;

        //                     if ((findedRoom.teamOne[1].isDealer == true ) && findedRoom.teamOne[1].cards.length > 5) {

        //                         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //                         if (CheckIsTimeOut === false) {
        //                             return findedRoom
        //                         }

        //                         await delay(1000);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                         await euchreBot.setDealer(true);
        //                         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //                         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                         findedRoom = await updatedRoom;

        //                         if ((findedRoom.teamTwo[1].isDealer == true ) && findedRoom.teamTwo[1].cards.length > 5) {

        //                             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                             if (CheckIsTimeOut === false) {
        //                                 return findedRoom
        //                             }

        //                             await delay(1000);
        //                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                             await euchreBot.setDealer(true);
        //                             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                             findedRoom = await updatedRoom;

        //                             if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //                                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                                 if (CheckIsTimeOut === false) {
        //                                     return findedRoom
        //                                 }

        //                                 await delay(1000);
        //                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                                 await euchreBot.setDealer(true);
        //                                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //                                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                                 findedRoom = await updatedRoom;

        //                             }

        //                         }

        //                     }
        //                 }
        //             }

        //         }

        //     }
        // }
    } else if (findedRoom && (findedRoom?.teamTwo[0]?.isDealer == true) && findedRoom?.teamTwo[0]?.cards.length > 5) {

        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamTwo[0]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await delay(1000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamTwo[0]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamTwo[0]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamTwo[0]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamOne[1].isDealer == true ) && findedRoom.teamOne[1].cards.length > 5) {

        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         return findedRoom
        //     }

        //     await delay(1000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;

        //     if ((findedRoom.teamTwo[1].isDealer == true ) && findedRoom.teamTwo[1].cards.length > 5) {

        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             return findedRoom
        //         }

        //         await delay(1000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;

        //         if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 return findedRoom
        //             }

        //             await delay(1000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;
        //             if ((findedRoom.teamTwo[0].isDealer == true ) && findedRoom.teamTwo[0].cards.length > 5) {

        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     return findedRoom
        //                 }

        //                 await delay(1000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamOne[1].isDealer == true ) && findedRoom.teamOne[1].cards.length > 5) {

        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         return findedRoom
        //                     }

        //                     await delay(1000);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                     await euchreBot.setDealer(true);
        //                     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //                     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                     findedRoom = await updatedRoom;

        //                     if ((findedRoom.teamTwo[1].isDealer == true ) && findedRoom.teamTwo[1].cards.length > 5) {

        //                         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                         if (CheckIsTimeOut === false) {
        //                             return findedRoom
        //                         }

        //                         await delay(1000);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                         await euchreBot.setDealer(true);
        //                         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                         findedRoom = await updatedRoom;

        //                         if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //                             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                             if (CheckIsTimeOut === false) {
        //                                 return findedRoom
        //                             }

        //                             await delay(1000);
        //                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                             await euchreBot.setDealer(true);
        //                             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //                             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                             findedRoom = await updatedRoom;

        //                         }

        //                     }

        //                 }
        //             }
        //         }
        //     }

        // }
    } else if (findedRoom && (findedRoom?.teamOne[1]?.isDealer == true) && findedRoom?.teamOne[1]?.cards.length > 5) {

        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamOne[1]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await delay(1000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamOne[1]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamOne[1]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamOne[1]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamTwo[1].isDealer == true ) && findedRoom.teamTwo[1].cards.length > 5) {

        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         return findedRoom
        //     }

        //     await delay(1000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;

        //     if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             return findedRoom
        //         }

        //         await delay(1000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;
        //         if ((findedRoom.teamTwo[0].isDealer == true ) && findedRoom.teamTwo[0].cards.length > 5) {

        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 return findedRoom
        //             }

        //             await delay(1000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //             await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;

        //             if ((findedRoom.teamOne[1].isDealer == true ) && findedRoom.teamOne[1].cards.length > 5) {

        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     return findedRoom
        //                 }

        //                 await delay(1000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamTwo[1].isDealer == true ) && findedRoom.teamTwo[1].cards.length > 5) {

        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         return findedRoom
        //                     }

        //                     await delay(1000);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                     await euchreBot.setDealer(true);
        //                     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                     findedRoom = await updatedRoom;

        //                     if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //                         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                         if (CheckIsTimeOut === false) {
        //                             return findedRoom
        //                         }

        //                         await delay(1000);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                         await euchreBot.setDealer(true);
        //                         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //                         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                         findedRoom = await updatedRoom;

        //                     }

        //                 }

        //             }
        //         }
        //     }
        // }

    } else if (findedRoom && (findedRoom?.teamTwo[1]?.isDealer == true) && findedRoom?.teamTwo[1]?.cards.length > 5) {

        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamTwo[1]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await delay(1000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamTwo[1]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamTwo[1]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamTwo[1]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         return findedRoom
        //     }

        //     await delay(1000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;
        //     if ((findedRoom.teamTwo[0].isDealer == true ) && findedRoom.teamTwo[0].cards.length > 5) {

        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             return findedRoom
        //         }

        //         await delay(1000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //         await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;

        //         if ((findedRoom.teamOne[1].isDealer == true ) && findedRoom.teamOne[1].cards.length > 5) {

        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 return findedRoom
        //             }

        //             await delay(1000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;

        //             if ((findedRoom.teamTwo[1].isDealer == true ) && findedRoom.teamTwo[1].cards.length > 5) {

        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     return findedRoom
        //                 }

        //                 await delay(1000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamOne[0].isDealer == true ) && findedRoom.teamOne[0].cards.length > 5) {
        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         return findedRoom
        //                     }

        //                     await delay(1000);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                     await euchreBot.setDealer(true);
        //                     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //                     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                     findedRoom = await updatedRoom;

        //                 }

        //             }

        //         }
        //     }
        // }

    }



    return findedRoom
};
module.exports = checkIsDealerTimeOut;