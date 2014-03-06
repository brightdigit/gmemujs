!function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(name, definition)
    else this[name] = definition()
}('gmemujs', function () {
  var AudioContext = webkitAudioContext || mozAudioContext;

  var Module = function () {
    var _Module = function () {
      include "../../tmp/build/a.out.js"
      return Module;
    }();
    
    return {
      helloWorld : _Module.cwrap('gmemujs_test', "string", []),
      initialize : _Module.cwrap('initialize', "number", ["number"]),
      openData : _Module.cwrap('open_data', "number", ["number","array","number"]),
      trackCount : _Module.cwrap('track_count', "number", ["number"])
    };
  }();
  
  var gmemujs = function () {
    this.audioContext = new AudioContext();
    this._c_albumBuilder = Module.initialize(this.audioContext.sampleRate)
  };

  gmemujs.prototype = {
    _c_albumBuilder : undefined,
    audioContext : undefined,
    read : function (data) {
      return new Album (this, data);
    }
  };

  gmemujs.read = function (data) {
    var _instance = new gmemujs ();
    return _instance.read(data);
  };

  var Album = function (gme, data) {
    // Module here
    this._c_album = Module.openData(gme._c_albumBuilder, data, data.length);
  };

  Album.prototype = {
    trackCount : function () {
      return Module.trackCount(this._c_album);
    }
  };

  
  return gmemujs;
});