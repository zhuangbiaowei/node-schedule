var increment = require('./increment.js');
var Range = require('./range.js');

/* RecurrenceRule object */
/*
	Interpreting each property:
		null - any value is valid
		number - fixed value
		Range - value must fall in range
		array - value must validate against any item in list
	
	NOTE: Cron months are 1-based, but RecurrenceRule months are 0-based.
*/
var RecurrenceRule =  module.exports = exports.RecurrenceRule = function(year, month, date, dayOfWeek, hour, minute, second){
	this.recurs = true;
	
	this.year = (year == null) ? null : year;
	this.month = (month == null) ? null : month;
	this.date = (date == null) ? null : date;
	this.dayOfWeek = (dayOfWeek == null) ? null : dayOfWeek;
	this.hour = (hour == null) ? null : hour;
	this.minute = (minute == null) ? null : minute;
	this.second = (second == null) ? 0 : second;
}

var monthTranslation = {'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11};
var dayTranslation = {'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6};

RecurrenceRule.valueForCronComponent = function(component, min, max, shiftIdxs){
	component = component.toLowerCase();
	
	min = (min == null) ? -1 : min;
	max = (max == null) ? -1 : max;
	shiftIdxs = (typeof(shiftIdxs) == 'boolean') ? shiftIdxs : false;
	
	if (component == '*' || component == '?')
		return null;
	
	if (component.match(/^([1-9]|[1-3][0-9])w$/))
	{
		// TODO: nearest weekday
		return null;
	}
	
	var result = [];
	var item, stepParts, rangeParts, itemRange;
	var items = component.split(',');
	for (var i = 0; i < items.length; i++)
	{
		item = items[i];
		if (item == '*' || item == '?')
			return null; // if any component is *, the rule is *
		else if (item.match(/^[0-9]+$/))
			result.push(parseInt(item, 10) - ((shiftIdxs) ? 1 : 0));
		else if (item == 'l')
		{
			// TODO: last
		}
		else
		{
			// TODO
			// 0#2 = second Sunday
			
			itemRange = new Range();
			stepParts = item.split('/', 2);
			
			if (stepParts[0] == '*')
			{
				if (min <= -1 || max <= -1)
					continue;
				
				itemRange.start = min;
				itemRange.end = max;
			}
			else
			{
				rangeParts = stepParts[0].split('-', 2);
			
				if (rangeParts[0] in monthTranslation)
					itemRange.start = monthTranslation[rangeParts[0]];
				else if (rangeParts[0] in dayTranslation)
					itemRange.start = dayTranslation[rangeParts[0]];
				else
					itemRange.start = parseInt(rangeParts[0], 10) - ((shiftIdxs) ? 1 : 0);
			
				if (rangeParts.length == 2)
				{
					if (rangeParts[1] in monthTranslation)
						itemRange.end = monthTranslation[rangeParts[1]];
					else if (rangeParts[1] in dayTranslation)
						itemRange.end = dayTranslation[rangeParts[1]];
					else
						itemRange.end = parseInt(rangeParts[1], 10) - ((shiftIdxs) ? 1 : 0);
				}
			}
			
			itemRange.step = (stepParts.length == 2) ? parseInt(stepParts[1], 10) : 1;
			result.push(itemRange);
		}
	}
	
	if (result.length == 0)
		return null;
	else if (result.length == 1)
		return result[0];
	
	return result;
};

RecurrenceRule.fromCronString = function(cronStr){
	cronStr = cronStr.toLowerCase().replace(/^\s*|\s*$/g, '');
	
	/* special commands */
	if (cronStr == '@yearly' || cronStr == '@annually')
		return new RecurrenceRule(null, 0, 1, null, 0, 0, 0);
	else if (cronStr == '@monthly')
		return new RecurrenceRule(null, null, 1, null, 0, 0, 0);
	else if (cronStr == '@weekly')
		return new RecurrenceRule(null, null, null, 0, 0, 0, 0);
	else if (cronStr == '@daily')
		return new RecurrenceRule(null, null, null, null, 0, 0, 0);
	else if (cronStr == '@hourly')
		return new RecurrenceRule(null, null, null, null, null, 0, 0);
	else
	{
		// parse it out
		var parts = cronStr.split(/\s+/);
		if (parts.length < 5 || parts.length > 7)
			return null;
		
		var rule = new RecurrenceRule();
        if(parts.length==7){
            rule.second = RecurrenceRule.valueForCronComponent(parts.splice(0,1)[0], 0, 59);
        } else {
            rule.second = 0;
        }
		// minute
		rule.minute = RecurrenceRule.valueForCronComponent(parts[0], 0, 59);
		
		// hour
		rule.hour = RecurrenceRule.valueForCronComponent(parts[1], 0, 23);
		
		// date
		rule.date = RecurrenceRule.valueForCronComponent(parts[2], 1, 31);
		
		// month
		rule.month = RecurrenceRule.valueForCronComponent(parts[3], 0, 11, true);
		
		// day of week
		rule.dayOfWeek = RecurrenceRule.valueForCronComponent(parts[4], 0, 6);
		
		// year
		if (parts.length == 6)
			rule.year = RecurrenceRule.valueForCronComponent(parts[5]);
		
		if (rule.validate())
			return rule;
	}
	
	return null;
};

RecurrenceRule.prototype.validate = function(){
	// TODO: validation
	return true;
};

RecurrenceRule.prototype.nextInvocationDate = function(base){
	base = (base instanceof Date) ? base : (new Date());
	
	if (!this.recurs)
		return null;
	
	var now = new Date();
	if (this.year !== null && (typeof(this.year) == 'number') && this.year < now.getFullYear())
		return null;
	
	var next = new Date(base.getTime());
	next.addSecond();
	
	while (true)
	{
		if (this.year != null && !recurMatch(next.getYear(), this.year))
		{
			next.addYear();
			next.setMonth(0);
			next.setDate(1);
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.month != null && !recurMatch(next.getMonth(), this.month))
		{
			next.addMonth();
			next.setDate(1);
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.date != null && !recurMatch(next.getDate(), this.date))
		{
			next.addDay();
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.dayOfWeek != null && !recurMatch(next.getDay(), this.dayOfWeek))
		{
			next.addDay();
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.hour != null && !recurMatch(next.getHours(), this.hour))
		{
			next.addHour();
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.minute != null && !recurMatch(next.getMinutes(), this.minute))
		{
			next.addMinute();
			next.setSeconds(0);
			continue;
		}
		if (this.second != null && !recurMatch(next.getSeconds(), this.second))
		{
			next.addSecond();
			continue;
		}
		
		break;
	}
	
	return next;
};

function recurMatch(val, matcher){
	if (matcher == null)
		return true;
	
	if (typeof(matcher) == 'number')
		return (val == matcher);
	else if (typeof(matcher) == 'object' && matcher instanceof Range)
		return matcher.contains(val);
	else if (typeof(matcher) == 'array' || (typeof(matcher) == 'object' && matcher instanceof Array))
	{
		for (var i = 0; i < matcher.length; i++)
		{
			if (recurMatch(val, matcher[i]))
				return true;
		}
		return false;
	}
	
	return false;
}