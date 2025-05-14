const Wallet = require('../../wallet/wallet.model');
const { default: mongoose } = require('mongoose');
const Tournament = require('../tournament.model');
const Users = require('../../user/user.model');
const GameDetails = require('../../games/games.model');
const Transaction = require('../../transactions/transaction.model');

const joinTournament = async ({ body, user }) => {
    try {
        const { id: tournamentId } = body;
        const userId = user.token.UserId
        // console.log(userId)

        if (!tournamentId || !userId) {
            return { msg: "Invalid request: missing required fields.", status: false, code: 400 };
        }

        const tournamentObjectId = new mongoose.Types.ObjectId(tournamentId);

        // Check if the user exists
        const findUser = await Users.findOne({ descopeId: userId });
        if (!findUser) {
            return { msg: "User not found.", status: false, code: 404 };
        }

        // Check if the tournament exists
        const findTournament = await Tournament.findOne({ _id: tournamentObjectId, status: "finding" });
        if (!findTournament) {
            return { msg: "Tournament not found.", status: false, code: 404 };
        }

        // Check if the game exists
        const findGame = await GameDetails.findById(findTournament.gameId);
        if (!findGame) {
            return { msg: "Game details not found for the tournament.", status: false, code: 404 };
        }

        // Check if the user is already registered
        const isAlreadyRegistered = findTournament.registeredUsers.some(user => user.descopeId === userId);
        if (isAlreadyRegistered) {
            return { msg: "User is already registered in the tournament.", status: false, code: 400 };
        }
        findTournament.countOfRegisteredUsers = findTournament?.registeredUsers.length;

        if (findTournament?.countOfRegisteredUsers >= findTournament?.limitOfPlayers) {
            return { msg: "This Tournament Is Full You cant register here.", status: false, code: 400 };
        }

        // Create player object
        const player = {
            userName: findUser?.userName,
            userId: findUser._id,
            descopeId: userId,
            isWinner: false,
            playedMatch: 0,
            joinedDate: new Date().toISOString(),
            lost: false,
            paid: true,
            status: 'pending'
        };

        // Update the registeredUsers array
        findTournament.registeredUsers.push(player);
        findTournament.countOfRegisteredUsers = findTournament?.registeredUsers.length;

        // Calculate totalTeams and totalMatches if enough players have joined
        if (findTournament.countOfRegisteredUsers >= 4) {
            findTournament.totalTeams = Math.floor(findTournament?.countOfRegisteredUsers / 2);
            findTournament.totalMatches = findTournament?.totalTeams - 1;
            findTournament.remainingMatches = findTournament?.totalMatches;
        }

        const adminWallet = await Wallet.findOne({ WalletType: "admin" }).sort({ createdAt: 1 });
        const userWallet = await Wallet.findOne({ userId: findUser._id, descopeId: userId });

        if (!userWallet) {
            return { msg: "User wallet not found.", status: false, code: 404 };
        }

        if (!adminWallet) {
            return { msg: "Admin wallet not found.", status: false, code: 500 };
        }

        if (userWallet.balance < findGame.entry) {
            return { msg: "Insufficient balance in user's wallet.", status: false, code: 400 };
        }

        // Update user's wallet balance
        userWallet.balance -= findGame.entry;
        await userWallet.save();

        // Log the transaction for the user
        await Transaction.create({
            userId: findUser._id,
            transactionBalance: findGame.entry,
            transactionStatus: 'paid',
            transactionType: 'Tournament Join',
            Description: `User (${findUser.userName}) has paid ${findGame.entry} for Tournament ${findTournament?.tournamentName}.`,
            gameLevel: 'beginner'
        });

        // Update admin's wallet balance
        adminWallet.balance += findGame.entry;
        await adminWallet.save();

        findUser.registeredTournaments = findUser?.registeredTournaments + 1

        // Log the transaction for the admin
        await Transaction.create({
            userId: adminWallet.userId,
            transactionBalance: findGame.entry,
            transactionStatus: 'received',
            transactionType: 'Tournament Join',
            Description: `User (${findUser.userName}) has paid ${findGame.entry} for Tournament ${findTournament?.tournamentName}.`,
            gameLevel: 'beginner'
        });

        // Save the updated tournament
        const updatedTournament = await findTournament.save();
        const updatedUser = await findUser.save();

        if (updatedTournament && updatedUser) {
            return { msg: "User joined the tournament.", status: true, code: 200, data: null };
        }

    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = joinTournament;
