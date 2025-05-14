const addTimePlayersisTrumpShow = async (teamOne, teamTwo, userId, timeOut) => {
    try {
        const teamOnePromises = teamOne.map(async (player) => {
            if ((player?.isTrumpShow && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const teamTwoPromises = teamTwo.map(async (player) => {
            if ((player?.isTrumpShow && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const updatedTeamOne = await Promise.all(teamOnePromises);
        const updatedTeamTwo = await Promise.all(teamTwoPromises);

        return { teamOne: updatedTeamOne, teamTwo: updatedTeamTwo };

    } catch (error) {
        console.log('Error From AddTime', error);
    }
};
const addTimePlayersIsDealer = async (teamOne, teamTwo, userId, timeOut) => {
    try {
        const teamOnePromises = teamOne.map(async (player) => {
            if ((player?.isDealer && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const teamTwoPromises = teamTwo.map(async (player) => {
            if ((player?.isDealer && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const updatedTeamOne = await Promise.all(teamOnePromises);
        const updatedTeamTwo = await Promise.all(teamTwoPromises);

        return { teamOne: updatedTeamOne, teamTwo: updatedTeamTwo };

    } catch (error) {
        console.log('Error From AddTime', error);
    }
};
const addTimePlayersSelectPlayAlone = async (teamOne, teamTwo, userId, timeOut) => {
    try {
        const teamOnePromises = teamOne.map(async (player) => {
            if ((player && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const teamTwoPromises = teamTwo.map(async (player) => {
            if ((player && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const updatedTeamOne = await Promise.all(teamOnePromises);
        const updatedTeamTwo = await Promise.all(teamTwoPromises);

        return { teamOne: updatedTeamOne, teamTwo: updatedTeamTwo };

    } catch (error) {
        console.log('Error From AddTime', error);
    }
};
const addTimePlayersIsTurn = async (teamOne, teamTwo, userId, timeOut) => {
    try {
        const teamOnePromises = teamOne.map(async (player) => {
            if ((player?.isTurn && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const teamTwoPromises = teamTwo.map(async (player) => {
            if ((player?.isTurn && player?.UserId == userId) && player?.role !== 'bot') {
                player.timeOut = timeOut;
            } else {
                player.timeOut = '';
            }
            return player;
        });

        const updatedTeamOne = await Promise.all(teamOnePromises);
        const updatedTeamTwo = await Promise.all(teamTwoPromises);

        return { teamOne: updatedTeamOne, teamTwo: updatedTeamTwo };

    } catch (error) {
        console.log('Error From AddTime', error);
    }
};

module.exports = { addTimePlayersisTrumpShow, addTimePlayersIsDealer, addTimePlayersSelectPlayAlone, addTimePlayersIsTurn };
