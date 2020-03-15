var express = require('express');
var router = express.Router();
var db = require('../tool/DB.js')
var ObjectID = require('mongodb').ObjectID;
var multer = require("multer");
var UUID = require('uuid');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images");
    },
    filename: function (req, file, cb) {
        let mydate = date.date();
        cb(null, mydate + file.originalname);
    }
});
var mu = multer({storage: storage});

router.get('/getusersall', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    db.findPoBySql("users", {}, (err, users) => {
        db.findPoBySql("avalibleprojects",{},(err2,projects)=>{
            for (let user of users) {
                //user.password = "";
                user.projectlength = 0;
                for(let project of projects){

                    if(project.user&&project.user._id == user._id){
                        user.projectlength = parseInt(user.projectlength)  +1;
                    }
                }
            }
            res.send({status: 0, message: "成功", users: users});
        });
    });
});
/* GET users listing. */
router.post('/regist', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let user = JSON.parse(req.body.user);
    let accountnum = user.accountnum;
    let alias = user.alias;
    let pass = user.pass;
    let level = user.level;
    let sql = {$or: [{"accountnum": accountnum}, {"alias": alias}]};
    db.findPoBySql("users", sql, (err, result) => {
        if (result.length > 0) {
            res.send({status: 1, message: "账号 或者 昵称 已经存在"});
        } else {
            db.savePo("users", user, (err, result) => {
                res.send({status: 0, message: "注册成功"});
            })
        }
    });
});
router.post('/login', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let user = JSON.parse(req.body.user);
    let accountnum = user.accountnum;
    let pass = user.pass;

    db.findPoBySql("users", {accountnum: accountnum}, (err, result) => {
        if (result.length > 0) {
            if (result[0].pass == pass) {
                //var ID = UUID.v1();
                result[0].pass = "";
                res.send({status: 0, message: "登录成功", user: result[0]});
            } else {
                res.send({status: 2, message: "密码错误"});
            }
        } else {
            res.send({status: 1, message: "账号不存在"});
        }
    });
});
//后台更改的user
router.post('/updatesuer', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let user = JSON.parse(req.body.user);
    let accountnum = user.accountnum;
    let alias = user.alias;
    let pass = user.pass;
    let level = user.level;
    //找出人员的的项目，更改项目 user
    db.findPoBySql("avalibleprojects",{},(err,projects)=>{
        let _id = user._id;
        let updateprojects=[];
        for(let project of projects){
            if(project.user && _id == project.user._id){
                project.user = user;
                updateprojects.push(project);
            }
        }
        if(updateprojects.length >0 ){

            for (let project of updateprojects){
                db.updatePoByID("avalibleprojects",project,(err3,result3)=>{

                })
            }
        }
        db.updatePoByID("users", user, (err2, result2) => {
            res.send({status: 0, message: "成功"});
        })
    });

});
//前台更改的user
router.post('/edituser', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    let user = JSON.parse(req.body.user);
    let accountnum = user.accountnum;
    let alias = user.alias;
    let pass = user.pass;
    let newpass = req.query.newpass;
    db.findPoBySql("users", {accountnum:accountnum,pass:pass}, (err, result) => {
        if(result.length >0){
           if(newpass){
               user.pass = newpass.toString();
           }
            db.findPoBySql("avalibleprojects",{},(err,projects)=>{
                let _id = user._id;
                let updateprojects=[];
                for(let project of projects){
                    if(project.user && _id == project.user._id){
                        project.user = user;
                        updateprojects.push(project);
                    }
                }
                if(updateprojects.length >0 ){

                    for (let project of updateprojects){
                        db.updatePoByID("avalibleprojects",project,(err3,result3)=>{

                        })
                    }
                }
                db.updatePoByID("users",user,(err2,result2)=>{
                    res.send({status: 0, message: "编辑成功"});
                });
            });
        }else{
            res.send({status: 1, message: "密码错误！！！"});
        }
    });



});

router.post('/deleteuser', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let user = JSON.parse(req.body.user);
    let accountnum = user.accountnum;
    let alias = user.alias;
    let pass = user.pass;
    let level = user.level;
    db.deletePoByPoID("users", user, (err, result) => {

        res.send({status: 0, message: "成功"});
    })
});
module.exports = router;
