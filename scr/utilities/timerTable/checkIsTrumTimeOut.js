const EuchreBotPlayer = require("../../botDemo");
const delay = require("../botTable/delay");
const handleCallSuiteSelection = require("../botTable/orderTrupSuitForBot");
const parseTrumCard = require("../botTable/parseTrumCard");
const TrumpBoxManager = require("../botTable/trumpBoxManager");
const client = require("../redisClient");
const { updateBotRoleInMainData, updateUserToBotInMainData } = require("../updateRoomRoleToBot");
const { isCurrentTimeGreaterThan } = require("./setTimer");
let handleOrderUp;
let checkIsBotTrumpSelection;
const loadModule = async () => {
    handleOrderUp = require("../botTable/orderUpForBot");
    checkIsBotTrumpSelection = require("../botTable/checkisTrumpSelection");
};
// setTimeout(async () => {
//     await loadModule();
//     console.log('order oup',checkIsBotTrumpSelection)
// }, 3100); // 31 seconds timer

async function checkIsTrumpTimeOut(findedRoom, io, roomId) {
    let UpdatedRoom = await client.json.get(roomId);
    if (typeof UpdatedRoom === 'string') {
        UpdatedRoom = JSON.parse(UpdatedRoom);
    }
    if (typeof UpdatedRoom === 'string') {
        UpdatedRoom = JSON.parse(UpdatedRoom);
    }
    // if (!UpdatedRoom) {
    //     UpdatedRoom = findedRoom;
    // }
    // UpdatedRoom = await updateBotRoleInMainData(roomId, UpdatedRoom, client, io);
    UpdatedRoom = await updateUserToBotInMainData(roomId, UpdatedRoom, client, io);
    let botPlayed;


    // do {
    botPlayed = false;
    if (UpdatedRoom && UpdatedRoom?.isGameEnd) {
        await client.del(roomId);
        await client.del(`${roomId}roles`);
    } else if (UpdatedRoom) {
        let teams = [UpdatedRoom?.teamOne, UpdatedRoom?.teamTwo];
        for (let i = 0; i < teams.length; i++) {
            let team = teams[i];

            for (let j = 0; j < team.length; j++) {
                let player = team[j];

                if (player?.isTrumpShow && player?.timeOut) {
                    await delay(1000);
                    let CheckIsTimeOut = await isCurrentTimeGreaterThan(player?.timeOut)
                    if (CheckIsTimeOut) {
                        let euchreBot = new EuchreBotPlayer(player?.userName);
                        await euchreBot.receiveCards(player?.cards);
                        let trumpCardSuit = await parseTrumCard(UpdatedRoom?.totalCards[0]);
                        let isSelected = await euchreBot.decideTrumpSelection(trumpCardSuit);
                        if (UpdatedRoom?.trumpRound === 1) {
                            let selectedCard = await euchreBot.chooseTrump();
                            let updatedrom = await handleCallSuiteSelection(selectedCard, roomId, io, UpdatedRoom);
                            UpdatedRoom = updatedrom;
                            botPlayed = false;  // A bot played, so we need to check again for other bots
                            await client.json.set(roomId, '$', UpdatedRoom);

                            break;
                        } else if (isSelected) {
                            await loadModule();
                            let selectedCard = UpdatedRoom?.totalCards[0];
                            let e = { findedRoom: UpdatedRoom, roomId, io, selectedCard };
                            let updatedRom = await handleOrderUp(e);
                            // console.log('in is selected turn', updatedRom)
                            UpdatedRoom = updatedRom;
                            botPlayed = false;  // A bot played, so we need to check again for other bots
                            await client.json.set(roomId, '$', UpdatedRoom);

                            break;
                        } else if (UpdatedRoom?.trumpRound === 1) {
                            let selectedCard = await euchreBot.chooseTrump()
                            let updatedRom = handleCallSuiteSelection(selectedCard, roomId, io, UpdatedRoom);
                            UpdatedRoom = updatedRom;
                            botPlayed = false;  // A bot played, so we need to check again for other bots
                            await client.json.set(roomId, '$', UpdatedRoom);

                            break;
                        } else if (!isSelected) {
                            let trumpBoxManager = new TrumpBoxManager(io, client);
                            let updatedRom = await trumpBoxManager.handlePassTrumpBox(UpdatedRoom, roomId);
                            // updatedRom = await TrumpPassed(updatedRom, io, roomId);
                            await loadModule();


                            // let updateRoom = await checkIsBotTrumpSelection(updatedRom, io, roomId);
                            // UpdatedRoom = updateRoom;
                            botPlayed = true;  // A bot played, so we need to check again for other bots
                            await client.json.set(roomId, '$', updatedRom);

                            break;
                        }





                        // botPlayed = true;  // A bot played, so we need to check again for other bots
                        // break;  // Break to recheck all players after a bot plays
                    }
                }
            }
            if (botPlayed) break;  // Break the outer loop as well to recheck all players
        }
    }
    // } while (botPlayed);  // Continue until no bot has played


    return UpdatedRoom;
};

const TrumpPassed = async (findedRoom, io, roomId) => {
    try {
        let updatedRoom = await new Promise((resolve) => {
            setTimeout(async () => {
                const roomAfterTimeout = await checkIsTrumpTimeOut(findedRoom, io, roomId);
                await client.json.set(findedRoom._id.toString(), '$', roomAfterTimeout);
                resolve(roomAfterTimeout); // Resolve the promise with the updated room
            }, 31000); // 31 seconds timer
        });
        return updatedRoom; // Return the updated room after the timeout completes
    } catch (error) {
        console.log('in timer table check is trump timer out', error);
        return null; // Return null or handle error as needed
    }
};



// Call the function to start bot turns
// await playBotTurns(findedRoom, roomId, io);
module.exports = checkIsTrumpTimeOut;