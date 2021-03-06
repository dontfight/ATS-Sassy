var request = require('co-request');

exports.pattern = /^\/(?:video|youtube)(!)?(?:(?:\s+)(.+))?/i;

exports.aliases = ['video', 'youtube'];

exports.description = 'Searches for a video';

exports.examples = [
  '/video <b>{search phrase}</b>'
];

exports.run = function *() {
  var message = 'Sorry, I didn\'t find any good search results';
  var first = !!this.match[1];
  var query = this.match[2];
  query = query ? query.trim() : null;
  if (query) {
    var response = yield request.get({
      url: 'http://gdata.youtube.com/feeds/api/videos',
      qs: {
        'orderBy': 'relevance',
        'max-results': 10,
        'alt': 'json',
        'q': query
      }
    });
    if (response.body) {
      var data = JSON.parse(response.body);
      var videos = data.feed.entry;
      if (videos) {
        var index = first === true ? 0 : Math.floor(Math.random() * videos.length);
        var video = videos[index];
        video.link.some(function (link) {
          if (link.rel === 'alternate' & link.type === 'text/html') {
            message = link.href;
            return true;
          }
        });
      }
    }
  } else {
    return yield this.help();
  }
  yield this.text(message);
};
