// const { default: mongoose } = require('mongoose');
// const Tournament = require('../tournament.model');
// const moment = require('moment-timezone');

// const createTournament = async ({ body }) => {
//     try {
//         let { startDateAndTime, startTime, gameId, ...data } = body;

//         console.log('data', data);

//         if (startDateAndTime) {
//             // Parse the date in the provided timezone
//             startDateAndTime = moment.tz(startDateAndTime, 'America/New_York').toDate();
//         }

//         if (startTime) {
//             // Parse the time in the provided timezone
//             startTime = moment.tz(startTime, 'America/New_York').toDate();
//         }

//         const createdTournament = await Tournament.create({
//             startDateAndTime,
//             startTime,
//             gameId: new mongoose.Types.ObjectId(gameId),
//             ...data
//         });

//         if (createdTournament) {
//             return { msg: "Tournament Created.", status: true, code: 201, data: createdTournament };
//         } else {
//             console.log("400 else");
//             return { msg: "Failed to create Tournament", status: false, code: 400 };
//         }
//     } catch (error) {
//         return { msg: error.message, status: false, code: 500 };
//     }
// };

// module.exports = createTournament;
const { default: mongoose } = require('mongoose');
const Tournament = require('../tournament.model');

const createTournament = async ({ body }) => {
    try {
        let { startDateAndTime, startTime, gameId, ...data } = body;

        console.log('data', data);

        if (startDateAndTime) {
            // Parse the date using the system's local time
            startDateAndTime = new Date(startDateAndTime);
        }

        if (startTime) {
            // Parse the time using the system's local time
            startTime = new Date(startTime);
        }

        const createdTournament = await Tournament.create({
            startDateAndTime,
            startTime,
            gameId: new mongoose.Types.ObjectId(gameId),
            ...data
        });

        if (createdTournament) {
            return { msg: "Tournament Created.", status: true, code: 201, data: createdTournament };
        } else {
            console.log("400 else");
            return { msg: "Failed to create Tournament", status: false, code: 400 };
        }
    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = createTournament;
