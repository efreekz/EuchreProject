// const mongoose = require('mongoose');
// const Tournament = require('../modules/tournament/tournament.model');
// const Notification = require('../modules/notifications/notification.model');
// const moment = require('moment-timezone');
// const Wallet = require('../modules/wallet/wallet.model');
// const GameDetails = require('../modules/games/games.model');
// const Transaction = require('../modules/transactions/transaction.model');

// const checkTournamentStarted = async () => {
//     console.log('Checking if tournament has started...');

//     // Get the current time in New York timezone
//     const nowNY = moment.tz('America/New_York');
//     const currentDateAndTimeNY = nowNY.toDate();

//     console.log('Current Date and Time:', currentDateAndTimeNY.toLocaleString());

//     // Query to check if the tournament's startDateAndTime and startTime are in the past
//     const query = {
//         status: "finding", // Only looking for tournaments in "finding" status
//         startDateAndTime: { $lte: currentDateAndTimeNY }, // Tournament start date and time is in the past
//     };

//     try {
//         // Fetch tournaments that have started
//         const tournaments = await Tournament.aggregate([
//             { $match: query },
//             { $sort: { startDateAndTime: 1, startTime: 1 } },
//             {
//                 $project: {
//                     _id: 1,
//                     startDateAndTime: 1,
//                     tournamentName: 1,
//                     gameId: 1,
//                     registeredUsers: 1,
//                     countOfRegisteredUsers: 1,
//                     totalMatches: 1,
//                     remainingMatches: 1,
//                     startTime: 1,
//                     status: 1
//                 }
//             }
//         ]);

//         console.log('Tournaments that should have started:', tournaments);

//         for (let tournament of tournaments) {
//             const totalRegistered = tournament.registeredUsers.length;

//             // Initialize arrays to manage groups and excess users
//             const groupsOfFour = [];
//             const excessUsers = [];

//             // Group users into sets of 4
//             for (let i = 0; i < totalRegistered; i += 4) {
//                 const group = tournament.registeredUsers.slice(i, i + 4);
//                 if (group.length === 4) {
//                     groupsOfFour.push(...group); // Add full groups of 4
//                 } else {
//                     excessUsers.push(...group); // Add remaining players to excess
//                 }
//             }

//             // Handle excess users (refund them)
//             for (let user of excessUsers) {
//                 if (!user.isSended) {
//                     const findGame = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(tournament.gameId) });
//                     const adminWallet = await Wallet.findOne({ WalletType: "admin" }).sort({ createdAt: 1 });
//                     const userWallet = await Wallet.findOne({ userId: user.userId });

//                     // Update user's wallet balance (refund)
//                     userWallet.balance += findGame.entry;
//                     await userWallet.save();

//                     // Create transaction for the user
//                     await Transaction.create({
//                         userId: user.userId,
//                         transactionBalance: findGame.entry,
//                         transactionStatus: 'refunded',
//                         transactionType: 'tournament full',
//                         Description: `User ${user.userName} has been refunded ${findGame.entry} for the tournament "${tournament.tournamentName}". This refund is issued because the tournament has reached its full capacity and the user could not participate.`,
//                         gameLevel: 'beginner'
//                     });

//                     // Update admin's wallet balance
//                     adminWallet.balance -= findGame.entry;
//                     await adminWallet.save();

//                     // Create transaction for the admin
//                     await Transaction.create({
//                         userId: adminWallet.userId,
//                         transactionBalance: findGame.entry,
//                         transactionStatus: 'refunded',
//                         transactionType: 'tournament full',
//                         Description: `Refund of ${findGame.entry} issued to user ${user.userName} for the tournament "${tournament.tournamentName}" because the tournament is full.`,
//                         gameLevel: 'beginner'
//                     });

//                     // Send notification to the user
//                     await Notification.create({
//                         userId: new mongoose.Types.ObjectId(user.userId),
//                         message: `Hello ${user.userName},\nWe regret to inform you that the tournament "${tournament.tournamentName}" you registered for has reached its full capacity, and you were unable to participate. As a result, a refund of ${findGame.entry} has been processed to your account.\nWe apologize for the inconvenience and hope to see you in future tournaments. Best of luck!`,
//                         type: 'info',
//                         isTournament: true,
//                         tournamentId: tournament._id
//                     });

//                     // Mark the notification as sent
//                     user.isSended = true;
//                 }
//             }

//             // Notify users in valid groups of 4
//             for (let user of groupsOfFour) {
//                 if (!user.isSended) {
//                     await Notification.create({
//                         userId: new mongoose.Types.ObjectId(user.userId),
//                         message: `Hello ${user.userName},\nThe tournament "${tournament.tournamentName}" you registered for has just started! Please join within the next 20 minutes to participate and enjoy the competition.\nBest of luck and have fun!`,
//                         type: 'info',
//                         isTournament: true,
//                         tournamentId: tournament._id
//                     });

//                     // Mark the notification as sent
//                     user.isSended = true;
//                 }
//             }

//             // Update the tournament status and include only valid users (those in complete groups)
//             const validUsers = groupsOfFour.flat(); // Flatten the array of groups
//             await Tournament.updateOne(
//                 { _id: tournament._id },
//                 { $set: { registeredUsers: validUsers, status: "playing", countOfRemovedUsers: excessUsers.length, countOfPlayingUsers: validUsers.length } }
//             );


//         }

//         return {
//             msg: "Tournaments checked successfully",
//             data: tournaments,
//             status: true,
//             code: 200,
//         };
//     } catch (error) {
//         console.error("Error retrieving tournaments:", error);
//         return {
//             msg: "Something went wrong, please try again.",
//             status: false,
//             code: 500,
//         };
//     }
// };

// module.exports = checkTournamentStarted;



const mongoose = require('mongoose');
const Tournament = require('../modules/tournament/tournament.model');
const Notification = require('../modules/notifications/notification.model');
const moment = require('moment');
const Wallet = require('../modules/wallet/wallet.model');
const GameDetails = require('../modules/games/games.model');
const Transaction = require('../modules/transactions/transaction.model');
const User = require('../modules/user/user.model');

const checkTournamentStarted = async () => {

    // Get the current date and time in system's local timezone
    const currentDateAndTimeLocal = new Date();


    // Query to check if the tournament's startDateAndTime and startTime are in the past
    const query = {
        status: "finding", // Only looking for tournaments in "finding" status
        startDateAndTime: { $lte: currentDateAndTimeLocal }, // Tournament start date and time is in the past
    };

    try {
        // Fetch tournaments that have started
        const tournament = await Tournament.find({ status: "finding" });
        // tournaments = await Tournament.aggregate([
        //     { $match: query },
        //     { $sort: { startDateAndTime: 1, startTime: 1 } },
        //     {
        //         $project: {
        //             _id: 1,
        //             startDateAndTime: 1,
        //             tournamentName: 1,
        //             gameId: 1,
        //             registeredUsers: 1,
        //             countOfRegisteredUsers: 1,
        //             totalMatches: 1,
        //             remainingMatches: 1,
        //             startTime: 1,
        //             status: 1
        //         }
        //     }
        // ]);
        const tournaments = await tournament.filter(tournament => {
            const tournamentStartTime = new Date(tournament?.startDateAndTime);

            return tournament?.startDateAndTime <= currentDateAndTimeLocal;
        });

        for (let tournament of tournaments) {
            const totalRegistered = tournament?.registeredUsers.length;

            // Initialize arrays to manage groups and excess users
            const groupsOfFour = [];
            const excessUsers = [];

            // Group users into sets of 4
            for (let i = 0; i < totalRegistered; i += 4) {
                const group = tournament?.registeredUsers.slice(i, i + 4);
                if (group.length === 4) {
                    groupsOfFour.push(...group); // Add full groups of 4
                } else {
                    excessUsers.push(...group); // Add remaining players to excess
                }
            }

            // Handle excess users (refund them)
            for (let user of excessUsers) {
                if (!user.isSended) {
                    const findUser = await User.findOne({ _id: new mongoose.Types.ObjectId(user?.userId) });
                    const findGame = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(tournament?.gameId) });
                    const adminWallet = await Wallet.findOne({ WalletType: "admin" }).sort({ createdAt: 1 });
                    const userWallet = await Wallet.findOne({ userId: user?.userId });

                    // Update user's wallet balance (refund)
                    userWallet.balance += findGame.entry;
                    await userWallet.save();

                    // Create transaction for the user
                    await Transaction.create({
                        userId: user.userId,
                        transactionBalance: findGame?.entry,
                        transactionStatus: 'refunded',
                        transactionType: 'tournament full',
                        Description: `User ${user?.userName} has been refunded ${findGame?.entry} for the tournament "${tournament?.tournamentName}". This refund is issued because the tournament has reached its full capacity and the user could not participate.`,
                        gameLevel: 'beginner'
                    });

                    // Update admin's wallet balance
                    adminWallet.balance -= findGame.entry;
                    findUser.registeredTournaments = findUser?.registeredTournaments - 1;

                    await adminWallet.save();
                    await findUser.save();

                    // Create transaction for the admin
                    await Transaction.create({
                        userId: adminWallet?.userId,
                        transactionBalance: findGame?.entry,
                        transactionStatus: 'refunded',
                        transactionType: 'tournament full',
                        Description: `Refund of ${findGame?.entry} issued to user ${user?.userName} for the tournament "${tournament?.tournamentName}" because the tournament is full.`,
                        gameLevel: 'beginner'
                    });

                    // Send notification to the user
                    await Notification.create({
                        userId: new mongoose.Types.ObjectId(user?.userId),
                        message: `Hello ${user?.userName},\nWe regret to inform you that the tournament "${tournament?.tournamentName}" you registered for has reached its full capacity, and you were unable to participate. As a result, a refund of ${findGame?.entry} has been processed to your account.\nWe apologize for the inconvenience and hope to see you in future tournaments. Best of luck!`,
                        type: 'info',
                        isTournament: true,
                        tournamentId: tournament?._id
                    });

                    // Mark the notification as sent
                    user.isSended = true;
                }
            }

            // Notify users in valid groups of 4
            for (let user of groupsOfFour) {
                if (!user.isSended) {
                    await Notification.create({
                        userId: new mongoose.Types.ObjectId(user?.userId),
                        message: `Hello ${user?.userName},\nThe tournament "${tournament?.tournamentName}" you registered for has just started! Please join within the next 20 minutes to participate and enjoy the competition.\nBest of luck and have fun!`,
                        type: 'info',
                        isTournament: true,
                        tournamentId: tournament?._id
                    });

                    // Mark the notification as sent
                    user.isSended = true;
                }
            }

            // Update the tournament status and include only valid users (those in complete groups)
            const validUsers = groupsOfFour.flat(); // Flatten the array of groups
            await Tournament.updateOne(
                { _id: tournament?._id },
                { $set: { registeredUsers: validUsers, status: validUsers.length < 4 ? "canceled" : "playing", countOfRemovedUsers: excessUsers.length, countOfPlayingUsers: validUsers.length } }
            );
        }

        return {
            msg: "Tournaments checked successfully",
            data: tournaments,
            status: true,
            code: 200,
        };
    } catch (error) {
        console.error("Error retrieving tournaments:", error);
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 500,
        };
    }
};

module.exports = checkTournamentStarted;
