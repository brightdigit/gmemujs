'use strict';

require(['gmemujs', 'string', 'jquery', 'async'], function (gmemujs, S, $, async) {
  var gameButtons = $('#games');
  $.get('games.csv', function (games) {
    async.map(S(games).lines(), function (line, cb) {
      cb(undefined, S(line).parseCSV(',', null, null));
    }, function (error, games) {
      async.each(games, function (game, cb) {
        gameButtons.append('<button type="button" data-href="nsf/' + game[1] + '" class="btn btn-default">'+game[0]+'</button>');
        cb();
      }, function (error) {
        gameButtons.find('button').click(function () {
          console.log($(this).data('href'));
          /*
           var xhr = new XMLHttpRequest();
            xhr.open("GET", 'nsf/megaman2.nsf', true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function(e) {
              var payload = new Uint8Array(this.response);
              var file = gmemujs.read(payload);
              var track = file.track(9);
              console.log(track.info());
              console.log('start');
              track.play();
            };
            xhr.send();
            */
        });
      })
    });
  });
});