const UserModel = require('../user.model');
const mongoose = require('mongoose');

const getLeaderboard = async (req) => {
    const { page = 1, limit = 500, filter, sort, search } = req.query;
    const query = { role: 'user', active: true };
    const userId = req?.user ? req?.user?.token?.UserId : null;

    if (filter) {
        query.$or = [
            { userName: new RegExp(filter, 'i') },
            { email: new RegExp(filter, 'i') },
        ];
    }

    if (search) {
        const searchString = search.replace(/^"|"$/g, ''); // Remove double quotes if present
        const regex = new RegExp(searchString, 'i');
        console.log('Constructed Regex:', regex);
        query.$or = [
            { userName: regex },
            { email: regex },
        ]
    }

    const sortOptions = sort ? JSON.parse(sort) : { XP: -1, _id: -1 };
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        // Find the current user's wins
        let currentPosition;
        if (userId && req?.user?.token?.UserId) {

            const currentUser = await UserModel.findOne({ descopeId: userId });
            const userWins = currentUser?.XP || 0;

            // Calculate the user's rank
            const rankAggregation = await UserModel.aggregate([
                { $match: { role: 'user', active: true, XP: { $gt: userWins } } },
                { $count: 'rank' }
            ]);

            currentPosition = rankAggregation[0] ? rankAggregation[0].rank + 1 : 1;
        }

        // Fetch the leaderboard
        const usersAggregation = await UserModel.aggregate([
            { $match: query },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: pageSize },
            {
                $facet: {
                    data: [{ $match: {} }],
                    totalResults: [{ $count: "totalResults" }],
                }
            }
        ]);

        const users = usersAggregation[0].data;
        const totalResults = usersAggregation[0].totalResults[0]?.totalResults || 0;
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            msg: 'Fetched Users',
            status: true,
            code: 200,
            data: {
                data: users,
                totalResults,
                totalPages,
                currentPage: pageNumber,
                currentPosition: currentPosition ? currentPosition : 0,
            },
        };
    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getLeaderboard;
