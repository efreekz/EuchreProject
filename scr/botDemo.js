
class EuchreBotPlayer {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.trumpSuit = 'clubs';
        this.dealer = false;
    }


    setTrump(trumpAbbreviation) {
        const suitMap = {
            'h': 'hearts',
            'd': 'diamonds',
            's': 'spades',
            'c': 'clubs'
        };

        // Set the trump based on abbreviation
        this.trump = trumpAbbreviation;
        this.trumpSuit = suitMap[trumpAbbreviation.toLowerCase()];  // Full suit name

        console.log(`Trump set to: ${this.trumpSuit} (${this.trump})`);
    }


    receiveCards(cards) {
        const suitMap = {
            'h': 'hearts',
            'd': 'diamonds',
            's': 'spades',
            'c': 'clubs'
        };

        const rankMap = {
            'a': 14, // Ace
            'k': 13, // King
            'q': 12, // Queen
            'j': 11, // Jack
            '10': 10,
            '9': 9
        };

        this.hand = cards
            .filter(card => card !== 0)  // Skip any 0 values
            .map(card => {
                const rankStr = card.slice(0, -1);  // All but last character(s) is rank
                const suitChar = card.slice(-1);    // Last character is the suit

                const rank = rankMap[rankStr.toLowerCase()] || parseInt(rankStr);
                const suit = suitMap[suitChar.toLowerCase()];

                return { rank, suit };
            });
    }

    setDealer(isDealer) {
        this.dealer = isDealer;
    }

    chooseTrump() {
        const suitsCount = { 'hearts': 0, 'diamonds': 0, 'spades': 0, 'clubs': 0 };

        this.hand.forEach(card => {
            suitsCount[card.suit]++;
        });

        let chosenSuit = null;
        let maxCount = 0;

        for (const [suit, count] of Object.entries(suitsCount)) {
            if (count > maxCount) {
                maxCount = count;
                chosenSuit = suit;
            }
        }

        this.trumpSuit = chosenSuit;

        const suitAbbreviationMap = {
            'hearts': 'h',
            'diamonds': 'd',
            'spades': 's',
            'clubs': 'c'
        };

        const suitAbbreviation = suitAbbreviationMap[this.trumpSuit];

        return suitAbbreviation;
    }

    swapCard({ _id, cards, trump }) {
        if (this.dealer) {
            // Set current hand from provided cards
            this.receiveCards(cards);
            const trumpSuit = trump.slice(-1).toLowerCase();
            const suitMap = { 'h': 'hearts', 'd': 'diamonds', 's': 'spades', 'c': 'clubs' };

            this.trumpSuit = suitMap[trumpSuit];

            // Identify non-trump, non-spade cards
            const nonTrumpCards = this.hand.filter(card => card.suit !== this.trumpSuit && card.suit !== 'spades');

            if (nonTrumpCards.length > 0) {
                // Sort to get the weakest eligible card
                const weakCard = nonTrumpCards.sort((a, b) => a.rank - b.rank)[0];

                // Remove the weak card from the hand
                this.hand = this.hand.filter(card => !(card.rank === weakCard.rank && card.suit === weakCard.suit));

                // Parse trump card details
                const trumpCardRankStr = trump.slice(0, -1);
                const trumpCardSuitChar = trump.slice(-1);

                const rankMap = { 'a': 14, 'k': 13, 'q': 12, 'j': 11, '10': 10, '9': 9 };

                // Create the new trump card
                const newCard = {
                    rank: rankMap[trumpCardRankStr.toLowerCase()] || parseInt(trumpCardRankStr),
                    suit: suitMap[trumpCardSuitChar.toLowerCase()]
                };

                // Add trump card to hand
                this.hand.push(newCard);

                // Return shorthand notation of the removed card
                const rankMapReverse = { 14: 'a', 13: 'k', 12: 'q', 11: 'j', 10: '10', 9: '9' };
                const suitMapReverse = { 'hearts': 'h', 'diamonds': 'd', 'spades': 's', 'clubs': 'c' };

                return (rankMapReverse[weakCard.rank] || weakCard.rank) + suitMapReverse[weakCard.suit];
            }
        }
        return null; // If no card was swapped, return null
    }

    playCard(leadCard) {
        if (this.hand.length === 0) {
            return "";
        }

        const rankMapReverse = {
            14: 'a', 13: 'k', 12: 'q', 11: 'j', 10: '10', 9: '9'
        };
        const suitMapReverse = {
            'hearts': 'h', 'diamonds': 'd', 'spades': 's', 'clubs': 'c'
        };

        let cardToPlay;

        // Determine the left bower (jack of the same color as trump suit) and treat it as part of the trump suit
        const leftBowerSuit =
            this.trumpSuit === 'hearts'
                ? 'diamonds'
                : this.trumpSuit === 'diamonds'
                    ? 'hearts'
                    : this.trumpSuit === 'spades'
                        ? 'clubs'
                        : 'spades';

        // Treat both jacks (right and left bowers) as part of the trump suit
        const isTrumpCard = card =>
            card.suit === this.trumpSuit ||
            (card.rank === 11 && card.suit === leftBowerSuit); // left bower is also trump

        if (leadCard) {
            // Parse the lead card to get suit and rank
            const leadRankStr = leadCard.slice(0, -1);
            const leadSuitChar = leadCard.slice(-1);
            const leadSuit = { 'h': 'hearts', 'd': 'diamonds', 's': 'spades', 'c': 'clubs' }[leadSuitChar];

            // Adjust the lead suit cards to match lead, excluding trump left bower if not necessary
            const leadSuitCards = this.hand.filter(card =>
                card.suit === leadSuit &&
                !(card.rank === 11 && card.suit === leftBowerSuit)
            );
            if (leadRankStr === 'j' && leadSuit === leftBowerSuit) {
                const leadSuitCards = this.hand.filter(card =>
                    card.suit === this.trumpSuit &&
                    !(card.rank === 11 && card.suit === leftBowerSuit)
                );
                if (leadSuitCards.length > 0) {
                    // Play highest card of the lead suit
                    cardToPlay = leadSuitCards.sort((a, b) => b.rank - a.rank)[0];
                } else {
                    // No lead suit cards; prioritize trump cards
                    const trumpCards = this.hand.filter(isTrumpCard);

                    if (trumpCards.length > 0) {
                        cardToPlay = trumpCards.sort((a, b) => b.rank - a.rank)[0];
                    } else {
                        // If no trump or lead suit cards, play lowest-ranked card
                        cardToPlay = this.hand.sort((a, b) => a.rank - b.rank)[0];
                    }
                }
            } else if (leadSuitCards.length > 0) {
                // Play highest card of the lead suit
                cardToPlay = leadSuitCards.sort((a, b) => b.rank - a.rank)[0];
            } else {
                // No lead suit cards; prioritize trump cards
                const trumpCards = this.hand.filter(isTrumpCard);

                if (trumpCards.length > 0) {
                    cardToPlay = trumpCards.sort((a, b) => b.rank - a.rank)[0];
                } else {
                    // If no trump or lead suit cards, play lowest-ranked card
                    cardToPlay = this.hand.sort((a, b) => a.rank - b.rank)[0];
                }
            }
        } else {
            // No lead card; play highest trump or other high card
            const trumpCards = this.hand.filter(isTrumpCard);

            if (trumpCards.length > 0) {
                cardToPlay = trumpCards.sort((a, b) => b.rank - a.rank)[0];
            } else {
                cardToPlay = this.hand.sort((a, b) => b.rank - a.rank)[0];
            }
        }

        // Remove the chosen card from hand
        this.hand = this.hand.filter(
            card => !(card.rank === cardToPlay.rank && card.suit === cardToPlay.suit)
        );

        // Return card in shorthand format
        const cardStr =
            (rankMapReverse[cardToPlay.rank] || cardToPlay.rank) +
            suitMapReverse[cardToPlay.suit];

        return cardStr;
    }


    getFormattedHand() {
        const rankMapReverse = {
            14: 'a', 13: 'k', 12: 'q', 11: 'j', 10: '10', 9: '9'
        };
        const suitMapReverse = {
            'hearts': 'h', 'diamonds': 'd', 'spades': 's', 'clubs': 'c'
        };

        // Use a Set to track unique cards
        const uniqueCards = new Set();

        // Add unique cards to the Set
        this.hand.forEach(card => {
            const cardStr = (rankMapReverse[card.rank] || card.rank) + suitMapReverse[card.suit];
            uniqueCards.add(cardStr);
        });

        // Convert the Set back to an array
        return Array.from(uniqueCards);
    }

    decideTrumpSelection(trumpCard) {
        const trumpSuit = trumpCard.suit;
        const trumpSuitCount = this.hand.filter(card => card.suit === trumpSuit).length;

        if (trumpSuitCount >= 2) {
            console.log(`${this.name} chooses ${trumpSuit} as the trump suit.`);
            return true;
        }

        console.log(`${this.name} passes the trump selection.`);
        return false;
    }
}

// // Example Usage
// const botPlayer = new EuchreBotPlayer("Bot1");

// // Set the bot as the dealer and give it a hand
// botPlayer.setDealer(true);
// botPlayer.receiveCards(['js','kh','ad',0,0]);
// console.log("Updated hand after swap:", botPlayer.getFormattedHand());



// // Play a card, with a lead card specified
// console.log(botPlayer.playCard("as")); // Leads with "9h", bot should play "ah" if available

// // Play a card with no lead card (first play)
// console.log(botPlayer.playCard(null));

// // Updated hand
// console.log("Updated hand:", botPlayer.getFormattedHand());
module.exports = EuchreBotPlayer;



// class EuchreBotPlayer {
//     constructor(name) {
//         this.name = name;
//         this.hand = [];
//         this.trumpSuit = null;
//         this.dealer = false;
//     }

//     receiveCards(cards) {
//         const suitMap = {
//             'h': 'hearts',
//             'd': 'diamonds',
//             's': 'spades',
//             'c': 'clubs'
//         };

//         const rankMap = {
//             'a': 14, // Ace
//             'k': 13, // King
//             'q': 12, // Queen
//             'j': 11, // Jack
//             '10': 10,
//             '9': 9
//         };

//         this.hand = cards
//             .filter(card => card !== 0)  // Skip any 0 values
//             .map(card => {
//                 const rankStr = card.slice(0, -1);  // All but last character(s) is rank
//                 const suitChar = card.slice(-1);    // Last character is the suit

//                 const rank = rankMap[rankStr.toLowerCase()] || parseInt(rankStr);
//                 const suit = suitMap[suitChar.toLowerCase()];

//                 return { rank, suit };
//             });
//     }

//     setDealer(isDealer) {
//         this.dealer = isDealer;
//     }

//     chooseTrump() {
//         const suitsCount = { 'hearts': 0, 'diamonds': 0, 'spades': 0, 'clubs': 0 };

//         this.hand.forEach(card => {
//             suitsCount[card.suit]++;
//         });

//         let chosenSuit = null;
//         let maxCount = 0;

//         for (const [suit, count] of Object.entries(suitsCount)) {
//             if (count > maxCount) {
//                 maxCount = count;
//                 chosenSuit = suit;
//             }
//         }

//         this.trumpSuit = chosenSuit;

//         const suitAbbreviationMap = {
//             'hearts': 'h',
//             'diamonds': 'd',
//             'spades': 's',
//             'clubs': 'c'
//         };

//         const suitAbbreviation = suitAbbreviationMap[this.trumpSuit];

//         return suitAbbreviation;
//     }

//     swapCard({ _id, cards, trump }) {
//         if (this.dealer) {
//             // Set current hand from provided cards
//             this.receiveCards(cards);
//             const trumpSuit = trump.slice(-1).toLowerCase();
//             const suitMap = { 'h': 'hearts', 'd': 'diamonds', 's': 'spades', 'c': 'clubs' };

//             this.trumpSuit = suitMap[trumpSuit];

//             // Identify non-trump, non-spade cards
//             const nonTrumpCards = this.hand.filter(card => card.suit !== this.trumpSuit && card.suit !== 'spades');

//             if (nonTrumpCards.length > 0) {
//                 // Sort to get the weakest eligible card
//                 const weakCard = nonTrumpCards.sort((a, b) => a.rank - b.rank)[0];

//                 // Remove the weak card from the hand
//                 this.hand = this.hand.filter(card => !(card.rank === weakCard.rank && card.suit === weakCard.suit));

//                 // Parse trump card details
//                 const trumpCardRankStr = trump.slice(0, -1);
//                 const trumpCardSuitChar = trump.slice(-1);

//                 const rankMap = { 'a': 14, 'k': 13, 'q': 12, 'j': 11, '10': 10, '9': 9 };

//                 // Create the new trump card
//                 const newCard = {
//                     rank: rankMap[trumpCardRankStr.toLowerCase()] || parseInt(trumpCardRankStr),
//                     suit: suitMap[trumpCardSuitChar.toLowerCase()]
//                 };

//                 // Add trump card to hand
//                 this.hand.push(newCard);

//                 // Return shorthand notation of the removed card
//                 const rankMapReverse = { 14: 'a', 13: 'k', 12: 'q', 11: 'j', 10: '10', 9: '9' };
//                 const suitMapReverse = { 'hearts': 'h', 'diamonds': 'd', 'spades': 's', 'clubs': 'c' };

//                 return (rankMapReverse[weakCard.rank] || weakCard.rank) + suitMapReverse[weakCard.suit];
//             }
//         }
//         return null; // If no card was swapped, return null
//     }

//     playCard(leadCard) {
//         if (this.hand.length === 0) {
//             return {
//                 "card": null,
//                 "UserId": "U2nQCOIp4azwAxDCyCXsChugatAs"
//             };
//         }

//         const rankMapReverse = {
//             14: 'a', 13: 'k', 12: 'q', 11: 'j', 10: '10', 9: '9'
//         };
//         const suitMapReverse = {
//             'hearts': 'h', 'diamonds': 'd', 'spades': 's', 'clubs': 'c'
//         };

//         let cardToPlay;

//         if (leadCard) {
//             // Parse the lead card to get suit and rank
//             const leadSuitChar = leadCard.slice(-1);
//             const leadSuit = { 'h': 'hearts', 'd': 'diamonds', 's': 'spades', 'c': 'clubs' }[leadSuitChar];

//             // Filter cards to match the lead suit
//             const leadSuitCards = this.hand.filter(card => card.suit === leadSuit);
//             if (leadSuitCards.length > 0) {
//                 // Sort to play the highest-ranking card of the lead suit
//                 cardToPlay = leadSuitCards.sort((a, b) => b.rank - a.rank)[0];
//             } else {
//                 // If no lead suit cards, fallback to trump or lowest ranking card
//                 const trumpCards = this.hand.filter(card => card.suit === this.trumpSuit);
//                 if (trumpCards.length > 0) {
//                     cardToPlay = trumpCards.sort((a, b) => b.rank - a.rank)[0];
//                 } else {
//                     cardToPlay = this.hand.sort((a, b) => a.rank - b.rank)[0];
//                 }
//             }
//         } else {
//             // If no lead card is provided, play the highest trump or other high card
//             const trumpCards = this.hand.filter(card => card.suit === this.trumpSuit);
//             if (trumpCards.length > 0) {
//                 cardToPlay = trumpCards.sort((a, b) => b.rank - a.rank)[0];
//             } else {
//                 cardToPlay = this.hand.sort((a, b) => b.rank - a.rank)[0];
//             }
//         }

//         // Remove the chosen card from hand
//         this.hand = this.hand.filter(card => !(card.rank === cardToPlay.rank && card.suit === cardToPlay.suit));

//         // Return card in shorthand format
//         const cardStr = (rankMapReverse[cardToPlay.rank] || cardToPlay.rank) + suitMapReverse[cardToPlay.suit];

//         return cardStr;
//     }

//     getFormattedHand() {
//         const rankMapReverse = {
//             14: 'a', 13: 'k', 12: 'q', 11: 'j', 10: '10', 9: '9'
//         };
//         const suitMapReverse = {
//             'hearts': 'h', 'diamonds': 'd', 'spades': 's', 'clubs': 'c'
//         };

//         // Use a Set to track unique cards
//         const uniqueCards = new Set();

//         // Add unique cards to the Set
//         this.hand.forEach(card => {
//             const cardStr = (rankMapReverse[card.rank] || card.rank) + suitMapReverse[card.suit];
//             uniqueCards.add(cardStr);
//         });

//         // Convert the Set back to an array
//         return Array.from(uniqueCards);
//     }

//     decideTrumpSelection(trumpCard) {
//         const trumpSuit = trumpCard.suit;
//         const trumpSuitCount = this.hand.filter(card => card.suit === trumpSuit).length;

//         if (trumpSuitCount >= 2) {
//             console.log(`${this.name} chooses ${trumpSuit} as the trump suit.`);
//             return true;
//         }

//         console.log(`${this.name} passes the trump selection.`);
//         return false;
//     }
// }

// // // Example Usage
// // const botPlayer = new EuchreBotPlayer("Bot1");

// // // Set the bot as the dealer and give it a hand
// // botPlayer.setDealer(true);
// // botPlayer.receiveCards(['ah', 'jd', '9h', 'ks', 'qs', 'js']);



// // botPlayer.trumpSuit = 'spades';  // Assuming spades is trump

// // console.log(botPlayer.swapCard({
// //     _id: "67164d02bdb6cfa82c62ed7e",
// //     cards: ['ah', 'jd', '9h', 'ks', 'qs', 'js'],  // Example hand with a spade trump card
// //     trump: "js"  // Specifying the trump card as 'js' (Jack of Spades)
// // }))

// // console.log("Updated hand after swap:", botPlayer.getFormattedHand());



// // // Play a card, with a lead card specified
// // console.log(botPlayer.playCard("10d")); // Leads with "9h", bot should play "ah" if available

// // // Play a card with no lead card (first play)
// // console.log(botPlayer.playCard(null));

// // // Updated hand
// // console.log("Updated hand:", botPlayer.getFormattedHand());
// module.exports = EuchreBotPlayer;