const express = require('express');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const levelValidation = require("../modules/games/games.validation")
const levelController = require("../modules/games/controller")

const router = express.Router();


router.route('/addGames').post(auth("adminAccess"), validate(levelValidation.addGames), levelController.addGames)
router.route('/deleteGame').post(auth("adminAccess"), levelController.deleteGame)
router.route('/updateGame').post(auth("adminAccess"), validate(levelValidation.updateGame), levelController.updateGame)
router.route('/getGames').get(levelController.getAllGames);
router.route('/getGame-admin').get(auth("adminAccess"), levelController.getAllGamesAdmin);
router.route('/getPrivateGame-admin').get(auth("adminAccess"), levelController.getPrivateGameAdmin);



module.exports = router;