
/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var wx = require('../../wx/index');
var util = require('../../libs/util');
var Movie = require('../api/movie');

exports.guess = function *(next) {
  var wechatApi = wx.getWechat();
  var data = yield wechatApi.fetchAccessToken();
  var access_token = data.access_token;

  var ticketData = yield wechatApi.fetchTicket(access_token);
  var ticket = ticketData.ticket;
  var url = this.href;
  var params = util.sign(ticket, url);
  console.log(params)
  yield this.render('wechat/game', params);

};

exports.find = function *(next) {
  var id = this.params.id;

  var wechatApi = wx.getWechat();
  var data = yield wechatApi.fetchAccessToken();
  var access_token = data.access_token;

  var ticketData = yield wechatApi.fetchTicket(access_token);
  var ticket = ticketData.ticket;
  var url = this.href;
  var params = util.sign(ticket, url);
  var movie = yield Movie.searchById(id);
  params.movie = movie;  
  
  yield this.render('wechat/movie', params);
};


