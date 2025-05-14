const delay = require('./delay')
const EuchreBotPlayer = require('../../botDemo');
const handleRemoveExtraCard = require('./removeCardByDealer');
const checkIsBotDealer = async (findedRoom, roomId, io) => {
    if ((findedRoom?.teamOne[0]?.isDealer == true && findedRoom?.teamOne[0]?.role === 'bot') && findedRoom?.teamOne[0]?.cards.length > 5) {

        await delay(2000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamOne[0]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamOne[0]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamOne[0]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamTwo[0].isDealer == true && findedRoom.teamTwo[0].role === 'bot') && findedRoom.teamTwo[0].cards.length > 5) {

        //     await delay(2000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;

        //     if ((findedRoom.teamOne[1].isDealer == true && findedRoom.teamOne[1].role === 'bot') && findedRoom.teamOne[1].cards.length > 5) {

        //         await delay(2000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;

        //         if ((findedRoom.teamTwo[1].isDealer == true && findedRoom.teamTwo[1].role === 'bot') && findedRoom.teamTwo[1].cards.length > 5) {

        //             await delay(2000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;

        //             if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //                 await delay(2000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamTwo[0].isDealer == true && findedRoom.teamTwo[0].role === 'bot') && findedRoom.teamTwo[0].cards.length > 5) {

        //                     await delay(2000);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //                     await euchreBot.setDealer(true);
        //                     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //                     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                     findedRoom = await updatedRoom;

        //                     if ((findedRoom.teamOne[1].isDealer == true && findedRoom.teamOne[1].role === 'bot') && findedRoom.teamOne[1].cards.length > 5) {

        //                         await delay(2000);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                         await euchreBot.setDealer(true);
        //                         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //                         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                         findedRoom = await updatedRoom;

        //                         if ((findedRoom.teamTwo[1].isDealer == true && findedRoom.teamTwo[1].role === 'bot') && findedRoom.teamTwo[1].cards.length > 5) {

        //                             await delay(2000);
        //                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                             await euchreBot.setDealer(true);
        //                             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                             findedRoom = await updatedRoom;

        //                             if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //                                 await delay(2000);
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
    } else if ((findedRoom?.teamTwo[0]?.isDealer == true && findedRoom?.teamTwo[0]?.role === 'bot') && findedRoom?.teamTwo[0]?.cards.length > 5) {

        await delay(2000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamTwo[0]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamTwo[0]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamTwo[0]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamOne[1].isDealer == true && findedRoom.teamOne[1].role === 'bot') && findedRoom.teamOne[1].cards.length > 5) {

        //     await delay(2000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;

        //     if ((findedRoom.teamTwo[1].isDealer == true && findedRoom.teamTwo[1].role === 'bot') && findedRoom.teamTwo[1].cards.length > 5) {

        //         await delay(2000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;

        //         if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //             await delay(2000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;
        //             if ((findedRoom.teamTwo[0].isDealer == true && findedRoom.teamTwo[0].role === 'bot') && findedRoom.teamTwo[0].cards.length > 5) {

        //                 await delay(2000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamOne[1].isDealer == true && findedRoom.teamOne[1].role === 'bot') && findedRoom.teamOne[1].cards.length > 5) {

        //                     await delay(2000);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                     await euchreBot.setDealer(true);
        //                     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //                     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                     findedRoom = await updatedRoom;

        //                     if ((findedRoom.teamTwo[1].isDealer == true && findedRoom.teamTwo[1].role === 'bot') && findedRoom.teamTwo[1].cards.length > 5) {

        //                         await delay(2000);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                         await euchreBot.setDealer(true);
        //                         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                         findedRoom = await updatedRoom;

        //                         if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //                             await delay(2000);
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
    } else if ((findedRoom?.teamOne[1]?.isDealer == true && findedRoom?.teamOne[1]?.role === 'bot') && findedRoom?.teamOne[1]?.cards.length > 5) {

        await delay(2000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamOne[1]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamOne[1]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamOne[1]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamTwo[1].isDealer == true && findedRoom.teamTwo[1].role === 'bot') && findedRoom.teamTwo[1].cards.length > 5) {

        //     await delay(2000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;

        //     if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //         await delay(2000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;
        //         if ((findedRoom.teamTwo[0].isDealer == true && findedRoom.teamTwo[0].role === 'bot') && findedRoom.teamTwo[0].cards.length > 5) {

        //             await delay(2000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //             await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;

        //             if ((findedRoom.teamOne[1].isDealer == true && findedRoom.teamOne[1].role === 'bot') && findedRoom.teamOne[1].cards.length > 5) {

        //                 await delay(2000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamTwo[1].isDealer == true && findedRoom.teamTwo[1].role === 'bot') && findedRoom.teamTwo[1].cards.length > 5) {

        //                     await delay(2000);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                     await euchreBot.setDealer(true);
        //                     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                     findedRoom = await updatedRoom;

        //                     if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //                         await delay(2000);
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

    } else if ((findedRoom?.teamTwo[1]?.isDealer == true && findedRoom?.teamTwo[1]?.role === 'bot') && findedRoom?.teamTwo[1]?.cards.length > 5) {

        await delay(2000);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamTwo[1]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamTwo[1]?.cards);
        await euchreBot.setDealer(true);
        const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom?.teamTwo[1]?.cards, trump: findedRoom?.totalCards[0] })
        const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        findedRoom = await updatedRoom;

        // if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //     await delay(2000);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //     await euchreBot.setDealer(true);
        //     const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[0].cards, trump: findedRoom.totalCards[0] })
        //     const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //     findedRoom = await updatedRoom;
        //     if ((findedRoom.teamTwo[0].isDealer == true && findedRoom.teamTwo[0].role === 'bot') && findedRoom.teamTwo[0].cards.length > 5) {

        //         await delay(2000);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //         await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //         await euchreBot.setDealer(true);
        //         const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[0].cards, trump: findedRoom.totalCards[0] })
        //         const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //         findedRoom = await updatedRoom;

        //         if ((findedRoom.teamOne[1].isDealer == true && findedRoom.teamOne[1].role === 'bot') && findedRoom.teamOne[1].cards.length > 5) {

        //             await delay(2000);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //             await euchreBot.setDealer(true);
        //             const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamOne[1].cards, trump: findedRoom.totalCards[0] })
        //             const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //             findedRoom = await updatedRoom;

        //             if ((findedRoom.teamTwo[1].isDealer == true && findedRoom.teamTwo[1].role === 'bot') && findedRoom.teamTwo[1].cards.length > 5) {

        //                 await delay(2000);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                 await euchreBot.setDealer(true);
        //                 const removedCardSelected = await euchreBot.swapCard({ cards: findedRoom.teamTwo[1].cards, trump: findedRoom.totalCards[0] })
        //                 const updatedRoom = await handleRemoveExtraCard(removedCardSelected, roomId, findedRoom, io)
        //                 findedRoom = await updatedRoom;

        //                 if ((findedRoom.teamOne[0].isDealer == true && findedRoom.teamOne[0].role === 'bot') && findedRoom.teamOne[0].cards.length > 5) {
        //                     await delay(2000);
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
module.exports = checkIsBotDealer;