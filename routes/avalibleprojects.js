var express = require('express');

var fs = require('fs');
let join = require('path').join;
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var db = require('../tool/DB.js')
var multer = require("multer");
var tool = require('../tool/tool');
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

//通过id 删除 基本方案提成表
router.get('/deletebaseicpercentagebyid', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //查找数据库，如果没有，就新建三个对象
    db.deletePoByID("baseicPercentages", req.query._id, function (err, result) {
        res.send({status: 0, message: "成功"});
    })
});

router.get('/baseicpercentages', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //查找数据库，如果没有，就新建三个对象

    db.findBaseicPercentages(function (err, array) {

        if (err) {
            res.send({status: 1, message: "失败"});
        } else {

            if (array.length === 0) {
                db.addBaseicPercentages(function (newArray) {
                    res.send({status: 0, message: "数据没有，新建三个", baseicpercentages: newArray});
                });
            } else {
                res.send({status: 0, message: "成功", baseicpercentages: array});
            }
        }
    });

});

//保存基本的 提成方案
router.post('/savebaseicpercentage', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let baseicpercentage = JSON.parse(req.body.baseicpercentage);
    //如果id为 null 就保存，否则修改

    if (!baseicpercentage._id) {
        db.savePo("baseicPercentages", baseicpercentage, function (err, result) {
            if (err) {
                res.send({status: 1, message: "失败", err: err});
            } else {
                res.send({status: 0, message: "添加成功"});
            }
        })
    } else {
        //console.log(baseicpercentage);
        db.updatePoByID("baseicPercentages", baseicpercentage, function (err, result) {
            if (err) {
                res.send({status: 1, message: "失败", err: err});
            } else {
                res.send({status: 0, message: "修改成功"});
            }

        });
    }


});
//添加项目
router.post('/addproject', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    if (!req.body.project) {

        res.send({status: 1, message: "失败"});
        return;
    }
    let project = JSON.parse(req.body.project);

    //用id查找，如果没有，就添加，如果 项目名字 projectname，项目id  projectid， 合同id  projectcantractid，重复就不添加
    let sql = {$or: [{"projectname": project.projectname}, {"projectid": project.projectid.trim()}, {"projectcantractid": project.projectcantractid.trim()}]};

    db.findProjectsBySql(sql, function (err, projects) {
        if (projects.length !== 0) {
            res.send({status: 1, message: "已经存在此对象，添加失败"});
        } else {
            db.addproject(project, function (err, result) {
                if (err) {
                    res.send({status: 1, message: "失败", err: err});
                } else {
                    res.send({status: 0, message: "添加成功"});
                }
            });

        }
    });

});
router.get('/getprojectsall', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //查找数据库，所有的项目对象
    db.findProjectsBySql({}, function (err, array) {
        if (err) {
            res.send({status: 1, message: "失败",});
        } else {
            res.send({status: 0, message: "成功", projects: array});
        }
    });

});
//保存 修改了的 项目
router.post('/saveproject', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let project = JSON.parse(req.body.project);
    //用id查找，如果没有，就添加，如果 项目名字 projectname，项目id  projectid， 合同id  projectcantractid，重复就不添加
    db.saveEditProject(project, function (err, result) {
        if (err) {
            res.send({status: 1, message: "没有找到此对象，修改失败", err: err});

        } else {
            res.send({status: 0, message: "修改成功"});
        }
    });
});
//根据id 查找对象
router.post('/findprojectbyid', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let id = req.body._id;
    db.findPoBySql("avalibleprojects", {_id: ObjectID(id.toString())}, function (err, result) {
        if (err) {
            res.send({status: 1, message: "失败", err: err});
        } else {
            if (result.length > 0) {
                res.send({status: 0, message: "成功", project: result[0]});
            } else {
                res.send({status: 1, message: "没有这个_id对象：" + id, err: err});
            }

        }
    });
});

function projectSum(list, method) {
    let sum = 0;
    for (let i =0; i < list.length;i++) {
        let po = list[i];
        sum = sum*1 + ( tool.moneySymbol(po[method],false)  * 1);
        //console.log(i,sum);
    }
    return sum;
}

function getlimtarray(array, serarchpo) {
    let results = [];

    for (let i = (serarchpo.pageindex - 1) * serarchpo.limit * 1; i < serarchpo.pageindex * serarchpo.limit * 1; i++) {
        if (i >= array.length) {
            break;
        }
        results.push(array[i]);
    }
    let sumpo = {
        projectname: "合计",
        projectid: "/",
        projectcantractid: "/",
        contrafacevalue: projectSum(array, "contrafacevalue"),
        amountcollectedtotal: projectSum(array, "amountcollectedtotal"),
        percentagetotal: projectSum(array, "percentagetotal"),
        percentagepaysum: projectSum(array, "percentagepaysum"),
        percentagenotpaysum: projectSum(array, "percentagenotpaysum"),
        fundpay: projectSum(array, "fundpay"),
        fundpaysum: projectSum(array, "fundpaysum"),
        fundnotpaysum: projectSum(array, "fundnotpaysum"),
    };
    results.unshift(sumpo);
    return results;
}

router.get('/findprojectbyid', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let id = req.query._id;
    db.findPoBySql("avalibleprojects", {_id: ObjectID(id.toString())}, function (err, result) {
        if (err) {
            res.send({status: 1, message: "失败", err: err});
        } else {
            if (result.length > 0) {
                res.send({status: 0, message: "成功", project: result[0]});
            } else {
                res.send({status: 1, message: "没有这个_id对象：" + id, err: err});
            }

        }
    });
});
//根据对象 查找符合要求的 对象
router.post('/searchProjectByPo', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let po = JSON.parse(req.body.po);
    let starttime = po.starttime;
    let endtime = po.endtime;
    if (starttime || endtime) {
        if (!starttime) {
            starttime = new Date("1970-01-01");
        } else {
            starttime = new Date(starttime);
            starttime.setDate(1);
        }
        if (!endtime) {
            endtime = new Date("3000-01-01");
        } else {
            endtime = new Date(endtime);
            endtime.setDate(27);
        }
        db.findPoBySql("projectreports", {}, function (err, array) {
            let idarray = [];
            for (let report of array) {

                for (let re of report.reportarray) {
                    //console.log(2,re);
                    //console.log(0,starttime,endtime,re.submitdate);
                    let date = new Date(re.submitdate.year + "-" + (re.submitdate.month) + "-1");
                    date.setDate(16);
                    //console.log(1,starttime,endtime,date);

                    if (starttime.getTime() <= date.getTime() && date.getTime() <= endtime.getTime()) {
                        idarray.push({"projectid": report.projectid.toString()});
                    }
                }
            }
            if (idarray.length === 0) {
                res.send({status: 0, message: "成功", projects: []});
                return;
            }
            //console.log(1,idarray);
            let idsql = {};
            if (idarray.length > 0) {
                idsql = {$or: idarray};
            }
            let result = [];
            db.findPoBySql("projectreports", idsql, function (err, reports) {
                db.searchProjectByPo(po, function (err, projects) {
                    for (let report of reports) {
                        for (let project of projects) {
                            //两边id 相同就相加
                            if (report.projectid.toString() == project._id.toString()) {
                                result.push(project);
                                break;
                            }
                        }
                    }

                    res.send({status: 0, message: "成功", projects: getlimtarray(result, po), total: result.length});
                });

            });


        });
    } else {
        db.searchProjectByPo(po, function (err, projects) {

            res.send({status: 0, message: "成功", projects: getlimtarray(projects, po), total: projects.length});
        })
    }

});


//根据 _id 删除项目
router.get('/deleteproject', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let _id = req.query._id;
    db.deletePoByID("avalibleprojects", _id, (err, result) => {
        //删除所有报告
        db.deletePoBySQL("projectreports", {"projectid": _id}, (err2, result2) => {
            res.send({status: 0, message: "成功", result: result2});
        });
    });

});

//得到初始的项目 有 _id 值
function getBasicProject() {
    return {
        user: {},
        xietongproject: {},
        issubmitreport: false,
        projectid: '',//合同编号
        projectcantractid: '',//合同编号
        projectname: '',//项目名称
        contrafacevalue: '',//主合同金额
        validrate: 100,/*有效比例，*/  validratefee: 0,/*有效金额，*/
        preparefeefix: 1,/*前期固定比例*/ preparefeefixfee: 0,/*前期固定金额*/
        preparefeereal: 0,/*前期（实际）*/
        prepareover: 0,/*前期费（超额）*/
        workingfeerate: 10,/*工作经费比率*/ workingfee: 0,/*工作金额值*/

        percentages: [],//预计提成奖励A型,预计提成奖励B型,预计提成奖励C型

        cooperationbudget: 0,//预算A,
        //projectid: fundproject.projectid,//固开支A、固开支B、固开支C、固开支D
        hezuoyusuanA: 0,//合作预算A
        baseexpences: [//固开支
            {name: "税务成本（增值税、附加税）", rate: 5, value: 0},
            {name: "市场拓展部公摊（失败项目、办公位、设备消耗、材料费等）", rate: 1, value: 0},
            {name: "经营中心公摊", rate: 3, value: 0},
            {name: "软件中心公摊", rate: 1, value: 0},
        ],//固开支
        percentagetotal: 0,//总提成
        avalibleshare: 0,//分红利润
        benifitrate: 0,//毛利率
        fundrate: 7,/*分红比例*/ fundpay: 0,//分红金额，总分红
        percentagepaysteponerate: 40,/*提成_合同签订当月*/ percentagepaysteponeratevalue: 0,//金额
        percentagepaysteponeratevaluearray: [],//提成签订合同详细金额
        percentagepaysteponeispay: false,//是否发放签订提成
        percentagepaysteponeispaydate: null,//发放签订提成日期
        percentagepaysteptworate: 40,/*提成_收款绑定*/percentagepaysteptworatevalue: 0,//金额
        percentagepaysteptworatevaluearray: [],//提成收款绑定详细金额
        percentagepaystepthreerate: 20,/*提成_年终*/percentagepaystepthreeratevalue: 0,//金额
        percentagepaystepthreeratevaluearray: [],//提成年终详细金额
        percentagepaystepthreeispay: false,//是否发放年终提成
        percentagepaystepthreeispaydate: null,//发放年终提成日期
        percentagepaysum: 0,//已支付项目提成
        percentagenotpaysum: 0,//未支付的项目提成

        percentagepaysteponelock: false,//提成签订锁定
        percentagepaystepthreelock: false,//提成年终锁定
        fundpaysteponelock: false,//分红签订锁定
        fundpaystepthreelock: false,//分红年终锁定

        fundpaysteponerate: 40,/*分红_合同签订当月*/fundpaysteponeratevalue: 0,//金额
        fundpaysteponeispay: false,//是否发放签订分红
        fundpaysteponeispaydate: null,//发放签订分红日期
        fundpaysteptworate: 40,/*分红_收款绑定*/fundpaysteptworatevalue: 0,//金额
        fundpaystepthreerate: 20,/*分红_年终*/fundpaystepthreeratevalue: 0,//金额
        fundpaystepthreeispay: false,//是否发放年终分红
        fundpaystepthreeispaydate: null,//发放年终分红日期
        fundpaysum: 0,//已支付项目分红
        fundnotpaysum: 0,//未支付的项目分红
        //收款金额
        collectionrecords: [
            /*{
              amountdate: null,//收款日期
              amountcollected: 0,//收款金额
              percentagepayispay: false,//提成是还发放
              percentagevalue: 0,//提成金额
              percentagepayvalueArray: [],//提成详细情况 只有值
              percentagepaydate: null,//提成发放日期
              percentagecollectionlock: false,//提成锁
              fundispay: false,//分红是还发放
              fundpaydate: null,//分红发放日期
              fundvalue: 0,//分红金额
              fundcollectionlock: false,//分红锁
            },*/
        ],
        amountcollectedtotal: 0,//收款总额
    };
    this.computedAvaliblepo();
};
//得到初始化项目
router.get('/getbasicproject', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let tablename = "basicproject";
    db.findPoBySql(tablename, {}, (err, result) => {
        if (result.length === 0) {//如果没有，添加个初始化的项目
            let basicproject = getBasicProject();
            db.savePo(tablename, basicproject, (err2, result2) => {
                res.send({status: 0, message: "成功", project: basicproject});
            })
        } else {
            res.send({status: 0, message: "成功", project: result[0]});
        }
    });

});


router.post('/savebasicproject', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let basicproject = JSON.parse(req.body.po);
    db.updatePoByID("basicproject", basicproject, (err, result) => {
        res.send({status: 0, message: "成功"});
    });
});
//得到创建项目时需要的对象，没有 _id值
router.get('/getcreatebasicproject', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let tablename = "basicproject";
    db.findPoBySql(tablename, {}, (err, result) => {
        if (result.length === 0) {
            let basicproject = getBasicProject();
            db.savePo(tablename, basicproject, (err2, result2) => {
                delete basicproject._id;
                res.send({status: 0, message: "成功", project: basicproject});
            })
        } else {
            delete result[0]._id;
            res.send({status: 0, message: "成功", project: result[0]});
        }

    });
});

module.exports = router;