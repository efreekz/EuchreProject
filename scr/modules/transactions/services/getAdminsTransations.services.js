const mongoose = require('mongoose');
const User = require('../../user/user.model');
const Transaction = require('../transaction.model');

const getAdminsTransations = async ({req}) => {
    try {
        const { id } = req?.body;
        const { page = 1, limit = 10, search, sort, filter } = req.query;

        // Validate user token's UserId
        if (!id) {
            return { msg: "Unauthorized", status: false, code: 401, data: null };
        }

        // Find the user by ID
        const foundAdmin = await User.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (!foundAdmin) {
            return { msg: "User Not Found", status: false, code: 400, data: null };
        }

        const userId = new mongoose.Types.ObjectId(foundAdmin._id);
        const query = { userId };

        // Apply search filter
        if (search) {
            query.$or = [
                { transactionType: new RegExp(search, 'i') },
                { transactionStatus: new RegExp(search, 'i') },
                { Description: new RegExp(search, 'i') }
            ];
        }

        // Apply additional filters
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

        // Fetch transactions with pagination and sorting
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

module.exports = getAdminsTransations;
