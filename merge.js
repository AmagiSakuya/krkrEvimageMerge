var fs = require('fs-extra');
var exec = require('child_process').exec;

//获取node命令传入的参数
var arguments = process.argv.splice(2);
if (arguments.length === 0) {
	console.log('未传入文件参数');
	return;
}
var imageSize = [];
var imageArray = [];
var _baseImg, _overImg;
var _baseFileName = arguments[0].split('+')[0];
//console.log(arguments[0]);
fs.readFile(arguments[0], 'utf-8', function(err, data) {
	if (err) {
		console.log(err);
		return;
	}
	//console.log(data);

	//将txt按换行符分割
	var arr = data.split(/\r?\n/ig);
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === '') {
			continue;
		}
		//将一行以: 分割成[key:value]的数组_kv[0]代表key _kv[1]代表value
		var _kv = arr[i].split(':');
		_kv[1] = _kv[1].trim();
		if (_kv[0] === 'image_width') {
			imageSize[0] = _kv[1];
		} else if (_kv[0] === 'image_height') {
			imageSize[1] = _kv[1];
		} else if (_kv[0] === 'name') {
			//如果是name则将向imageArray推一个ImageObject对象
			var _image = new ImageObject();
			_image[_kv[0]] = _kv[1];
			imageArray.push(_image);
		} else {
			var _image = imageArray[(imageArray.length - 1)]
			_image[_kv[0]] = _kv[1];
		}
	}
	//反向排序imageArray数组
	imageArray.reverse();
	//console.log(imageArray);
	for (var i = 0; i < imageArray.length; i++) {
		var cmd;
		//如果name包含a说明为一个baseImage的开始
		if (imageArray[i].name.indexOf('a') !== -1) {
			_baseImg = imageArray[i];
			_overImg = undefined;
		} else {
			_overImg = imageArray[i];
		}

		if (typeof _overImg === 'undefined') {
			cmd = `magick convert -size ${imageSize[0]}x${imageSize[1]} -page +${_baseImg.left}+${_baseImg.top} ${_baseFileName}+pimg+${_baseImg.layer_id}.png -mosaic output/${_baseFileName}+${_baseImg.name}.png`.trim();
		} else {
			cmd = `magick convert -size ${imageSize[0]}x${imageSize[1]} -page +${_baseImg.left}+${_baseImg.top} ${_baseFileName}+pimg+${_baseImg.layer_id}.png -page +${_overImg.left}+${_overImg.top} ${_baseFileName}+pimg+${_overImg.layer_id}.png -mosaic output/${_baseFileName}+${_baseImg.name}+${_overImg.name}.png`.trim();
		}
		runCmd(cmd);
	}
});

function ImageObject() {}

function runCmd(cmd) {
	console.log('开始运行语句：' + cmd);
	exec(cmd, function(err, stdout, stderr) {
		if (err) {
			console.log('get error:' + stderr);
		} else {
			//console.log(stdout);
		}
	});
}