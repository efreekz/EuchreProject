// const client = require("./redisClient");

// async function updateRoomData(roomId, roomDetails) {
//     try {
//         if (roomId && roomDetails) {

//             await client.json.set(roomId, `$.teamOne[0].UserId`, roomDetails?.teamOne[0]?.UserId);
//             await client.json.set(roomId, `$.teamOne[0].value`, roomDetails?.teamOne[0]?.value);
//             await client.json.set(roomId, `$.teamOne[0].email`, roomDetails?.teamOne[0]?.email);
//             await client.json.set(roomId, `$.teamOne[0].userName`, roomDetails?.teamOne[0]?.userName);
//             await client.json.set(roomId, `$.teamOne[0].paid`, roomDetails?.teamOne[0]?.paid);
//             await client.json.set(roomId, `$.teamOne[0].paidAmount`, roomDetails?.teamOne[0]?.paidAmount);
//             await client.json.set(roomId, `$.teamOne[0].isTurn`, roomDetails?.teamOne[0]?.isTurn);
//             await client.json.set(roomId, `$.teamOne[0].isTrumpShow`, roomDetails?.teamOne[0]?.isTrumpShow);
//             await client.json.set(roomId, `$.teamOne[0].cards`, roomDetails?.teamOne[0]?.cards);
//             await client.json.set(roomId, `$.teamOne[0].timeOut`, roomDetails?.teamOne[0]?.timeOut);
//             await client.json.set(roomId, `$.teamOne[0].timerCount`, roomDetails?.teamOne[0]?.timerCount);
//             await client.json.set(roomId, `$.teamOne[0].points`, roomDetails?.teamOne[0]?.points);
//             await client.json.set(roomId, `$.teamOne[0].isDealer`, roomDetails?.teamOne[0]?.isDealer);
//             await client.json.set(roomId, `$.teamOne[0].isPlayAlone`, roomDetails?.teamOne[0]?.isPlayAlone);
//             await client.json.set(roomId, `$.teamOne[0].isPartnerPlayingAlone`, roomDetails?.teamOne[0]?.isPartnerPlayingAlone);
//             await client.json.set(roomId, `$.teamOne[0].lastPoints`, roomDetails?.teamOne[0]?.lastPoints);

//             await client.json.set(roomId, `$.teamOne[1].UserId`, roomDetails?.teamOne[1]?.UserId);
//             await client.json.set(roomId, `$.teamOne[1].value`, roomDetails?.teamOne[1]?.value);
//             await client.json.set(roomId, `$.teamOne[1].email`, roomDetails?.teamOne[1]?.email);
//             await client.json.set(roomId, `$.teamOne[1].userName`, roomDetails?.teamOne[1]?.userName);
//             await client.json.set(roomId, `$.teamOne[1].paid`, roomDetails?.teamOne[1]?.paid);
//             await client.json.set(roomId, `$.teamOne[1].paidAmount`, roomDetails?.teamOne[1]?.paidAmount);
//             await client.json.set(roomId, `$.teamOne[1].isTurn`, roomDetails?.teamOne[1]?.isTurn);
//             await client.json.set(roomId, `$.teamOne[1].isTrumpShow`, roomDetails?.teamOne[1]?.isTrumpShow);
//             await client.json.set(roomId, `$.teamOne[1].cards`, roomDetails?.teamOne[1]?.cards);
//             await client.json.set(roomId, `$.teamOne[1].timeOut`, roomDetails?.teamOne[1]?.timeOut);
//             await client.json.set(roomId, `$.teamOne[1].timerCount`, roomDetails?.teamOne[1]?.timerCount);
//             await client.json.set(roomId, `$.teamOne[1].points`, roomDetails?.teamOne[1]?.points);
//             await client.json.set(roomId, `$.teamOne[1].isDealer`, roomDetails?.teamOne[1]?.isDealer);
//             await client.json.set(roomId, `$.teamOne[1].isPlayAlone`, roomDetails?.teamOne[1]?.isPlayAlone);
//             await client.json.set(roomId, `$.teamOne[1].isPartnerPlayingAlone`, roomDetails?.teamOne[1]?.isPartnerPlayingAlone);
//             await client.json.set(roomId, `$.teamOne[1].lastPoints`, roomDetails?.teamOne[1]?.lastPoints);
            
//             await client.json.set(roomId, `$.teamTwo[0].UserId`, roomDetails?.teamTwo[0]?.UserId);
//             await client.json.set(roomId, `$.teamTwo[0].value`, roomDetails?.teamTwo[0]?.value);
//             await client.json.set(roomId, `$.teamTwo[0].email`, roomDetails?.teamTwo[0]?.email);
//             await client.json.set(roomId, `$.teamTwo[0].userName`, roomDetails?.teamTwo[0]?.userName);
//             await client.json.set(roomId, `$.teamTwo[0].paid`, roomDetails?.teamTwo[0]?.paid);
//             await client.json.set(roomId, `$.teamTwo[0].paidAmount`, roomDetails?.teamTwo[0]?.paidAmount);
//             await client.json.set(roomId, `$.teamTwo[0].isTurn`, roomDetails?.teamTwo[0]?.isTurn);
//             await client.json.set(roomId, `$.teamTwo[0].isTrumpShow`, roomDetails?.teamTwo[0]?.isTrumpShow);
//             await client.json.set(roomId, `$.teamTwo[0].cards`, roomDetails?.teamTwo[0]?.cards);
//             await client.json.set(roomId, `$.teamTwo[0].timeOut`, roomDetails?.teamTwo[0]?.timeOut);
//             await client.json.set(roomId, `$.teamTwo[0].timerCount`, roomDetails?.teamTwo[0]?.timerCount);
//             await client.json.set(roomId, `$.teamTwo[0].points`, roomDetails?.teamTwo[0]?.points);
//             await client.json.set(roomId, `$.teamTwo[0].isDealer`, roomDetails?.teamTwo[0]?.isDealer);
//             await client.json.set(roomId, `$.teamTwo[0].isPlayAlone`, roomDetails?.teamTwo[0]?.isPlayAlone);
//             await client.json.set(roomId, `$.teamTwo[0].isPartnerPlayingAlone`, roomDetails?.teamTwo[0]?.isPartnerPlayingAlone);
//             await client.json.set(roomId, `$.teamTwo[0].lastPoints`, roomDetails?.teamTwo[0]?.lastPoints);
            
//             await client.json.set(roomId, `$.teamTwo[1].UserId`, roomDetails?.teamTwo[1]?.UserId);
//             await client.json.set(roomId, `$.teamTwo[1].value`, roomDetails?.teamTwo[1]?.value);
//             await client.json.set(roomId, `$.teamTwo[1].email`, roomDetails?.teamTwo[1]?.email);
//             await client.json.set(roomId, `$.teamTwo[1].userName`, roomDetails?.teamTwo[1]?.userName);
//             await client.json.set(roomId, `$.teamTwo[1].paid`, roomDetails?.teamTwo[1]?.paid);
//             await client.json.set(roomId, `$.teamTwo[1].paidAmount`, roomDetails?.teamTwo[1]?.paidAmount);
//             await client.json.set(roomId, `$.teamTwo[1].isTurn`, roomDetails?.teamTwo[1]?.isTurn);
//             await client.json.set(roomId, `$.teamTwo[1].isTrumpShow`, roomDetails?.teamTwo[1]?.isTrumpShow);
//             await client.json.set(roomId, `$.teamTwo[1].cards`, roomDetails?.teamTwo[1]?.cards);
//             await client.json.set(roomId, `$.teamTwo[1].timeOut`, roomDetails?.teamTwo[1]?.timeOut);
//             await client.json.set(roomId, `$.teamTwo[1].timerCount`, roomDetails?.teamTwo[1]?.timerCount);
//             await client.json.set(roomId, `$.teamTwo[1].points`, roomDetails?.teamTwo[1]?.points);
//             await client.json.set(roomId, `$.teamTwo[1].isDealer`, roomDetails?.teamTwo[1]?.isDealer);
//             await client.json.set(roomId, `$.teamTwo[1].isPlayAlone`, roomDetails?.teamTwo[1]?.isPlayAlone);
//             await client.json.set(roomId, `$.teamTwo[1].isPartnerPlayingAlone`, roomDetails?.teamTwo[1]?.isPartnerPlayingAlone);
//             await client.json.set(roomId, `$.teamTwo[1].lastPoints`, roomDetails?.teamTwo[1]?.lastPoints);




//             await client.json.set(roomId, `$.players`, roomDetails?.players);
//             await client.json.set(roomId, `$.totalCards`, roomDetails?.totalCards);
//             await client.json.set(roomId, `$.playedCards`, roomDetails?.playedCards);
//             await client.json.set(roomId, `$.lastPlayedCards`, roomDetails?.lastPlayedCards);
//             await client.json.set(roomId, `$.trumpSuit`, roomDetails?.trumpSuit);
//             await client.json.set(roomId, `$.isTrumpSelected`, roomDetails?.isTrumpSelected);
//             await client.json.set(roomId, `$.trumpRound`, roomDetails?.trumpRound);
//             await client.json.set(roomId, `$.isStarted`, roomDetails?.isStarted);
//             await client.json.set(roomId, `$.entryFee`, roomDetails?.entryFee);
//             await client.json.set(roomId, `$.trumpMaker`, roomDetails?.trumpMaker);
//             await client.json.set(roomId, `$.gameLevel`, roomDetails?.gameLevel);
//             await client.json.set(roomId, `$.isWinner`, roomDetails?.isWinner);
//             await client.json.set(roomId, `$.gameId`, roomDetails?.gameId);
//             await client.json.set(roomId, `$.timeOut`, roomDetails?.timeOut);
//             await client.json.set(roomId, `$.createrUserId`, roomDetails?.createrUserId);
//             await client.json.set(roomId, `$.status`, roomDetails?.status);
//             await client.json.set(roomId, `$.isGameEnd`, roomDetails?.isGameEnd);
//             await client.json.set(roomId, `$.updatedAt`, roomDetails?.updatedAt);
//             await client.json.set(roomId, `$.handId`, roomDetails?.handId);
//             await client.json.set(roomId, `$.teamOnePoints`, roomDetails?.teamOnePoints);
//             await client.json.set(roomId, `$.teamTwoPoints`, roomDetails?.teamTwoPoints);
//         }
//     } catch (error) {
//         console.error('Error updating team keys:', error);
//     }
// }


// module.exports = updateRoomData;

const client = require("./redisClient");

async function updateRoomData(roomId, roomDetails) {
    try {
        if (roomId && roomDetails && typeof roomDetails === 'object' && !Array.isArray(roomDetails)) {
            const promises = [];

            for (const [key, value] of Object.entries(roomDetails)) {
                if (value === undefined) {
                    console.warn(`Skipping key: ${key} because value is undefined`);
                    continue;
                }

                // Handle nested objects (e.g., teamOne and teamTwo arrays)
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            for (const [nestedKey, nestedValue] of Object.entries(value[i])) {
                                if (nestedKey === 'role' || nestedValue === undefined) continue; // Skip the 'role' key and undefined values
                                try {
                                    // Collect promises
                                    promises.push(client.json.set(roomId, `$.${key}[${i}].${nestedKey}`, nestedValue));
                                } catch (error) {
                                    console.error(`Error setting key: $.${key}[${i}].${nestedKey}, Value: ${nestedValue}`, error);
                                }
                            }
                        }
                    } else {
                        for (const [nestedKey, nestedValue] of Object.entries(value)) {
                            if (nestedValue === undefined) {
                                console.warn(`Skipping key: ${key}.${nestedKey} because value is undefined`);
                                continue;
                            }
                            try {
                                // Collect promises
                                promises.push(client.json.set(roomId, `$.${key}.${nestedKey}`, nestedValue));
                            } catch (error) {
                                console.error(`Error setting key: $.${key}.${nestedKey}, Value: ${nestedValue}`, error);
                            }
                        }
                    }
                } else {
                    try {
                        // Collect promises
                        promises.push(client.json.set(roomId, `$.${key}`, value));
                    } catch (error) {
                        console.error(`Error setting key: $.${key}, Value: ${value}`, error);
                    }
                }
            }

            // Wait for all promises to resolve
            await Promise.all(promises);
            return 'OK';
        } else {
            console.warn('Invalid roomId or roomDetails');
        }
    } catch (error) {
        console.error('Error updating team keys:', error);
    }
}

module.exports = updateRoomData;



