const passTrumpBox = async (teamOne, teamTwo, count) => {
	let trumpRound = count;
	let userId = ''
	let isShowTrumpBoxNewUser = ''

	let allPlayers = [teamOne[0], teamTwo[0], teamOne[1], teamTwo[1]];

	for (let i = 0; i < allPlayers.length; i++) {

		if (allPlayers[i].isTrumpShow) {
			userId = allPlayers[i]?.UserId;

			allPlayers[i].isTrumpShow = false;

			let nextPlayerIndex = (i + 1) % allPlayers.length;

			allPlayers[nextPlayerIndex].isTrumpShow = true;
			isShowTrumpBoxNewUser =	allPlayers[nextPlayerIndex]?.UserId;

			if (allPlayers[i].isDealer) {

				trumpRound = count + 1;
			}
			break; // Exit the loop once the dealer is assigned
		}
	}

	teamOne = [allPlayers[0], allPlayers[2]];
	teamTwo = [allPlayers[1], allPlayers[3]];

	return { teamOne, teamTwo, trumpRound, userId,isShowTrumpBoxNewUser }; // Return the updated teams and trumpRound
};



const cehckTrumShow = async (teamOne, teamTwo, count) => {
	let trumpRound = count;
	let userId;

	let allPlayers = [teamOne[0], teamTwo[0], teamOne[1], teamTwo[1]];

	for (let i = 0; i < allPlayers.length; i++) {

		if (allPlayers[i]?.isTrumpShow) {
			userId = allPlayers[i]?.UserId;

			// allPlayers[i].isTrumpShow = false;

			break; // Exit the loop once the dealer is assigned
		}
	}

	teamOne = [allPlayers[0], allPlayers[2]];
	teamTwo = [allPlayers[1], allPlayers[3]];

	return { teamOne, teamTwo, trumpRound, userId }; // Return the updated teams and trumpRound
};

module.exports = {passTrumpBox, cehckTrumShow};