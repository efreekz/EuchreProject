
const createDealer = require("./createDealer.js");
const findTrickWinner = require("./findeWinner.js");
const { getLeadSuit } = require("./getLeadSuit.js");
const parseCards = require("./parseCards.js");
const parseTrumCard = require("./parseTrumCard.js");
const { shuffleCards } = require("./shuffleCards.js");
const GameTrick = require("../../models/tricks.model.js");
const GameRound = require("../../models/rounds.model.js");
const { default: mongoose } = require("mongoose");
const PlayingRoom = require("../../modules/playingroom/playingRoom.model.js");
const checkIsTurn = require("./checkIsTrun.js");
const { getTimePlus30Seconds } = require("../timerTable/setTimer.js");
const checkIsTrumpTimeOut = require("../timerTable/checkIsTrumTimeOut.js");
const { addTimePlayersisTrumpShow, addTimePlayersIsTurn } = require("../timerTable/addTimeInPlayers.js");
const delay = require("./delay.js");
const client = require("../redisClient.js");
const checkIsTimeOutTurn = require("../timerTable/checkIsTimeOutTurn.js");
const WalletTransactionService = require("../gameCoinTransactions.js");
const GameDetails = require("../../modules/games/games.model.js");
const Tournament = require("../../modules/tournament/tournament.model.js");
const { updateBotRoleInMainData } = require("../updateRoomRoleToBot.js");
let checkIsBotTurn;
let checkIsBotTrumpSelection;
let checkIsLastCardThrow;
const loadModule = async () => {
    checkIsBotTrumpSelection = await import("./checkisTrumpSelection.js");
    checkIsBotTurn = await import("./checkisBotTurn.js");
    checkIsLastCardThrow = await import("../checkIslastCard.js");
};


class GameManager {
    constructor(findedRoom, io) {
        this.findedRoom = findedRoom;
        this.io = io;
        this.balanceDetails;
    }

    async playerOne() {
        let sendNextTurn = true;
        let lastTrickUpdate = {};
        let allPlayers = [this.findedRoom?.teamOne[0], this.findedRoom?.teamTwo[0], this.findedRoom?.teamOne[1], this.findedRoom?.teamTwo[1]];
        const parsedCards = await parseCards(this.findedRoom?.playedCards);
        const trumpSuit = await parseTrumCard(this.findedRoom?.trumpSuit);
        const leadSuit = await getLeadSuit(this.findedRoom?.playedCards[0]?.card ? this.findedRoom?.playedCards[0]?.card : this.findedRoom?.playedCards[1]?.card);
        const winner = await findTrickWinner(parsedCards, trumpSuit?.suit, leadSuit?.suit);
        lastTrickUpdate.winnerId = winner;
        let updatedAllPlayers = await Promise.all(
            allPlayers.map(async (player) => {
                player.isTrumpShow = false;
                if (player?.UserId === winner) {
                    return {
                        ...player,
                        points: (player?.points || 0) + 1,
                        isTurn: true,
                        isTrumpShow: true
                    };
                }
                return player;
            })
        );


        const playerCards = updatedAllPlayers.map((p) => p.cards.every(card => card === 0));
        const allTrue = playerCards.every(c => c === true);

        this.findedRoom.teamOne = [updatedAllPlayers[0], updatedAllPlayers[2]];
        this.findedRoom.teamTwo = [updatedAllPlayers[1], updatedAllPlayers[3]];

        this.findedRoom.teamOnePoints = {
            trikPoint: this.findedRoom?.teamOnePoints?.trikPoint || 0,
            winningPoint: this.findedRoom?.teamOnePoints?.winningPoint || 0,
            increasedWinningPoint: this.findedRoom?.teamOnePoints?.increasedWinningPoint || 0,
            playerOneUserId: this.findedRoom?.teamOne[0]?.UserId,
            playerTwoUserId: this.findedRoom?.teamOne[1]?.UserId,
            playerOneUserName: this.findedRoom?.teamOne[0]?.userName,
            playerTwoUserName: this.findedRoom?.teamOne[1]?.userName,
            isWinner: false
        };

        this.findedRoom.teamTwoPoints = {
            trikPoint: this.findedRoom?.teamTwoPoints?.trikPoint || 0,
            winningPoint: this.findedRoom?.teamTwoPoints?.winningPoint || 0,
            increasedWinningPoint: this.findedRoom?.teamTwoPoints?.increasedWinningPoint || 0,
            playerOneUserId: this.findedRoom?.teamTwo[0]?.UserId,
            playerTwoUserId: this.findedRoom?.teamTwo[1]?.UserId,
            playerOneUserName: this.findedRoom?.teamTwo[0]?.userName,
            playerTwoUserName: this.findedRoom?.teamTwo[1]?.userName,
            isWinner: false
        };

        let teamOneTrikPoint = 0;
        let teamTwoTrikPoint = 0;

        Promise.all([
            this.findedRoom.teamOne.map((e) => {
                teamOneTrikPoint += e?.points || 0; // Add points if they exist, otherwise add 0
            }),
            this.findedRoom.teamTwo.map((e) => {
                teamTwoTrikPoint += e?.points || 0; // Add points if they exist, otherwise add 0
            })
        ]).then(() => {
            console.log("Total points calculated for both teams");
        }).catch((error) => {
            console.error("Error calculating points:", error);
        });

        this.findedRoom.lastPlayedCards = this.findedRoom?.playedCards;
        const payload = {
            playedCards: this.findedRoom.playedCards,
            status: 'complete',
            roomId: this.findedRoom?._id,
            roundId: this.findedRoom?.handId,
            players: this.findedRoom?.players,
            teamOne: this.findedRoom?.teamOne,
            teamTwo: this.findedRoom?.teamTwo,
            trumpSuit: this.findedRoom?.trumpSuit,
            isTrickWinnerId: winner,
        }
        await GameTrick.create(payload);
        this.findedRoom.playedCards = [];

        this.findedRoom.teamOnePoints.trikPoint = teamOneTrikPoint;
        this.findedRoom.teamTwoPoints.trikPoint = teamTwoTrikPoint;
        const timeOut = await getTimePlus30Seconds();
        let { userId, isPlayingAlone, teamOne, teamTwo } = await checkIsTurn(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, 0, timeOut);

        if (this.findedRoom?.playedCards.length == 0 && allTrue) {
            sendNextTurn = false;
            let isRoundWinner = '';
            let isRoundEnd = false;
            if (this.findedRoom?.teamOnePoints?.trikPoint === 5 && (this.findedRoom?.teamOne[0]?.isPlayAlone || this.findedRoom?.teamOne[1]?.isPlayAlone)) {
                isRoundWinner = 'teamOne';
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom?.teamOnePoints?.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom?.teamOnePoints?.winningPoint ? this.findedRoom?.teamOnePoints?.winningPoint == 9 ? this.findedRoom?.teamOnePoints?.winningPoint + 1 : this.findedRoom?.teamOnePoints?.winningPoint == 8 ? this.findedRoom.teamOnePoints?.winningPoint + 2 : this.findedRoom?.teamOnePoints?.winningPoint == 7 ? this.findedRoom?.teamOnePoints?.winningPoint + 3 : this.findedRoom?.teamOnePoints.winningPoint + 4 : 4;
                this.findedRoom.teamOnePoints.increasedWinningPoint = this.findedRoom.teamOnePoints.winningPoint == 9 ? 1 : this.findedRoom.teamOnePoints.winningPoint == 8 ? 2 : this.findedRoom.teamOnePoints.winningPoint == 7 ? 3 : 4;
                // this.findedRoom.teamOnePoints.trikPoint = 0;
            } else if (this.findedRoom.teamOnePoints.trikPoint === 5 && (this.findedRoom?.teamOnePoints?.playerOneUserId === this.findedRoom?.trumpMaker || this.findedRoom?.teamOnePoints?.playerTwoUserId === this.findedRoom?.trumpMaker)) {
                isRoundWinner = 'teamOne';
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom?.teamOnePoints?.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom?.teamOnePoints?.winningPoint ? this.findedRoom?.teamOnePoints?.winningPoint == 9 ? this.findedRoom?.teamOnePoints?.winningPoint + 1 : this.findedRoom?.teamOnePoints?.winningPoint + 2 : 2;
                this.findedRoom.teamOnePoints.increasedWinningPoint = this.findedRoom?.teamOnePoints?.winningPoint == 9 ? 1 : 2;
                // this.findedRoom.teamOnePoints.trikPoint = 0;
            } else if ((this.findedRoom?.teamOnePoints?.trikPoint == 3 || this.findedRoom?.teamOnePoints?.trikPoint == 4) && (this.findedRoom?.teamOnePoints?.playerOneUserId === this.findedRoom?.trumpMaker || this.findedRoom?.teamOnePoints?.playerTwoUserId === this.findedRoom?.trumpMaker)) {
                isRoundWinner = 'teamOne';
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom?.teamOnePoints?.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom?.teamOnePoints?.winningPoint ? this.findedRoom?.teamOnePoints?.winningPoint + 1 : 1;
                this.findedRoom.teamOnePoints.increasedWinningPoint = 1;
                // this.findedRoom.teamOnePoints.trikPoint = 0;
            } else if (this.findedRoom?.teamOnePoints?.trikPoint < 3 && (this.findedRoom?.teamOnePoints?.playerOneUserId === this.findedRoom?.trumpMaker || this.findedRoom?.teamOnePoints?.playerTwoUserId === this.findedRoom?.trumpMaker)) {
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom.teamOnePoints.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom.teamOnePoints.winningPoint ? this.findedRoom.teamOnePoints.winningPoint : 0;
                this.findedRoom.teamOnePoints.increasedWinningPoint = 0;
                // this.findedRoom.teamOnePoints.trikPoint = 0;


                isRoundEnd = true;
                isRoundWinner = 'teamTwo';
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint == 9 ? this.findedRoom.teamTwoPoints.winningPoint + 1 : this.findedRoom.teamTwoPoints.winningPoint + 2 : 2;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = this.findedRoom.teamTwoPoints.winningPoint == 9 ? 1 : 2;
            }


            if (this.findedRoom.teamTwoPoints.trikPoint === 5 && (this.findedRoom.teamTwo[0].isPlayAlone || this.findedRoom.teamTwo[1].isPlayAlone)) {
                isRoundWinner = 'teamTwo';
                isRoundEnd = true;
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint == 9 ? this.findedRoom.teamTwoPoints.winningPoint + 1 : this.findedRoom.teamTwoPoints.winningPoint == 8 ? this.findedRoom.teamTwoPoints.winningPoint + 2 : this.findedRoom.teamTwoPoints.winningPoint == 7 ? this.findedRoom.teamTwoPoints.winningPoint + 3 : this.findedRoom.teamTwoPoints.winningPoint + 4 : 4;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = this.findedRoom.teamTwoPoints.winningPoint == 9 ? 1 : this.findedRoom.teamTwoPoints.winningPoint == 8 ? 2 : this.findedRoom.teamTwoPoints.winningPoint == 7 ? 3 : 4;
                // this.findedRoom.teamTwoPoints.trikPoint = 0;
            } else if (this.findedRoom.teamTwoPoints.trikPoint === 5 && (this.findedRoom.teamTwoPoints.playerOneUserId === this.findedRoom.trumpMaker || this.findedRoom.teamTwoPoints.playerTwoUserId === this.findedRoom.trumpMaker)) {
                isRoundWinner = 'teamTwo';
                isRoundEnd = true;
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint == 9 ? this.findedRoom.teamTwoPoints.winningPoint + 1 : this.findedRoom.teamTwoPoints.winningPoint + 2 : 2;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = this.findedRoom.teamTwoPoints.winningPoint == 9 ? 1 : 2;
                // this.findedRoom.teamTwoPoints.trikPoint = 0;
            } else if ((this.findedRoom.teamTwoPoints.trikPoint == 3 || this.findedRoom.teamTwoPoints.trikPoint == 4) && (this.findedRoom.teamTwoPoints.playerOneUserId === this.findedRoom.trumpMaker || this.findedRoom.teamTwoPoints.playerTwoUserId === this.findedRoom.trumpMaker)) {
                isRoundWinner = 'teamTwo';
                isRoundEnd = true;
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint + 1 : 1;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = 1;
                // this.findedRoom.teamTwoPoints.trikPoint = 0;
            } else if (this.findedRoom.teamTwoPoints.trikPoint < 3 && (this.findedRoom.teamTwoPoints.playerOneUserId === this.findedRoom.trumpMaker || this.findedRoom.teamTwoPoints.playerTwoUserId === this.findedRoom.trumpMaker)) {
                isRoundEnd = true;
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint : 0;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = 0;
                // this.findedRoom.teamTwoPoints.trikPoint = 0;


                isRoundWinner = 'teamOne';
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom.teamOnePoints.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom.teamOnePoints.winningPoint ? this.findedRoom.teamOnePoints.winningPoint == 9 ? this.findedRoom.teamOnePoints.winningPoint + 1 : this.findedRoom.teamOnePoints.winningPoint + 2 : 2;
                this.findedRoom.teamOnePoints.increasedWinningPoint = this.findedRoom.teamOnePoints.winningPoint == 9 ? 1 : 2;
            }
            const removeCards = (team) => {
                return team.map(({ cards, ...rest }) => rest);
            };
            const payload = {
                teamOne: removeCards(this.findedRoom?.teamOne),
                teamTwo: removeCards(this.findedRoom?.teamTwo),
                teamOnePoints: this.findedRoom?.teamOnePoints,
                teamTwoPoints: this.findedRoom?.teamTwoPoints,
                status: 'complete',
                isRoundWinner,
            }
            this.findedRoom.teamOne.forEach((player) => {
                player.lastPoints = player?.points;
                player.points = 0;
            });

            this.findedRoom.teamTwo.forEach((player) => {
                player.lastPoints = player?.points;
                player.points = 0;
            });

            await GameRound.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(this.findedRoom?.handId) },
                { $set: payload },
                { new: true }
            );
            if (this.findedRoom?.teamOnePoints?.winningPoint >= 10) {
                // await delay(1000);
                this.findedRoom.teamOnePoints.isWinner = true;
                this.findedRoom.status = 'complete';
                this.findedRoom.isWinner = 'teamOne';
                this.findedRoom.teamOne[0].isTurn = false;
                this.findedRoom.teamOne[0].isTrumpShow = false;
                this.findedRoom.teamOne[0].timeOut = '';
                this.findedRoom.teamOne[1].isTurn = false;
                this.findedRoom.teamOne[1].isTrumpShow = false;
                this.findedRoom.teamOne[1].timeOut = '';
                this.findedRoom.teamTwo[0].isTurn = false;
                this.findedRoom.teamTwo[0].isTrumpShow = false;
                this.findedRoom.teamTwo[0].timeOut = '';
                this.findedRoom.teamTwo[1].isTurn = false;
                this.findedRoom.teamTwo[1].isTrumpShow = false;
                this.findedRoom.teamTwo[1].timeOut = '';

                let winningAmount = 1000;
                let entryAmount = 1000;

                if (this.findedRoom?.roomType === 'tournament' && this.findedRoom?.tournamentId) {
                    const tournamentDetails = await Tournament.findOne({ _id: new mongoose.Types.ObjectId(this.findedRoom?.tournamentId) })
                    if (tournamentDetails?.registeredUsers) {
                        tournamentDetails.remainingMatches = (tournamentDetails?.remainingMatches - 1) <= 0 ? 0 : tournamentDetails?.remainingMatches - 1
                        // for (let i = 0; i < tournamentDetails?.registeredUsers.length; i++) {
                        //     if (!tournamentDetails?.registeredUsers[i].lost) {
                        //         if (tournamentDetails?.registeredUsers[i]?.descopeId === this.findedRoom?.teamOne[0]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i].playedMatch + 1;
                        //         } else if (tournamentDetails?.registeredUsers[i].descopeId === this.findedRoom?.teamOne[1]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i].playedMatch + 1;
                        //         } else if (tournamentDetails?.registeredUsers[i]?.descopeId === this.findedRoom?.teamTwo[0]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = false;
                        //             tournamentDetails.registeredUsers[i].lost = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i].playedMatch + 1;
                        //         } else if (tournamentDetails?.registeredUsers[i]?.descopeId === this.findedRoom?.teamTwo[1]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = false;
                        //             tournamentDetails.registeredUsers[i].lost = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i].playedMatch + 1;
                        //         }
                        //     }
                        // }
                        tournamentDetails?.registeredUsers.forEach(user => {
                            if (!user.lost) {
                                const { teamOne, teamTwo } = this.findedRoom;
                                if (user.descopeId === teamOne[0]?.UserId || user?.descopeId === teamOne[1]?.UserId) {
                                    user.isWinner = true;
                                    user.playedMatch = (user?.playedMatch || 0) + 1;
                                } else if (user.descopeId === teamTwo[0]?.UserId || user?.descopeId === teamTwo[1]?.UserId) {
                                    user.isWinner = false;
                                    user.lost = true;
                                    user.playedMatch = (user?.playedMatch || 0) + 1;
                                }
                            }
                        });

                        let updatedFields = {
                            registeredUsers: tournamentDetails?.registeredUsers,
                            remainingMatches: tournamentDetails?.remainingMatches
                        };
                        const filteredTournamentUsers = tournamentDetails?.registeredUsers.filter(user => user?.isWinner);

                        if (filteredTournamentUsers.length === 2 && tournamentDetails?.remainingMatches === 0) {
                            // Add your logic here for when there are exactly 2 winners
                            let gameDetails
                            if (this.findedRoom?.gameId) {
                                gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(this.findedRoom?.gameId) });
                                winningAmount = gameDetails?.TotalPrizeAmount
                                entryAmount = gameDetails?.entry
                            }

                            const deductionTime = new WalletTransactionService(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, winningAmount, gameDetails)
                            const updatedTeam = await deductionTime.addWinningprize(winningAmount, 'teamOne', 'teamTwo');
                            this.findedRoom.teamOne = updatedTeam?.teamOne;
                            this.findedRoom.teamTwo = updatedTeam?.teamTwo;
                            this.balanceDetails = updatedTeam?.balanceDetails;
                            updatedFields.status = 'complete';
                            updatedFields.isTournamentEnd = true;
                        }
                        await Tournament.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(this.findedRoom?.tournamentId) },
                            { $set: updatedFields }
                        );

                    }

                } else {
                    let gameDetails;
                    if (this.findedRoom?.gameId) {
                        gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(this.findedRoom?.gameId) });
                        winningAmount = gameDetails?.TotalPrizeAmount
                        entryAmount = gameDetails?.entry
                    }

                    const deductionTime = new WalletTransactionService(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, winningAmount, gameDetails)
                    const updatedTeam = await deductionTime.addWinningprize(winningAmount, 'teamOne', 'teamTwo');
                    this.findedRoom.teamOne = updatedTeam?.teamOne;
                    this.findedRoom.teamTwo = updatedTeam?.teamTwo;
                    this.balanceDetails = updatedTeam?.balanceDetails;

                }


                let RoundEndResult = {
                    isRoundWinner: isRoundWinner,
                    teamOnePoints: this.findedRoom?.teamOnePoints,
                    teamTwoPoints: this.findedRoom?.teamTwoPoints,
                    timerCount: 4
                }
                let GameEndResult = {
                    isRoundWinner: isRoundWinner,
                    winningAmount,
                    teamOnePoints: this.findedRoom?.teamOnePoints,
                    teamTwoPoints: this.findedRoom?.teamTwoPoints,
                    timerCount: 4,
                    entryAmount,
                    balanceDetails: this.balanceDetails
                }
                if (isRoundEnd) {
                    this.io.to(this.findedRoom?._id.toString()).emit('RoundEndResult', { roomData: RoundEndResult });
                    this.io.to(this.findedRoom?._id.toString()).emit('GameEndResult', { roomData: GameEndResult });
                    this.findedRoom.teamTwoPoints.trikPoint = 0;
                    this.findedRoom.teamOnePoints.trikPoint = 0;
                    // await delay(5000);
                }
                let trickEndResult = {
                    teamOnePoints: this.findedRoom?.teamOnePoints,
                    teamTwoPoints: this.findedRoom?.teamTwoPoints,
                    trickWinnerUserId: winner
                }
                this.io.to(this.findedRoom?._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });
                const room = this.io.sockets.adapter.rooms.get(this.findedRoom?._id.toString());

                if (room) {
                    // Iterate over each socket in the room
                    for (const socketId of room) {
                        const socket = this.io.sockets.sockets.get(socketId);
                        if (socket) {
                            // Disconnect the socket
                            socket.leave(this.findedRoom?._id.toString());
                            // socket.disconnect(true);
                        }
                    }
                }

                return { udpatedFindedRooom: this.findedRoom, lastTrickUpdate }
            }
            if (this.findedRoom.teamTwoPoints.winningPoint >= 10) {
                // await delay(1000);
                this.findedRoom.teamTwoPoints.isWinner = true;
                this.findedRoom.status = 'complete';
                this.findedRoom.isWinner = 'teamTwo';
                this.findedRoom.teamOne[0].isTurn = false;
                this.findedRoom.teamOne[0].isTrumpShow = false;
                this.findedRoom.teamOne[0].timeOut = '';
                this.findedRoom.teamOne[1].isTurn = false;
                this.findedRoom.teamOne[1].isTrumpShow = false;
                this.findedRoom.teamOne[1].timeOut = '';
                this.findedRoom.teamTwo[0].isTurn = false;
                this.findedRoom.teamTwo[0].isTrumpShow = false;
                this.findedRoom.teamTwo[0].timeOut = '';
                this.findedRoom.teamTwo[1].isTurn = false;
                this.findedRoom.teamTwo[1].isTrumpShow = false;
                this.findedRoom.teamTwo[1].timeOut = '';

                let winningAmount = 1000;
                let entryAmount = 1000;

                if (this.findedRoom?.roomType === 'tournament' && this.findedRoom?.tournamentId) {
                    const tournamentDetails = await Tournament.findOne({ _id: new mongoose.Types.ObjectId(this.findedRoom?.tournamentId) })

                    if (tournamentDetails?.registeredUsers) {
                        tournamentDetails.remainingMatches = (tournamentDetails?.remainingMatches - 1) <= 0 ? 0 : tournamentDetails?.remainingMatches - 1;
                        // for (let i = 0; i < tournamentDetails?.registeredUsers.length; i++) {
                        //     if (!tournamentDetails?.registeredUsers[i].lost) {

                        //         if (tournamentDetails?.registeredUsers[i]?.descopeId === this.findedRoom?.teamTwo[0]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i].playedMatch + 1;
                        //         } else if (tournamentDetails?.registeredUsers[i]?.descopeId === this.findedRoom?.teamTwo[1]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i].playedMatch + 1;
                        //         } else if (tournamentDetails?.registeredUsers[i]?.descopeId === this.findedRoom?.teamOne[0]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = false;
                        //             tournamentDetails.registeredUsers[i].lost = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i].playedMatch + 1;
                        //         } else if (tournamentDetails?.registeredUsers[i]?.descopeId === this.findedRoom?.teamOne[1]?.UserId) {
                        //             tournamentDetails.registeredUsers[i].isWinner = false;
                        //             tournamentDetails.registeredUsers[i].lost = true;
                        //             tournamentDetails.registeredUsers[i].playedMatch = tournamentDetails?.registeredUsers[i]?.playedMatch + 1;
                        //         }
                        //     }
                        // }
                        tournamentDetails?.registeredUsers.forEach(user => {
                            if (!user.lost) {
                                const { teamOne, teamTwo } = this.findedRoom;
                                if (user.descopeId === teamOne[0]?.UserId || user?.descopeId === teamOne[1]?.UserId) {
                                    user.lost = true;
                                    user.isWinner = false;
                                    user.playedMatch = (user?.playedMatch || 0) + 1;
                                } else if (user.descopeId === teamTwo[0]?.UserId || user?.descopeId === teamTwo[1]?.UserId) {
                                    user.isWinner = true;
                                    user.playedMatch = (user?.playedMatch || 0) + 1;
                                }
                            }
                        });
                        let updatedFields = {
                            registeredUsers: tournamentDetails?.registeredUsers,
                            remainingMatches: tournamentDetails?.remainingMatches
                        };
                        const filteredTournamentUsers = tournamentDetails?.registeredUsers.filter(user => user?.isWinner);

                        if (filteredTournamentUsers.length === 2 && tournamentDetails?.remainingMatches === 0) {
                            // Add your logic here for when there are exactly 2 winners
                            let gameDetails;
                            if (this.findedRoom?.gameId) {
                                gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(this.findedRoom?.gameId) });
                                winningAmount = gameDetails?.TotalPrizeAmount
                                entryAmount = gameDetails?.entry
                            }
                            const deductionTime = new WalletTransactionService(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, winningAmount, gameDetails)
                            const updatedTeam = await deductionTime.addWinningprize(winningAmount, 'teamTwo', 'teamOne');
                            this.findedRoom.teamOne = updatedTeam?.teamOne;
                            this.findedRoom.teamTwo = updatedTeam?.teamTwo;
                            this.balanceDetails = updatedTeam?.balanceDetails;
                            updatedFields.status = 'complete';
                            updatedFields.isTournamentEnd = true;
                        }
                        await Tournament.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(this.findedRoom?.tournamentId) },
                            { $set: updatedFields }
                        );

                    }

                } else {

                    let gameDetails;
                    if (this.findedRoom?.gameId) {
                        gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(this.findedRoom?.gameId) });
                        winningAmount = gameDetails?.TotalPrizeAmount
                        entryAmount = gameDetails?.entry
                    }
                    const deductionTime = new WalletTransactionService(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, winningAmount, gameDetails)
                    const updatedTeam = await deductionTime.addWinningprize(winningAmount, 'teamTwo', 'teamOne');
                    this.findedRoom.teamOne = updatedTeam?.teamOne;
                    this.findedRoom.teamTwo = updatedTeam?.teamTwo;
                    this.balanceDetails = updatedTeam?.balanceDetails;

                }


                let RoundEndResult = {
                    isRoundWinner: isRoundWinner,
                    teamOnePoints: this.findedRoom?.teamOnePoints,
                    teamTwoPoints: this.findedRoom?.teamTwoPoints,
                    timerCount: 4
                }
                let GameEndResult = {
                    isRoundWinner: isRoundWinner,
                    winningAmount,
                    teamOnePoints: this.findedRoom?.teamOnePoints,
                    teamTwoPoints: this.findedRoom?.teamTwoPoints,
                    timerCount: 4,
                    entryAmount,
                    balanceDetails: this.balanceDetails
                }
                if (isRoundEnd) {
                    this.io.to(this.findedRoom?._id.toString()).emit('RoundEndResult', { roomData: RoundEndResult });
                    this.io.to(this.findedRoom?._id.toString()).emit('GameEndResult', { roomData: GameEndResult });
                    this.findedRoom.teamTwoPoints.trikPoint = 0;
                    this.findedRoom.teamOnePoints.trikPoint = 0;
                    // await delay(5000);
                }
                let trickEndResult = {
                    teamOnePoints: this.findedRoom?.teamOnePoints,
                    teamTwoPoints: this.findedRoom?.teamTwoPoints,
                    trickWinnerUserId: winner
                }
                this.io.to(this.findedRoom?._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });

                const room = this.io.sockets.adapter.rooms.get(this.findedRoom?._id.toString());

                if (room) {
                    // Iterate over each socket in the room
                    for (const socketId of room) {
                        const socket = this.io.sockets.sockets.get(socketId);
                        if (socket) {
                            // Disconnect the socket
                            socket.leave(this.findedRoom?._id.toString());
                            // socket.disconnect(true);
                        }
                    }
                }

                return { udpatedFindedRooom: this.findedRoom, lastTrickUpdate };
            }

            const { teamOne, teamTwo } = await createDealer(this.findedRoom?.teamOne, this.findedRoom?.teamTwo);

            await this.updatePlayerCards(teamOne, teamTwo, allTrue);

            this.findedRoom.isTrumpSelected = false;
            this.findedRoom.isPlayAloneSelected = false;
            this.findedRoom.isStarted = false;
            this.findedRoom.status = 'playing';

            let { dealerId, players } = await this.getPlayers(this.findedRoom);
            const timeOut = await getTimePlus30Seconds();
            let getUpdatedTurnPlayer = await checkIsTurn(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, 0, timeOut);
            this.findedRoom.teamOne = getUpdatedTurnPlayer?.teamOne;
            this.findedRoom.teamTwo = getUpdatedTurnPlayer?.teamTwo;
            userId = getUpdatedTurnPlayer?.userId
            isPlayingAlone = getUpdatedTurnPlayer?.isPlayingAlone
            let InitializeRound = {
                players,
                kitty: this.findedRoom?.totalCards,
                dealerId
            }
            let RoundEndResult = {
                isRoundWinner: isRoundWinner,
                teamOnePoints: this.findedRoom?.teamOnePoints,
                teamTwoPoints: this.findedRoom?.teamTwoPoints,
                timerCount: 4
            }

            let next = {
                nextTurnId: userId,
                isPlayingAlone: isPlayingAlone,
                timeOut, timerCount: 30,
                leadSuit: this.findedRoom?.playedCards.length > 0 && this.findedRoom?.playedCards[0]?.card ? this.findedRoom?.playedCards[0]?.card : '',
                trumpSuit: this.findedRoom.trumpSuit

            }
            const addedTimeOut = await addTimePlayersisTrumpShow(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, userId, timeOut)
            this.findedRoom.teamOne = addedTimeOut?.teamOne;
            this.findedRoom.teamTwo = addedTimeOut?.teamTwo;
            let NotifyTrumpSelectorPlayer = {
                userId: userId,
                trumpRound: 0,
                disabledSuite: '',
                timeOut,
                timerCount: 30
            }
            let trickEndResult = {
                teamOnePoints: this.findedRoom?.teamOnePoints,
                teamTwoPoints: this.findedRoom?.teamTwoPoints,
                trickWinnerUserId: winner
            }

            if (isRoundEnd) {
                await delay(1000);
                this.io.to(this.findedRoom?._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });
                this.io.to(this.findedRoom?._id.toString()).emit('RoundEndResult', { roomData: RoundEndResult });
                this.findedRoom.teamTwoPoints.trikPoint = 0;
                this.findedRoom.teamOnePoints.trikPoint = 0;
                await delay(5000);
                const isDelay = true;
                this.findedRoom = await updateBotRoleInMainData(this.findedRoom?._id.toString(), this.findedRoom, client, this.io, isDelay);
                this.io.to(this.findedRoom?._id.toString()).emit('InitializeRound', { roomData: InitializeRound });
                await delay(5000);
                this.io.to(this.findedRoom?._id.toString()).emit('NotifyTrumpSelectorPlayer', { roomData: NotifyTrumpSelectorPlayer });
                let updatedRoom = this.findedRoom;
                // let updatedRoom = await checkIsBotTrumpSelection(this.findedRoom, this.io, this.findedRoom?._id.toString());
                loadModule().then(async () => {
                    updatedRoom = await checkIsBotTrumpSelection.default(this.findedRoom, this.io, this.findedRoom?._id.toString())
                });
                await client.json.set(this.findedRoom?._id.toString(), '$', updatedRoom);
                // this.findedRoom = updatedRoom

                setTimeout(async () => {
                    await checkIsTrumpTimeOut(updatedRoom, this.io, this.findedRoom?._id.toString());

                }, 31000); // 40 seconds timer

            } else {
                this.io.to(this.findedRoom?._id.toString()).emit('NextTurn', { roomData: next });
                const addedTimeOut = await addTimePlayersIsTurn(this.findedRoom?.teamOne, this.findedRoom?.teamTwo, userId, timeOut)
                this.findedRoom.teamOne = addedTimeOut?.teamOne;
                this.findedRoom.teamTwo = addedTimeOut?.teamTwo;

                await client.json.set(this.findedRoom?._id.toString(), '$', this.findedRoom);
                loadModule().then(async () => {
                    this.findedRoom = await checkIsBotTurn.default(this.findedRoom, this.io, this.findedRoom?._id.toString())
                    this.findedRoom = await checkIsLastCardThrow.default(this.findedRoom, this.io, this.findedRoom?._id.toString(), userId)
                });
                await client.json.set(this.findedRoom?._id.toString(), '$', this.findedRoom);
                setTimeout(async () => {
                    await checkIsTimeOutTurn(this.findedRoom, this.io, this.findedRoom?._id.toString(), userId)
                }, 31000); // 40 seconds timer
            }

            const payloads = {
                roomId: this.findedRoom?._id,
                teamOne: this.findedRoom?.teamOne,
                teamTwo: this.findedRoom?.teamTwo,
            }

            const handCreated = await GameRound.create(payloads);
            if (handCreated) {

                this.findedRoom.handId = handCreated?._id
            }



        }
        let trickEndResult = {
            teamOnePoints: this.findedRoom?.teamOnePoints,
            teamTwoPoints: this.findedRoom?.teamTwoPoints,
            trickWinnerUserId: winner
        }


        let next = {
            nextTurnId: userId,
            isPlayingAlone: isPlayingAlone,
            timeOut, timerCount: 30,
            leadSuit: this.findedRoom?.playedCards.length > 0 && this.findedRoom?.playedCards[0]?.card ? this.findedRoom?.playedCards[0]?.card : '',
            trumpSuit: this.findedRoom.trumpSuit

        }
        //chec
        if (sendNextTurn) {
            await delay(1000);
            this.findedRoom.teamOne = teamOne;
            this.findedRoom.teamTwo = teamTwo;


            this.io.to(this.findedRoom?._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });
            this.io.to(this.findedRoom?._id.toString()).emit('NextTurn', { roomData: next });
            const addedTimeOut = await addTimePlayersIsTurn(this.findedRoom.teamOne, this.findedRoom.teamTwo, userId, timeOut)
            this.findedRoom.teamOne = addedTimeOut?.teamOne;
            this.findedRoom.teamTwo = addedTimeOut?.teamTwo;

            await client.json.set(this.findedRoom?._id.toString(), '$', this.findedRoom);
            loadModule().then(async () => {
                this.findedRoom = await checkIsBotTurn.default(this.findedRoom, this.io, this.findedRoom?._id.toString())
                this.findedRoom = await checkIsLastCardThrow.default(this.findedRoom, this.io, this.findedRoom?._id.toString(), userId)
            });
            await client.json.set(this.findedRoom?._id.toString(), '$', this.findedRoom);
            setTimeout(async () => {
                await checkIsTimeOutTurn(this.findedRoom, this.io, this.findedRoom?._id.toString(), userId)
            }, 31000); // 40 seconds timer
        }

        return { udpatedFindedRooom: this.findedRoom, lastTrickUpdate };
    }

    async getPlayers(findedRoom) {
        let dealerId = null;

        const playersPromises = findedRoom?.players.map(async (player) => {
            let matchedPlayer = null;
            const playerUserId = player?.UserId;
            findedRoom.teamOne.find((e, index) => {
                if (e?.isDealer) {
                    dealerId = e?.UserId;
                }
                if (e?.UserId === playerUserId) {
                    matchedPlayer = { ...e, indexInTeam: index, team: 'teamOne' };
                    return true;
                }
                return false;
            });

            if (!matchedPlayer || matchedPlayer == null) {
                findedRoom.teamTwo.find((e, index) => {
                    if (e?.isDealer) {
                        dealerId = e?.UserId;
                    }
                    if (e?.UserId === playerUserId) {
                        matchedPlayer = { ...e, indexInTeam: index, team: 'teamTwo' };
                        return true;
                    }
                    return false;
                });
            }

            return matchedPlayer || null;
        });

        const playersResults = await Promise.all(playersPromises);

        const filteredPlayers = playersResults.filter((player) => player !== null);

        // Return both the dealerId and the filtered players
        return {
            dealerId,
            players: filteredPlayers
        };
    }


    async updatePlayerCards(one, two, allTrue) {
        const shufflecards = new shuffleCards();
        const dealtCards = await shufflecards.dealCards();
        const updatedteamOne = await Promise.all(one.map(async (p, index) => {
            if ((!p?.cards || p?.cards.length === 0) || allTrue) {
                const indexNumber = `player${index + 1}`
                const card = dealtCards.players[indexNumber];
                return { ...p, cards: card, isPlayAlone: false, isPartnerPlayingAlone: false };
            }
            return p;
        }));
        const updatedteamTwo = await Promise.all(two.map(async (p, index) => {
            if ((!p?.cards || p?.cards.length === 0) || allTrue) {
                const indexNumber = `player${(2 + index) + 1}`
                const card = dealtCards?.players[indexNumber];
                return { ...p, cards: card, isPlayAlone: false, isPartnerPlayingAlone: false };
            }
            return p;
        }));

        this.findedRoom.totalCards = dealtCards?.trumpSelectionCards;
        this.findedRoom.teamOne = updatedteamOne;
        this.findedRoom.teamTwo = updatedteamTwo;
    }
}

module.exports = { GameManager };
