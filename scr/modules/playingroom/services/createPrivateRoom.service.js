const { default: mongoose } = require('mongoose');
const PlayingRoom = require('../playingRoom.model');


const createPrivateRoom = async ({ body }) => {

    try {
        let UpdateDate;
        if(body?.validityDate){
            UpdateDate = new Date(body?.validityDate).toISOString()
        }
        const createRoom = await PlayingRoom.create({validityTime:body?.validityTime, tableName: body?.tableName, Description: body?.Description, gameId: new mongoose.Types.ObjectId(body?.gameId), roomType: body?.roomType === 'private' ? 'private' : 'private', passKey: body?.passKey, validityDate: UpdateDate });
        if (createRoom) {
            return { msg: "Room Created.", status: true, code: 201, data: createRoom };

        } else {
            console.log("400 else")
            return { msg: "failed to create room", status: false, code: 400 }
        }


    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = createPrivateRoom;