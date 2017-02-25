'use strict'

var fs = require('fs');
var Promise =  require('bluebird');

exports.readFileAsync = function(fpath,encoding){
    return new Promise(function(resolve,reject){
        fs.readFile(fpath,encoding,function(err,content){
            if(err) reject(err);
            else resolve(content);
        });
    })
};

exports.writeFileAsync = function(fpath,content){
    return new Promise(function(resolve,reject){
        fs.writeFile(fpath,content,function(err){
            if(err) reject(err);
            else resolve();
        });
    })
}


var crypto = require('crypto');
var heredoc = require('heredoc');

//signature(签名)需要放在服务端做，是最容易出错的环节
//生成signature需要４个要素：
//１．时间截
//２．当前页面的url
//３．票据
//４．随机串

//生成随机数
var createNonce = function() {
  return Math.random().toString(36).substr(2, 15);
};
//生成时间截
var createTimestamp = function() {
  return parseInt(new Date().getTime() / 1000, 10) + '';
};
//实现签名
var _sign = function(noncestr, ticket, timestamp, url) {
  var params = [
    'noncestr=' + noncestr,
    'jsapi_ticket=' + ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ];
  var str = params.sort().join('&');
  var shasum = crypto.createHash('sha1');
  shasum.update(str);
  return shasum.digest('hex');
}
exports.sign = function(ticket, url) {
  var noncestr = createNonce();
  var timestamp = createTimestamp();
  var signature = _sign(noncestr, ticket, timestamp, url);

  return {
    noncestr: noncestr,
    timestamp: timestamp,
    signature: signature
  };
}
