
/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var wx = require('../../wx/index');
var util = require('../../libs/util');
var Movie = require('../api/movie');
var koa_request = require('koa-request');

exports.guess = function *(next) {
  var wechatApi = wx.getWechat();
  var data = yield wechatApi.fetchAccessToken();
  var access_token = data.access_token;

  var ticketData = yield wechatApi.fetchTicket(access_token);
  var ticket = ticketData.ticket;
  var url = this.href;
  var params = util.sign(ticket, url);
  yield this.render('wechat/game', params);

};

https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect

exports.jump = function *(next) {
  var movieId = this.params.id;
  var redirect = 'http://17f5a3c0.viphk.ngrok.org/wechat/movie/' + movieId;
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?' + 
            'appid=' + wx.wechatOptions.wechat.appID + '&redirect_uri=' + 
            redirect + '&response_type=code&scope=snsapi_base&state=' + 
            movieId + '#wechat_redirect';
  console.log(url);
  this.redirect(url);
};


exports.find = function *(next) {

  //微信回调获取code
  var code = this.query.code;
  var openUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + 
                wx.wechatOptions.wechat.appID + '&secret=' +
                wx.wechatOptions.wechat.appSecret + '&code=' + code + '&grant_type=authorization_code';
  var response = yield koa_request({
    url: openUrl
  }); 
  var body = JSON.parse(response.body);
  var openid = body.openid;
  var user = yield User.findOne({openid: openid}).exec();
  console.log(user);
  if(!user) {
    user = new User({
      openid: openid,
      password: 'imoocimooc',
      name: Math.random().toString(36).substr(2)
    });
    yield user.save();
  }
  this.session.user = user;
  this.state.user = user;

  var id = this.params.id;
  var wechatApi = wx.getWechat();
  var data = yield wechatApi.fetchAccessToken();
  var access_token = data.access_token;

  var ticketData = yield wechatApi.fetchTicket(access_token);
  var ticket = ticketData.ticket;
  var url = this.href;
  var params = util.sign(ticket, url);
  var movie = yield Movie.searchById(id);
  var comments = yield Comment
    .find({movie: id})
    .populate('from', 'name')
    .populate('reply.from reply.to', 'name')
    .exec();
  params.movie = movie;  
  params.comments = comments;
  
  yield this.render('wechat/movie', params);
};


