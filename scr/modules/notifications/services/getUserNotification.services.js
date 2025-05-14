const mongoose = require('mongoose');
const Notification = require('../notification.model');
const moment = require('moment-timezone');
const User = require('../../user/user.model');
const Tournament = require('../../tournament/tournament.model');

const getUserNotification = async ({ user, req }) => {
    console.log('in get all transaction server');
    let { page = 1, limit = 10, search, sort, filter } = req?.query || {};

    // Check if UserId exists in token
    if (!user.token?.UserId) {
        return { msg: "Unauthorized - Missing UserId", status: false, code: 401, data: null };
    }

    // Fetch user from descopeId (assuming descopeId is used for authentication)
    const findUser = await User.findOne({ descopeId: user.token?.UserId });
    if (!findUser) {
        return { msg: "Unauthorized - User Not Found", status: false, code: 401, data: null };
    }

    // Query to fetch notifications for the specific user
    const query = { userId: new mongoose.Types.ObjectId(findUser?._id), active: true };

    // Apply search functionality if query search is present
    if (search) {
        query.$or = [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
        ];
    }

    // Apply filter functionality (if necessary)
    // Uncomment and implement filter logic if needed
    // if (filter) {
    //     const filterObj = filter;
    //     if (filterObj && (filterObj === 'private' || filterObj === "public")) {
    //         query.roomType = filterObj;
    //     } else if (filterObj) {
    //         query.status = filterObj;
    //     }
    // }

    // Parse and define sorting
    const sortOptions = sort ? JSON.parse(sort) : { createdAt: -1 };

    // Pagination setup
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        // Aggregation pipeline to get the notifications
        let notifications = await Notification.aggregate([
            { $match: query },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: pageSize },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    active: 1,
                    message: 1,
                    type: 1,
                    isTournament: 1,
                    description: 1,
                    tournamentId: 1,
                }
            }
        ]);

        const updatedNotifications = await Promise.all(
            notifications.map(async (notification) => {
                if (notification?.isTournament && notification?.tournamentId) {
                    const tournament = await Tournament.findOne({ _id: notification?.tournamentId });

                    if (tournament && tournament.isTournamentEnd) {
                        await Notification.updateOne(
                            { _id: notification?._id },
                            { $set: { active: false } }
                        );
                        return { ...notification, active: false };
                    }
                }
                return notification;
            })
        );
        notifications = updatedNotifications;


        // Count the total notifications for pagination
        const totalResults = await Notification.countDocuments(query);
        const totalPages = Math.ceil(totalResults / pageSize);



        return {
            msg: "Notifications fetched successfully",
            data: {
                data: notifications,
                totalResults,
                totalPages,
                currentPage: pageNumber,
            },
            status: true,
            code: 200,
        };
    } catch (error) {
        console.error("Error retrieving notifications: ", error);
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 500,
        };
    }
};

module.exports = getUserNotification;
