/* Range object */
var Range = module.exports = exports.Range = function(start, end, step){
	this.start = start || 0;
	this.end = end || 60;
	this.step = step || 1;
}

Range.prototype.contains = function(val){
	if (this.step === null || this.step === 1)
		return (val >= this.start && val <= this.end);
	else
	{
		for (var i = this.start; i < this.end; i += this.step)
		{
			if (i == val)
				return true;
		}
		
		return false;
	}
};