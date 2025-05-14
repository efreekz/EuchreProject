const createDealer = async (teamOne, teamTwo) => {
   
    [...teamOne, ...teamTwo].forEach(player => {
        player.isTurn = false;
        player.isTrumpShow = false;
    });
    let players = [teamOne[0], teamTwo[0], teamOne[1], teamTwo[1]]

    for (let i = 0; i < players.length; i++) {
        if (players[i].isDealer) {

            // Reset current dealer
            players[i].isDealer = false;

            // Set the next dealer
            let nextDealerIndex = (i + 1) % players.length;
            players[nextDealerIndex].isDealer = true;

            // Set isTurn to the player after the next dealer (2 positions ahead)
            let nextTurnIndex = (i + 2) % players.length;
            players[nextTurnIndex].isTurn = true;
            players[nextTurnIndex].isTrumpShow = true;

            break; // Exit once dealer and turn are assigned
        }
    }

    teamOne = [players[0], players[2]];
	teamTwo = [players[1], players[3]];

    return {teamOne, teamTwo}; // Return updated players array
};
module.exports = createDealer;