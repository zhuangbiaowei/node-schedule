var anonJobCounter = 0;
var Job = module.exports = exports.Job =function(){
	var name;
	var arg;
	for (var i = 0; i < arguments.length; i++)
	{
		arg = arguments[i];
		if (typeof(arg) == 'string' || arg instanceof String)
			name = arg;
		else if (typeof(arg) == 'function')
			this.job = arg;
	}
    if (name == null)
		name = '<Anonymous Job ' + (++anonJobCounter) + '>';
    
    this.name=name;
}