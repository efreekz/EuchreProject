const getRandomDealer = async (teamOne, teamTwo) => {
    const indexForDealer = await getRandomNumber()

    let allPlayers = [teamOne[0], teamTwo[0], teamOne[1], teamTwo[1]];

    for (let i = 0; i < allPlayers.length; i++) {
        if (i === indexForDealer) {
            allPlayers[i].isDealer = true;
            let incIndex = i + 1


            if (incIndex > 3) {

                incIndex = 0

            };
            
            allPlayers[incIndex].isTurn = true;
            allPlayers[incIndex].isTrumpShow = true;
        }

    };
    teamOne = [allPlayers[0], allPlayers[2]];
    teamTwo = [allPlayers[1], allPlayers[3]];

    return { teamOne, teamTwo }; // Return the updated teams and trumpRound
};

function getRandomNumber() {
    return Math.floor(Math.random() * 4);
}
module.exports = getRandomDealer;