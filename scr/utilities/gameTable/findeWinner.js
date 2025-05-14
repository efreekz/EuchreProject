// function findTrickWinner(cards, trumpSuit) {
// 	// Define the rank ranks of cards (highest to lowest)
// 	const rankOrder = ['9', '10', 'J', 'Q', 'K', 'A'];

// 	// Helper function to get the rank of a card
// 	const getCardRank = (card) => rankOrder.indexOf(card.rank);

// 	// Helper function to check if a card is the Right or Left Bower
// 	const isRightBower = (card, trumpSuit) => card.rank === 'J' && card.suit === trumpSuit;
// 	const isLeftBower = (card, trumpSuit) => {
// 		const leftBowerSuit = trumpSuit === 'hearts' ? 'diamonds' :
// 			trumpSuit === 'diamonds' ? 'hearts' :
// 				trumpSuit === 'spades' ? 'clubs' : 'spades';
// 		return card.rank === 'J' && card.suit === leftBowerSuit;
// 	};

// 	// The first card played determines the leading suit
// 	const leadingSuit = cards[0].suit;

// 	// Track the current winner
// 	let winningCard = null;
// 	let winningplayerId = null;

// 	// Loop through the cards to find the highest card according to the rules
// 	for (let i = 0; i < cards.length; i++) {
// 		const card = cards[i];

// 		// Check if the current card beats the current winner
// 		if (winningCard === null) {
// 			winningCard = card;
// 			winningPlayerId = card.playerId;
// 			continue;
// 		}

// 		// Check if the current card is a Right or Left Bower
// 		if (isRightBower(card, trumpSuit)) {
// 			winningCard = card;
// 			winningPlayerId = card.playerId;
// 		} else if (isLeftBower(card, trumpSuit) && !isRightBower(winningCard, trumpSuit)) {
// 			winningCard = card;
// 			winningPlayerId = card.playerId;
// 		}
// 		// Check if the current card is a trump card
// 		else if (card.suit === trumpSuit && winningCard.suit !== trumpSuit) {
// 			winningCard = card;
// 			winningPlayerId = card.playerId;
// 		}
// 		// If both cards are trump cards, the higher rank wins
// 		else if (card.suit === trumpSuit && winningCard.suit === trumpSuit && getCardRank(card) > getCardRank(winningCard)) {
// 			winningCard = card;
// 			winningPlayerId = card.playerId;
// 		}
// 		// If neither card is a trump card, the leading suit wins
// 		else if (card.suit === leadingSuit && winningCard.suit === leadingSuit && getCardRank(card) > getCardRank(winningCard)) {
// 			winningCard = card;
// 			winningPlayerId = card.playerId;
// 		}
// 		// Leading suit beats non-trump, non-leading suit
// 		else if (card.suit === leadingSuit && winningCard.suit !== trumpSuit && winningCard.suit !== leadingSuit) {
// 			winningCard = card;
// 			winningPlayerId = card.playerId;
// 		}
// 	}

// 	return winningPlayerId;  // Return the playerId of the player who won the trick
// };



const getSameColorSuit = (suit) => {
    switch (suit) {
        case 'spades': return 'clubs';
        case 'clubs': return 'spades';
        case 'hearts': return 'diamonds';
        case 'diamonds': return 'hearts';
    }
};

const getCardRank = (card, trumpSuit) => {
    const { rank, suit } = card;

    if (rank === 'j' && suit === trumpSuit) {
        return 14; // Highest rank
    }

    if (rank === 'j' && suit === getSameColorSuit(trumpSuit)) {
        return 13; 
    }

    if (suit === trumpSuit) {
        switch (rank) {
            case 'a': return 12;
            case 'k': return 11;
            case 'q': return 10;
            case '10': return 9;
            case '9': return 8;
        }
    }

    switch (rank) {
        case 'a': return 7;
        case 'k': return 6;
        case 'q': return 5;
        case 'j': return 4;
        case '10': return 3;
        case '9': return 2;
    }

    return 0;
};

const findTrickWinner = (trick, trumpSuit, leadSuit) => {
    let highestRank = -1;
    let winningPlayerId = null;

    trick.forEach(({ playerId, card }) => {
        const cardRank = getCardRank(card, trumpSuit);
        
     
        const isTrumpCard = card?.suit === trumpSuit || getCardRank(card, trumpSuit) >= 13; 
        const isFollowingLeadSuit = card?.suit === leadSuit;
        
       
        if ((isTrumpCard || isFollowingLeadSuit) && cardRank > highestRank) {
            highestRank = cardRank;
            winningPlayerId = playerId;
        }
    });

    return winningPlayerId;
};
module.exports = findTrickWinner;