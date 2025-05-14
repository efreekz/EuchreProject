const addSocketIdInPlayer = (teamOne, teamTwo, socketId, userId) => {
    return new Promise((resolve, reject) => {
        try {
            // Update socketId in teamOne if userId matches
            for (let i = 0; i < teamOne.length; i++) {
                if (teamOne[i]?.UserId === userId ) {
                    teamOne[i].socketId = socketId;
                }
            }

            // Update socketId in teamTwo if userId matches
            for (let i = 0; i < teamTwo.length; i++) {
                if (teamTwo[i]?.UserId === userId ) {
                    teamTwo[i].socketId = socketId;
                }
            }

            // Resolve the promise with the updated teams
            resolve({ teamOne, teamTwo });
        } catch (error) {
            // Reject the promise if there is an error
            reject(error);
        }
    });
};

module.exports = addSocketIdInPlayer;
