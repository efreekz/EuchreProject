const GameDetails = require("../modules/games/games.model");
const Tournament = require("../modules/tournament/tournament.model");

class TournamentSocketHandler {
    constructor(io, socket, onlineUsersByTournamentId) {
        this.io = io;
        this.socket = socket;
        this.onlineUsersByTournamentId = onlineUsersByTournamentId;

        this.initListeners();
    }

    initListeners() {
        this.socket.on('connectTournament', this.connectTournament.bind(this));
    }

    removeTournament(tournamentId) {
        if (this.onlineUsersByTournamentId[tournamentId]) {
            delete this.onlineUsersByTournamentId[tournamentId];
        }
    }
    async connectTournament(e) {
        try {
            let data = e;
            if (typeof e === 'string') {
                data = JSON.parse(e);
            }

            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            const tournamentId = data?.tournamentId;
            const userId = data?.userId;

            // Manage online users for the tournament
            this.onlineUsersByTournamentId[tournamentId] = this.onlineUsersByTournamentId[tournamentId] || [];

            if (!this.onlineUsersByTournamentId[tournamentId].includes(userId)) {
                this.onlineUsersByTournamentId[tournamentId].push(userId);
            };


            console.log('onlineUsersByTournamentId', this.onlineUsersByTournamentId);

            this.socket.join(`${tournamentId}Tournament`);
            this.socket.data.tournamentId = tournamentId;
            this.socket.data.UserId = userId;

            // Fetch tournament and game details
            const tournamentDetails = await Tournament.findById(tournamentId);

            if (tournamentDetails && tournamentDetails?.isTournamentEnd) {
                this.removeTournament(tournamentId);
            }

            if (tournamentDetails && tournamentDetails?.gameId) {
                const gameDetails = await GameDetails.findById(tournamentDetails?.gameId);

                const tournamentData = {
                    registeredUsers: tournamentDetails?.countOfPlayingUsers,
                    onlineUsers: this.onlineUsersByTournamentId[tournamentId].length,
                    name: tournamentDetails?.tournamentName,
                    prize: gameDetails?.TotalPrizeAmount,
                    entry: gameDetails?.entry,
                    remainingMatches: tournamentDetails?.remainingMatches,
                    totalMatches: tournamentDetails?.totalMatches,
                    startDateAndTime: tournamentDetails?.startDateAndTime,
                    matchesOver: tournamentDetails?.totalMatches - tournamentDetails?.remainingMatches,
                };

                this.io.to(`${tournamentId}Tournament`).emit('tournamentData', { tournamentData });
            }
        } catch (error) {
            console.log('in connectTournament', error);
        }
    }
    async disconnectTournament(tournamentId, userId) {
        try {
            if (tournamentId) {
                // Remove the user from the online users list
                this.onlineUsersByTournamentId[tournamentId] = this.onlineUsersByTournamentId[tournamentId] || [];
                this.onlineUsersByTournamentId[tournamentId] = this.onlineUsersByTournamentId[tournamentId].filter(id => id !== userId);

                console.log('onlineUsersByTournamentId', this.onlineUsersByTournamentId);

                // Fetch tournament and game details
                const tournamentDetails = await Tournament.findById(tournamentId);

                if (tournamentDetails && tournamentDetails?.gameId) {
                    const gameDetails = await GameDetails.findById(tournamentDetails?.gameId);

                    const tournamentData = {
                        registeredUsers: tournamentDetails?.countOfPlayingUsers,
                        onlineUsers: this.onlineUsersByTournamentId[tournamentId].length,
                        name: tournamentDetails?.tournamentName,
                        prize: gameDetails?.TotalPrizeAmount,
                        entry: gameDetails?.entry,
                        remainingMatches: tournamentDetails?.remainingMatches,
                        totalMatches: tournamentDetails?.totalMatches,
                        startDateAndTime: tournamentDetails?.startDateAndTime,
                        matchesOver: tournamentDetails?.totalMatches - tournamentDetails?.remainingMatches,
                    };
                    this.io.to(`${tournamentId}Tournament`).emit('tournamentData', { tournamentData });
                }
            }
        } catch (error) {
            console.log('in disconnectTournament', error);
        }
    }
}

module.exports = TournamentSocketHandler;
