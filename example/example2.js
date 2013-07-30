var SuperSchedule=require("../");
var moment = require("moment");
var schedule = new SuperSchedule();
var jobs={};

var job=schedule.scheduleJob("* */2 * * * * *",function(){
	console.log(moment(Date.now()).format());
});
schedule.startSchedule();