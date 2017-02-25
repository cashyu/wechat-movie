/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var koa = require('koa');
var path = require('path');
var crypto = require('crypto');
var mongoose = require('mongoose');
var fs = require('fs');

var dbUrl = 'mongodb://localhost/imooc';
mongoose.connect(dbUrl)
var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs  
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
        var stat = fs.statSync(newPath)

        if (stat.isFile()) {
          if (/(.*)\.(js|coffee)/.test(file)) {
            require(newPath)
          }   
        }   
        else if (stat.isDirectory()) {
          walk(newPath)
        }   
    })  
}
walk(models_path)

var menu = require('./wx/menu');
var wx = require('./wx/index');
var wechatApi = wx.getWechat();

wechatApi.deleteMenu().then(function() {
  return wechatApi.createMenu(menu);
}).then(function(msg) {
  console.log(msg)
});

var app = new koa();
var Router = require('koa-router');
var router = new Router();
var game = require('./app/controllers/game');
var wechat = require('./app/controllers/wechat');

console.log(__dirname + '/app/views');
var views = require('koa-views');
app.use(views(__dirname + '/app/views', {
  extension: 'jade'
}));



router.get('/movie', game.guess); 
router.get('/movie/:id', game.find);
router.get('/wx', wechat.hear);
router.post('/wx', wechat.hear);

app
  .use(router.routes()) //让路由生效
  .use(router.allowedMethods()) //允许的方法


app.listen(1234);

console.log('Listening:1234');
