const checkIsTurn = async (teamOne, teamTwo, count, timeOut) => {
    let userId;
    let isPlayingAlone = false

    let allPlayers = [teamOne[0], teamTwo[0], teamOne[1], teamTwo[1]];

    for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i]?.isPlayAlone) {
            isPlayingAlone = allPlayers[i]?.isPlayAlone
        }
        if (allPlayers[i]?.isTurn) {
            userId = allPlayers[i]?.UserId;
            allPlayers[i].timeOut = timeOut
        }
    };


    for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i]?.isPartnerPlayingAlone && allPlayers[i]?.isTurn) {
            allPlayers[i].isTurn = false;
            let addition = i === 3 ? 0 : i + 1;
            allPlayers[addition].isTurn = true;
            allPlayers[addition].timeOut = timeOut
            userId = allPlayers[addition]?.UserId;
        }
    }

    teamOne = [allPlayers[0], allPlayers[2]];
    teamTwo = [allPlayers[1], allPlayers[3]];

    return { userId, isPlayingAlone, teamOne, teamTwo }; // Return the updated teams and trumpRound
};


module.exports = checkIsTurn;