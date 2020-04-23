var express = require('express');
var router = express.Router();
var datavdb = require('../tool/DatavDB');
var ObjectID = require('mongodb').ObjectID;
var multer = require("multer");
const superagent = require('superagent');
var basicurl = "https://geo.datav.aliyun.com/areas_v2/bound/";

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


/**
 * 先删除数据库中 all 的,在保存
 */
var flushalljson = function () {
    superagent
        .get(basicurl + "all.json")
        .set('connection', 'keep-alive')
        .set('Accept', 'application/json')
        .then(res => {
            let all = JSON.parse(res.text);

            datavdb.deletePoBySQL("aa", {}, (err, res) => {

                datavdb.savePoMany("all", all, (err1, res1) => {

                })
            });

        });
};

/**
 *  先删除 所有的 all json ，再下载到数据库中
 */
router.get('/flushalljson', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    flushalljson();
});
/**
 * 根据 adcode  下载 full json，并保存到数据库
 * @param adcode
 */
var saveFullJson_sigle = function (adcode) {
    try {
        superagent
            .get(basicurl + adcode + "_full.json")
            .set('connection', 'keep-alive')
            .set('Accept', 'application/json')
            .then(res => {
                //console.log(res);
                if (res) {
                    let full = JSON.parse(res.text);
                    datavdb.savePo("full", {adcode:adcode +"",full:full}, (err, res) => {
                        //console.log(res)
                    });
                }
            });
    } catch (e) {
        console.log(adcode);
    }
};


var flushFullJson = function () {
    let i =0;
    datavdb.findPoBySql("all", {}, (err, res) => {
        datavdb.deletePoBySQL("full", {}, (err1, res1) => {
            for (let all of res) {

                if ((all.adcode + "").endsWith('00')) {
                    try {
                        console.log(++i);
                       // console.log(res.indexOf(all), all.adcode);
                        saveFullJson_sigle(all.adcode);
                    } catch (e) {
                        console.log(all.adcode);
                    }

                }
            }
        });

    });
};

/**
 * 先删除 数据库中的full，再重新下载到数据库
 */
router.get('/flushfulljson', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    flushFullJson();
});

/**
 *根据 adcode 查找 fulljson  如果 没有 adcode，那么查找所有的
 * http://localhost:3333/datav/findfulljson?adcode=654300
 */
router.get('/findfulljson', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let sql= {};
    let adcode = req.query.adcode;
    if(adcode){
        sql = {adcode:adcode};
    }
    datavdb.findPoBySql("data",sql,(err,result)=>{
        res.send({status:0,message:"成功",full:result}) ;
    });

});



module.exports = router;
