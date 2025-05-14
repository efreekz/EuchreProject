const mongoose = require('mongoose');
const PlayingRoom = require('../playingRoom.model');

const getMatchmakingHistory = async (req) => {
    console.log('in get all transaction server');

    const user = req?.user;

    if (!user?.token?.UserId) {
        return { msg: "Unauthorized", status: false, code: 401, data: null };
    }

    const { page = 1, limit = 20, search, sort, filter } = req.query;

    const query = {};

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
                $addFields: {
                    userIdFoundInPlayers: {
                        $filter: {
                            input: '$players',
                            as: 'player',
                            cond: { $eq: ['$$player.UserId', user.token.UserId] }
                        }
                    },
                    userIdFoundInTeamOne: {
                        $filter: {
                            input: '$teamOne',
                            as: 'teamOneMember',
                            cond: { $eq: ['$$teamOneMember.UserId', user.token.UserId] }
                        }
                    },
                    userIdFoundInTeamTwo: {
                        $filter: {
                            input: '$teamTwo',
                            as: 'teamTwoMember',
                            cond: { $eq: ['$$teamTwoMember.UserId', user.token.UserId] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    userIdInRoom: {
                        $or: [
                            { $gt: [{ $size: '$userIdFoundInPlayers' }, 0] },
                            { $gt: [{ $size: '$userIdFoundInTeamOne' }, 0] },
                            { $gt: [{ $size: '$userIdFoundInTeamTwo' }, 0] }
                        ]
                    }
                }
            },
            { $match: { userIdInRoom: true } },
            {
                $project: {
                    _id: 1,
                    isWinner: 1,
                    gameId: 1,
                    createdAt: 1,
                    isGameEnd: 1,
                    roomType: 1,
                    status: 1,
                    team: {
                        $cond: {
                            if: { $gt: [{ $size: '$userIdFoundInTeamOne' }, 0] },
                            then: 'teamOne',
                            else: {
                                $cond: {
                                    if: { $gt: [{ $size: '$userIdFoundInTeamTwo' }, 0] },
                                    then: 'teamTwo',
                                    else: null
                                }
                            }
                        }
                    }
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

module.exports = getMatchmakingHistory;
