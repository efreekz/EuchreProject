// let alreadyDrawnCards = [];


// async function shuffleCards(totalCard, count) {
// 	let drawnCards = [];
// 	while (drawnCards.length < count) {
// 		const randomIndex = Math.floor(Math.random() * totalCard.length);
// 		const randomCard = totalCard[randomIndex];
// 		if (!drawnCards.includes(randomCard) && !alreadyDrawnCards.includes(randomCard)) {
// 			drawnCards.push(randomCard);
// 			alreadyDrawnCards.push(randomCard);
// 		}
// 	}
// 	return drawnCards;
// };
// function clearAllreadyDrawnCards(){
// 	alreadyDrawnCards = [];
// }
// module.exports = {shuffleCards, clearAllreadyDrawnCards};


class shuffleCards {
    constructor() {
        this.suits = ['h', 'd', 'c', 's'];
        this.values = ['9', '10', 'j', 'q', 'k', 'a'];
        this.deck = this.createDeck();
    }

    // Method to create a Euchre deck
    createDeck() {
        let deck = [];
        this.suits.forEach(suit => {
            this.values.forEach(value => {
                const card = `${value}${suit}`;
                deck.push(card);
            });
        });
        return deck;
    }

    // Method to shuffle the deck using the Fisher-Yates algorithm
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]; // Swap elements
        }
    }

    // Method to deal cards to 4 players and set aside 4 cards for trump selection
    dealCards() {
        this.shuffleDeck(); // Shuffle the deck before dealing

        const players = {
            player1: [],
            player2: [],
            player3: [],
            player4: []
        };

        // Distribute 5 cards to each player
        for (let i = 0; i < 5; i++) {
            players.player1.push(this.deck.pop());
            players.player2.push(this.deck.pop());
            players.player3.push(this.deck.pop());
            players.player4.push(this.deck.pop());
        }

        // Set aside 4 cards for trump selection
        const trumpSelectionCards = this.deck.splice(0, 4);

        // Return the distributed cards
        return {
            players,
            trumpSelectionCards
        };
    }
}

// Export the shuffleCards class
module.exports = {shuffleCards};
