// socket.on('joinedRoom', async (e) => {
// 	let data = e;
// 	console.log("joined ", e);

// 	if (typeof e === 'string') {
// 		data = JSON.parse(e);
// 	}

// 	if (data.roomId) {
// 		socket.join(data.roomId);
// 		const findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(data.roomId) });
// 		if (findedRoom) {
// 			console.log('in findedrommm')
// 			if (findedRoom.status == 'shuffling' && !playingRoom.includes(findedRoom._id)) {
// 				//hash table
// 				playingRoom.push(findedRoom._id)
// 				await clearAllreadyDrawnCards()
// 				findedRoom.teamOne[0].isDealer = true;
// 				let teamOneUpdated;
// 				let teamTwoUpdated;
// 				teamOneUpdated = await Promise.all(findedRoom.teamOne.map(async (gamer, index) => {
// 					if (!gamer.cards || gamer.cards.length === 0) {
// 						const card = await shuffleCards(totalCard, 5);
// 						totalCard = totalCard.filter(tc => !card.includes(tc));
// 						if (index == 1) {
// 							return { ...gamer, cards: card, };
// 						} else {
// 							return { ...gamer, cards: card };
// 						}
// 					}
// 				}));
// 				teamTwoUpdated = await Promise.all(findedRoom.teamTwo.map(async (gamer, index) => {

// 					if (!gamer.cards || gamer.cards.length === 0) {
// 						const card = await shuffleCards(totalCard, 5);
// 						totalCard = totalCard.filter(tc => !card.includes(tc));
// 						if (index == 0) {
// 							return { ...gamer, cards: card, isTurn: true, isTrumpShow: true };
// 						} else {
// 							return { ...gamer, cards: card };
// 						}
// 					}
// 				}));


// 				// Update the total cards after player cards have been dealt
// 				findedRoom.status = 'playing'
// 				findedRoom.totalCards = totalCard;
// 				// findedRoom.players = updatedPlayers;
// 				findedRoom.teamOne = await teamOneUpdated;
// 				findedRoom.teamTwo = await teamTwoUpdated;
// 				alreadyDrawnCards = [];
// 				await findedRoom.save();
// 				io.to(data.roomId).emit('roomUpdates', { roomData: findedRoom });
// 				await client.json.set(data.roomId,'$' ,findedRoom);
// 				totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
// 				// let index = playingRoom.indexOf(findedRoom._id);
// 				// if (index !== -1) {
// 				// 	playingRoom.splice(index, 1);
// 				// }
// 			} else {
// 				io.to(data.roomId).emit('roomUpdates', { roomData: findedRoom });
// 			}


// 		}
// 	}

// })


//pass trum box

socket.on('passTrumpBox', async (e) => {
	const roomId = e.roomId;

	if (roomId) {
		let findedRoom = await client.json.get(roomId);
		console.log('passtrumpbox client', findedRoom)
		if (typeof findedRoom === 'string') {
			findedRoom = JSON.parse(findedRoom);
		}
		if (!findedRoom) {
			findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
		}
		let { teamOne, teamTwo, trumpRound } = await passTrumpBox(findedRoom.teamOne, findedRoom.teamTwo, findedRoom.trumpRound);
		findedRoom.teamOne = teamOne;
		findedRoom.teamTwo = teamTwo;
		findedRoom.trumpRound = trumpRound;
		console.log('trumpRound', trumpRound)
		if (trumpRound == 2) {
			trumpRound = 0
			const { teamOne, teamTwo } = await createDealer(findedRoom.teamOne, findedRoom.teamTwo,);

			findedRoom.trumpRound = trumpRound;
			await clearAllreadyDrawnCards()

			let updatedteamOne = await Promise.all(teamOne.map(async (p, index) => {
				totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
				const card = await shuffleCards(totalCard, 5);
				totalCard = totalCard.filter(tc => !card.includes(tc));
				if (index == 1) {
					return { ...p, cards: card };
				} else {
					return { ...p, cards: card };
				}
			}));
			let updatedteamTwo = await Promise.all(teamTwo.map(async (p, index) => {
				totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
				const card = await shuffleCards(totalCard, 5);
				totalCard = totalCard.filter(tc => !card.includes(tc));
				if (index == 1) {
					return { ...p, cards: card };
				} else {
					return { ...p, cards: card };
				}
			}));
			findedRoom.teamOne = updatedteamOne;
			findedRoom.teamTwo = updatedteamTwo;
			// Update the total cards after player cards have been dealt
			findedRoom.status = 'playing';
			alreadyDrawnCards = [];
			findedRoom.totalCards = totalCard;
			// findedRoom.players = updatedPlayers;
		}






		const clients = io.sockets.adapter.rooms.get(roomId);

		if (clients) {
			console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
		} else {
			console.log('No clients in the room');
		}

		io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
		const updateClient = await client.json.set(roomId, '$', findedRoom);
		console.log('asdf', updateClient)
		if (updateClient != 'OK') {
			const updatedRoom = await PlayingRoom.findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
				findedRoom,              // Update data
				{ new: true }                                  // Options
			);
		}
		console.log('emited',)
	}

});


socket.on('TrumpCardSuitSelected', async (e) => {
	const roomId = e.roomId;
	const selectedCard = e.card;
	if (roomId) {
		let findedRoom = await client.json.get(roomId);
		console.log('passtrumpbox client', findedRoom)
		if (typeof findedRoom === 'string') {
			findedRoom = JSON.parse(findedRoom);
		}


		findedRoom.trumpSuit = selectedCard;

		findedRoom.trumpRound = 0;
		findedRoom.isTrumpSelected = true;
		findedRoom.isStarted = true;

		const clients = io.sockets.adapter.rooms.get(roomId);

		if (clients) {
			console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
		} else {
			console.log('No clients in the room');
		}

		io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
		const updateClient = await client.json.set(roomId, '$', findedRoom);
		console.log('asdf', updateClient)
		if (updateClient != 'OK') {
			const updatedRoom = await PlayingRoom.findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
				{ trumpSuit: selectedCard, isTrumpSelected: true, trumpRound: 0, isStarted: true },              // Update data
				{ new: true }                                  // Options
			);
		}
		console.log('emited',)
	}

})
socket.on('TrumpSelected', async (e) => {
	const roomId = e.roomId;
	const selectedCard = e.selectedCard;

	let findedRoom = await client.json.get(roomId);
	console.log('passtrumpbox client', findedRoom)
	if (typeof findedRoom === 'string') {
		findedRoom = JSON.parse(findedRoom);
	}
	if (!findedRoom) {
		findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
	}

	const { teamOnes, teamTwos } = await reciveTrumpSelectedCard(findedRoom.teamOne, findedRoom.teamTwo, selectedCard);

	if (roomId) {
		findedRoom.teamOne = teamOnes;
		findedRoom.teamTwo = teamTwos;
		findedRoom.trumpSuit = selectedCard;
		findedRoom.isTrumpSelected = true;
		findedRoom.trumpRound = 0;
		findedRoom.isStarted = true;




		const clients = io.sockets.adapter.rooms.get(roomId);

		if (clients) {
			console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
		} else {
			console.log('No clients in the room');
		}

		io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
		const updateClient = await client.json.set(roomId, '$', findedRoom);
		console.log('asdf', updateClient)
		if (updateClient != 'OK') {
			const updatedRoom = await PlayingRoom.findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
				{ trumpSuit: selectedCard, isTrumpSelected: true, teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, trumpRound: 0 },              // Update data
				{ new: true }                                  // Options
			);
		}
	}

})
socket.on('removeExtraCard', async (e) => {
	const roomId = e.roomId;
	const removedCardSelected = e.card;

	let findedRoom = await client.json.get(roomId);
	console.log('passtrumpbox client', findedRoom)
	if (typeof findedRoom === 'string') {
		findedRoom = JSON.parse(findedRoom);
	}
	if (!findedRoom) {
		findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
	}
	const { teamOne, teamTwo } = await removedCard(findedRoom.teamOne, findedRoom.teamTwo, removedCardSelected);
	findedRoom.teamOne = teamOne;
	findedRoom.teamTwo = teamTwo;
	findedRoom.isStarted = true;


	if (roomId) {




		const clients = io.sockets.adapter.rooms.get(roomId);

		if (clients) {
			console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
		} else {
			console.log('No clients in the room');
		}

		io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
		const updateClient = await client.json.set(roomId, '$', findedRoom);
		if (updateClient != 'OK') {
			const updatedRoom = await PlayingRoom.findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
				{ teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, isStarted: true },              // Update data
				{ new: true }                                  // Options
			);
		}
	}
})