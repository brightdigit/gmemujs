'use strict';

require(['gmemujs','string','jquery', 'async'], function (gmemujs, S, $, async) {
  $.get('games.csv', function (games) {
    async.map(S(games).lines(), function (line, cb) {
      cb(undefined, S(line).parseCSV(',',null,null));
    }, function (error, games) {
      console.log(games);
    });
  });
});