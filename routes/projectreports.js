var express = require('express');
var multer = require("multer");
var fs = require('fs');
let join = require('path').join;
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var db = require('../tool/DB.js')

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


let submitdate = null;

router.get('/getsubmitdate', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    if (submitdate == null) {
        res.send({
            status: 0,
            message: "成功",
            submitdate: {year: new Date().getFullYear(), month: new Date().getMonth() + 1}
        });
    } else {
        res.send({status: 0, message: "成功", submitdate: submitdate});
    }
});
let t1 = null;

//定时清空 submitdate,然后便可获取当月日期
function startSubmitdate(submitreportdate) {

    if (t1 != null && submitdate != null) {

        clearInterval(t1);
    }
    submitdate = submitreportdate;
    let tt = setTimeout(function () {
        submitdate = null
    }, 1000 * 60*60*24);
    t1 = tt;
}


//保存提交报告日期
router.post('/savesubmitreportdate', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象

    let submitreportdate = JSON.parse(req.body.submitreportdate);

    startSubmitdate(submitreportdate);
    res.send({status: 0, message: "成功"});
});


//根据项目id 查询报告
router.post('/findprojectreportsbyid', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let projectid = req.body.projectid;

    db.findProjectReportBySql({projectid: projectid}, function (err, array) {

        if (!err) {
            if (array.length === 1) {

                res.send({status: 0, message: "成功", report: array[0]});
            } else {
                res.send({status: 0, message: "成功", report: {reportarray: []}});
            }
        } else {
            res.send({status: 1, message: "失败", err: err});
        }
    });
});
router.get('/findprojectreportsbyid', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let projectid = req.query.projectid;

    db.findProjectReportBySql({projectid: projectid}, function (err, array) {

        if (!err) {
            if (array.length === 1) {
                //console.log(array[0]);
                res.send({status: 0, message: "成功", report: array[0]});
            } else {
                res.send({status: 0, message: "成功", report: {reportarray: []}});
            }
        } else {
            res.send({status: 1, message: "失败", err: err});
        }
    });
});
//根据日期查找报告
router.post('/findprojectreportbysubmitdate', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let submitdate = JSON.parse(req.body.submitdate);
    let year = submitdate.year;
    let month = submitdate.month;

    db.findPoBySql("projectreports", {}, function (err, array) {
        let reports = [];
        for (let report of array) {
            for (let i in report.reportarray) {
                let re = report.reportarray[i];
                if (re.submitdate.year == year && re.submitdate.month == month) {

                    if (i == 0) {
                        reports.push({lastmonthreport: null, monthreport: re});
                    } else {

                        reports.push({lastmonthreport: report.reportarray[i - 1], monthreport: re});
                    }
                }
            }
        }
        res.send({status: 0, message: "成功", reports: reports});
    });
});


//保存 报告
router.post('/saveprojectreport', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let data = JSON.parse(req.body.projectreport);
    //项目设定为 提交报告
    let project = data.project;
    let submitdate = data.submitdate;
    let projectid = project._id.toString();
    db.findProjectReportBySql({projectid: projectid}, function (err, reports) {
        if (err) {
            res.send({status: 1, message: "失败", err: err});
        } else {
            if (reports.length === 0) {
                //添加到数据库中
                //提交报告也要保存
                project.issubmitreport = true;
                db.lockproject(project);
                let report = {projectid: projectid, reportarray: [{submitdate: submitdate, project: project}]};

                db.savePo("projectreports", report, function (err, result) {
                    if (!err) {
                        db.saveEditProject(project, function (err, result) {

                            res.send({status: 0, message: "成功", project: project});
                        });
                    } else {
                        res.send({status: 1, message: "失败", err: err});
                    }
                });
            } else {
                //先检查当月是否已经提交
                let flag = true;
                for (let report of reports[0].reportarray) {
                    //如果 年 月 都相同，代表已经提交过了
                    if (report.submitdate.year == submitdate.year && report.submitdate.month == submitdate.month) {
                        flag = false;
                        res.send({status: 1, message: "已经提交过此月的报告了，请先退回再提交", err: err});
                        return;
                    }
                }
                if (flag) {
                    //项目累加到数组中
                    let savesuucess = true;
                    //按照年月 顺序添加到数据库中
                    let index;
                    let lastproject;
                    for (let report of reports[0].reportarray) {
                        if (report.submitdate.year >= submitdate.year && report.submitdate.month > submitdate.month) {
                            lastproject = report.project;
                            index = reports[0].reportarray.indexOf(report);
                            savesuucess = false;
                            res.send({status: 1, message: "提交的报告月份不能提前！！！"});
                            return;
                            break;
                        }
                    }
                    if (savesuucess) {
                        lastproject = reports[0].reportarray[reports[0].reportarray.length - 1].project;
                    }
                    //console.log(JSON.stringify(lastproject));
                    //console.log(JSON.stringify(project));
                    if (JSON.stringify(lastproject) == JSON.stringify(project)) {

                        res.send({status: 1, message: "与上个月提交比较没有变化，不能保存"});
                        return;
                    } else {
                        if (savesuucess) {
                            reports[0].reportarray.push({submitdate: submitdate, project: project})
                        } else {
                            reports[0].reportarray.splice(index, 0, {submitdate: submitdate, project: project});
                        }
                    }
                    //修改对象
                    project.issubmitreport = true;
                    db.lockproject(project);
                    db.updatePoByID("projectreports", reports[0], function (err, result) {
                        if (!err) {
                            //提交报告也要保存
                            db.saveEditProject(project, function (err, result) {
                                res.send({status: 3, message: "累加成功", project: project});
                            });
                        } else {
                            res.send({status: 1, message: "失败", err: err});
                        }
                    });
                }
            }
        }
    });
});
//删除报告
router.post('/deletereportbyreport', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let report = JSON.parse(req.body.report);
    let submitdate = report.submitdate;

    let sql = {projectid: report.project._id.toString()};
    db.findPoBySql("projectreports", sql, function (err, array) {
        let reports = [];
        let index = -1;
        if (!array[0].reportarray) {
            res.send({status: 1, message: "失败"});
        }
        for (let i in array[0].reportarray) {
            let re = array[0].reportarray[i];
            if (re.submitdate.year == submitdate.year && re.submitdate.month == submitdate.month) {
                //删除这对象
                index = i;
                break;
            }
        }
        if (index >= 0) {
            array[0].reportarray.splice(index, 1);
            //如果没有项目了就直接删除
            if (array[0].reportarray.length === 0) {//没有报告情况
                db.deletePoByPoID("projectreports", array[0], function (err, result) {
                    db.findPoBySql("avalibleprojects", {_id: ObjectID(report.project._id)}, function (err, result) {
                        let project = result[0];//所有的报告都不存在
                        project.percentagepaysteponelock = false;
                        project.percentagepaystepthreelock = false;
                        project.fundpaysteponelock = false;
                        project.fundpaystepthreelock = false;
                        project.issubmitreport = false;//没有提交任何报告
                        //提成 和分红 解锁
                        for (let collectionrecord of project.collectionrecords) {
                            collectionrecord.percentagecollectionlock = false;
                            collectionrecord.fundcollectionlock = false;
                        }
                        db.saveEditProject(project, function (err, result) {
                            res.send({status: 0, message: "成功", project: project});
                        })
                    });
                });
            } else {

                //还有报告的情况，查看最后一个报告是什么情况
                db.updatePoByID("projectreports", array[0], function (err, result) {

                    db.findPoBySql("avalibleprojects", {_id: ObjectID(report.project._id)}, function (err, result) {
                        //let aa = array[0].reportarray[array[0].reportarray.length-1].project;
                        //console.log(111,array[0].reportarray[array[0].reportarray.length-1].project.percentagepaysteponelock);
                        //根据上一个报告是否解除文档
                        let finalreportproject = array[0].reportarray[array[0].reportarray.length - 1].project;
                        let project = result[0];
                        project.percentagepaysteponelock = finalreportproject.percentagepaysteponelock;
                        project.percentagepaystepthreelock = finalreportproject.percentagepaystepthreelock;
                        project.fundpaysteponelock = finalreportproject.fundpaysteponelock;
                        project.fundpaystepthreelock = finalreportproject.fundpaystepthreelock;

                        //因为 收款提成不能被删除，能够 行对行，所以可以按照以前 数据来设定 flag

                        for (let i in project.collectionrecords) {
                            let co = project.collectionrecords[i];
                            let finalCo = finalreportproject.collectionrecords[i];

                            if (finalCo) {
                                co.percentagecollectionlock = finalCo.percentagecollectionlock;
                                co.fundcollectionlock = finalCo.fundcollectionlock;
                            } else {
                                co.percentagecollectionlock = false;
                                co.fundcollectionlock = false;
                            }

                        }

                        db.saveEditProject(project, function (err, result) {
                            res.send({status: 0, message: "成功", project: project});
                        })
                    });
                });
            }
        }
        //res.send({status: 1, message: "没有找到对象"});
    });
});
module.exports = router;