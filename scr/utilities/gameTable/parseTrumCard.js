function parseTrumCard(trumb) {
	// Helper to extract rank and suit from the card string
	const getCardDetails = (cardString) => {
		const rank = cardString;  // Everything except the last character is the rank
		const suitChar = cardString; // Last character is the suit

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
	const cardDetails = getCardDetails(trumb);
	return {
		rank: cardDetails?.rank,
		suit: cardDetails?.suit
	};
}
module.exports = parseTrumCard;