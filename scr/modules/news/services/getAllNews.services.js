const mongoose = require('mongoose');
const levelModel = require('../news.model');

const getAllNews = async ({req}) => {
    let page = 1;
    let limit = 10;
    let search = '';
    let sort = '';
    let filter = '';
    if (req?.query) {
        page = req?.query?.page;
        limit = req?.query?.limit;
        filter = req?.query?.filter;
        sort = req?.query?.sort;
        search = req?.query?.search;
    } 

    const query = {};

    // Handle search parameter
    if (search) {
        console.log('Search:', search);
        const searchString = search.replace(/^"|"$/g, ''); // Remove double quotes if present
        const regex = new RegExp(searchString, 'i');
        console.log('Constructed Regex:', regex);
        query.$or = [
            { title: regex }, // Assuming 'gameName' is a field to search
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

    console.log('sort', sort)
    const sortOptions = sort ? JSON.parse(sort) : { _id: -1 };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    try {
        const news = await levelModel.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        const totalResults = await levelModel.countDocuments(query);
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            msg: "news fetched",
            data: {
                data: news,
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

module.exports = getAllNews;
