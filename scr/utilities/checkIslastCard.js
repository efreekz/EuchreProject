const EuchreBotPlayer = require("../botDemo");
const botGamePlay = require("./botTable/botGamePlay");
const delay = require("./gameTable/delay");
const client = require("./redisClient");
const { updateBotRoleInMainData, updateUserToBotInMainData } = require("./updateRoomRoleToBot");


async function checkIsLastCardThrow(findedRoom, io, roomId, userId) {
    let botPlayed;
    let UpdatedRoom = findedRoom;

    UpdatedRoom = await updateUserToBotInMainData(roomId, UpdatedRoom, client, );
    // do {
    botPlayed = false;
    const teams = [UpdatedRoom?.teamOne, UpdatedRoom?.teamTwo];

    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];

        for (let j = 0; j < team.length; j++) {
            let player = team[j];
            let zeroCount = 0

            if (userId === player?.UserId) {
                zeroCount = await player?.cards.filter(card => card !== 0).length;
            }

            if ((player?.isTurn && player?.role === 'user') && (UpdatedRoom?.isStarted && zeroCount === 1)) {
                await delay(1300)
                const euchreBot = new EuchreBotPlayer(player?.userName);
                await euchreBot.receiveCards(player?.cards);
                const isLeadCard = UpdatedRoom?.playedCards.length > 0 ? UpdatedRoom?.playedCards[0]?.card : null;
                await euchreBot.setTrump(UpdatedRoom?.trumpSuit)
                const playedCard = await euchreBot.playCard(isLeadCard);
                if (playedCard) {
                    UpdatedRoom = await botGamePlay(UpdatedRoom, playedCard, roomId, io);
                }
                await client.json.set(roomId, '$', UpdatedRoom);
                botPlayed = true;  // A bot played, so we need to check again for other bots
                break;  // Break to recheck all players after a bot plays
            }
        }
        if (botPlayed) break;  // Break the outer loop as well to recheck all players
    }
    // } while (botPlayed);  // Continue until no bot has played
    return UpdatedRoom;
}


// Call the function to start bot turns
// await playBotTurns(findedRoom, roomId, io);
module.exports = checkIsLastCardThrow;