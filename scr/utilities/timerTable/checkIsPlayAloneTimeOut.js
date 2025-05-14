const delay = require('../botTable/delay');
const client = require('../redisClient');
const { updateBotRoleInMainData } = require('../updateRoomRoleToBot');
const { isCurrentTimeGreaterThan } = require('./setTimer');
let playWithPartner;
const loadModule = async () => {
    playWithPartner = await require("../botTable/playWithPartnerForBot");
};
// setTimeout(async () => {

// await loadModule();
//     console.log('order oup',playWithPartner)
// }, 3100); // 31 seconds timer

const checkIsPlayAloneTimeOut = async (findedRoomData, roomId, PrevTrumpshowUserId, io) => {


    let findedRoom = await client.json.get(roomId);
    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }
    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }

    // findedRoom = await updateBotRoleInMainData(roomId, findedRoom, client, io);

    if (findedRoom && findedRoom?.isGameEnd) {
        await client.del(roomId);
        await client.del(`${roomId}roles`);
    } else if (findedRoom && findedRoom?.teamOne[0]?.UserId === PrevTrumpshowUserId) {

        await delay(1000);
        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamOne[0]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await loadModule()
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId ) {

        //     await delay(1000);
        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         console.log('in if condition this is false')
        //         return findedRoom
        //     }

        //     await loadModule()
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;

        //     if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId ) {

        //         await delay(1000);
        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             console.log('in if condition this is false')
        //             return findedRoom
        //         }

        //         await loadModule()
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;

        //         if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId ) {

        //             await delay(1000);
        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 console.log('in if condition this is false')
        //                 return findedRoom
        //             }

        //             await loadModule()
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;

        //             if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //                 await delay(1000);
        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     console.log('in if condition this is false')
        //                     return findedRoom
        //                 }

        //                 await loadModule()
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId ) {

        //                     await delay(1000);
        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         console.log('in if condition this is false')
        //                         return findedRoom
        //                     }

        //                     await loadModule()
        //                     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                     findedRoom = UpdatedRoom;

        //                     if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId ) {

        //                         await delay(1000);
        //                         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //                         if (CheckIsTimeOut === false) {
        //                             console.log('in if condition this is false')
        //                             return findedRoom
        //                         }

        //                         await loadModule()
        //                         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                         findedRoom = UpdatedRoom;

        //                         if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId ) {

        //                             await delay(1000);
        //                             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                             if (CheckIsTimeOut === false) {
        //                                 console.log('in if condition this is false')
        //                                 return findedRoom
        //                             }

        //                             await loadModule()
        //                             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                             findedRoom = UpdatedRoom;

        //                             if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //                                 await delay(1000);
        //                                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                                 if (CheckIsTimeOut === false) {
        //                                     console.log('in if condition this is false')
        //                                     return findedRoom
        //                                 }

        //                                 await loadModule()
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
    } else if (findedRoom && findedRoom?.teamTwo[0]?.UserId === PrevTrumpshowUserId) {

        await delay(1000);
        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamTwo[0]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await loadModule()
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId ) {

        //     await delay(1000);
        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         console.log('in if condition this is false')
        //         return findedRoom
        //     }

        //     await loadModule()
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;

        //     if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId ) {

        //         await delay(1000);
        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             console.log('in if condition this is false')
        //             return findedRoom
        //         }

        //         await loadModule()
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;

        //         if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //             await delay(1000);
        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 console.log('in if condition this is false')
        //                 return findedRoom
        //             }

        //             await loadModule()
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;
        //             if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId ) {

        //                 await delay(1000);
        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     console.log('in if condition this is false')
        //                     return findedRoom
        //                 }

        //                 await loadModule()
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId ) {

        //                     await delay(1000);
        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         console.log('in if condition this is false')
        //                         return findedRoom
        //                     }

        //                     await loadModule()
        //                     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                     findedRoom = UpdatedRoom;

        //                     if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId ) {

        //                         await delay(1000);
        //                         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                         if (CheckIsTimeOut === false) {
        //                             console.log('in if condition this is false')
        //                             return findedRoom
        //                         }

        //                         await loadModule()
        //                         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                         findedRoom = UpdatedRoom;

        //                         if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //                             await delay(1000);
        //                             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                             if (CheckIsTimeOut === false) {
        //                                 console.log('in if condition this is false')
        //                                 return findedRoom
        //                             }

        //                             await loadModule()
        //                             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                             findedRoom = UpdatedRoom;

        //                         }

        //                     }

        //                 }
        //             }
        //         }
        //     }

        // }
    } else if (findedRoom && findedRoom?.teamOne[1]?.UserId === PrevTrumpshowUserId) {

        await delay(1000);
        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamOne[1]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await loadModule()
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId ) {

        //     await delay(1000);
        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         console.log('in if condition this is false')
        //         return findedRoom
        //     }

        //     await loadModule()
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;

        //     if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //         await delay(1000);
        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             console.log('in if condition this is false')
        //             return findedRoom
        //         }

        //         await loadModule()
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;
        //         if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId ) {

        //             await delay(1000);
        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 console.log('in if condition this is false')
        //                 return findedRoom
        //             }

        //             await loadModule()
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;

        //             if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId ) {

        //                 await delay(1000);
        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     console.log('in if condition this is false')
        //                     return findedRoom
        //                 }

        //                 await loadModule()
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId ) {

        //                     await delay(1000);
        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         console.log('in if condition this is false')
        //                         return findedRoom
        //                     }

        //                     await loadModule()
        //                     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                     findedRoom = UpdatedRoom;

        //                     if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //                         await delay(1000);
        //                         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                         if (CheckIsTimeOut === false) {
        //                             console.log('in if condition this is false')
        //                             return findedRoom
        //                         }

        //                         await loadModule()
        //                         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                         findedRoom = UpdatedRoom;

        //                     }

        //                 }

        //             }
        //         }
        //     }
        // }

    } else if (findedRoom && findedRoom?.teamTwo[1]?.UserId === PrevTrumpshowUserId) {

        await delay(1000);
        const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom?.teamTwo[1]?.timeOut);
        if (CheckIsTimeOut === false) {
            return findedRoom
        }

        await loadModule()
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        // if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //     await delay(1000);
        //     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //     if (CheckIsTimeOut === false) {
        //         console.log('in if condition this is false')
        //         return findedRoom
        //     }

        //     await loadModule()
        //     const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //     findedRoom = UpdatedRoom;
        //     if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId ) {

        //         await delay(1000);
        //         const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[0].timeOut);
        //         if (CheckIsTimeOut === false) {
        //             console.log('in if condition this is false')
        //             return findedRoom
        //         }

        //         await loadModule()
        //         const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //         findedRoom = UpdatedRoom;

        //         if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId ) {

        //             await delay(1000);
        //             const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[1].timeOut);
        //             if (CheckIsTimeOut === false) {
        //                 console.log('in if condition this is false')
        //                 return findedRoom
        //             }

        //             await loadModule()
        //             const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //             findedRoom = UpdatedRoom;

        //             if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId ) {

        //                 await delay(1000);
        //                 const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamTwo[1].timeOut);
        //                 if (CheckIsTimeOut === false) {
        //                     console.log('in if condition this is false')
        //                     return findedRoom
        //                 }

        //                 await loadModule()
        //                 const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        //                 findedRoom = UpdatedRoom;

        //                 if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId ) {
        //                     await delay(1000);
        //                     const CheckIsTimeOut = await isCurrentTimeGreaterThan(findedRoom.teamOne[0].timeOut);
        //                     if (CheckIsTimeOut === false) {
        //                         console.log('in if condition this is false')
        //                         return findedRoom
        //                     }

        //                     await loadModule()
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
module.exports = checkIsPlayAloneTimeOut;