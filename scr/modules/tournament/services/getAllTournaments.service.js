// const mongoose = require('mongoose');
// const Tournament = require('../tournament.model');
// const moment = require('moment-timezone');

// const getAllRoomDetails = async ({ req }) => {
//     console.log('in get all transaction server');
//     const { page = 1, limit = 10, search, sort, filter } = req.query;

//     const nowNY = moment.tz('America/New_York');
//     const currentDateNY = nowNY.startOf('day').toDate();
//     const currentTimeNY = nowNY.format('HH:mm:ss');

//     console.log(currentDateNY);
//     console.log(currentTimeNY);

//     const query = {
//         status: "finding",
//         startDateAndTime: { $gte: currentDateNY },
//         $expr: {
//             $gte: [{ $dateToString: { format: "%H:%M:%S", date: "$startTime" } }, currentTimeNY]
//         }
//     };

//     if (search) {
//         query.$or = [
//             { tournamentName: new RegExp(search, 'i') },
//             { title: new RegExp(search, 'i') },
//             { description: new RegExp(search, 'i') }
//         ];
//     }

//     if (filter) {
//         const filterObj = filter;
//         console.log(filterObj);
//         if (filterObj && (filterObj === 'private' || filterObj === "public")) {
//             query.roomType = filterObj;
//         } else if (filterObj) {
//             query.status = filterObj;
//         }
//     }

//     const sortOptions = sort ? JSON.parse(sort) : { createdAt: -1 };

//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);
//     const skip = (pageNumber - 1) * pageSize;

//     try {
//         let tournamentAgree = await Tournament.aggregate([
//             { $match: query },
//             { $sort: sortOptions },
//             { $skip: skip },
//             { $limit: pageSize },
//             {
//                 $lookup: {
//                     from: 'gamedetails', // Name of the GameRound collection in MongoDB
//                     let: { game_id: '$gameId' },
//                     pipeline: [
//                         { $match: { $expr: { $eq: ['$_id', '$$game_id'] } } },
//                         { $sort: { createdAt: -1 } },
//                         { $limit: 1 }
//                     ],
//                     as: 'gameDetail'
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$gameDetail',
//                     preserveNullAndEmptyArrays: true // Include PlayingRooms even if they don't have a GameRound
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     status: 1,
//                     title: 1,
//                     startDateAndTime: 1,
//                     startTime: 1,
//                     isTournamentEnd: 1,
//                     description: 1,
//                     tableName: 1,
//                     'gameDetail.prize': 1,
//                     'gameDetail.entry': 1,
//                 }
//             }
//         ]);

//         const totalResults = await Tournament.countDocuments(query);
//         const totalPages = Math.ceil(totalResults / pageSize);

//         if (tournamentAgree.length > 0) {
//             const getTime = (time) => {
//                 // return new Date(time).toLocaleTimeString('en-US', {
//                 //     hour: '2-digit',
//                 //     minute: '2-digit',
//                 //     hour12: true
//                 // });
//                 return moment(time).tz('America/New_York').format('hh:mm A');
//             };

//             for (let i = 0; i < tournamentAgree.length; i++) {
//                 tournamentAgree[i].startTime = getTime(tournamentAgree[i].startTime);
//             }
//         }

//         return {
//             msg: "Tournament fetched",
//             data: {
//                 data: tournamentAgree,
//                 totalResults,
//                 totalPages,
//                 currentPage: pageNumber,
//             },
//             status: true,
//             code: 200,
//         };
//     } catch (error) {
//         console.error("Error retrieving Tournament: ", error);
//         return {
//             msg: "Something went wrong, please try again.",
//             status: false,
//             code: 500,
//         };
//     }
// };

// module.exports = getAllRoomDetails;
const mongoose = require('mongoose');
const Tournament = require('../tournament.model');
const moment = require('moment');

const getAllRoomDetails = async ({ req }) => {
    console.log('in get all transaction server');
    const { page = 1, limit = 10, search, sort, filter } = req.query;

    const nowLocal = moment();
    const currentDateLocal = nowLocal.startOf('day').toDate(); // System's local date
    const currentTimeLocal = nowLocal.format('HH:mm:ss'); // System's local time in HH:mm:ss format

    console.log(currentDateLocal);
    console.log(currentTimeLocal);

    const query = {
        status: "finding",
        startDateAndTime: { $gte: currentDateLocal },
        $expr: {
            $gte: [{ $dateToString: { format: "%H:%M:%S", date: "$startTime" } }, currentTimeLocal]
        }
    };

    if (search) {
        query.$or = [
            { tournamentName: new RegExp(search, 'i') },
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
        ];
    }

    if (filter) {
        const filterObj = filter;
        console.log(filterObj);
        if (filterObj && (filterObj === 'private' || filterObj === "public")) {
            query.roomType = filterObj;
        } else if (filterObj) {
            query.status = filterObj;
        }
    }

    const sortOptions = sort ? JSON.parse(sort) : { createdAt: -1 };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        let tournamentAgree = await Tournament.aggregate([
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
                    status: 1,
                    title: 1,
                    startDateAndTime: 1,
                    startTime: 1,
                    isTournamentEnd: 1,
                    description: 1,
                    tableName: 1,
                    'gameDetail.prize': 1,
                    'gameDetail.entry': 1,
                }
            }
        ]);

        const totalResults = await Tournament.countDocuments(query);
        const totalPages = Math.ceil(totalResults / pageSize);

        if (tournamentAgree.length > 0) {
            const getTime = (time) => {
                return moment(time).format('hh:mm A'); // System's local time format
            };

            for (let i = 0; i < tournamentAgree.length; i++) {
                tournamentAgree[i].startTime = getTime(tournamentAgree[i].startTime);
            }
        }

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

module.exports = getAllRoomDetails;
