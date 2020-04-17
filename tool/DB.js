const MongoClient = require('mongodb').MongoClient;
const f = require('util').format;
const assert = require('assert');
const fs = require('fs')
var http = require('http');
var qs = require('querystring');
var FormData = require('form-data');

var date = require('../public/javascripts/date.js');
const user = encodeURIComponent('mikumiku520');
const password = encodeURIComponent('mxy19901012');
const authMechanism = 'DEFAULT';
// Connection URL



var ObjectID = require('mongodb').ObjectID;
var mydb;
const url = "mongodb://yb123:yb123@120.79.177.94:27017/?authSource=yb";
// Use connect method to connect to the Server
MongoClient.connect(url,(err, client) => {
    try {
       // assert.equal(null, err);
        console.log("Connected correctly to server");

       mydb = client.db('yb');
       console.log(mydb);

    }
    catch(err){
        console.log(err);
        console.log("未连接数据库")}

});


/*const url = "mongodb://localhost:27017/";
MongoClient.connect(url,(err, client) => {
    try {
        // assert.equal(null, err);
        console.log("Connected correctly to server");
        mydb = client.db('yb')
        console.log(mydb);
    }
    catch(err){
        console.log(err);
        console.log("未连接数据库")}

});*/
exports.mydb = mydb;

//查找基本提成方案
var findBaseicPercentages= function(callback){

    const collection = mydb.collection('baseicPercentages');

    //先看数据库有无当账号
    collection.find().toArray(function(err, result) { // 返回集合中所有数据
        callback(err,result);

    });
};
exports.findBaseicPercentages = findBaseicPercentages;
//添加基本的提成方案
var addBaseicPercentages= function (callback) {
    var baseicPercentages =  [
        {
            name:'预计提成奖励A型',
            input:110,
            output:0,//临时使用的结果
            validrate:40,//有效比例
            validratefee:0,//有效金额
            interval:0,
            rate:0,
            percentagerate:0,//提成比例
            percentageresult:0,//提成结果
            salarylist: [
                {"interval": 10, "rate": 300,value:0},
                {"interval": 50, "rate": 0.05,value:0},
                {"interval": 100, "rate": 0.049,value:0},
                {"interval": 200, "rate": 0.048,value:0}
            ],
        },
        {
            name:'预计提成奖励B型',
            input:110,
            output:0,//临时使用的结果
            validrate:40,//有效比例
            validratefee:0,//有效金额
            interval:0,
            rate:0,
            percentagerate:0,//提成比例
            percentageresult:0,//提成结果
            salarylist: [
                {"interval": 10, "rate": 300,value:0},
                {"interval": 50, "rate": 0.05,value:0},
                {"interval": 100, "rate": 0.049,value:0},
                {"interval": 200, "rate": 0.048,value:0}
            ],
        },
        {
            name:'预计提成奖励C型',
            input:110,
            output:0,//临时使用的结果
            validrate:40,//有效比例
            validratefee:0,//有效金额
            interval:0,
            rate:0,
            percentagerate:0,//提成比例
            percentageresult:0,//提成结果
            salarylist: [
                {"interval": 10, "rate": 300,value:0},
                {"interval": 50, "rate": 0.05,value:0},
                {"interval": 100, "rate": 0.049,value:0},
                {"interval": 200, "rate": 0.048,value:0}
            ],
        },
    ];
    mydb.collection("baseicPercentages").insertMany(baseicPercentages, function(err, res) {
        if (err) throw err;
        console.log("插入的文档数量为: " + res.insertedCount);
    });
    callback(baseicPercentages);
};
exports.addBaseicPercentages = addBaseicPercentages;
//保存修改了的提成方案
var saveBaseicPercentages=function (baseicpercentage,callback) {
    baseicpercentage._id =  ObjectID(baseicpercentage._id);
    var updateStr = {$set:baseicpercentage};
    mydb.collection("baseicPercentages").updateOne({_id: ObjectID(baseicpercentage._id)}, updateStr,function(err, res) {
        callback(err,res);
    });
};
exports.saveBaseicPercentages = saveBaseicPercentages;
//添加项目
var addproject = function (project,callback) {
    mydb.collection("avalibleprojects").insertOne(project, function(err, res) {
        callback(err,res);
    });
};
exports.addproject = addproject;
//根据sql 语句 查找对象
var findProjectsBySql = function (sql,callback) {

    mydb.collection("avalibleprojects").find(sql).toArray(function(err, result) { // 返回集合中所有数据

        callback(err,result);
    });
};
exports.findProjectsBySql = findProjectsBySql;
//保存编辑器好的对象
var saveEditProject= function (project,callback) {
    //console.log(project);
    project._id =  ObjectID(project._id);
    var updateStr = {$set:project};
    mydb.collection("avalibleprojects").updateOne({_id: ObjectID(project._id)}, updateStr,function(err, res) {
        callback(err,res);
    });
};
exports.saveEditProject = saveEditProject;
//根据 po 查找符合要求的对象
var searchProjectByPo= function (po,callback) {
    //console.log(project);
    let sql ={
        "projectname":{ $regex: po.projectname },
        "projectid":{ $regex: po.projectid },
        "projectcantractid":{ $regex: po.projectcantractid }
    };
    mydb.collection("avalibleprojects").find(sql).toArray(function(err, result) { // 返回集合中所有数据
        callback(err,result);
    });
};

exports.searchProjectByPo = searchProjectByPo;



//查找：项目提交报告
var findProjectReportBySql = function (sql,callback) {
    mydb.collection("projectreports").find(sql).toArray(function(err, result) { // 返回集合中所有数据
        callback(err,result);
    });
};
exports.findProjectReportBySql = findProjectReportBySql;

//查询提交报告时间
var findSubmitReportDate = function (sql,callback) {
    mydb.collection("submitreportdates").find(sql).toArray(function(err, array) { // 返回集合中所有数据
        callback(err,array);
    });
};
exports.findSubmitReportDate = findSubmitReportDate;

//修改 日期报告对象
var updateSubmitReportDate= function (submitreportdate,callback) {
    //console.log(project);
    submitreportdate._id =  ObjectID(submitreportdate._id);
    var updateStr = {$set:submitreportdate};
    mydb.collection("submitreportdates").updateOne({_id: ObjectID(submitreportdate._id)}, updateStr,function(err, res) {
        callback(err,res);
    });
};
exports.updateSubmitReportDate = updateSubmitReportDate;



//保存  日期报告对象
var saveSubmitReportDate= function (submitreportdate,callback) {
    mydb.collection("submitreportdates").insertOne(submitreportdate, function(err, res) {
        callback(err,res)
    });
};
exports.saveSubmitReportDate = saveSubmitReportDate;


//查找所有对象
var findPoBySql = function (table,sql,callback) {

    mydb.collection(table).find(sql).toArray(function(err, result) { // 返回集合中所有数据
        callback(err,result);
    });
};
exports.findPoBySql = findPoBySql;

//修改 对象
var updatePoByID= function (table,po,callback) {
    //console.log(project);
    po._id =  ObjectID(po._id);
    var updateStr = {$set:po};
    mydb.collection(table).updateOne({_id: ObjectID(po._id)}, updateStr,function(err, res) {
        callback(err,res);
    });
};
exports.updatePoByID = updatePoByID;
//保存 对象
var savePo = function (table,po,callback) {
    mydb.collection(table).insertOne(po, function(err, res) {
        callback(err,res);
    });
};
exports.savePo = savePo;

//删除对象 根据对象 _id
var deletePoByPoID = function (table,po,callback) {
    mydb.collection(table).deleteOne({_id: ObjectID(po._id)}, function(err, obj) {
        callback(err,obj);
    });
};
exports.deletePoByPoID = deletePoByPoID;


var deletePoByID = function (table,_id,callback) {
    mydb.collection(table).deleteOne({_id: ObjectID(_id)}, function(err, obj) {
        callback(err,obj);
    });
};
exports.deletePoByID = deletePoByID;

//根据sql 删除 对象
var deletePoBySQL =function (table,sql,callback) {
    mydb.collection(table).deleteMany(sql, function(err, obj) {
        callback(err,obj);
    });
};
exports.deletePoBySQL = deletePoBySQL;

//锁定项目控件
var lockproject =function(project){
    if(project.percentagepaysteponeispay){
        project.percentagepaysteponelock = true;
    }else{
        project.percentagepaysteponelock = false
    }
    if(project.percentagepaystepthreeispay){
        project.percentagepaystepthreelock = true;
    }else{
        project.percentagepaystepthreelock = false;
    }
    if(project.fundpaysteponeispay){
        project.fundpaysteponelock = true;
    }else{
        project.fundpaysteponelock = false;
    }
    if(project.fundpaystepthreeispay){
        project.fundpaystepthreelock = true;
    }else{
        project.fundpaystepthreelock = false;
    }
    //提成 和分红 解锁
    for(let collectionrecord of project.collectionrecords){
        if(collectionrecord.percentagepayispay){
            collectionrecord.percentagecollectionlock = true;
        }else {
            collectionrecord.percentagecollectionlock = false;
        }
        if(collectionrecord.fundispay){
            collectionrecord.fundcollectionlock = true;
        }else {
            collectionrecord.fundcollectionlock = false;
        }
    }
};
exports.lockproject = lockproject;
//保存多个对象
function savePoMany(table,pos,callback){
    mydb.collection(table).insertMany(pos, function(err, res) {
        console.log(err,res)
       callback(err,res);
    });
}
exports.savePoMany = savePoMany;

