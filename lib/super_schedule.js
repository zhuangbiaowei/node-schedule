var ScheduleManager = require("./schedule_manager");
var RecurrenceRule = require("./recurrence_rule");
var Job = require("./job");
var moment = require("moment");

var SuperSchedule = module.exports = exports.SuperSchedule = function(){
    this.sm=new ScheduleManager();
    this.remove_job_list=[];
    this.scheduleJob = function(){
    	if (arguments.length < 2)
    		return null;
    	var name = (arguments.length >= 3) ? arguments[0] : null;
    	var rule = (arguments.length >= 3) ? arguments[1] : arguments[0];
    	var method = (arguments.length >= 3) ? arguments[2] : arguments[1];
    	if (typeof(method) != 'function')
    		return null;
    	var job = new Job(name, method);
        var start = (new Date()).getTime();
        this.setScheduleJob(start,rule,job,true);
        return job;
    }
    this.cancelJob = function(job){
        if(this.sm.remove_job(job)){
            this.remove_job_list.push(job.name);
        }
    }
    this.setScheduleJob =  function(start,rule,job,first){
        if(first || this.remove_job_list.indexOf(job.name)==-1){
            var rr=RecurrenceRule.fromCronString(rule);
            var fireDate=rr.nextInvocationDate(start);
            this.sm.add_job(fireDate.getTime(),job);
            var time=fireDate-(new Date()).getTime()-59*1000;
            this_obj=this;
            setTimeout(function(){this_obj.setScheduleJob(fireDate,rule,job,false)},time);
        }
    }
    
    this.startSchedule = function(){
        var fireDate=this.sm.next_time();
        var jobs=this.sm.pop_latest_jobs();
        if(jobs){
            var job_list=jobs[fireDate];
            var now=(new Date()).getTime();
            this_obj=this;
            setTimeout(function(){
                job_list.forEach(function(job){
                    if(this_obj.remove_job_list.indexOf(job.name)==-1){
                        job.job();
                    }
                });
            },fireDate-now);
        }
        this_obj=this;
        var next_time=this.sm.next_time();
        var time = next_time-now-1000*90;
        if(time>0){
            setTimeout(function(){this_obj.startSchedule()},time);
        } else {
            setTimeout(function(){this_obj.startSchedule()},0);
        }
    }
}