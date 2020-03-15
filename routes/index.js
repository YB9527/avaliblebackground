var express = require('express');
var router = express.Router();
const request = require('superagent');


/* GET home page. */
router.get('/', function(req, res, next) {
   /* res.header("Access-Control-Allow-Origin", "*");*/
   /* request
        .post('http://prsmartoa.com:10529/seeyon/main.do?method=login')
        .type('form')
        //.send({ authorization: ''})
        .send({ "login.timezone": 'GMT+8:00'})
        .send({ login_username: '20304'})
        .send({ login_password: '123456'})

        .then(res1 => {

          let cookie =res1.headers["set-cookie"][0].substr(0,43).replace("JSESSIONID=","");
            //res.cookie('JSESSIONID', cookie, {httpOnly: true ,Path:"/seeyon"});

            //res.cookie("JSESSIONID",cookie);
         ///   res.cookie('JSESSIONID', cookie, { Path:"seeyon" ,domain: 'prsmartoa.com',expires: new Date(Date.now() + 900000), httpOnly: true });
         //// console.log(2,res1.headers);
          // res1.send({status: 0,message: "成功",cookie:res1.headers });
           // res.cookie('JSESSIONID', '', { expires: new Date(0)});
           // res.cookie('loginPageURL', '', { expires: new Date(0)});
           // res.cookie('loginPageURL', '');
            //res.addCookie(res1.headers["set-cookie"][0]);
            //res.send({status: 1,message: "成功" });
        });*/
    res.send('respond with a resource');
    //res.send({status: 1,message: "成功" });
});
module.exports = router;
