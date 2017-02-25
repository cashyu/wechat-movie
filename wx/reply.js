'use strict'

var path = require('path');
var wx = require('./index.js');
var wechatApi = wx.getWechat();
var Movie = require('../app/api/movie');

exports.reply = function *(next){   //next用来向下传递流程
    var message = this.weixin;

    if(message.MsgType === 'event'){
      if(message.Event === 'subscribe'){  //订阅事件
          
        this.body = '欢迎关注电影世界\n' +
          '回复 1~3,测试文字回复\n' +
          '回复 4,测试图文回复\n' + 
          '回复 首页,进入电影首页\n' +
          '回复 登录,进入微信登录绑定\n' +
          '回复 游戏,进入游戏页面\n' + 
          '回复 电影名字,查询电影信息\n' + 
          '回复 语音(说出电影名),查询电影信息\n' + 
          '也可以点击<a href="http://1523233.viphk.ngrok.org/movie">语音查电影</a>';
      }else if(message.Event === 'unsubscribe'){
          console.log('无情取关');
          this.body = '';
          //上报地理位置事件，如果用户同意了上报，则用户每次打开公众号，都会上报一次地理位置
      }else if(message.Event === 'LOCATION') {
          this.body = '您上报的位置是：' + message.Latitude + '/' +
              message.Longitude + '-' + message.Precision;
          //点击了菜单
      }else if(message.Event === 'CLICK'){
          this.body = '您点击了菜单：' + message.EventKey;
          //扫描
      }else if(message.Event === 'SCAN') {
          console.log('关注后扫二维码' + message.EventKey + ' ' +
              message.Ticket);
          this.body = "看到你扫一下哦";
      }else if(message.Event === 'VIEW'){
          this.body = '您点击了菜单中的链接:' + message.EventKey;
      }else if(message.Event === 'scancode_push') {
        console.log("1111111111111111111111");
        console.log(message.ScanCodeInfo.ScanType);
        console.log(message.ScanCodeInfo.ScanResult);
        this.body = '您点击了菜单中的:' + message.EventKey;
      }else if(message.Event === 'scancode_waitmsg') {
        console.log("2222222222222222222222");
        console.log(message.ScanCodeInfo.ScanType);
        console.log(message.ScanCodeInfo.ScanResult);
        this.body = '您点击了菜单中的:' + message.EventKey;
      }else if(message.Event === 'pic_sysphoto') {
        console.log("3333333333333333333333");
        console.log(message.SendPicsInfo.Count)
        console.log(message.SendPicsInfo.cListt)
        console.log(message.SendPicsInfo.PicMd5Sum)
        this.body = '您点击了菜单中的:' + message.EventKey;
      }else if(message.Event === 'pic_photo_or_album') {
        console.log("4444444444444444444444");
        console.log(message.SendPicsInfo.Count)
        console.log(message.SendPicsInfo.cListt)
        console.log(message.SendPicsInfo.PicMd5Sum)
        this.body = '您点击了菜单中的:' + message.EventKey;
      }else if(message.Event === 'pic_weixin') {
        this.body = '您点击了菜单中的:' + message.EventKey;
      }else if(message.Event === 'location_select') {
        this.body = '您点击了菜单中的:' + message.EventKey;
      }
  }else if(message.MsgType === 'voice'){
    var voiceTxt = message.Recognition; //语音消息
    var movies = yield Movie.searchByName(voiceTxt);
    if(!movies || movies.length === 0){
      movies = yield Movie.searchByDouban(voiceTxt);
    }
    if(movies && movies.length > 0) {
      reply = [];
      movies = movies.slice(0, 3);
      movies.forEach(function(movie) {
        reply.push({
          title: movie.title,
          description: movie.description,
          picUrl: movie.poster,
          url: 'http://1523233.viphk.ngrok.org/movie/' + movie._id
        });
      });
    }else {
      reply = '没有查询到与' + voiceTxt + '匹配的电影'
    }
    this.body = reply;
  }else if(message.MsgType === 'text'){   //如果是文本类型
    var content = message.Content;
    var reply = '额，你说的' + message.Content + '太复杂了';

    //指定回复策略，比如回复1时，公众号做什么操作，回复2时，公众号做另外的操作
    if(content === '1'){
        reply = '天下第一吃大米';

    }else if(content === '2'){
        reply = "天下第二吃豆腐"
    }else if(content === '3'){
        reply = "天下第三吃西瓜"
    }else if(content === '4'){
        reply = [{
            title:'技术改变世界',
            description:"只是一个描述而已",
            picUrl:'http://ww4.sinaimg.cn/square/7bfc0806gw1f7q1rxnegyj20p00xctbr.jpg',
            url:'https://github.com/'
        },{
            title:'nodejs 微信开发',
            description:"只是测试一下",
            picUrl:'http://ww1.sinaimg.cn/thumbnail/005AWTo8jw1f7le64nnxaj305z06iq35.jpg',
            url:'https://nodejs.org/'
        }];
    }else {
      var movies = yield Movie.searchByName(content);
      if(!movies || movies.length === 0){
        movies = yield Movie.searchByDouban(content);
      }
      
      if(movies && movies.length > 0) {
        reply = [];
        movies = movies.slice(0, 3);
        movies.forEach(function(movie) {
          reply.push({
            title: movie.title,
            description: movie.title,
            picUrl: movie.poster,
            url: 'http://1523233.viphk.ngrok.org/movie/' + movie._id
          });
        });
      }else {
        reply = '没有查询到与' + content + '匹配的电影'
      }
    }
    this.body= reply;
  }
  yield next ;
};


