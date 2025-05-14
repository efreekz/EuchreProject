const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const PlayingRoom = require('../playingRoom.model');


const checkRoomStatus = async ({ user }) => {
    try {

        if (user.token.UserId != null || user.token.UserId != '') {
            const findedUser = await User.findOne({ descopeId: user.token.UserId })
            if (findedUser) {
                const findRoom = await PlayingRoom.aggregate([
                    {
                        $match: {
                            status: 'playing',
                            players: {
                                $elemMatch: { UserId: user.token.UserId }
                            }
                        }
                    }
                ]);
                if (findRoom.length > 0) {
                    const roomId = findRoom[0]._id.toString();
                    let redisData = await client.json.get(roomId);

                    if (redisData.code === 500) {
                        return { status: false, code: 500, msg: redisData.msg }
                    }
                    if (typeof redisData === 'string') {
                        redisData = JSON.parse(redisData);
                    }
                    if (typeof redisData === 'string') {
                        redisData = JSON.parse(redisData);
                    }
                    if (redisData) {
                        return { msg: "joined existing game.", status: true, code: 200, data: redisData };
                    }

                } else {
                    return { msg: "User Not Found", status: false, code: 400 }
                }


            } else {
                return { msg: "User Not Found", status: false, code: 400 }
            }

        }




    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = checkRoomStatus;