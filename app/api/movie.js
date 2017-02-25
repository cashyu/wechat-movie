var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var koa_request = require('koa-request');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var _ = require('lodash');

// index page
exports.findAll = function *() {
  var categories = yield Category
    .find({})
    .populate({
      path: 'movies',
      select: 'title poster',
      options: { limit: 6 }
    })
    .exec()
    return categories;
};

// search page
exports.searchByCategory = function *(catId) {
  var categories = yield Category
    .find({_id: catId})
    .populate({
      path: 'movies',
      select: 'title poster'
    })
    .exec()
  return categories;
};
exports.searchByName = function *(q) {
  var movies = yield Movie
    .find({title: new RegExp(q + '.*', 'i')})
    .exec()
  return movies;
};

exports.searchById = function *(id) {
  var movie = yield Movie
    .findOne({_id: id})
    .exec()
  return movie;
};

function updateMovies(movie) {
  var options = {
    url: 'https://api.douban.com/v2/movie/subject/' + movie.doubanId,
    json: true
  }
  console.log("3333333333333333333333333333333333");
  console.log(options)
  request(options).then(function(response){
    console.log("222222222222222222222222222222222222222222222222222222222222");
    console.log(response.body)
    var data = response.body;
    _.extend(movie, {
      country: data.countries[0],
      language: data.language,
      summary: data.summary
    });
    var genres = movie.genres;
    if(genres && genres.length > 0) {
      var cateArray = [];
      genres.forEach(function(genre) {
        cateArray.push(function *() {
          var cat = yield Category.findOne({name: genre}).exec();
          if(cat) {
            cat.movie.push(movie._id);
            yield cat.save();
          }else {
            cat = new Category({
              name: genre,
              movies: [movie._id]
            });
            cat = yield cat.save();
            movie.category = cat._id;
            yield movie.save();
          }
        });
      });
    }else {
      movie.save();
    }
  }); 
}

exports.searchByDouban = function *(q)  {
  var options = {
    url: 'https://api.douban.com/v2/movie/search?q='
  }
  options.url += encodeURIComponent(q) ;
  var reponse = yield koa_request(options);
  var data = JSON.parse(reponse.body);
  var subjects = [];
  var movies = [];

  if(data && data.subjects) {
    subjects = data.subjects;
  }
  
  if(subjects.length > 0) {
    var queryArry = [];

    subjects.forEach(function(item) {
      queryArry.push(function *() {
        var movie = yield Movie.findOne({doubanId: item.id});
        if(movie) {
          movies.push(movie);
        }else {
          var directors = item.directors || [];
          var director = directors[0] || {};
          movie = new Movie({
            director: director.name || '',
            title: item.title,
            doubanId: item.id,
            poster: item.images.large,
            year: item.year,
            genres: item.genres || []
          });
          movie = yield movie.save();
          movies.push(movie);
        }
      });
    });
    console.log("ccccccccccccccccccccccccccccccccccccccccc");
    console.log(movies)
    yield queryArry;
    movies.forEach(function(movie) {
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
      updateMovies(movie)
    });

  }
  return movies;
};
