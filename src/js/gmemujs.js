!function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(name, definition)
    else this[name] = definition()
}('gmemujs', function () {
  
      var _Module = function () {
        include "../../tmp/build/a.out.js"
        return Module;
      }();

      var Module = function(Module) {
        return {
          initialize: Module.cwrap('initialize', "number", ["number", "number"]),
          openData: Module.cwrap('open_data', "number", ["number", "array", "number"]),
          trackCount: Module.cwrap('track_count', "number", ["number"]),
          openTrack: Module.cwrap('open_track', "number", ["number", "number"]),
          trackInfo: Module.cwrap('track_info', "string", ["number"]),
          trackStart: Module.cwrap('track_start', "number", ["number"]),
          generateSoundData: Module.cwrap('generate_sound_data', "number", ["number"]),
          getValue: Module.getValue.bind(Module)
        };
      }(_Module);
      return function(_Module) {

      var INT16_MAX = Math.pow(2, 32) - 1;
      var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
      var audioContext = new AudioContext();
      var scriptProcessor = audioContext.createScriptProcessor(8192, 2, 2);
      var bufferNode = audioContext.createBufferSource();
      var buffer = audioContext.createBuffer(2, 8192, audioContext.sampleRate);
      var gain = audioContext.createGain();
      var paused = false;


      var _c_albumBuilder = Module.initialize(44100, 8192);


      var gme = function() {

      };

      gme.Module = Module;

      gme.prototype = {};

      gme.load = function(path, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function(e) {
          cb(new File(_c_albumBuilder, this.response), e, xhr);
        };
        xhr.send();
        return xhr;
      };

      gme.play = function(track) {
        Module.trackStart(track._c_track);
        scriptProcessor.onaudioprocess = function(e) {
          var bufferSize = 8192;
          var soundBuffer, channels;
          if (!paused) {
            soundBuffer = Module.generateSoundData(bufferSize);
            channels = [e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1)];

          }
          for (var i = 0; i < bufferSize; i++) {
            for (var n = 0; n < e.outputBuffer.numberOfChannels; n++) {
              var value = 0;
              if (!paused) {
                value = Module.getValue(soundBuffer + i * e.outputBuffer.numberOfChannels * 2 + n * 4, "i32") / INT16_MAX;
              }
              channels[n][i] = value;
            }
          }
        };
        gain.gain.value = 1;
        var data = buffer.getChannelData(0);
        for (var i = 0; i < 8192; i++) {
          data[i] = (Math.random() * 2) - 1;
        }
        data = buffer.getChannelData(1);
        for (i = 0; i < 8192; i++) {
          data[i] = (Math.random() * 2) - 1;
        }
        bufferNode.buffer = buffer;
        bufferNode.loop = true;
        bufferNode.connect(scriptProcessor);
        scriptProcessor.connect(gain);
        gain.connect(audioContext.destination);
        bufferNode.noteOn(0);
      };

      var File = function(albumBuilder, response) {
        var data = new Uint8Array(response);
        this._c_file = Module.openData(_c_albumBuilder, data, data.length);
      };

      File.prototype = {
        _c_file: undefined,
        track: function(trackNumber) {
          if (trackNumber > this.trackCount() || trackNumber < 0) {
            // do something
            return undefined;
          }

          return new Track(this, trackNumber);
        },
        _trackCount: undefined,
        trackCount: function() {
          return this._trackCount || (this._trackCount = Module.trackCount(this._c_file));
        },
      };

      var Track = function(file, trackNumber) {
        this.file = file;
        this.trackNumber = trackNumber;
        this._c_track = Module.openTrack(file._c_file, trackNumber);
      };

      Track.prototype = {
        _c_track: undefined,
        _info: undefined,
        info: function(field) {
          this._info = this._info || JSON.parse(Module.trackInfo(this._c_track));
          return field ? this._info[field] : {
            "length": this._info.length,
            "play_length": this._info.play_length, 
            "intro_length": this._info.intro_length, 
            "loop_length": this._info.loop_length,
            "system": this._info.system,
            "game": this._info.game,
            "song": this._info.song,
            "author": this._info.author,
            "copyright": this._info.copyright,
            "comment": this._info.comment,
            "dumper": this._info.dumper
          };
        }
      };

      return gme;
    }(Module);
 

});