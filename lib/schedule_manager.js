var moment=require("moment");
var ScheduleManager = module.exports = exports.ScheduleManager = function(){
    this.schedules={};
    this.jobs={};
    this.add_job=function(date,job){
        date=parseInt(date/1000)*1000;
        if(!this.schedules[date]) {
            this.schedules[date]=[];
        }
        if(this.schedules[date].indexOf(job)>=0){
            return;
        }
        this.schedules[date].push(job);
        if(!this.jobs[job.name]){
            this.jobs[job.name]=[];
        }
        this.jobs[job.name].push(date);
    }
    this.remove_job=function(job){
        if(this.jobs[job.name]){
            var job_list=this.jobs[job.name];
            var this_obj=this;
            job_list.forEach(function(date){
                list=this_obj.schedules[date];
                for(var i in list){
                    j=list[i];
                    if(j.name==job.name){
                        this_obj.schedules[date].splice(i,1);
                    }
                }
            });
            delete this.jobs[job.name];
            return true;
        } else {
            return false;
        }
    }
    this.next_time = function(){
        return parseInt(Object.keys(this.schedules).sort()[0]);
    }
    this.pop_latest_jobs=function(){
        var min_date=this.next_time();
        if(min_date){
            var job_list=this.schedules[min_date];
            var this_obj=this;
            job_list.forEach(function(job){
                list=this_obj.jobs[job.name];
                this_obj.jobs[job.name].splice(list.indexOf(min_date),1);
            });
            delete this.schedules[min_date];
            return_value={};
            return_value[min_date]=job_list;
            return return_value;
        } else {
            return null;
        }
    }
}