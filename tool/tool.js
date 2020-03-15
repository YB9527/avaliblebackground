//检查是否数据
var checkIsDouble = function (value) {
    var patrn = /^(-)?\d+(\.\d+)?$/;
    return !(patrn.exec(value) == null);
};
function number_format(number, decimals, dec_point, thousands_sep) {

    if(number ==0 || number == 0.00){
        return 0;
    }
    /*
    * 参数说明：
    * number：要格式化的数字
    * decimals：保留几位小数
    * dec_point：小数点符号
    * thousands_sep：千分位符号
    * */
    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {

            return parseFloat(n).toFixed(prec);
        };

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    var re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
        s[0] = s[0].replace(re, "$1" + sep + "$2");
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

exports.number_format = number_format;

//金额符号
function moneySymbol(money, isadd) {
    if(!money){
        return money;
    }
    if (isadd) {
        return number_format(money, 2, '.', ',');
    } else {
        return (money+"").replace(/,/g, "");
    }

}
exports.moneySymbol = moneySymbol;
function rateSymbol(rate, isadd) {
    if (isadd  ) {
        if(rate.toString().indexOf("%") === -1){
            return rate+"%";
        }else{
            return rate;
        }

    } else {
        return (rate+"").replace(/%/g, "");
    }

}
//项目金额添加符号
function projectMoneySymbol(project, isadd) {
    /**项目金额添加符号
     * project：项目
     *
     */
    project.contrafacevalue = moneySymbol(project.contrafacevalue, isadd);//主合同金额

    project.validratefee = moneySymbol(project.validratefee,isadd);/*有效金额，*/
    project.preparefeefixfee = moneySymbol(project.preparefeefixfee, isadd);/*前期固定金额*/
    project.preparefeereal = moneySymbol(project.preparefeereal, isadd);/*前期（实际）*/
    project.prepareover = moneySymbol(project.prepareover, isadd);/*前期费（超额）*/
    project.workingfee = moneySymbol(project.workingfee, isadd);/*工作金额值*/
    for (let i in project.percentages) {
        let percentage = project.percentages[i];
        percentage.result = moneySymbol(percentage.result, isadd);
    }
    project.cooperationbudget = moneySymbol(project.cooperationbudget, isadd);//预算A,
    project.hezuoyusuanA = moneySymbol(project.hezuoyusuanA, isadd);//合作预算A
    for (let i in project.baseexpences) {//固开支
        let baseexpence = project.baseexpences[i];
        baseexpence.value = moneySymbol(baseexpence.value, isadd);
    }
    project.percentagetotal = moneySymbol(project.percentagetotal, isadd);//总提成
    project.avalibleshare = moneySymbol(project.avalibleshare, isadd);//分红利润
    project.benifitrate = moneySymbol(project.benifitrate, isadd);//毛利率
    project.fundpay = moneySymbol(project.fundpay, isadd);//分红金额，总分红
    project.percentagepaysteponeratevalue = moneySymbol(project.percentagepaysteponeratevalue, isadd);//金额
    project.percentagepaysteptworatevalue = moneySymbol(project.percentagepaysteptworatevalue, isadd);//金额
    project.percentagepaystepthreeratevalue = moneySymbol(project.percentagepaystepthreeratevalue, isadd);//金额
    project.percentagepaysum = moneySymbol(project.percentagepaysum, isadd);//已支付项目提成
    project.percentagenotpaysum = moneySymbol(project.percentagenotpaysum, isadd);//未支付的项目提成
    project.fundpaysteponeratevalue = moneySymbol(project.fundpaysteponeratevalue, isadd);//金额
    project.fundpaysteptworatevalue = moneySymbol(project.fundpaysteptworatevalue, isadd);//金额
    project.fundpaystepthreeratevalue = moneySymbol(project.fundpaystepthreeratevalue, isadd);//金额
    project.fundpaysum = moneySymbol(project.fundpaysum, isadd);//已支付项目分红
    project.fundnotpaysum = moneySymbol(project.fundnotpaysum, isadd);//未支付的项目分红
    //收款金额
    for (let i in project.collectionrecords) {//固开支
        let collectionrecord = project.collectionrecords[i];
        collectionrecord.amountcollected = moneySymbol(collectionrecord.amountcollected, isadd);
        collectionrecord.percentagevalue = moneySymbol(collectionrecord.percentagevalue, isadd);
        collectionrecord.fundvalue = moneySymbol(collectionrecord.fundvalue, isadd);
        for (let i in collectionrecord.percentagepayvalueArray) {
            let percentagepay = collectionrecord.percentagepayvalueArray[i];
            percentagepay.value = moneySymbol(percentagepay.value, isadd);
        }
    }
    project.amountcollectedtotal = moneySymbol(project.amountcollectedtotal, isadd);//收款总额

    //添加比例符号
    let ratesymbolarray = [
        "validrate","preparefeefix","workingfeerate","fundrate","percentagepaysteponerate","percentagepaysteptworate","percentagepaystepthreerate","fundpaysteponerate","fundpaysteptworate","fundpaystepthreerate"
    ];
    for(let i in ratesymbolarray){
        let ratesymbol = ratesymbolarray[i];
        project[ratesymbol] = rateSymbol(project[ratesymbol], isadd);
    }
    for(let i in project.baseexpences){
        let baseexpence = project.baseexpences[i];
        baseexpence.rate = rateSymbol(baseexpence.rate, isadd)
    }


}
exports.projectMoneySymbol = projectMoneySymbol;

//添加基础提成的符号
function  percentageMoneySymbol(percentage,isadd) {
    percentage.input = moneySymbol(percentage.input, isadd);
    percentage.output = moneySymbol(percentage.output, isadd);
    percentage.validratefee = moneySymbol(percentage.validratefee, isadd);
    percentage.interval = moneySymbol(percentage.interval, isadd);
    percentage.percentageresult = moneySymbol(percentage.percentageresult, isadd);
    for(let i in percentage.salarylist) {
        let salary = percentage.salarylist[i];
        salary.interval = moneySymbol(salary.interval, isadd);
        salary.value = moneySymbol(salary.value, isadd);
        salary.rate = rateSymbol(salary.rate, isadd);
    }
    percentage.validrate= rateSymbol(percentage.validrate, isadd);
    percentage.percentagerate= rateSymbol(percentage.percentagerate, isadd);
}
exports.percentageMoneySymbol = percentageMoneySymbol;
//计算值
function caculate(percentage,resultaddsymbol =true) {
    percentageMoneySymbol(percentage,false);

    for (let i = 0; i < percentage.salarylist.length; i++) {
        percentage.salarylist[i].value = 0;
    }
    let input = percentage.input * 1 * percentage.validrate / 100;
    percentage.validratefee = input;
    if (!checkIsDouble(input) || input == 0) {
        percentage.output = 0;
        percentage.percentageresult = 0;
        return 0;
    }
    let output = percentage.salarylist[0].rate * 1;
    if (input <= percentage.salarylist[0].interval) {
        percentage.output = output;
        percentage.percentageresult = (percentage.output * percentage.percentagerate / 100).toFixed(2);
        return output;
    }
    //找出key 值
    let index = -1;
    for (let i = 0; i < percentage.salarylist.length; i++) {
        if (i === 0) {
            percentage.salarylist[0].value = percentage.salarylist[0].rate;
            continue;
        }
        let min = percentage.salarylist[i].interval * 1;
        //这种全部取完
        //console.log(1,this.salaryDic[i].interval,this.salaryDic[i-1].interval,this.salaryDic[i].rate);
        if (input >= min) {
            index = i;
        }
    }

    index += 1;

    if (index === 0) {
        index = 1;
    }
    //console.log(index);
    //计算output
    for (let i = 1; i <= index; i++) {
        if (i === index) {
            if (i === percentage.salarylist.length) {
                let res = (input - percentage.salarylist[i - 1].interval) * percentage.salarylist[i - 1].rate;
                percentage.salarylist[i - 1].value = (percentage.salarylist[i - 1].value * 1 + res.toFixed(2) * 1).toFixed(2);
                output += res;
            } else {
                //console.log((input - caculate.salarylist[i-1].interval)*caculate.salarylist[i].rate);
                let res = (input - percentage.salarylist[i - 1].interval) * percentage.salarylist[i].rate
                percentage.salarylist[i].value = res.toFixed(2);
                output += res;
            }
        } else {
            let res = (percentage.salarylist[i].interval - percentage.salarylist[i - 1].interval) * percentage.salarylist[i].rate;
            percentage.salarylist[i].value = res.toFixed(2);
            output += res;
        }
    }
    //console.log(output);
    //output=output.toFixed(2);
    percentage.output = output.toFixed(2);
    percentage.percentageresult = (percentage.output * percentage.percentagerate / 100).toFixed(2);
    //console.log(index);
    percentageMoneySymbol(percentage,resultaddsymbol);
    return output;
};
exports.caculate = caculate;
var monthFormat=function(date){
    date = new Date(date);
    if (date.getMonth() > 8) {
        return date.getFullYear() + "-" +date.getMonth() ;
    } else {
        return date.getFullYear()+ "-0" + date.getMonth() ;
    }
};
exports.monthFormat = monthFormat;

