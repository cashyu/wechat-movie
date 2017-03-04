

'use strict'

module.exports = {
  'button': [{
    'name':'排行榜',
    'sub_button': [{
      'name': '最热门电影排行榜',
      'type': 'click',
      'key': 'movie_hot'
    }, {
      'name': '最冷门电影排行榜',
      'type': 'click',
      'key': 'movie_cold'
    }]
  }, {
    'name': '分类',
    'sub_button': [{
      'name': '动画',
      'type': 'click',
      'key': 'movie_cartoon'
    }, {
      'name': '动作',
      'type': 'click',
      'key': 'movie_action'
    }]
  }, {
    'name': '帮助',
    'type': 'click',
    'key': 'help'
  }]
};

