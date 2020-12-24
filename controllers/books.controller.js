var multer = require('multer');

var express = require("express");
var db = require('../db');
const shortid = require("shortid");
var cloudinary = require('cloudinary').v2;
 
var upload = multer({ dest :'uploads' })
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
module.exports.home = function (req, res){
  // pagination phân trang cho page book
  var page = parseInt(req.query.page) || 1; //n
  var perPage = 4; //x 
  var start = (page - 1)* perPage;
  var end = page * perPage;
  res.render( "index", {
    todo: db.get('books').value().slice(start,end)
});
};  
// thêm tên sách
module.exports.create = function (req, res) {
	res.render("create");
};

module.exports.createPost = async function (req, res){
   console.log(req.file);
  console.log(req.body);
  var id = shortid.generate();
  var title = req.body.title;
  var des = req.body.des;
  req.body.coverUrl = req.file.path.split('\\').join('/');
  var image = await cloudinary.uploader.upload(req.file.path);
 

  //validate
  var errors = []
  if (!req.body.title){
    errors.push("title is required")
  }
  if (!req.body.des){
    errors.push("Desciption is required")
  }
  if (errors.length){
     res.render("create",{
      errors: errors,
      values: req.body
     });
     return;
   }
    db.get('books') 
       .push({id:id, title: title, des: des, coverUrl: image.secure_url})
       .write(); 
    res.redirect("/books");
};
// xóa tên sách
module.exports.idDelete =  function(req, res) {
  var id = req.params.id;
   var getData =  db
    .get("books")
    .remove({ id: id })
    .write();
  res.redirect("/books")
  };


// cập nhật tên sách
module.exports.idUpdate = function(req, res) {
   var getId = req.params.id;
  var getData = db
    .get("books")
    .find({ id: getId })
    .value();
  res.render("update", {
    todo: getData
  });
};

module.exports.idUpdatePost = function (req, res){
  
  var id = req.params.id;
  var Title = req.body.title;
  var Des  = req.body.des;
   
   db.get('books')
  .find({ id: id })
  .assign({ title:Title, des:Des})
  .write()
  
  res.redirect("/books");
};