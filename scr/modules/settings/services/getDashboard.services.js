const GameDetails = require('../../games/games.model');
const PlayingRoom = require('../../playingroom/playingRoom.model');
const Tournament = require('../../tournament/tournament.model');
const User = require('../../user/user.model');
const Settings = require('../settings.model');
const { default: mongoose } = require('mongoose');

const getDashboard = async () => {
    try {
        // Fetch total users with isEmailVerified true and false
        const [verifiedUsers, unverifiedUsers] = await Promise.all([
            User.countDocuments({ isEmailVerified: true }),
            User.countDocuments({ isEmailVerified: false })
        ]);

        // Fetch total games
        const totalGames = await GameDetails.countDocuments();
        
        const tournaments = await Tournament.countDocuments();
        const tournamentsActive = await Tournament.countDocuments({status: 'playing' });
        // Fetch total playing rooms by roomType and status
        const [publicRooms, tournamentRooms, privateRooms, findingPublicRooms, findingTournamentRooms, findingPrivateRooms] = await Promise.all([
            PlayingRoom.countDocuments({ roomType: 'public', status: 'playing' }),
            PlayingRoom.countDocuments({ roomType: 'tournament', status: 'playing' }),
            PlayingRoom.countDocuments({ roomType: 'private', status: 'playing' }),
            PlayingRoom.countDocuments({ roomType: 'public', status: 'finding' }),
            PlayingRoom.countDocuments({ roomType: 'tournament', status: 'finding' }),
            PlayingRoom.countDocuments({ roomType: 'private', status: 'finding' }),

        ]);

        const dashboardData = {
            totalUsers: {
                verified: verifiedUsers,
                unverified: unverifiedUsers
            },
            totalGames,
            tournaments,
            tournamentsActive,
            playingRooms: {
                public: publicRooms,
                tournament: tournamentRooms,
                private: privateRooms,
                findingPublic: findingPublicRooms,
                findingTournament: findingTournamentRooms,
                findingPrivate: findingPrivateRooms,
            }
        };

        return { msg: "Dashboard data retrieved successfully.", status: true, code: 200, data: dashboardData };

    } catch (error) {
        console.error('Error in getDashboard:', error);
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getDashboard;
