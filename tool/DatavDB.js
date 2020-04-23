const MongoClient = require('mongodb').MongoClient;
const f = require('util').format;
const assert = require('assert');
const fs = require('fs')
var http = require('http');
var qs = require('querystring');
var FormData = require('form-data');


// Connection URL



var ObjectID = require('mongodb').ObjectID;
var mydb;

//mongodb 数据库 没有账号密码的连接
const url = "mongodb://localhost:27017/";
MongoClient.connect(url,(err, client) => {
    try {
        // assert.equal(null, err);
        console.log("Connected correctly to server");
        mydb = client.db('datav');
        //console.log(mydb);
    }
    catch(err){
        console.log(err);
        console.log("未连接数据库")}

});
/* mongodb 数据库有账号密码的连接
const url = "mongodb://yb123:yb123@120.79.177.94:27017/?authSource=datav";
// Use connect method to connect to the Server
MongoClient.connect(url,(err, client) => {
    try {
        // assert.equal(null, err);
        console.log("Connected correctly to server");
        db = client.db('datav');
        console.log(datavdb);

    }
    catch(err){
        console.log(err);
        console.log("未连接数据库")}

});*/
/**
 * 保存单个 po
 * @param table
 * @param po
 * @param callback
 */
var savePo = function (table,po,callback) {
    mydb.collection(table).insertOne(po, function(err, res) {
        callback(err,res);
    });
};
exports.savePo = savePo;

/**
 * 保存多个对象
 * @param table
 * @param pos
 * @param callback
 */
function savePoMany(table,pos,callback){
    mydb.collection(table).insertMany(pos, function(err, res) {

        callback(err,res);
    });
}
exports.savePoMany = savePoMany;

/**
 * 查找所有对象
 * @param table
 * @param sql
 * @param callback
 */
var findPoBySql = function (table,sql,callback) {

    mydb.collection(table).find(sql).toArray(function(err, result) { // 返回集合中所有数据
        callback(err,result);
    });
};
exports.findPoBySql = findPoBySql;

/**
 * 根据sql 删除 对象
 * @param table
 * @param sql
 * @param callback
 */
var deletePoBySQL =function (table,sql,callback) {
    mydb.collection(table).deleteMany(sql, function(err, obj) {
        callback(err,obj);
    });
};
exports.deletePoBySQL = deletePoBySQL;



exports.mydb = mydb;