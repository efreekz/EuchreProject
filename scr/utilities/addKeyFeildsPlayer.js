const addKeyFialdsPlayer = (teamOne, teamTwo, socketId, userId) => {
    return new Promise((resolve, reject) => {
        try {
            // Update socketId in teamOne if userId matches
            for (let i = 0; i < teamOne.length; i++) {
                teamOne[i].isTurn = false;
                teamOne[i].isTrumpShow = false;
                teamOne[i].timerCount = 0;
                teamOne[i].points = 0;
                teamOne[i].isDealer = false;
                teamOne[i].isPlayAlone = false;
                teamOne[i].isPartnerPlayingAlone = false;
                teamOne[i].lastPoints = 0;
            }

            // Update socketId in teamTwo if userId matches
            for (let i = 0; i < teamTwo.length; i++) {
                teamTwo[i].isTurn = false;
                teamTwo[i].isTrumpShow = false;
                teamTwo[i].timerCount = 0;
                teamTwo[i].points = 0;
                teamTwo[i].isDealer = false;
                teamTwo[i].isPlayAlone = false;
                teamTwo[i].isPartnerPlayingAlone = false;
                teamTwo[i].lastPoints = 0;
            }

            // Resolve the promise with the updated teams
            resolve({ teamOne, teamTwo });
        } catch (error) {
            // Reject the promise if there is an error
            reject(error);
        }
    });
};

module.exports = addKeyFialdsPlayer;
