const fs=require('fs')

exports.parseRemoveLineBreaks = function(file) {
	var source = fs.readFileSync(file, 'utf8');

	source = source.replace(/\/\/.*/g, " ").replace(/\s/g, " ").replace(/\s/g, " ");

	return source;
}
