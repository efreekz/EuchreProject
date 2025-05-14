const mongoose = require('mongoose');
const Transaction = require('../transaction.model');
const User = require('../../user/user.model'); // Make sure the path to the User model is correct

const getAllTransactions = async (req) => {
    console.log('in get all transatcion server')
    const { page = 1, limit = 10, search, sort, filter } = req.query;

    const findAdmins = await User.find({ role: 'admin' })

    const adminIds = findAdmins.map(admin => admin._id);

    const query = { userId: { $nin: adminIds } };

    console.log('search', search)
    if (search) {
        query.$or = [
            { transactionType: new RegExp(search, 'i') },
            { transactionStatus: new RegExp(search, 'i') }
        ];
    }

    if (filter) {
        const filterObj = JSON.parse(filter);
        if (filterObj.value) {
            query.$or = [
                { transactionStatus: filterObj.value },
                { transactionType: filterObj.value }
            ];
        }
    }

    const sortOptions = sort ? JSON.parse(sort) : { createdAt: -1 };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        const transactionsAggregation = await Transaction.aggregate([
            { $match: query },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'users', // Name of the user collection in MongoDB
                    localField: 'userId', // Field in the Transaction collection
                    foreignField: '_id', // Field in the User collection
                    as: 'userDetails' // Name of the field to store the result
                }
            },
            {
                $unwind: '$userDetails' // Unwind the resulting array from $lookup
            },
            {
                $project: {
                    _id: 1,
                    transactionType: 1,
                    transactionStatus: 1,
                    amount: 1,
                    createdAt: 1,
                    userId: 1,
                    Description: 1,
                    transactionBalance: 1,
                    'userDetails.userName': 1 // Include only the username from the user details
                }
            }
        ]);

        const totalResults = await Transaction.countDocuments(query);
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            msg: "Transactions fetched",
            data: {
                data: transactionsAggregation,
                totalResults,
                totalPages,
                currentPage: pageNumber,
            },
            status: true,
            code: 200,
        };
    } catch (error) {
        console.error("Error retrieving transactions: ", error);
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 500,
        };
    }
};

module.exports = getAllTransactions;
