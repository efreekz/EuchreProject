const News = require('../news.model');


const createNews = async ({ body }) => {
    try {
        console.log("USER: ", typeof balance);
        const created = await News.create({
            title: body?.title,
            description: body?.description
        })
        if (created) {
            return { msg: "News Created.", status: true, code: 201, data: created };
        } else {
            return { msg: "Some thing When wrong", status: false, code: 500, data: null };
        }

    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = createNews;