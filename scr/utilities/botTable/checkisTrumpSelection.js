const delay = require('./delay');
const EuchreBotPlayer = require('../../botDemo');
const parseTrumCard = require('./parseTrumCard');
const handleOrderUp = require('./orderUpForBot');
const TrumpBoxManager = require('./trumpBoxManager');
const handleCallSuiteSelection = require('./orderTrupSuitForBot');
const client = require('../redisClient');
const { updateBotRoleInMainData, updateUserToBotInMainData } = require('../updateRoomRoleToBot');


const checkIsBotTrumpSelection = async (findedRoomData, io, roomId,) => {
    console.log('check is bot trump')
    let findedRoom = findedRoomData;
    // findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io);
    findedRoom = await updateUserToBotInMainData(roomId, findedRoom, client, io);
    if (findedRoom?.teamOne[0]?.isTrumpShow == true && findedRoom?.teamOne[0]?.role === 'bot') {

        await delay(1500);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamOne[0]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamOne[0]?.cards);
        const trumpCardSuit = await parseTrumCard(findedRoom?.totalCards[0]);
        const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump();
            let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedrom;
        } else if (isSelected) {
            let selectedCard = findedRoom?.totalCards[0];
            const e = { findedRoom, roomId, io, selectedCard };
            let updatedRom = await handleOrderUp(e);
            findedRoom = updatedRom;
        } else if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump()
            let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedRom;

        } else if (!isSelected) {
            const trumpBoxManager = new TrumpBoxManager(io, client);
            let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
            findedRoom = updatedRom;
        };
        await client.json.set(roomId, '$', findedRoom);

        // if (findedRoom.teamTwo[0].isTrumpShow == true && findedRoom.teamTwo[0].role === 'bot') {

        //     await delay(1500);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //     if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump();
        //         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedrom;
        //     } else if (isSelected) {
        //         let selectedCard = findedRoom.totalCards[0];
        //         const e = { findedRoom, roomId, io, selectedCard };
        //         let updatedRom = await handleOrderUp(e);
        //         findedRoom = updatedRom;
        //     } else if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump()
        //         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedRom;

        //     } else if (!isSelected) {
        //         const trumpBoxManager = new TrumpBoxManager(io,client);
        //         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //         findedRoom = updatedRom;
        //     };
        //      await client.json.set(roomId, '$', findedRoom);

        //     if (findedRoom.teamOne[1].isTrumpShow == true && findedRoom.teamOne[1].role === 'bot') {

        //         await delay(1500);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //         const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //         const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //         if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump();
        //             let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedrom;
        //         } else if (isSelected) {
        //             let selectedCard = findedRoom.totalCards[0];
        //             const e = { findedRoom, roomId, io, selectedCard };
        //             let updatedRom = await handleOrderUp(e);
        //             findedRoom = updatedRom;
        //         } else if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump()
        //             let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedRom;

        //         } else if (!isSelected) {
        //             const trumpBoxManager = new TrumpBoxManager(io,client);
        //             let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //             findedRoom = updatedRom;
        //         };
        //          await client.json.set(roomId, '$', findedRoom);

        //         if (findedRoom.teamTwo[1].isTrumpShow == true && findedRoom.teamTwo[1].role === 'bot') {

        //             await delay(1500);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //             const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //             const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //             if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump();
        //                 let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedrom;
        //             } else if (isSelected) {
        //                 let selectedCard = findedRoom.totalCards[0];
        //                 const e = { findedRoom, roomId, io, selectedCard };
        //                 let updatedRom = await handleOrderUp(e);
        //                 findedRoom = updatedRom;
        //             } else if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump()
        //                 let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedRom;

        //             } else if (!isSelected) {
        //                 const trumpBoxManager = new TrumpBoxManager(io,client);
        //                 let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                 findedRoom = updatedRom;
        //             };
        //              await client.json.set(roomId, '$', findedRoom);

        //             if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //                 await delay(1500);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                 const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                 const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                 if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump();
        //                     let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedrom;
        //                 } else if (isSelected) {
        //                     let selectedCard = findedRoom.totalCards[0];
        //                     const e = { findedRoom, roomId, io, selectedCard };
        //                     let updatedRom = await handleOrderUp(e);
        //                     findedRoom = updatedRom;
        //                 } else if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump()
        //                     let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedRom;

        //                 } else if (!isSelected) {
        //                     const trumpBoxManager = new TrumpBoxManager(io,client);
        //                     let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                     findedRoom = updatedRom;
        //                 };
        //                  await client.json.set(roomId, '$', findedRoom);

        //                 if (findedRoom.teamTwo[0].isTrumpShow == true && findedRoom.teamTwo[0].role === 'bot') {

        //                     await delay(1500);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //                     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                     if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump();
        //                         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedrom;
        //                     } else if (isSelected) {
        //                         let selectedCard = findedRoom.totalCards[0];
        //                         const e = { findedRoom, roomId, io, selectedCard };
        //                         let updatedRom = await handleOrderUp(e);
        //                         findedRoom = updatedRom;
        //                     } else if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump()
        //                         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedRom;

        //                     } else if (!isSelected) {
        //                         const trumpBoxManager = new TrumpBoxManager(io,client);
        //                         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                         findedRoom = updatedRom;
        //                     };
        //                      await client.json.set(roomId, '$', findedRoom);

        //                     if (findedRoom.teamOne[1].isTrumpShow == true && findedRoom.teamOne[1].role === 'bot') {

        //                         await delay(1500);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                         const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                         const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                         if (findedRoom.trumpRound === 1) {
        //                             const selectedCard = await euchreBot.chooseTrump();
        //                             let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                             findedRoom = updatedrom;
        //                         } else if (isSelected) {
        //                             let selectedCard = findedRoom.totalCards[0];
        //                             const e = { findedRoom, roomId, io, selectedCard };
        //                             let updatedRom = await handleOrderUp(e);
        //                             findedRoom = updatedRom;
        //                         } else if (findedRoom.trumpRound === 1) {
        //                             const selectedCard = await euchreBot.chooseTrump()
        //                             let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                             findedRoom = updatedRom;

        //                         } else if (!isSelected) {
        //                             const trumpBoxManager = new TrumpBoxManager(io,client);
        //                             let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                             findedRoom = updatedRom;
        //                         };
        //                          await client.json.set(roomId, '$', findedRoom);

        //                         if (findedRoom.teamTwo[1].isTrumpShow == true && findedRoom.teamTwo[1].role === 'bot') {

        //                             await delay(1500);
        //                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                             const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                             const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                             if (findedRoom.trumpRound === 1) {
        //                                 const selectedCard = await euchreBot.chooseTrump();
        //                                 let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                                 findedRoom = updatedrom;
        //                             } else if (isSelected) {
        //                                 let selectedCard = findedRoom.totalCards[0];
        //                                 const e = { findedRoom, roomId, io, selectedCard };
        //                                 let updatedRom = await handleOrderUp(e);
        //                                 findedRoom = updatedRom;
        //                             } else if (findedRoom.trumpRound === 1) {
        //                                 const selectedCard = await euchreBot.chooseTrump()
        //                                 let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                                 findedRoom = updatedRom;

        //                             } else if (!isSelected) {
        //                                 const trumpBoxManager = new TrumpBoxManager(io,client);
        //                                 let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                                 findedRoom = updatedRom;
        //                             };
        //                              await client.json.set(roomId, '$', findedRoom);

        //                             if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //                                 await delay(1500);
        //                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                                 const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                                 const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                                 if (findedRoom.trumpRound === 1) {
        //                                     const selectedCard = await euchreBot.chooseTrump();
        //                                     let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                                     findedRoom = updatedrom;
        //                                 } else if (isSelected) {
        //                                     let selectedCard = findedRoom.totalCards[0];
        //                                     const e = { findedRoom, roomId, io, selectedCard };
        //                                     let updatedRom = await handleOrderUp(e);
        //                                     findedRoom = updatedRom;
        //                                 } else if (findedRoom.trumpRound === 1) {
        //                                     const selectedCard = await euchreBot.chooseTrump()
        //                                     let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                                     findedRoom = updatedRom;

        //                                 } else if (!isSelected) {
        //                                     const trumpBoxManager = new TrumpBoxManager(io,client);
        //                                     let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                                     findedRoom = updatedRom;
        //                                 };
        //                                  await client.json.set(roomId, '$', findedRoom);

        //                             }

        //                         }

        //                     }
        //                 }
        //             }

        //         }

        //     }
        // }
    } else if (findedRoom?.teamTwo[0]?.isTrumpShow == true && findedRoom?.teamTwo[0]?.role === 'bot') {

        await delay(1500);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamTwo[0]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamTwo[0]?.cards);
        const trumpCardSuit = await parseTrumCard(findedRoom?.totalCards[0]);
        const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump();
            let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedrom;
        } else if (isSelected) {
            let selectedCard = findedRoom?.totalCards[0];
            const e = { findedRoom, roomId, io, selectedCard };
            let updatedRom = await handleOrderUp(e);
            findedRoom = updatedRom;
        } else if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump()
            let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedRom;

        } else if (!isSelected) {
            const trumpBoxManager = new TrumpBoxManager(io, client);
            let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
            findedRoom = updatedRom;
        };
        await client.json.set(roomId, '$', findedRoom);

        // if (findedRoom.teamOne[1].isTrumpShow == true && findedRoom.teamOne[1].role === 'bot') {

        //     await delay(1500);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //     if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump();
        //         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedrom;
        //     } else if (isSelected) {
        //         let selectedCard = findedRoom.totalCards[0];
        //         const e = { findedRoom, roomId, io, selectedCard };
        //         let updatedRom = await handleOrderUp(e);
        //         findedRoom = updatedRom;
        //     } else if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump()
        //         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedRom;

        //     } else if (!isSelected) {
        //         const trumpBoxManager = new TrumpBoxManager(io,client);
        //         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //         findedRoom = updatedRom;
        //     };
        //      await client.json.set(roomId, '$', findedRoom);

        //     if (findedRoom.teamTwo[1].isTrumpShow == true && findedRoom.teamTwo[1].role === 'bot') {

        //         await delay(1500);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //         const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //         const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //         if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump();
        //             let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedrom;
        //         } else if (isSelected) {
        //             let selectedCard = findedRoom.totalCards[0];
        //             const e = { findedRoom, roomId, io, selectedCard };
        //             let updatedRom = await handleOrderUp(e);
        //             findedRoom = updatedRom;
        //         } else if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump()
        //             let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedRom;

        //         } else if (!isSelected) {
        //             const trumpBoxManager = new TrumpBoxManager(io,client);
        //             let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //             findedRoom = updatedRom;
        //         };
        //          await client.json.set(roomId, '$', findedRoom);

        //         if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //             await delay(1500);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //             const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //             const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //             if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump();
        //                 let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedrom;
        //             } else if (isSelected) {
        //                 let selectedCard = findedRoom.totalCards[0];
        //                 const e = { findedRoom, roomId, io, selectedCard };
        //                 let updatedRom = await handleOrderUp(e);
        //                 findedRoom = updatedRom;
        //             } else if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump()
        //                 let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedRom;

        //             } else if (!isSelected) {
        //                 const trumpBoxManager = new TrumpBoxManager(io,client);
        //                 let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                 findedRoom = updatedRom;
        //             };
        //              await client.json.set(roomId, '$', findedRoom);
        //             if (findedRoom.teamTwo[0].isTrumpShow == true && findedRoom.teamTwo[0].role === 'bot') {

        //                 await delay(1500);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //                 const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                 const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                 if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump();
        //                     let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedrom;
        //                 } else if (isSelected) {
        //                     let selectedCard = findedRoom.totalCards[0];
        //                     const e = { findedRoom, roomId, io, selectedCard };
        //                     let updatedRom = await handleOrderUp(e);
        //                     findedRoom = updatedRom;
        //                 } else if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump()
        //                     let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedRom;

        //                 } else if (!isSelected) {
        //                     const trumpBoxManager = new TrumpBoxManager(io,client);
        //                     let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                     findedRoom = updatedRom;
        //                 };
        //                  await client.json.set(roomId, '$', findedRoom);

        //                 if (findedRoom.teamOne[1].isTrumpShow == true && findedRoom.teamOne[1].role === 'bot') {

        //                     await delay(1500);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                     if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump();
        //                         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedrom;
        //                     } else if (isSelected) {
        //                         let selectedCard = findedRoom.totalCards[0];
        //                         const e = { findedRoom, roomId, io, selectedCard };
        //                         let updatedRom = await handleOrderUp(e);
        //                         findedRoom = updatedRom;
        //                     } else if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump()
        //                         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedRom;

        //                     } else if (!isSelected) {
        //                         const trumpBoxManager = new TrumpBoxManager(io,client);
        //                         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                         findedRoom = updatedRom;
        //                     };
        //                      await client.json.set(roomId, '$', findedRoom);

        //                     if (findedRoom.teamTwo[1].isTrumpShow == true && findedRoom.teamTwo[1].role === 'bot') {

        //                         await delay(1500);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                         const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                         const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                         if (findedRoom.trumpRound === 1) {
        //                             const selectedCard = await euchreBot.chooseTrump();
        //                             let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                             findedRoom = updatedrom;
        //                         } else if (isSelected) {
        //                             let selectedCard = findedRoom.totalCards[0];
        //                             const e = { findedRoom, roomId, io, selectedCard };
        //                             let updatedRom = await handleOrderUp(e);
        //                             findedRoom = updatedRom;
        //                         } else if (findedRoom.trumpRound === 1) {
        //                             const selectedCard = await euchreBot.chooseTrump()
        //                             let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                             findedRoom = updatedRom;

        //                         } else if (!isSelected) {
        //                             const trumpBoxManager = new TrumpBoxManager(io,client);
        //                             let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                             findedRoom = updatedRom;
        //                         };
        //                          await client.json.set(roomId, '$', findedRoom);

        //                         if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //                             await delay(1500);
        //                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                             const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                             const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                             if (findedRoom.trumpRound === 1) {
        //                                 const selectedCard = await euchreBot.chooseTrump();
        //                                 let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                                 findedRoom = updatedrom;
        //                             } else if (isSelected) {
        //                                 let selectedCard = findedRoom.totalCards[0];
        //                                 const e = { findedRoom, roomId, io, selectedCard };
        //                                 let updatedRom = await handleOrderUp(e);
        //                                 findedRoom = updatedRom;
        //                             } else if (findedRoom.trumpRound === 1) {
        //                                 const selectedCard = await euchreBot.chooseTrump()
        //                                 let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                                 findedRoom = updatedRom;

        //                             } else if (!isSelected) {
        //                                 const trumpBoxManager = new TrumpBoxManager(io,client);
        //                                 let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                                 findedRoom = updatedRom;
        //                             };
        //                              await client.json.set(roomId, '$', findedRoom);

        //                         }

        //                     }

        //                 }
        //             }
        //         }
        //     }

        // }
    } else if (findedRoom?.teamOne[1]?.isTrumpShow == true && findedRoom?.teamOne[1]?.role === 'bot') {

        await delay(1500);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamOne[1]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamOne[1]?.cards);
        const trumpCardSuit = await parseTrumCard(findedRoom?.totalCards[0]);
        const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump();
            let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedrom;
        } else if (isSelected) {
            let selectedCard = findedRoom?.totalCards[0];
            const e = { findedRoom, roomId, io, selectedCard };
            let updatedRom = await handleOrderUp(e);
            findedRoom = updatedRom;
        } else if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump()
            let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedRom;

        } else if (!isSelected) {
            const trumpBoxManager = new TrumpBoxManager(io, client);
            let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
            findedRoom = updatedRom;
        };
        await client.json.set(roomId, '$', findedRoom);

        // if (findedRoom.teamTwo[1].isTrumpShow == true && findedRoom.teamTwo[1].role === 'bot') {

        //     await delay(1500);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //     if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump();
        //         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedrom;
        //     } else if (isSelected) {
        //         let selectedCard = findedRoom.totalCards[0];
        //         const e = { findedRoom, roomId, io, selectedCard };
        //         let updatedRom = await handleOrderUp(e);
        //         findedRoom = updatedRom;
        //     } else if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump()
        //         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedRom;

        //     } else if (!isSelected) {
        //         const trumpBoxManager = new TrumpBoxManager(io,client);
        //         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //         findedRoom = updatedRom;
        //     };
        //      await client.json.set(roomId, '$', findedRoom);

        //     if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //         await delay(1500);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //         const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //         const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //         if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump();
        //             let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedrom;
        //         } else if (isSelected) {
        //             let selectedCard = findedRoom.totalCards[0];
        //             const e = { findedRoom, roomId, io, selectedCard };
        //             let updatedRom = await handleOrderUp(e);
        //             findedRoom = updatedRom;
        //         } else if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump()
        //             let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedRom;

        //         } else if (!isSelected) {
        //             const trumpBoxManager = new TrumpBoxManager(io,client);
        //             let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //             findedRoom = updatedRom;
        //         };
        //          await client.json.set(roomId, '$', findedRoom);
        //         if (findedRoom.teamTwo[0].isTrumpShow == true && findedRoom.teamTwo[0].role === 'bot') {

        //             await delay(1500);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //             await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //             const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //             const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //             if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump();
        //                 let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedrom;
        //             } else if (isSelected) {
        //                 let selectedCard = findedRoom.totalCards[0];
        //                 const e = { findedRoom, roomId, io, selectedCard };
        //                 let updatedRom = await handleOrderUp(e);
        //                 findedRoom = updatedRom;
        //             } else if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump()
        //                 let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedRom;

        //             } else if (!isSelected) {
        //                 const trumpBoxManager = new TrumpBoxManager(io,client);
        //                 let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                 findedRoom = updatedRom;
        //             };
        //              await client.json.set(roomId, '$', findedRoom);

        //             if (findedRoom.teamOne[1].isTrumpShow == true && findedRoom.teamOne[1].role === 'bot') {

        //                 await delay(1500);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //                 const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                 const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                 if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump();
        //                     let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedrom;
        //                 } else if (isSelected) {
        //                     let selectedCard = findedRoom.totalCards[0];
        //                     const e = { findedRoom, roomId, io, selectedCard };
        //                     let updatedRom = await handleOrderUp(e);
        //                     findedRoom = updatedRom;
        //                 } else if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump()
        //                     let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedRom;

        //                 } else if (!isSelected) {
        //                     const trumpBoxManager = new TrumpBoxManager(io,client);
        //                     let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                     findedRoom = updatedRom;
        //                 };
        //                  await client.json.set(roomId, '$', findedRoom);

        //                 if (findedRoom.teamTwo[1].isTrumpShow == true && findedRoom.teamTwo[1].role === 'bot') {

        //                     await delay(1500);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                     if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump();
        //                         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedrom;
        //                     } else if (isSelected) {
        //                         let selectedCard = findedRoom.totalCards[0];
        //                         const e = { findedRoom, roomId, io, selectedCard };
        //                         let updatedRom = await handleOrderUp(e);
        //                         findedRoom = updatedRom;
        //                     } else if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump()
        //                         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedRom;

        //                     } else if (!isSelected) {
        //                         const trumpBoxManager = new TrumpBoxManager(io,client);
        //                         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                         findedRoom = updatedRom;
        //                     };
        //                      await client.json.set(roomId, '$', findedRoom);

        //                     if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //                         await delay(1500);
        //                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                         const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                         const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                         if (findedRoom.trumpRound === 1) {
        //                             const selectedCard = await euchreBot.chooseTrump();
        //                             let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                             findedRoom = updatedrom;
        //                         } else if (isSelected) {
        //                             let selectedCard = findedRoom.totalCards[0];
        //                             const e = { findedRoom, roomId, io, selectedCard };
        //                             let updatedRom = await handleOrderUp(e);
        //                             findedRoom = updatedRom;
        //                         } else if (findedRoom.trumpRound === 1) {
        //                             const selectedCard = await euchreBot.chooseTrump()
        //                             let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                             findedRoom = updatedRom;

        //                         } else if (!isSelected) {
        //                             const trumpBoxManager = new TrumpBoxManager(io,client);
        //                             let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                             findedRoom = updatedRom;
        //                         };
        //                          await client.json.set(roomId, '$', findedRoom);

        //                     }

        //                 }

        //             }
        //         }
        //     }
        // }

    } else if (findedRoom?.teamTwo[1]?.isTrumpShow == true && findedRoom?.teamTwo[1]?.role === 'bot') {

        await delay(1500);
        const euchreBot = await new EuchreBotPlayer(findedRoom?.teamTwo[1]?.userName);
        await euchreBot.receiveCards(findedRoom?.teamTwo[1]?.cards);
        const trumpCardSuit = await parseTrumCard(findedRoom?.totalCards[0]);
        const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump();
            let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedrom;
        } else if (isSelected) {
            let selectedCard = findedRoom?.totalCards[0];
            const e = { findedRoom, roomId, io, selectedCard };
            let updatedRom = await handleOrderUp(e);
            findedRoom = updatedRom;
        } else if (findedRoom?.trumpRound === 1) {
            const selectedCard = await euchreBot.chooseTrump()
            let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
            findedRoom = updatedRom;

        } else if (!isSelected) {
            const trumpBoxManager = new TrumpBoxManager(io, client);
            let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
            findedRoom = updatedRom;
        };
        await client.json.set(roomId, '$', findedRoom);

        // if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //     await delay(1500);
        //     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //     if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump();
        //         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedrom;
        //     } else if (isSelected) {
        //         let selectedCard = findedRoom.totalCards[0];
        //         const e = { findedRoom, roomId, io, selectedCard };
        //         let updatedRom = await handleOrderUp(e);
        //         findedRoom = updatedRom;
        //     } else if (findedRoom.trumpRound === 1) {
        //         const selectedCard = await euchreBot.chooseTrump()
        //         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //         findedRoom = updatedRom;

        //     } else if (!isSelected) {
        //         const trumpBoxManager = new TrumpBoxManager(io,client);
        //         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //         findedRoom = updatedRom;
        //     };
        //      await client.json.set(roomId, '$', findedRoom);
        //     if (findedRoom.teamTwo[0].isTrumpShow == true && findedRoom.teamTwo[0].role === 'bot') {

        //         await delay(1500);
        //         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
        //         await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
        //         const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //         const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //         if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump();
        //             let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedrom;
        //         } else if (isSelected) {
        //             let selectedCard = findedRoom.totalCards[0];
        //             const e = { findedRoom, roomId, io, selectedCard };
        //             let updatedRom = await handleOrderUp(e);
        //             findedRoom = updatedRom;
        //         } else if (findedRoom.trumpRound === 1) {
        //             const selectedCard = await euchreBot.chooseTrump()
        //             let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //             findedRoom = updatedRom;

        //         } else if (!isSelected) {
        //             const trumpBoxManager = new TrumpBoxManager(io,client);
        //             let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //             findedRoom = updatedRom;
        //         };
        //          await client.json.set(roomId, '$', findedRoom);

        //         if (findedRoom.teamOne[1].isTrumpShow == true && findedRoom.teamOne[1].role === 'bot') {

        //             await delay(1500);
        //             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
        //             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
        //             const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //             const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //             if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump();
        //                 let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedrom;
        //             } else if (isSelected) {
        //                 let selectedCard = findedRoom.totalCards[0];
        //                 const e = { findedRoom, roomId, io, selectedCard };
        //                 let updatedRom = await handleOrderUp(e);
        //                 findedRoom = updatedRom;
        //             } else if (findedRoom.trumpRound === 1) {
        //                 const selectedCard = await euchreBot.chooseTrump()
        //                 let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                 findedRoom = updatedRom;

        //             } else if (!isSelected) {
        //                 const trumpBoxManager = new TrumpBoxManager(io,client);
        //                 let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                 findedRoom = updatedRom;
        //             };
        //              await client.json.set(roomId, '$', findedRoom);

        //             if (findedRoom.teamTwo[1].isTrumpShow == true && findedRoom.teamTwo[1].role === 'bot') {

        //                 await delay(1500);
        //                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
        //                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
        //                 const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                 const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                 if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump();
        //                     let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedrom;
        //                 } else if (isSelected) {
        //                     let selectedCard = findedRoom.totalCards[0];
        //                     const e = { findedRoom, roomId, io, selectedCard };
        //                     let updatedRom = await handleOrderUp(e);
        //                     findedRoom = updatedRom;
        //                 } else if (findedRoom.trumpRound === 1) {
        //                     const selectedCard = await euchreBot.chooseTrump()
        //                     let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                     findedRoom = updatedRom;

        //                 } else if (!isSelected) {
        //                     const trumpBoxManager = new TrumpBoxManager(io,client);
        //                     let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                     findedRoom = updatedRom;
        //                 };
        //                  await client.json.set(roomId, '$', findedRoom);

        //                 if (findedRoom.teamOne[0].isTrumpShow == true && findedRoom.teamOne[0].role === 'bot') {
        //                     await delay(1500);
        //                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
        //                     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
        //                     const trumpCardSuit = await parseTrumCard(findedRoom.totalCards[0]);
        //                     const isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);

        //                     if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump();
        //                         let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedrom;
        //                     } else if (isSelected) {
        //                         let selectedCard = findedRoom.totalCards[0];
        //                         const e = { findedRoom, roomId, io, selectedCard };
        //                         let updatedRom = await handleOrderUp(e);
        //                         findedRoom = updatedRom;
        //                     } else if (findedRoom.trumpRound === 1) {
        //                         const selectedCard = await euchreBot.chooseTrump()
        //                         let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, findedRoom);
        //                         findedRoom = updatedRom;

        //                     } else if (!isSelected) {
        //                         const trumpBoxManager = new TrumpBoxManager(io,client);
        //                         let updatedRom = await trumpBoxManager.handlePassTrumpBox(findedRoom, roomId);
        //                         findedRoom = updatedRom;
        //                     };
        //                      await client.json.set(roomId, '$', findedRoom);

        //                 }

        //             }

        //         }
        //     }
        // }

    }



    return findedRoom
};
module.exports = checkIsBotTrumpSelection;