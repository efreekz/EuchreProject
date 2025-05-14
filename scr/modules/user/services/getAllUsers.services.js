const UserModel = require('../user.model');
const mongoose = require('mongoose');

const getAllUsers = async (req) => {
    const { page = 1, limit = 10, filter, sort, search } = req.query;
    const query = { role: 'user' };

    // Handle filter for 'active' field
    if (filter !== undefined) {
        const filterValue = JSON.parse(filter);
        console.log('Filter Value:', typeof filterValue); // Log the filter value for debugging

        if (filterValue === "true") {
            query.active = true;
        } else if (filterValue === "false") {
            query.active = false;
        }
    }

    // Handle search for 'userName' and 'email' fields
    if (search) {
        console.log('search', search);
        const searchString = search.replace(/^"|"$/g, ''); // Remove double quotes if present
        const regex = new RegExp(searchString, 'i');
        console.log('Constructed Regex:', regex);

        if (!query.$or) {
            query.$or = [];
        }
        query.$or.push(
            { userName: regex },
            { email: regex }
        );
    }

    const sortOptions = sort ? JSON.parse(sort) : { _id: -1 };
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        const usersAggregation = await UserModel.aggregate([
            { $match: query },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'wallets', // The name of the wallets collection
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
            },
        };
    } catch (error) {
        console.error("Error:", error.message); // Debugging line
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getAllUsers;
