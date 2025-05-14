const mongoose = require('mongoose');
const PlayingRoom = require('../playingRoom.model')

const getAllRoomDetails = async (req) => {
    console.log('in get all transaction server');
    const { page = 1, limit = 500, search, sort, filter } = req.query;

    const query = { roomType: 'private', status:'finding' };

    if (search) {
        query.$or = [
            { PlayingRoomType: new RegExp(search, 'i') },
            { PlayingRoomStatus: new RegExp(search, 'i') }
        ];
    }

    if (filter) {
        const filterObj = JSON.parse(filter);
        if (filterObj.status) {
            query.status = filterObj.status;
        }
    }

    const sortOptions = sort ? JSON.parse(sort) : { createdAt: -1 };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        const PlayingRoomsAggregation = await PlayingRoom.aggregate([
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
                    isWinner: 1,
                    gameId: 1,
                    createdAt: 1,
                    roomType: 1,
                    status: 1,
                    // passKey: 1,
                    // gameDetail: 1,
                    validityTime:1,
                    validityDate:1,
                    tableName:1,
                    Description:1,
                    "gameDetail.entry": 1,
                    "gameDetail.prize": 1,
                    "gameDetail.TotalPrizeAmount": 1
                }
            }
        ]);

        const totalResults = await PlayingRoom.countDocuments(query);
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            msg: "PlayingRooms fetched",
            data: {
                data: PlayingRoomsAggregation,
                totalResults,
                totalPages,
                currentPage: pageNumber,
            },
            status: true,
            code: 200,
        };
    } catch (error) {
        console.error("Error retrieving PlayingRooms: ", error);
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 500,
        };
    }
};

module.exports = getAllRoomDetails;
