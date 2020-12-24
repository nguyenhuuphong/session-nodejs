const shortid = require("shortid");
var db = require('../db');
var express = require("express");

module.exports= function (req, res, next){
	var session = req.signedCookies.sessionId;


	if(!session){
		var sessionId = shortid.generate();

		res.cookie('sessionId', sessionId, {signed: true});

		db.get('sessions')
		  .push({ id: sessionId})
		  .write();
    }


	var totalBook = 0 ;

	var dataBook = db.get('sessions').find({id: session}).value(); 

	for (bookId in dataBook.cart){
		totalBook += dataBook.cart[bookId]
	}    

	res.locals.count = totalBook ;
	next();
}