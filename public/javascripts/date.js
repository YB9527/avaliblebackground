/**
 * Created by mouxingyu on 3/31/15.
 */



var date = function(){
        var date = new Date()
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        if (month < 10){
            month = "0" + month;

        }

        var dates = date.getDate();
        if (dates < 10){
            dates = "0" +dates;

        }


        var hours = date.getHours();

        if (hours < 10){
            hours = "0" +hours;

        }
        var minutes = date.getMinutes();
        if (minutes < 10){
            minutes = "0" + minutes;

        }
        var second = date.getSeconds();
        if (second < 10){
            second = "0" + second;

        }

        var milionsecond = date.getMilliseconds();
        if (milionsecond < 100 && milionsecond >= 10){
            milionsecond = "0" + milionsecond;

        }
        if (milionsecond < 10){
            milionsecond = "00" + milionsecond;

        }



        var numdate = year.toString() + month.toString() + dates.toString() + hours.toString() + minutes.toString() + second.toString() + milionsecond

        return numdate;




}
exports.date = date