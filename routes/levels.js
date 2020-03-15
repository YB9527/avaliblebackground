/*用户级别保存*/
var express = require('express');
var router = express.Router();
var db = require('../tool/DB.js')
var ObjectID = require('mongodb').ObjectID;
var multer = require("multer");
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
router.get('/getlevelsall',  function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    db.findPoBySql("levels",{},(err,result)=>{
       if(result.length ===0){
           let levels=[{levelnum:0,name:"管理用户",personcount:0},{levelnum:1,name:"普通用户",personcount:0}];
           db.savePoMany("levels",levels,(err,result)=>{
               res.send({status:0,message:"第一次获取初始化值",levels:levels}) ;
           });
       } else{
           db.findPoBySql("users",{},(err,users)=>{
              for(let level of result){
                  level.personcount =0;
                  for(let user of users){
                      if(level.levelnum == user.levelnum){
                          level.personcount +=1;
                      }
                  }
              }
               res.send({status:0,message:"成功",levels:result}) ;
           });
       }
    });
});

router.post('/editlevel',mu.single(),(req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    let level = JSON.parse(req.body.level);
    db.updatePoByID("levels",level,(err,result)=>{
       res.send({status:0,message:"成功",result:result});
    });
});


module.exports = router;
