// const { default: mongoose } = require("mongoose");
// const Transaction = require("../modules/transactions/transaction.model");
// const Wallet = require("../modules/wallet/wallet.model");
// const User = require("../modules/user/user.model");

// const deduction = async (teamOne, teamTwo, deductionAmount) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             // Update socketId in teamOne if userId matches
//             for (let i = 0; i < teamOne.length; i++) {
//                 if ((!teamOne[i].paidAmount && !teamOne[i].paid) && teamOne[i].role === 'user') {
//                     let descopeId = teamOne[i].UserId;
//                     const findedUser = await User.findOne({ descopeId });

//                     let fendedWallet = await Wallet.findOne({ descopeId, userId: new mongoose.Types.ObjectId(findedUser._id) });
//                     if (fendedWallet, findedUser) {
//                         let updatedBalance = fendedWallet.balance - deductionAmount

//                         let updatedWallet = await Wallet.findOneAndUpdate(
//                             { descopeId },
//                             { balance: updatedBalance },
//                             { new: true }
//                         );
//                         if (updatedWallet) {
//                             let transactionCreated = await Transaction.create({
//                                 userId: new mongoose.Types.ObjectId(findedUser._id),
//                                 transactionBalance: deductionAmount,
//                                 transactionStatus: 'paid',
//                                 transactionType: 'game play',
//                                 gameLevel: 'beginner'
//                             })
//                             if (transactionCreated) {
//                                 teamOne[i].paid = true;
//                                 teamOne[i].paidAmount = deductionAmount;
//                             }
//                         }
//                     }
//                 }
//             }

//             // Update socketId in teamTwo if userId matches
//             for (let i = 0; i < teamTwo.length; i++) {
//                 if ((!teamTwo[i].paidAmount && !teamTwo[i].paid) && teamTwo[i].role === 'user') {

//                     let descopeId = teamTwo[i].UserId;
//                     const findedUser = await User.findOne({ descopeId });

//                     let fendedWallet = await Wallet.findOne({ descopeId, userId: new mongoose.Types.ObjectId(findedUser._id) });
//                     if (fendedWallet, findedUser) {
//                         let updatedBalance = fendedWallet.balance - deductionAmount

//                         let updatedWallet = await Wallet.findOneAndUpdate(
//                             { descopeId },
//                             { balance: updatedBalance },
//                             { new: true }
//                         );
//                         if (updatedWallet) {
//                             let transactionCreated = await Transaction.create({
//                                 userId: new mongoose.Types.ObjectId(findedUser._id),
//                                 transactionBalance: deductionAmount,
//                                 transactionStatus: 'paid',
//                                 transactionType: 'game play',
//                                 gameLevel: 'beginner'
//                             })

//                             if (transactionCreated) {
//                                 teamTwo[i].paid = true;
//                                 teamTwo[i].paidAmount = deductionAmount;
//                             }
//                         }
//                     }

//                 }
//             }

//             // Resolve the promise with the updated teams
//             resolve({ teamOne, teamTwo });
//         } catch (error) {
//             // Reject the promise if there is an error
//             reject(error);
//         }
//     });
// };
// const addWiningprize = async (teamOne, teamTwo, winningprize) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             // Update socketId in teamOne if userId matches
//             for (let i = 0; i < teamOne.length; i++) {
//                 if ((teamOne[i].paidAmount && teamOne[i].paid) && teamOne[i].role === 'user') {
//                     let descopeId = teamOne[i].UserId;
//                     const findedUser = await User.findOne({ descopeId });

//                     let fendedWallet = await Wallet.findOne({ descopeId, userId: new mongoose.Types.ObjectId(findedUser._id) });
//                     if (fendedWallet, findedUser) {
//                         let updatedBalance = fendedWallet.balance + winningprize

//                         let updatedWallet = await Wallet.findOneAndUpdate(
//                             { descopeId },
//                             { balance: updatedBalance },
//                             { new: true }
//                         );
//                         if (updatedWallet) {
//                             let transactionCreated = await Transaction.create({
//                                 userId: new mongoose.Types.ObjectId(findedUser._id),
//                                 transactionBalance: winningprize,
//                                 transactionStatus: 'received',
//                                 transactionType: 'winning prize',
//                                 gameLevel: 'beginner'
//                             })
//                             if (transactionCreated) {
//                                 teamOne[i].winningprize = winningprize;
//                             }
//                         }
//                     }
//                 }
//             }

//             // Update socketId in teamTwo if userId matches
//             for (let i = 0; i < teamTwo.length; i++) {
//                 if ((teamTwo[i].paidAmount && teamTwo[i].paid) && teamTwo[i].role === 'user') {

//                     let descopeId = teamTwo[i].UserId;
//                     const findedUser = await User.findOne({ descopeId });

//                     let fendedWallet = await Wallet.findOne({ descopeId, userId: new mongoose.Types.ObjectId(findedUser._id) });
//                     if (fendedWallet, findedUser) {
//                         let updatedBalance = fendedWallet.balance + winningprize

//                         let updatedWallet = await Wallet.findOneAndUpdate(
//                             { descopeId },
//                             { balance: updatedBalance },
//                             { new: true }
//                         );
//                         if (updatedWallet) {
//                             let transactionCreated = await Transaction.create({
//                                 userId: new mongoose.Types.ObjectId(findedUser._id),
//                                 transactionBalance: winningprize,
//                                 transactionStatus: 'received',
//                                 transactionType: 'winning prize',
//                                 gameLevel: 'beginner'
//                             })

//                             if (transactionCreated) {
//                                 teamTwo[i].winningprize = winningprize;
//                             }
//                         }
//                     }

//                 }
//             }

//             // Resolve the promise with the updated teams
//             resolve({ teamOne, teamTwo });
//         } catch (error) {
//             // Reject the promise if there is an error
//             reject(error);
//         }
//     });
// };

// module.exports = { deduction, addWiningprize };



const mongoose = require("mongoose");
const Transaction = require("../modules/transactions/transaction.model");
const Wallet = require("../modules/wallet/wallet.model");
const User = require("../modules/user/user.model");

class WalletTransactionService {
    constructor(teamOne, teamTwo, amount, gameDetails) {
        this.teamOne = teamOne;
        this.teamTwo = teamTwo;
        this.amount = amount;
        this.gameDetails = gameDetails;
        this.balanceDetails = []
    }

    // Deduction method
    async deduction() {
        try {
            // Deduct from teamOne
            await this.processDeduction(this.teamOne, this.amount, 'deduct');
            // Deduct from teamTwo
            await this.processDeduction(this.teamTwo, this.amount, 'deduct');
            return { teamOne: this.teamOne, teamTwo: this.teamTwo };
        } catch (error) {
            throw new Error(`Deduction Error: ${error.message}`);
        }
    }

    // Add Winning prize method
    async addWinningprize(winningprize, winnerTeam, loserTeam) {
        try {
            if (winnerTeam === 'teamOne') {
                await this.processDeduction(this.teamOne, winningprize, 'add');
                // Add winningprize to teamTwo
                await this.processDeduction(this.teamTwo, winningprize, 'deduct', true);
            } else if (winnerTeam === 'teamTwo') {
                await this.processDeduction(this.teamOne, winningprize, 'deduct', true);
                // Add winningprize to teamTwo
                await this.processDeduction(this.teamTwo, winningprize, 'add');
            }
            // Add winningprize to teamOne
            return { teamOne: this.teamOne, teamTwo: this.teamTwo, balanceDetails: this.balanceDetails };
        } catch (error) {
            throw new Error(`Add Winning prize Error: ${error.message}`);
        }
    }

    // Common function for processing deduction or addition
    async processDeduction(team, amount, type, isdeduction) {
        console.log('team', team)
        const levelThresholds = [0, 300, 600, 1000, 1300, 1800, 2100, 2700];
        const earnedXp = this.gameDetails?.winnerXp
        for (let i = 0; i < team.length; i++) {
            if (
                (type === 'deduct' && !team[i]?.paidAmount && !team[i]?.paid && team[i]?.role === 'user') ||
                (type === 'add' && team[i]?.paidAmount && team[i]?.paid && team[i]?.role === 'user')
            ) {
                const descopeId = team[i]?.UserId;
                const user = await User.findOne({ descopeId });
                if (!user) continue;

                if (user && type === 'add') {
                    let updatedEx = Number(user?.XP) + Number(earnedXp);
                    let newLevel = user?.level
                    // for (let i = 0; i < levelThresholds.length; i++) {
                    //     if (updatedEx <= levelThresholds[i]) {
                    //         newLevel = i;
                    await User.findOneAndUpdate(
                        { descopeId },
                        { XP: updatedEx, level: newLevel, Won: user?.Won ? Number(user?.Won + 1) : 1 },
                        { new: true }
                    );

                    // break
                    // }
                    // }
                }
                else if (user && (type === 'deduct' && isdeduction)) {
                    let updatedEx = (Number(user?.XP) + this.gameDetails?.loserXp);
                    let newLevel = user?.level
                    // for (let i = 0; i < levelThresholds.length; i++) {
                    //     if (updatedEx <= levelThresholds[i]) {
                    //         newLevel = i;
                    await User.findOneAndUpdate(
                        { descopeId },
                        { XP: updatedEx, level: newLevel, Lost: user?.Lost ? Number(user?.Lost + 1) : 1 },
                        { new: true }
                    );

                    //         break
                    //     }
                    // }
                }

                const wallet = await Wallet.findOne({ descopeId, userId: new mongoose.Types.ObjectId(user?._id) });
                if (!wallet) continue;

                const updatedBalance = type === 'deduct' ? Number(wallet?.balance) - Number(amount) : Number(wallet?.balance) + Number(amount);
                const updatedWallet = await Wallet.findOneAndUpdate(
                    { descopeId },
                    { balance: updatedBalance },
                    { new: true }
                );
                const balanceDetails = {
                    UserId: descopeId,
                    prize: type === 'deduct' && isdeduction ? 0 : amount || 0,
                    balance: updatedBalance
                }
                console.log('balanceDetails', balanceDetails)
                this.balanceDetails.push(balanceDetails);




                if (updatedWallet) {
                    const description = type === 'deduct'
                        ? `User (${user?.userName}) has paid ${amount} for game play.`
                        : `User (${user?.userName}) has won the game and the winning prize is ${amount}.`;
                    const transactionCreated = await Transaction.create({
                        userId: new mongoose.Types.ObjectId(user._id),
                        transactionBalance: amount,
                        transactionStatus: type === 'deduct' ? 'paid' : 'received',
                        transactionType: type === 'deduct' ? 'game play' : 'winning prize',
                        gameLevel: 'beginner',
                        Description: description
                    });

                    if (transactionCreated) {
                        if (type === 'deduct') {
                            team[i].paid = true;
                            team[i].paidAmount = amount;
                        } else {
                            team[i].winningprize = amount;
                        }
                    }
                    if (type === 'deduct') {
                        const wallet = await Wallet.findOne({ WalletType: "admin" }).sort({ createdAt: 1 });
                        if (!wallet) continue;

                        const updatedBalance = type === 'deduct' ? Number(wallet?.balance) + Number(amount) : Number(wallet?.balance) + Number(amount);
                        const updatedWallet = await Wallet.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(wallet?._id), WalletType: "admin" },
                            { balance: updatedBalance },
                            { new: true }
                        );
                        if (updatedWallet) {
                            const transactionCreated = await Transaction.create({
                                userId: new mongoose.Types.ObjectId(wallet?.userId),
                                transactionBalance: amount,
                                transactionStatus: type === 'deduct' ? 'received' : 'received',
                                transactionType: type === 'deduct' ? 'game play' : 'winning prize',
                                Description: `User (${user?.userName}) has paid ${amount} for game play.`,
                                gameLevel: 'beginner'
                            });

                            if (transactionCreated) {
                                if (type === 'deduct') {
                                    team[i].paid = true;
                                    team[i].paidAmount = amount;
                                } else {
                                    team[i].winningprize = amount;
                                }
                            }
                        }
                    } else if (type === 'add') {
                        const wallet = await Wallet.findOne({ WalletType: "admin" }).sort({ createdAt: 1 });
                        if (!wallet) continue;

                        const updatedBalance = type === 'deduct' ? Number(wallet?.balance) + Number(amount) : Number(wallet?.balance) - Number(amount);
                        const updatedWallet = await Wallet.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(wallet?._id), WalletType: "admin" },
                            { balance: updatedBalance },
                            { new: true }
                        );
                        if (updatedWallet) {
                            const transactionCreated = await Transaction.create({
                                userId: new mongoose.Types.ObjectId(wallet?.userId),
                                transactionBalance: amount,
                                transactionStatus: type === 'deduct' ? 'received' : 'paid',
                                transactionType: type === 'deduct' ? 'game play' : 'winning prize',
                                Description: `User (${team[i]?.userName}) has won the game and the winning prize is ${amount}.`,
                                gameLevel: 'beginner'
                            });

                            if (transactionCreated) {
                                if (type === 'deduct') {
                                    team[i].paid = true;
                                    team[i].paidAmount = amount;
                                } else {
                                    team[i].winningprize = amount;
                                }
                            }
                        }
                    }


                }
            } else if (
                (type === 'deduct' && team[i].paidAmount && team[i].paid )
                ||
                (type === 'add' && team[i]?.paidAmount) && (team[i]?.paid)
            ) {
                const descopeId = team[i].UserId;
                const user = await User.findOne({ descopeId });
                if (!user) continue;

                if (user && type === 'add') {
                    // let updatedEx = Number(user.XP) + Number(earnedXp);
                    let newLevel = user.level
                    // for (let i = 0; i < levelThresholds.length; i++) {
                    //     if (updatedEx >= levelThresholds[i]) {
                    //         newLevel = i + 1;
                            await User.findOneAndUpdate(
                                { descopeId },
                                {level: newLevel, Won: user?.Won ? Number(user?.Won + 1) : 1 },
                                { new: true }
                            );

                    //         break
                    //     }
                    // }
                }
                else if (user && (type === 'deduct' && isdeduction)) {
                    // let updatedEx = (Number(user?.XP) + this.gameDetails?.loserXp);
                    let newLevel = user.level
                    // for (let i = 0; i < levelThresholds.length; i++) {
                    //     if (updatedEx >= levelThresholds[i]) {
                    //         newLevel = i + 1;
                    await User.findOneAndUpdate(
                        { descopeId },
                        {  level: newLevel, Lost: user?.Lost ? Number(user?.Lost + 1) : 1 },
                        { new: true }
                    );

                    //         break
                    //     }
                    // }
                }

                // const wallet = await Wallet.findOne({ WalletType: "admin" }).sort({ createdAt: 1 });
                // if (!wallet) continue;

                // const updatedBalance =  Number(wallet?.balance) + Number(amount);
                // const updatedWallet = await Wallet.findOneAndUpdate(
                //     { _id: new mongoose.Types.ObjectId(wallet?._id), WalletType: "admin" },
                //     { balance: updatedBalance },
                //     { new: true }
                // );

                // if (updatedWallet) {
                //     const transactionCreated = await Transaction.create({
                //         userId: new mongoose.Types.ObjectId(wallet?.userId),
                //         transactionBalance: amount,
                //         transactionStatus: 'received',
                //         transactionType: 'winning prize',
                //         Description: `Bot (${team[i]?.userName}) has won the game and the winning prize is ${amount}.`,
                //         gameLevel: 'beginner'
                //     });

                //     if (transactionCreated) {

                //             team[i].winningprize = amount;
                //     }
                // }
            }

            console.log('in loop users', team[i]?.UserId);

            const descopeId = team[i]?.UserId;
            const user = await User.findOne({ descopeId });
            if (!user) continue;
            if (this.balanceDetails.length > 0) {
                for (let i = 0; i < this.balanceDetails.length; i++) {
                    if (user && this.balanceDetails[i]?.UserId !== descopeId) {
                        const wallet = await Wallet.findOne({ descopeId, userId: new mongoose.Types.ObjectId(user?._id) });
                        if (!wallet) continue;

                        const balanceDetails = {
                            UserId: descopeId,
                            prize: type === 'deduct' && isdeduction ? 0 : amount || 0,
                            balance: wallet?.balance
                        }
                        console.log('balanceDetails', balanceDetails)
                        this.balanceDetails.push(balanceDetails);
                    }
                }
            } else {
                if (user?._id) {
                    const wallet = await Wallet.findOne({ descopeId, userId: new mongoose.Types.ObjectId(user?._id) });
                    if (!wallet) continue;

                    const balanceDetails = {
                        UserId: descopeId,
                        prize: type === 'deduct' && isdeduction ? 0 : amount || 0,
                        balance: wallet?.balance
                    }
                    console.log('balanceDetails', balanceDetails)
                    this.balanceDetails.push(balanceDetails);
                }
            }


        }
    }
}

module.exports = WalletTransactionService;
