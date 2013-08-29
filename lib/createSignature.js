exports.createSignature = createSignature;

var hmacSha1Base64 = require('./hmacSha1Base64').hmacSha1Base64,
	safeCall = require('./safeCall').safeCall;

// key		签名用的密钥
// defObj	签名内容对象，含有下属属性（每个属性都是一个字符串）
// - verb, contentMd5, contentType, date, canonicalizedOSSHeaders, 
// - canonicalizedResource
// 注意 contentMd5 和 contentType 可以为空（undefined、null或者空字符串）
//
// # scb(signature)
// # fcb()
function createSignature(key, defObj, scb, fcb) {
	if (typeof defObj !== 'object' || defObj === null) {
		safeCall(fcb);
		return;
	}

	_createSignature(key, 
		defObj.verb, defObj.contentMd5, defObj.contentType,
		defObj.date, defObj.canonicalizedOSSHeaders, defObj.canonicalizedResource,
		scb, fcb);
}


// # scb(signature)
// # fcb()
function _createSignature(
	key, verb, contentMd5, contentType, date, 
	canonicalizedOSSHeaders, canonicalizedResource,
	scb, fcb) {
	if (contentMd5 === undefined || contentMd5 === null) {
		contentMd5 = '';
	}

	if (contentType === undefined || contentType === null) {
		contentType = '';
	}

	if (isNotEmptyString(key) &&
		isNotEmptyString(verb) &&
		isString(contentMd5) &&
		isString(contentType) &&
		isNotEmptyString(date) &&
		isString(canonicalizedOSSHeaders) &&	// 特别注意这里是允许 canonicalizedOSSHeaders 为空的
		isNotEmptyString(canonicalizedResource)
		) {

		var text =	verb + '\n' + contentMd5 + '\n' 
					+ contentType + '\n' + date + '\n'
					+ canonicalizedOSSHeaders + canonicalizedResource;

		hmacSha1Base64(key, text, scb, fcb);

	} else {
		safeCall(fcb);
	}
}

function isString(v) {
	return typeof v === 'string';
}

function isNotEmptyString(v) {
	return typeof v === 'string' && v !== '';
}

// var key = 'OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV';
// var obj = {
// 	verb: 'PUT',
// 	contentMd5: 'c8fdb181845a4ca6b8fec737b3581d76',
// 	contentType: 'text/html',
// 	date: 'Thu, 17 Nov 2005 18:49:58 GMT',
// 	canonicalizedOSSHeaders: 'x-oss-magic:abracadabra\nx-oss-meta-author:foo@bar.com\n',
// 	canonicalizedResource: '/oss-example/nelson'
// };
// createSignature(key, obj, function(result) {
// 	console.log(result);
// }, function() {
// 	console.log('failed');
// });