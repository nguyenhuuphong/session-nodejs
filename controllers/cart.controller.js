var express = require("express");
var db = require('../db');
const shortid = require("shortid");
var cookieParser = require('cookie-parser');
var db = require('../db');


module.exports.addToCart = function (req, res, next){
      var bookId = req.params.bookId;
      var sessionId = req.signedCookies.sessionId;

      if(!sessionId){
      	res.redirect('/books')
        return;
      }

      var count =  db
        .get('sessions')
        .find({id: sessionId})
        .get('cart.' + bookId, 0)
        .value();

        db.get('sessions')
          .find({id: sessionId})
          .set('cart.'+ bookId, count + 1)
          .write();

      res.redirect('/books')   

      next(); 
}
module.exports.viewCart = function (req, res){

        var sessionId = req.signedCookies.sessionId;
        var session = db.get('sessions')
            .find({ id: sessionId })
            .value();

        var books = db.get('books').value();
        var results = [];

        console.log(session, sessionId)

        var convertCart = Object.keys(session.cart);

        convertCart.map(function(key) {
            var obj = {
                id: key,
                quantity: session.cart[key]
            }

            books.map(function(book) {
                if (obj.id === book.id) {
                    return obj.title = book.title;
                }
            });

            return results.push(obj);
        });

        res.render('cart', {
            cart: results
        });
        console.log(results)
}
