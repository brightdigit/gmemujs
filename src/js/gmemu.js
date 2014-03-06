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
    this.scriptProcessor = this.audioContext.createScriptProcessor();
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
        var buffer = Module.generateSoundData(this._c_playInfo);
        var bufferSize = this.scriptProcessor.bufferSize;
        var channels = [e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1)];
        console.log(bufferSize);
        for (var i = 0; i < bufferSize; i++)
          for (var n = 0; n < e.outputBuffer.numberOfChannels; n++)
            channels[n][i] = Module.getValue(buffer + i * e.outputBuffer.numberOfChannels * 2 + n * 4, "i32") / INT16_MAX;
      }
    },
    read : function (data) {
      return new Album (this, data);
    },
    play : function (track) {
      this._c_playInfo = Module.trackStart(track._c_track);
      this.scriptProcessor.connect(this.audioContext.destination);
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
      this._info =  this._info || JSON.parse(Module.trackInfo(this.number));
      return this._info[field];
    },
    play : function () {
      this.album.gme.play(this);
    }
  };

  return gmemujs;
});