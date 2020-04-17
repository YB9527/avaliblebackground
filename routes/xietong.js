var express = require('express');
var JSESSIONIDValue = "24678AE11CC3CCE71D75812BAD1C51BF";
var XieTongUrl = "http://188028ii39.iask.in/";
var XieTongHost = "188028ii39.iask.in";
var fs = require('fs');
let join = require('path').join;
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var db = require('../tool/DB.js');
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
const superagent = require('superagent');
//协同连接

var linkxietong = function (tip) {
    superagent
        .get(XieTongUrl + "seeyon/getAJAXMessageServlet?V=0.23735389850776678")
        .set('Cookie', 'JSESSIONID=' + JSESSIONIDValue + '; loginPageURL=; login_locale=zh_CN; avatarImageUrl=-1079369039802711505')
        .set('connection', 'keep-alive')
        .set('Accept', 'application/json')
        .then(res => {
            console.log(res.text, tip)
        });
};


//协同定时链接，保证cookie不断
var startxietong = function () {
    linkxietong("协同链接访问开始");
    let loni = 0;
    var t2 = setInterval(function () {
        ++loni;
        linkxietong("协同链接访：" + (loni * 5) + " 分钟");
    }, 1000 * 60 * 5)
};
startxietong();


//项目请求
var getprojects2 = function (po, callback) {

    let sql = '[{"page":' + po.pageindex + ',"size":' + po.limit + '},{';
    if (po.projectid) {
        sql = sql + '"field0003":"' + po.projectid.trim() + '",';
    }
    if (po.projectcantractid) {
        sql = sql + '"field0004":"' + po.projectcantractid.trim() + '",';
    }
    if (po.projectname) {
        sql = sql + '"field0020":"' + po.projectname.trim() + '",';
    }
    sql = sql + '"formId":"-4512940695124425835","formTemplateId":"-4092910636409141342","queryType":"baseSearch"}]';

    superagent
        .post(XieTongUrl + 'seeyon/ajax.do?method=ajaxAction&managerName=formDataManager&rnd=78833')
        .type('form')
        .send({managerMethod: 'getFormMasterDataList', arguments: sql})
        .set('Cookie', 'JSESSIONID=' + JSESSIONIDValue + '; loginPageURL=; login_locale=zh_CN; avatarImageUrl=-1079369039802711505')
        .then(res => {
            let result = JSON.parse(res.text);
            //let projects = result.data;
            //console.log(result);
            callback(result);

        });
};
var exchangeProject = function (project) {
    //console.log(1)
    //console.log(project["field0010"].replace(/,/g,""));
    let reg = /,/g;

    return {
        projectid: project["field0003"],//项目id
        projectcantractid: project["field0004"],//合同id
        projectname: project["field0020"],//项目名称
        contrafacevalue: parseFloat(project["field0010"].replace(reg, "")),//合同金额
        totalreceivables: parseFloat(project["field0079"].replace(reg, "")),//收款总额
        totalpayment: parseFloat(project["field0080"].replace(reg, "")),//付款总额
        uncollectedamount: parseFloat(project["field0081"].replace(reg, "")),//未收款金额
        unpaidamount: parseFloat(project["field0082"].replace(reg, "")),//未付款金额
        firstparty: project["field0100"],//甲方
        createdate: project["field0019"],//生效日期
        id: project["id"]
    };
};

function compateDate(date1, date2) {
    var oDate1 = new Date(date1);
    var oDate2 = new Date(date2);
    if (oDate1.getTime() > oDate2.getTime()) {
        return true;
    } else {
        return false;
    }
}

router.post('/searchProjectByPo', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //保存对象
    let po = JSON.parse(req.body.po);

    getprojects2(po, result => {
        let projects = [];
        if (result.data) {
            for (let d of result.data) {

                if (d["field0004"] && d["field0004"].length === 9) {
                    let project = exchangeProject(d);
                    // project.createdate =new Date( Date.parse(project.createdate));
                    /*if(result.data.indexOf(d) === 3){
                        project.createdate = new Date("2020-3-25");
                    }*/
                    projects.push(project);
                }
            }

            for (let i = 0; i < projects.length - 1; i++) {
                for (let j = 0; j < projects.length - 1 - i; j++) {
                    if (compateDate(projects[j + 1].createdate, projects[j].createdate)) {
                        let temp = projects[j];
                        projects[j] = projects[j + 1];
                        projects[j + 1] = temp;
                    }
                }
            }

            let custom = {total: result.total, projects: projects};
            res.send({status: 0, message: "成功", custom: custom});
        } else {
            res.send({status: 1, message: "失败", custom: null});
        }
    });
});

router.get('/lookproject', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    superagent
        .get(XieTongUrl + 'seeyon/content/content.do?isFullPage=false&_isModalDialog=false&moduleId=' + req.query.id + '&moduleType=37&rightId=166019245425182503.-4021251945143713249&contentType=20&viewState=2')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
        .set('Accept-Encoding', 'gzip, deflate')
        .set('Accept-Language', 'zh-CN,zh;q=0.9')
        .set('Cache-Control', 'max-age=0')
        .set('Connection', 'keep-alive')
        .set('Cookie', 'JSESSIONID=' + JSESSIONIDValue + '; login_locale=zh_CN; __guid=28068477.3950336734622592000.1582373183996.012; avatarImageUrl=-1079369039802711505; loginPageURL=; monitor_count=9')
        .set('Host', XieTongHost)
        .set('Upgrade-Insecure-Requests', '1')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
        .then(response => {
            // console.log(response.text);
            res.send({status: 0, message: "成功", html: response.text});
        });
});
//单个项目页面得到收款记录
var getshoukuan = function (html) {
    let records = [];
    if (!html || html.toString().length === 0) {
        return records;
    }
    let start = html.indexOf("<table xd:widgetIndex=\"0\" xd:CtrlId=\"CTRL112\" border=\"1\"");
    if (start === -1) {
        return records;
    }
    let stop = html.indexOf("</table>", start) + 8;
    let shoukuantable = html.substring(start, stop);
    let num1 = 0;
    let array = [];
    while ((num1 = shoukuantable.indexOf("</span></span>", num1 + 1)) !== -1) {
        let num2 = shoukuantable.lastIndexOf(">", num1);
        array.push(shoukuantable.substring(num2 + 1, num1));
    }

    for (let i = 0; i < array.length; i++) {
        let record = {
            id: array[i],
            contains: array[i + 1],
            date: array[i + 2],
            money: array[i + 3],
            log: array[i + 4],
        };
        i = i + 4;
        if (record.money) {
            //record.money = record.money.replace(/,/g, "")
        }
        if (record.money != undefined && (record.money != 0 || record.money != 0.00)) {
            // console.log("record.money",record.money);
            records.push(record);
        }

    }
    if (records.length > 1) {
        /*//最后的合计金额更正
        records[records.length - 1].money = records[records.length - 1].id;
        if (records[records.length - 1].money) {
            records[records.length - 1].money = records[records.length - 1].money.replace(/,/g, "");
        }
        records[records.length - 1].id = records[records.length];
        records[records.length - 1].log = "合计";*/
        //删除收款合计
        //records.splice(records.length-1,1);
    }
    return records;
};

//单个项目页面得到收款记录
var getprojecthtml = function (id, callback) {
    superagent
        .get(XieTongUrl + 'seeyon/content/content.do?isFullPage=false&_isModalDialog=false&moduleId=' + id + '&moduleType=37&rightId=166019245425182503.-4021251945143713249&contentType=20&viewState=2')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
        .set('Accept-Encoding', 'gzip, deflate')
        .set('Accept-Language', 'zh-CN,zh;q=0.9')
        .set('Cache-Control', 'max-age=0')
        .set('Connection', 'keep-alive')
        .set('Cookie', 'JSESSIONID=' + JSESSIONIDValue + '; login_locale=zh_CN; __guid=28068477.3950336734622592000.1582373183996.012; avatarImageUrl=-1079369039802711505; loginPageURL=; monitor_count=9')
        .set('Host', XieTongHost)
        .set('Upgrade-Insecure-Requests', '1')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
        .then(response => {
            //console.log(response);
            let html = response.text;
            callback(html);
        });
};

//设置cookie
router.get("/setcookie", function (req, res, nex) {
    res.header("Access-Control-Allow-Origin", "*");
    let getJSESSIONIDValue = req.query.JSESSIONIDValue;
    JSESSIONIDValue = getJSESSIONIDValue;
    res.send({status: 0, message: "成功"});
});

//前台得到的收款
router.get('/shoukuan', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let id = req.query.id;
    getprojecthtml(id, html => {
        let records = getshoukuan(html);
        res.send({status: 0, message: "成功", records: records});
    });
});
//计算收款时方法的金额
var computedamountcollected = function (avaliblepo, collectionrecord) {
    //计算提成详细
    {
        //先清空再添加
        collectionrecord.percentagepayvalueArray = [];
        collectionrecord.percentagevalue = 0;
        collectionrecord.fundvalue = 0;
        if (collectionrecord.amountcollected != 0) {
            //提成分发计算
            for (let percentage of avaliblepo.percentages) {
                let percentageresult = tool.moneySymbol(percentage.percentageresult, false);
                let result = (collectionrecord.amountcollected / avaliblepo.contrafacevalue * percentageresult).toFixed(2);
                collectionrecord.percentagepayvalueArray.push(result);
                collectionrecord.percentagevalue = collectionrecord.percentagevalue * 1 + result * 1;
            }
            //分红 分发计算
            collectionrecord.fundvalue = (collectionrecord.amountcollected / avaliblepo.contrafacevalue * avaliblepo.fundpay * avaliblepo.fundpaysteptworate / 100).toFixed(2);
        }
    }
};
var addXTRecord = function (xtrecord, avalibleproject) {

    let mydate = new Date(xtrecord.date);
    mydate.setMonth(mydate.getMonth() + 2);

    let collectionrecord = {
        amountdate: xtrecord.date,//收款日期
        amountcollected: tool.moneySymbol(xtrecord.money, false),//收款金额
        percentagepayispay: false,//提成是还发放
        percentagevalue: 0,//提成金额
        percentagepayvalueArray: [],//提成详细情况
        percentagepaydate: null,//提成发放日期
        percentagecollectionlock: false,//提成锁
        fundispay: false,//分红是还发放
        fundpaydate: null,//分红发放日期
        fundvalue: 0,//分红金额
        fundcollectionlock: false,//分红锁
    };
    collectionrecord.percentagepaydate = tool.monthFormat(mydate);
    collectionrecord.fundpaydate = tool.monthFormat(mydate);
    computedamountcollected(avalibleproject, collectionrecord);
    avalibleproject.collectionrecords.push(collectionrecord);
    db.updatePoByID("avalibleprojects", avalibleproject, (err, result) => {
        //console.log(avalibleproject.projectname + ", 更新收款一条");
    });

};
var compareRecord = function (xtrecord, avalibleproject) {
    let flag = true;
    let date = xtrecord.date;
    for (let record of avalibleproject.collectionrecords) {
        if (date === record.amountdate) {
            flag = false;
        }
    }
    //没有找这个收款记录，添加收款
    if (flag) {
        addXTRecord(xtrecord, avalibleproject);
        //console.log(avalibleproject.projectname, xtrecord);
    }

};
//单个项目
var refreshrecord = function (avalibleproject, id) {
    getprojecthtml(id, html => {
        let xtrecords = getshoukuan(html);
        for (let xtrecord of xtrecords) {
            compareRecord(xtrecord, avalibleproject);
        }
    });
};
//所有项目
var refreshcollectionrecord = function () {
    //let id = req.query.id;
    //定时刷新项目收款
    db.findPoBySql("avalibleprojects", {}, function (err, avalibleprojects) {
        if (err)
            return;
        for (let avalibleproject of avalibleprojects) {

            refreshrecord(avalibleproject, avalibleproject.xietongproject.id);
        }

    });

    //对比收款金额， 如果小于协同收款金额， 用日期对比，同一天有收款记录就不增加，如果一天有两个收款，那么就有bug

};

var setIntervalRefreshCollectionrecord = function () {
    var t1 = setTimeout(function () {
        refreshcollectionrecord();
    }, 1000 * 3);

    var t2 = setInterval(function () {
        refreshcollectionrecord();
    }, 1000 * 60 * 60 * 6);
};
//定时启动 收款更新
setIntervalRefreshCollectionrecord();

var getSearchBudget = function (po) {
    if(!po){
        po = "";
    }
    return {
        projectid: po.projectid,//项目id
        projectname: po.name,//项目名称
        budgetid: po.budgetid,//预算id
        projectmark: po.projectmark,//预算标识
        pageindex: po.pageindex,//显示第几页  如果为null 显示 第 1 页
        limit: po.limit,//每页显示行数的限制   如果为null 显示 20 条数据
    };
};

/**
 * 执行查询 协同项目预算
 * @param po
 * @param callback
 */
var searchBudget = function (po, callback) {

    if (!po.pageindex || po.pageindex < 1) {
        po.pageindex = 1;
    }

    if (!po.limit || po.limit < 1) {
        po.limit = 20;
    }
    let sql = '[{"page":' + po.pageindex + ',"size":' + po.limit + '},{';
    if (po.projectid) {
        sql = sql + '"field0001":"' + po.projectid.trim() + '",';
    }
    if (po.projectname) {
        sql = sql + '"field0002":"' + po.projectname.trim() + '",';
    }
    if (po.budgetid) {
        sql = sql + '"field0003":"' + po.budgetid.trim() + '",';
    }
    if (po.projectmark) {
        sql = sql + '"field0021":"' + po.projectmark.trim() + '",';
    }
    sql = sql + '"formId":"6930883251913575613","formTemplateId":"-4541273502800525558","queryType":"baseSearch"}]';
    superagent
        .post(XieTongUrl + 'seeyon/ajax.do?method=ajaxAction&managerName=formDataManager&rnd=78833')
        .type('form')
        .send({managerMethod: 'getFormMasterDataList', arguments: sql})
        .set('Cookie', 'JSESSIONID=' + JSESSIONIDValue + '; loginPageURL=; login_locale=zh_CN; avatarImageUrl=-1079369039802711505')
        .then(res => {
            let result = JSON.parse(res.text);
            //let projects = result.data;
            console.log(result);
            callback(result);

        });
}

//查询 项目预算
router.get('/searchbudget', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    let query = req.query;
    let searchPo = getSearchBudget(query)
    searchBudget(searchPo, function (result) {
        res.send({status: 0, message: "成功", data: result});
    });
});
//查询 项目预算
router.post('/searchbudget', mu.single(), function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    let query = req.body.searchpo;
    let searchpo = null;
    if(query){
        try {
            searchpo = JSON.parse(query);
        }catch (e) {
            res.send({status: 1, message: "失败，传入的不是json数据"});
        }
    }
    //转换成标准
    searchpo = getSearchBudget(searchpo);
    searchBudget(searchpo, function (result) {
        res.send({status: 0, message: "成功", data: result});
    });
});

module.exports = router;