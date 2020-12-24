var multer = require('multer');

var bcrypt = require('bcrypt');
var express = require("express");
var db = require('../db');
const shortid = require("shortid");
//var md5 = require('md5');
var cloudinary = require('cloudinary').v2;
 
var upload = multer({ dest :'uploads' })
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
//CLOUDINARY_URL=cloudinary://631582236334719:nWLwsQb6uA5OMqHgSVo2fY-UQdA@kon-tum

module.exports.index = function (req, res) {
  var users = db.get('user').value();
  res.render("user", {
      users
  });
};
// add new user
module.exports.add = function(req, res) {
  res.render("useradd");
};

module.exports.addPost = async function (req, res){
  req.body.id = shortid.generate();   
  var id = req.body.id;
  var name = req.body.name;
  var email = req.body.email ; 
  var password = req.body.password;
  var age = req.body.age;
 /*
  if (req.file) {
            const { secure_url } = await cloudinary.uploader.upload(req.file.path);
            req.body.avatar = secure_url;
        } else {
            req.body.avatar = '/uploads/default.jpg';
        }*/
  req.body.avatar = req.file.path.split('\\').join('/')
  var image = await cloudinary.uploader.upload(req.file.path)

  console.log(req.body.avatar);
console.log(req.body)
  //var hash = md5(password); // bảo mật dữ liệu bằng md5 
   const saltRounds = 10;
   const hash = await bcrypt.hash(password, saltRounds);
   var errors = []
   var user = db.get('user').find({email: email}).value(); //lấy email từ databas
   // chuyen cuc nay vào file validate
   if (user){
     errors.push("Email already exists");  // kiểu tra email có tồn tại trong database chưa
   }
   if (!req.body.name || req.body.name.length > 30){
     errors.push("Name is required")
   }
   if ( req.body.name.length > 30){
     errors.push("tên bạn dài hơn 30 ký tự")
   }
   if (!req.body.age){
     errors.push("Age is required")
   }
   if (!req.body.age || req.body.age < 18 ){
     errors.push("xin lỗi bạn chưa đủ 18+")
   }
   if (!req.body.email){
     errors.push("email is required")
   }
   if (!req.body.password){
   } 
   if (errors.length){
      return res.render("useradd",{
       errors: errors,
       values: req.body
      });
    }
     var isAdmin = JSON.parse(req.body.isAdmin); // ep string sang boolean
    
      db.get('user') 
       .push({id: id, name: name, age: parseInt(age), email: email, password: hash,isAdmin: isAdmin,avatar: image.secure_url ,wrong: 0})
       .write();  // lưu biến hash password: hash => dùng bcrypt
    res.redirect("/user");
};
// xóa người thuê
module.exports.idDelete = function (req, res){
  var id = req.params.id;
  var getData =  db
     .get("user")
    .remove({ id: id })
    .write();

  res.redirect("/user")
  };
// show thông tin
module.exports.show = function (req, res){
  var getId = req.params.id;
  var getData = db
    .get("user")
    .find({ id: getId })
    .value();

  res.render("usershow", {
    user: getData
  });
};
module.exports.idUpdate = function(req, res) {
   var getId = req.params.id;

  var getData = db
    .get("user")
    .find({ id: getId })
    .value();

  res.render("userupdate", {
    data: getData
  });
};

module.exports.idUpdatePost = async function (req, res){
  var name = req.body.name;
  var age = req.body.age;
  var email = req.body.email; // indefined 
  var password = req.body.password;
  var isAdmin = req.body.isAdmin == "true";

  var user;
 if (req.file ) {
  req.body.avatar = req.file.path.split('\\').join('/');
  var imageUploaded = await cloudinary.uploader.upload(req.file.path);

   user = db.get('user')
  .find({ id: req.params.id })
  .assign({ name: name, age: age, email:email, password: password,
        isAdmin: isAdmin,avatar: imageUploaded , wrong: 0})
  .write() 
 }else {
   user = db.get('user')
    .find({ id: req.params.id })
    .assign({ name: name, age: age, email:email, password: password,
          isAdmin: isAdmin, wrong: 0})
    .write() 
 }
  res.redirect("/user");
};
