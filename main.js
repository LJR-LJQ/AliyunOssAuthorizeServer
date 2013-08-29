var http = require('http'),
	createSignature = require('./lib/createSignature').createSignature;

var key = require('./key.json');

var accessKeyId = key.AccessKeyId,
	accessKeySecret = key.AccessKeySecret;

var server = http.createServer();
server.on('request', onRequest);
server.on('error', onError);
server.listen(80);

function onRequest(req, res) {
	// 方法必须是 POST
	if (req.method !== 'POST') {
		res.statusCode = 404;
		res.end();
		return;
	}

	// 请求的地址必须是 /
	if (req.url !== '/') {
		res.statusCode = 404;
		res.end();
		return;
	}

	// Content-Type 必须为 JSON 类型，且为 utf-8 编码
	var contentType = req.headers['content-type'];
	if (!contentType || contentType.toLowerCase() !== 'application/json;charset=utf-8') {
		res.statusCode = 404;
		res.end();
		return;
	}

	// 解析 JSON 请求
	parseJsonRequest(req, onParseSuccess, onParseFailure);

	function onParseSuccess(obj) {
		console.log(obj);
		// 执行签名
		createSignature(accessKeySecret, obj, createSignatureSuccess, createSignatureFailure)

		function createSignatureSuccess(signature) {
			var o = {
				Authorization: 'OSS ' + accessKeyId + ':' + signature
			}
			respondJsonObj(o);
		}

		function createSignatureFailure() {
			respondJsonObj({error: 'authorize failed.'});
		}

		function respondJsonObj(obj) {
			var text = JSON.stringify(obj);
			res.setHeader('Content-Type', 'application/json;charset=UTF-8');
			res.setHeader('Content-Length', Buffer.byteLength(text, 'utf8'));
			res.end(text);
		}
	}

	function onParseFailure() {
		// BAD REQUEST
		res.statusCode = 400;
		res.end();
	}
}

function onError(err) {
	console.log(err.toString());
}

function parseJsonRequest(req, scb, fcb) {
	var chunks = [],
		totalLength = 0;

	req.on('data', onData);
	req.on('end', onEnd);
	req.on('error', onError);

	function onData(chunk) {
		chunks.push(chunk);
		totalLength += chunk.length;
	}

	function onEnd() {
		var textBuffer = Buffer.concat(chunks, totalLength);
		try {
			var jsonObj = JSON.parse(textBuffer.toString('utf8'));
			if (scb) {
				scb(jsonObj);
			}
		} catch(err) {
			if (fcb) {
				fcb();
			}
		}
	}

	function onError() {
		if (fcb) {
			fcb();
		}
	}
}