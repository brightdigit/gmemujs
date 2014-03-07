!function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(name, definition)
    else this[name] = definition()
}('gmemujs', function () {
  var AudioContext = webkitAudioContext || mozAudioContext;
  var INT16_MAX = Math.pow(2, 32) - 1;
  var Module = function () {
    var _Module = function () {
      include "../../tmp/build/a.out.js"
      return Module;
    }();
    
    return {
      helloWorld : _Module.cwrap('gmemujs_test', "string", []),
      initialize : _Module.cwrap('initialize', "number", ["number", "number"]),
      openData : _Module.cwrap('open_data', "number", ["number","array","number"]),
      trackCount : _Module.cwrap('track_count', "number", ["number"]),
      openTrack : _Module.cwrap('open_track', "number", ["number", "number"]),
      trackInfo : _Module.cwrap('track_info', "string", ["number"]),
      trackStart : _Module.cwrap('track_start', "number", ["number"]),
      generateSoundData : _Module.cwrap('generate_sound_data', "number", ["number"]),
      getValue : _Module.getValue.bind(_Module)
    };
  }();
  
  var gmemujs = function () {
    this.audioContext = new AudioContext();
    this.scriptProcessor = this.audioContext.createScriptProcessor(8192, 2, 2);
    this.scriptProcessor.onaudioprocess = this._onaudioprocess.bind(this);
    this._c_albumBuilder = Module.initialize(this.audioContext.sampleRate, this.scriptProcessor.bufferSize);
  };

  gmemujs.prototype = {
    _c_albumBuilder : undefined,
    _c_playInfo : undefined,
    audioContext : undefined,
    scriptProcessor : undefined,

    _onaudioprocess : function (e) {
      if (this._c_playInfo) {
        var bufferSize = this.scriptProcessor.bufferSize;
        var buffer = Module.generateSoundData(bufferSize);
        //var channels = [e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1)];
        //console.log(buffer);
                var left = e.outputBuffer.getChannelData(0);
                var right = e.outputBuffer.getChannelData(1);
        //console.log(e.outputBuffer.numberOfChannels);
         for (var i = 0; i < bufferSize; i++) {
         
            left[i] = Module.getValue(buffer + (i * 4), 'i16');
            right[i] = Module.getValue(buffer + (i * 4) + 2, 'i16');
            if (left[i] + right[1]) {
            console.log(i + ": " + left[i] + ", " + right[i]);
          }
          }
      }
    },
    read : function (data) {
      return new Album (this, data);
    },
    play : function (track) {
      this._c_playInfo = Module.trackStart(track._c_track);
      this.scriptProcessor.connect(this.audioContext.destination);
      console.log('play begin');
    }
  };

  gmemujs.read = function (data) {
    var _instance = new gmemujs ();
    return _instance.read(data);
  };

  var Album = function (gme, data) {
    // Module here
    this._c_album = Module.openData(gme._c_albumBuilder, data, data.length);
    this.gme = gme;
  };

  Album.prototype = {
    _c_album : undefined,
    gme : undefined,
    _trackCount : undefined,
    trackCount : function () {
      return this._trackCount || (this._trackCount = Module.trackCount(this._c_album));
    },
    track : function (trackNumber) {
      if (trackNumber > this.trackCount() || trackNumber < 0) {
        // do something
        return undefined;
      } 

      return new Track (this, trackNumber);
    }
  };

  var Track = function (album, number) {
    this.album = album;
    this.number = number;
    this._c_track = Module.openTrack(album, number);
  };

  Track.prototype = {
    _c_track : undefined,
    _info : undefined,
    info : function (field) {
      this._info =  this._info || JSON.parse(Module.trackInfo(this._c_track));
      return field ? this._info[field] : {
        "length": this._info.length,
        "system": this._info.system,
        "game": this._info.game,
        "song": this._info.song,
        "author": this._info.author,
        "copyright": this._info.copyright,
        "comment": this._info.comment,
        "dumper": this._info.dumper
      };
    },
    play : function () {
      this.album.gme.play(this);
    }
  };

  return gmemujs;
});