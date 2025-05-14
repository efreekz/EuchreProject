const mongoose = require('mongoose');
const levelModel = require('../games.model');

const getAllGamesAdmin = async (req) => {
    const { page = 1, limit = 10, search, sort, filter } = req.query;

    const query = {};

    // Handle search parameter
    if (search) {
        console.log('Search:', search);
        const searchString = search.replace(/^"|"$/g, ''); // Remove double quotes if present
        const regex = new RegExp(searchString, 'i');
        console.log('Constructed Regex:', regex);
        query.$or = [
            { gameName: regex }, // Assuming 'gameName' is a field to search
            { description: regex } // Assuming 'description' is another field to search
        ];
    }

    // Handle filter parameter
    if (filter) {
        const filterObj = JSON.parse(filter);
        if (filterObj.value) {
            query.value = filterObj.value;
        }
    }

    const sortOptions = sort ? JSON.parse(sort) : { _id: -1 };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        const games = await levelModel.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        const totalResults = await levelModel.countDocuments(query);
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            msg: "Games fetched",
            data: {
                data: games,
                totalResults,
                totalPages,
                currentPage: pageNumber,
            },
            status: true,
            code: 200,
        };
    } catch (error) {
        console.error("Error:", error.message); // Debugging line
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 400,
        };
    }
};

module.exports = getAllGamesAdmin;
