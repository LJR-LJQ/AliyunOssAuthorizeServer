exports.hmacSha1Base64 = hmacSha1Base64;

var createHmac = require('crypto').createHmac,
	safeCall = require('./safeCall').safeCall;

// # scb(result)
// # fcb()
function hmacSha1Base64(key, text, scb, fcb) {
	if (typeof text !== 'string' || text === '') {
		safeCall(fcb);
		return;
	}

	var result = createHmac('sha1', key).update(text).digest('base64');
	safeCall(scb, [result]);
}

// var key = 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV';
// var text = 'PUT\nc8fdb181845a4ca6b8fec737b3581d76\ntext/html\nThu, 17 Nov 2005 18:49:58 GMT\nx-oss-magic:abracadabra\nx-oss-meta-author:foo@bar.com\n/oss-example/nelson';
// hmacSha1Base64(key, text, function(result) {
// 	console.log(result);
// });