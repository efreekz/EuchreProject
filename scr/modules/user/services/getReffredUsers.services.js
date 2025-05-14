const UserModel = require('../user.model');
const mongoose = require('mongoose');

const getReffredUsers = async (req) => {
    const { page = 1, limit = 10, filter, sort, search } = req.query;
    const { id } = req.body;
    
    const query = { role: 'user', active: true };

    if (search) {
        console.log('search', search);
        const searchString = search.replace(/^"|"$/g, ''); // Remove double quotes if present
        const regex = new RegExp(searchString, 'i');
        console.log('Constructed Regex:', regex);
        query.$or = [
            { userName: regex },
            { email: regex },
        ];
    }

    const sortOptions = sort ? JSON.parse(sort) : { _id: -1 };
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        // Step 1: Get the user details by ID and their wallet balance
        const user = await UserModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id), role: 'user', active: true } },
            {
                $lookup: {
                    from: 'wallets',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'wallet'
                }
            },
            { $unwind: { path: "$wallet", preserveNullAndEmptyArrays: true } },
        ]);

        if (!user || user.length === 0) {
            return { msg: 'User not found', status: false, code: 404 };
        }

        const userDetails = user[0];

        // Step 2: Get all users referred by this user
        const referredUsersAggregation = await UserModel.aggregate([
            { $match: { referredBy: new mongoose.Types.ObjectId(id), role: 'user', active: true } },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'wallets',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'wallet'
                }
            },
            { $unwind: { path: "$wallet", preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    data: [{ $match: {} }],
                    totalResults: [{ $count: "totalResults" }],
                }
            }
        ]);

        const referredUsers = referredUsersAggregation[0].data;
        const totalResults = referredUsersAggregation[0].totalResults[0]?.totalResults || 0;
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            msg: 'Fetched User and Referred Users',
            status: true,
            code: 200,
            data: {
                user: userDetails,
                referredUsers: referredUsers,
                totalResults,
                totalPages,
                currentPage: pageNumber,
            },
        };
    } catch (error) {
        console.error("Error:", error.message); // Debugging line
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getReffredUsers;
