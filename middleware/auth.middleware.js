var express = require("express");
var db = require('../db');
const shortid = require("shortid");
var cookieParser = require('cookie-parser');

module.exports.requireAuth = function (req, res, next){
    if(!req.signedCookies.cookie){
 		res.redirect('/auth/login');
 		return;
    }
    var user = db.get('user').find({id: req.signedCookies.cookie}).value();
    
    if(!user){
        res.redirect('/auth/login')
        return;
    }
    res.locals.user = user;
    next();
}
