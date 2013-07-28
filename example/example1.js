var SuperSchedule=require("../");
var moment = require("moment");
var schedule = new SuperSchedule();
var jobs={};

function start_job(i,rule){
	var job=schedule.scheduleJob(rule,function(){
		console.log(rule+" "+i);
	});
	jobs[rule+" "+i]=job;
}

for(var i=1;i<3;i++){
	for(var j=1;j<10;j++){
		start_job(i,"*/"+j+" * * * *");
	}
}

schedule.startSchedule();
function cancelJob(){
    var key = Object.keys(jobs).sort()[0];
    var job = jobs[key];
    schedule.cancelJob(job);
    delete jobs[key];
    console.log("cancel job "+key);
    setTimeout(cancelJob,1000*60);
}
setTimeout(cancelJob,1000*30);
