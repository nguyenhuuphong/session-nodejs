var express = require("express");
var router = express.Router();
const shortid = require("shortid");
const bcrypt = require('bcrypt');
var db = require('../db');

var controller = require('../controllers/cart.controller');
// view home user
router.get('/', controller.viewCart);

router.get("/add/:bookId", controller.addToCart );



module.exports = router;