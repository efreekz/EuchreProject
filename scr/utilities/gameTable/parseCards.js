function parseCards(playersCards) {
	// Helper to extract rank and suit from the card string
	const getCardDetails = (cardString) => {
		const rank = cardString.slice(0, -1);  // Everything except the last character is the rank
		const suitChar = cardString.slice(-1); // Last character is the suit

		// Map the suit character to a full suit name
		const suitMap = {
			's': 'spades',
			'h': 'hearts',
			'd': 'diamonds',
			'c': 'clubs'
		};

		return {
			rank,
			suit: suitMap[suitChar] || 'unknown'  // Handle invalid suit gracefully
		};
	};

	// Map through the input array and convert the card string into rank and suit
	return playersCards.map(playerCard => {
		const cardDetails = playerCard?.card ? getCardDetails(playerCard?.card) : null;
		if(cardDetails){
			return {
				playerId: playerCard?.UserId ? playerCard?.UserId : "",
				card:{
					rank: cardDetails?.rank,
					suit: cardDetails?.suit
				}
			};
		}
	});
};
module.exports = parseCards;