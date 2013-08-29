var http = require('http');

var req;

req = http.request('http://127.0.0.1');
req.method = 'POST';
req.on('response', onResponse);
req.on('error', onError);
req.setHeader('Content-Type', 'application/json;charset=UTF-8');
sendData(req);

function sendData() {
	var data = JSON.stringify({
		verb: 'PUT',
		contentMd5: 'c8fdb181845a4ca6b8fec737b3581d76',
		contentType: 'text/html',
		date: 'Thu, 17 Nov 2005 18:49:58 GMT',
		canonicalizedOSSHeaders: 'x-oss-magic:abracadabra\nx-oss-meta-author:foo@bar.com\n',
		canonicalizedResource: '/oss-example/nelson'
	});
	var length = Buffer.byteLength(data, 'utf8');
	req.setHeader('Content-Length', length);
	req.end(data);
}

function onResponse(res) {
	var chunks = [],
		totalLength = 0;

	console.log(res.statusCode);
	res.on('data', onData);
	res.on('end', onEnd);
	res.on('error', onError);

	function onData(chunk) {
		chunks.push(chunk);
		totalLength += chunk.length;
	}

	function onEnd() {
		if (res.statusCode === 200) {
			console.log(JSON.parse(Buffer.concat(chunks, totalLength).toString()));
		}
	}

	function onError(err) {

	}
}

function onError(err) {
	console.log(err.toString());
}