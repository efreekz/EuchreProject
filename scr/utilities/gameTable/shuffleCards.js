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
    constructor(level = 1) {
        this.level = level;
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

    // Method to shuffle the deck based on the game level
    shuffleDeck() {
        switch (this.level) {
            case 1:
                this.shuffleLevelOne(); // Shuffle for level 1
                break;
            case 2:
                this.shuffleLevelTwo(); // Shuffle for level 2
                break;
            case 3:
                this.shuffleLevelThree(); // Shuffle for level 3
                break;
            case 4:
                this.shuffleLevelFour(); // Shuffle for level 4
                break;
            default:
                this.shuffleFisherYates(); // Default shuffle
                break;
        }
    }

    // Fisher-Yates shuffle (default shuffle algorithm)
    shuffleFisherYates() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]; // Swap elements
        }
    }

    // Shuffle logic for Level 1 (basic Fisher-Yates)
    shuffleLevelOne() {
        console.log('Shuffling for level 1...');
        this.shuffleFisherYates();
    }

    // Shuffle logic for Level 2 (Fisher-Yates + Reverse)
    shuffleLevelTwo() {
        console.log('Shuffling for level 2...');
        this.shuffleFisherYates();
        this.deck.reverse(); // Additional reverse after Fisher-Yates shuffle
    }

    // Shuffle logic for Level 3 (Fisher-Yates + Split and Reverse Halves)
    shuffleLevelThree() {
        console.log('Shuffling for level 3...');
        this.shuffleFisherYates(); // Fisher-Yates shuffle

        // Split the deck into two halves
        const mid = Math.floor(this.deck.length / 2);
        let firstHalf = this.deck.slice(0, mid);   // First half
        let secondHalf = this.deck.slice(mid);     // Second half

        // Reverse each half separately
        firstHalf.reverse();
        secondHalf.reverse();

        // Merge them back
        this.deck = [...firstHalf, ...secondHalf];
    }

    // Shuffle logic for Level 4 (Fisher-Yates + Rotate top 3 cards to bottom)
    shuffleLevelFour() {
        console.log('Shuffling for level 4...');
        this.shuffleFisherYates(); // Fisher-Yates shuffle

        // Rotate top 3 cards to the bottom
        const topThreeCards = this.deck.splice(0, 3);
        this.deck.push(...topThreeCards); // Move the top 3 cards to the end of the deck
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
module.exports = { shuffleCards };