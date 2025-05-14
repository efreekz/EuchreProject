const mongoose = require('mongoose');
const Tournament = require('../tournament.model')

const getAllTournamentsAdmin = async ({ req }) => {
    console.log('in get all transaction server');
    const { page = 1, limit = 10, search, sort, filter } = req.query;

    const query = {  };

    if (search) {
        query.$or = [
            { tournamentName: new RegExp(search, 'i') },
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
        ];
    }

    if (filter) {
        const filterObj = filter;
        console.log(filterObj)
        if (filterObj && (filterObj === 'private' || filterObj === "public")) {
            query.roomType = filterObj;
        } else if (filterObj) {
            query.status = filterObj
        }
    }

    const sortOptions = sort ? JSON.parse(sort) : { createdAt: -1 };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        const tournamentAgree = await Tournament.aggregate([
            { $match: query },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'gamedetails', // Name of the GameRound collection in MongoDB
                    let: { game_id: '$gameId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$game_id'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'gameDetail'
                }
            },
            {
                $unwind: {
                    path: '$gameDetail',
                    preserveNullAndEmptyArrays: true // Include PlayingRooms even if they don't have a GameRound
                }
            },
            {
                $project: {
                    _id: 1,
                    tournamentName: 1,
                    gameId: 1,
                    createdAt: 1,
                    isGameEnd: 1,
                    registeredUsers: 1,
                    countOfRegisteredUsers: 1,
                    status: 1,
                    title: 1,
                    totalMatches: 1,
                    remainingMatches: 1,
                    passKey: 1,
                    startDateAndTime: 1,
                    startTime: 1,
                    isTournamentEnd: 1,
                    description: 1,
                    tableName: 1,
                    limitOfPlayers:1,
                    gameDetail: 1
                }
            }
        ]);

        const totalResults = await Tournament.countDocuments(query);
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            msg: "Tournament fetched",
            data: {
                data: tournamentAgree,
                totalResults,
                totalPages,
                currentPage: pageNumber,
            },
            status: true,
            code: 200,
        };
    } catch (error) {
        console.error("Error retrieving Tournament: ", error);
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 500,
        };
    }
};

module.exports = getAllTournamentsAdmin;
