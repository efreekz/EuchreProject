const client = require('../redisClient');
const { updateBotRoleInMainData, updateUserToBotInMainData } = require('../updateRoomRoleToBot');
const delay = require('./delay');
const playWithPartner = require('./playWithPartnerForBot');



const checkIsBotTrumpSelectionForPlayAlone = async (findedRoomData, roomId, PrevTrumpshowUserId, io) => {

    let findedRoom = await client.json.get(roomId);

    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }
    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }
    if (!findedRoom) {
        findedRoom = findedRoomData
    }

    // findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io);
    findedRoom = await updateUserToBotInMainData(roomId, findedRoom, client, io);

    if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {

        await delay(1500);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom?.teamTwo[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[0]?.role === 'bot') {

        //     await delay(1500);
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;

        //     if (findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[1]?.role === 'bot') {

        //         await delay(1500);
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;

        //         if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        //             await delay(1500);
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;

        //             if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //                 await delay(1500);
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom?.teamTwo[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[0]?.role === 'bot') {

        //                     await delay(1500);
        //                     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                     findedRoom = UpdatedRoom;

        //                     if (findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[1]?.role === 'bot') {

        //                         await delay(1500);
        //                         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                         findedRoom = UpdatedRoom;

        //                         if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        //                             await delay(1500);
        //                             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                             findedRoom = UpdatedRoom;

        //                             if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //                                 await delay(1500);
        //                                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                                 findedRoom = UpdatedRoom;

        //                             }

        //                         }

        //                     }
        //                 }
        //             }

        //         }

        //     }
        // }
    } else if (findedRoom?.teamTwo[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[0]?.role === 'bot') {

        await delay(1500);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[1]?.role === 'bot') {

        //     await delay(1500);
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;

        //     if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        //         await delay(1500);
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;

        //         if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //             await delay(1500);
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;
        //             if (findedRoom?.teamTwo[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[0]?.role === 'bot') {

        //                 await delay(1500);
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[1]?.role === 'bot') {

        //                     await delay(1500);
        //                     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                     findedRoom = UpdatedRoom;

        //                     if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        //                         await delay(1500);
        //                         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                         findedRoom = UpdatedRoom;

        //                         if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //                             await delay(1500);
        //                             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                             findedRoom = UpdatedRoom;

        //                         }

        //                     }

        //                 }
        //             }
        //         }
        //     }

        // }
    } else if (findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[1]?.role === 'bot') {

        await delay(1500);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        //     await delay(1500);
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;

        //     if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //         await delay(1500);
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;
        //         if (findedRoom?.teamTwo[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[0]?.role === 'bot') {

        //             await delay(1500);
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;

        //             if (findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[1]?.role === 'bot') {

        //                 await delay(1500);
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        //                     await delay(1500);
        //                     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                     findedRoom = UpdatedRoom;

        //                     if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //                         await delay(1500);
        //                         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                         findedRoom = UpdatedRoom;

        //                     }

        //                 }

        //             }
        //         }
        //     }
        // }

    } else if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        await delay(1500);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //     await delay(1500);
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;
        //     if (findedRoom?.teamTwo[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[0]?.role === 'bot') {

        //         await delay(1500);
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;

        //         if (findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[1]?.role === 'bot') {

        //             await delay(1500);
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;

        //             if (findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId && findedRoom?.teamTwo[1]?.role === 'bot') {

        //                 await delay(1500);
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId && findedRoom?.teamOne[0]?.role === 'bot') {
        //                     await delay(1500);
        //                     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                     findedRoom = UpdatedRoom;

        //                 }

        //             }

        //         }
        //     }
        // }

    }



    return findedRoom
};
module.exports = checkIsBotTrumpSelectionForPlayAlone;