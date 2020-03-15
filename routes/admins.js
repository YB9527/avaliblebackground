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

function init() {
    //初始化
    db.findPoBySql("admins", {}, (err, admins) => {
        if (admins.length === 0) {
            let admin = {backpass: "123"};
            db.savePo("admins", admin, (err, result) => {
            });
        }
    })
}
//初始化启动的任务
setTimeout(function () {
    init();
}, 1000 * 3);

router.get('/compareadmin', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    db.findPoBySql("admins", {backpass: req.query.backpass}, (err, admins) => {
        if (admins.length === 0) {
            res.send({status: 1, message: "失败"});
        } else {
            res.send({status: 0, message: "成功"});
        }
    });
});
router.post('/setadmin', mu.single(), (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    let admin = JSON.parse(req.body.admin);
    db.findPoBySql("admins", {}, (err, admins) => {
        if (admins.length > 0) {
            admins[0].backpass = admin.backpass;
            //console.log(admins[0])
            db.updatePoByID("admins", admins[0], (err, admins) => {
                res.send({status: 0, message: "成功"});
            });
        } else {
            res.send({status: 0, message: "操作失败"});
        }
    });


});

module.exports = router;