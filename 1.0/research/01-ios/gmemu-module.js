// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===
var __ZTVN10__cxxabiv117__class_type_infoE = 55600;
var __ZTVN10__cxxabiv120__si_class_type_infoE = 55640;




STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(56403);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([123,34,108,101,110,103,116,104,34,58,32,37,100,44,32,34,112,108,97,121,95,108,101,110,103,116,104,34,58,32,37,100,44,32,34,105,110,116,114,111,95,108,101,110,103,116,104,34,58,32,37,100,44,32,34,108,111,111,112,95,108,101,110,103,116,104,34,58,32,37,100,44,32,34,115,121,115,116,101,109,34,58,32,34,37,115,34,44,32,34,103,97,109,101,34,58,32,34,37,115,34,44,32,34,115,111,110,103,34,58,32,34,37,115,34,44,32,34,97,117,116,104,111,114,34,58,32,34,37,115,34,44,32,34,99,111,112,121,114,105,103,104,116,34,58,32,34,37,115,34,44,32,34,99,111,109,109,101,110,116,34,58,32,34,37,115,34,44,32,34,100,117,109,112,101,114,34,58,32,34,37,115,34,125,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,104,101,108,108,111,32,119,111,114,108,100,33], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([21,1,25,61,42,62,38,2,0,2,3,4,6,8,11,16,23,32,45,64,90,128,180,255,40,117,110,115,105,103,110,101,100,41,32,97,100,100,114,32,60,32,114,101,103,95,99,111,117,110,116,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,65,121,95,65,112,117,46,99,112,112,0,0,0,0,0,0,0,119,114,105,116,101,95,100,97,116,97,95,0,0,0,0,0,102,105,110,97,108,95,101,110,100,95,116,105,109,101,32,62,61,32,108,97,115,116,95,116,105,109,101,0,0,0,0,0,114,117,110,95,117,110,116,105,108,0,0,0,0,0,0,0,45,114,101,109,97,105,110,32,60,61,32,101,110,118,95,112,101,114,105,111,100,0,0,0,101,110,118,46,100,101,108,97,121,32,62,32,48,0,0,0,101,110,118,46,112,111,115,32,60,32,48,0,0,0,0,0,40,98,108,105,112,95,108,111,110,103,41,32,40,116,105,109,101,32,62,62,32,66,76,73,80,95,66,85,70,70,69,82,95,65,67,67,85,82,65,67,89,41,32,60,32,98,108,105,112,95,98,117,102,45,62,98,117,102,102,101,114,95,115,105,122,101,95,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,66,108,105,112,95,66,117,102,102,101,114,46,104,0,0,0,0,111,102,102,115,101,116,95,114,101,115,97,109,112,108,101,100,0,0,0,0,0,0,0,0,4,10,7,6,4,4,7,4,4,11,7,6,4,4,7,4,13,10,7,6,4,4,7,4,12,11,7,6,4,4,7,4,12,10,16,6,4,4,7,4,12,11,16,6,4,4,7,4,12,10,13,6,11,11,10,4,12,11,13,6,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,7,7,7,7,7,7,4,7,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,11,10,10,10,17,11,7,11,11,10,10,8,17,17,7,11,11,10,10,11,17,11,7,11,11,4,10,11,17,8,7,11,11,10,10,19,17,11,7,11,11,4,10,4,17,8,7,11,11,10,10,4,17,11,7,11,11,6,10,4,17,8,7,11,102,97,108,115,101,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,65,121,95,67,112,117,46,99,112,112,0,0,0,0,0,0,0,114,117,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,6,12,2,0,0,3,0,0,7,12,2,0,0,3,0,0,0,0,0,15,15,11,0,0,7,0,0,0,0,0,0,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,160,64,64,112,192,0,96,11,160,75,75,123,203,11,107,0,11,64,64,112,192,0,96,11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,128,128,128,128,0,0,11,0,128,128,128,128,0,0,11,0,208,208,208,208,0,0,11,0,208,208,208,208,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,15,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,216,141,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,40,141,0,0,0,0,0,0,248,140,0,0,0,141,0,0,8,141,0,0,16,141,0,0,87,97,118,101,32,49,0,0,87,97,118,101,32,50,0,0,87,97,118,101,32,51,0,0,66,101,101,112,101,114,0,0,0,1,0,0,1,1,0,0,2,1,0,0,0,3,0,0,80,143,0,0,0,0,0,0,1,0,0,0,2,0,0,0,96,143,0,0,1,0,0,0,85,110,107,110,111,119,110,32,102,105,108,101,32,118,101,114,115,105,111,110,0,0,0,0,70,105,108,101,32,100,97,116,97,32,109,105,115,115,105,110,103,0,0,0,0,0,0,0,66,97,100,32,100,97,116,97,32,98,108,111,99,107,32,115,105,122,101,0,0,0,0,0,77,105,115,115,105,110,103,32,102,105,108,101,32,100,97,116,97,0,0,0,0,0,0,0,243,205,0,0,237,94,251,118,24,250,0,0,0,0,0,0,243,205,0,0,237,86,251,118,205,0,0,24,247,0,0,0,54,65,121,95,69,109,117,0,54,65,121,95,67,112,117,0,56,217,0,0,200,141,0,0,192,217,0,0,192,141,0,0,0,0,0,0,2,0,0,0,208,141,0,0,0,80,1,0,72,146,0,0,2,0,0,0,33,98,117,102,32,38,38,32,110,101,119,95,98,117,102,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,67,108,97,115,115,105,99,95,69,109,117,46,104,0,0,0,0,115,101,116,95,98,117,102,102,101,114,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,116,105,109,101,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,65,121,95,65,112,117,46,104,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,112,111,115,32,60,61,32,40,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,102,105,108,101,95,115,105,122,101,32,45,32,50,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,65,121,95,69,109,117,46,99,112,112,0,0,0,0,0,0,0,103,101,116,95,100,97,116,97,0,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,90,88,65,89,69,77,85,76,0,0,0,0,0,0,0,0,77,105,115,115,105,110,103,32,116,114,97,99,107,32,100,97,116,97,0,0,0,0,0,0,90,88,32,83,112,101,99,116,114,117,109,0,0,0,0,0,65,89,0,0,0,0,0,0,0,0,0,0,200,143,0,0,7,0,0,0,8,0,0,0,3,0,0,0,1,0,0,0,5,0,0,0,6,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,55,65,121,95,70,105,108,101,0,0,0,0,0,0,0,0,96,217,0,0,184,143,0,0,32,176,0,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,66,108,105,112,95,66,117,102,102,101,114,46,99,112,112,0,0,48,0,0,0,0,0,0,0,115,101,116,95,115,97,109,112,108,101,95,114,97,116,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,98,117,102,102,101,114,95,115,105,122,101,95,32,33,61,32,115,105,108,101,110,116,95,98,117,102,95,115,105,122,101,0,108,101,110,103,116,104,95,32,61,61,32,109,115,101,99,0,102,97,99,116,111,114,32,62,32,48,32,124,124,32,33,115,97,109,112,108,101,95,114,97,116,101,95,0,0,0,0,0,99,108,111,99,107,95,114,97,116,101,95,102,97,99,116,111,114,0,0,0,0,0,0,0,115,97,109,112,108,101,115,95,97,118,97,105,108,40,41,32,60,61,32,40,108,111,110,103,41,32,98,117,102,102,101,114,95,115,105,122,101,95,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,99,111,117,110,116,32,60,61,32,115,97,109,112,108,101,115,95,97,118,97,105,108,40,41,0,0,0,0,0,0,0,0,114,101,109,111,118,101,95,115,105,108,101,110,99,101,0,0,99,111,117,110,116,95,99,108,111,99,107,115,0,0,0,0,107,101,114,110,101,108,95,117,110,105,116,32,62,32,48,0,118,111,108,117,109,101,95,117,110,105,116,0,0,0,0,0,0,0,0,0,72,146,0,0,11,0,0,0,12,0,0,0,3,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,40,99,104,46,99,101,110,116,101,114,32,38,38,32,99,104,46,108,101,102,116,32,38,38,32,99,104,46,114,105,103,104,116,41,32,124,124,32,40,33,99,104,46,99,101,110,116,101,114,32,38,38,32,33,99,104,46,108,101,102,116,32,38,38,32,33,99,104,46,114,105,103,104,116,41,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,67,108,97,115,115,105,99,95,69,109,117,46,99,112,112,0,0,109,117,116,101,95,118,111,105,99,101,115,95,0,0,0,0,99,108,111,99,107,115,95,101,109,117,108,97,116,101,100,0,112,108,97,121,95,0,0,0,49,49,67,108,97,115,115,105,99,95,69,109,117,0,0,0,96,217,0,0,56,146,0,0,0,176,0,0,0,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,85,110,101,120,112,101,99,116,101,100,32,101,110,100,32,111,102,32,102,105,108,101,0,0,82,101,97,100,32,101,114,114,111,114,0,0,0,0,0,0,110,32,62,61,32,48,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,68,97,116,97,95,82,101,97,100,101,114,46,99,112,112,0,0,115,107,105,112,0,0,0,0,0,0,0,0,152,147,0,0,13,0,0,0,14,0,0,0,9,0,0,0,10,0,0,0,1,0,0,0,7,0,0,0,0,0,0,0,192,147,0,0,15,0,0,0,16,0,0,0,11,0,0,0,12,0,0,0,2,0,0,0,7,0,0,0,0,0,0,0,8,148,0,0,17,0,0,0,18,0,0,0,13,0,0,0,10,0,0,0,3,0,0,0,8,0,0,0,4,0,0,0,5,0,0,0,9,0,0,0,0,0,0,0,49,49,68,97,116,97,95,82,101,97,100,101,114,0,0,0,56,217,0,0,112,147,0,0,49,51,83,117,98,115,101,116,95,82,101,97,100,101,114,0,96,217,0,0,136,147,0,0,128,147,0,0,0,0,0,0,49,54,82,101,109,97,105,110,105,110,103,95,82,101,97,100,101,114,0,0,0,0,0,0,96,217,0,0,168,147,0,0,128,147,0,0,0,0,0,0,49,49,70,105,108,101,95,82,101,97,100,101,114,0,0,0,96,217,0,0,208,147,0,0,128,147,0,0,0,0,0,0,49,53,77,101,109,95,70,105,108,101,95,82,101,97,100,101,114,0,0,0,0,0,0,0,96,217,0,0,240,147,0,0,224,147,0,0,0,0,0,0,0,0,0,0,240,148,0,0,19,0,0,0,20,0,0,0,1,0,0,0,0,0,0,0,110,101,119,95,99,111,117,110,116,32,60,32,114,101,115,97,109,112,108,101,114,95,115,105,122,101,0,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,68,117,97,108,95,82,101,115,97,109,112,108,101,114,46,99,112,112,0,0,0,0,0,0,0,112,108,97,121,95,102,114,97,109,101,95,0,0,0,0,0,98,108,105,112,95,98,117,102,46,115,97,109,112,108,101,115,95,97,118,97,105,108,40,41,32,61,61,32,112,97,105,114,95,99,111,117,110,116,0,0,99,111,117,110,116,32,61,61,32,40,108,111,110,103,41,32,115,97,109,112,108,101,95,98,117,102,95,115,105,122,101,0,49,52,68,117,97,108,95,82,101,115,97,109,112,108,101,114,0,0,0,0,0,0,0,0,56,217,0,0,216,148,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,119,114,105,116,101,95,112,111,115,32,60,61,32,98,117,102,46,101,110,100,40,41,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,70,105,114,95,82,101,115,97,109,112,108,101,114,46,104,0,0,119,114,105,116,101,0,0,0,0,0,0,0,64,150,0,0,21,0,0,0,22,0,0,0,10,0,0,0,1,0,0,0,14,0,0,0,10,0,0,0,11,0,0,0,23,0,0,0,12,0,0,0,15,0,0,0,6,0,0,0,13,0,0,0,116,111,116,97,108,95,115,97,109,112,108,101,115,32,37,32,50,32,61,61,32,48,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,69,102,102,101,99,116,115,95,66,117,102,102,101,114,46,99,112,112,0,0,0,0,0,0,0,114,101,97,100,95,115,97,109,112,108,101,115,0,0,0,0,49,52,69,102,102,101,99,116,115,95,66,117,102,102,101,114,0,0,0,0,0,0,0,0,96,217,0,0,40,150,0,0,0,174,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,110,100,101,120,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,71,98,95,65,112,117,46,99,112,112,0,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,40,99,101,110,116,101,114,32,38,38,32,108,101,102,116,32,38,38,32,114,105,103,104,116,41,32,124,124,32,40,33,99,101,110,116,101,114,32,38,38,32,33,108,101,102,116,32,38,38,32,33,114,105,103,104,116,41,0,0,0,0,0,0,0,132,64,67,170,45,120,146,60,96,89,89,176,52,184,46,218,101,110,100,95,116,105,109,101,32,62,61,32,108,97,115,116,95,116,105,109,101,0,0,0,114,117,110,95,117,110,116,105,108,0,0,0,0,0,0,0,110,101,120,116,95,102,114,97,109,101,95,116,105,109,101,32,62,61,32,101,110,100,95,116,105,109,101,0,0,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,101,110,100,95,116,105,109,101,0,0,0,40,117,110,115,105,103,110,101,100,41,32,100,97,116,97,32,60,32,48,120,49,48,48,0,119,114,105,116,101,95,114,101,103,105,115,116,101,114,0,0,128,63,0,255,191,255,63,0,255,191,127,255,159,255,191,255,255,0,0,191,0,119,128,255,255,255,255,255,255,255,255,255,40,117,110,115,105,103,110,101,100,41,32,105,110,100,101,120,32,60,32,114,101,103,105,115,116,101,114,95,99,111,117,110,116,0,0,0,0,0,0,0,114,101,97,100,95,114,101,103,105,115,116,101,114,0,0,0,40,98,108,105,112,95,108,111,110,103,41,32,40,116,105,109,101,32,62,62,32,66,76,73,80,95,66,85,70,70,69,82,95,65,67,67,85,82,65,67,89,41,32,60,32,98,108,105,112,95,98,117,102,45,62,98,117,102,102,101,114,95,115,105,122,101,95,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,66,108,105,112,95,66,117,102,102,101,114,46,104,0,0,0,0,111,102,102,115,101,116,95,114,101,115,97,109,112,108,101,100,0,0,0,0,0,0,0,0,115,116,97,114,116,32,37,32,112,97,103,101,95,115,105,122,101,32,61,61,32,48,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,71,98,95,67,112,117,46,99,112,112,0,0,0,0,0,0,0,109,97,112,95,99,111,100,101,0,0,0,0,0,0,0,0,115,105,122,101,32,37,32,112,97,103,101,95,115,105,122,101,32,61,61,32,48,0,0,0,102,97,108,115,101,0,0,0,114,117,110,0,0,0,0,0,42,40,118,111,108,97,116,105,108,101,32,99,104,97,114,42,41,32,38,105,32,33,61,32,48,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,101,110,100,105,97,110,46,104,0,0,98,108,97,114,103,103,95,118,101,114,105,102,121,95,98,121,116,101,95,111,114,100,101,114,0,0,0,0,0,0,0,0,1,2,4,6,0,0,0,0,8,16,32,48,64,80,96,112,0,0,0,0,120,155,0,0,24,0,0,0,25,0,0,0,26,0,0,0,11,0,0,0,8,0,0,0,16,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,12,0,0,0,3,0,0,0,4,0,0,0,2,0,0,0,14,0,0,0,17,0,0,0,0,0,0,0,128,154,0,0,0,0,0,0,64,154,0,0,80,154,0,0,96,154,0,0,104,154,0,0,83,113,117,97,114,101,32,49,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,50,0,0,0,0,0,0,0,0,87,97,118,101,0,0,0,0,78,111,105,115,101,0,0,0,1,1,0,0,2,1,0,0,0,1,0,0,0,3,0,0,232,155,0,0,0,0,0,0,3,0,0,0,4,0,0,0,224,155,0,0,1,0,0,0,85,110,107,110,111,119,110,32,102,105,108,101,32,118,101,114,115,105,111,110,0,0,0,0,73,110,118,97,108,105,100,32,116,105,109,101,114,32,109,111,100,101,0,0,0,0,0,0,73,110,118,97,108,105,100,32,108,111,97,100,47,105,110,105,116,47,112,108,97,121,32,97,100,100,114,101,115,115,0,0,10,4,6,8,0,0,0,0,128,191,0,0,191,0,63,0,0,191,127,255,159,0,191,0,255,0,0,191,119,243,241,0,0,0,0,0,0,0,0,0,172,221,218,72,54,2,207,22,44,4,229,44,172,221,218,72,69,109,117,108,97,116,105,111,110,32,101,114,114,111,114,32,40,105,108,108,101,103,97,108,47,117,110,115,117,112,112,111,114,116,101,100,32,105,110,115,116,114,117,99,116,105,111,110,41,0,0,0,0,0,0,0,55,71,98,115,95,69,109,117,0,0,0,0,0,0,0,0,54,71,98,95,67,112,117,0,56,217,0,0,104,155,0,0,192,217,0,0,88,155,0,0,0,0,0,0,2,0,0,0,112,155,0,0,0,80,1,0,72,146,0,0,2,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,71,66,83,0,0,0,0,0,71,97,109,101,32,66,111,121,0,0,0,0,0,0,0,0,0,0,0,0,88,156,0,0,27,0,0,0,28,0,0,0,3,0,0,0,13,0,0,0,8,0,0,0,18,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,71,98,115,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,72,156,0,0,32,176,0,0,0,0,0,0,33,115,97,109,112,108,101,95,114,97,116,101,40,41,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,77,117,115,105,99,95,69,109,117,46,104,0,0,0,0,0,0,115,101,116,95,103,97,105,110,0,0,0,0,0,0,0,0,87,114,111,110,103,32,102,105,108,101,32,116,121,112,101,32,102,111,114,32,116,104,105,115,32,101,109,117,108,97,116,111,114,0,0,0,0,0,0,0,176,156,0,0,0,0,0,0,0,0,0,0,192,157,0,0,29,0,0,0,30,0,0,0,31,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,32,0,0,0,33,0,0,0,6,0,0,0,0,0,0,0,100,97,116,97,32,33,61,32,102,105,108,101,95,100,97,116,97,46,98,101,103,105,110,40,41,0,0,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,71,109,101,95,70,105,108,101,46,99,112,112,0,0,0,0,0,108,111,97,100,95,109,101,109,95,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,60,63,62,0,0,0,0,0,60,32,63,32,62,0,0,0,73,110,118,97,108,105,100,32,116,114,97,99,107,0,0,0,73,110,118,97,108,105,100,32,116,114,97,99,107,32,105,110,32,109,51,117,32,112,108,97,121,108,105,115,116,0,0,0,56,71,109,101,95,70,105,108,101,0,0,0,0,0,0,0,56,217,0,0,176,157,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,42,40,118,111,108,97,116,105,108,101,32,99,104,97,114,42,41,32,38,105,32,33,61,32,48,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,101,110,100,105,97,110,46,104,0,0,98,108,97,114,103,103,95,118,101,114,105,102,121,95,98,121,116,101,95,111,114,100,101,114,0,0,0,0,0,0,0,0,0,0,0,0,128,159,0,0,34,0,0,0,35,0,0,0,3,0,0,0,1,0,0,0,19,0,0,0,20,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,6,0,0,0,14,0,0,0,15,0,0,0,3,0,0,0,16,0,0,0,4,0,0,0,15,0,0,0,21,0,0,0,4,0,0,0,1,0,0,0,192,254,255,255,128,159,0,0,36,0,0,0,37,0,0,0,2,0,0,0,88,159,0,0,0,0,0,0,24,159,0,0,32,159,0,0,40,159,0,0,48,159,0,0,56,159,0,0,64,159,0,0,72,159,0,0,80,159,0,0,70,77,32,49,0,0,0,0,70,77,32,50,0,0,0,0,70,77,32,51,0,0,0,0,70,77,32,52,0,0,0,0,70,77,32,53,0,0,0,0,70,77,32,54,0,0,0,0,80,67,77,0,0,0,0,0,80,83,71,0,0,0,0,0,208,159,0,0,1,0,0,0,5,0,0,0,6,0,0,0,224,159,0,0,0,0,0,0,55,71,121,109,95,69,109,117,0,0,0,0,0,0,0,0,192,217,0,0,112,159,0,0,0,0,0,0,2,0,0,0,0,176,0,0,2,0,0,0,240,148,0,0,0,64,1,0,71,89,77,88,0,0,0,0,0,0,0,0,0,0,0,0,80,97,99,107,101,100,32,71,89,77,32,102,105,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,83,101,103,97,32,71,101,110,101,115,105,115,0,0,0,0,71,89,77,0,0,0,0,0,0,0,0,0,72,160,0,0,38,0,0,0,39,0,0,0,3,0,0,0,1,0,0,0,22,0,0,0,23,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,71,121,109,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,56,160,0,0,32,176,0,0,0,0,0,0,85,110,107,110,111,119,110,32,83,111,110,103,0,0,0,0,85,110,107,110,111,119,110,32,71,97,109,101,0,0,0,0,85,110,107,110,111,119,110,32,80,117,98,108,105,115,104,101,114,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,80,101,114,115,111,110,0,0,72,101,97,100,101,114,32,97,100,100,101,100,32,98,121,32,89,77,65,77,80,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,110,100,101,120,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,72,101,115,95,65,112,117,46,99,112,112,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,110,111,105,115,101,95,108,102,115,114,0,0,0,0,0,0,114,117,110,95,117,110,116,105,108,0,0,0,0,0,0,0,0,0,6,0,7,0,8,0,10,0,12,0,14,0,17,0,20,0,23,0,28,0,33,0,39,0,47,0,56,0,66,0,79,0,93,0,111,0,132,0,157,0,187,0,222,0,8,1,58,1,118,1,188,1,17,2,117,2,235,2,121,3,33,4,111,115,99,45,62,108,97,115,116,95,116,105,109,101,32,62,61,32,101,110,100,95,116,105,109,101,0,0,0,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,114,101,103,32,60,61,32,112,97,103,101,95,99,111,117,110,116,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,72,101,115,95,67,112,117,46,99,112,112,0,0,0,0,0,0,115,101,116,95,109,109,114,0,40,117,110,115,105,103,110,101,100,41,32,98,97,110,107,32,60,32,48,120,49,48,48,0,1,7,3,4,6,4,6,7,3,2,2,2,7,5,7,6,4,7,7,4,6,4,6,7,2,5,2,2,7,5,7,6,7,7,3,4,4,4,6,7,4,2,2,2,5,5,7,6,4,7,7,2,4,4,6,7,2,5,2,2,5,5,7,6,7,7,3,4,8,4,6,7,3,2,2,2,4,5,7,6,4,7,7,5,2,4,6,7,2,5,3,2,2,5,7,6,7,7,2,2,4,4,6,7,4,2,2,2,7,5,7,6,4,7,7,17,4,4,6,7,2,5,4,2,7,5,7,6,4,7,2,7,4,4,4,7,2,2,2,2,5,5,5,6,4,7,7,8,4,4,4,7,2,5,2,2,5,5,5,6,2,7,2,7,4,4,4,7,2,2,2,2,5,5,5,6,4,7,7,8,4,4,4,7,2,5,2,2,5,5,5,6,2,7,2,17,4,4,6,7,2,2,2,2,5,5,7,6,4,7,7,17,2,4,6,7,2,5,3,2,2,5,7,6,2,7,2,17,4,4,6,7,2,2,2,2,5,5,7,6,4,7,7,17,2,4,6,7,2,5,4,2,2,5,7,6,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,42,40,118,111,108,97,116,105,108,101,32,99,104,97,114,42,41,32,38,105,32,33,61,32,48,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,101,110,100,105,97,110,46,104,0,0,98,108,97,114,103,103,95,118,101,114,105,102,121,95,98,121,116,101,95,111,114,100,101,114,0,0,0,0,0,0,0,0,0,0,0,0,200,165,0,0,40,0,0,0,41,0,0,0,42,0,0,0,16,0,0,0,8,0,0,0,24,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,17,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,17,0,0,0,25,0,0,0,0,0,0,0,128,164,0,0,0,0,0,0,56,164,0,0,64,164,0,0,72,164,0,0,80,164,0,0,88,164,0,0,96,164,0,0,87,97,118,101,32,49,0,0,87,97,118,101,32,50,0,0,87,97,118,101,32,51,0,0,87,97,118,101,32,52,0,0,77,117,108,116,105,32,49,0,77,117,108,116,105,32,50,0,0,1,0,0,1,1,0,0,2,1,0,0,3,1,0,0,0,3,0,0,1,3,0,0,64,166,0,0,0,1,0,0,7,0,0,0,8,0,0,0,80,166,0,0,1,0,0,0,85,110,107,110,111,119,110,32,102,105,108,101,32,118,101,114,115,105,111,110,0,0,0,0,68,65,84,65,0,0,0,0,68,97,116,97,32,104,101,97,100,101,114,32,109,105,115,115,105,110,103,0,0,0,0,0,0,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,104,101,97,100,101,114,32,100,97,116,97,0,0,0,0,0,73,110,118,97,108,105,100,32,97,100,100,114,101,115,115,0,73,110,118,97,108,105,100,32,115,105,122,101,0,0,0,0,77,117,108,116,105,112,108,101,32,68,65,84,65,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,69,120,116,114,97,32,102,105,108,101,32,100,97,116,97,0,77,105,115,115,105,110,103,32,102,105,108,101,32,100,97,116,97,0,0,0,0,0,0,0,83,99,97,110,108,105,110,101,32,105,110,116,101,114,114,117,112,116,32,117,110,115,117,112,112,111,114,116,101,100,0,0,69,109,117,108,97,116,105,111,110,32,101,114,114,111,114,32,40,105,108,108,101,103,97,108,32,105,110,115,116,114,117,99,116,105,111,110,41,0,0,0,55,72,101,115,95,69,109,117,0,0,0,0,0,0,0,0,55,72,101,115,95,67,112,117,0,0,0,0,0,0,0,0,56,217,0,0,176,165,0,0,192,217,0,0,160,165,0,0,0,0,0,0,2,0,0,0,192,165,0,0,0,80,1,0,72,146,0,0,2,0,0,0,115,116,97,116,101,32,61,61,32,38,115,116,97,116,101,95,0,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,72,101,115,95,67,112,117,46,104,0,0,0,0,0,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,72,69,83,77,0,0,0,0,80,67,32,69,110,103,105,110,101,0,0,0,0,0,0,0,72,69,83,0,0,0,0,0,0,0,0,0,184,166,0,0,43,0,0,0,44,0,0,0,3,0,0,0,18,0,0,0,8,0,0,0,26,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,72,101,115,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,168,166,0,0,32,176,0,0,0,0,0,0,33,115,97,109,112,108,101,95,114,97,116,101,40,41,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,77,117,115,105,99,95,69,109,117,46,104,0,0,0,0,0,0,115,101,116,95,103,97,105,110,0,0,0,0,0,0,0,0,97,100,100,114,32,37,32,112,97,103,101,95,115,105,122,101,32,61,61,32,48,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,75,115,115,95,67,112,117,46,99,112,112,0,0,0,0,0,0,109,97,112,95,109,101,109,0,115,105,122,101,32,37,32,112,97,103,101,95,115,105,122,101,32,61,61,32,48,0,0,0,4,10,7,6,4,4,7,4,4,11,7,6,4,4,7,4,13,10,7,6,4,4,7,4,12,11,7,6,4,4,7,4,12,10,16,6,4,4,7,4,12,11,16,6,4,4,7,4,12,10,13,6,11,11,10,4,12,11,13,6,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,7,7,7,7,7,7,4,7,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,4,4,4,4,4,4,7,4,11,10,10,10,17,11,7,11,11,10,10,8,17,17,7,11,11,10,10,11,17,11,7,11,11,4,10,11,17,8,7,11,11,10,10,19,17,11,7,11,11,4,10,4,17,8,7,11,11,10,10,4,17,11,7,11,11,6,10,4,17,8,7,11,102,97,108,115,101,0,0,0,114,117,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,6,12,2,0,0,3,0,0,7,12,2,0,0,3,0,0,0,0,0,15,15,11,0,0,7,0,0,0,0,0,0,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,16,64,64,112,192,0,96,11,160,64,64,112,192,0,96,11,160,75,75,123,203,11,107,0,11,64,64,112,192,0,96,11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,128,128,128,128,0,0,11,0,128,128,128,128,0,0,11,0,208,208,208,208,0,0,11,0,208,208,208,208,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,15,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,72,171,0,0,45,0,0,0,46,0,0,0,47,0,0,0,19,0,0,0,8,0,0,0,27,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,20,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,18,0,0,0,28,0,0,0,0,0,0,0,128,170,0,0,0,0,0,0,8,170,0,0,24,170,0,0,40,170,0,0,56,170,0,0,64,170,0,0,72,170,0,0,80,170,0,0,88,170,0,0,83,113,117,97,114,101,32,49,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,50,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,51,0,0,0,0,0,0,0,0,87,97,118,101,32,49,0,0,87,97,118,101,32,50,0,0,87,97,118,101,32,51,0,0,87,97,118,101,32,52,0,0,87,97,118,101,32,53,0,0,0,1,0,0,1,1,0,0,2,1,0,0,3,1,0,0,4,1,0,0,5,1,0,0,6,1,0,0,7,1,0,0,144,172,0,0,0,1,0,0,9,0,0,0,10,0,0,0,152,172,0,0,3,0,0,0,85,110,107,110,111,119,110,32,100,97,116,97,32,105,110,32,104,101,97,100,101,114,0,0,70,77,32,115,111,117,110,100,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,211,160,245,123,211,161,241,201,211,160,219,162,201,0,0,0,195,1,0,195,9,0,0,0,69,120,99,101,115,115,105,118,101,32,100,97,116,97,32,115,105,122,101,0,0,0,0,0,66,97,110,107,32,100,97,116,97,32,109,105,115,115,105,110,103,0,0,0,0,0,0,0,55,75,115,115,95,69,109,117,0,0,0,0,0,0,0,0,55,75,115,115,95,67,112,117,0,0,0,0,0,0,0,0,56,217,0,0,48,171,0,0,192,217,0,0,32,171,0,0,0,0,0,0,2,0,0,0,64,171,0,0,0,80,1,0,72,146,0,0,2,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,48,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,75,115,115,95,83,99,99,95,65,112,117,46,104,0,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,116,105,109,101,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,65,121,95,65,112,117,46,104,0,40,117,110,115,105,103,110,101,100,41,32,105,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,110,100,101,120,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,75,83,67,67,0,0,0,0,75,83,83,88,0,0,0,0,77,83,88,0,0,0,0,0,75,83,83,0,0,0,0,0,0,0,0,0,0,173,0,0,48,0,0,0,49,0,0,0,3,0,0,0,21,0,0,0,8,0,0,0,29,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,75,115,115,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,240,172,0,0,32,176,0,0,0,0,0,0,83,101,103,97,32,77,97,115,116,101,114,32,83,121,115,116,101,109,0,0,0,0,0,0,71,97,109,101,32,71,101,97,114,0,0,0,0,0,0,0,0,0,0,0,0,174,0,0,50,0,0,0,51,0,0,0,10,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,24,174,0,0,52,0,0,0,53,0,0,0,10,0,0,0,2,0,0,0,30,0,0,0,19,0,0,0,20,0,0,0,54,0,0,0,21,0,0,0,31,0,0,0,7,0,0,0,0,0,0,0,33,40,99,111,117,110,116,32,38,32,49,41,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,77,117,108,116,105,95,66,117,102,102,101,114,46,99,112,112,0,114,101,97,100,95,115,97,109,112,108,101,115,0,0,0,0,49,50,77,117,108,116,105,95,66,117,102,102,101,114,0,0,56,217,0,0,240,173,0,0,49,51,83,116,101,114,101,111,95,66,117,102,102,101,114,0,96,217,0,0,8,174,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,176,0,0,55,0,0,0,56,0,0,0,3,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,6,0,0,0,1,0,0,0,15,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,152,174,0,0,160,174,0,0,168,174,0,0,176,174,0,0,184,174,0,0,192,174,0,0,200,174,0,0,208,174,0,0,86,111,105,99,101,32,49,0,86,111,105,99,101,32,50,0,86,111,105,99,101,32,51,0,86,111,105,99,101,32,52,0,86,111,105,99,101,32,53,0,86,111,105,99,101,32,54,0,86,111,105,99,101,32,55,0,86,111,105,99,101,32,56,0,33,115,97,109,112,108,101,95,114,97,116,101,40,41,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,77,117,115,105,99,95,69,109,117,46,99,112,112,0,0,0,0,115,101,116,95,115,97,109,112,108,101,95,114,97,116,101,0,115,97,109,112,108,101,95,114,97,116,101,40,41,0,0,0,112,114,101,95,108,111,97,100,0,0,0,0,0,0,0,0,109,117,116,101,95,118,111,105,99,101,115,0,0,0,0,0,115,101,116,95,116,101,109,112,111,0,0,0,0,0,0,0,99,117,114,114,101,110,116,95,116,114,97,99,107,40,41,32,62,61,32,48,0,0,0,0,33,98,117,102,95,114,101,109,97,105,110,0,0,0,0,0,102,105,108,108,95,98,117,102,0,0,0,0,0,0,0,0,112,108,97,121,0,0,0,0,111,117,116,95,99,111,117,110,116,32,37,32,115,116,101,114,101,111,32,61,61,32,48,0,101,109,117,95,116,105,109,101,32,62,61,32,111,117,116,95,116,105,109,101,0,0,0,0,85,115,101,32,102,117,108,108,32,101,109,117,108,97,116,111,114,32,102,111,114,32,112,108,97,121,98,97,99,107,0,0,57,77,117,115,105,99,95,69,109,117,0,0,0,0,0,0,96,217,0,0,240,175,0,0,192,157,0,0,0,0,0,0,57,71,109,101,95,73,110,102,111,95,0,0,0,0,0,0,96,217,0,0,16,176,0,0,0,176,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,78,101,115,95,65,112,117,46,99,112,112,0,0,0,0,0,0,101,110,100,95,116,105,109,101,32,62,61,32,108,97,115,116,95,116,105,109,101,0,0,0,114,117,110,95,117,110,116,105,108,95,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,48,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,108,97,115,116,95,100,109,99,95,116,105,109,101,32,62,61,32,48,0,0,0,0,0,0,97,100,100,114,32,62,32,48,120,50,48,0,0,0,0,0,119,114,105,116,101,95,114,101,103,105,115,116,101,114], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+35040);
/* memory initializer */ allocate([40,117,110,115,105,103,110,101,100,41,32,100,97,116,97,32,60,61,32,48,120,70,70,0,10,254,20,2,40,4,80,6,160,8,60,10,14,12,26,14,12,16,24,18,48,20,96,22,192,24,72,26,16,28,32,30,40,117,110,115,105,103,110,101,100,41,32,111,115,99,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,78,101,115,95,65,112,117,46,104,0,0,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,73,110,118,97,108,105,100,32,98,97,110,107,0,0,0,0,115,116,97,114,116,32,37,32,112,97,103,101,95,115,105,122,101,32,61,61,32,48,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,78,101,115,95,67,112,117,46,99,112,112,0,0,0,0,0,0,109,97,112,95,99,111,100,101,0,0,0,0,0,0,0,0,115,105,122,101,32,37,32,112,97,103,101,95,115,105,122,101,32,61,61,32,48,0,0,0,115,116,97,114,116,32,43,32,115,105,122,101,32,60,61,32,48,120,49,48,48,48,48,0,0,6,2,8,3,3,5,5,3,2,2,2,4,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,6,6,2,8,3,3,5,5,4,2,2,2,4,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,6,6,2,8,3,3,5,5,3,2,2,2,3,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,6,6,2,8,3,3,5,5,4,2,2,2,5,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,2,6,2,6,3,3,3,3,2,2,2,2,4,4,4,4,3,6,2,6,4,4,4,4,2,5,2,5,5,5,5,5,2,6,2,6,3,3,3,3,2,2,2,2,4,4,4,4,3,5,2,5,4,4,4,4,2,4,2,4,4,4,4,4,2,6,2,8,3,3,5,5,2,2,2,2,4,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,2,6,2,8,3,3,5,5,2,2,2,2,4,4,6,6,3,5,0,8,4,4,6,6,2,4,2,7,4,4,7,7,64,64,64,128,64,64,128,160,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,42,40,118,111,108,97,116,105,108,101,32,99,104,97,114,42,41,32,38,105,32,33,61,32,48,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,101,110,100,105,97,110,46,104,0,0,98,108,97,114,103,103,95,118,101,114,105,102,121,95,98,121,116,101,95,111,114,100,101,114,0,0,0,0,0,0,0,0,0,1,2,3,4,6,8,12,17,24,34,48,68,96,136,192,101,110,100,95,116,105,109,101,32,62,61,32,108,97,115,116,95,116,105,109,101,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,78,101,115,95,70,109,101,55,95,65,112,117,46,99,112,112,0,114,117,110,95,117,110,116,105,108,0,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,116,105,109,101,0,0,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,78,101,115,95,78,97,109,99,111,95,65,112,117,46,99,112,112,0,0,0,0,0,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,40,98,108,105,112,95,108,111,110,103,41,32,40,116,105,109,101,32,62,62,32,66,76,73,80,95,66,85,70,70,69,82,95,65,67,67,85,82,65,67,89,41,32,60,32,98,108,105,112,95,98,117,102,45,62,98,117,102,102,101,114,95,115,105,122,101,95,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,66,108,105,112,95,66,117,102,102,101,114,46,104,0,0,0,0,111,102,102,115,101,116,95,114,101,115,97,109,112,108,101,100,0,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,78,101,115,95,78,97,109,99,111,95,65,112,117,46,104,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,172,1,124,1,84,1,64,1,30,1,254,0,226,0,214,0,190,0,160,0,142,0,128,0,106,0,84,0,72,0,54,0,142,1,98,1,60,1,42,1,20,1,236,0,210,0,198,0,176,0,148,0,132,0,118,0,98,0,78,0,66,0,50,0,0,1,2,3,4,5,6,7,7,8,9,10,11,12,13,14,15,15,16,17,18,19,20,20,21,22,23,24,24,25,26,27,27,28,29,30,31,31,32,33,33,34,35,36,36,37,38,38,39,40,41,41,42,43,43,44,45,45,46,47,47,48,48,49,50,50,51,52,52,53,53,54,55,55,56,56,57,58,58,59,59,60,60,61,61,62,63,63,64,64,65,65,66,66,67,67,68,68,69,70,70,71,71,72,72,73,73,74,74,75,75,75,76,76,77,77,78,78,79,79,80,80,81,81,82,82,82,83,112,114,103,95,114,101,97,100,101,114,0,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,78,101,115,95,79,115,99,115,46,99,112,112,0,0,0,0,0,102,105,108,108,95,98,117,102,102,101,114,0,0,0,0,0,4,0,8,0,16,0,32,0,64,0,96,0,128,0,160,0,202,0,254,0,124,1,252,1,250,2,248,3,242,7,228,15,116,105,109,101,32,62,61,32,108,97,115,116,95,116,105,109,101,0,0,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,78,101,115,95,86,114,99,54,95,65,112,117,46,99,112,112,0,114,117,110,95,117,110,116,105,108,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,111,115,99,95,105,110,100,101,120,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,119,114,105,116,101,95,111,115,99,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,114,101,103,32,60,32,114,101,103,95,99,111,117,110,116,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,116,105,109,101,0,0,0,0,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,78,101,115,95,86,114,99,54,95,65,112,117,46,104,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,84,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,187,0,0,57,0,0,0,58,0,0,0,59,0,0,0,22,0,0,0,8,0,0,0,32,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,7,0,0,0,23,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,22,0,0,0,33,0,0,0,0,0,0,0,96,184,0,0,0,0,0,0,96,188,0,0,0,0,0,0,11,0,0,0,12,0,0,0,112,188,0,0,1,0,0,0,85,115,101,115,32,117,110,115,117,112,112,111,114,116,101,100,32,97,117,100,105,111,32,101,120,112,97,110,115,105,111,110,32,104,97,114,100,119,97,114,101,0,0,0,0,0,0,0,192,184,0,0,208,184,0,0,224,184,0,0,240,184,0,0,248,184,0,0,0,0,0,0,83,113,117,97,114,101,32,49,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,50,0,0,0,0,0,0,0,0,84,114,105,97,110,103,108,101,0,0,0,0,0,0,0,0,78,111,105,115,101,0,0,0,68,77,67,0,0,0,0,0,1,1,0,0,2,1,0,0,0,1,0,0,0,2,0,0,1,3,0,0,3,1,0,0,4,1,0,0,5,1,0,0,6,1,0,0,7,1,0,0,8,1,0,0,9,1,0,0,10,1,0,0,11,1,0,0,12,1,0,0,13,1,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,192,184,0,0,208,184,0,0,224,184,0,0,240,184,0,0,248,184,0,0,136,185,0,0,144,185,0,0,152,185,0,0,160,185,0,0,168,185,0,0,176,185,0,0,184,185,0,0,192,185,0,0,0,0,0,0,87,97,118,101,32,49,0,0,87,97,118,101,32,50,0,0,87,97,118,101,32,51,0,0,87,97,118,101,32,52,0,0,87,97,118,101,32,53,0,0,87,97,118,101,32,54,0,0,87,97,118,101,32,55,0,0,87,97,118,101,32,56,0,0,192,184,0,0,208,184,0,0,224,184,0,0,240,184,0,0,248,184,0,0,232,185,0,0,248,185,0,0,8,186,0,0,83,97,119,32,87,97,118,101,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,51,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,52,0,0,0,0,0,0,0,0,192,184,0,0,208,184,0,0,224,184,0,0,240,184,0,0,248,184,0,0,232,185,0,0,248,185,0,0,8,186,0,0,136,185,0,0,144,185,0,0,152,185,0,0,160,185,0,0,168,185,0,0,176,185,0,0,184,185,0,0,192,185,0,0,192,184,0,0,208,184,0,0,224,184,0,0,240,184,0,0,248,184,0,0,248,185,0,0,8,186,0,0,120,186,0,0,83,113,117,97,114,101,32,53,0,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,102,105,108,101,32,118,101,114,115,105,111,110,0,0,0,0,67,111,114,114,117,112,116,32,102,105,108,101,32,40,105,110,118,97,108,105,100,32,108,111,97,100,47,105,110,105,116,47,112,108,97,121,32,97,100,100,114,101,115,115,41,0,0,0,69,109,117,108,97,116,105,111,110,32,101,114,114,111,114,32,40,105,108,108,101,103,97,108,32,105,110,115,116,114,117,99,116,105,111,110,41,0,0,0,55,78,115,102,95,69,109,117,0,0,0,0,0,0,0,0,55,78,101,115,95,67,112,117,0,0,0,0,0,0,0,0,56,217,0,0,8,187,0,0,192,217,0,0,248,186,0,0,0,0,0,0,2,0,0,0,24,187,0,0,0,80,1,0,72,146,0,0,2,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,116,105,109,101,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,78,101,115,95,70,109,101,55,95,65,112,117,46,104,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,78,101,115,95,78,97,109,99,111,95,65,112,117,46,104,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,78,101,115,95,86,114,99,54,95,65,112,117,46,104,0,0,0,40,117,110,115,105,103,110,101,100,41,32,111,115,99,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,78,101,115,95,65,112,117,46,104,0,0,0,0,0,0,0,0,78,69,83,77,26,0,0,0,78,105,110,116,101,110,100,111,32,78,69,83,0,0,0,0,78,83,70,0,0,0,0,0,0,0,0,0,216,188,0,0,60,0,0,0,61,0,0,0,3,0,0,0,24,0,0,0,8,0,0,0,34,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,78,115,102,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,200,188,0,0,32,176,0,0,0,0,0,0,70,97,109,105,99,111,109,0,33,115,97,109,112,108,101,95,114,97,116,101,40,41,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,77,117,115,105,99,95,69,109,117,46,104,0,0,0,0,0,0,115,101,116,95,103,97,105,110,0,0,0,0,0,0,0,0,78,83,70,69,0,0,0,0,78,69,83,77,26,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,65,0,0,0,0,0,0,0,0,32,78,0,0,0,0,0,0,67,111,114,114,117,112,116,32,102,105,108,101,0,0,0,0,0,0,0,0,96,190,0,0,62,0,0,0,63,0,0,0,64,0,0,0,25,0,0,0,8,0,0,0,35,0,0,0,4,0,0,0,5,0,0,0,65,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,7,0,0,0,26,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,22,0,0,0,33,0,0,0,0,0,0,0,56,190,0,0,0,0,0,0,200,190,0,0,0,0,0,0,13,0,0,0,14,0,0,0,56,189,0,0,1,0,0,0,56,78,115,102,101,95,69,109,117,0,0,0,0,0,0,0,96,217,0,0,80,190,0,0,32,187,0,0,0,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,78,105,110,116,101,110,100,111,32,78,69,83,0,0,0,0,0,0,0,0,56,191,0,0,66,0,0,0,67,0,0,0,3,0,0,0,27,0,0,0,8,0,0,0,36,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,57,78,115,102,101,95,70,105,108,101,0,0,0,0,0,0,96,217,0,0,40,191,0,0,32,176,0,0,0,0,0,0,4,2,0,0,0,0,0,0,85,85,0,0,0,0,0,0,64,16,32,8,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,83,97,112,95,65,112,117,46,104,0,0,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,0,6,2,8,3,3,5,5,3,2,2,2,4,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,6,6,2,8,3,3,5,5,4,2,2,2,4,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,6,6,2,8,3,3,5,5,3,2,2,2,3,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,6,6,2,8,3,3,5,5,4,2,2,2,5,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,2,6,2,6,3,3,3,3,2,2,2,2,4,4,4,4,3,6,2,6,4,4,4,4,2,5,2,5,5,5,5,5,2,6,2,6,3,3,3,3,2,2,2,2,4,4,4,4,3,5,2,5,4,4,4,4,2,4,2,4,4,4,4,4,2,6,2,8,3,3,5,5,2,2,2,2,4,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,2,6,2,8,3,3,5,5,2,2,2,2,4,4,6,6,3,5,2,8,4,4,6,6,2,4,2,7,4,4,7,7,42,40,118,111,108,97,116,105,108,101,32,99,104,97,114,42,41,32,38,105,32,33,61,32,48,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,101,110,100,105,97,110,46,104,0,0,98,108,97,114,103,103,95,118,101,114,105,102,121,95,98,121,116,101,95,111,114,100,101,114,0,0,0,0,0,0,0,0,0,0,0,0,136,194,0,0,68,0,0,0,69,0,0,0,3,0,0,0,1,0,0,0,37,0,0,0,38,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,8,0,0,0,28,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,23,0,0,0,39,0,0,0,0,0,0,0,8,194,0,0,0,0,0,0,168,193,0,0,176,193,0,0,184,193,0,0,192,193,0,0,200,193,0,0,208,193,0,0,216,193,0,0,224,193,0,0,87,97,118,101,32,49,0,0,87,97,118,101,32,50,0,0,87,97,118,101,32,51,0,0,87,97,118,101,32,52,0,0,87,97,118,101,32,53,0,0,87,97,118,101,32,54,0,0,87,97,118,101,32,55,0,0,87,97,118,101,32,56,0,0,1,1,0,0,2,1,0,0,3,1,0,0,0,1,0,0,5,1,0,0,6,1,0,0,7,1,0,0,4,1,0,0,32,196,0,0,0,0,0,0,15,0,0,0,16,0,0,0,48,196,0,0,1,0,0,0,73,110,118,97,108,105,100,32,102,105,108,101,32,100,97,116,97,32,98,108,111,99,107,0,69,109,117,108,97,116,105,111,110,32,101,114,114,111,114,32,40,105,108,108,101,103,97,108,32,105,110,115,116,114,117,99,116,105,111,110,41,0,0,0,55,83,97,112,95,69,109,117,0,0,0,0,0,0,0,0,55,83,97,112,95,67,112,117,0,0,0,0,0,0,0,0,56,217,0,0,112,194,0,0,192,217,0,0,96,194,0,0,0,0,0,0,2,0,0,0,128,194,0,0,0,80,1,0,72,146,0,0,2,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,83,97,112,95,65,112,117,46,104,0,0,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,83,65,80,13,10,0,0,0,73,78,73,84,0,0,0,0,73,110,118,97,108,105,100,32,105,110,105,116,32,97,100,100,114,101,115,115,0,0,0,0,80,76,65,89,69,82,0,0,73,110,118,97,108,105,100,32,112,108,97,121,32,97,100,100,114,101,115,115,0,0,0,0,77,85,83,73,67,0,0,0,73,110,118,97,108,105,100,32,109,117,115,105,99,32,97,100,100,114,101,115,115,0,0,0,83,79,78,71,83,0,0,0,73,110,118,97,108,105,100,32,116,114,97,99,107,32,99,111,117,110,116,0,0,0,0,0,84,89,80,69,0,0,0,0,68,105,103,105,109,117,115,105,99,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,85,110,115,117,112,112,111,114,116,101,100,32,112,108,97,121,101,114,32,116,121,112,101,0,83,84,69,82,69,79,0,0,70,65,83,84,80,76,65,89,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,102,97,115,116,112,108,97,121,32,118,97,108,117,101,0,0,65,85,84,72,79,82,0,0,78,65,77,69,0,0,0,0,68,65,84,69,0,0,0,0,82,79,77,32,100,97,116,97,32,109,105,115,115,105,110,103,0,0,0,0,0,0,0,0,65,116,97,114,105,32,88,76,0,0,0,0,0,0,0,0,83,65,80,0,0,0,0,0,0,0,0,0,152,196,0,0,70,0,0,0,71,0,0,0,3,0,0,0,1,0,0,0,40,0,0,0,41,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,83,97,112,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,136,196,0,0,32,176,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,105,110,100,101,120,32,60,32,111,115,99,95,99,111,117,110,116,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,83,109,115,95,65,112,117,46,99,112,112,0,0,0,0,0,0,111,115,99,95,111,117,116,112,117,116,0,0,0,0,0,0,40,99,101,110,116,101,114,32,38,38,32,108,101,102,116,32,38,38,32,114,105,103,104,116,41,32,124,124,32,40,33,99,101,110,116,101,114,32,38,38,32,33,108,101,102,116,32,38,38,32,33,114,105,103,104,116,41,0,0,0,0,0,0,0,101,110,100,95,116,105,109,101,32,62,61,32,108,97,115,116,95,116,105,109,101,0,0,0,114,117,110,95,117,110,116,105,108,0,0,0,0,0,0,0,108,97,115,116,95,116,105,109,101,32,62,61,32,101,110,100,95,116,105,109,101,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,40,117,110,115,105,103,110,101,100,41,32,100,97,116,97,32,60,61,32,48,120,70,70,0,119,114,105,116,101,95,103,103,115,116,101,114,101,111,0,0,119,114,105,116,101,95,100,97,116,97,0,0,0,0,0,0,64,50,39,31,24,19,15,12,9,7,5,4,3,2,1,0,0,1,0,0,0,2,0,0,0,4,0,0,0,0,0,0,40,71,52,54,38,84,84,104,72,71,69,86,85,101,34,70,40,71,52,54,38,84,84,116,72,71,69,86,85,101,34,56,40,71,52,54,38,68,84,102,72,71,69,86,85,69,34,67,40,71,52,54,38,68,84,117,72,71,69,86,85,85,34,54,40,71,52,54,38,84,82,69,72,71,69,86,85,85,34,197,56,71,52,54,38,68,82,68,72,71,69,86,85,85,34,52,56,71,69,71,37,100,82,73,72,71,86,103,69,85,34,131,40,71,52,54,36,83,67,64,72,71,69,86,52,84,34,96,83,78,69,83,45,83,80,67,55,48,48,32,83,111,117,110,100,32,70,105,108,101,32,68,97,116,97,32,118,48,46,51,48,26,26,0,0,0,0,0,78,111,116,32,97,110,32,83,80,67,32,102,105,108,101,0,67,111,114,114,117,112,116,32,83,80,67,32,102,105,108,101,0,0,0,0,0,0,0,0,40,115,105,122,101,32,38,32,49,41,32,61,61,32,48,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,83,110,101,115,95,83,112,99,46,99,112,112,0,0,0,0,0,115,101,116,95,111,117,116,112,117,116,0,0,0,0,0,0,111,117,116,32,60,61,32,111,117,116,95,101,110,100,0,0,111,117,116,32,60,61,32,38,109,46,101,120,116,114,97,95,98,117,102,32,91,101,120,116,114,97,95,115,105,122,101,93,0,0,0,0,0,0,0,0,115,97,118,101,95,101,120,116,114,97,0,0,0,0,0,0,40,99,111,117,110,116,32,38,32,49,41,32,61,61,32,48,0,0,0,0,0,0,0,0,112,108,97,121,0,0,0,0,255,0,245,246,241,245,254,254,4,3,14,14,26,26,14,22,2,3,0,1,244,0,1,1,7,6,14,14,27,14,14,23,5,6,3,4,255,3,4,4,10,9,14,14,26,251,14,23,8,9,6,7,2,6,7,7,13,12,14,14,27,252,14,24,11,12,9,10,5,9,10,10,16,15,14,14,254,252,14,24,14,15,12,13,8,12,13,13,19,18,14,14,254,220,14,24,17,18,15,16,11,15,16,16,22,21,14,14,28,253,14,25,20,21,18,19,14,18,19,19,25,24,14,14,14,29,14,25,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,82,65,77,32,91,105,32,43,32,114,111,109,95,97,100,100,114,93,32,61,61,32,40,117,105,110,116,56,95,116,41,32,100,97,116,97,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,83,112,99,95,67,112,117,46,99,112,112,0,0,0,0,0,0,99,112,117,95,119,114,105,116,101,95,104,105,103,104,0,0,114,101,103,32,43,32,40,114,95,116,48,111,117,116,32,43,32,48,120,70,48,32,45,32,48,120,49,48,48,48,48,41,32,60,32,48,120,49,48,48,0,0,0,0,0,0,0,0,99,112,117,95,114,101,97,100,0,0,0,0,0,0,0,0,45,99,112,117,95,108,97,103,95,109,97,120,32,60,61,32,109,46,115,112,99,95,116,105,109,101,32,38,38,32,109,46,115,112,99,95,116,105,109,101,32,60,61,32,48,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,114,101,108,95,116,105,109,101,32,60,61,32,48,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,83,112,99,95,67,112,117,46,104,0,0,0,0,0,0,0,0,114,117,110,95,117,110,116,105,108,95,0,0,0,0,0,0,83,80,67,32,101,109,117,108,97,116,105,111,110,32,101,114,114,111,114,0,0,0,0,0,48,0,0,0,0,0,0,0,109,46,115,112,99,95,116,105,109,101,32,60,61,32,101,110,100,95,116,105,109,101,0,0,40,115,105,122,101,32,38,32,49,41,32,61,61,32,48,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,83,112,99,95,68,115,112,46,99,112,112,0,0,0,0,0,0,115,101,116,95,111,117,116,112,117,116,0,0,0,0,0,0,7,0,0,0,255,15,0,0,255,15,0,0,255,7,0,0,255,7,0,0,255,7,0,0,255,3,0,0,255,3,0,0,255,3,0,0,255,1,0,0,255,1,0,0,255,1,0,0,255,0,0,0,255,0,0,0,255,0,0,0,127,0,0,0,127,0,0,0,127,0,0,0,63,0,0,0,63,0,0,0,63,0,0,0,31,0,0,0,31,0,0,0,31,0,0,0,15,0,0,0,15,0,0,0,15,0,0,0,7,0,0,0,7,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,114,1,25,5,110,1,25,5,106,1,24,5,102,1,24,5,98,1,24,5,95,1,24,5,91,1,24,5,87,1,23,5,83,1,23,5,80,1,23,5,76,1,22,5,72,1,22,5,69,1,21,5,65,1,20,5,62,1,20,5,58,1,19,5,55,1,18,5,51,1,17,5,48,1,17,5,44,1,16,5,41,1,15,5,37,1,14,5,34,1,13,5,30,1,12,5,27,1,11,5,24,1,10,5,20,1,8,5,17,1,7,5,14,1,6,5,11,1,4,5,7,1,3,5,4,1,2,5,1,1,0,5,254,0,255,4,251,0,253,4,248,0,251,4,245,0,250,4,242,0,248,4,239,0,246,4,236,0,245,4,233,0,243,4,230,0,241,4,227,0,239,4,224,0,237,4,221,0,235,4,218,0,233,4,215,0,231,4,212,0,229,4,210,0,227,4,207,0,224,4,204,0,222,4,201,0,220,4,199,0,217,4,196,0,215,4,193,0,213,4,191,0,210,4,188,0,208,4,186,0,205,4,183,0,203,4,180,0,200,4,178,0,197,4,175,0,195,4,173,0,192,4,171,0,189,4,168,0,186,4,166,0,183,4,163,0,181,4,161,0,178,4,159,0,175,4,156,0,172,4,154,0,169,4,152,0,166,4,150,0,162,4,147,0,159,4,145,0,156,4,143,0,153,4,141,0,150,4,139,0,146,4,137,0,143,4,134,0,140,4,132,0,136,4,130,0,133,4,128,0,129,4,126,0,126,4,124,0,122,4,122,0,119,4,120,0,115,4,118,0,112,4,117,0,108,4,115,0,104,4,113,0,101,4,111,0,97,4,109,0,93,4,107,0,89,4,106,0,85,4,104,0,82,4,102,0,78,4,100,0,74,4,99,0,70,4,97,0,66,4,95,0,62,4,94,0,58,4,92,0,54,4,90,0,50,4,89,0,46,4,87,0,42,4,86,0,37,4,84,0,33,4,83,0,29,4,81,0,25,4,80,0,21,4,78,0,16,4,77,0,12,4,76,0,8,4,74,0,3,4,73,0,255,3,71,0,251,3,70,0,246,3,69,0,242,3,67,0,237,3,66,0,233,3,65,0,229,3,64,0,224,3,62,0,220,3,61,0,215,3,60,0,210,3,59,0,206,3,58,0,201,3,56,0,197,3,55,0,192,3,54,0,187,3,53,0,183,3,52,0,178,3,51,0,173,3,50,0,169,3,49,0,164,3,48,0,159,3,47,0,155,3,46,0,150,3,45,0,145,3,44,0,140,3,43,0,136,3,42,0,131,3,41,0,126,3,40,0,121,3,39,0,116,3,38,0,112,3,37,0,107,3,36,0,102,3,36,0,97,3,35,0,92,3,34,0,87,3,33,0,83,3,32,0,78,3,32,0,73,3,31,0,68,3,30,0,63,3,29,0,58,3,29,0,53,3,28,0,48,3,27,0,43,3,27,0,38,3,26,0,34,3,25,0,29,3,24,0,24,3,24,0,19,3,23,0,14,3,23,0,9,3,22,0,4,3,21,0,255,2,21,0,250,2,20,0,245,2,20,0,240,2,19,0,235,2,19,0,230,2,18,0,225,2,17,0,220,2,17,0,216,2,16,0,211,2,16,0,206,2,15,0,201,2,15,0,196,2,15,0,191,2,14,0,186,2,14,0,181,2,13,0,176,2,13,0,171,2,12,0,166,2,12,0,162,2,11,0,157,2,11,0,152,2,11,0,147,2,10,0,142,2,10,0,137,2,10,0,132,2,9,0,128,2,9,0,123,2,9,0,118,2,8,0,113,2,8,0,108,2,8,0,103,2,7,0,99,2,7,0,94,2,7,0,89,2,6,0,84,2,6,0,80,2,6,0,75,2,6,0,70,2,5,0,65,2,5,0,61,2,5,0,56,2,5,0,51,2,4,0,47,2,4,0,42,2,4,0,38,2,4,0,33,2,4,0,28,2,3,0,24,2,3,0,19,2,3,0,15,2,3,0,10,2,3,0,5,2,2,0,1,2,2,0,252,1,2,0,248,1,2,0,243,1,2,0,239,1,2,0,235,1,2,0,230,1,1,0,226,1,1,0,221,1,1,0,217,1,1,0,213,1,1,0,208,1,1,0,204,1,1,0,200,1,1,0,195,1,1,0,191,1,1,0,187,1,1,0,183,1,0,0,178,1,0,0,174,1,0,0,170,1,0,0,166,1,0,0,162,1,0,0,158,1,0,0,154,1,0,0,149,1,0,0,145,1,0,0,141,1,0,0,137,1,0,0,133,1,0,0,129,1,0,0,125,1,0,0,122,1,0,0,118,1,98,114,114,95,111,102,102,115,101,116,32,61,61,32,98,114,114,95,98,108,111,99,107,95,115,105,122,101,0,0,0,0,114,117,110,0,0,0,0,0,13,12,12,12,12,12,12,12,12,12,12,12,12,16,16,16,0,0,1,2,3,4,5,6,7,8,9,10,11,11,11,11,109,46,114,97,109,0,0,0,115,111,102,116,95,114,101,115,101,116,95,99,111,109,109,111,110,0,0,0,0,0,0,0,69,139,90,154,228,130,27,120,0,0,170,150,137,14,224,128,42,73,61,186,20,160,172,197,0,0,81,187,156,78,123,255,244,253,87,50,55,217,66,34,0,0,91,60,159,27,135,154,111,39,175,123,229,104,10,217,0,0,154,197,156,78,123,255,234,33,120,79,221,237,36,20,0,0,119,177,209,54,193,103,82,87,70,61,89,244,135,164,0,0,126,68,156,78,123,255,117,245,6,151,16,195,36,187,0,0,123,122,224,96,18,15,247,116,28,229,57,61,115,193,0,0,122,179,255,78,123,255,42,40,118,111,108,97,116,105,108,101,32,99,104,97,114,42,41,32,38,105,32,33,61,32,48,0,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,101,110,100,105,97,110,46,104,0,0,98,108,97,114,103,103,95,118,101,114,105,102,121,95,98,121,116,101,95,111,114,100,101,114,0,0,0,0,0,0,0,0,0,0,0,0,192,208,0,0,72,0,0,0,73,0,0,0,3,0,0,0,1,0,0,0,42,0,0,0,43,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,6,0,0,0,29,0,0,0,15,0,0,0,24,0,0,0,25,0,0,0,9,0,0,0,30,0,0,0,44,0,0,0,31,0,0,0,152,208,0,0,0,0,0,0,88,208,0,0,96,208,0,0,104,208,0,0,112,208,0,0,120,208,0,0,128,208,0,0,136,208,0,0,144,208,0,0,68,83,80,32,49,0,0,0,68,83,80,32,50,0,0,0,68,83,80,32,51,0,0,0,68,83,80,32,52,0,0,0,68,83,80,32,53,0,0,0,68,83,80,32,54,0,0,0,68,83,80,32,55,0,0,0,68,83,80,32,56,0,0,0,128,209,0,0,1,0,0,0,17,0,0,0,18,0,0,0,144,209,0,0,0,0,0,0,55,83,112,99,95,69,109,117,0,0,0,0,0,0,0,0,96,217,0,0,176,208,0,0,0,176,0,0,0,0,0,0,110,32,60,61,32,115,105,122,101,95,0,0,0,0,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,98,108,97,114,103,103,95,99,111,109,109,111,110,46,104,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,119,114,105,116,101,95,112,111,115,32,60,61,32,98,117,102,46,101,110,100,40,41,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,70,105,114,95,82,101,115,97,109,112,108,101,114,46,104,0,0,119,114,105,116,101,0,0,0,83,78,69,83,45,83,80,67,55,48,48,32,83,111,117,110,100,32,70,105,108,101,32,68,97,116,97,0,0,0,0,0,83,117,112,101,114,32,78,105,110,116,101,110,100,111,0,0,83,80,67,0,0,0,0,0,0,0,0,0,248,209,0,0,74,0,0,0,75,0,0,0,3,0,0,0,32,0,0,0,8,0,0,0,45,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,83,112,99,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,232,209,0,0,32,176,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,120,105,100,54,0,0,0,0,33,115,97,109,112,108,101,95,114,97,116,101,40,41,0,0,115,114,99,92,103,97,109,101,45,109,117,115,105,99,45,101,109,117,92,103,109,101,47,77,117,115,105,99,95,69,109,117,46,104,0,0,0,0,0,0,115,101,116,95,103,97,105,110,0,0,0,0,0,0,0,0,40,99,111,117,110,116,32,38,32,49,41,32,61,61,32,48,0,0,0,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,83,112,99,95,70,105,108,116,101,114,46,99,112,112,0,0,0,114,117,110,0,0,0,0,0,0,0,0,0,112,212,0,0,76,0,0,0,77,0,0,0,3,0,0,0,1,0,0,0,46,0,0,0,47,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,33,0,0,0,2,0,0,0,3,0,0,0,26,0,0,0,10,0,0,0,34,0,0,0,48,0,0,0,4,0,0,0,7,0,0,0,27,0,0,0,49,0,0,0,3,0,0,0,176,254,255,255,112,212,0,0,78,0,0,0,79,0,0,0,4,0,0,0,0,0,0,0,80,211,0,0,0,0,0,0,1,1,0,0,0,1,0,0,2,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,212,0,0,1,0,0,0,19,0,0,0,20,0,0,0,24,213,0,0,1,0,0,0,136,212,0,0,1,0,0,0,19,0,0,0,20,0,0,0,160,212,0,0,1,0,0,0,104,211,0,0,0,0,0,0,168,211,0,0,176,211,0,0,184,211,0,0,192,211,0,0,200,211,0,0,208,211,0,0,216,211,0,0,224,211,0,0,70,77,32,49,0,0,0,0,70,77,32,50,0,0,0,0,70,77,32,51,0,0,0,0,70,77,32,52,0,0,0,0,70,77,32,53,0,0,0,0,70,77,32,54,0,0,0,0,80,67,77,0,0,0,0,0,80,83,71,0,0,0,0,0,248,211,0,0,8,212,0,0,24,212,0,0,40,212,0,0,83,113,117,97,114,101,32,49,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,50,0,0,0,0,0,0,0,0,83,113,117,97,114,101,32,51,0,0,0,0,0,0,0,0,78,111,105,115,101,0,0,0,89,77,50,52,49,51,32,70,77,32,115,111,117,110,100,32,105,115,110,39,116,32,115,117,112,112,111,114,116,101,100,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,55,86,103,109,95,69,109,117,0,0,0,0,0,0,0,0,96,217,0,0,96,212,0,0,64,214,0,0,0,0,0,0,86,103,109,32,0,0,0,0,83,101,103,97,32,83,77,83,47,71,101,110,101,115,105,115,0,0,0,0,0,0,0,0,86,71,90,0,0,0,0,0,0,0,0,0,8,213,0,0,80,0,0,0,81,0,0,0,3,0,0,0,35,0,0,0,8,0,0,0,50,0,0,0,9,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,4,0,0,0,56,86,103,109,95,70,105,108,101,0,0,0,0,0,0,0,96,217,0,0,248,212,0,0,32,176,0,0,0,0,0,0,86,71,77,0,0,0,0,0,71,100,51,32,0,0,0,0,83,116,114,101,97,109,32,108,97,99,107,101,100,32,101,110,100,32,101,118,101,110,116,0,85,110,107,110,111,119,110,32,115,116,114,101,97,109,32,101,118,101,110,116,0,0,0,0,116,111,95,102,109,95,116,105,109,101,40,32,118,103,109,95,116,105,109,101,32,41,32,60,61,32,109,105,110,95,112,97,105,114,115,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,86,103,109,95,69,109,117,95,73,109,112,108,46,99,112,112,0,112,108,97,121,95,102,114,97,109,101,0,0,0,0,0,0,0,0,0,0,64,214,0,0,82,0,0,0,83,0,0,0,3,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,176,254,255,255,64,214,0,0,84,0,0,0,85,0,0,0,4,0,0,0,0,0,0,0,49,50,86,103,109,95,69,109,117,95,73,109,112,108,0,0,192,217,0,0,48,214,0,0,0,0,0,0,2,0,0,0,72,146,0,0,2,0,0,0,240,148,0,0,0,80,1,0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,31,4,1,0,0,0,0,0,0,1,2,3,4,6,12,24,115,97,109,112,108,101,95,114,97,116,101,0,0,0,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,89,109,50,54,49,50,95,69,109,117,46,99,112,112,0,0,0,115,101,116,95,114,97,116,101,0,0,0,0,0,0,0,0,99,108,111,99,107,95,114,97,116,101,32,62,32,115,97,109,112,108,101,95,114,97,116,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3,4,4,4,5,5,6,6,7,8,8,8,8,1,1,1,1,2,2,2,2,2,3,3,3,4,4,4,5,5,6,6,7,8,8,9,10,11,12,13,14,16,16,16,16,2,2,2,2,2,3,3,3,4,4,4,5,5,6,6,7,8,8,9,10,11,12,13,14,16,17,19,20,22,22,22,22,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,40,117,110,115,105,103,110,101,100,41,32,100,97,116,97,32,60,61,32,48,120,70,70,0,119,114,105,116,101,49,0,0,119,114,105,116,101,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,89,0,0,0,0,0,0,71,66,83,0,0,0,0,0,71,89,77,0,0,0,0,0,72,69,83,0,0,0,0,0,75,83,83,0,0,0,0,0,78,83,70,0,0,0,0,0,78,83,70,69,0,0,0,0,83,65,80,0,0,0,0,0,83,80,67,0,0,0,0,0,86,71,77,0,0,0,0,0,0,0,0,0,0,0,0,0,40,100,97,116,97,32,124,124,32,33,115,105,122,101,41,32,38,38,32,111,117,116,0,0,115,114,99,47,103,97,109,101,45,109,117,115,105,99,45,101,109,117,47,103,109,101,47,103,109,101,46,99,112,112,0,0,103,109,101,95,111,112,101,110,95,100,97,116,97,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,56,217,0,0,168,216,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+45280);
/* memory initializer */ allocate([96,217,0,0,192,216,0,0,184,216,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,96,217,0,0,248,216,0,0,232,216,0,0,0,0,0,0,0,0,0,0,32,217,0,0,86,0,0,0,87,0,0,0,88,0,0,0,89,0,0,0,51,0,0,0,1,0,0,0,8,0,0,0,11,0,0,0,0,0,0,0,168,217,0,0,86,0,0,0,90,0,0,0,88,0,0,0,89,0,0,0,51,0,0,0,2,0,0,0,9,0,0,0,12,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,96,217,0,0,128,217,0,0,32,217,0,0,0,0,0,0,0,0,0,0,8,218,0,0,86,0,0,0,91,0,0,0,88,0,0,0,89,0,0,0,51,0,0,0,3,0,0,0,10,0,0,0,13,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,96,217,0,0,224,217,0,0,32,217,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,220,0,0,92,0,0,0,93,0,0,0,8,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,96,217,0,0,56,220,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+55520);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _llvm_lifetime_end() {}

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  
  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy; 
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

  function _abort() {
      Module['abort']();
    }


  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }

   
  Module["_strlen"] = _strlen;

   
  Module["_strncpy"] = _strncpy;

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  var _fabs=Math_abs;

  var _floor=Math_floor;

  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            var canvasContainer = canvas.parentNode;
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  
  
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }
  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function _strrchr(ptr, chr) {
      var ptr2 = ptr + _strlen(ptr);
      do {
        if (HEAP8[(ptr2)] == chr) return ptr2;
        ptr2--;
      } while (ptr2 >= ptr);
      return 0;
    }

  function _log10(x) {
      return Math.log(x) / Math.LN10;
    }

  var _sin=Math_sin;

  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }

  function _fmod(x, y) {
      return x % y;
    }

  function _llvm_invariant_start() {}

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function ___cxa_guard_release() {}

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }


  var _cos=Math_cos;

  var _llvm_pow_f64=Math_pow;

  function __ZNSt9exceptionD2Ev() {}


  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function _llvm_lifetime_start() {}

  var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _llvm_trap() {
      abort('trap!');
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  var __ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vid(index,a1,a2) {
  try {
    Module["dynCall_vid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTISt9exception|0;var n=0;var o=0;var p=0;var q=0;var r=+env.NaN,s=+env.Infinity;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ba=env.asmPrintInt;var ca=env.asmPrintFloat;var da=env.min;var ea=env.invoke_iiii;var fa=env.invoke_vid;var ga=env.invoke_viiiii;var ha=env.invoke_i;var ia=env.invoke_vi;var ja=env.invoke_vii;var ka=env.invoke_ii;var la=env.invoke_v;var ma=env.invoke_iiiii;var na=env.invoke_viiiiii;var oa=env.invoke_iii;var pa=env.invoke_viiii;var qa=env._fabs;var ra=env._sin;var sa=env._strrchr;var ta=env.__ZSt9terminatev;var ua=env._fmod;var va=env.___cxa_guard_acquire;var wa=env._llvm_lifetime_start;var xa=env.__reallyNegative;var ya=env.___cxa_is_number_type;var za=env.___assert_fail;var Aa=env._llvm_invariant_start;var Ba=env.___cxa_allocate_exception;var Ca=env.___cxa_find_matching_catch;var Da=env._floor;var Ea=env._fflush;var Fa=env.___cxa_guard_release;var Ga=env._llvm_pow_f64;var Ha=env.___setErrNo;var Ia=env._sbrk;var Ja=env._snprintf;var Ka=env.___cxa_begin_catch;var La=env._emscripten_memcpy_big;var Ma=env.___resumeException;var Na=env.__ZSt18uncaught_exceptionv;var Oa=env._sysconf;var Pa=env.___cxa_throw;var Qa=env._cos;var Ra=env._sprintf;var Sa=env._llvm_lifetime_end;var Ta=env._toupper;var Ua=env.___errno_location;var Va=env.__ZNSt9exceptionD2Ev;var Wa=env.___cxa_does_inherit;var Xa=env.__exit;var Ya=env._abort;var Za=env._time;var _a=env.__formatString;var $a=env._log10;var ab=env._llvm_trap;var bb=env._exit;var cb=env.___cxa_pure_virtual;var db=0.0;
// EMSCRIPTEN_START_FUNCS
function tj(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;o=i;n=b+2e3|0;D=(c[n>>2]|0)-e|0;if((D|0)>=1){za(51528,51544,163,51584)}c[n>>2]=e;j=b+1996|0;c[j>>2]=(c[j>>2]|0)+D;f=b+1868|0;c[f>>2]=(c[f>>2]|0)+D;l=b+1892|0;c[l>>2]=(c[l>>2]|0)+D;m=b+1916|0;c[m>>2]=(c[m>>2]|0)+D;y=b+1976|0;M=c[y>>2]|0;z=b+1980|0;L=c[z>>2]|0;p=b+1984|0;N=c[p>>2]|0;w=b+1972|0;S=b+(c[w>>2]|0)+2716|0;x=b+1992|0;J=b+((c[x>>2]|0)+257)+2716|0;h=b+1988|0;K=c[h>>2]|0;O=K<<8;I=K<<3&256;Q=(K<<4&2048|K&2)^2;V=a[S]|0;W=V&255;H=(d[b+W+2204|0]|0)+D|0;v=b+2716|0;a:do{if((H|0)>0){s=M;A=O;B=I;g=Q;q=S;C=K;k=D;r=J;t=L;u=N}else{G=b+1942|0;D=b;F=b+68218|0;E=b+68219|0;b:while(1){R=S+1|0;X=a[R]|0;U=X&255;c:do{switch(W|0){case 80:{if((K&64|0)==0){T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}else{T=M;R=S+2|0;H=H+ -2|0;U=J;break c}};case 227:case 195:case 163:case 131:case 99:case 67:case 35:case 3:{R=S+2|0;if(((rj(b,U|I,H+ -4|0)|0)&1<<(W>>>5)|0)!=0){P=5;break c}H=H+ -2|0;P=6;break};case 243:case 211:case 179:case 147:case 115:case 83:case 51:case 19:{R=S+2|0;if(((rj(b,U|I,H+ -4|0)|0)&1<<(W>>>5)|0)==0){P=5;break c}H=H+ -2|0;P=6;break};case 79:{S=R-v+1|0;R=b+(U|65280)+2716|0;U=J+ -2|0;T=U-v|0;if((T|0)>256){a[J+ -1|0]=S>>>8;a[U]=S;T=M;break c}else{a[b+(T&255|256)+2716|0]=S;a[J+ -1|0]=S>>>8;T=M;U=J+254|0;break c}};case 109:{S=J+ -1|0;a[S]=N;T=M;U=(S-v|0)==256?J+255|0:S;break};case 142:{U=J+1|0;if((U-v|0)!=513){K=d[J]|0;P=428;break c}U=J+ -255|0;K=d[J+ -256|0]|0;P=428;break};case 174:{U=J+1|0;if((U-v|0)!=513){T=d[J]|0;break c}T=d[J+ -256|0]|0;U=J+ -255|0;break};case 95:{P=414;break};case 77:{S=J+ -1|0;a[S]=L;T=M;U=(S-v|0)==256?J+255|0:S;break};case 238:{U=J+1|0;if((U-v|0)!=513){T=M;N=d[J]|0;break c}T=M;U=J+ -255|0;N=d[J+ -256|0]|0;break};case 241:case 225:case 209:case 193:case 177:case 161:case 145:case 129:case 113:case 97:case 81:case 65:case 49:case 33:case 17:case 1:{S=R-v|0;R=65502-(W>>>3)|0;R=b+(d[b+(R+1)+2716|0]<<8|d[b+R+2716|0])+2716|0;U=J+ -2|0;T=U-v|0;if((T|0)>256){a[J+ -1|0]=S>>>8;a[U]=S;T=M;break c}else{a[b+(T&255|256)+2716|0]=S;a[J+ -1|0]=S>>>8;T=M;U=J+254|0;break c}};case 78:case 14:{T=d[S+2|0]<<8|U;R=S+3|0;X=rj(b,T,H+ -2|0)|0;Q=M-X&255;S=X&~M|(V<<24>>24==14?M:0);V=S&255;a[b+T+2716|0]=V;U=T+ -240|0;if(!((U|0)>-1)){T=M;U=J;break c}if((U|0)>=16){T=T+ -65472|0;if(!((T|0)>-1)){T=M;U=J;break c}qj(b,S,T,H);T=M;U=J;break c}a[b+U+1940|0]=V;if(!((U|0)!=2&(T+ -244|0)>>>0>3)){T=M;U=J;break c}if((U|0)==3){pj(b,S,H);T=M;U=J;break c}else{oj(b,S,H,U);T=M;U=J;break c}};case 45:{S=J+ -1|0;a[S]=M;T=M;U=(S-v|0)==256?J+255|0:S;break};case 15:{T=R-v|0;R=b+(d[E]<<8|d[F])+2716|0;S=J+ -2|0;U=S-v|0;if((U|0)>256){a[J+ -1|0]=T>>>8;a[S]=T;J=S}else{a[b+(U&255|256)+2716|0]=T;a[J+ -1|0]=T>>>8;J=J+254|0}T=O>>>8&1|I>>>3|K&-164|(Q>>>4|Q)&128;S=J+ -1|0;a[S]=(Q&255)<<24>>24==0?T|2:T;T=M;K=K&-21|16;U=(S-v|0)==256?J+255|0:S;break};case 222:{U=U+L&255;P=388;break};case 242:case 210:case 178:case 146:case 114:case 82:case 50:case 18:case 226:case 194:case 162:case 130:case 98:case 66:case 34:case 2:{S=1<<(W>>>5);P=U|I;S=(rj(b,P,H+ -1|0)|0)&~S|((W&16|0)==0?S:0);U=S&255;a[b+P+2716|0]=U;T=P+ -240|0;if(!(T>>>0<16)){P=6;break c}a[b+T+1940|0]=U;if(!((T|0)!=2&(P+ -244|0)>>>0>3)){P=6;break c}if((T|0)==3){pj(b,S,H);P=6;break c}else{oj(b,S,H,T);P=6;break c}};case 254:{N=N+255&255;if((N|0)==0){T=M;R=S+2|0;H=H+ -2|0;U=J;N=0;break c}else{T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}};case 46:{P=388;break};case 127:{R=b+(d[J+2|0]<<8|d[J+1|0])+2716|0;U=J+3|0;K=d[J]|0;P=428;break};case 206:{U=J+1|0;if((U-v|0)!=513){T=M;L=d[J]|0;break c}T=M;U=J+ -255|0;L=d[J+ -256|0]|0;break};case 13:{T=O>>>8&1|I>>>3|K&-164|(Q>>>4|Q)&128;S=J+ -1|0;a[S]=(Q&255)<<24>>24==0?T|2:T;T=M;U=(S-v|0)==256?J+255|0:S;break};case 110:{T=U|I;P=rj(b,T,H+ -4|0)|0;W=P+8191|0;V=H+ -3|0;R=W&255;a[b+T+2716|0]=R;U=T+ -240|0;do{if(U>>>0<16){a[b+U+1940|0]=R;if(!((U|0)!=2&(T+ -244|0)>>>0>3)){break}if((U|0)==3){pj(b,W,V);break}else{oj(b,W,V,U);break}}}while(0);R=S+2|0;if((P|0)!=1){P=5;break c}H=H+ -2|0;P=6;break};case 31:{R=b+((d[S+2|0]<<8|U)+L)+2716|0;X=a[R]|0;P=414;break};case 0:{T=M;U=J;break};case 228:{R=S+2|0;Q=U|I;M=Q+ -253|0;if(M>>>0<3){T=b+(M*24|0)+1868|0;U=c[T>>2]|0;do{if((H|0)>=(U|0)){X=c[b+(M*24|0)+1872>>2]|0;S=(H-U|0)/(X|0)|0;Q=S+1|0;c[T>>2]=(_(Q,X)|0)+U;if((c[b+(M*24|0)+1884>>2]|0)==0){break}U=c[b+(M*24|0)+1876>>2]|0;T=b+(M*24|0)+1880|0;V=c[T>>2]|0;S=S-(U+255-V&255)|0;if((S|0)>-1){Q=(S|0)/(U|0)|0;X=b+(M*24|0)+1888|0;c[X>>2]=Q+1+(c[X>>2]|0)&15;Q=S-(_(Q,U)|0)|0}else{Q=V+Q|0}c[T>>2]=Q&255}}while(0);T=b+(M*24|0)+1888|0;Q=c[T>>2]|0;c[T>>2]=0;T=Q;U=J;break c}else{M=d[b+Q+2716|0]|0;S=Q+ -240|0;if(!(S>>>0<16)){T=M;Q=M;U=J;break c}M=d[b+S+1956|0]|0;S=Q+ -242|0;if(!(S>>>0<2)){T=M;Q=M;U=J;break c}Q=a[G]|0;M=Q&255;if((S|0)!=1){T=M;Q=M;U=J;break c}S=c[j>>2]|0;M=H-(a[b+(M&127)+1612|0]|0)-S|0;if((M|0)>-1){Q=M+32&-32;c[j>>2]=Q+S;vj(D,Q);Q=a[G]|0}Q=d[b+(Q&127)|0]|0;T=Q;U=J;break c}};case 230:{M=L+I|0;R=S;P=65;break};case 208:{if((Q&255)<<24>>24==0){T=M;R=S+2|0;H=H+ -2|0;U=J;break c}else{T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}};case 231:{M=U+L&255|I;M=d[b+(M+1)+2716|0]<<8|d[b+M+2716|0];P=65;break};case 247:{M=U|I;M=(d[b+(M+1)+2716|0]<<8|d[b+M+2716|0])+N|0;P=65;break};case 246:{U=U+N|0;P=63;break};case 232:{M=U;Q=U;P=6;break};case 240:{if((Q&255)<<24>>24==0){T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}else{T=M;R=S+2|0;H=H+ -2|0;U=J;break c}};case 245:{U=U+L|0;P=63;break};case 196:{R=S+2|0;U=U|I;T=M&255;a[b+U+2716|0]=T;S=U+ -240|0;if(!(S>>>0<16)){T=M;U=J;break c}U=U+ -242|0;a[b+S+1940|0]=T;if((U|0)==1){pj(b,M,H);T=M;U=J;break c}if(!(U>>>0>1)){T=M;U=J;break c}oj(b,M,H,S);T=M;U=J;break};case 111:{R=J-v|0;if((R|0)<511){T=M;R=b+(d[J+1|0]<<8|d[J])+2716|0;U=J+2|0;break c}else{T=M;R=b+(d[J+ -255|0]<<8|d[b+(R&255|256)+2716|0])+2716|0;U=J+ -254|0;break c}};case 229:{P=63;break};case 244:{M=U+L&255|I;P=65;break};case 250:{R=H+ -2|0;T=U|I;P=T+ -253|0;do{if(P>>>0<3){T=b+(P*24|0)+1868|0;V=c[T>>2]|0;do{if((R|0)>=(V|0)){X=c[b+(P*24|0)+1872>>2]|0;U=(R-V|0)/(X|0)|0;R=U+1|0;c[T>>2]=(_(R,X)|0)+V;if((c[b+(P*24|0)+1884>>2]|0)==0){break}V=c[b+(P*24|0)+1876>>2]|0;T=b+(P*24|0)+1880|0;W=c[T>>2]|0;U=U-(V+255-W&255)|0;if((U|0)>-1){R=(U|0)/(V|0)|0;X=b+(P*24|0)+1888|0;c[X>>2]=R+1+(c[X>>2]|0)&15;R=U-(_(R,V)|0)|0}else{R=W+R|0}c[T>>2]=R&255}}while(0);X=b+(P*24|0)+1888|0;U=c[X>>2]|0;c[X>>2]=0}else{P=T+ -240|0;if(!(P>>>0<16)){U=d[b+T+2716|0]|0;break}T=T+ -242|0;if(!(T>>>0<2)){U=d[b+P+1956|0]|0;break}P=a[G]|0;U=P&255;if((T|0)!=1){break}T=c[j>>2]|0;R=R-(a[b+(U&127)+1612|0]|0)-T|0;if((R|0)>-1){P=R+32&-32;c[j>>2]=P+T;vj(D,P);P=a[G]|0}U=d[b+(P&127)|0]|0}}while(0);U=U+8192|0;P=48;break};case 143:{P=48;break};case 63:{T=R-v+2|0;R=b+(d[S+2|0]<<8|U)+2716|0;U=J+ -2|0;S=U-v|0;if((S|0)>256){a[J+ -1|0]=T>>>8;a[U]=T;T=M;break c}else{a[b+(S&255|256)+2716|0]=T;a[J+ -1|0]=T>>>8;T=M;U=J+254|0;break c}};case 235:{P=84;break};case 141:{Q=U;N=U;P=6;break};case 198:{T=L+I|0;R=S;P=118;break};case 191:{Q=rj(b,L+I|0,H+ -1|0)|0;T=Q;U=J;L=L+1&255;break};case 214:{U=U+N|0;P=116;break};case 213:{U=U+L|0;P=116;break};case 249:{U=U+N&255;P=68;break};case 233:{R=S+2|0;U=rj(b,d[R]<<8|U,H)|0;P=82;break};case 197:{P=116;break};case 251:{U=U+L&255;P=84;break};case 236:{Q=d[S+2|0]<<8|U;R=S+3|0;N=Q+ -253|0;if(N>>>0<3){T=b+(N*24|0)+1868|0;U=c[T>>2]|0;do{if((H|0)>=(U|0)){X=c[b+(N*24|0)+1872>>2]|0;S=(H-U|0)/(X|0)|0;Q=S+1|0;c[T>>2]=(_(Q,X)|0)+U;if((c[b+(N*24|0)+1884>>2]|0)==0){break}V=c[b+(N*24|0)+1876>>2]|0;T=b+(N*24|0)+1880|0;U=c[T>>2]|0;S=S-(V+255-U&255)|0;if((S|0)>-1){Q=(S|0)/(V|0)|0;X=b+(N*24|0)+1888|0;c[X>>2]=Q+1+(c[X>>2]|0)&15;Q=S-(_(Q,V)|0)|0}else{Q=U+Q|0}c[T>>2]=Q&255}}while(0);T=b+(N*24|0)+1888|0;N=c[T>>2]|0;c[T>>2]=0;T=M;Q=N;U=J;break c}else{N=d[b+Q+2716|0]|0;S=Q+ -240|0;if(!(S>>>0<16)){T=M;Q=N;U=J;break c}N=d[b+S+1956|0]|0;S=Q+ -242|0;if(!(S>>>0<2)){T=M;Q=N;U=J;break c}Q=a[G]|0;N=Q&255;if((S|0)!=1){T=M;Q=N;U=J;break c}S=c[j>>2]|0;N=H-(a[b+(N&127)+1612|0]|0)-S|0;if((N|0)>-1){Q=N+32&-32;c[j>>2]=Q+S;vj(D,Q);Q=a[G]|0}N=d[b+(Q&127)|0]|0;T=M;Q=N;U=J;break c}};case 199:{T=U+L&255|I;T=d[b+(T+1)+2716|0]<<8|d[b+T+2716|0];P=118;break};case 212:{T=U+L&255|I;P=118;break};case 205:{P=82;break};case 215:{T=U|I;T=(d[b+(T+1)+2716|0]<<8|d[b+T+2716|0])+N|0;P=118;break};case 201:{R=L;P=127;break};case 248:{P=68;break};case 38:{Q=L+I|0;R=S;P=171;break};case 53:{U=U+L|0;P=168;break};case 39:{Q=U+L&255|I;Q=d[b+(Q+1)+2716|0]<<8|d[b+Q+2716|0];P=171;break};case 37:{P=168;break};case 204:{R=N;P=127;break};case 125:{T=L;Q=L;U=J;break};case 52:{U=U+L&255;P=170;break};case 253:{T=M;Q=M;U=J;N=M;break};case 57:{T=L+I|0;U=rj(b,N+I|0,H+ -2|0)|0;P=176;break};case 41:{U=rj(b,U|I,H+ -3|0)|0;P=175;break};case 56:{P=175;break};case 216:{P=137;break};case 54:{U=U+N|0;P=168;break};case 6:{Q=L+I|0;R=S;P=192;break};case 23:{Q=U|I;Q=(d[b+(Q+1)+2716|0]<<8|d[b+Q+2716|0])+N|0;P=192;break};case 40:{P=172;break};case 7:{Q=U+L&255|I;Q=d[b+(Q+1)+2716|0]<<8|d[b+Q+2716|0];P=192;break};case 22:{U=U+N|0;P=189;break};case 93:{T=M;Q=M;U=J;L=M;break};case 189:{T=M;U=b+(L+257)+2716|0;break};case 55:{Q=U|I;Q=(d[b+(Q+1)+2716|0]<<8|d[b+Q+2716|0])+N|0;P=171;break};case 36:{P=170;break};case 203:{P=143;break};case 219:{U=U+L&255;P=143;break};case 157:{L=J+ -257-v|0;T=M;Q=L;U=J;break};case 217:{U=U+N&255;P=137;break};case 175:{S=M+8192|0;T=L+I|0;V=S&255;a[b+T+2716|0]=V;U=T+ -240|0;do{if((U|0)>-1){if((U|0)>=16){T=T+ -65472|0;if(!((T|0)>-1)){break}qj(b,S,T,H);break}a[b+U+1940|0]=V;if(!((U|0)!=2&(T+ -244|0)>>>0>3)){break}if((U|0)==3){pj(b,S,H);break}else{oj(b,S,H,U);break}}}while(0);T=M;U=J;L=L+1|0;break};case 221:{T=N;Q=N;U=J;break};case 73:{U=rj(b,U|I,H+ -3|0)|0;P=217;break};case 103:{O=U+L&255|I;O=d[b+(O+1)+2716|0]<<8|d[b+O+2716|0];P=234;break};case 104:{P=235;break};case 21:{U=U+L|0;P=189;break};case 173:{P=246;break};case 71:{Q=U+L&255|I;Q=d[b+(Q+1)+2716|0]<<8|d[b+Q+2716|0];P=213;break};case 102:{O=L+I|0;R=S;P=234;break};case 137:case 169:{U=rj(b,U|I,H+ -3|0)|0;P=249;break};case 105:{U=rj(b,U|I,H+ -3|0)|0;P=238;break};case 152:case 184:{P=249;break};case 100:{P=233;break};case 200:{P=242;break};case 70:{Q=L+I|0;R=S;P=213;break};case 25:{T=L+I|0;U=rj(b,N+I|0,H+ -2|0)|0;P=197;break};case 24:{P=196;break};case 126:{O=U|I;P=245;break};case 85:{U=U+L|0;P=210;break};case 89:{T=L+I|0;U=rj(b,N+I|0,H+ -2|0)|0;P=218;break};case 119:{O=U|I;O=(d[b+(O+1)+2716|0]<<8|d[b+O+2716|0])+N|0;P=234;break};case 120:{P=238;break};case 84:{U=U+L&255;P=212;break};case 117:{U=U+L|0;P=231;break};case 30:{R=S+2|0;O=d[R]<<8|U;P=241;break};case 94:{R=S+2|0;O=d[R]<<8|U;P=245;break};case 166:case 134:{T=L+I|0;R=S;P=259;break};case 20:{U=U+L&255;P=191;break};case 5:{P=189;break};case 8:{P=193;break};case 9:{U=rj(b,U|I,H+ -3|0)|0;P=196;break};case 72:{P=214;break};case 87:{Q=U|I;Q=(d[b+(Q+1)+2716|0]<<8|d[b+Q+2716|0])+N|0;P=213;break};case 88:{P=217;break};case 69:{P=210;break};case 118:{U=U+N|0;P=231;break};case 116:{U=U+L&255;P=233;break};case 4:{P=191;break};case 101:{P=231;break};case 121:{Q=rj(b,N+I|0,H+ -2|0)|0;Q=(rj(b,L+I|0,H+ -1|0)|0)-Q|0;T=M;O=~Q;Q=Q&255;U=J;break};case 62:{O=U|I;P=241;break};case 153:case 185:{T=L+I|0;U=rj(b,N+I|0,H+ -2|0)|0;R=S;P=250;break};case 86:{U=U+N|0;P=210;break};case 68:{P=212;break};case 252:{N=N+1|0;T=M;Q=N;U=J;N=N&255;break};case 124:{P=288;break};case 43:{P=294;break};case 11:{Q=0;S=U|I;P=297;break};case 12:{O=0;P=296;break};case 171:case 139:{P=277;break};case 172:case 140:{R=S+2|0;S=d[R]<<8|U;P=279;break};case 123:{P=307;break};case 187:case 155:{U=U+L&255;P=277;break};case 188:{Q=M+1|0;T=Q&255;U=J;break};case 183:case 151:{T=U|I;T=(d[b+(T+1)+2716|0]<<8|d[b+T+2716|0])+N|0;P=259;break};case 182:case 150:{U=U+N|0;P=256;break};case 75:{O=0;S=U|I;P=311;break};case 107:{P=308;break};case 28:{O=0;P=290;break};case 167:case 135:{T=U+L&255|I;T=d[b+(T+1)+2716|0]<<8|d[b+T+2716|0];P=259;break};case 60:{P=290;break};case 61:{L=L+1|0;T=M;Q=L;U=J;L=L&255;break};case 180:case 148:{U=U+L&255;P=258;break};case 136:case 168:{Q=-1;S=M;P=260;break};case 76:{O=0;P=310;break};case 27:{O=0;P=293;break};case 164:case 132:{P=258;break};case 29:{L=L+ -1|0;T=M;Q=L;U=J;L=L&255;break};case 92:{O=0;P=288;break};case 44:{P=296;break};case 59:{P=293;break};case 156:{Q=M+ -1|0;T=Q&255;U=J;break};case 91:{O=0;P=307;break};case 165:case 133:{P=256;break};case 108:{P=310;break};case 220:{N=N+ -1|0;T=M;Q=N;U=J;N=N&255;break};case 181:case 149:{U=U+L|0;P=256;break};case 207:{Q=_(M,N)|0;N=Q>>>8;T=Q&255;Q=(Q>>>1|Q)&127|N;U=J;break};case 190:{if((M|0)>153){P=359}else{if((O&256|0)==0){P=359}}if((P|0)==359){P=0;M=M+ -96|0;O=0}if((M&14)>>>0>9){P=362}else{if((K&8|0)==0){P=362}}if((P|0)==362){P=0;M=M+ -6|0}T=M&255;Q=M;U=J;break};case 158:{M=M+(N<<8)|0;K=K&-73;K=(N|0)<(L|0)?K:K|64;if((N|0)<(L<<1|0)){X=(M>>>0)/(L>>>0)|0;Q=X;M=M-(_(X,L)|0)|0}else{X=M-(L<<9)|0;M=256-L|0;Q=255-((X>>>0)/(M>>>0)|0)|0;M=((X>>>0)%(M>>>0)|0)+L|0}Q=Q&255;T=Q;K=(N&15)>>>0<(L&15)>>>0?K:K|8;U=J;N=M;break};case 16:{if((Q&2176|0)==0){T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}else{T=M;R=S+2|0;H=H+ -2|0;U=J;break c}};case 144:{if((O&256|0)==0){T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}else{T=M;R=S+2|0;H=H+ -2|0;U=J;break c}};case 112:{if((K&64|0)==0){T=M;R=S+2|0;H=H+ -2|0;U=J;break c}else{T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}};case 26:case 58:{S=U|I;Q=(W>>>4&2)+ -1+(rj(b,S,H+ -3|0)|0)|0;P=(Q>>>1|Q)&127;T=H+ -2|0;W=Q&255;a[b+S+2716|0]=W;V=S+ -240|0;do{if(V>>>0<16){a[b+V+1940|0]=W;if(!((V|0)!=2&(S+ -244|0)>>>0>3)){break}if((V|0)==3){pj(b,Q,T);break}else{oj(b,Q,T,V);break}}}while(0);S=U+1&255|I;U=(rj(b,S,H+ -1|0)|0)+(Q>>>8)|0;T=U&255;Q=T|P;P=U&255;a[b+S+2716|0]=P;U=S+ -240|0;if(!(U>>>0<16)){P=6;break c}a[b+U+1940|0]=P;if(!((U|0)!=2&(S+ -244|0)>>>0>3)){P=6;break c}if((U|0)==3){pj(b,T,H);P=6;break c}else{oj(b,T,H,U);P=6;break c}};case 47:{R=S+((X<<24>>24)+1)|0;P=6;break};case 186:{Q=rj(b,U|I,H+ -2|0)|0;N=rj(b,U+1&255|I,H)|0;M=Q;Q=Q&127|Q>>1|N;P=6;break};case 48:{if((Q&2176|0)==0){T=M;R=S+2|0;H=H+ -2|0;U=J;break c}else{T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}};case 154:case 122:{O=rj(b,U|I,H+ -2|0)|0;P=rj(b,U+1&255|I,H)|0;if(V<<24>>24==-102){P=P^255;O=(O^255)+1|0}Q=O+M|0;O=P+N+(Q>>8)|0;P=P^N^O;N=O&255;M=Q&255;Q=(Q>>>1|Q)&127|N;K=P>>>1&8|K&-73|(P+128|0)>>>2&64;P=6;break};case 176:{if((O&256|0)==0){T=M;R=S+2|0;H=H+ -2|0;U=J;break c}else{T=M;R=S+((X<<24>>24)+2)|0;U=J;break c}};case 159:{Q=M<<4&240|M>>4;T=Q;U=J;break};case 90:{P=M-(rj(b,U|I,H+ -1|0)|0)|0;Q=N-(rj(b,U+1&255|I,H)|0)+(P>>8)|0;O=~Q;Q=(P>>>1|P)&127|Q&255;P=6;break};case 223:{if((M|0)>153){P=352}else{if((O&256|0)!=0){P=352}}if((P|0)==352){P=0;M=M+96|0;O=256}if((M&14)>>>0>9){P=355}else{if((K&8|0)!=0){P=355}}if((P|0)==355){P=0;M=M+6|0}T=M&255;Q=M;U=J;break};case 218:{T=U|I;P=H+ -1|0;V=M&255;a[b+T+2716|0]=V;S=T+ -240|0;do{if(S>>>0<16){a[b+S+1940|0]=V;if(!((S|0)!=2&(T+ -244|0)>>>0>3)){break}if((S|0)==3){pj(b,M,P);break}else{oj(b,M,P,S);break}}}while(0);P=N+8192|0;T=U+1&255|I;S=P&255;a[b+T+2716|0]=S;U=T+ -240|0;if(!(U>>>0<16)){P=6;break c}a[b+U+1940|0]=S;if(!((U|0)!=2&(T+ -244|0)>>>0>3)){P=6;break c}if((U|0)==3){pj(b,P,H);P=6;break c}else{oj(b,P,H,U);P=6;break c}};case 170:{O=d[S+2|0]|0;T=M;O=(rj(b,O<<8&7936|U,H)|0)>>>(O>>>5)<<8&256;R=S+3|0;U=J;break};case 239:{P=478;break b};case 202:{T=d[S+2|0]|0;R=S+3|0;V=T<<8&7936|U;S=T>>>5;S=((rj(b,V,H+ -2|0)|0)&~(1<<S)|(O>>>8&1)<<S)+8192|0;U=S&255;a[b+V+2716|0]=U;T=V+ -240|0;if(!(T>>>0<16)){T=M;U=J;break c}a[b+T+1940|0]=U;if(!((T|0)!=2&(V+ -244|0)>>>0>3)){T=M;U=J;break c}if((T|0)==3){pj(b,S,H);T=M;U=J;break c}else{oj(b,S,H,T);T=M;U=J;break c}};case 10:{R=d[S+2|0]|0;T=M;O=(rj(b,R<<8&7936|U,H+ -1|0)|0)>>>(R>>>5)<<8&256|O;R=S+3|0;U=J;break};case 106:{R=d[S+2|0]|0;T=M;O=(((rj(b,R<<8&7936|U,H)|0)>>>(R>>>5)<<8|-257)^256)&O;R=S+3|0;U=J;break};case 42:{R=d[S+2|0]|0;T=M;O=((rj(b,R<<8&7936|U,H+ -1|0)|0)>>>(R>>>5)<<8|-257)^256|O;R=S+3|0;U=J;break};case 128:{T=M;O=-1;U=J;break};case 64:{T=M;I=256;U=J;break};case 74:{R=d[S+2|0]|0;T=M;O=O&256&(rj(b,R<<8&7936|U,H)|0)>>>(R>>>5)<<8;R=S+3|0;U=J;break};case 224:{T=M;K=K&-73;U=J;break};case 237:{T=M;O=O^256;U=J;break};case 32:{T=M;I=0;U=J;break};case 192:{T=M;K=K&-5;U=J;break};case 160:{T=M;K=K|4;U=J;break};case 138:{R=d[S+2|0]|0;T=M;O=(rj(b,R<<8&7936|U,H+ -1|0)|0)>>>(R>>>5)<<8&256^O;R=S+3|0;U=J;break};case 234:{T=d[S+2|0]|0;R=S+3|0;V=T<<8&7936|U;S=1<<(T>>>5)^(rj(b,V,H+ -1|0)|0);U=S&255;a[b+V+2716|0]=U;T=V+ -240|0;if(!(T>>>0<16)){T=M;U=J;break c}a[b+T+1940|0]=U;if(!((T|0)!=2&(V+ -244|0)>>>0>3)){T=M;U=J;break c}if((T|0)==3){pj(b,S,H);T=M;U=J;break c}else{oj(b,S,H,T);T=M;U=J;break c}};case 96:{T=M;O=0;U=J;break};case 255:{R=R-v+ -1|0;if(!(R>>>0>65535)){P=478;break b}T=M;R=b+(R&65535)+2716|0;U=J;break};default:{P=479;break b}}}while(0);do{if((P|0)==48){P=0;R=S+3|0;T=d[S+2|0]|I;S=U&255;a[b+T+2716|0]=S;T=T+ -240|0;if(!(T>>>0<16)){T=M;U=J;break}a[b+T+1940|0]=S;if((-788594688<<T|0)>=0){T=M;U=J;break}if((T|0)==3){pj(b,U,H);T=M;U=J;break}else{oj(b,U,H,T);T=M;U=J;break}}else if((P|0)==63){R=S+2|0;M=(d[R]<<8)+U|0;P=65}else if((P|0)==68){P=U|I;L=P+ -253|0;if(L>>>0<3){Q=b+(L*24|0)+1868|0;T=c[Q>>2]|0;do{if((H|0)>=(T|0)){X=c[b+(L*24|0)+1872>>2]|0;S=(H-T|0)/(X|0)|0;P=S+1|0;c[Q>>2]=(_(P,X)|0)+T;if((c[b+(L*24|0)+1884>>2]|0)==0){break}T=c[b+(L*24|0)+1876>>2]|0;Q=b+(L*24|0)+1880|0;U=c[Q>>2]|0;S=S-(T+255-U&255)|0;if((S|0)>-1){P=(S|0)/(T|0)|0;X=b+(L*24|0)+1888|0;c[X>>2]=P+1+(c[X>>2]|0)&15;P=S-(_(P,T)|0)|0}else{P=U+P|0}c[Q>>2]=P&255}}while(0);Q=b+(L*24|0)+1888|0;L=c[Q>>2]|0;c[Q>>2]=0;Q=L;P=6;break}else{L=d[b+P+2716|0]|0;Q=P+ -240|0;if(!(Q>>>0<16)){Q=L;P=6;break}L=d[b+Q+1956|0]|0;Q=P+ -242|0;if(!(Q>>>0<2)){Q=L;P=6;break}P=a[G]|0;L=P&255;if((Q|0)!=1){Q=L;P=6;break}Q=c[j>>2]|0;L=H-(a[b+(L&127)+1612|0]|0)-Q|0;if((L|0)>-1){P=L+32&-32;c[j>>2]=P+Q;vj(D,P);P=a[G]|0}L=d[b+(P&127)|0]|0;Q=L;P=6;break}}else if((P|0)==82){Q=U;L=U;P=6}else if((P|0)==84){P=0;R=S+2|0;Q=U|I;N=Q+ -253|0;if(N>>>0<3){U=b+(N*24|0)+1868|0;S=c[U>>2]|0;do{if((H|0)>=(S|0)){X=c[b+(N*24|0)+1872>>2]|0;T=(H-S|0)/(X|0)|0;Q=T+1|0;c[U>>2]=(_(Q,X)|0)+S;if((c[b+(N*24|0)+1884>>2]|0)==0){break}V=c[b+(N*24|0)+1876>>2]|0;S=b+(N*24|0)+1880|0;U=c[S>>2]|0;T=T-(V+255-U&255)|0;if((T|0)>-1){Q=(T|0)/(V|0)|0;X=b+(N*24|0)+1888|0;c[X>>2]=Q+1+(c[X>>2]|0)&15;Q=T-(_(Q,V)|0)|0}else{Q=U+Q|0}c[S>>2]=Q&255}}while(0);T=b+(N*24|0)+1888|0;N=c[T>>2]|0;c[T>>2]=0;T=M;Q=N;U=J;break}else{N=d[b+Q+2716|0]|0;S=Q+ -240|0;if(!(S>>>0<16)){T=M;Q=N;U=J;break}N=d[b+S+1956|0]|0;S=Q+ -242|0;if(!(S>>>0<2)){T=M;Q=N;U=J;break}Q=a[G]|0;N=Q&255;if((S|0)!=1){T=M;Q=N;U=J;break}S=c[j>>2]|0;N=H-(a[b+(N&127)+1612|0]|0)-S|0;if((N|0)>-1){Q=N+32&-32;c[j>>2]=Q+S;vj(D,Q);Q=a[G]|0}N=d[b+(Q&127)|0]|0;T=M;Q=N;U=J;break}}else if((P|0)==116){R=S+2|0;T=(d[R]<<8)+U|0;P=118}else if((P|0)==127){P=0;V=d[S+2|0]<<8|U;T=R&255;a[b+V+2716|0]=T;U=V+ -240|0;do{if((U|0)>-1){if((U|0)>=16){T=V+ -65472|0;if(!((T|0)>-1)){break}qj(b,R,T,H);break}a[b+U+1940|0]=T;if(!((U|0)!=2&(V+ -244|0)>>>0>3)){break}if((U|0)==3){pj(b,R,H);break}else{oj(b,R,H,U);break}}}while(0);T=M;R=S+3|0;U=J}else if((P|0)==137){S=U|I;T=L&255;a[b+S+2716|0]=T;P=S+ -240|0;if(!(P>>>0<16)){P=6;break}a[b+P+1940|0]=T;if(!((P|0)!=2&(S+ -244|0)>>>0>3)){P=6;break}if((P|0)==3){pj(b,L,H);P=6;break}else{oj(b,L,H,P);P=6;break}}else if((P|0)==143){S=U|I;T=N&255;a[b+S+2716|0]=T;P=S+ -240|0;if(!(P>>>0<16)){P=6;break}a[b+P+1940|0]=T;if(!((P|0)!=2&(S+ -244|0)>>>0>3)){P=6;break}if((P|0)==3){pj(b,N,H);P=6;break}else{oj(b,N,H,P);P=6;break}}else if((P|0)==168){R=S+2|0;Q=(d[R]<<8)+U|0;P=171}else if((P|0)==170){Q=U|I;P=171}else if((P|0)==175){T=d[S+2|0]|I;R=S+3|0;P=176}else if((P|0)==189){R=S+2|0;Q=(d[R]<<8)+U|0;P=192}else if((P|0)==191){Q=U|I;P=192}else if((P|0)==196){T=d[S+2|0]|I;R=S+3|0;P=197}else if((P|0)==210){R=S+2|0;Q=(d[R]<<8)+U|0;P=213}else if((P|0)==212){Q=U|I;P=213}else if((P|0)==217){T=d[S+2|0]|I;R=S+3|0;P=218}else if((P|0)==231){R=S+2|0;O=(d[R]<<8)+U|0;P=234}else if((P|0)==233){O=U|I;P=234}else if((P|0)==238){R=S+2|0;Q=(rj(b,d[R]|I,H+ -1|0)|0)-U|0;O=~Q;Q=Q&255;P=6}else if((P|0)==241){U=rj(b,O,H)|0;P=242}else if((P|0)==245){U=rj(b,O,H)|0;P=246}else if((P|0)==249){R=S+2|0;T=d[R]|I;P=250}else if((P|0)==256){R=S+2|0;T=(d[R]<<8)+U|0;P=259}else if((P|0)==258){T=U|I;P=259}else if((P|0)==277){S=U|I;P=279}else if((P|0)==288){P=0;Q=O>>>1&128|M>>1;T=Q;O=M<<8;U=J}else if((P|0)==290){P=0;U=M<<1;Q=O>>>8&1|U;T=Q&255;O=U;U=J}else if((P|0)==293){U=U+L&255;P=294}else if((P|0)==296){R=S+2|0;Q=O;S=d[R]<<8|U;P=297}else if((P|0)==307){U=U+L&255;P=308}else if((P|0)==310){R=S+2|0;S=d[R]<<8|U;P=311}else if((P|0)==388){R=H+ -4|0;T=U|I;P=T+ -253|0;do{if(P>>>0<3){V=b+(P*24|0)+1868|0;T=c[V>>2]|0;do{if((R|0)>=(T|0)){X=c[b+(P*24|0)+1872>>2]|0;U=(R-T|0)/(X|0)|0;R=U+1|0;c[V>>2]=(_(R,X)|0)+T;if((c[b+(P*24|0)+1884>>2]|0)==0){break}W=c[b+(P*24|0)+1876>>2]|0;T=b+(P*24|0)+1880|0;V=c[T>>2]|0;U=U-(W+255-V&255)|0;if((U|0)>-1){R=(U|0)/(W|0)|0;X=b+(P*24|0)+1888|0;c[X>>2]=R+1+(c[X>>2]|0)&15;R=U-(_(R,W)|0)|0}else{R=V+R|0}c[T>>2]=R&255}}while(0);X=b+(P*24|0)+1888|0;U=c[X>>2]|0;c[X>>2]=0}else{P=T+ -240|0;if(!(P>>>0<16)){U=d[b+T+2716|0]|0;break}T=T+ -242|0;if(!(T>>>0<2)){U=d[b+P+1956|0]|0;break}P=a[G]|0;U=P&255;if((T|0)!=1){break}T=c[j>>2]|0;R=R-(a[b+(U&127)+1612|0]|0)-T|0;if((R|0)>-1){P=R+32&-32;c[j>>2]=P+T;vj(D,P);P=a[G]|0}U=d[b+(P&127)|0]|0}}while(0);R=S+2|0;if((U|0)!=(M|0)){P=5;break}H=H+ -2|0;P=6}else if((P|0)==414){P=0;T=M;R=b+(d[R+1|0]<<8|X&255)+2716|0;U=J}else if((P|0)==428){P=0;T=M;O=K<<8;I=K<<3&256;Q=(K<<4&2048|K&2)^2}}while(0);do{if((P|0)==5){R=R+(a[R]|0)|0;P=6}else if((P|0)==65){Q=rj(b,M,H)|0;M=Q;P=6}else if((P|0)==118){P=M&255;a[b+T+2716|0]=P;S=T+ -240|0;if(!((S|0)>-1)){P=6;break}if((S|0)>=16){P=T+ -65472|0;if(!((P|0)>-1)){P=6;break}qj(b,M,P,H);P=6;break}a[b+S+1940|0]=P;if(!((S|0)!=2&(T+ -244|0)>>>0>3)){P=6;break}if((S|0)==3){pj(b,M,H);P=6;break}else{oj(b,M,H,S);P=6;break}}else if((P|0)==171){U=rj(b,Q,H)|0;P=172}else if((P|0)==176){P=0;Q=(rj(b,T,H+ -1|0)|0)&U;S=Q&255;a[b+T+2716|0]=S;U=T+ -240|0;if(!((U|0)>-1)){T=M;U=J;break}if((U|0)>=16){S=T+ -65472|0;if(!((S|0)>-1)){T=M;U=J;break}qj(b,Q,S,H);T=M;U=J;break}a[b+U+1940|0]=S;if(!((U|0)!=2&(T+ -244|0)>>>0>3)){T=M;U=J;break}if((U|0)==3){pj(b,Q,H);T=M;U=J;break}else{oj(b,Q,H,U);T=M;U=J;break}}else if((P|0)==192){U=rj(b,Q,H)|0;P=193}else if((P|0)==197){P=0;Q=rj(b,T,H+ -1|0)|0|U;S=Q&255;a[b+T+2716|0]=S;U=T+ -240|0;if(!((U|0)>-1)){T=M;U=J;break}if((U|0)>=16){S=T+ -65472|0;if(!((S|0)>-1)){T=M;U=J;break}qj(b,Q,S,H);T=M;U=J;break}a[b+U+1940|0]=S;if(!((U|0)!=2&(T+ -244|0)>>>0>3)){T=M;U=J;break}if((U|0)==3){pj(b,Q,H);T=M;U=J;break}else{oj(b,Q,H,U);T=M;U=J;break}}else if((P|0)==213){U=rj(b,Q,H)|0;P=214}else if((P|0)==218){P=0;Q=(rj(b,T,H+ -1|0)|0)^U;U=Q&255;a[b+T+2716|0]=U;S=T+ -240|0;if(!((S|0)>-1)){T=M;U=J;break}if((S|0)>=16){S=T+ -65472|0;if(!((S|0)>-1)){T=M;U=J;break}qj(b,Q,S,H);T=M;U=J;break}a[b+S+1940|0]=U;if(!((S|0)!=2&(T+ -244|0)>>>0>3)){T=M;U=J;break}if((S|0)==3){pj(b,Q,H);T=M;U=J;break}else{oj(b,Q,H,S);T=M;U=J;break}}else if((P|0)==234){U=rj(b,O,H)|0;P=235}else if((P|0)==242){Q=L-U|0;O=~Q;Q=Q&255;P=6}else if((P|0)==246){Q=N-U|0;O=~Q;Q=Q&255;P=6}else if((P|0)==250){Q=T;S=rj(b,T,H+ -1|0)|0;P=260}else if((P|0)==259){Q=-1;U=rj(b,T,H)|0;S=M;P=260}else if((P|0)==279){Q=(W>>>4&2)+ -1+(rj(b,S,H+ -1|0)|0)|0;T=Q&255;a[b+S+2716|0]=T;P=S+ -240|0;if(!((P|0)>-1)){P=6;break}if((P|0)>=16){P=S+ -65472|0;if(!((P|0)>-1)){P=6;break}qj(b,Q,P,H);P=6;break}a[b+P+1940|0]=T;if(!((P|0)!=2&(S+ -244|0)>>>0>3)){P=6;break}if((P|0)==3){pj(b,Q,H);P=6;break}else{oj(b,Q,H,P);P=6;break}}else if((P|0)==294){Q=O;S=U|I;P=297}else if((P|0)==308){S=U|I;P=311}}while(0);do{if((P|0)==172){Q=U&M;M=Q;P=6}else if((P|0)==193){Q=U|M;M=Q;P=6}else if((P|0)==214){Q=U^M;M=Q;P=6}else if((P|0)==235){Q=M-U|0;O=~Q;Q=Q&255;P=6}else if((P|0)==260){X=(V&255)>159?U^255:U;P=S+(O>>>8&1)+X|0;X=X^S^P;K=X>>>1&8|K&-73|(X+128|0)>>>2&64;if((Q|0)<0){M=P&255;O=P;Q=P;P=6;break}O=P&255;a[b+Q+2716|0]=O;S=Q+ -240|0;if(!((S|0)>-1)){O=P;Q=P;P=6;break}if((S|0)>=16){O=Q+ -65472|0;if(!((O|0)>-1)){O=P;Q=P;P=6;break}qj(b,P,O,H);O=P;Q=P;P=6;break}a[b+S+1940|0]=O;if(!((S|0)!=2&(Q+ -244|0)>>>0>3)){O=P;Q=P;P=6;break}if((S|0)==3){pj(b,P,H);O=P;Q=P;P=6;break}else{oj(b,P,H,S);O=P;Q=P;P=6;break}}else if((P|0)==297){O=(rj(b,S,H+ -1|0)|0)<<1;Q=O|Q>>>8&1;P=Q&255;a[b+S+2716|0]=P;T=S+ -240|0;if(!((T|0)>-1)){P=6;break}if((T|0)>=16){P=S+ -65472|0;if(!((P|0)>-1)){P=6;break}qj(b,Q,P,H);P=6;break}a[b+T+1940|0]=P;if(!((T|0)!=2&(S+ -244|0)>>>0>3)){P=6;break}if((T|0)==3){pj(b,Q,H);P=6;break}else{oj(b,Q,H,T);P=6;break}}else if((P|0)==311){P=rj(b,S,H+ -1|0)|0;Q=P>>1|O>>>1&128;O=P<<8;P=Q&255;a[b+S+2716|0]=P;T=S+ -240|0;if(!((T|0)>-1)){P=6;break}if((T|0)>=16){P=S+ -65472|0;if(!((P|0)>-1)){P=6;break}qj(b,Q,P,H);P=6;break}a[b+T+1940|0]=P;if(!((T|0)!=2&(S+ -244|0)>>>0>3)){P=6;break}if((T|0)==3){pj(b,Q,H);P=6;break}else{oj(b,Q,H,T);P=6;break}}}while(0);if((P|0)==6){P=0;T=M;R=R+1|0;U=J}V=a[R]|0;W=V&255;J=(d[b+W+2204|0]|0)+H|0;if((J|0)>0){s=T;A=O;B=I;g=Q;q=R;C=K;k=H;r=U;t=L;u=N;break a}else{H=J;M=T;S=R;J=U}}if((P|0)==478){c[b+2020>>2]=51600;s=M;A=O;B=I;g=Q;q=S;C=K;k=0;r=J;t=L;u=N;break}else if((P|0)==479){za(51624,51544,1200,51584)}}}while(0);c[w>>2]=q-v&65535;c[x>>2]=r+ -257-v&255;c[y>>2]=s&255;c[z>>2]=t&255;c[p>>2]=u&255;p=A>>>8&1|B>>>3|C&-164|(g>>>4|g)&128;c[h>>2]=((g&255)<<24>>24==0?p|2:p)&255;X=(c[n>>2]|0)+k|0;c[n>>2]=X;c[j>>2]=(c[j>>2]|0)-k;c[f>>2]=(c[f>>2]|0)-k;c[l>>2]=(c[l>>2]|0)-k;c[m>>2]=(c[m>>2]|0)-k;if((X|0)>(e|0)){za(51632,51544,1220,51584)}else{i=o;return b+1944|0}return 0}function uj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((d&1|0)==0){e=(b|0)==0;b=e?a+1580|0:b;c[a+1576>>2]=b;c[a+1568>>2]=b;c[a+1572>>2]=b+((e?16:d)<<1);i=i;return}else{za(51656,51672,78,51712)}}function vj(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0;g=i;va=e+280|0;ua=(c[va>>2]|0)+f|0;$=ua>>5;c[va>>2]=ua&31;if(($|0)==0){i=g;return}j=c[e+1556>>2]|0;k=d[e+93|0]<<8;n=e+45|0;l=e+61|0;m=(d[n]|0)>>>1|d[l];f=e+108|0;u=a[f]&31;o=a[e+12|0]|0;h=a[e+28|0]|0;va=_(h,o)|0;t=(va|0)<(c[e+1564>>2]|0)?0-o|0:o;s=e+260|0;p=e+288|0;q=e+292|0;o=e+296|0;r=e+(u<<2)+1428|0;X=c[51728+(u<<2)>>2]|0;T=e+268|0;u=e+308|0;V=e;O=e+124|0;Q=e+304|0;P=e+264|0;S=e+77|0;J=e+272|0;N=e+109|0;L=e+125|0;M=e+276|0;z=e+256|0;K=e+192|0;I=e+128|0;A=e+127|0;B=e+15|0;C=e+31|0;D=e+47|0;E=e+63|0;F=e+79|0;G=e+95|0;H=e+111|0;y=e+13|0;w=e+44|0;x=e+60|0;Y=e+1568|0;v=e+1572|0;R=e+1580|0;U=e+1612|0;Z=e+300|0;W=e+92|0;a:while(1){va=c[s>>2]|0;c[s>>2]=va^1;if((va|0)!=1){va=c[Z>>2]&~c[P>>2];c[Z>>2]=va;c[P>>2]=va;c[Q>>2]=d[W]|0}ba=c[p>>2]|0;c[p>>2]=((ba&7|0)==0?-6:-1)+ba;ba=c[q>>2]|0;c[q>>2]=((ba&7|0)==0?-5:-1)+ba;ba=c[o>>2]|0;c[o>>2]=((ba&7|0)==0?-4:-1)+ba;if((X&c[c[r>>2]>>2]|0)==0){ga=c[T>>2]|0;c[T>>2]=(ga<<13^ga<<14)&16384^ga>>1;ga=0;ha=0;fa=0;ea=0;ia=0;ba=u;ca=V;da=1}else{ga=0;ha=0;fa=0;ea=0;ia=0;ba=u;ca=V;da=1}while(1){ja=ba+104|0;ka=d[j+(c[ja>>2]|0)|0]|0;ma=ba+112|0;la=c[ma>>2]|0;na=d[ca+3|0]<<8&16128|d[ca+2|0];if((d[n]&da|0)!=0){na=((_(na,ia>>5)|0)>>10)+na|0}ia=la+ -1|0;do{if((la|0)>0){c[ma>>2]=ia;if((ia|0)==4){ka=(d[ca+4|0]<<2)+k|0;c[ja>>2]=d[j+(ka|1)|0]<<8|d[j+ka|0];c[ba+108>>2]=1;c[ba+96>>2]=ba;ka=0}c[ba+120>>2]=0;c[ba+124>>2]=0;c[ba+100>>2]=(ia&3|0)!=0?16384:0;a[ca+8|0]=0;la=ba+120|0;oa=0;ia=0;na=0}else{oa=c[ba+120>>2]|0;la=ba+120|0;a[ca+8|0]=oa>>>4;if((oa|0)==0){oa=0;ia=0;break}ua=c[ba+100>>2]|0;qa=ua>>>3&510;sa=51856+(qa<<1)|0;pa=510-qa|0;ia=51856+(pa<<1)|0;ua=ua>>>12;va=c[ba+96>>2]|0;ra=va+(ua<<2)|0;if((da&m|0)==0){ta=_(b[sa>>1]|0,c[ra>>2]|0)|0;ta=(_(b[51856+((qa|1)<<1)>>1]|0,c[va+(ua+1<<2)>>2]|0)|0)+ta|0;ta=ta+(_(b[51856+((pa|1)<<1)>>1]|0,c[va+(ua+2<<2)>>2]|0)|0)|0;ia=(_(ta+(_(b[ia>>1]|0,c[va+(ua+3<<2)>>2]|0)|0)>>11,oa)|0)>>11}else{ta=c[T>>2]<<17>>16;if((d[l]&da|0)==0){ta=(_(b[sa>>1]|0,c[ra>>2]|0)|0)>>>11;ta=((_(b[51856+((qa|1)<<1)>>1]|0,c[va+(ua+1<<2)>>2]|0)|0)>>>11)+ta|0;ta=ta+((_(b[51856+((pa|1)<<1)>>1]|0,c[va+(ua+2<<2)>>2]|0)|0)>>>11)<<16>>16;ia=ta+((_(b[ia>>1]|0,c[va+(ua+3<<2)>>2]|0)|0)>>11)|0;if((ia<<16>>16|0)!=(ia|0)){ia=ia>>31^32767}ta=ia&-2}ia=(_(ta,oa)|0)>>11&-2}qa=_(c[ba+128>>2]|0,ia)|0;pa=_(c[ba+132>>2]|0,ia)|0;fa=qa+fa|0;ea=pa+ea|0;if((d[S]&da|0)==0){break}ga=qa+ga|0;ha=pa+ha|0}}while(0);a[ca+9|0]=ia>>>8;if((a[f]|0)<0){aa=25}else{if((ka&3|0)==1){aa=25}}if((aa|0)==25){aa=0;c[ba+116>>2]=0;oa=0}do{if((c[s>>2]|0)!=0){if((c[Q>>2]&da|0)!=0){c[ba+116>>2]=0}if((c[P>>2]&da|0)==0){break}c[ma>>2]=5;c[ba+116>>2]=1;a[O]=d[O]&(da^255)}}while(0);ma=(c[ma>>2]|0)==0;b:do{if(ma){pa=ba+116|0;qa=c[pa>>2]|0;if((qa|0)==0){va=oa+ -8|0;c[la>>2]=va;if((va|0)>=1){aa=57;break}c[la>>2]=0;break}va=a[ca+5|0]|0;ra=va&255;sa=d[ca+6|0]|0;do{if(va<<24>>24<0){if((qa|0)>2){aa=oa+ -1|0;aa=aa-(aa>>8)|0;va=sa&31;c[ba+124>>2]=aa;if((c[51728+(va<<2)>>2]&c[c[e+(va<<2)+1428>>2]>>2]|0)!=0){aa=57;break b}c[la>>2]=aa;aa=57;break b}if((qa|0)==2){aa=oa+ -1|0;aa=aa-(aa>>8)|0;ra=ra>>>3&14|16;break}else{ra=ra<<1&30|1;aa=((ra|0)!=31?32:1024)+oa|0;break}}else{aa=a[ca+7|0]|0;sa=aa&255;ta=sa>>>5;if(aa<<24>>24>-1){aa=sa<<4;ra=31;break}ra=sa&31;if((ta|0)==4){aa=oa+ -32|0;break}if((aa&255)<192){aa=oa+ -1|0;aa=aa-(aa>>8)|0;break}aa=oa+32|0;if((ta|0)!=7){break}aa=(c[ba+124>>2]|0)>>>0>1535?oa+8|0:aa}}while(0);if((aa>>8|0)==(sa>>>5|0)&(qa|0)==2){c[pa>>2]=3;qa=3}c[ba+124>>2]=aa;do{if(aa>>>0>2047){aa=(aa>>31&-2047)+2047|0;if((qa|0)!=1){break}c[pa>>2]=2}}while(0);if((c[51728+(ra<<2)>>2]&c[c[e+(ra<<2)+1428>>2]>>2]|0)!=0){aa=57;break}c[la>>2]=aa;aa=57}else{aa=57}}while(0);do{if((aa|0)==57){aa=0;la=ba+100|0;oa=c[la>>2]|0;na=(oa&16383)+na|0;c[la>>2]=(na|0)>32767?32767:na;if((oa|0)<=16383){break}na=c[ja>>2]|0;la=ba+108|0;pa=c[la>>2]|0;oa=pa+na|0;oa=d[j+(oa&65535)|0]<<8|d[j+(oa+1&65535)|0];pa=pa+2|0;if((pa|0)>8){if((pa|0)!=9){aa=60;break a}do{if((ka&1|0)==0){na=na+9&65535}else{na=(d[ca+4|0]<<2|2)+k|0;na=d[j+(na|1)|0]<<8|d[j+na|0];if(!ma){break}a[O]=d[O]|da}}while(0);c[ja>>2]=na;pa=1}c[la>>2]=pa;ma=ka>>4;na=d[52920+ma|0]|0;ma=d[ma+52936|0]|0;ja=ba+96|0;pa=c[ja>>2]|0;la=pa+16|0;qa=ka&12;ka=(qa|0)==8;if(qa>>>0>7){while(1){ra=c[pa+44>>2]|0;sa=c[pa+40>>2]|0;qa=sa>>1;ta=ra+(oa<<16>>16>>na<<ma)-qa|0;if(ka){qa=((_(ra,-3)|0)>>6)+(sa>>5)+ta|0}else{qa=ta+((_(ra,-13)|0)>>7)+(qa*3>>4)|0}if((qa<<16>>16|0)!=(qa|0)){qa=qa>>31^32767}va=qa<<17>>16;c[pa>>2]=va;c[pa+48>>2]=va;pa=pa+4|0;if(pa>>>0<la>>>0){oa=oa<<4}else{break}}}else{if((qa|0)==0){while(1){ka=oa<<16>>16>>na<<ma;if((ka<<16>>16|0)!=(ka|0)){ka=ka>>31^32767}va=ka<<17>>16;c[pa>>2]=va;c[pa+48>>2]=va;pa=pa+4|0;if(pa>>>0<la>>>0){oa=oa<<4}else{break}}}else{while(1){ka=c[pa+44>>2]|0;ka=(ka>>1)+(oa<<16>>16>>na<<ma)+(0-ka>>5)|0;if((ka<<16>>16|0)!=(ka|0)){ka=ka>>31^32767}va=ka<<17>>16;c[pa>>2]=va;c[pa+48>>2]=va;pa=pa+4|0;if(pa>>>0<la>>>0){oa=oa<<4}else{break}}}}c[ja>>2]=pa>>>0<(ba+48|0)>>>0?pa:ba}}while(0);da=da<<1;if((da|0)>=256){break}ba=ba+140|0;ca=ca+16|0}da=c[J>>2]|0;ia=(d[N]<<8)+da&65535;ba=j+ia|0;if((da|0)==0){ca=d[L]<<11&30720;c[M>>2]=ca}else{ca=c[M>>2]|0}da=da+4|0;c[J>>2]=(da|0)>=(ca|0)?0:da;da=j+(ia+1)|0;ja=(d[da]<<8|d[ba])<<16>>16;ca=j+(ia+2)|0;ia=j+(ia+3)|0;la=(d[ia]<<8|d[ca])<<16>>16;ka=(c[z>>2]|0)+8|0;va=ka>>>0<K>>>0?ka:I;c[z>>2]=va;c[va+64>>2]=ja;c[va>>2]=ja;c[va+68>>2]=la;c[va+4>>2]=la;ua=a[A]|0;ka=_(ua,ja)|0;ja=_(la,ua)|0;ua=a[B]|0;ka=(_(ua,c[va+8>>2]|0)|0)+ka|0;ja=(_(c[va+12>>2]|0,ua)|0)+ja|0;ua=a[C]|0;ka=ka+(_(ua,c[va+16>>2]|0)|0)|0;ua=ja+(_(c[va+20>>2]|0,ua)|0)|0;ja=a[D]|0;ka=ka+(_(ja,c[va+24>>2]|0)|0)|0;ja=ua+(_(c[va+28>>2]|0,ja)|0)|0;ua=a[E]|0;ka=ka+(_(ua,c[va+32>>2]|0)|0)|0;ua=ja+(_(c[va+36>>2]|0,ua)|0)|0;ja=a[F]|0;ka=ka+(_(ja,c[va+40>>2]|0)|0)|0;ja=ua+(_(c[va+44>>2]|0,ja)|0)|0;ua=a[G]|0;ka=ka+(_(ua,c[va+48>>2]|0)|0)|0;ua=ja+(_(c[va+52>>2]|0,ua)|0)|0;ja=a[H]|0;ka=ka+(_(ja,c[va+56>>2]|0)|0)|0;ja=ua+(_(c[va+60>>2]|0,ja)|0)|0;if((a[f]&32)==0){va=a[y]|0;ga=((_(va,ka)|0)>>14)+(ga>>7)|0;ha=((_(va,ja)|0)>>14)+(ha>>7)|0;if((ga<<16>>16|0)!=(ga|0)){ga=ga>>31^32767}if((ha<<16>>16|0)!=(ha|0)){ha=ha>>31^32767}a[da]=ga>>>8;a[ba]=ga;a[ia]=ha>>>8;a[ca]=ha}ba=_(fa,t)|0;ba=(_(a[w]|0,ka)|0)+ba|0;ca=ba>>14;da=_(ea,h)|0;da=(_(a[x]|0,ja)|0)+da|0;ea=da>>14;if((ca<<16>>16|0)!=(ca|0)){ca=ba>>31^32767}if((ea<<16>>16|0)!=(ea|0)){ea=da>>31^32767}ba=(a[f]&64)==0;da=c[Y>>2]|0;b[da>>1]=ba?ca&65535:0;b[da+2>>1]=ba?ea&65535:0;ba=da+4|0;if(!(ba>>>0<(c[v>>2]|0)>>>0)){c[v>>2]=U;ba=R}c[Y>>2]=ba;$=$+ -1|0;if(($|0)==0){aa=98;break}}if((aa|0)==60){za(52880,51672,471,52912)}else if((aa|0)==98){i=g;return}}function wj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;c[b+1560>>2]=d;f=b+1564|0;g=0;do{h=(d>>>g&1)+ -1|0;c[b+(g*140|0)+444>>2]=h;j=g<<4;k=a[b+j|0]|0;j=a[b+(j|1)|0]|0;l=_(j,k)|0;if((l|0)<(c[f>>2]|0)){k=k>>7^k;j=j>>7^j}c[b+(g*140|0)+436>>2]=h&k;c[b+(g*140|0)+440>>2]=h&j;g=g+1|0;}while((g|0)!=8);i=e;return}function xj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+8|0;f=e;c[b+1556>>2]=d;c[b+1560>>2]=0;d=b+1564|0;g=0;do{c[b+(g*140|0)+444>>2]=-1;h=g<<4;j=a[b+h|0]|0;h=a[b+(h|1)|0]|0;k=_(h,j)|0;if((k|0)<(c[d>>2]|0)){j=j>>7^j;h=h>>7^h}c[b+(g*140|0)+436>>2]=j;c[b+(g*140|0)+440>>2]=h;g=g+1|0;}while((g|0)!=8);c[d>>2]=-16384;k=b+1580|0;c[b+1576>>2]=k;c[b+1568>>2]=k;c[b+1572>>2]=b+1612;zj(b,52984);c[f>>2]=1;if((a[f]|0)==0){za(53112,53144,62,53184)}else{i=e;return}}function yj(a){a=a|0;var b=0;b=i;zj(a,52984);i=b;return}function zj(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;g=b+0|0;e=e+0|0;h=g+128|0;do{a[g]=a[e]|0;g=g+1|0;e=e+1|0}while((g|0)<(h|0));Pl(b+128|0,0,1428)|0;c[b+1396>>2]=1;c[b+1384>>2]=b+1288;c[b+1256>>2]=1;c[b+1244>>2]=b+1148;c[b+1116>>2]=1;c[b+1104>>2]=b+1008;c[b+976>>2]=1;c[b+964>>2]=b+868;c[b+836>>2]=1;c[b+824>>2]=b+728;c[b+696>>2]=1;c[b+684>>2]=b+588;c[b+556>>2]=1;c[b+544>>2]=b+448;c[b+416>>2]=1;c[b+404>>2]=b+308;c[b+300>>2]=d[b+76|0]|0;h=c[b+1560>>2]|0;j=b+1564|0;e=0;do{g=(h>>>e&1)+ -1|0;c[b+(e*140|0)+444>>2]=g;k=e<<4;l=a[b+k|0]|0;k=a[b+(k|1)|0]|0;m=_(k,l)|0;if((m|0)<(c[j>>2]|0)){l=l>>7^l;k=k>>7^k}c[b+(e*140|0)+436>>2]=l&g;c[b+(e*140|0)+440>>2]=k&g;e=e+1|0;}while((e|0)!=8);if((c[b+1556>>2]|0)==0){za(52952,51672,667,52960)}c[b+268>>2]=16384;c[b+256>>2]=b+128;c[b+260>>2]=1;c[b+272>>2]=0;c[b+280>>2]=0;g=b+284|0;c[g>>2]=1;c[b+288>>2]=0;e=b+292|0;c[e>>2]=-32;c[b+296>>2]=11;h=1;j=2;while(1){c[b+(h<<2)+1428>>2]=b+(j<<2)+284;j=j+ -1|0;h=h+1|0;if((h|0)==32){break}else{j=(j|0)!=0?j:3}}c[b+1428>>2]=g;c[b+1548>>2]=e;i=f;return}function Aj(a){a=a|0;var b=0;b=i;c[a>>2]=53224;Kd(a+328|0);Eg(a);Al(a);i=b;return}function Bj(a){a=a|0;var b=0;b=i;c[a>>2]=53224;Kd(a+328|0);Eg(a);i=b;return}function Cj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;d=i;f=c[a+316>>2]|0;e=c[a+320>>2]|0;a=e+ -66048|0;Dj(f,f+((e|0)<66048?e:66048)|0,(a|0)<0?0:a,b);i=d;return 0}function Dj(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;i=i+264|0;j=h;l=0;m=0;while(1){k=(d[b+l+169|0]|0)+ -48|0;if(k>>>0>9){k=3;break}m=k+(m*10|0)|0;l=l+1|0;if((l|0)>=3){k=7;break}}do{if((k|0)==3){if((l|0)!=1){k=7;break}if((a[b+176|0]|0)!=0){k=8;break}if((a[b+177|0]|0)==0){k=8}else{k=7}}}while(0);if((k|0)==7){if((m|0)==0|(m|0)>8191){k=8}}if((k|0)==8){m=d[b+170|0]<<8|d[b+169|0]}if((m|0)<8191){c[g+4>>2]=m*1e3}l=a[b+176|0]|0;if(l<<24>>24<32){l=1}else{l=((l<<24>>24)+ -48|0)>>>0<10}n=l&1;o=g+784|0;Me(o,b+n+176|0,32-n|0);n=g+528|0;Me(n,b+46|0,32);l=g+272|0;Me(l,b+78|0,32);m=g+1552|0;Me(m,b+110|0,16);p=g+1296|0;Me(p,b+126|0,32);if((f|0)==0){i=h;return}b=j;q=e+f|0;if((f|0)<8){i=h;return}if((Jl(e,53784,4)|0)!=0){i=h;return}f=d[e+6|0]<<16|d[e+7|0]<<24|d[e+5|0]<<8|d[e+4|0];v=e+8|0;r=v;if((q-r|0)>(f|0)){q=e+(f+8)|0}f=q;if((f-r|0)<=3){i=h;return}r=e;e=j+5|0;s=0;t=0;do{x=d[v+3|0]<<8|d[v+2|0];u=(a[v+1|0]|0)!=0?x:0;w=v+4|0;if((u|0)>(f-w|0)){break}switch(d[v]|0){case 1:{x=n;k=29;break};case 4:{x=m;k=29;break};case 7:{x=p;k=29;break};case 3:{x=o;k=29;break};case 19:{s=u>>>0<256?u:256;Nl(e|0,w|0,s|0)|0;break};case 20:{t=x;break};case 2:{x=l;k=29;break};default:{}}if((k|0)==29){k=0;Me(x,w,u)}u=v+(u+4)|0;v=u;while(1){if(!((v-r&3|0)!=0&v>>>0<q>>>0)){break}if((a[v]|0)==0){v=v+1|0}else{v=u;break}}}while((f-v|0)>3);if((t|0)==0){b=e}else{a[j+4|0]=32;a[j+3|0]=((t|0)%10|0)+48;a[j+2|0]=(((t|0)/10|0|0)%10|0)+48;a[j+1|0]=(((t|0)/100|0|0)%10|0)+48;a[b]=(((t|0)/1e3|0|0)%10|0)+48;s=s+5|0}if((s|0)==0){i=h;return}Me(g+1040|0,b,s);i=h;return}function Ej(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=ej(a+1956|0)|0;if((e|0)!=0){i=d;return e|0}jb[c[(c[a>>2]|0)+48>>2]&31](a,0);if((b|0)==32e3){e=0;i=d;return e|0}e=a+328|0;a=Md(e,3200)|0;if((a|0)!=0){e=a;i=d;return e|0}+Nd(e,32.0e3/+(b|0),.9965,1.0);e=0;i=d;return e|0}function Fj(b,c){b=b|0;c=c|0;a[b+1928|0]=c&1;i=i;return}function Gj(a,b){a=a|0;b=b|0;var c=0;c=i;wj(a+1956|0,b);i=c;return}function Hj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;c[a+316>>2]=b;c[a+320>>2]=d;c[a+232>>2]=8;if((d|0)<65920){a=c[10038]|0;i=e;return a|0}else{a=(Jl(b,53600,27)|0)==0;a=a?0:c[10038]|0;i=e;return a|0}return 0}function Ij(a,b){a=a|0;b=+b;var c=0;c=i;fj(a+1956|0,~~(b*256.0));i=c;return}function Jj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;b=i;Ld(a+328|0);e=a+1920|0;Tj(e);f=a+1956|0;d=hj(f,c[a+316>>2]|0,c[a+320>>2]|0)|0;if((d|0)!=0){f=d;i=b;return f|0}c[e>>2]=~~(+h[a+248>>3]*256.0);ij(f);f=0;i=b;return f|0}function Kj(a,b){a=a|0;b=b|0;var d=0,e=0;e=i;i=i+128|0;d=e;if((c[a+256>>2]|0)!=32e3){b=~~(+(b|0)*+h[a+368>>3])&-2;b=b-(Od(a+328|0,b)|0)|0}do{if((b|0)>0){b=mj(a+1956|0,b)|0;if((b|0)==0){Tj(a+1920|0);break}else{i=e;return b|0}}}while(0);b=eb[c[(c[a>>2]|0)+64>>2]&63](a,64,d)|0;i=e;return b|0}function Lj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;if((c[a+256>>2]|0)==32e3){f=lj(a+1956|0,b,d)|0;if((f|0)!=0){p=f;i=e;return p|0}Vj(a+1920|0,d,b);p=0;i=e;return p|0}if((b|0)<=0){p=0;i=e;return p|0}k=a+328|0;h=k;j=a+332|0;g=a+336|0;f=a+1956|0;a=a+1920|0;o=b;while(1){o=o-(Mj(k,d+(b-o<<1)|0,o)|0)|0;p=(o|0)>0;if(!p){n=0;b=11;break}l=c[g>>2]|0;m=(c[h>>2]|0)+(c[j>>2]<<1)-l>>1;n=lj(f,m,l)|0;if((n|0)!=0){b=11;break}Vj(a,l,m);n=(c[g>>2]|0)+(m<<1)|0;c[g>>2]=n;if(n>>>0>((c[h>>2]|0)+(c[j>>2]<<1)|0)>>>0){b=10;break}if(p){}else{n=0;b=11;break}}if((b|0)==10){za(53528,53552,96,53592)}else if((b|0)==11){i=e;return n|0}return 0}function Mj(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=i;g=c[a>>2]|0;f=a+8|0;o=c[f>>2]|0;k=a+16|0;s=c[k>>2]|0;l=c[a+12>>2]|0;u=l-s|0;m=c[a+32>>2]|0;j=o;a:do{if((j-g|0)>94){n=c[a+28>>2]|0;o=o+ -96|0;p=a+52|0;v=e>>1;e=a+(s*48|0)+52|0;r=g;q=d;s=n>>>s;while(1){t=v+ -1|0;if((v|0)<1){break a}else{x=r;y=e;v=0;z=12;w=0}while(1){A=b[y>>1]|0;v=(_(b[x>>1]|0,A)|0)+v|0;A=(_(b[x+2>>1]|0,A)|0)+w|0;w=b[y+2>>1]|0;v=v+(_(b[x+4>>1]|0,w)|0)|0;w=A+(_(b[x+6>>1]|0,w)|0)|0;z=z+ -1|0;if((z|0)==0){break}else{y=y+4|0;x=x+8|0}}u=u+ -1|0;r=r+((s<<1&2)+m<<1)|0;x=(u|0)==0;u=x?l:u;b[q>>1]=v>>>15;b[q+2>>1]=w>>>15;q=q+4|0;if(r>>>0>o>>>0){break}else{e=x?p:e+48|0;s=x?n:s>>>1;v=t}}}else{r=g;q=d}}while(0);c[k>>2]=l-u;j=j-r|0;k=j>>1;if((c[a+4>>2]|0)>>>0<k>>>0){za(53456,53472,58,53512)}else{c[f>>2]=g+(k<<1);Ol(g|0,r|0,j|0)|0;i=h;return q-d>>1|0}return 0}function Nj(){var a=0,b=0,d=0;a=i;b=zl(70464)|0;if((b|0)==0){d=0;i=a;return d|0}d=b;Cg(d);c[b>>2]=53224;Jd(b+328|0,24,b+380|0);Uj(b+1920|0);c[b+4>>2]=53400;c[b+228>>2]=53304;if((c[b+256>>2]|0)!=0){za(53792,53808,228,53848)}h[b+248>>3]=1.4;i=a;return d|0}function Oj(){var a=0,b=0,d=0;a=i;b=zl(584)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=53664;c[b+572>>2]=0;c[b+576>>2]=0;c[b+4>>2]=53400;b=d;i=a;return b|0}function Pj(a){a=a|0;var b=0;b=i;c[a>>2]=53664;Al(c[a+572>>2]|0);Eg(a);i=b;return}function Qj(a){a=a|0;var b=0;b=i;c[a>>2]=53664;Al(c[a+572>>2]|0);Eg(a);Al(a);i=b;return}function Rj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;f=kb[c[(c[b>>2]|0)+16>>2]&15](b)|0;if((f|0)<65920){h=c[10038]|0;i=d;return h|0}e=b;h=a+316|0;g=eb[c[(c[e>>2]|0)+12>>2]&63](b,h,256)|0;if((g|0)!=0){h=g;i=d;return h|0}h=(Jl(h,53600,27)|0)==0;g=h?0:c[10038]|0;if((g|0)!=0){h=g;i=d;return h|0}g=f+ -66048|0;do{if((g|0)>0){f=a+572|0;h=Bl(c[f>>2]|0,g)|0;if((h|0)==0){h=53768;i=d;return h|0}c[f>>2]=h;a=a+576|0;c[a>>2]=g;g=ob[c[(c[b>>2]|0)+20>>2]&63](b,65792)|0;if((g|0)!=0){h=g;i=d;return h|0}b=eb[c[(c[e>>2]|0)+12>>2]&63](b,c[f>>2]|0,c[a>>2]|0)|0;if((b|0)==0){break}i=d;return b|0}}while(0);h=0;i=d;return h|0}function Sj(a,b,d){a=a|0;b=b|0;d=d|0;d=i;Dj(a+316|0,c[a+572>>2]|0,c[a+576>>2]|0,b);i=d;return 0}function Tj(a){a=a|0;var b=0;b=i;a=a+12|0;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;c[a+20>>2]=0;i=b;return}function Uj(b){b=b|0;var d=0;d=i;a[b+8|0]=1;c[b>>2]=256;c[b+4>>2]=8;b=b+12|0;c[b+0>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[b+20>>2]=0;i=d;return}function Vj(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;if((f&1|0)!=0){za(53864,53888,32,53928)}g=c[d>>2]|0;if((a[d+8|0]|0)==0){if((g|0)==256){i=h;return}j=e+(f<<1)|0;if((f|0)<=0){i=h;return}while(1){f=_(b[e>>1]|0,g)|0;d=f>>8;if((d<<16>>16|0)!=(d|0)){d=f>>31^32767}f=e+2|0;b[e>>1]=d;if(f>>>0<j>>>0){e=f}else{break}}i=h;return}j=c[d+4>>2]|0;if((f|0)<=0){i=h;return}k=d+32|0;m=d+28|0;l=d+24|0;q=0;p=c[l>>2]|0;s=c[m>>2]|0;r=c[k>>2]|0;while(1){o=e+(q<<1)|0;t=b[o>>1]|0;n=t+p|0;p=t*3|0;t=r>>10;s=r-(r>>j)+(_(n-s|0,g)|0)|0;if((t<<16>>16|0)!=(t|0)){t=r>>31^32767}b[o>>1]=t;q=q+2|0;if((q|0)<(f|0)){r=s;s=n}else{break}}c[l>>2]=p;c[m>>2]=n;c[k>>2]=s;l=d+20|0;k=d+16|0;d=d+12|0;p=0;n=c[d>>2]|0;q=c[k>>2]|0;r=c[l>>2]|0;while(1){m=e+((p|1)<<1)|0;s=b[m>>1]|0;o=s+n|0;n=s*3|0;s=r>>10;q=r-(r>>j)+(_(o-q|0,g)|0)|0;if((s<<16>>16|0)!=(s|0)){s=r>>31^32767}b[m>>1]=s;p=p+2|0;if((p|0)<(f|0)){r=q;q=o}else{break}}c[d>>2]=n;c[k>>2]=o;c[l>>2]=q;i=h;return}function Wj(b){b=b|0;var d=0,e=0,f=0,g=0;f=i;i=i+80|0;d=f;Gc(b);e=b+336|0;md(e);g=b;c[g>>2]=54720;c[e>>2]=54816;c[b+1240>>2]=0;c[b+1244>>2]=-1;c[b+1248>>2]=0;c[b+1256>>2]=-1;c[b+1260>>2]=0;sc(b+1264|0);Vi(b+1312|0);Cc(b+2912|0,b+2952|0,8);c[g>>2]=53944;c[e>>2]=54040;a[b+3488|0]=0;c[b+3480>>2]=0;c[b+4>>2]=54096;c[b+332>>2]=54064;e=b;c[b+284>>2]=1;g=d+0|0;b=g+80|0;do{c[g>>2]=0;g=g+4|0}while((g|0)<(b|0));h[d>>3]=-14.0;h[d+8>>3]=80.0;Hg(e,d);i=f;return}function Xj(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=54720;d=a+336|0;c[d>>2]=54816;tc(a+1264|0);Mk(a+1240|0);od(d);Ic(a);Al(a);i=b;return}function Yj(a){a=a|0;var b=0;b=i;Xj(a+ -336|0);i=b;return}function Zj(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=54720;d=a+336|0;c[d>>2]=54816;tc(a+1264|0);Mk(a+1240|0);od(d);Ic(a);i=b;return}function _j(a){a=a|0;var b=0,d=0;b=i;d=a+ -336|0;c[d>>2]=54720;c[a>>2]=54816;tc(a+928|0);Mk(a+904|0);od(a);Ic(d);i=b;return}function $j(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0;f=i;e=(b|0)!=0;if(e){c[b>>2]=0}j=c[a+1204>>2]|0;h=(d[j+22|0]|0)<<16|(d[j+23|0]|0)<<24|(d[j+21|0]|0)<<8|(d[j+20|0]|0);if((h+ -44|0)<0){a=0;i=f;return a|0}g=j+(h+20)|0;a=(c[a+1212>>2]|0)-g|0;if((a|0)<12){a=0;i=f;return a|0}if((Jl(g,54560,4)|0)!=0){a=0;i=f;return a|0}if(((d[j+(h+26)|0]|0)<<16|(d[j+(h+27)|0]|0)<<24|(d[j+(h+25)|0]|0)<<8)>>>0>511){a=0;i=f;return a|0}h=(d[j+(h+30)|0]|0)<<16|(d[j+(h+31)|0]|0)<<24|(d[j+(h+29)|0]|0)<<8|(d[j+(h+28)|0]|0);j=(h|0)>(a+ -12|0)?0:h;h=(j|0)==0;if(h|e^1){a=h?0:g;i=f;return a|0}c[b>>2]=j+12;a=g;i=f;return a|0}function ak(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f;j=c[b+1204>>2]|0;m=(d[j+26|0]<<16|d[j+27|0]<<24|d[j+25|0]<<8|d[j+24|0])*10|0;k=(m>>>0)/441|0;a:do{if(m>>>0>440){h=d[j+34|0]<<16|d[j+35|0]<<24|d[j+33|0]<<8|d[j+32|0];do{if((h|0)>0){if((d[j+30|0]<<16|d[j+31|0]<<24|d[j+29|0]<<8|d[j+28|0]|0)==0){break}m=(h*10|0)/441|0;c[e+12>>2]=m;c[e+8>>2]=k-m;break a}}while(0);c[e+4>>2]=k;c[e+8>>2]=k;c[e+12>>2]=0}}while(0);b=$j(b,g)|0;if((b|0)==0){i=f;return 0}j=b+12|0;g=b+(c[g>>2]|0)|0;h=j;while(1){if((g-h|0)<=1){break}k=h+2|0;if((a[h+1|0]|a[h])<<24>>24==0){h=k;break}else{h=k}}k=(h-j|0)/2|0;j=k+ -1|0;do{if((j|0)>0){m=(j|0)<255?j:255;a[e+m+528|0]=0;if((m|0)<=0){b=h;break}j=(0-k|0)>-256?j:255;k=0;while(1){l=k<<1;if((a[b+((l|1)+12)|0]|0)==0){l=a[b+(l+12)|0]|0}else{l=63}a[e+k+528|0]=l;k=k+1|0;if((k|0)==(j|0)){b=h;break}}}else{b=h}}while(0);while(1){if((g-b|0)<=1){break}h=b+2|0;if((a[b+1|0]|a[b])<<24>>24==0){b=h;break}else{b=h}}h=b;while(1){if((g-h|0)<=1){break}j=h+2|0;if((a[h+1|0]|a[h])<<24>>24==0){h=j;break}else{h=j}}k=(h-b|0)/2|0;j=k+ -1|0;do{if((j|0)>0){m=(j|0)<255?j:255;a[e+m+272|0]=0;if((m|0)<=0){b=h;break}j=(0-k|0)>-256?j:255;k=0;while(1){l=k<<1;if((a[b+(l|1)|0]|0)==0){l=a[b+l|0]|0}else{l=63}a[e+k+272|0]=l;k=k+1|0;if((k|0)==(j|0)){b=h;break}}}else{b=h}}while(0);while(1){if((g-b|0)<=1){break}h=b+2|0;if((a[b+1|0]|a[b])<<24>>24==0){b=h;break}else{b=h}}h=b;while(1){if((g-h|0)<=1){break}j=h+2|0;if((a[h+1|0]|a[h])<<24>>24==0){h=j;break}else{h=j}}j=(h-b|0)/2|0;k=j+ -1|0;do{if((k|0)>0){m=(k|0)<255?k:255;a[e+m+16|0]=0;if((m|0)<=0){b=h;break}j=(0-j|0)>-256?k:255;k=0;while(1){l=k<<1;if((a[b+(l|1)|0]|0)==0){l=a[b+l|0]|0}else{l=63}a[e+k+16|0]=l;k=k+1|0;if((k|0)==(j|0)){b=h;break}}}else{b=h}}while(0);while(1){if((g-b|0)<=1){break}h=b+2|0;if((a[b+1|0]|a[b])<<24>>24==0){b=h;break}else{b=h}}j=b;while(1){if((g-j|0)<=1){break}h=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){j=h;break}else{j=h}}h=(j-b|0)/2|0;k=h+ -1|0;do{if((k|0)>0){m=(k|0)<255?k:255;a[e+m+784|0]=0;if((m|0)<=0){break}h=(0-h|0)>-256?k:255;k=0;do{l=k<<1;if((a[b+(l|1)|0]|0)==0){l=a[b+l|0]|0}else{l=63}a[e+k+784|0]=l;k=k+1|0;}while((k|0)!=(h|0))}}while(0);while(1){if((g-j|0)<=1){break}b=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){j=b;break}else{j=b}}b=j;while(1){if((g-b|0)<=1){break}h=b+2|0;if((a[b+1|0]|a[b])<<24>>24==0){b=h;break}else{b=h}}h=b;k=(h-j|0)/2|0;l=k+ -1|0;do{if((l|0)>0){m=(l|0)<255?l:255;a[e+m+1040|0]=0;if((m|0)<=0){j=b;break}k=(0-k|0)>-256?l:255;l=0;while(1){m=l<<1;if((a[j+(m|1)|0]|0)==0){m=a[j+m|0]|0}else{m=63}a[e+l+1040|0]=m;l=l+1|0;if((l|0)==(k|0)){j=b;break}}}else{j=b}}while(0);while(1){if((g-j|0)<=1){break}k=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){j=k;break}else{j=k}}k=(j-h|0)/2|0;h=k+ -1|0;do{if((h|0)>0){m=(h|0)<255?h:255;a[e+m+1552|0]=0;if((m|0)<=0){break}h=(0-k|0)>-256?h:255;k=0;do{l=k<<1;if((a[b+(l|1)|0]|0)==0){l=a[b+l|0]|0}else{l=63}a[e+k+1552|0]=l;k=k+1|0;}while((k|0)!=(h|0))}}while(0);while(1){if((g-j|0)<=1){break}b=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){j=b;break}else{j=b}}b=j;while(1){if((g-b|0)<=1){break}h=b+2|0;if((a[b+1|0]|a[b])<<24>>24==0){b=h;break}else{b=h}}g=(b-j|0)/2|0;b=g+ -1|0;if((b|0)<=0){i=f;return 0}m=(b|0)<255?b:255;a[e+m+1296|0]=0;if((m|0)<=0){i=f;return 0}b=(0-g|0)>-256?b:255;g=0;do{h=g<<1;if((a[j+(h|1)|0]|0)==0){h=a[j+h|0]|0}else{h=63}a[e+g+1296|0]=h;g=g+1|0;}while((g|0)!=(b|0));i=f;return 0}function bk(a,b){a=a|0;b=+b;var d=0,e=0,f=0;d=i;e=c[a+3480>>2]|0;if((e|0)==0){i=d;return}f=~~(b*44100.0+.5);c[a+3484>>2]=f;b=+(f|0);c[a+1200>>2]=~~+M(+(4096.0/b*+(e|0)+.5));c[a+1196>>2]=~~+M(+(+h[a+3472>>3]*4096.0/b+.5))+2;i=d;return}function ck(a,b){a=a|0;b=b|0;var c=0,d=0;c=i;d=vc(a+1264|0,b,33)|0;if((d|0)!=0){b=d;i=c;return b|0}b=Kc(a,b)|0;i=c;return b|0}function dk(a,b){a=a|0;b=b|0;var c=0;c=i;Zi(a+1312|0,b);Ec(a+2912|0,b);i=c;return}function ek(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=i;if((b|0)>=4){i=f;return}_i(a+1312|0,b,c,d,e);i=f;return}function fk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0;e=i;Lc(b,d);f=b+2912|0;g=b+1264|0;c[f>>2]=g;c[b+2916>>2]=0;if((a[b+3489|0]|0)==0){i=e;return}g=(d&128|0)==0?g:0;$i(b+1312|0,g,g,g);if(!((c[b+1244>>2]|0)==-1)){if((d&64|0)==0){j=+h[b+248>>3]*.001306640625}else{j=0.0}Fc(f,j);Qk(b+1240|0,d)}if((c[b+1256>>2]|0)==-1){i=e;return}i=e;return}function gk(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;if((f|0)<65){j=c[10038]|0;i=g;return j|0}j=(Jl(e,54400,4)|0)==0;h=j?0:c[10038]|0;if((h|0)!=0){j=h;i=g;return j|0}j=d[e+14|0]<<16|d[e+15|0]<<24|d[e+13|0]<<8|d[e+12|0];h=b+3480|0;k=(j|0)==0?3579545:j;c[h>>2]=k;j=b+1264|0;c[b+1292>>2]=k;c[j>>2]=xc(j,k)|0;c[b+1204>>2]=e;j=e+f|0;c[b+1212>>2]=j;f=b+1208|0;c[f>>2]=j;j=d[e+30|0]<<16|d[e+31|0]<<24|d[e+29|0]<<8|d[e+28|0];if((j|0)!=0){c[f>>2]=e+(j+28)}c[b+232>>2]=4;e=hk(b)|0;if((e|0)!=0){k=e;i=g;return k|0}c[b+228>>2]=(a[b+3489|0]|0)!=0?54152:54248;k=Nc(b,c[h>>2]|0)|0;i=g;return k|0}function hk(b){b=b|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0;e=i;i=i+16|0;m=e;f=e+8|0;g=c[b+1204>>2]|0;p=d[g+46|0]<<16|d[g+47|0]<<24|d[g+45|0]<<8|d[g+44|0];c[m>>2]=p;k=d[g+18|0]<<16|d[g+19|0]<<24|d[g+17|0]<<8|d[g+16|0];c[f>>2]=k;do{if((k|0)!=0){if(!((d[g+10|0]<<16|d[g+11|0]<<24|d[g+9|0]<<8|d[g+8|0])>>>0<272)){break}yk(b,f,m);p=c[m>>2]|0}}while(0);j=b+3489|0;a[j]=0;g=b+1288|0;n=+(c[g>>2]|0);o=n*1.5;k=b+3472|0;h[k>>3]=o;do{if((p|0)==0){l=9}else{a[j]=1;if((a[b+3488|0]|0)!=0){o=+(p|0)/144.0;h[k>>3]=o}+Nd(b+368|0,o/n,.99,+h[b+248>>3]*3.0*.5);m=Lk(b+1240|0,+h[k>>3],+(c[m>>2]|0))|0;if((m|0)==0){c[b+1244>>2]=0;c[b+232>>2]=8;if((a[j]|0)==0){l=9;break}else{break}}else{p=m;i=e;return p|0}}}while(0);a:do{if((l|0)==9){l=c[f>>2]|0;do{if((l|0)!=0){a[j]=1;if((a[b+3488|0]|0)==0){n=+h[k>>3]}else{n=+(l|0)/72.0;h[k>>3]=n}+Nd(b+368|0,n/+(c[g>>2]|0),.99,+h[b+248>>3]*3.0*.5);f=Bk(b+1252|0,+h[k>>3],+(c[f>>2]|0))|0;if((f|0)==2){p=54320;i=e;return p|0}else if((f|0)==0){c[b+1256>>2]=0;c[b+232>>2]=8;if((a[j]|0)==0){break}else{break a}}else{p=54352;i=e;return p|0}}}while(0);c[b+1244>>2]=-1;c[b+1256>>2]=-1;Wi(b+1312|0,+h[b+248>>3]);p=0;i=e;return p|0}}while(0);f=pd(b+336|0,(_(c[g>>2]|0,c[b+1300>>2]|0)|0)/1e3|0)|0;if((f|0)!=0){p=f;i=e;return p|0}Wi(b+1312|0,+h[b+248>>3]*.405);p=0;i=e;return p|0}function ik(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;f=i;e=Oc(b,e)|0;if((e|0)!=0){h=e;i=f;return h|0}e=b+1204|0;h=c[e>>2]|0;Xi(b+1312|0,d[h+41|0]<<8|d[h+40|0],d[h+42|0]|0);c[b+1236>>2]=-1;e=c[e>>2]|0;h=e+64|0;g=b+1220|0;c[g>>2]=h;c[b+1224>>2]=h;c[b+1228>>2]=h;c[b+1232>>2]=-1;c[b+1216>>2]=0;do{if((d[e+10|0]<<16|d[e+11|0]<<24|d[e+9|0]<<8|d[e+8|0])>>>0>335){h=d[e+54|0]<<16|d[e+55|0]<<24|d[e+53|0]<<8|d[e+52|0];if((h|0)==0){break}c[g>>2]=e+(h+52)}}while(0);if((a[b+3489|0]|0)==0){h=0;i=f;return h|0}if(!((c[b+1244>>2]|0)==-1)){Nk(b+1240|0)}c[b+1192>>2]=0;uc(b+1264|0,1);c[b+356>>2]=c[b+348>>2];Ld(b+368|0);h=0;i=f;return h|0}function jk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;d=vk(a,(_(c[a+3484>>2]|0,d)|0)/1e3|0)|0;c[b>>2]=d;bj(a+1312|0,d);i=e;return 0}function kk(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;e=i;if((a[b+3489|0]|0)==0){d=Pc(b,c,d)|0;i=e;return d|0}else{td(b+336|0,c,d,b+1264|0);d=0;i=e;return d|0}return 0}function lk(){var a=0,b=0;a=i;b=zl(3496)|0;if((b|0)==0){b=0}else{Wj(b)}i=a;return b|0}function mk(){var a=0,b=0,d=0;a=i;b=zl(392)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=54448;c[b+380>>2]=0;c[b+384>>2]=0;c[b+4>>2]=54096;b=d;i=a;return b|0}function nk(a){a=a|0;var b=0;b=i;c[a>>2]=54448;Al(c[a+380>>2]|0);Eg(a);i=b;return}function ok(a){a=a|0;var b=0;b=i;c[a>>2]=54448;Al(c[a+380>>2]|0);Eg(a);Al(a);i=b;return}function pk(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;g=e;h=kb[c[(c[b>>2]|0)+16>>2]&15](b)|0;if((h|0)<65){k=c[10038]|0;i=e;return k|0}f=b;j=a+316|0;k=eb[c[(c[f>>2]|0)+12>>2]&63](b,j,64)|0;if((k|0)!=0){i=e;return k|0}k=(Jl(j,54400,4)|0)==0;j=k?0:c[10038]|0;if((j|0)!=0){k=j;i=e;return k|0}k=(d[a+338|0]|0)<<16|(d[a+339|0]|0)<<24|(d[a+337|0]|0)<<8|(d[a+336|0]|0);j=k+ -44|0;h=h+ -64+(44-k)|0;do{if((j|0)>0&(h|0)>11){j=ob[c[(c[b>>2]|0)+20>>2]&63](b,j)|0;if((j|0)!=0){k=j;i=e;return k|0}j=g;k=eb[c[(c[f>>2]|0)+12>>2]&63](b,j,12)|0;if((k|0)!=0){i=e;return k|0}if((h|0)<12){break}if((Jl(j,54560,4)|0)!=0){break}if(((d[g+6|0]|0)<<16|(d[g+7|0]|0)<<24|(d[g+5|0]|0)<<8)>>>0>511){break}g=(d[g+10|0]|0)<<16|(d[g+11|0]|0)<<24|(d[g+9|0]|0)<<8|(d[g+8|0]|0);g=(g|0)>(h+ -12|0)?0:g;if((g|0)==0){break}j=a+380|0;h=Bl(c[j>>2]|0,g)|0;if((h|0)==0){k=54352;i=e;return k|0}c[j>>2]=h;c[a+384>>2]=g;b=eb[c[(c[f>>2]|0)+12>>2]&63](b,h,g)|0;if((b|0)==0){break}i=e;return b|0}}while(0);k=0;i=e;return k|0}function qk(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;f=i;m=(d[b+342|0]<<16|d[b+343|0]<<24|d[b+341|0]<<8|d[b+340|0])*10|0;h=(m>>>0)/441|0;a:do{if(m>>>0>440){g=d[b+350|0]<<16|d[b+351|0]<<24|d[b+349|0]<<8|d[b+348|0];do{if((g|0)>0){if((d[b+346|0]<<16|d[b+347|0]<<24|d[b+345|0]<<8|d[b+344|0]|0)==0){break}m=(g*10|0)/441|0;c[e+12>>2]=m;c[e+8>>2]=h-m;break a}}while(0);c[e+4>>2]=h;c[e+8>>2]=h;c[e+12>>2]=0}}while(0);h=c[b+384>>2]|0;if((h|0)==0){i=f;return 0}g=c[b+380>>2]|0;b=g+h|0;h=g;while(1){if((b-h|0)<=1){break}j=h+2|0;if((a[h+1|0]|a[h])<<24>>24==0){h=j;break}else{h=j}}j=(h-g|0)/2|0;k=j+ -1|0;do{if((k|0)>0){m=(k|0)<255?k:255;a[e+m+528|0]=0;if((m|0)<=0){g=h;break}j=(0-j|0)>-256?k:255;k=0;while(1){l=k<<1;if((a[g+(l|1)|0]|0)==0){l=a[g+l|0]|0}else{l=63}a[e+k+528|0]=l;k=k+1|0;if((k|0)==(j|0)){g=h;break}}}else{g=h}}while(0);while(1){if((b-g|0)<=1){break}h=g+2|0;if((a[g+1|0]|a[g])<<24>>24==0){g=h;break}else{g=h}}h=g;while(1){if((b-h|0)<=1){break}j=h+2|0;if((a[h+1|0]|a[h])<<24>>24==0){h=j;break}else{h=j}}k=(h-g|0)/2|0;j=k+ -1|0;do{if((j|0)>0){m=(j|0)<255?j:255;a[e+m+272|0]=0;if((m|0)<=0){break}j=(0-k|0)>-256?j:255;k=0;do{l=k<<1;if((a[g+(l|1)|0]|0)==0){l=a[g+l|0]|0}else{l=63}a[e+k+272|0]=l;k=k+1|0;}while((k|0)!=(j|0))}}while(0);while(1){if((b-h|0)<=1){break}g=h+2|0;if((a[h+1|0]|a[h])<<24>>24==0){h=g;break}else{h=g}}g=h;while(1){if((b-g|0)<=1){break}j=g+2|0;if((a[g+1|0]|a[g])<<24>>24==0){g=j;break}else{g=j}}k=(g-h|0)/2|0;j=k+ -1|0;do{if((j|0)>0){m=(j|0)<255?j:255;a[e+m+16|0]=0;if((m|0)<=0){break}j=(0-k|0)>-256?j:255;k=0;do{l=k<<1;if((a[h+(l|1)|0]|0)==0){l=a[h+l|0]|0}else{l=63}a[e+k+16|0]=l;k=k+1|0;}while((k|0)!=(j|0))}}while(0);while(1){if((b-g|0)<=1){break}h=g+2|0;if((a[g+1|0]|a[g])<<24>>24==0){g=h;break}else{g=h}}j=g;while(1){if((b-j|0)<=1){break}h=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){j=h;break}else{j=h}}k=(j-g|0)/2|0;h=k+ -1|0;do{if((h|0)>0){m=(h|0)<255?h:255;a[e+m+784|0]=0;if((m|0)<=0){break}h=(0-k|0)>-256?h:255;k=0;do{l=k<<1;if((a[g+(l|1)|0]|0)==0){l=a[g+l|0]|0}else{l=63}a[e+k+784|0]=l;k=k+1|0;}while((k|0)!=(h|0))}}while(0);while(1){if((b-j|0)<=1){break}g=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){j=g;break}else{j=g}}g=j;while(1){if((b-g|0)<=1){break}h=g+2|0;if((a[g+1|0]|a[g])<<24>>24==0){g=h;break}else{g=h}}h=g;k=(h-j|0)/2|0;l=k+ -1|0;do{if((l|0)>0){m=(l|0)<255?l:255;a[e+m+1040|0]=0;if((m|0)<=0){j=g;break}k=(0-k|0)>-256?l:255;l=0;while(1){m=l<<1;if((a[j+(m|1)|0]|0)==0){m=a[j+m|0]|0}else{m=63}a[e+l+1040|0]=m;l=l+1|0;if((l|0)==(k|0)){j=g;break}}}else{j=g}}while(0);while(1){if((b-j|0)<=1){break}k=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){j=k;break}else{j=k}}k=(j-h|0)/2|0;h=k+ -1|0;do{if((h|0)>0){m=(h|0)<255?h:255;a[e+m+1552|0]=0;if((m|0)<=0){g=j;break}h=(0-k|0)>-256?h:255;k=0;while(1){l=k<<1;if((a[g+(l|1)|0]|0)==0){l=a[g+l|0]|0}else{l=63}a[e+k+1552|0]=l;k=k+1|0;if((k|0)==(h|0)){g=j;break}}}else{g=j}}while(0);while(1){if((b-g|0)<=1){break}h=g+2|0;if((a[g+1|0]|a[g])<<24>>24==0){g=h;break}else{g=h}}j=g;while(1){if((b-j|0)<=1){h=j;break}h=j+2|0;if((a[j+1|0]|a[j])<<24>>24==0){break}else{j=h}}h=(h-g|0)/2|0;b=h+ -1|0;if((b|0)<=0){i=f;return 0}m=(b|0)<255?b:255;a[e+m+1296|0]=0;if((m|0)<=0){i=f;return 0}b=(0-h|0)>-256?b:255;h=0;do{j=h<<1;if((a[g+(j|1)|0]|0)==0){j=a[g+j|0]|0}else{j=63}a[e+h+1296|0]=j;h=h+1|0;}while((h|0)!=(b|0));i=f;return 0}function rk(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=54720;d=a+336|0;c[d>>2]=54816;tc(a+1264|0);Mk(a+1240|0);od(d);Ic(a);i=b;return}function sk(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=54720;d=a+336|0;c[d>>2]=54816;tc(a+1264|0);Mk(a+1240|0);od(d);Ic(a);Al(a);i=b;return}function tk(a){a=a|0;var b=0,d=0;b=i;d=a+ -336|0;c[d>>2]=54720;c[a>>2]=54816;tc(a+928|0);Mk(a+904|0);od(a);Ic(d);i=b;return}function uk(a){a=a|0;var b=0,d=0;b=i;d=a+ -336|0;c[d>>2]=54720;c[a>>2]=54816;tc(a+928|0);Mk(a+904|0);od(a);Ic(d);Al(d);i=b;return}function vk(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;h=i;g=b+1216|0;D=c[g>>2]|0;f=b+1220|0;E=c[f>>2]|0;n=b+1212|0;F=c[n>>2]|0;do{if(!(E>>>0<F>>>0)){a[b+272|0]=1;if(!(E>>>0>F>>>0)){break}c[b+16>>2]=54568}}while(0);if((D|0)>=(e|0)){J=b+1200|0;H=E;I=D;I=I-e|0;c[f>>2]=H;c[g>>2]=I;J=c[J>>2]|0;J=_(J,e)|0;J=J>>12;i=h;return J|0}m=b+16|0;w=b+1228|0;o=b+1200|0;k=b+1232|0;C=b+2912|0;q=b+1264|0;B=q;v=b+1268|0;p=b+1236|0;x=b+1208|0;l=b+1312|0;t=b+1196|0;u=b+1192|0;r=b+1256|0;s=b+1260|0;y=b+1244|0;z=b+1248|0;A=b+1240|0;b=b+1224|0;while(1){if(!(E>>>0<F>>>0)){j=56;break}F=E+1|0;G=d[E]|0;a:do{switch(G|0){case 100:{H=E+2|0;D=(d[F]|0)+D|0;break};case 99:{H=F;D=D+882|0;break};case 81:{G=(_(c[t>>2]|0,D)|0)+(c[u>>2]|0)>>12;F=c[r>>2]|0;H=G-F|0;do{if((H|0)>0){if((F|0)<0){break}c[r>>2]=G;c[s>>2]=(c[s>>2]|0)+(H<<1<<1);j=19}else{j=19}}while(0);if((j|0)==19){j=0}H=E+3|0;break};case 103:{F=d[E+5|0]<<16|d[E+6|0]<<24|d[E+4|0]<<8|d[E+3|0];if((a[E+2|0]|0)==0){c[b>>2]=E+7}H=E+(F+7)|0;break};case 224:{c[w>>2]=(c[b>>2]|0)+(d[E+3|0]<<16|d[E+4|0]<<24|d[E+2|0]<<8|d[F]);H=E+5|0;break};case 102:{H=c[x>>2]|0;break};case 83:{I=(_(c[t>>2]|0,D)|0)+(c[u>>2]|0)>>12;H=c[y>>2]|0;G=I-H|0;do{if((G|0)>0){if((H|0)<0){break}c[y>>2]=I;j=c[z>>2]|0;c[z>>2]=j+(G<<1<<1);Tk(A,G,j);j=35}else{j=35}}while(0);if((j|0)==35){j=0;Pk(A,d[F]|0,d[E+2|0]|0)}H=E+3|0;break};case 82:{H=a[F]|0;do{if(H<<24>>24==42){G=d[E+2|0]|0;H=c[o>>2]|0;F=c[k>>2]|0;c[k>>2]=G;if((F|0)>-1){J=(_(H,D)|0)>>12;J=_(c[B>>2]|0,J)|0;Zd(C,J+(c[v>>2]|0)|0,G-F|0,q);break}else{c[k>>2]=c[p>>2]|G;break}}else{I=_(c[t>>2]|0,D)|0;I=I+(c[u>>2]|0)>>12;G=c[y>>2]|0;J=I-G|0;if((J|0)>0){if((G|0)<0){break}c[y>>2]=I;H=c[z>>2]|0;c[z>>2]=H+(J<<1<<1);Tk(A,J,H);H=a[F]|0}G=E+2|0;if(H<<24>>24==43){H=((d[G]|0)>>>7)+ -1|0;c[p>>2]=H;c[k>>2]=H|c[k>>2];H=a[F]|0}Ok(A,H&255,d[G]|0)}}while(0);H=E+3|0;break};case 98:{H=F;D=D+735|0;break};case 97:{H=E+3|0;D=(d[E+2|0]<<8|d[F])+D|0;break};case 79:{cj(l,(_(c[o>>2]|0,D)|0)>>12,d[F]|0);H=E+2|0;break};case 80:{dj(l,(_(c[o>>2]|0,D)|0)>>12,d[F]|0);H=E+2|0;break};default:{H=G&240;if((H|0)==80){H=E+3|0;break a}else if((H|0)==128){I=c[w>>2]|0;c[w>>2]=I+1;I=d[I]|0;H=c[o>>2]|0;E=c[k>>2]|0;c[k>>2]=I;if((E|0)>-1){J=(_(H,D)|0)>>12;J=_(c[B>>2]|0,J)|0;Zd(C,J+(c[v>>2]|0)|0,I-E|0,q)}else{c[k>>2]=c[p>>2]|I}H=F;D=(G&15)+D|0;break a}else if((H|0)==112){H=F;D=D+1+(G&15)|0;break a}else{switch(G>>>4|0){case 11:case 10:case 5:{F=3;break};case 13:case 12:{F=4;break};case 4:case 3:{F=2;break};case 15:case 14:{F=5;break};default:{F=1}}c[m>>2]=54592;H=E+F|0;break a}}}}while(0);if((D|0)>=(e|0)){E=H;j=56;break}F=c[n>>2]|0;E=H}if((j|0)==56){J=D-e|0;c[f>>2]=E;c[g>>2]=J;J=c[o>>2]|0;J=_(J,e)|0;J=J>>12;i=h;return J|0}return 0}function wk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;k=d>>1;d=a+1196|0;l=c[d>>2]|0;j=((k<<12|0)/(l|0)|0)+ -1|0;n=_(j,l)|0;h=a+1192|0;m=c[h>>2]|0;if((n+m>>12|0)>(k|0)){za(54616,54656,243,54696)}else{f=j}while(1){j=(_(l,f)|0)+m>>12;if((j|0)<(k|0)){f=f+1|0}else{break}}k=a+1244|0;do{if((c[k>>2]|0)==-1){l=a+1256|0;if((c[l>>2]|0)==-1){break}c[a+1260>>2]=e;c[l>>2]=0}else{c[a+1248>>2]=e;c[k>>2]=0;Pl(e|0,0,j<<2|0)|0}}while(0);vk(a,f)|0;n=c[k>>2]|0;e=j-n|0;if(!((e|0)<1|(n|0)<0)){c[k>>2]=j;m=a+1248|0;n=c[m>>2]|0;c[m>>2]=n+(e<<1<<1);Tk(a+1240|0,e,n)}k=a+1256|0;n=c[k>>2]|0;e=j-n|0;if((e|0)<1|(n|0)<0){n=c[d>>2]|0;n=_(n,f)|0;l=c[h>>2]|0;m=j<<12;m=l-m|0;n=m+n|0;c[h>>2]=n;n=a+1312|0;bj(n,b);n=j<<1;i=g;return n|0}c[k>>2]=j;n=a+1260|0;c[n>>2]=(c[n>>2]|0)+(e<<1<<1);n=c[d>>2]|0;n=_(n,f)|0;l=c[h>>2]|0;m=j<<12;m=l-m|0;n=m+n|0;c[h>>2]=n;n=a+1312|0;bj(n,b);n=j<<1;i=g;return n|0}function xk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=i;a=wk(a+ -336|0,b,c,d)|0;i=e;return a|0}function yk(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0;f=i;g=(c[a+1204>>2]|0)+64|0;a=c[a+1212>>2]|0;if(!(g>>>0<a>>>0)){i=f;return}a:while(1){h=d[g]|0;switch(h|0){case 83:case 82:{a=7;break a};case 100:case 80:{g=g+2|0;break};case 84:{a=8;break a};case 102:{a=16;break a};case 103:{g=g+(((d[g+5|0]|0)<<16|(d[g+6|0]|0)<<24|(d[g+4|0]|0)<<8|(d[g+3|0]|0))+7)|0;break};case 97:{g=g+3|0;break};case 81:{a=6;break a};default:{switch(h>>>4|0){case 15:case 14:{h=5;break};case 13:case 12:{h=4;break};case 11:case 10:case 5:{h=3;break};case 4:case 3:{h=2;break};default:{h=1}}g=g+h|0}}if(!(g>>>0<a>>>0)){a=16;break}}if((a|0)==6){c[e>>2]=0;i=f;return}else if((a|0)==7){c[e>>2]=c[b>>2];c[b>>2]=0;i=f;return}else if((a|0)==8){c[b>>2]=0;c[e>>2]=0;i=f;return}else if((a|0)==16){i=f;return}}function zk(a){a=a|0;i=i;return}function Ak(a){a=a|0;i=i;return}function Bk(a,b,c){a=a|0;b=+b;c=+c;i=i;return 2}function Ck(a){a=a|0;i=i;return}function Dk(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return}function Ek(a,b){a=a|0;b=b|0;i=i;return}function Fk(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return}function Gk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=b&3;if((f|0)==3){b=1;i=e;return b|0}f=((b&256|0)!=0?3:0)+f|0;g=b>>>2&3;switch(b&240|0){case 48:{b=d&15;c[a+(f*556|0)+(g*116|0)+132>>2]=(b|0)==0?1:b<<1;c[a+(f*556|0)+(g*116|0)+128>>2]=a+((d>>>4&7)<<7)+14524;c[a+(f*556|0)+188>>2]=-1;b=0;i=e;return b|0};case 112:{d=d&31;if((d|0)==0){d=a+15612|0;c[a+(f*556|0)+(g*116|0)+176>>2]=d}else{d=a+(d<<1<<2)+14140|0;c[a+(f*556|0)+(g*116|0)+176>>2]=d}d=c[d+(c[a+(f*556|0)+(g*116|0)+152>>2]<<2)>>2]|0;c[a+(f*556|0)+(g*116|0)+216>>2]=d;if((c[a+(f*556|0)+(g*116|0)+192>>2]|0)!=2){b=0;i=e;return b|0}if((c[a+(f*556|0)+(g*116|0)+196>>2]|0)>=536870912){b=0;i=e;return b|0}c[a+(f*556|0)+(g*116|0)+200>>2]=d;b=0;i=e;return b|0};case 96:{b=d&128;c[a+(f*556|0)+(g*116|0)+240>>2]=b;if((b|0)==0){c[a+(f*556|0)+(g*116|0)+236>>2]=31}else{c[a+(f*556|0)+(g*116|0)+236>>2]=c[a+(f*556|0)+76>>2]}d=d&31;if((d|0)==0){d=a+15612|0;c[a+(f*556|0)+(g*116|0)+172>>2]=d}else{d=a+(d<<1<<2)+14140|0;c[a+(f*556|0)+(g*116|0)+172>>2]=d}d=c[d+(c[a+(f*556|0)+(g*116|0)+152>>2]<<2)>>2]|0;c[a+(f*556|0)+(g*116|0)+212>>2]=d;if((c[a+(f*556|0)+(g*116|0)+192>>2]|0)!=1){b=0;i=e;return b|0}c[a+(f*556|0)+(g*116|0)+200>>2]=d;b=0;i=e;return b|0};case 128:{c[a+(f*556|0)+(g*116|0)+144>>2]=c[a+(d>>4<<2)+15548>>2];d=d<<2&60|2;c[a+(f*556|0)+(g*116|0)+180>>2]=a+(d<<2)+14140;d=c[a+((c[a+(f*556|0)+(g*116|0)+152>>2]|0)+d<<2)+14140>>2]|0;c[a+(f*556|0)+(g*116|0)+220>>2]=d;if((c[a+(f*556|0)+(g*116|0)+192>>2]|0)!=3){b=0;i=e;return b|0}if((c[a+(f*556|0)+(g*116|0)+196>>2]|0)>=536870912){b=0;i=e;return b|0}c[a+(f*556|0)+(g*116|0)+200>>2]=d;b=0;i=e;return b|0};case 144:{h=(d&8|0)==0?0:d&15;d=a+(f*556|0)+(g*116|0)+160|0;c[d>>2]=0;b=a+(f*556|0)+(g*116|0)+164|0;c[b>>2]=2147483647;c[a+(f*556|0)+(g*116|0)+156>>2]=h;if((h&4|0)==0){h=0;i=e;return h|0}c[d>>2]=4095;c[b>>2]=4095;h=0;i=e;return h|0};case 64:{h=d&127;c[a+(f*556|0)+(g*116|0)+136>>2]=h;c[a+(f*556|0)+(g*116|0)+140>>2]=h<<5;h=0;i=e;return h|0};case 80:{c[a+(f*556|0)+(g*116|0)+148>>2]=3-(d>>6);c[a+(f*556|0)+188>>2]=-1;d=d&31;if((d|0)==0){d=a+15612|0;c[a+(f*556|0)+(g*116|0)+168>>2]=d}else{d=a+(d<<1<<2)+13628|0;c[a+(f*556|0)+(g*116|0)+168>>2]=d}d=c[d+(c[a+(f*556|0)+(g*116|0)+152>>2]<<2)>>2]|0;c[a+(f*556|0)+(g*116|0)+208>>2]=d;if((c[a+(f*556|0)+(g*116|0)+192>>2]|0)!=0){h=0;i=e;return h|0}c[a+(f*556|0)+(g*116|0)+200>>2]=d;h=0;i=e;return h|0};default:{h=0;i=e;return h|0}}return 0}function Hk(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0;f=i;h=b&3;if((h|0)==3){h=1;i=f;return h|0}g=((b&256|0)!=0?3:0)+h|0;switch(b&252|0){case 168:{if((b|0)>=256){h=0;i=f;return h|0}h=h+1|0;g=a+(h<<2)+1192|0;b=(c[g>>2]&1792)+e|0;c[g>>2]=b;c[a+(h<<2)+1224>>2]=d[54880+(b>>7)|0]|0|c[a+(h<<2)+1208>>2]<<2;c[a+1300>>2]=-1;h=0;i=f;return h|0};case 176:{b=a+(g*556|0)+64|0;h=e&7;if((c[b>>2]|0)!=(h|0)){c[b>>2]=h;c[a+(g*556|0)+232>>2]=0;c[a+(g*556|0)+348>>2]=0;c[a+(g*556|0)+464>>2]=0;c[a+(g*556|0)+580>>2]=0}c[a+(g*556|0)+68>>2]=9-(e>>>3&7);h=0;i=f;return h|0};case 164:{h=a+(g*556|0)+80|0;b=c[h>>2]&255|e<<8&1792;c[h>>2]=b;h=e>>>3&7;c[a+(g*556|0)+96>>2]=h;c[a+(g*556|0)+112>>2]=d[54880+(b>>>7)|0]|0|h<<2;c[a+(g*556|0)+188>>2]=-1;h=0;i=f;return h|0};case 180:{c[a+(g*556|0)+56>>2]=0-(e>>>7&1);c[a+(g*556|0)+60>>2]=0-(e>>>6&1);b=d[54896+(e>>>4&3)|0]|0;c[a+(g*556|0)+76>>2]=b;c[a+(g*556|0)+72>>2]=d[54904+(e&7)|0]|0;c[a+(g*556|0)+236>>2]=(c[a+(g*556|0)+240>>2]|0)==0?31:b;c[a+(g*556|0)+352>>2]=(c[a+(g*556|0)+356>>2]|0)==0?31:b;c[a+(g*556|0)+468>>2]=(c[a+(g*556|0)+472>>2]|0)==0?31:b;c[a+(g*556|0)+584>>2]=(c[a+(g*556|0)+588>>2]|0)==0?31:b;h=0;i=f;return h|0};case 160:{b=a+(g*556|0)+80|0;h=(c[b>>2]&1792)+e|0;c[b>>2]=h;c[a+(g*556|0)+112>>2]=d[54880+(h>>7)|0]|0|c[a+(g*556|0)+96>>2]<<2;c[a+(g*556|0)+188>>2]=-1;h=0;i=f;return h|0};case 172:{if((b|0)>=256){h=0;i=f;return h|0}h=h+1|0;b=a+(h<<2)+1192|0;g=c[b>>2]&255|e<<8&1792;c[b>>2]=g;b=e>>>3&7;c[a+(h<<2)+1208>>2]=b;c[a+(h<<2)+1224>>2]=d[54880+(g>>>7)|0]|0|b<<2;c[a+1300>>2]=-1;h=0;i=f;return h|0};default:{h=0;i=f;return h|0}}return 0}function Ik(a,d,f){a=a|0;d=d|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;switch(d|0){case 36:{k=a+8|0;d=c[k>>2]&3|f<<2;c[k>>2]=d;f=a+12|0;d=1024-d<<12;if((c[f>>2]|0)==(d|0)){k=0;i=g;return k|0}c[f>>2]=d;c[a+16>>2]=d;k=0;i=g;return k|0};case 37:{k=a+8|0;d=c[k>>2]&1020|f&3;c[k>>2]=d;f=a+12|0;d=1024-d<<12;if((c[f>>2]|0)==(d|0)){k=0;i=g;return k|0}c[f>>2]=d;c[a+16>>2]=d;k=0;i=g;return k|0};case 34:{if((f&8|0)==0){c[a+13620>>2]=0;c[a+13624>>2]=0;k=0;i=g;return k|0}else{c[a+13624>>2]=c[a+((f&7)<<2)+15740>>2];k=0;i=g;return k|0}};case 38:{c[a+20>>2]=f;d=a+24|0;f=256-f<<16;if((c[d>>2]|0)==(f|0)){k=0;i=g;return k|0}c[d>>2]=f;c[a+28>>2]=f;k=0;i=g;return k|0};case 43:{c[a+36>>2]=f&128;k=0;i=g;return k|0};case 40:{d=f&3;if((d|0)==3){k=1;i=g;return k|0}d=(f&4|0)==0?d:d+3|0;h=a+(d*556|0)+192|0;j=(c[h>>2]|0)==3;do{if((f&16|0)==0){if(j){break}j=a+(d*556|0)+196|0;k=c[j>>2]|0;if((k|0)<268435456){c[j>>2]=(e[a+(k>>16<<1)+15772>>1]<<16)+268435456}c[a+(d*556|0)+200>>2]=c[a+(d*556|0)+220>>2];c[a+(d*556|0)+204>>2]=536870912;c[h>>2]=3}else{if(!j){break}c[a+(d*556|0)+184>>2]=0;j=a+(d*556|0)+196|0;k=a+(d*556|0)+232|0;c[j>>2]=c[k>>2]&c[a+(b[a+(c[j>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[k>>2]=-1;c[a+(d*556|0)+200>>2]=c[a+(d*556|0)+208>>2];c[a+(d*556|0)+204>>2]=268435456;c[h>>2]=0}}while(0);h=a+(d*556|0)+424|0;j=(c[h>>2]|0)==3;do{if((f&32|0)==0){if(j){break}j=a+(d*556|0)+428|0;k=c[j>>2]|0;if((k|0)<268435456){c[j>>2]=(e[a+(k>>16<<1)+15772>>1]<<16)+268435456}c[a+(d*556|0)+432>>2]=c[a+(d*556|0)+452>>2];c[a+(d*556|0)+436>>2]=536870912;c[h>>2]=3}else{if(!j){break}c[a+(d*556|0)+416>>2]=0;j=a+(d*556|0)+428|0;k=a+(d*556|0)+464|0;c[j>>2]=c[k>>2]&c[a+(b[a+(c[j>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[k>>2]=-1;c[a+(d*556|0)+432>>2]=c[a+(d*556|0)+440>>2];c[a+(d*556|0)+436>>2]=268435456;c[h>>2]=0}}while(0);h=a+(d*556|0)+308|0;j=(c[h>>2]|0)==3;do{if((f&64|0)==0){if(j){break}j=a+(d*556|0)+312|0;k=c[j>>2]|0;if((k|0)<268435456){c[j>>2]=(e[a+(k>>16<<1)+15772>>1]<<16)+268435456}c[a+(d*556|0)+316>>2]=c[a+(d*556|0)+336>>2];c[a+(d*556|0)+320>>2]=536870912;c[h>>2]=3}else{if(!j){break}c[a+(d*556|0)+300>>2]=0;j=a+(d*556|0)+312|0;k=a+(d*556|0)+348|0;c[j>>2]=c[k>>2]&c[a+(b[a+(c[j>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[k>>2]=-1;c[a+(d*556|0)+316>>2]=c[a+(d*556|0)+324>>2];c[a+(d*556|0)+320>>2]=268435456;c[h>>2]=0}}while(0);h=a+(d*556|0)+540|0;j=(c[h>>2]|0)==3;if((f&128|0)!=0){if(!j){k=0;i=g;return k|0}c[a+(d*556|0)+532>>2]=0;j=a+(d*556|0)+544|0;k=a+(d*556|0)+580|0;c[j>>2]=c[k>>2]&c[a+(b[a+(c[j>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[k>>2]=-1;c[a+(d*556|0)+548>>2]=c[a+(d*556|0)+556>>2];c[a+(d*556|0)+552>>2]=268435456;c[h>>2]=0;k=0;i=g;return k|0}if(j){k=0;i=g;return k|0}j=a+(d*556|0)+544|0;f=c[j>>2]|0;if((f|0)<268435456){c[j>>2]=(e[a+(f>>16<<1)+15772>>1]<<16)+268435456}c[a+(d*556|0)+548>>2]=c[a+(d*556|0)+568>>2];c[a+(d*556|0)+552>>2]=536870912;c[h>>2]=3;k=0;i=g;return k|0};case 39:{d=a+32|0;if(((c[d>>2]^f)&64|0)!=0){c[a+1300>>2]=-1}k=a+4|0;c[k>>2]=(f^-16)>>4&f>>2&c[k>>2];c[d>>2]=f;k=0;i=g;return k|0};default:{k=0;i=g;return k|0}}return 0}function Jk(a,e,f){a=a|0;e=+e;f=+f;var g=0,h=0,j=0,k=0,l=0.0;g=i;if(!(e!=0.0)){za(54912,54928,633,54968)}if(!(f>e)){za(54984,54928,634,54968)}f=f/e/144.0;k=+N(+(f+-1.0))<1.0e-7;f=k?1.0:f;c[a>>2]=~~(f*4096.0);h=0;do{if((h|0)>3327){c[a+(h<<2)+36268>>2]=0;c[a+(h+12288<<2)+36268>>2]=0}else{k=~~(268435455.0/+P(10.0,+(+(h|0)*.0234375/20.0)));c[a+(h<<2)+36268>>2]=k;c[a+(h+12288<<2)+36268>>2]=0-k}h=h+1|0;}while((h|0)!=12288);b[a+9524>>1]=3328;b[a+5428>>1]=3328;j=1;while(1){h=~~(+$a(+(1.0/+R(+(+(j|0)*6.283185307179586*.000244140625))))*20.0/.0234375);k=(h|0)>3328?3328:h;h=k&65535;b[a+(2048-j<<1)+5428>>1]=h;b[a+(j<<1)+5428>>1]=h;k=k+12288&65535;b[a+(4096-j<<1)+5428>>1]=k;b[a+(j+2048<<1)+5428>>1]=k;j=j+1|0;if((j|0)==1025){h=0;break}else{}}while(1){l=+R(+(+(h|0)*6.283185307179586*.0009765625));b[a+(h<<1)+32172>>1]=~~((l+1.0)*.5*503.4666666666667);b[a+(h<<1)+34220>>1]=~~(l*511.0);h=h+1|0;if((h|0)==1024){h=0;break}else{}}do{b[a+(h<<1)+15772>>1]=~~(+P(+(+(4095-h|0)*.000244140625),8.0)*4096.0);b[a+(h+4096<<1)+15772>>1]=~~(+(h|0)*.000244140625*4096.0);h=h+1|0;}while((h|0)!=4096);h=a+32156|0;j=h;b[j+0>>1]=0;b[j+2>>1]=0;b[j+4>>1]=0;b[j+6>>1]=0;b[j+8>>1]=0;b[j+10>>1]=0;b[j+12>>1]=0;b[j+14>>1]=0;b[h>>1]=4095;h=0;j=4095;while(1){a:do{if((j|0)==0){j=0}else{while(1){k=j+ -1|0;if((b[a+(j<<1)+15772>>1]|0)>=(h|0)){break a}if((k|0)==0){j=0;break}else{j=k}}}}while(0);c[a+(h<<2)+134572>>2]=j<<16;h=h+1|0;if((h|0)==4096){h=0;break}}do{c[a+(h<<2)+15548>>2]=(~~(+(h*3|0)/.0234375)<<16)+268435456;h=h+1|0;}while((h|0)!=15);c[a+15608>>2]=536805376;h=0;do{c[a+(h<<2)+150956>>2]=~~(f*+(h|0)*4096.0*.5)>>>0;h=h+1|0;}while((h|0)!=2048);h=a+14140|0;k=a+13628|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;c[h+12>>2]=0;h=0;do{l=+(1<<(h>>2)|0)*f*(+(h&3|0)*.25+1.0)*268435456.0;k=h+4|0;c[a+(k<<2)+13628>>2]=~~(l/399128.0)>>>0;c[a+(k<<2)+14140>>2]=~~(l/5514396.0)>>>0;h=h+1|0;}while((h|0)!=60);h=a+13880|0;k=a+14392|0;j=64;do{c[a+(j<<2)+13628>>2]=c[h>>2];c[a+(j<<2)+14140>>2]=c[k>>2];c[a+(j+ -64<<2)+15612>>2]=0;j=j+1|0;}while((j|0)!=96);j=a+14012|0;h=j+128|0;do{c[j>>2]=0;j=j+4|0}while((j|0)<(h|0));h=0;while(1){l=f*+(d[55016+h|0]|0)*32.0;c[a+(h<<2)+14524>>2]=~~l;c[a+(h<<2)+15036>>2]=~~-l;h=h+1|0;if((h|0)==32){h=0;break}else{}}while(1){l=f*+(d[h+55048|0]|0)*32.0;c[a+(h<<2)+14652>>2]=~~l;c[a+(h<<2)+15164>>2]=~~-l;h=h+1|0;if((h|0)==32){h=0;break}else{}}while(1){l=f*+(d[h+55080|0]|0)*32.0;c[a+(h<<2)+14780>>2]=~~l;c[a+(h<<2)+15292>>2]=~~-l;h=h+1|0;if((h|0)==32){h=0;break}else{}}do{l=f*+(d[h+55112|0]|0)*32.0;c[a+(h<<2)+14908>>2]=~~l;c[a+(h<<2)+15420>>2]=~~-l;h=h+1|0;}while((h|0)!=32);c[a+15740>>2]=~~(1068373114.88/e)>>>0;c[a+15744>>2]=~~(1492501135.36/e)>>>0;c[a+15748>>2]=~~(1615981445.12/e)>>>0;c[a+15752>>2]=~~(1709933854.72/e)>>>0;c[a+15756>>2]=~~(1846835937.28/e)>>>0;c[a+15760>>2]=~~(2585033441.28/e)>>>0;c[a+15764>>2]=~~(12911745433.6/e)>>>0;c[a+15768>>2]=~~(19381039923.2/e)>>>0;Kk(a);i=g;return}function Kk(a){a=a|0;var b=0,d=0,e=0,f=0;d=i;c[a+13620>>2]=0;c[a+36>>2]=0;e=a+4|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;e=0;while(1){c[a+(e*556|0)+56>>2]=-1;c[a+(e*556|0)+60>>2]=-1;c[a+(e*556|0)+64>>2]=0;c[a+(e*556|0)+68>>2]=31;c[a+(e*556|0)+72>>2]=0;c[a+(e*556|0)+76>>2]=0;c[a+(e*556|0)+40>>2]=0;c[a+(e*556|0)+80>>2]=0;c[a+(e*556|0)+96>>2]=0;c[a+(e*556|0)+112>>2]=0;c[a+(e*556|0)+184>>2]=0;c[a+(e*556|0)+188>>2]=0;c[a+(e*556|0)+196>>2]=536870912;c[a+(e*556|0)+200>>2]=0;c[a+(e*556|0)+204>>2]=0;c[a+(e*556|0)+192>>2]=3;c[a+(e*556|0)+232>>2]=0;c[a+(e*556|0)+44>>2]=0;c[a+(e*556|0)+84>>2]=0;c[a+(e*556|0)+100>>2]=0;c[a+(e*556|0)+116>>2]=0;c[a+(e*556|0)+300>>2]=0;c[a+(e*556|0)+304>>2]=0;c[a+(e*556|0)+312>>2]=536870912;c[a+(e*556|0)+316>>2]=0;c[a+(e*556|0)+320>>2]=0;c[a+(e*556|0)+308>>2]=3;c[a+(e*556|0)+348>>2]=0;c[a+(e*556|0)+48>>2]=0;c[a+(e*556|0)+88>>2]=0;c[a+(e*556|0)+104>>2]=0;c[a+(e*556|0)+120>>2]=0;c[a+(e*556|0)+416>>2]=0;c[a+(e*556|0)+420>>2]=0;c[a+(e*556|0)+428>>2]=536870912;c[a+(e*556|0)+432>>2]=0;c[a+(e*556|0)+436>>2]=0;c[a+(e*556|0)+424>>2]=3;c[a+(e*556|0)+464>>2]=0;c[a+(e*556|0)+52>>2]=0;c[a+(e*556|0)+92>>2]=0;c[a+(e*556|0)+108>>2]=0;c[a+(e*556|0)+124>>2]=0;c[a+(e*556|0)+532>>2]=0;c[a+(e*556|0)+536>>2]=0;c[a+(e*556|0)+544>>2]=536870912;c[a+(e*556|0)+548>>2]=0;c[a+(e*556|0)+552>>2]=0;c[a+(e*556|0)+540>>2]=3;c[a+(e*556|0)+580>>2]=0;e=e+1|0;if((e|0)==6){e=0;break}else{}}do{c[a+(e<<2)+3376>>2]=-1;c[a+(e<<2)+4400>>2]=-1;e=e+1|0;}while((e|0)!=256);e=a+4104|0;if((c[e>>2]|0)!=192){c[e>>2]=192;Hk(a,182,192)|0}e=a+5128|0;if((c[e>>2]|0)!=192){c[e>>2]=192;Hk(a,438,192)|0}e=a+4100|0;if((c[e>>2]|0)!=192){c[e>>2]=192;Hk(a,181,192)|0}e=a+5124|0;if((c[e>>2]|0)!=192){c[e>>2]=192;Hk(a,437,192)|0}e=a+4096|0;if((c[e>>2]|0)!=192){c[e>>2]=192;Hk(a,180,192)|0}e=a+5120|0;if((c[e>>2]|0)==192){e=178}else{c[e>>2]=192;Hk(a,436,192)|0;e=178}do{f=a+(e<<2)+3376|0;do{if((e|0)<48){c[f>>2]=0;Ik(a,e,0)|0}else{do{if((c[f>>2]|0)==0){b=15}else{c[f>>2]=0;if((e|0)<160){Gk(a,e,0)|0;b=15;break}else{Hk(a,e,0)|0;break}}}while(0);if((b|0)==15){b=0;if((e|0)<=47){break}}f=a+(e<<2)+4400|0;if((c[f>>2]|0)==0){break}c[f>>2]=0;f=e+256|0;if((e|0)<160){Gk(a,f,0)|0;break}else{Hk(a,f,0)|0;break}}}while(0);e=e+ -1|0;}while((e|0)>33);c[a+3544>>2]=128;i=d;return}function Lk(a,b,d){a=a|0;b=+b;d=+d;var e=0,f=0,g=0;e=i;f=c[a>>2]|0;do{if((f|0)==0){g=zl(159148)|0;f=g;c[a>>2]=f;if((g|0)==0){g=55144;i=e;return g|0}else{c[g+5424>>2]=0;break}}}while(0);Pl(f|0,0,5424)|0;Jk(c[a>>2]|0,b,d);g=0;i=e;return g|0}function Mk(a){a=a|0;var b=0;b=i;Al(c[a>>2]|0);i=b;return}function Nk(a){a=a|0;var b=0;b=i;Kk(c[a>>2]|0);i=b;return}function Ok(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;a=c[a>>2]|0;if(!(d>>>0<256)){za(55192,54928,850,55224)}f=a+(b<<2)+3376|0;if((b|0)<48){c[f>>2]=d;Ik(a,b,d)|0;i=e;return}if((c[f>>2]|0)==(d|0)){i=e;return}c[f>>2]=d;if((b|0)<160){Gk(a,b,d)|0;i=e;return}else{Hk(a,b,d)|0;i=e;return}}function Pk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;a=c[a>>2]|0;if(!(d>>>0<256)){za(55192,54928,870,55216)}if((b|0)<=47){i=e;return}f=a+(b<<2)+4400|0;if((c[f>>2]|0)==(d|0)){i=e;return}c[f>>2]=d;f=b+256|0;if((b|0)<160){Gk(a,f,d)|0;i=e;return}else{Hk(a,f,d)|0;i=e;return}}function Qk(a,b){a=a|0;b=b|0;c[(c[a>>2]|0)+5424>>2]=b;i=i;return}function Rk(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;N=i;h=a+28|0;f=a+4|0;g=a+24|0;M=a+16|0;L=a+12|0;K=a+1304|0;E=a+1296|0;G=a+1308|0;F=a+1344|0;H=a+1320|0;I=a+1312|0;J=a+1316|0;D=a+1420|0;x=a+1412|0;e=a+1424|0;y=a+1460|0;A=a+1436|0;B=a+1428|0;C=a+1432|0;w=a+1536|0;q=a+1528|0;s=a+1540|0;r=a+1576|0;t=a+1552|0;u=a+1544|0;v=a+1548|0;p=a+1652|0;j=a+1644|0;l=a+1656|0;k=a+1692|0;m=a+1668|0;n=a+1660|0;o=a+1664|0;O=c[a>>2]|0;z=c[a+32>>2]|0;do{P=(d|0)<6?d:6;d=d-P|0;P=_(P,O)|0;do{if((z&1|0)!=0){Q=(c[M>>2]|0)-P|0;c[M>>2]=Q;if((Q|0)>=1){break}c[f>>2]=z>>>2&1|c[f>>2];c[M>>2]=Q+(c[L>>2]|0);if((z&128|0)==0){break}if((c[K>>2]|0)==3){c[E>>2]=0;c[G>>2]=c[F>>2]&c[a+(b[a+(c[G>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[F>>2]=-1;c[I>>2]=c[H>>2];c[J>>2]=268435456;c[K>>2]=0}if((c[D>>2]|0)==3){c[x>>2]=0;c[e>>2]=c[y>>2]&c[a+(b[a+(c[e>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[y>>2]=-1;c[B>>2]=c[A>>2];c[C>>2]=268435456;c[D>>2]=0}if((c[w>>2]|0)==3){c[q>>2]=0;c[s>>2]=c[r>>2]&c[a+(b[a+(c[s>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[r>>2]=-1;c[u>>2]=c[t>>2];c[v>>2]=268435456;c[w>>2]=0}if((c[p>>2]|0)!=3){break}c[j>>2]=0;c[l>>2]=c[k>>2]&c[a+(b[a+(c[l>>2]>>16<<1)+15772>>1]<<2)+134572>>2];c[k>>2]=-1;c[n>>2]=c[m>>2];c[o>>2]=268435456;c[p>>2]=0}}while(0);do{if((z&2|0)!=0){P=(c[h>>2]|0)-P|0;c[h>>2]=P;if((P|0)>=1){break}c[f>>2]=z>>>2&2|c[f>>2];c[h>>2]=P+(c[g>>2]|0)}}while(0);}while((d|0)>0);i=N;return}function Sk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;if((b|0)<1){i=e;return}f=a+32|0;if((c[f>>2]&3|0)==0){g=0}else{Rk(a,b);g=0}do{if((c[a+(g*556|0)+188>>2]|0)==-1){if((g|0)==2){h=0;j=(c[f>>2]|0)>>>5&2}else{h=0;j=0}do{k=c[a+(g*556|0)+(j<<2)+112>>2]|0;n=k>>c[a+(g*556|0)+(h*116|0)+148>>2];c[a+(g*556|0)+(h*116|0)+188>>2]=_((c[(c[a+(g*556|0)+(h*116|0)+128>>2]|0)+(k<<2)>>2]|0)+((c[a+(c[a+(g*556|0)+(j<<2)+80>>2]<<2)+150956>>2]|0)>>>(7-(c[a+(g*556|0)+(j<<2)+96>>2]|0)|0))|0,c[a+(g*556|0)+(h*116|0)+132>>2]|0)|0;k=a+(g*556|0)+(h*116|0)+152|0;do{if((c[k>>2]|0)!=(n|0)){c[k>>2]=n;l=c[(c[a+(g*556|0)+(h*116|0)+168>>2]|0)+(n<<2)>>2]|0;c[a+(g*556|0)+(h*116|0)+208>>2]=l;k=c[(c[a+(g*556|0)+(h*116|0)+172>>2]|0)+(n<<2)>>2]|0;c[a+(g*556|0)+(h*116|0)+212>>2]=k;m=c[(c[a+(g*556|0)+(h*116|0)+176>>2]|0)+(n<<2)>>2]|0;c[a+(g*556|0)+(h*116|0)+216>>2]=m;o=c[(c[a+(g*556|0)+(h*116|0)+180>>2]|0)+(n<<2)>>2]|0;c[a+(g*556|0)+(h*116|0)+220>>2]=o;n=c[a+(g*556|0)+(h*116|0)+192>>2]|0;if((n|0)==1){c[a+(g*556|0)+(h*116|0)+200>>2]=k;break}else if((n|0)==0){c[a+(g*556|0)+(h*116|0)+200>>2]=l;break}else{if((c[a+(g*556|0)+(h*116|0)+196>>2]|0)>=536870912){break}if((n|0)==2){c[a+(g*556|0)+(h*116|0)+200>>2]=m;break}else if((n|0)==3){c[a+(g*556|0)+(h*116|0)+200>>2]=o;break}else{break}}}}while(0);if((j|0)==0){j=0}else{j=j^2^j>>1}h=h+1|0;}while((h|0)!=4)}g=g+1|0;}while((g|0)!=6);g=a+5424|0;f=a+5428|0;h=c[g>>2]|0;if((h&1|0)==0){pb[c[55160+(c[a+64>>2]<<2)>>2]&15](f,a+40|0,d,b);h=c[g>>2]|0}if((h&2|0)==0){pb[c[55160+(c[a+620>>2]<<2)>>2]&15](f,a+596|0,d,b);h=c[g>>2]|0}if((h&4|0)==0){pb[c[55160+(c[a+1176>>2]<<2)>>2]&15](f,a+1152|0,d,b);h=c[g>>2]|0}if((h&8|0)==0){pb[c[55160+(c[a+1732>>2]<<2)>>2]&15](f,a+1708|0,d,b);h=c[g>>2]|0}if((h&16|0)==0){pb[c[55160+(c[a+2288>>2]<<2)>>2]&15](f,a+2264|0,d,b);h=c[g>>2]|0}do{if((h&32|0)==0){if((c[a+36>>2]|0)!=0){break}pb[c[55160+(c[a+2844>>2]<<2)>>2]&15](f,a+2820|0,d,b)}}while(0);n=_(c[a+13624>>2]|0,b)|0;o=a+13620|0;c[o>>2]=(c[o>>2]|0)+n;i=e;return}function Tk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;Sk(c[a>>2]|0,b,d);i=e;return}function Uk(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;na=i;o=d+504|0;Ga=c[o>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;p=c[a+8196>>2]|0;if((Ga|0)==536870912){i=na;return}ba=d+156|0;ma=d+100|0;ha=d+120|0;ra=d+196|0;ia=d+124|0;H=d+388|0;h=d+332|0;N=d+352|0;sa=d+428|0;O=d+356|0;R=d+272|0;oa=d+216|0;Y=d+236|0;ta=d+312|0;Z=d+240|0;D=d+468|0;E=d+472|0;v=d;va=d+32|0;qa=d+148|0;u=d+380|0;t=d+264|0;s=d+496|0;r=d+16|0;q=d+20|0;fa=d+164|0;da=d+160|0;V=d+280|0;T=d+276|0;K=d+396|0;J=d+392|0;z=d+512|0;y=d+508|0;A=d+500|0;B=d+520|0;w=d+452|0;x=d+524|0;F=d+464|0;C=d+516|0;L=d+384|0;M=d+404|0;G=d+336|0;I=d+408|0;Q=d+348|0;P=d+400|0;W=d+268|0;S=d+288|0;U=d+220|0;X=d+292|0;aa=d+232|0;$=d+284|0;ga=d+152|0;ca=d+172|0;ea=d+104|0;la=d+176|0;ka=d+116|0;ja=d+168|0;pa=c[d+448>>2]|0;ua=c[d+544>>2]|0;d=c[d+28>>2]|0;xa=c[a+8192>>2]|0;wa=c[v>>2]|0;Aa=c[E>>2]|0;za=c[D>>2]|0;Ja=c[R>>2]|0;Ka=c[H>>2]|0;Fa=c[ba>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){xa=xa+p|0;Ia=xa>>>18&1023;Ma=b[a+(Ia<<1)+26744>>1]|0;ya=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[ma>>2]|0)|0;La=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[h>>2]|0)|0;Fa=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[oa>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+pa|0;ya=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(ya-(c[ia>>2]|0)>>31&(Ma>>c[ra>>2])+(ya^c[ha>>2]))<<2)+30840>>2]|0;Ga=c[a+((b[a+((((c[a+((b[a+((((c[a+((b[a+(((wa+Ca|0)>>>14&4095)<<1)>>1]|0)+(La-(c[O>>2]|0)>>31&(Ma>>c[sa>>2])+(La^c[N>>2]))<<2)+30840>>2]|0)+Da|0)>>>14&4095)<<1)>>1]|0)+(Fa-(c[Z>>2]|0)>>31&(Ma>>c[ta>>2])+(Fa^c[Y>>2]))<<2)+30840>>2]|0)+Ea|0)>>>14&4095)<<1)>>1]|0)+(Ga-Aa>>31&(Ma>>ua)+(Ga^za))<<2)+30840>>2]>>16;Ha=((_(b[a+(Ia<<1)+28792>>1]|0,c[va>>2]|0)|0)>>10)+256|0;Ba=((_(Ha,c[qa>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ha,c[u>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[t>>2]|0,Ha)|0)>>>8)+Da|0;Ea=((_(c[s>>2]|0,Ha)|0)>>>8)+Ea|0;Ha=(c[r>>2]&Ga)+(e[f>>1]|0)|0;Ia=f+2|0;Ga=(c[q>>2]&Ga)+(e[Ia>>1]|0)|0;Ma=c[fa>>2]|0;Fa=(c[ba>>2]|0)+(c[da>>2]|0)|0;c[ba>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ga>>2]|0;do{if((Ja|0)==0){c[ba>>2]=268435456;c[da>>2]=c[ca>>2];c[fa>>2]=c[ea>>2];c[ga>>2]=1;Fa=268435456;break a}else if((Ja|0)==2){Fa=c[ka>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[ba>>2]=0;c[da>>2]=c[ja>>2];c[fa>>2]=268435456;c[ga>>2]=0;Ma=Fa<<1&4;c[ha>>2]=0;c[ia>>2]=2147483647;c[ka>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[ha>>2]=4095;c[ia>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[ha>>2]=0;c[ia>>2]=2147483647;c[ka>>2]=Ma;if((Ma|0)==0){break}c[ha>>2]=4095;c[ia>>2]=4095;break}}else if((Ja|0)==1){Fa=c[ea>>2]|0;c[ba>>2]=Fa;c[da>>2]=c[la>>2];c[fa>>2]=536870912;c[ga>>2]=2;break a}else if((Ja|0)!=3){break a}}while(0);c[ba>>2]=536870912;c[da>>2]=0;c[fa>>2]=536870913;Fa=536870912}}while(0);Ma=c[V>>2]|0;Ja=(c[R>>2]|0)+(c[T>>2]|0)|0;c[R>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[W>>2]|0;do{if((Ka|0)==0){c[R>>2]=268435456;c[T>>2]=c[S>>2];c[V>>2]=c[U>>2];c[W>>2]=1;Ja=268435456;break b}else if((Ka|0)==1){Ja=c[U>>2]|0;c[R>>2]=Ja;c[T>>2]=c[X>>2];c[V>>2]=536870912;c[W>>2]=2;break b}else if((Ka|0)==2){Ja=c[aa>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[R>>2]=0;c[T>>2]=c[$>>2];c[V>>2]=268435456;c[W>>2]=0;Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[aa>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[Y>>2]=4095;c[Z>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[aa>>2]=Ma;if((Ma|0)==0){break}c[Y>>2]=4095;c[Z>>2]=4095;break}}else if((Ka|0)!=3){break b}}while(0);c[R>>2]=536870912;c[T>>2]=0;c[V>>2]=536870913;Ja=536870912}}while(0);Ma=c[K>>2]|0;Ka=(c[H>>2]|0)+(c[J>>2]|0)|0;c[H>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[L>>2]|0;do{if((La|0)==1){Ka=c[G>>2]|0;c[H>>2]=Ka;c[J>>2]=c[I>>2];c[K>>2]=536870912;c[L>>2]=2;break c}else if((La|0)==0){c[H>>2]=268435456;c[J>>2]=c[M>>2];c[K>>2]=c[G>>2];c[L>>2]=1;Ka=268435456;break c}else if((La|0)==2){Ka=c[Q>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[H>>2]=0;c[J>>2]=c[P>>2];c[K>>2]=268435456;c[L>>2]=0;Ma=Ka<<1&4;c[N>>2]=0;c[O>>2]=2147483647;c[Q>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[N>>2]=4095;c[O>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[N>>2]=0;c[O>>2]=2147483647;c[Q>>2]=Ma;if((Ma|0)==0){break}c[N>>2]=4095;c[O>>2]=4095;break}}else if((La|0)!=3){break c}}while(0);c[H>>2]=536870912;c[J>>2]=0;c[K>>2]=536870913;Ka=536870912}}while(0);Ma=c[z>>2]|0;La=(c[o>>2]|0)+(c[y>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[A>>2]|0;do{if((Ma|0)==1){La=c[w>>2]|0;c[o>>2]=La;c[y>>2]=c[x>>2];c[z>>2]=536870912;c[A>>2]=2;break d}else if((Ma|0)==0){c[o>>2]=268435456;c[y>>2]=c[B>>2];c[z>>2]=c[w>>2];c[A>>2]=1;La=268435456;break d}else if((Ma|0)==2){La=c[F>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[y>>2]=c[C>>2];c[z>>2]=268435456;c[A>>2]=0;Ma=La<<1&4;c[D>>2]=0;c[E>>2]=2147483647;c[F>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;La=0;break d}c[D>>2]=4095;c[E>>2]=4095;Aa=4095;za=4095;La=0;break d}else{Ma=La<<1&4;c[D>>2]=0;c[E>>2]=2147483647;c[F>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;break}c[D>>2]=4095;c[E>>2]=4095;Aa=4095;za=4095;break}}else if((Ma|0)!=3){break d}}while(0);c[o>>2]=536870912;c[y>>2]=0;c[z>>2]=536870913;La=536870912}}while(0);c[v>>2]=ya;b[f>>1]=Ha;b[Ia>>1]=Ga;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=ya}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=na;return}function Vk(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;na=i;o=d+504|0;Ga=c[o>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;p=c[a+8196>>2]|0;if((Ga|0)==536870912){i=na;return}ba=d+156|0;ma=d+100|0;ia=d+120|0;ra=d+196|0;ja=d+124|0;H=d+388|0;h=d+332|0;N=d+352|0;sa=d+428|0;O=d+356|0;R=d+272|0;oa=d+216|0;Y=d+236|0;ta=d+312|0;Z=d+240|0;C=d+468|0;D=d+472|0;v=d;va=d+32|0;qa=d+148|0;u=d+380|0;t=d+264|0;s=d+496|0;r=d+16|0;q=d+20|0;fa=d+164|0;da=d+160|0;V=d+280|0;T=d+276|0;K=d+396|0;J=d+392|0;z=d+512|0;y=d+508|0;A=d+500|0;F=d+520|0;w=d+452|0;x=d+524|0;E=d+464|0;B=d+516|0;L=d+384|0;M=d+404|0;G=d+336|0;I=d+408|0;Q=d+348|0;P=d+400|0;W=d+268|0;S=d+288|0;U=d+220|0;X=d+292|0;aa=d+232|0;$=d+284|0;ga=d+152|0;ca=d+172|0;ea=d+104|0;ha=d+176|0;la=d+116|0;ka=d+168|0;pa=c[d+448>>2]|0;ua=c[d+544>>2]|0;d=c[d+28>>2]|0;xa=c[a+8192>>2]|0;wa=c[v>>2]|0;Aa=c[D>>2]|0;za=c[C>>2]|0;Ja=c[R>>2]|0;Ka=c[H>>2]|0;Fa=c[ba>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){xa=xa+p|0;Ia=xa>>>18&1023;Ma=b[a+(Ia<<1)+26744>>1]|0;ya=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[ma>>2]|0)|0;La=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[h>>2]|0)|0;Fa=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[oa>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+pa|0;ya=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(ya-(c[ja>>2]|0)>>31&(Ma>>c[ra>>2])+(ya^c[ia>>2]))<<2)+30840>>2]|0;Ga=c[a+((b[a+((((c[a+((b[a+(((wa+Da+(c[a+((b[a+((Ca>>>14&4095)<<1)>>1]|0)+(La-(c[O>>2]|0)>>31&(Ma>>c[sa>>2])+(La^c[N>>2]))<<2)+30840>>2]|0)|0)>>>14&4095)<<1)>>1]|0)+(Fa-(c[Z>>2]|0)>>31&(Ma>>c[ta>>2])+(Fa^c[Y>>2]))<<2)+30840>>2]|0)+Ea|0)>>>14&4095)<<1)>>1]|0)+(Ga-Aa>>31&(Ma>>ua)+(Ga^za))<<2)+30840>>2]>>16;Ha=((_(b[a+(Ia<<1)+28792>>1]|0,c[va>>2]|0)|0)>>10)+256|0;Ba=((_(Ha,c[qa>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ha,c[u>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[t>>2]|0,Ha)|0)>>>8)+Da|0;Ea=((_(c[s>>2]|0,Ha)|0)>>>8)+Ea|0;Ha=(c[r>>2]&Ga)+(e[f>>1]|0)|0;Ia=f+2|0;Ga=(c[q>>2]&Ga)+(e[Ia>>1]|0)|0;Ma=c[fa>>2]|0;Fa=(c[ba>>2]|0)+(c[da>>2]|0)|0;c[ba>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ga>>2]|0;do{if((Ja|0)==0){c[ba>>2]=268435456;c[da>>2]=c[ca>>2];c[fa>>2]=c[ea>>2];c[ga>>2]=1;Fa=268435456;break a}else if((Ja|0)==1){Fa=c[ea>>2]|0;c[ba>>2]=Fa;c[da>>2]=c[ha>>2];c[fa>>2]=536870912;c[ga>>2]=2;break a}else if((Ja|0)==2){Fa=c[la>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[ba>>2]=0;c[da>>2]=c[ka>>2];c[fa>>2]=268435456;c[ga>>2]=0;Ma=Fa<<1&4;c[ia>>2]=0;c[ja>>2]=2147483647;c[la>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[ia>>2]=4095;c[ja>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[ia>>2]=0;c[ja>>2]=2147483647;c[la>>2]=Ma;if((Ma|0)==0){break}c[ia>>2]=4095;c[ja>>2]=4095;break}}else if((Ja|0)!=3){break a}}while(0);c[ba>>2]=536870912;c[da>>2]=0;c[fa>>2]=536870913;Fa=536870912}}while(0);Ma=c[V>>2]|0;Ja=(c[R>>2]|0)+(c[T>>2]|0)|0;c[R>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[W>>2]|0;do{if((Ka|0)==0){c[R>>2]=268435456;c[T>>2]=c[S>>2];c[V>>2]=c[U>>2];c[W>>2]=1;Ja=268435456;break b}else if((Ka|0)==1){Ja=c[U>>2]|0;c[R>>2]=Ja;c[T>>2]=c[X>>2];c[V>>2]=536870912;c[W>>2]=2;break b}else if((Ka|0)==2){Ja=c[aa>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[R>>2]=0;c[T>>2]=c[$>>2];c[V>>2]=268435456;c[W>>2]=0;Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[aa>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[Y>>2]=4095;c[Z>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[aa>>2]=Ma;if((Ma|0)==0){break}c[Y>>2]=4095;c[Z>>2]=4095;break}}else if((Ka|0)!=3){break b}}while(0);c[R>>2]=536870912;c[T>>2]=0;c[V>>2]=536870913;Ja=536870912}}while(0);Ma=c[K>>2]|0;Ka=(c[H>>2]|0)+(c[J>>2]|0)|0;c[H>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[L>>2]|0;do{if((La|0)==1){Ka=c[G>>2]|0;c[H>>2]=Ka;c[J>>2]=c[I>>2];c[K>>2]=536870912;c[L>>2]=2;break c}else if((La|0)==0){c[H>>2]=268435456;c[J>>2]=c[M>>2];c[K>>2]=c[G>>2];c[L>>2]=1;Ka=268435456;break c}else if((La|0)==2){Ka=c[Q>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[H>>2]=0;c[J>>2]=c[P>>2];c[K>>2]=268435456;c[L>>2]=0;Ma=Ka<<1&4;c[N>>2]=0;c[O>>2]=2147483647;c[Q>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[N>>2]=4095;c[O>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[N>>2]=0;c[O>>2]=2147483647;c[Q>>2]=Ma;if((Ma|0)==0){break}c[N>>2]=4095;c[O>>2]=4095;break}}else if((La|0)!=3){break c}}while(0);c[H>>2]=536870912;c[J>>2]=0;c[K>>2]=536870913;Ka=536870912}}while(0);Ma=c[z>>2]|0;La=(c[o>>2]|0)+(c[y>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[A>>2]|0;do{if((Ma|0)==1){La=c[w>>2]|0;c[o>>2]=La;c[y>>2]=c[x>>2];c[z>>2]=536870912;c[A>>2]=2;break d}else if((Ma|0)!=3)if((Ma|0)==2){La=c[E>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[y>>2]=c[B>>2];c[z>>2]=268435456;c[A>>2]=0;Ma=La<<1&4;c[C>>2]=0;c[D>>2]=2147483647;c[E>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;La=0;break d}c[C>>2]=4095;c[D>>2]=4095;Aa=4095;za=4095;La=0;break d}else{Ma=La<<1&4;c[C>>2]=0;c[D>>2]=2147483647;c[E>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;break}c[C>>2]=4095;c[D>>2]=4095;Aa=4095;za=4095;break}}else if((Ma|0)==0){c[o>>2]=268435456;c[y>>2]=c[F>>2];c[z>>2]=c[w>>2];c[A>>2]=1;La=268435456;break d}else{break d}}while(0);c[o>>2]=536870912;c[y>>2]=0;c[z>>2]=536870913;La=536870912}}while(0);c[v>>2]=ya;b[f>>1]=Ha;b[Ia>>1]=Ga;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=ya}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=na;return}function Wk(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;na=i;o=d+504|0;Ga=c[o>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;p=c[a+8196>>2]|0;if((Ga|0)==536870912){i=na;return}ba=d+156|0;ma=d+100|0;ha=d+120|0;ra=d+196|0;ia=d+124|0;H=d+388|0;h=d+332|0;N=d+352|0;sa=d+428|0;O=d+356|0;R=d+272|0;oa=d+216|0;X=d+236|0;ta=d+312|0;Y=d+240|0;y=d+468|0;z=d+472|0;v=d;va=d+32|0;qa=d+148|0;u=d+380|0;t=d+264|0;s=d+496|0;r=d+16|0;q=d+20|0;fa=d+164|0;da=d+160|0;V=d+280|0;T=d+276|0;K=d+396|0;J=d+392|0;x=d+512|0;w=d+508|0;B=d+500|0;D=d+520|0;E=d+452|0;F=d+524|0;C=d+464|0;A=d+516|0;L=d+384|0;M=d+404|0;G=d+336|0;I=d+408|0;Q=d+348|0;P=d+400|0;W=d+268|0;S=d+288|0;U=d+220|0;aa=d+292|0;$=d+232|0;Z=d+284|0;ga=d+152|0;ca=d+172|0;ea=d+104|0;la=d+176|0;ka=d+116|0;ja=d+168|0;pa=c[d+448>>2]|0;ua=c[d+544>>2]|0;d=c[d+28>>2]|0;xa=c[a+8192>>2]|0;wa=c[v>>2]|0;Aa=c[z>>2]|0;za=c[y>>2]|0;Ja=c[R>>2]|0;Ka=c[H>>2]|0;Fa=c[ba>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){xa=xa+p|0;Ia=xa>>>18&1023;Ma=b[a+(Ia<<1)+26744>>1]|0;ya=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[ma>>2]|0)|0;La=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[h>>2]|0)|0;Fa=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[oa>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+pa|0;ya=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(ya-(c[ia>>2]|0)>>31&(Ma>>c[ra>>2])+(ya^c[ha>>2]))<<2)+30840>>2]|0;Ga=c[a+((b[a+(((wa+Ea+(c[a+((b[a+((((c[a+((b[a+((Ca>>>14&4095)<<1)>>1]|0)+(La-(c[O>>2]|0)>>31&(Ma>>c[sa>>2])+(La^c[N>>2]))<<2)+30840>>2]|0)+Da|0)>>>14&4095)<<1)>>1]|0)+(Fa-(c[Y>>2]|0)>>31&(Ma>>c[ta>>2])+(Fa^c[X>>2]))<<2)+30840>>2]|0)|0)>>>14&4095)<<1)>>1]|0)+(Ga-Aa>>31&(Ma>>ua)+(Ga^za))<<2)+30840>>2]>>16;Ha=((_(b[a+(Ia<<1)+28792>>1]|0,c[va>>2]|0)|0)>>10)+256|0;Ba=((_(Ha,c[qa>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ha,c[u>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[t>>2]|0,Ha)|0)>>>8)+Da|0;Ea=((_(c[s>>2]|0,Ha)|0)>>>8)+Ea|0;Ha=(c[r>>2]&Ga)+(e[f>>1]|0)|0;Ia=f+2|0;Ga=(c[q>>2]&Ga)+(e[Ia>>1]|0)|0;Ma=c[fa>>2]|0;Fa=(c[ba>>2]|0)+(c[da>>2]|0)|0;c[ba>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ga>>2]|0;do{if((Ja|0)==0){c[ba>>2]=268435456;c[da>>2]=c[ca>>2];c[fa>>2]=c[ea>>2];c[ga>>2]=1;Fa=268435456;break a}else if((Ja|0)==2){Fa=c[ka>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[ba>>2]=0;c[da>>2]=c[ja>>2];c[fa>>2]=268435456;c[ga>>2]=0;Ma=Fa<<1&4;c[ha>>2]=0;c[ia>>2]=2147483647;c[ka>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[ha>>2]=4095;c[ia>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[ha>>2]=0;c[ia>>2]=2147483647;c[ka>>2]=Ma;if((Ma|0)==0){break}c[ha>>2]=4095;c[ia>>2]=4095;break}}else if((Ja|0)==1){Fa=c[ea>>2]|0;c[ba>>2]=Fa;c[da>>2]=c[la>>2];c[fa>>2]=536870912;c[ga>>2]=2;break a}else if((Ja|0)!=3){break a}}while(0);c[ba>>2]=536870912;c[da>>2]=0;c[fa>>2]=536870913;Fa=536870912}}while(0);Ma=c[V>>2]|0;Ja=(c[R>>2]|0)+(c[T>>2]|0)|0;c[R>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[W>>2]|0;do{if((Ka|0)==0){c[R>>2]=268435456;c[T>>2]=c[S>>2];c[V>>2]=c[U>>2];c[W>>2]=1;Ja=268435456;break b}else if((Ka|0)==2){Ja=c[$>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[R>>2]=0;c[T>>2]=c[Z>>2];c[V>>2]=268435456;c[W>>2]=0;Ma=Ja<<1&4;c[X>>2]=0;c[Y>>2]=2147483647;c[$>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[X>>2]=4095;c[Y>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[X>>2]=0;c[Y>>2]=2147483647;c[$>>2]=Ma;if((Ma|0)==0){break}c[X>>2]=4095;c[Y>>2]=4095;break}}else if((Ka|0)==1){Ja=c[U>>2]|0;c[R>>2]=Ja;c[T>>2]=c[aa>>2];c[V>>2]=536870912;c[W>>2]=2;break b}else if((Ka|0)!=3){break b}}while(0);c[R>>2]=536870912;c[T>>2]=0;c[V>>2]=536870913;Ja=536870912}}while(0);Ma=c[K>>2]|0;Ka=(c[H>>2]|0)+(c[J>>2]|0)|0;c[H>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[L>>2]|0;do{if((La|0)==1){Ka=c[G>>2]|0;c[H>>2]=Ka;c[J>>2]=c[I>>2];c[K>>2]=536870912;c[L>>2]=2;break c}else if((La|0)==0){c[H>>2]=268435456;c[J>>2]=c[M>>2];c[K>>2]=c[G>>2];c[L>>2]=1;Ka=268435456;break c}else if((La|0)==2){Ka=c[Q>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[H>>2]=0;c[J>>2]=c[P>>2];c[K>>2]=268435456;c[L>>2]=0;Ma=Ka<<1&4;c[N>>2]=0;c[O>>2]=2147483647;c[Q>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[N>>2]=4095;c[O>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[N>>2]=0;c[O>>2]=2147483647;c[Q>>2]=Ma;if((Ma|0)==0){break}c[N>>2]=4095;c[O>>2]=4095;break}}else if((La|0)!=3){break c}}while(0);c[H>>2]=536870912;c[J>>2]=0;c[K>>2]=536870913;Ka=536870912}}while(0);Ma=c[x>>2]|0;La=(c[o>>2]|0)+(c[w>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[B>>2]|0;do{if((Ma|0)==2){La=c[C>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[w>>2]=c[A>>2];c[x>>2]=268435456;c[B>>2]=0;Ma=La<<1&4;c[y>>2]=0;c[z>>2]=2147483647;c[C>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;La=0;break d}c[y>>2]=4095;c[z>>2]=4095;Aa=4095;za=4095;La=0;break d}else{Ma=La<<1&4;c[y>>2]=0;c[z>>2]=2147483647;c[C>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;break}c[y>>2]=4095;c[z>>2]=4095;Aa=4095;za=4095;break}}else if((Ma|0)!=3)if((Ma|0)==0){c[o>>2]=268435456;c[w>>2]=c[D>>2];c[x>>2]=c[E>>2];c[B>>2]=1;La=268435456;break d}else if((Ma|0)==1){La=c[E>>2]|0;c[o>>2]=La;c[w>>2]=c[F>>2];c[x>>2]=536870912;c[B>>2]=2;break d}else{break d}}while(0);c[o>>2]=536870912;c[w>>2]=0;c[x>>2]=536870913;La=536870912}}while(0);c[v>>2]=ya;b[f>>1]=Ha;b[Ia>>1]=Ga;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=ya}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=na;return}function Xk(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;na=i;o=d+504|0;Ga=c[o>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;p=c[a+8196>>2]|0;if((Ga|0)==536870912){i=na;return}ba=d+156|0;ma=d+100|0;ea=d+120|0;ra=d+196|0;fa=d+124|0;G=d+388|0;h=d+332|0;J=d+352|0;sa=d+428|0;K=d+356|0;R=d+272|0;oa=d+216|0;U=d+236|0;ta=d+312|0;V=d+240|0;C=d+468|0;D=d+472|0;v=d;va=d+32|0;qa=d+148|0;u=d+380|0;t=d+264|0;s=d+496|0;r=d+16|0;q=d+20|0;da=d+164|0;ca=d+160|0;T=d+280|0;S=d+276|0;I=d+396|0;H=d+392|0;z=d+512|0;y=d+508|0;A=d+500|0;F=d+520|0;w=d+452|0;x=d+524|0;E=d+464|0;B=d+516|0;M=d+384|0;O=d+404|0;P=d+336|0;Q=d+408|0;N=d+348|0;L=d+400|0;X=d+268|0;aa=d+288|0;Z=d+220|0;$=d+292|0;Y=d+232|0;W=d+284|0;ha=d+152|0;ja=d+172|0;ka=d+104|0;la=d+176|0;ia=d+116|0;ga=d+168|0;pa=c[d+448>>2]|0;ua=c[d+544>>2]|0;d=c[d+28>>2]|0;xa=c[a+8192>>2]|0;wa=c[v>>2]|0;Aa=c[D>>2]|0;za=c[C>>2]|0;Ja=c[R>>2]|0;Ka=c[G>>2]|0;Fa=c[ba>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){xa=xa+p|0;Ia=xa>>>18&1023;Ma=b[a+(Ia<<1)+26744>>1]|0;ya=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[ma>>2]|0)|0;La=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[h>>2]|0)|0;Fa=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[oa>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+pa|0;ya=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(ya-(c[fa>>2]|0)>>31&(Ma>>c[ra>>2])+(ya^c[ea>>2]))<<2)+30840>>2]|0;Ga=c[a+((b[a+((((c[a+((b[a+(((wa+Ca|0)>>>14&4095)<<1)>>1]|0)+(La-(c[K>>2]|0)>>31&(Ma>>c[sa>>2])+(La^c[J>>2]))<<2)+30840>>2]|0)+Ea+(c[a+((b[a+((Da>>>14&4095)<<1)>>1]|0)+(Fa-(c[V>>2]|0)>>31&(Ma>>c[ta>>2])+(Fa^c[U>>2]))<<2)+30840>>2]|0)|0)>>>14&4095)<<1)>>1]|0)+(Ga-Aa>>31&(Ma>>ua)+(Ga^za))<<2)+30840>>2]>>16;Ha=((_(b[a+(Ia<<1)+28792>>1]|0,c[va>>2]|0)|0)>>10)+256|0;Ba=((_(Ha,c[qa>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ha,c[u>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[t>>2]|0,Ha)|0)>>>8)+Da|0;Ea=((_(c[s>>2]|0,Ha)|0)>>>8)+Ea|0;Ha=(c[r>>2]&Ga)+(e[f>>1]|0)|0;Ia=f+2|0;Ga=(c[q>>2]&Ga)+(e[Ia>>1]|0)|0;Ma=c[da>>2]|0;Fa=(c[ba>>2]|0)+(c[ca>>2]|0)|0;c[ba>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ha>>2]|0;do{if((Ja|0)==2){Fa=c[ia>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[ba>>2]=0;c[ca>>2]=c[ga>>2];c[da>>2]=268435456;c[ha>>2]=0;Ma=Fa<<1&4;c[ea>>2]=0;c[fa>>2]=2147483647;c[ia>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[ea>>2]=4095;c[fa>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[ea>>2]=0;c[fa>>2]=2147483647;c[ia>>2]=Ma;if((Ma|0)==0){break}c[ea>>2]=4095;c[fa>>2]=4095;break}}else if((Ja|0)==0){c[ba>>2]=268435456;c[ca>>2]=c[ja>>2];c[da>>2]=c[ka>>2];c[ha>>2]=1;Fa=268435456;break a}else if((Ja|0)==1){Fa=c[ka>>2]|0;c[ba>>2]=Fa;c[ca>>2]=c[la>>2];c[da>>2]=536870912;c[ha>>2]=2;break a}else if((Ja|0)!=3){break a}}while(0);c[ba>>2]=536870912;c[ca>>2]=0;c[da>>2]=536870913;Fa=536870912}}while(0);Ma=c[T>>2]|0;Ja=(c[R>>2]|0)+(c[S>>2]|0)|0;c[R>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[X>>2]|0;do{if((Ka|0)==2){Ja=c[Y>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[R>>2]=0;c[S>>2]=c[W>>2];c[T>>2]=268435456;c[X>>2]=0;Ma=Ja<<1&4;c[U>>2]=0;c[V>>2]=2147483647;c[Y>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[U>>2]=4095;c[V>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[U>>2]=0;c[V>>2]=2147483647;c[Y>>2]=Ma;if((Ma|0)==0){break}c[U>>2]=4095;c[V>>2]=4095;break}}else if((Ka|0)==1){Ja=c[Z>>2]|0;c[R>>2]=Ja;c[S>>2]=c[$>>2];c[T>>2]=536870912;c[X>>2]=2;break b}else if((Ka|0)==0){c[R>>2]=268435456;c[S>>2]=c[aa>>2];c[T>>2]=c[Z>>2];c[X>>2]=1;Ja=268435456;break b}else if((Ka|0)!=3){break b}}while(0);c[R>>2]=536870912;c[S>>2]=0;c[T>>2]=536870913;Ja=536870912}}while(0);Ma=c[I>>2]|0;Ka=(c[G>>2]|0)+(c[H>>2]|0)|0;c[G>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[M>>2]|0;do{if((La|0)==2){Ka=c[N>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[G>>2]=0;c[H>>2]=c[L>>2];c[I>>2]=268435456;c[M>>2]=0;Ma=Ka<<1&4;c[J>>2]=0;c[K>>2]=2147483647;c[N>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[J>>2]=4095;c[K>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[J>>2]=0;c[K>>2]=2147483647;c[N>>2]=Ma;if((Ma|0)==0){break}c[J>>2]=4095;c[K>>2]=4095;break}}else if((La|0)==0){c[G>>2]=268435456;c[H>>2]=c[O>>2];c[I>>2]=c[P>>2];c[M>>2]=1;Ka=268435456;break c}else if((La|0)==1){Ka=c[P>>2]|0;c[G>>2]=Ka;c[H>>2]=c[Q>>2];c[I>>2]=536870912;c[M>>2]=2;break c}else if((La|0)!=3){break c}}while(0);c[G>>2]=536870912;c[H>>2]=0;c[I>>2]=536870913;Ka=536870912}}while(0);Ma=c[z>>2]|0;La=(c[o>>2]|0)+(c[y>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[A>>2]|0;do{if((Ma|0)==1){La=c[w>>2]|0;c[o>>2]=La;c[y>>2]=c[x>>2];c[z>>2]=536870912;c[A>>2]=2;break d}else if((Ma|0)==2){La=c[E>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[y>>2]=c[B>>2];c[z>>2]=268435456;c[A>>2]=0;Ma=La<<1&4;c[C>>2]=0;c[D>>2]=2147483647;c[E>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;La=0;break d}c[C>>2]=4095;c[D>>2]=4095;Aa=4095;za=4095;La=0;break d}else{Ma=La<<1&4;c[C>>2]=0;c[D>>2]=2147483647;c[E>>2]=Ma;if((Ma|0)==0){Aa=2147483647;za=0;break}c[C>>2]=4095;c[D>>2]=4095;Aa=4095;za=4095;break}}else if((Ma|0)==0){c[o>>2]=268435456;c[y>>2]=c[F>>2];c[z>>2]=c[w>>2];c[A>>2]=1;La=268435456;break d}else if((Ma|0)!=3){break d}}while(0);c[o>>2]=536870912;c[y>>2]=0;c[z>>2]=536870913;La=536870912}}while(0);c[v>>2]=ya;b[f>>1]=Ha;b[Ia>>1]=Ga;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=ya}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=na;return}function Yk(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;na=i;o=d+504|0;Ga=c[o>>2]|0;p=d+388|0;Ka=c[p>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;q=c[a+8196>>2]|0;if((Ka+ -536870912|Ga+ -536870912|0)==0){i=na;return}da=d+156|0;h=d+100|0;ia=d+120|0;sa=d+196|0;ja=d+124|0;oa=d+332|0;K=d+352|0;ta=d+428|0;L=d+356|0;S=d+272|0;pa=d+216|0;Y=d+236|0;ua=d+312|0;Z=d+240|0;A=d+468|0;B=d+472|0;x=d;ra=d+32|0;w=d+148|0;v=d+380|0;u=d+264|0;t=d+496|0;s=d+16|0;r=d+20|0;ga=d+164|0;fa=d+160|0;W=d+280|0;U=d+276|0;J=d+396|0;I=d+392|0;z=d+512|0;y=d+508|0;D=d+500|0;H=d+520|0;F=d+452|0;G=d+524|0;E=d+464|0;C=d+516|0;N=d+384|0;P=d+404|0;Q=d+336|0;R=d+408|0;O=d+348|0;M=d+400|0;X=d+268|0;T=d+288|0;V=d+220|0;ba=d+292|0;aa=d+232|0;$=d+284|0;ha=d+152|0;ma=d+172|0;ca=d+104|0;ea=d+176|0;la=d+116|0;ka=d+168|0;qa=c[d+448>>2]|0;va=c[d+544>>2]|0;d=c[d+28>>2]|0;ya=c[a+8192>>2]|0;wa=c[x>>2]|0;Aa=c[B>>2]|0;xa=c[A>>2]|0;Ja=c[S>>2]|0;Fa=c[da>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){ya=ya+q|0;Ia=ya>>>18&1023;Ma=b[a+(Ia<<1)+26744>>1]|0;za=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[h>>2]|0)|0;La=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[oa>>2]|0)|0;Fa=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[pa>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+qa|0;za=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(za-(c[ja>>2]|0)>>31&(Ma>>c[sa>>2])+(za^c[ia>>2]))<<2)+30840>>2]|0;Ga=(c[a+((b[a+(((wa+Ca|0)>>>14&4095)<<1)>>1]|0)+(La-(c[L>>2]|0)>>31&(Ma>>c[ta>>2])+(La^c[K>>2]))<<2)+30840>>2]|0)+(c[a+((b[a+((((c[a+((b[a+((Da>>>14&4095)<<1)>>1]|0)+(Fa-(c[Z>>2]|0)>>31&(Ma>>c[ua>>2])+(Fa^c[Y>>2]))<<2)+30840>>2]|0)+Ea|0)>>>14&4095)<<1)>>1]|0)+(Ga-Aa>>31&(Ma>>va)+(Ga^xa))<<2)+30840>>2]|0)>>16;Ha=((_(b[a+(Ia<<1)+28792>>1]|0,c[ra>>2]|0)|0)>>10)+256|0;Ba=((_(Ha,c[w>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ha,c[v>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[u>>2]|0,Ha)|0)>>>8)+Da|0;Ea=((_(c[t>>2]|0,Ha)|0)>>>8)+Ea|0;Ha=(c[s>>2]&Ga)+(e[f>>1]|0)|0;Ia=f+2|0;Ga=(c[r>>2]&Ga)+(e[Ia>>1]|0)|0;Ma=c[ga>>2]|0;Fa=(c[da>>2]|0)+(c[fa>>2]|0)|0;c[da>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ha>>2]|0;do{if((Ja|0)==1){Fa=c[ca>>2]|0;c[da>>2]=Fa;c[fa>>2]=c[ea>>2];c[ga>>2]=536870912;c[ha>>2]=2;break a}else if((Ja|0)==2){Fa=c[la>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[da>>2]=0;c[fa>>2]=c[ka>>2];c[ga>>2]=268435456;c[ha>>2]=0;Ma=Fa<<1&4;c[ia>>2]=0;c[ja>>2]=2147483647;c[la>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[ia>>2]=4095;c[ja>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[ia>>2]=0;c[ja>>2]=2147483647;c[la>>2]=Ma;if((Ma|0)==0){break}c[ia>>2]=4095;c[ja>>2]=4095;break}}else if((Ja|0)==0){c[da>>2]=268435456;c[fa>>2]=c[ma>>2];c[ga>>2]=c[ca>>2];c[ha>>2]=1;Fa=268435456;break a}else if((Ja|0)!=3){break a}}while(0);c[da>>2]=536870912;c[fa>>2]=0;c[ga>>2]=536870913;Fa=536870912}}while(0);Ma=c[W>>2]|0;Ja=(c[S>>2]|0)+(c[U>>2]|0)|0;c[S>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[X>>2]|0;do{if((Ka|0)==0){c[S>>2]=268435456;c[U>>2]=c[T>>2];c[W>>2]=c[V>>2];c[X>>2]=1;Ja=268435456;break b}else if((Ka|0)==2){Ja=c[aa>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[S>>2]=0;c[U>>2]=c[$>>2];c[W>>2]=268435456;c[X>>2]=0;Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[aa>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[Y>>2]=4095;c[Z>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[aa>>2]=Ma;if((Ma|0)==0){break}c[Y>>2]=4095;c[Z>>2]=4095;break}}else if((Ka|0)==1){Ja=c[V>>2]|0;c[S>>2]=Ja;c[U>>2]=c[ba>>2];c[W>>2]=536870912;c[X>>2]=2;break b}else if((Ka|0)!=3){break b}}while(0);c[S>>2]=536870912;c[U>>2]=0;c[W>>2]=536870913;Ja=536870912}}while(0);Ma=c[J>>2]|0;Ka=(c[p>>2]|0)+(c[I>>2]|0)|0;c[p>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[N>>2]|0;do{if((La|0)==2){Ka=c[O>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[p>>2]=0;c[I>>2]=c[M>>2];c[J>>2]=268435456;c[N>>2]=0;Ma=Ka<<1&4;c[K>>2]=0;c[L>>2]=2147483647;c[O>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[K>>2]=4095;c[L>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[K>>2]=0;c[L>>2]=2147483647;c[O>>2]=Ma;if((Ma|0)==0){break}c[K>>2]=4095;c[L>>2]=4095;break}}else if((La|0)==0){c[p>>2]=268435456;c[I>>2]=c[P>>2];c[J>>2]=c[Q>>2];c[N>>2]=1;Ka=268435456;break c}else if((La|0)==1){Ka=c[Q>>2]|0;c[p>>2]=Ka;c[I>>2]=c[R>>2];c[J>>2]=536870912;c[N>>2]=2;break c}else if((La|0)!=3){break c}}while(0);c[p>>2]=536870912;c[I>>2]=0;c[J>>2]=536870913;Ka=536870912}}while(0);Ma=c[z>>2]|0;La=(c[o>>2]|0)+(c[y>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[D>>2]|0;do{if((Ma|0)==2){La=c[E>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[y>>2]=c[C>>2];c[z>>2]=268435456;c[D>>2]=0;Ma=La<<1&4;c[A>>2]=0;c[B>>2]=2147483647;c[E>>2]=Ma;if((Ma|0)==0){Aa=2147483647;xa=0;La=0;break d}c[A>>2]=4095;c[B>>2]=4095;Aa=4095;xa=4095;La=0;break d}else{Ma=La<<1&4;c[A>>2]=0;c[B>>2]=2147483647;c[E>>2]=Ma;if((Ma|0)==0){Aa=2147483647;xa=0;break}c[A>>2]=4095;c[B>>2]=4095;Aa=4095;xa=4095;break}}else if((Ma|0)==1){La=c[F>>2]|0;c[o>>2]=La;c[y>>2]=c[G>>2];c[z>>2]=536870912;c[D>>2]=2;break d}else if((Ma|0)!=3)if((Ma|0)==0){c[o>>2]=268435456;c[y>>2]=c[H>>2];c[z>>2]=c[F>>2];c[D>>2]=1;La=268435456;break d}else{break d}}while(0);c[o>>2]=536870912;c[y>>2]=0;c[z>>2]=536870913;La=536870912}}while(0);c[x>>2]=za;b[f>>1]=Ha;b[Ia>>1]=Ga;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=za}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=na;return}function Zk(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;oa=i;o=d+504|0;Ga=c[o>>2]|0;q=d+272|0;Ja=c[q>>2]|0;p=d+388|0;Ka=c[p>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;r=c[a+8196>>2]|0;if((Ja+ -536870912|Ga+ -536870912|Ka+ -536870912|0)==0){i=oa;return}ea=d+156|0;h=d+100|0;ja=d+120|0;ta=d+196|0;ka=d+124|0;pa=d+332|0;P=d+352|0;ua=d+428|0;Q=d+356|0;qa=d+216|0;$=d+236|0;sa=d+312|0;aa=d+240|0;G=d+468|0;H=d+472|0;z=d;y=d+32|0;x=d+148|0;w=d+380|0;v=d+264|0;u=d+496|0;t=d+16|0;s=d+20|0;ha=d+164|0;ga=d+160|0;X=d+280|0;W=d+276|0;N=d+396|0;L=d+392|0;D=d+512|0;C=d+508|0;E=d+500|0;J=d+520|0;A=d+452|0;B=d+524|0;I=d+464|0;F=d+516|0;O=d+384|0;K=d+404|0;M=d+336|0;T=d+408|0;S=d+348|0;R=d+400|0;Y=d+268|0;Z=d+288|0;U=d+220|0;V=d+292|0;ca=d+232|0;ba=d+284|0;ia=d+152|0;na=d+172|0;da=d+104|0;fa=d+176|0;ma=d+116|0;la=d+168|0;ra=c[d+448>>2]|0;va=c[d+544>>2]|0;d=c[d+28>>2]|0;Aa=c[a+8192>>2]|0;wa=c[z>>2]|0;ya=c[H>>2]|0;xa=c[G>>2]|0;Fa=c[ea>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){Aa=Aa+r|0;Ia=Aa>>>18&1023;La=b[a+(Ia<<1)+26744>>1]|0;za=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[h>>2]|0)|0;Fa=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[pa>>2]|0)|0;Ma=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[qa>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+ra|0;za=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(za-(c[ka>>2]|0)>>31&(La>>c[ta>>2])+(za^c[ja>>2]))<<2)+30840>>2]|0;Ha=(c[a+((b[a+(((wa+Ca|0)>>>14&4095)<<1)>>1]|0)+(Fa-(c[Q>>2]|0)>>31&(La>>c[ua>>2])+(Fa^c[P>>2]))<<2)+30840>>2]|0)+(c[a+((b[a+(((wa+Ea|0)>>>14&4095)<<1)>>1]|0)+(Ga-ya>>31&(La>>va)+(Ga^xa))<<2)+30840>>2]|0)+(c[a+((b[a+(((wa+Da|0)>>>14&4095)<<1)>>1]|0)+(Ma-(c[aa>>2]|0)>>31&(La>>c[sa>>2])+(Ma^c[$>>2]))<<2)+30840>>2]|0)>>16;Ia=((_(b[a+(Ia<<1)+28792>>1]|0,c[y>>2]|0)|0)>>10)+256|0;Ba=((_(Ia,c[x>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ia,c[w>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[v>>2]|0,Ia)|0)>>>8)+Da|0;Ea=((_(c[u>>2]|0,Ia)|0)>>>8)+Ea|0;Ia=(c[t>>2]&Ha)+(e[f>>1]|0)|0;Ga=f+2|0;Ha=(c[s>>2]&Ha)+(e[Ga>>1]|0)|0;Ma=c[ha>>2]|0;Fa=(c[ea>>2]|0)+(c[ga>>2]|0)|0;c[ea>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ia>>2]|0;do{if((Ja|0)==1){Fa=c[da>>2]|0;c[ea>>2]=Fa;c[ga>>2]=c[fa>>2];c[ha>>2]=536870912;c[ia>>2]=2;break a}else if((Ja|0)==2){Fa=c[ma>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[ea>>2]=0;c[ga>>2]=c[la>>2];c[ha>>2]=268435456;c[ia>>2]=0;Ma=Fa<<1&4;c[ja>>2]=0;c[ka>>2]=2147483647;c[ma>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[ja>>2]=4095;c[ka>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[ja>>2]=0;c[ka>>2]=2147483647;c[ma>>2]=Ma;if((Ma|0)==0){break}c[ja>>2]=4095;c[ka>>2]=4095;break}}else if((Ja|0)==0){c[ea>>2]=268435456;c[ga>>2]=c[na>>2];c[ha>>2]=c[da>>2];c[ia>>2]=1;Fa=268435456;break a}else if((Ja|0)!=3){break a}}while(0);c[ea>>2]=536870912;c[ga>>2]=0;c[ha>>2]=536870913;Fa=536870912}}while(0);Ma=c[X>>2]|0;Ja=(c[q>>2]|0)+(c[W>>2]|0)|0;c[q>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[Y>>2]|0;do{if((Ka|0)==1){Ja=c[U>>2]|0;c[q>>2]=Ja;c[W>>2]=c[V>>2];c[X>>2]=536870912;c[Y>>2]=2;break b}else if((Ka|0)==0){c[q>>2]=268435456;c[W>>2]=c[Z>>2];c[X>>2]=c[U>>2];c[Y>>2]=1;Ja=268435456;break b}else if((Ka|0)==2){Ja=c[ca>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[q>>2]=0;c[W>>2]=c[ba>>2];c[X>>2]=268435456;c[Y>>2]=0;Ma=Ja<<1&4;c[$>>2]=0;c[aa>>2]=2147483647;c[ca>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[$>>2]=4095;c[aa>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[$>>2]=0;c[aa>>2]=2147483647;c[ca>>2]=Ma;if((Ma|0)==0){break}c[$>>2]=4095;c[aa>>2]=4095;break}}else if((Ka|0)!=3){break b}}while(0);c[q>>2]=536870912;c[W>>2]=0;c[X>>2]=536870913;Ja=536870912}}while(0);Ma=c[N>>2]|0;Ka=(c[p>>2]|0)+(c[L>>2]|0)|0;c[p>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[O>>2]|0;do{if((La|0)==0){c[p>>2]=268435456;c[L>>2]=c[K>>2];c[N>>2]=c[M>>2];c[O>>2]=1;Ka=268435456;break c}else if((La|0)==2){Ka=c[S>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[p>>2]=0;c[L>>2]=c[R>>2];c[N>>2]=268435456;c[O>>2]=0;Ma=Ka<<1&4;c[P>>2]=0;c[Q>>2]=2147483647;c[S>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[P>>2]=4095;c[Q>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[P>>2]=0;c[Q>>2]=2147483647;c[S>>2]=Ma;if((Ma|0)==0){break}c[P>>2]=4095;c[Q>>2]=4095;break}}else if((La|0)==1){Ka=c[M>>2]|0;c[p>>2]=Ka;c[L>>2]=c[T>>2];c[N>>2]=536870912;c[O>>2]=2;break c}else if((La|0)!=3){break c}}while(0);c[p>>2]=536870912;c[L>>2]=0;c[N>>2]=536870913;Ka=536870912}}while(0);Ma=c[D>>2]|0;La=(c[o>>2]|0)+(c[C>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[E>>2]|0;do{if((Ma|0)==1){La=c[A>>2]|0;c[o>>2]=La;c[C>>2]=c[B>>2];c[D>>2]=536870912;c[E>>2]=2;break d}else if((Ma|0)==2){La=c[I>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[C>>2]=c[F>>2];c[D>>2]=268435456;c[E>>2]=0;Ma=La<<1&4;c[G>>2]=0;c[H>>2]=2147483647;c[I>>2]=Ma;if((Ma|0)==0){ya=2147483647;xa=0;La=0;break d}c[G>>2]=4095;c[H>>2]=4095;ya=4095;xa=4095;La=0;break d}else{Ma=La<<1&4;c[G>>2]=0;c[H>>2]=2147483647;c[I>>2]=Ma;if((Ma|0)==0){ya=2147483647;xa=0;break}c[G>>2]=4095;c[H>>2]=4095;ya=4095;xa=4095;break}}else if((Ma|0)!=3)if((Ma|0)==0){c[o>>2]=268435456;c[C>>2]=c[J>>2];c[D>>2]=c[A>>2];c[E>>2]=1;La=268435456;break d}else{break d}}while(0);c[o>>2]=536870912;c[C>>2]=0;c[D>>2]=536870913;La=536870912}}while(0);c[z>>2]=za;b[f>>1]=Ia;b[Ga>>1]=Ha;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=za}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=oa;return}function _k(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;oa=i;o=d+504|0;Ga=c[o>>2]|0;q=d+272|0;Ja=c[q>>2]|0;p=d+388|0;Ka=c[p>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;r=c[a+8196>>2]|0;if((Ja+ -536870912|Ga+ -536870912|Ka+ -536870912|0)==0){i=oa;return}ea=d+156|0;h=d+100|0;ja=d+120|0;ta=d+196|0;ka=d+124|0;pa=d+332|0;P=d+352|0;ua=d+428|0;Q=d+356|0;qa=d+216|0;Z=d+236|0;sa=d+312|0;$=d+240|0;C=d+468|0;D=d+472|0;z=d;y=d+32|0;x=d+148|0;w=d+380|0;v=d+264|0;u=d+496|0;t=d+16|0;s=d+20|0;ha=d+164|0;ga=d+160|0;X=d+280|0;W=d+276|0;N=d+396|0;L=d+392|0;B=d+512|0;A=d+508|0;F=d+500|0;J=d+520|0;H=d+452|0;I=d+524|0;G=d+464|0;E=d+516|0;O=d+384|0;K=d+404|0;M=d+336|0;T=d+408|0;S=d+348|0;R=d+400|0;Y=d+268|0;ca=d+288|0;U=d+220|0;V=d+292|0;ba=d+232|0;aa=d+284|0;ia=d+152|0;na=d+172|0;da=d+104|0;fa=d+176|0;ma=d+116|0;la=d+168|0;ra=c[d+448>>2]|0;va=c[d+544>>2]|0;d=c[d+28>>2]|0;Aa=c[a+8192>>2]|0;wa=c[z>>2]|0;ya=c[D>>2]|0;xa=c[C>>2]|0;Fa=c[ea>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){Aa=Aa+r|0;Ia=Aa>>>18&1023;La=b[a+(Ia<<1)+26744>>1]|0;za=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[h>>2]|0)|0;Fa=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[pa>>2]|0)|0;Ma=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[qa>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+ra|0;za=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(za-(c[ka>>2]|0)>>31&(La>>c[ta>>2])+(za^c[ja>>2]))<<2)+30840>>2]|0;Ha=(c[a+((b[a+(((wa+Ca|0)>>>14&4095)<<1)>>1]|0)+(Fa-(c[Q>>2]|0)>>31&(La>>c[ua>>2])+(Fa^c[P>>2]))<<2)+30840>>2]|0)+(c[a+((b[a+((Ea>>>14&4095)<<1)>>1]|0)+(Ga-ya>>31&(La>>va)+(Ga^xa))<<2)+30840>>2]|0)+(c[a+((b[a+((Da>>>14&4095)<<1)>>1]|0)+(Ma-(c[$>>2]|0)>>31&(La>>c[sa>>2])+(Ma^c[Z>>2]))<<2)+30840>>2]|0)>>16;Ia=((_(b[a+(Ia<<1)+28792>>1]|0,c[y>>2]|0)|0)>>10)+256|0;Ba=((_(Ia,c[x>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ia,c[w>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[v>>2]|0,Ia)|0)>>>8)+Da|0;Ea=((_(c[u>>2]|0,Ia)|0)>>>8)+Ea|0;Ia=(c[t>>2]&Ha)+(e[f>>1]|0)|0;Ga=f+2|0;Ha=(c[s>>2]&Ha)+(e[Ga>>1]|0)|0;Ma=c[ha>>2]|0;Fa=(c[ea>>2]|0)+(c[ga>>2]|0)|0;c[ea>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ia>>2]|0;do{if((Ja|0)==1){Fa=c[da>>2]|0;c[ea>>2]=Fa;c[ga>>2]=c[fa>>2];c[ha>>2]=536870912;c[ia>>2]=2;break a}else if((Ja|0)==2){Fa=c[ma>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[ea>>2]=0;c[ga>>2]=c[la>>2];c[ha>>2]=268435456;c[ia>>2]=0;Ma=Fa<<1&4;c[ja>>2]=0;c[ka>>2]=2147483647;c[ma>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[ja>>2]=4095;c[ka>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[ja>>2]=0;c[ka>>2]=2147483647;c[ma>>2]=Ma;if((Ma|0)==0){break}c[ja>>2]=4095;c[ka>>2]=4095;break}}else if((Ja|0)==0){c[ea>>2]=268435456;c[ga>>2]=c[na>>2];c[ha>>2]=c[da>>2];c[ia>>2]=1;Fa=268435456;break a}else if((Ja|0)!=3){break a}}while(0);c[ea>>2]=536870912;c[ga>>2]=0;c[ha>>2]=536870913;Fa=536870912}}while(0);Ma=c[X>>2]|0;Ja=(c[q>>2]|0)+(c[W>>2]|0)|0;c[q>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[Y>>2]|0;do{if((Ka|0)==1){Ja=c[U>>2]|0;c[q>>2]=Ja;c[W>>2]=c[V>>2];c[X>>2]=536870912;c[Y>>2]=2;break b}else if((Ka|0)==2){Ja=c[ba>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[q>>2]=0;c[W>>2]=c[aa>>2];c[X>>2]=268435456;c[Y>>2]=0;Ma=Ja<<1&4;c[Z>>2]=0;c[$>>2]=2147483647;c[ba>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[Z>>2]=4095;c[$>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[Z>>2]=0;c[$>>2]=2147483647;c[ba>>2]=Ma;if((Ma|0)==0){break}c[Z>>2]=4095;c[$>>2]=4095;break}}else if((Ka|0)==0){c[q>>2]=268435456;c[W>>2]=c[ca>>2];c[X>>2]=c[U>>2];c[Y>>2]=1;Ja=268435456;break b}else if((Ka|0)!=3){break b}}while(0);c[q>>2]=536870912;c[W>>2]=0;c[X>>2]=536870913;Ja=536870912}}while(0);Ma=c[N>>2]|0;Ka=(c[p>>2]|0)+(c[L>>2]|0)|0;c[p>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[O>>2]|0;do{if((La|0)==0){c[p>>2]=268435456;c[L>>2]=c[K>>2];c[N>>2]=c[M>>2];c[O>>2]=1;Ka=268435456;break c}else if((La|0)==2){Ka=c[S>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[p>>2]=0;c[L>>2]=c[R>>2];c[N>>2]=268435456;c[O>>2]=0;Ma=Ka<<1&4;c[P>>2]=0;c[Q>>2]=2147483647;c[S>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[P>>2]=4095;c[Q>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[P>>2]=0;c[Q>>2]=2147483647;c[S>>2]=Ma;if((Ma|0)==0){break}c[P>>2]=4095;c[Q>>2]=4095;break}}else if((La|0)==1){Ka=c[M>>2]|0;c[p>>2]=Ka;c[L>>2]=c[T>>2];c[N>>2]=536870912;c[O>>2]=2;break c}else if((La|0)!=3){break c}}while(0);c[p>>2]=536870912;c[L>>2]=0;c[N>>2]=536870913;Ka=536870912}}while(0);Ma=c[B>>2]|0;La=(c[o>>2]|0)+(c[A>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[F>>2]|0;do{if((Ma|0)==2){La=c[G>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[A>>2]=c[E>>2];c[B>>2]=268435456;c[F>>2]=0;Ma=La<<1&4;c[C>>2]=0;c[D>>2]=2147483647;c[G>>2]=Ma;if((Ma|0)==0){ya=2147483647;xa=0;La=0;break d}c[C>>2]=4095;c[D>>2]=4095;ya=4095;xa=4095;La=0;break d}else{Ma=La<<1&4;c[C>>2]=0;c[D>>2]=2147483647;c[G>>2]=Ma;if((Ma|0)==0){ya=2147483647;xa=0;break}c[C>>2]=4095;c[D>>2]=4095;ya=4095;xa=4095;break}}else if((Ma|0)==1){La=c[H>>2]|0;c[o>>2]=La;c[A>>2]=c[I>>2];c[B>>2]=536870912;c[F>>2]=2;break d}else if((Ma|0)!=3)if((Ma|0)==0){c[o>>2]=268435456;c[A>>2]=c[J>>2];c[B>>2]=c[H>>2];c[F>>2]=1;La=268435456;break d}else{break d}}while(0);c[o>>2]=536870912;c[A>>2]=0;c[B>>2]=536870913;La=536870912}}while(0);c[z>>2]=za;b[f>>1]=Ia;b[Ga>>1]=Ha;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=za}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=oa;return}



function qb(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function rb(){return i|0}function sb(a){a=a|0;i=a}function tb(a,b){a=a|0;b=b|0;if((n|0)==0){n=a;o=b}}function ub(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function vb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function wb(a){a=a|0;C=a}function xb(a){a=a|0;D=a}function yb(a){a=a|0;E=a}function zb(a){a=a|0;F=a}function Ab(a){a=a|0;G=a}function Bb(a){a=a|0;H=a}function Cb(a){a=a|0;I=a}function Db(a){a=a|0;J=a}function Eb(a){a=a|0;K=a}function Fb(a){a=a|0;L=a}function Gb(){i=i;return 208}function Hb(a,b){a=a|0;b=b|0;var d=0,e=0;e=i;d=zl(8)|0;c[d>>2]=a;c[d+4>>2]=b;i=e;return d|0}function Ib(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;bl(b,d,224,c[a>>2]|0)|0;b=zl(8)|0;c[b>>2]=a;c[b+4>>2]=dl(c[56]|0)|0;i=e;return b|0}function Jb(a,b){a=a|0;b=b|0;var d=0,e=0;e=i;d=zl(8)|0;c[d>>2]=a;c[d+4>>2]=b;i=e;return d|0}function Kb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=i;i=i+48|0;d=b;p=i;i=i+8|0;el(c[56]|0,p,c[a+4>>2]|0)|0;a=c[50]|0;p=c[p>>2]|0;o=c[p+12>>2]|0;n=c[p+4>>2]|0;m=c[p+8>>2]|0;l=c[p+64>>2]|0;k=c[p+68>>2]|0;j=c[p+72>>2]|0;h=c[p+76>>2]|0;g=c[p+80>>2]|0;f=c[p+84>>2]|0;e=c[p+88>>2]|0;c[d>>2]=c[p>>2];c[d+4>>2]=o;c[d+8>>2]=n;c[d+12>>2]=m;c[d+16>>2]=l;c[d+20>>2]=k;c[d+24>>2]=j;c[d+28>>2]=h;c[d+32>>2]=g;c[d+36>>2]=f;c[d+40>>2]=e;Ra(232,a|0,d|0)|0;i=b;return 232}function Lb(a){a=a|0;i=i;return c[a+4>>2]|0}function Mb(a){a=a|0;var b=0,d=0;d=i;b=zl(8)|0;c[b>>2]=c[c[a>>2]>>2];c[b+4>>2]=a;fl(c[56]|0,c[a+4>>2]|0)|0;i=d;return b|0}function Nb(a){a=a|0;a=i;gl(c[56]|0,16384,2280)|0;i=a;return 2280}function Ob(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;f=b+472|0;Cc(f,b+512|0,12);j=7;while(1){h=d[35048+j|0]|0;g=b+(j*48|0)+88|0;k=2;while(1){l=h&1;m=(h>>>1&1)-l|0;l=0-l&15;a[g]=a[35056+l|0]|0;l=m+l|0;a[g+1|0]=a[35056+l|0]|0;l=m+l|0;a[g+2|0]=a[35056+l|0]|0;l=m+l|0;a[g+3|0]=a[35056+l|0]|0;l=m+l|0;a[g+4|0]=a[35056+l|0]|0;l=m+l|0;a[g+5|0]=a[35056+l|0]|0;l=m+l|0;a[g+6|0]=a[35056+l|0]|0;l=m+l|0;a[g+7|0]=a[35056+l|0]|0;l=m+l|0;a[g+8|0]=a[35056+l|0]|0;l=m+l|0;a[g+9|0]=a[35056+l|0]|0;l=m+l|0;a[g+10|0]=a[35056+l|0]|0;l=m+l|0;a[g+11|0]=a[35056+l|0]|0;l=m+l|0;a[g+12|0]=a[35056+l|0]|0;l=m+l|0;a[g+13|0]=a[35056+l|0]|0;l=m+l|0;a[g+14|0]=a[35056+l|0]|0;a[g+15|0]=a[35056+(m+l)|0]|0;k=k+ -1|0;if((k|0)>-1){g=g+16|0;h=h>>2}else{break}}if((j|0)==0){break}else{j=j+ -1|0}}c[b+12>>2]=0;c[b+28>>2]=0;c[b+44>>2]=0;Fc(f,.000915032679738562);c[b+48>>2]=0;c[b+68>>2]=0;c[b+72>>2]=1;c[b+32>>2]=16;h=b+36|0;c[h>>2]=0;c[h+4>>2]=0;c[b+16>>2]=16;h=b+20|0;c[h>>2]=0;c[h+4>>2]=0;c[b>>2]=16;h=b+4|0;c[h>>2]=0;c[h+4>>2]=0;h=b+65|0;g=b+59|0;j=b+52|0;f=j+16|0;do{a[j]=0;j=j+1|0}while((j|0)<(f|0));a[g]=-1;c[b+80>>2]=b+184;c[b+84>>2]=-48;c[b+76>>2]=0;a[h]=9;i=e;return}function Pb(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;g=i;c[b+48>>2]=0;c[b+68>>2]=0;c[b+72>>2]=1;c[b+32>>2]=16;f=b+36|0;c[f>>2]=0;c[f+4>>2]=0;c[b+16>>2]=16;f=b+20|0;c[f>>2]=0;c[f+4>>2]=0;c[b>>2]=16;f=b+4|0;c[f>>2]=0;c[f+4>>2]=0;f=b+65|0;e=b+59|0;h=b+52|0;d=h+16|0;do{a[h]=0;h=h+1|0}while((h|0)<(d|0));a[e]=-1;c[b+80>>2]=b+184;c[b+84>>2]=-48;c[b+76>>2]=0;a[f]=9;i=g;return}function Qb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;g=i;if(!(e>>>0<16)){za(35072,35104,122,35144)}if((e|0)==13){if((f&8|0)==0){f=(f&4|0)!=0?15:9}c[b+80>>2]=b+((f+ -7|0)*48|0)+88;c[b+84>>2]=-48;c[b+76>>2]=0}a[b+e+52|0]=f;h=e>>1;if((h|0)>=3){i=g;return}e=h<<1;e=(d[b+(e|1)+52|0]|0)<<12&61440|(d[b+e+52|0]|0)<<4;e=(e|0)!=0?e:16;f=b+(h<<4)|0;h=b+(h<<4)+4|0;b=e-(c[f>>2]|0)+(c[h>>2]|0)|0;c[h>>2]=(b|0)<0?0:b;c[f>>2]=e;i=g;return}function Rb(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;j=i;h=f+48|0;if((c[h>>2]|0)>(g|0)){za(35160,35104,166,35192)}l=d[f+58|0]<<5&992;r=(l|0)!=0?l:32;q=f+68|0;p=c[q>>2]|0;o=f+72|0;s=c[o>>2]|0;l=d[f+64|0]<<8|d[f+63|0];l=(l|0)!=0?l<<5:32;m=f+76|0;if((c[m>>2]|0)==0){c[m>>2]=l}w=f+59|0;n=f+84|0;t=g+ -1|0;v=f+472|0;y=f+80|0;u=f+65|0;z=0;do{C=(d[w]|0)>>>z;x=c[f+(z<<4)+12>>2]|0;do{if((x|0)!=0){c[x+40>>2]=1;A=c[f+(z<<4)>>2]|0;if((A|0)>(((c[x+28>>2]|0)+16384|0)>>>15|0)){B=0}else{X=C&1^1;B=X;C=X|C}P=c[h>>2]|0;X=d[f+(z+8)+52|0]|0;O=(d[35056+(X&15)|0]|0)>>>B;N=c[n>>2]|0;do{if((X&16|0)==0){M=g;C=(O|0)==0?9:C}else{O=(d[(c[y>>2]|0)+N|0]|0)>>>B;if((a[u]&1)==0|(N|0)<-32){D=(c[m>>2]|0)+P|0;M=(D|0)<(g|0)?D:g;break}else{M=g;C=(O|0)==0?9:C;break}}}while(0);F=f+(z<<4)+4|0;S=(c[F>>2]|0)+P|0;G=C&1;E=(G|0)!=0;if(E){X=(t+A-S|0)/(A|0)|0;S=(_(X,A)|0)+S|0;D=f+(z<<4)+10|0;b[D>>1]=e[D>>1]^X&1}else{D=f+(z<<4)+10|0}K=(C&8|0)!=0;L=C>>>3;H=f+(z<<4)+8|0;I=x;J=x+4|0;Q=K?1:s;R=K?g:P+p|0;while(1){T=((Q|L)&1&(e[D>>1]|C)|0)==0?0:O;U=b[H>>1]|0;if((T|0)!=(U|0)){b[H>>1]=T;X=_(c[I>>2]|0,P)|0;Sb(v,X+(c[J>>2]|0)|0,T-U|0,x)}do{if((R|0)<(M|0)|(S|0)<(M|0)){V=T<<1;P=(V|0)!=(O|0)|0;V=V-O|0;U=b[D>>1]|G;while(1){T=(M|0)>(S|0)?S:M;do{if((U&P|0)==0){W=T-R|0;if(!((W|0)>-1)){break}R=T+r-((W|0)%(r|0)|0)|0}else{if((R|0)>(T|0)){break}while(1){W=0-(Q&1)&73728^Q>>>1;if((Q+1&2|0)!=0){V=0-V|0;X=_(c[I>>2]|0,R)|0;Sb(v,X+(c[J>>2]|0)|0,V,x)}R=R+r|0;if((R|0)>(T|0)){Q=W;break}else{Q=W}}}}while(0);T=(M|0)>(R|0);W=T?R:M;X=(S|0)<(W|0);do{if((Q&P|0)==0){if(!X){break}while(1){S=S+A|0;U=U^1;if((S|0)<(W|0)){}else{break}}}else{U=0-V|0;if(X){V=U;while(1){U=_(c[I>>2]|0,S)|0;Sb(v,U+(c[J>>2]|0)|0,V,x);S=S+A|0;U=0-V|0;if((S|0)<(W|0)){V=U}else{break}}}U=U>>>31}}while(0);if((S|0)<(M|0)){continue}if(!T){break}}b[H>>1]=(V+O|0)>>>1;if(E){break}b[D>>1]=U}}while(0);if((M|0)>=(g|0)){break}O=((N|0)>-2?-31:1)+N|0;N=M+l|0;P=M;M=(N|0)>(g|0)?g:N;N=O;O=(d[(c[y>>2]|0)+O|0]|0)>>>B}c[F>>2]=S-g;if(K){break}c[q>>2]=R-g;c[o>>2]=Q}}while(0);z=z+1|0;}while((z|0)!=3);o=g-(c[h>>2]|0)-(c[m>>2]|0)|0;do{if((o|0)>-1){p=(o+l|0)/(l|0)|0;f=(c[n>>2]|0)+p|0;f=(f|0)>-1?f|-32:f;c[n>>2]=f;n=o-(_(p,l)|0)|0;o=0-n|0;if((l|0)<(o|0)){za(35208,35104,388,35192)}c[m>>2]=o;if((n|0)<0){k=f;break}za(35232,35104,391,35192)}else{c[m>>2]=0-o;k=c[n>>2]|0}}while(0);if((k|0)<0){c[h>>2]=g;i=j;return}else{za(35248,35104,392,35192)}}function Sb(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=d>>>16;if((g|0)<(c[f+12>>2]|0)){j=_(c[a+8>>2]|0,e)|0;e=c[f+8>>2]|0;f=d>>>10&63;k=64-f|0;m=_(b[a+(k<<1)+40>>1]|0,j)|0;l=e+(g+2<<2)|0;d=_(b[a+(k+64<<1)+40>>1]|0,j)|0;h=e+(g+3<<2)|0;d=d+(c[h>>2]|0)|0;n=b[a+((k|128)<<1)+40>>1]|0;c[l>>2]=m+(c[l>>2]|0);c[h>>2]=d;n=_(n,j)|0;h=e+(g+4<<2)|0;d=_(b[a+(k+192<<1)+40>>1]|0,j)|0;l=e+(g+5<<2)|0;d=d+(c[l>>2]|0)|0;m=b[a+((k|256)<<1)+40>>1]|0;c[h>>2]=n+(c[h>>2]|0);c[l>>2]=d;m=_(m,j)|0;l=e+(g+6<<2)|0;k=_(b[a+(k+320<<1)+40>>1]|0,j)|0;d=e+(g+7<<2)|0;k=k+(c[d>>2]|0)|0;h=b[a+((f|320)<<1)+40>>1]|0;c[l>>2]=m+(c[l>>2]|0);c[d>>2]=k;h=_(h,j)|0;d=e+(g+8<<2)|0;k=_(b[a+((f|256)<<1)+40>>1]|0,j)|0;l=e+(g+9<<2)|0;k=k+(c[l>>2]|0)|0;m=b[a+((f|192)<<1)+40>>1]|0;c[d>>2]=h+(c[d>>2]|0);c[l>>2]=k;m=_(m,j)|0;l=e+(g+10<<2)|0;k=_(b[a+((f|128)<<1)+40>>1]|0,j)|0;d=e+(g+11<<2)|0;k=k+(c[d>>2]|0)|0;h=b[a+((f|64)<<1)+40>>1]|0;c[l>>2]=m+(c[l>>2]|0);c[d>>2]=k;h=_(h,j)|0;d=e+(g+12<<2)|0;f=_(b[a+(f<<1)+40>>1]|0,j)|0;e=e+(g+13<<2)|0;f=f+(c[e>>2]|0)|0;c[d>>2]=h+(c[d>>2]|0);c[e>>2]=f;i=i;return}else{za(35264,35336,342,35376)}}function Tb(b){b=b|0;var e=0,f=0,g=0,h=0;e=i;c[b+520>>2]=b+524;f=255;do{if((f|0)==0){g=4}else{h=1;g=f;do{h=g^h;g=g>>1;}while((g|0)!=0);g=h<<2&4}h=g|f&168;a[b+f|0]=h;a[b+(f+256)|0]=h|1;f=f+ -1|0;}while((f|0)>-1);h=b;a[h]=d[h]|0|64;h=b+256|0;a[h]=d[h]|0|64;i=e;return}function Ub(a,d){a=a|0;d=d|0;var e=0,f=0;e=i;c[a+512>>2]=d;d=a+524|0;c[a+520>>2]=d;c[a+516>>2]=0;f=d+0|0;a=f+36|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(a|0));b[d+36>>1]=0;i=e;return}function Vb(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0;l=i;i=i+8|0;j=l;q=j;k=i;i=i+8|0;h=f+520|0;s=c[h>>2]|0;ea=s;n=(c[ea>>2]|0)-g|0;c[ea>>2]=g;s=s+4|0;c[s>>2]=n+(c[s>>2]|0);s=f+524|0;n=s;ea=n;v=c[ea+4>>2]|0;W=j;c[W>>2]=c[ea>>2];c[W+4>>2]=v;c[h>>2]=q;W=k;ea=f+540|0;r=ea;m=r;ga=m;m=m+4|0;m=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24;u=k;c[u>>2]=d[ga]|d[ga+1|0]<<8|d[ga+2|0]<<16|d[ga+3|0]<<24;c[u+4>>2]=m;q=q+4|0;u=c[f+512>>2]|0;m=f+532|0;ga=e[m>>1]|0;g=f+534|0;ba=e[g>>1]|0;p=f+536|0;da=e[p>>1]|0;o=f+538|0;ca=e[o>>1]|0;ea=d[ea+7|0]|0;ja=a[u+ga|0]|0;ma=ja&255;na=d[35400+ma|0]|0;fa=na+v|0;if(!((fa|0)<0|(fa|0)<(na|0))){ia=W+7|0;ha=ea;ma=da;la=ca;ja=ga;ga=v;ka=ba;na=0;c[q>>2]=ga;ha=ha&255;a[ia]=ha;ma=ma&65535;b[p>>1]=ma;la=la&65535;b[o>>1]=la;ka=ka&65535;b[g>>1]=ka;ja=ja&65535;b[m>>1]=ja;ja=k;ka=ja;ka=c[ka>>2]|0;ja=ja+4|0;ja=c[ja>>2]|0;la=r;ma=la;a[ma]=ka;a[ma+1|0]=ka>>8;a[ma+2|0]=ka>>16;a[ma+3|0]=ka>>24;la=la+4|0;a[la]=ja;a[la+1|0]=ja>>8;a[la+2|0]=ja>>16;a[la+3|0]=ja>>24;la=j;ja=la;ja=c[ja>>2]|0;la=la+4|0;la=c[la>>2]|0;ma=n;ka=ma;c[ka>>2]=ja;ma=ma+4|0;c[ma>>2]=la;c[h>>2]=s;i=l;return na|0}C=f+554|0;y=W+6|0;D=f+555|0;B=j;A=W+4|0;z=W+1|0;P=k;E=P+4|0;H=k+ -24|0;F=k;I=k+ -184|0;G=k+ -160|0;K=k+ -176|0;L=k+ -168|0;J=k+ -112|0;M=k+ -8|0;P=P+2|0;x=f+548|0;v=k;w=f+550|0;V=f+552|0;N=f+556|0;O=f+557|0;Q=k+ -16|0;R=k+ -32|0;U=k+ -48|0;T=k+ -40|0;S=k+ -56|0;W=W+7|0;Y=f+559|0;Z=f+558|0;X=f+560|0;$=k+ -96|0;_=k+ -104|0;aa=0;a:while(1){ha=ga+1|0;ia=a[u+ha|0]|0;ka=ia&255;b:do{switch(ma|0){case 192:{if((ea&64|0)==0){t=59;break b}fa=fa+ -6|0;break};case 248:{if((ea&128|0)!=0){t=59;break b}fa=fa+ -6|0;break};case 201:{t=59;break};case 250:{if((ea&128|0)==0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 196:{if((ea&64|0)==0){t=68}else{t=6}break};case 204:{if((ea&64|0)==0){t=6}else{t=68}break};case 24:{ha=ga+2+(ia<<24>>24)|0;break};case 210:{if((ea&1|0)!=0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 208:{if((ea&1|0)==0){t=59;break b}fa=fa+ -6|0;break};case 216:{if((ea&1|0)!=0){t=59;break b}fa=fa+ -6|0;break};case 240:{if((ea&128|0)==0){t=59;break b}fa=fa+ -6|0;break};case 212:{if((ea&1|0)==0){t=68}else{t=6}break};case 220:{if((ea&1|0)==0){t=6}else{t=68}break};case 58:{a[y]=a[u+((d[u+(ga+2)|0]|0)<<8|ka)|0]|0;ha=ga+3|0;break};case 127:case 109:case 100:case 91:case 82:case 73:case 64:case 0:{break};case 218:{if((ea&1|0)==0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 16:{na=(d[z]|0)+ -1|0;a[z]=na;ha=ga+2|0;if((na|0)==0){t=4;break b}ha=(ia<<24>>24)+ha|0;break};case 242:{if((ea&128|0)!=0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 234:{if((ea&4|0)==0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 46:{a[A]=ia;ha=ga+2|0;break};case 56:{ha=ga+2|0;if((ea&1|0)==0){t=4;break b}ha=(ia<<24>>24)+ha|0;break};case 211:{ha=d[y]|0;fc(f,(c[B>>2]|0)+fa|0,ha<<8|ka,ha);ha=ga+2|0;break};case 8:{na=a[C]|0;a[C]=a[y]|0;a[y]=na;na=d[D]|0;a[D]=ea;ea=na;break};case 32:{ha=ga+2|0;if((ea&64|0)!=0){t=4;break b}ha=(ia<<24>>24)+ha|0;break};case 40:{ha=ga+2|0;if((ea&64|0)==0){t=4;break b}ha=(ia<<24>>24)+ha|0;break};case 202:{if((ea&64|0)==0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 226:{if((ea&4|0)!=0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 195:{ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 194:{if((ea&64|0)!=0){t=7;break b}ha=(d[u+(ga+2)|0]|0)<<8|ka;break};case 200:{if((ea&64|0)!=0){t=59;break b}fa=fa+ -6|0;break};case 62:{a[y]=ia;ha=ga+2|0;break};case 48:{ha=ga+2|0;if((ea&1|0)!=0){t=4;break b}ha=(ia<<24>>24)+ha|0;break};case 233:{ha=e[E>>1]|0;break};case 224:{if((ea&4|0)==0){t=59;break b}fa=fa+ -6|0;break};case 232:{if((ea&4|0)!=0){t=59;break b}fa=fa+ -6|0;break};case 60:case 44:case 36:case 28:case 20:case 12:case 4:{t=F+(ma>>>3^1)|0;ja=(a[t]|0)+1<<24>>24;a[t]=ja;ja=ja&255;t=96;break};case 205:{t=68;break};case 51:{ba=ba+1&65535;break};case 125:case 124:case 123:case 122:case 121:case 120:case 111:case 108:case 107:case 106:case 105:case 104:case 103:case 101:case 99:case 98:case 97:case 96:case 95:case 93:case 92:case 90:case 89:case 88:case 87:case 85:case 84:case 83:case 81:case 80:case 79:case 77:case 76:case 75:case 74:case 72:case 71:case 69:case 68:case 67:case 66:case 65:{a[F+(ma>>>3&7^1)|0]=a[F+(ma&7^1)|0]|0;break};case 228:{if((ea&4|0)==0){t=68}else{t=6}break};case 190:{ka=d[u+(e[E>>1]|0)|0]|0;t=87;break};case 59:{ba=ba+65535&65535;break};case 252:{if((ea&128|0)==0){t=6}else{t=68}break};case 166:{ka=d[u+(e[E>>1]|0)|0]|0;t=107;break};case 167:case 165:case 164:case 163:case 162:case 161:case 160:{ka=d[G+(ma^1)|0]|0;t=107;break};case 135:case 133:case 132:case 131:case 130:case 129:case 128:case 151:case 149:case 148:case 147:case 146:case 145:case 144:{ea=ea&-2;t=82;break};case 225:case 209:case 193:{b[H+(ma>>>3)>>1]=(d[u+(ba+1)|0]|0)<<8|(d[u+ba|0]|0);ba=ba+2&65535;break};case 191:case 189:case 188:case 187:case 186:case 185:case 184:{ka=d[I+(ma^1)|0]|0;t=87;break};case 57:{ga=ba;t=89;break};case 53:{t=u+(e[E>>1]|0)|0;ja=(d[t]|0)+ -1|0;a[t]=ja;t=99;break};case 238:{ha=ga+2|0;t=115;break};case 255:{if(!(ga>>>0>65535)){t=71;break b}ha=ga&65535;fa=fa+ -11|0;break};case 134:case 150:{ea=ea&-2;t=78;break};case 254:{ha=ga+2|0;t=87;break};case 182:{ka=d[u+(e[E>>1]|0)|0]|0;t=111;break};case 143:case 141:case 140:case 139:case 138:case 137:case 136:case 159:case 157:case 156:case 155:case 154:case 153:case 152:{t=82;break};case 119:case 117:case 116:case 115:case 114:case 113:case 112:{a[u+(e[E>>1]|0)|0]=a[J+(ma^1)|0]|0;break};case 241:{ea=d[u+ba|0]|0;a[y]=a[u+(ba+1)|0]|0;ba=ba+2&65535;break};case 229:case 213:case 197:{la=e[H+(ma>>>3)>>1]|0;t=74;break};case 236:{if((ea&4|0)==0){t=6}else{t=68}break};case 39:{ia=a[y]|0;ga=ia&255;ia=(ia&255)>153|ea;ja=0-(ia&1)&96;if((ea&16|0)==0){if((ga&14)>>>0>9){t=92}}else{t=92}if((t|0)==92){t=0;ja=ja|6}na=((ea&2|0)==0?ja:0-ja|0)+ga|0;ea=d[f+(na&255)|0]|0|ia&3|(ga^na)&16;a[y]=na;break};case 183:case 181:case 180:case 179:case 178:case 177:case 176:{ka=d[K+(ma^1)|0]|0;t=111;break};case 38:case 30:case 22:case 14:case 6:{a[F+(ma>>>3^1)|0]=ia;ha=ga+2|0;break};case 198:case 214:{ea=ea&-2;t=80;break};case 230:{ha=ga+2|0;t=107;break};case 174:{ka=d[u+(e[E>>1]|0)|0]|0;t=115;break};case 175:case 173:case 172:case 171:case 170:case 169:case 168:{ka=d[L+(ma^1)|0]|0;t=115;break};case 244:{if((ea&128|0)==0){t=68}else{t=6}break};case 245:{la=((d[y]|0)<<8)+ea|0;t=74;break};case 54:{a[u+(e[E>>1]|0)|0]=ia;ha=ga+2|0;break};case 206:case 222:{t=80;break};case 41:case 25:case 9:{ga=e[F+((ma>>>3)+ -1)>>1]|0;t=89;break};case 33:case 17:case 1:{b[F+(ma>>>3)>>1]=(d[u+(ga+2)|0]|0)<<8|ka;ha=ga+3|0;break};case 42:{ha=(d[u+(ga+2)|0]|0)<<8|ka;b[E>>1]=(d[u+(ha+1)|0]|0)<<8|(d[u+ha|0]|0);ha=ga+3|0;break};case 49:{ha=ga+3|0;ba=(d[u+(ga+2)|0]|0)<<8|ka;break};case 142:case 158:{t=78;break};case 247:case 239:case 231:case 223:case 215:case 207:case 199:{t=71;break};case 35:case 19:case 3:{na=F+(ma>>>3)|0;b[na>>1]=(b[na>>1]|0)+1<<16>>16;break};case 61:case 45:case 37:case 29:case 21:case 13:case 5:{t=F+(ma>>>3^1)|0;ja=(a[t]|0)+ -1<<24>>24;a[t]=ja;ja=ja&255;t=99;break};case 52:{t=u+(e[E>>1]|0)|0;ja=(d[t]|0)+1|0;a[t]=ja;t=96;break};case 43:case 27:case 11:{na=F+((ma>>>3)+ -1)|0;b[na>>1]=(b[na>>1]|0)+ -1<<16>>16;break};case 246:{ha=ga+2|0;t=111;break};case 126:case 110:case 102:case 94:case 86:case 78:case 70:{a[M+(ma>>>3^1)|0]=a[u+(e[E>>1]|0)|0]|0;break};case 50:{a[u+((d[u+(ga+2)|0]|0)<<8|ka)|0]=a[y]|0;ha=ga+3|0;break};case 251:{a[N]=1;a[O]=1;break};case 18:case 2:{a[u+(e[F+(ma>>>3)>>1]|0)|0]=a[y]|0;break};case 15:{ma=d[y]|0;na=ma>>>1;a[y]=ma<<7|na;ea=ma&1|ea&196|na&40;break};case 55:{ea=ea&196|a[y]&40|1;break};case 235:{na=b[E>>1]|0;b[E>>1]=b[P>>1]|0;b[P>>1]=na;break};case 7:{na=d[y]|0;na=na<<1|na>>>7;a[y]=na;ea=na&41|ea&196;break};case 34:{ha=(d[u+(ga+2)|0]|0)<<8|ka;na=b[E>>1]|0;a[u+(ha+1)|0]=(na&65535)>>>8;a[u+ha|0]=na;ha=ga+3|0;break};case 203:{ha=ga+2|0;switch(ka|0){case 30:{ga=e[E>>1]|0;fa=fa+7|0;t=159;break b};case 7:case 5:case 4:case 3:case 2:case 1:case 0:{na=F+(ka^1)|0;ma=d[na]|0;ea=ma>>>7;ma=ma<<1&254|ea;ea=d[f+ma|0]|0|ea;a[na]=ma;break b};case 23:case 21:case 20:case 19:case 18:case 17:case 16:{na=Q+(ka^1)|0;ma=(d[na]|0)<<1|ea&1;ea=d[f+ma|0]|0;a[na]=ma;break b};case 39:case 37:case 36:case 35:case 34:case 33:case 32:{na=R+(ka^1)|0;ma=(d[na]|0)<<1;ea=d[f+ma|0]|0;a[na]=ma;break b};case 22:{ga=e[E>>1]|0;fa=fa+7|0;t=147;break b};case 54:{ea=e[E>>1]|0;fa=fa+7|0;t=153;break b};case 255:case 253:case 252:case 251:case 250:case 249:case 248:case 247:case 245:case 244:case 243:case 242:case 241:case 240:case 239:case 237:case 236:case 235:case 234:case 233:case 232:case 231:case 229:case 228:case 227:case 226:case 225:case 224:case 223:case 221:case 220:case 219:case 218:case 217:case 216:case 215:case 213:case 212:case 211:case 210:case 209:case 208:case 207:case 205:case 204:case 203:case 202:case 201:case 200:case 199:case 197:case 196:case 195:case 194:case 193:case 192:{na=F+(ka&7^1)|0;a[na]=d[na]|0|1<<(ka>>>3&7);break b};case 63:case 61:case 60:case 59:case 58:case 57:case 56:{na=S+(ka^1)|0;ea=d[na]|0;ma=ea>>>1;ea=ea&1|(d[f+ma|0]|0);a[na]=ma;break b};case 31:case 29:case 28:case 27:case 26:case 25:case 24:{na=H+(ka^1)|0;la=d[na]|0;ma=la>>>1|ea<<7&128;ea=d[f+ma|0]|0|la&1;a[na]=ma;break b};case 62:{ea=e[E>>1]|0;fa=fa+7|0;t=165;break b};case 38:{ea=e[E>>1]|0;fa=fa+7|0;t=150;break b};case 46:{ea=e[E>>1]|0;fa=fa+7|0;t=162;break b};case 126:case 118:case 110:case 102:case 94:case 86:case 78:case 70:{ea=ea&1;fa=fa+4|0;ga=d[u+(e[E>>1]|0)|0]|0;break};case 47:case 45:case 44:case 43:case 42:case 41:case 40:{na=T+(ka^1)|0;ea=d[na]|0;ma=ea&128|ea>>>1;ea=ea&1|(d[f+ma|0]|0);a[na]=ma;break b};case 127:case 125:case 124:case 123:case 122:case 121:case 120:case 119:case 117:case 116:case 115:case 114:case 113:case 112:case 111:case 109:case 108:case 107:case 106:case 105:case 104:case 103:case 101:case 100:case 99:case 98:case 97:case 96:case 95:case 93:case 92:case 91:case 90:case 89:case 88:case 87:case 85:case 84:case 83:case 82:case 81:case 80:case 79:case 77:case 76:case 75:case 74:case 73:case 72:case 71:case 69:case 68:case 67:case 66:case 65:case 64:{ga=d[F+(ka&7^1)|0]|0;ea=ga&40|ea&1;break};case 6:{ea=e[E>>1]|0;fa=fa+7|0;t=144;break b};case 55:case 53:case 52:case 51:case 50:case 49:case 48:{na=U+(ka^1)|0;ma=(d[na]|0)<<1|1;ea=d[f+ma|0]|0;a[na]=ma;break b};case 14:{ea=e[E>>1]|0;fa=fa+7|0;t=156;break b};case 15:case 13:case 12:case 11:case 10:case 9:case 8:{na=M+(ka^1)|0;ea=d[na]|0;ma=ea<<7&128|ea>>>1;ea=ea&1|(d[f+ma|0]|0);a[na]=ma;break b};case 254:case 246:case 238:case 230:case 222:case 214:case 206:case 198:case 190:case 182:case 174:case 166:case 158:case 150:case 142:case 134:{ga=u+(e[E>>1]|0)|0;ia=1<<(ka>>>3&7);a[ga]=(d[ga]|0|ia)^((ka&64|0)==0?ia:0);fa=fa+7|0;break b};case 191:case 189:case 188:case 187:case 186:case 185:case 184:case 183:case 181:case 180:case 179:case 178:case 177:case 176:case 175:case 173:case 172:case 171:case 170:case 169:case 168:case 167:case 165:case 164:case 163:case 162:case 161:case 160:case 159:case 157:case 156:case 155:case 154:case 153:case 152:case 151:case 149:case 148:case 147:case 146:case 145:case 144:case 143:case 141:case 140:case 139:case 138:case 137:case 136:case 135:case 133:case 132:case 131:case 130:case 129:case 128:{na=F+(ka&7^1)|0;a[na]=(d[na]|0)&(1<<(ka>>>3&7)^255);break b};default:{t=173;break a}}na=ga&1<<(ka>>>3&7);ea=ea|na&128|(na+32767|0)>>>8&68|16;break};case 237:{ha=ga+2|0;fa=((d[35712+ka|0]|0)>>>4)+fa|0;switch(ka|0){case 122:case 114:{ga=ba;t=176;break};case 120:case 112:case 104:case 96:case 88:case 80:case 72:case 64:{na=gc(f,e[v>>1]|0)|0;a[M+(ka>>>3^1)|0]=na;ea=d[f+na|0]|0|ea&1;break b};case 113:{a[W]=0;t=179;break};case 121:case 105:case 97:case 89:case 81:case 73:case 65:{t=179;break};case 83:case 67:{ia=e[M+(ka>>>3)>>1]|0;t=181;break};case 91:case 75:{ha=(d[u+(ga+3)|0]|0)<<8|(d[u+ha|0]|0);b[F+((ka>>>3)+ -9)>>1]=(d[u+(ha+1)|0]|0)<<8|(d[u+ha|0]|0);ha=ga+4|0;break b};case 123:{ba=(d[u+(ga+3)|0]|0)<<8|(d[u+ha|0]|0);ha=ga+4|0;ba=(d[u+(ba+1)|0]|0)<<8|(d[u+ba|0]|0);break b};case 106:case 90:case 74:case 98:case 82:case 66:{ga=e[F+(ka>>>3&6)>>1]|0;t=176;break};case 103:{ma=c[E>>2]|0;la=u+(ma&65535)|0;na=d[la]|0;ma=ma>>>16;a[la]=ma<<4|na>>>4;na=ma&240|na&15;ea=d[f+na|0]|0|ea&1;a[y]=na;break b};case 111:{ma=c[E>>2]|0;la=u+(ma&65535)|0;na=d[la]|0;ma=ma>>>16;a[la]=ma&15|na<<4;na=ma&240|na>>>4;ea=d[f+na|0]|0|ea&1;a[y]=na;break b};case 115:{ia=ba;t=181;break};case 184:case 168:{ja=-1;t=191;break};case 185:case 169:{ja=-1;t=188;break};case 124:case 116:case 108:case 100:case 92:case 84:case 76:case 68:{ja=d[y]|0;a[y]=0;ea=ea&-2;ka=16;t=83;break b};case 95:{ga=Z;aa=1;t=200;break};case 176:case 160:{ja=1;t=191;break};case 110:case 102:case 78:case 70:{a[X]=0;break b};case 177:case 161:{ja=1;t=188;break};case 118:case 86:{a[X]=1;break b};case 186:case 170:{ea=-1;t=196;break};case 71:{a[Y]=a[y]|0;break b};case 126:case 94:{a[X]=2;break b};case 79:{a[Z]=a[y]|0;aa=1;break b};case 187:case 171:{ea=-1;t=194;break};case 87:{ga=Y;t=200;break};case 178:case 162:{ea=1;t=196;break};case 179:case 163:{ea=1;t=194;break};case 125:case 117:case 109:case 101:case 93:case 85:case 77:case 69:{a[N]=a[O]|0;t=59;break b};default:{aa=1;break b}}if((t|0)==176){t=0;ea=ga+(ea&1)|0;ja=ka>>>2&2;ia=e[E>>1]|0;na=((ja|0)==0?0-ea|0:ea)+ia|0;ea=ia^ga^na;ea=(na>>>16&1|ja|na>>>8&168|ea>>>8&16|(ea+32768|0)>>>14&4)^2;na=na&65535;b[E>>1]=na;ea=na<<16>>16==0?ea|64:ea;break b}else if((t|0)==179){t=0;fc(f,(c[B>>2]|0)+fa|0,e[v>>1]|0,d[M+(ka>>>3^1)|0]|0);break b}else if((t|0)==181){t=0;ha=(d[u+(ga+3)|0]|0)<<8|(d[u+ha|0]|0);a[u+(ha+1)|0]=ia>>>8;a[u+ha|0]=ia;ha=ga+4|0;break b}else if((t|0)==188){t=0;na=c[E>>2]|0;b[E>>1]=na+ja;la=a[u+(na&65535)|0]|0;na=na>>>16;ka=(na&255)-(la&255)|0;la=(na&255^la)&16^ka&144;ja=(ka&255)<<24>>24==0?66:2;na=ka-(la>>>4&1)|0;ea=la|ea&1|ja|na&8|na<<4&32;na=(b[v>>1]|0)+ -1<<16>>16;b[v>>1]=na;if(na<<16>>16==0){break b}ia=(ja&64|0)!=0|(ia&255)<176;ea=ea|4;ha=ia?ha:ga;fa=ia?fa:fa+5|0;break b}else if((t|0)==191){t=0;ma=c[E>>2]|0;b[E>>1]=ma+ja;na=a[u+(ma&65535)|0]|0;la=e[P>>1]|0;b[P>>1]=la+ja;a[u+la|0]=na;na=(ma>>>16&255)+(na&255)|0;ea=na&8|ea&193|na<<4&32;na=(b[v>>1]|0)+ -1<<16>>16;b[v>>1]=na;if(na<<16>>16==0){break b}ia=(ia&255)<176;ea=ea|4;ha=ia?ha:ga;fa=ia?fa:fa+5|0;break b}else if((t|0)==194){t=0;ja=e[E>>1]|0;b[E>>1]=ja+ea;ja=d[u+ja|0]|0;na=(a[z]|0)+ -1<<24>>24;a[z]=na;ea=a[f+(na&255)|0]&251|ja>>>6&2;ia=na<<24>>24!=0&(ia&255)>175;fa=ia?fa+5|0:fa;fc(f,fa+(c[B>>2]|0)|0,e[v>>1]|0,ja);ha=ia?ga:ha;break b}else if((t|0)==196){t=0;na=e[E>>1]|0;b[E>>1]=na+ea;ma=gc(f,e[v>>1]|0)|0;la=(a[z]|0)+ -1<<24>>24;a[z]=la;ea=a[f+(la&255)|0]&251|ma>>>6&2;ia=la<<24>>24!=0&(ia&255)>175;a[u+na|0]=ma;ha=ia?ga:ha;fa=ia?fa+5|0:fa;break b}else if((t|0)==200){t=0;na=a[ga]|0;a[y]=na;ea=a[f+(na&255)|0]&251|ea&1|(d[O]|0)<<2&4;break b}break};case 227:{ma=u+ba|0;ka=u+(ba+1)|0;na=(d[ka]|0)<<8|(d[ma]|0);la=b[E>>1]|0;a[ka]=(la&65535)>>>8;a[ma]=la;b[E>>1]=na;break};case 219:{a[y]=gc(f,(d[y]|0)<<8|ka)|0;ha=ga+2|0;break};case 23:{ma=d[y]|0;na=ma<<1;a[y]=na|ea&1;ea=ma>>>7|ea&196|na&40;break};case 217:{na=b[x>>1]|0;ma=c[k>>2]|0;b[x>>1]=ma;b[v>>1]=na;na=b[w>>1]|0;b[w>>1]=ma>>>16;b[P>>1]=na;na=b[V>>1]|0;b[V>>1]=b[E>>1]|0;b[E>>1]=na;break};case 249:{ba=e[E>>1]|0;break};case 243:{a[N]=0;a[O]=0;break};case 26:case 10:{a[y]=a[u+(e[F+((ma>>>3)+ -1)>>1]|0)|0]|0;break};case 47:{na=~(d[y]|0);a[y]=na;ea=ea&197|na&40|18;break};case 31:{ma=d[y]|0;na=ma>>>1;a[y]=na|ea<<7;ea=ma&1|ea&196|na&40;break};case 63:{ea=(ea<<4&16|ea&197|a[y]&40)^1;break};case 253:{la=ca;t=206;break};case 221:{la=da;t=206;break};case 118:{t=265;break a};default:{t=264;break a}}}while(0);c:do{if((t|0)==4){t=0;fa=fa+ -5|0}else if((t|0)==6){fa=fa+ -7|0;t=7}else if((t|0)==59){t=0;ha=(d[u+(ba+1)|0]|0)<<8|(d[u+ba|0]|0);ba=ba+2&65535}else if((t|0)==68){t=0;na=ga+3|0;ha=(d[u+(ga+2)|0]|0)<<8|ka;ba=ba+65534&65535;a[u+(ba+1)|0]=na>>>8;a[u+ba|0]=na}else if((t|0)==71){la=ha;ha=ma&56;t=74}else if((t|0)==78){ja=d[u+(e[E>>1]|0)|0]|0;ka=ma;t=83}else if((t|0)==80){ja=ka;ka=ma;ha=ga+2|0;t=83}else if((t|0)==82){ja=d[F+(ma&7^1)|0]|0;ka=ma;t=83}else if((t|0)==89){t=0;ma=e[E>>1]|0;na=ma+ga|0;b[E>>1]=na;ea=na>>>16|ea&196|na>>>8&40|(ma^ga^na)>>>8&16}else if((t|0)==206){t=0;ia=ga+2|0;ma=a[u+ia|0]|0;na=ma&255;fa=(a[35712+ka|0]&15)+fa|0;switch(ka|0){case 109:case 100:{ha=ia;break c};case 229:{ha=ia;t=74;break c};case 25:case 9:{ga=e[F+((ka>>>3)+ -1)>>1]|0;t=215;break};case 125:case 93:case 85:case 77:case 69:{a[M+(ka>>>3^1)|0]=la;ha=ia;break c};case 173:{ka=la&255;ha=ia;t=115;break c};case 133:case 149:{ea=ea&-2;t=212;break};case 165:{ka=la&255;ha=ia;t=107;break c};case 172:{ka=la>>>8;ha=ia;t=115;break c};case 57:{ga=ba;t=215;break};case 190:{ka=d[u+((ma<<24>>24)+la&65535)|0]|0;ha=ga+3|0;t=87;break c};case 38:{ha=ga+3|0;t=237;break};case 101:{na=la&255;ha=ia;t=237;break};case 249:{ha=ia;ba=la;break c};case 34:{ha=(d[u+(ga+3)|0]|0)<<8|na;a[u+(ha+1)|0]=la>>>8;a[u+ha|0]=la;ha=ga+4|0;break c};case 141:case 157:{t=212;break};case 182:{ka=d[u+((ma<<24>>24)+la&65535)|0]|0;ha=ga+3|0;t=111;break c};case 181:{ka=la&255;ha=ia;t=111;break c};case 108:{na=la>>>8;ha=ia;t=241;break};case 103:case 99:case 98:case 97:case 96:{na=d[$+(ka^1)|0]|0;ha=ia;t=237;break};case 111:case 107:case 106:case 105:case 104:{na=d[_+(ka^1)|0]|0;ha=ia;t=241;break};case 42:{ka=(d[u+(ga+3)|0]|0)<<8|na;ka=(d[u+(ka+1)|0]|0)<<8|(d[u+ka|0]|0);ha=ga+4|0;break};case 33:{ka=(d[u+(ga+3)|0]|0)<<8|na;ha=ga+4|0;break};case 203:{ja=(ma<<24>>24)+la&65535;ia=d[u+(ga+3)|0]|0;ha=ga+4|0;switch(ia|0){case 38:{ea=ja;t=150;break c};case 6:{ea=ja;t=144;break c};case 46:{ea=ja;t=162;break c};case 54:{ea=ja;t=153;break c};case 22:{ga=ja;t=147;break c};case 62:{ea=ja;t=165;break c};case 30:{ga=ja;t=159;break c};case 14:{ea=ja;t=156;break c};case 126:case 118:case 110:case 102:case 94:case 86:case 78:case 70:{na=(d[u+ja|0]|0)&1<<(ia>>>3&7);ea=ea&1|na&128|(na+32767|0)>>>8&68|16;break c};case 254:case 246:case 238:case 230:case 222:case 214:case 206:case 198:case 190:case 182:case 174:case 166:case 158:case 150:case 142:case 134:{ga=u+ja|0;ja=1<<(ia>>>3&7);a[ga]=(d[ga]|0|ja)^((ia&64|0)==0?ja:0);break c};default:{aa=1;break c}}};case 41:{ga=la;t=215;break};case 46:{ha=ga+3|0;t=241;break};case 180:{ka=la>>>8;ha=ia;t=111;break c};case 164:{ka=la>>>8;ha=ia;t=107;break c};case 132:case 148:{ea=ea&-2;t=210;break};case 189:{ka=la&255;ha=ia;t=87;break c};case 174:{ka=d[u+((ma<<24>>24)+la&65535)|0]|0;ha=ga+3|0;t=115;break c};case 119:case 117:case 116:case 115:case 114:case 113:case 112:{ga=J+(ka^1)|0;t=230;break};case 54:{ia=ga+3|0;ga=u+ia|0;t=230;break};case 124:case 92:case 84:case 76:case 68:{a[M+(ka>>>3^1)|0]=la>>>8;ha=ia;break c};case 126:case 110:case 102:case 94:case 86:case 78:case 70:{a[M+(ka>>>3^1)|0]=a[u+((ma<<24>>24)+la&65535)|0]|0;ha=ga+3|0;break c};case 142:case 158:{t=208;break};case 188:{ka=la>>>8;ha=ia;t=87;break c};case 140:case 156:{t=210;break};case 166:{ka=d[u+((ma<<24>>24)+la&65535)|0]|0;ha=ga+3|0;t=107;break c};case 134:case 150:{ea=ea&-2;t=208;break};case 53:{ha=u+((ma<<24>>24)+la&65535)|0;ja=(d[ha]|0)+ -1|0;a[ha]=ja;ha=ga+3|0;t=99;break c};case 36:{ga=la+256&65535;ha=ga>>>8;t=256;break};case 52:{ha=u+((ma<<24>>24)+la&65535)|0;ja=(d[ha]|0)+1|0;a[ha]=ja;ha=ga+3|0;t=96;break c};case 37:{ga=la+65280&65535;ha=ga>>>8;t=259;break};case 43:{ka=la+65535&65535;ha=ia;break};case 225:{ka=(d[u+(ba+1)|0]|0)<<8|(d[u+ba|0]|0);ha=ia;ba=ba+2&65535;break};case 45:{ga=la+255&255;ha=ga;ga=ga|la&65280;t=259;break};case 227:{ha=u+ba|0;na=u+(ba+1)|0;ka=(d[na]|0)<<8|(d[ha]|0);a[na]=la>>>8;a[ha]=la;ha=ia;break};case 44:{ga=la+1&255;ha=ga;ga=ga|la&65280;t=256;break};case 233:{ha=la;break c};case 35:{ka=la+1&65535;ha=ia;break};default:{aa=1;break c}}if((t|0)==208){ja=d[u+((ma<<24>>24)+la&65535)|0]|0;ha=ga+3|0;t=83;break}else if((t|0)==210){ja=la>>>8;ha=ia;t=83;break}else if((t|0)==212){ja=la&255;ha=ia;t=83;break}else if((t|0)==215){t=0;ka=ga+la|0;ea=ka>>>16|ea&196|ka>>>8&40|(ga^la^ka)>>>8&16;ka=ka&65535;ha=ia}else if((t|0)==230){t=0;a[u+((ma<<24>>24)+la&65535)|0]=a[ga]|0;ha=ia+1|0;break}else if((t|0)==237){t=0;ka=na<<8|la&255}else if((t|0)==241){t=0;ka=na|la&65280}else if((t|0)==256){t=ja<<24>>24==-35;ja=ha;da=t?ga:da;ca=t?ca:ga;ha=ia;t=96;break}else if((t|0)==259){t=ja<<24>>24==-35;ja=ha;da=t?ga:da;ca=t?ca:ga;ha=ia;t=99;break}ga=ja<<24>>24==-35;da=ga?ka:da;ca=ga?ca:ka}}while(0);if((t|0)==7){t=0;ha=ga+3|0}else if((t|0)==74){t=0;ba=ba+65534&65535;a[u+(ba+1)|0]=la>>>8;a[u+ba|0]=la}else if((t|0)==83){t=0;ea=(ea&1)+ja|0;ga=d[y]|0;ia=ka>>>3&2;na=ga+((ia|0)==0?ea:0-ea|0)|0;ea=ga^ja^na;ea=a[f+(na&511)|0]&251|ia|ea&16|(ea+128|0)>>>6&4;a[y]=na}else if((t|0)==87){t=0;ea=d[y]|0;ga=ea-ka|0;ia=ea^ka;ea=ga>>>8&1|ka&40|ia&16^ga&144|((ga&255)<<24>>24==0?66:2)|((ga^ea)&ia)>>>5&4}else if((t|0)==96){t=0;ea=(ja&15)+31&16|ea&1|a[f+(ja&255)|0]&251;ea=(ja|0)==128?ea|4:ea}else if((t|0)==99){t=0;ea=((ja|0)==127?6:2)|ea&1|(ja&15)+1&16|a[f+(ja&255)|0]&249}else if((t|0)==107){t=0;ea=(d[y]|0)&ka;a[y]=ea;ea=d[f+ea|0]|0|16}else if((t|0)==111){t=0;ea=d[y]|0|ka;a[y]=ea;ea=d[f+(ea&255)|0]|0}else if((t|0)==115){t=0;ea=(d[y]|0)^ka;a[y]=ea;ea=d[f+(ea&255)|0]|0}else if((t|0)==144){t=0;na=u+ea|0;ma=d[na]|0;ea=ma>>>7;ma=ma<<1&254|ea;ea=d[f+ma|0]|0|ea;a[na]=ma}else if((t|0)==147){t=0;na=u+ga|0;ma=(d[na]|0)<<1|ea&1;ea=d[f+ma|0]|0;a[na]=ma}else if((t|0)==150){t=0;na=u+ea|0;ma=(d[na]|0)<<1;ea=d[f+ma|0]|0;a[na]=ma}else if((t|0)==153){t=0;na=u+ea|0;ma=(d[na]|0)<<1|1;ea=d[f+ma|0]|0;a[na]=ma}else if((t|0)==156){t=0;na=u+ea|0;ea=d[na]|0;ma=ea<<7&128|ea>>>1;ea=ea&1|(d[f+ma|0]|0);a[na]=ma}else if((t|0)==159){t=0;na=u+ga|0;la=d[na]|0;ma=la>>>1|ea<<7&128;ea=d[f+ma|0]|0|la&1;a[na]=ma}else if((t|0)==162){t=0;na=u+ea|0;ea=d[na]|0;ma=ea&128|ea>>>1;ea=ea&1|(d[f+ma|0]|0);a[na]=ma}else if((t|0)==165){t=0;na=u+ea|0;ea=d[na]|0;ma=ea>>>1;ea=ea&1|(d[f+ma|0]|0);a[na]=ma}ja=a[u+ha|0]|0;ma=ja&255;na=d[35400+ma|0]|0;ia=na+fa|0;if((ia|0)<0|(ia|0)<(na|0)){ga=ha;fa=ia}else{t=266;break}}if((t|0)==173){za(35656,35664,1025,35704)}else if((t|0)==264){za(35656,35664,1648,35704)}else if((t|0)==265){ia=W;ha=ea;ma=da;la=ca;ja=ga;ga=fa&3;ka=ba;na=aa;c[q>>2]=ga;ha=ha&255;a[ia]=ha;ma=ma&65535;b[p>>1]=ma;la=la&65535;b[o>>1]=la;ka=ka&65535;b[g>>1]=ka;ja=ja&65535;b[m>>1]=ja;ja=k;ka=ja;ka=c[ka>>2]|0;ja=ja+4|0;ja=c[ja>>2]|0;la=r;ma=la;a[ma]=ka;a[ma+1|0]=ka>>8;a[ma+2|0]=ka>>16;a[ma+3|0]=ka>>24;la=la+4|0;a[la]=ja;a[la+1|0]=ja>>8;a[la+2|0]=ja>>16;a[la+3|0]=ja>>24;la=j;ja=la;ja=c[ja>>2]|0;la=la+4|0;la=c[la>>2]|0;ma=n;ka=ma;c[ka>>2]=ja;ma=ma+4|0;c[ma>>2]=la;c[h>>2]=s;i=l;return na|0}else if((t|0)==266){c[q>>2]=fa;ka=ea&255;a[W]=ka;ka=da&65535;b[p>>1]=ka;ka=ca&65535;b[o>>1]=ka;ka=ba&65535;b[g>>1]=ka;ka=ha&65535;b[m>>1]=ka;ka=k;la=ka;la=c[la>>2]|0;ka=ka+4|0;ka=c[ka>>2]|0;ma=r;na=ma;a[na]=la;a[na+1|0]=la>>8;a[na+2|0]=la>>16;a[na+3|0]=la>>24;ma=ma+4|0;a[ma]=ka;a[ma+1|0]=ka>>8;a[ma+2|0]=ka>>16;a[ma+3|0]=ka>>24;ma=j;ka=ma;ka=c[ka>>2]|0;ma=ma+4|0;ma=c[ma>>2]|0;na=n;la=na;c[la>>2]=ka;na=na+4|0;c[na>>2]=ma;c[h>>2]=s;i=l;return aa|0}return 0}function Wb(a){a=a|0;Ka(a|0)|0;ta()}function Xb(a){a=a|0;var b=0;b=i;Ic(a);Al(a);i=b;return}function Yb(a){a=a|0;var b=0;b=i;Ic(a);i=b;return}function Zb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;_b(a+900|0,b,c);i=d;return 0}function _b(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;h=b+528|0;j=a+8|0;k=c[j>>2]|0;g=e<<2;l=k+g|0;e=a;a=a+4|0;m=c[e>>2]|0;n=l-m|0;m=(c[a>>2]|0)-m|0;if(n>>>0>(m+ -2|0)>>>0){za(36488,36544,52,36584)}l=((d[l]|0)<<8|(d[k+(g|1)|0]|0))<<16>>16;do{if((l|0)==0){k=0}else{if((l+n|0)>>>0>(m+ -1|0)>>>0){k=0;break}k=k+(l+g)|0}}while(0);Ne(h,k);l=c[j>>2]|0;n=g|2;o=l+n|0;h=c[e>>2]|0;j=h;m=o-j|0;j=(c[a>>2]|0)-j|0;k=j+ -2|0;if(m>>>0>k>>>0){za(36488,36544,52,36584)}g=((d[o]|0)<<8|(d[l+(g|3)|0]|0))<<16>>16;do{if((g|0)!=0){if((g+m|0)>>>0>(j+ -6|0)>>>0){break}g=g+n|0;if((l+g|0)==0){break}c[b+4>>2]=((d[l+(g+4)|0]|0)<<8|(d[l+(g+5)|0]|0))*20}}while(0);g=b+784|0;if(k>>>0<12){za(36488,36544,52,36584)}k=((d[h+12|0]|0)<<8|(d[h+13|0]|0))<<16>>16;do{if((k|0)==0){h=0}else{if((k+12|0)>>>0>(j+ -1|0)>>>0){h=0;break}h=h+k+12|0}}while(0);Ne(g,h);b=b+1296|0;e=c[e>>2]|0;a=(c[a>>2]|0)-e|0;if((a+ -2|0)>>>0<14){za(36488,36544,52,36584)}g=((d[e+14|0]|0)<<8|(d[e+15|0]|0))<<16>>16;if((g|0)==0){o=0;Ne(b,o);i=f;return}if((g+14|0)>>>0>(a+ -1|0)>>>0){o=0;Ne(b,o);i=f;return}o=e+g+14|0;Ne(b,o);i=f;return}function $b(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,j=0;f=i;c[a+900>>2]=b;c[a+904>>2]=b+e;do{if((e|0)<20){e=c[10038]|0}else{if((Jl(b,36648,8)|0)!=0){e=c[10038]|0;break}g=(d[b+16|0]|0)<<2;if((e+ -2|0)>>>0<18){za(36488,36544,52,36584)}j=((d[b+18|0]|0)<<8|(d[b+19|0]|0))<<16>>16;do{if((j|0)==0){e=0}else{j=j+18|0;if(j>>>0>(e+ -4-g|0)>>>0){e=0;break}e=b+j|0}}while(0);c[a+908>>2]=e;e=(e|0)==0?36664:0}}while(0);if((e|0)!=0){j=e;i=f;return j|0}j=(d[b+16|0]|0)+1|0;c[a+12>>2]=j;c[a+8>>2]=j;if((d[b+8|0]|0)>2){c[a+16>>2]=36160}c[a+232>>2]=4;Fc(a+67464|0,+h[a+248>>3]*.000915032679738562);j=Nc(a,3546900)|0;i=f;return j|0}function ac(a,b){a=a|0;b=b|0;var c=0;c=i;Ec(a+67464|0,b);i=c;return}function bc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;e=i;if((b|0)>2){c[a+920>>2]=d;i=e;return}if(!(b>>>0<3)){za(36600,36440,86,36632)}c[a+(b<<4)+67004>>2]=d;i=e;return}function cc(a,b){a=a|0;b=+b;c[a+912>>2]=~~(+((c[a+324>>2]|0)/50|0|0)/b);i=i;return}function dc(f,g){f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;k=i;j=f;l=Oc(j,g)|0;if((l|0)!=0){z=l;i=k;return z|0}l=f+1198|0;Pl(l|0,-55,256)|0;Pl(f+1454|0,-1,16128)|0;Pl(f+17582|0,0,49152)|0;Pl(f+942|0,-1,256)|0;m=f+66734|0;Pl(m|0,-1,256)|0;n=c[f+908>>2]|0;v=g<<2;u=v|2;w=n+u|0;p=f+900|0;g=f+904|0;t=c[p>>2]|0;q=w-t|0;r=(c[g>>2]|0)-t|0;s=r+ -2|0;if(q>>>0>s>>>0){za(36488,36544,52,36584)}v=((d[w]|0)<<8|(d[n+(v|3)|0]|0))<<16>>16;if((v|0)==0){z=36184;i=k;return z|0}if((v+q|0)>>>0>(r+ -14|0)>>>0){z=36184;i=k;return z|0}v=v+u|0;if((n+v|0)==0){z=36184;i=k;return z|0}u=v+10|0;w=n+u|0;q=w-t|0;if(q>>>0>s>>>0){za(36488,36544,52,36584)}w=((d[w]|0)<<8|(d[n+(v+11)|0]|0))<<16>>16;if((w|0)==0){z=36184;i=k;return z|0}if((w+q|0)>>>0>(r+ -6|0)>>>0){z=36184;i=k;return z|0}q=w+u|0;w=n+q|0;if((w|0)==0){z=36184;i=k;return z|0}u=v+12|0;x=n+u|0;t=x-t|0;if(t>>>0>s>>>0){za(36488,36544,52,36584)}s=((d[x]|0)<<8|(d[n+(v+13)|0]|0))<<16>>16;if((s|0)==0){z=36184;i=k;return z|0}if((s+t|0)>>>0>(r+ -8|0)>>>0){z=36184;i=k;return z|0}r=s+u|0;u=n+r|0;if((u|0)==0){z=36184;i=k;return z|0}Ub(f+336|0,l);b[f+870>>1]=(d[w]|0)<<8|(d[n+(q+1)|0]|0);w=a[n+(v+8)|0]|0;y=f+876|0;a[f+881|0]=w;a[f+879|0]=w;a[f+877|0]=w;a[f+882|0]=w;w=a[n+(v+9)|0]|0;t=f+880|0;a[t]=w;a[f+878|0]=w;a[y]=w;a[f+883|0]=w;w=y;w=e[w>>1]|e[w+2>>1]<<16;y=y+4|0;y=e[y>>1]|e[y+2>>1]<<16;z=f+884|0;x=z;b[x>>1]=w;b[x+2>>1]=w>>>16;z=z+4|0;b[z>>1]=y;b[z+2>>1]=y>>>16;t=b[t>>1]|0;b[f+874>>1]=t;b[f+872>>1]=t;t=(d[u]|0)<<8|(d[n+(r+1)|0]|0);if((t|0)==0){z=36184;i=k;return z|0}r=(d[n+(q+2)|0]|0)<<8|(d[n+(q+3)|0]|0);r=(r|0)==0?t:r;s=f+16|0;while(1){v=(d[u+2|0]|0)<<8|(d[u+3|0]|0);y=u+4|0;if((v+t|0)>>>0>65536){c[s>>2]=36208;v=65536-t|0}x=c[p>>2]|0;z=y-x|0;w=c[g>>2]|0;x=w-x|0;if(z>>>0>(x+ -2|0)>>>0){o=22;break}y=((d[y]|0)<<8|(d[u+5|0]|0))<<16>>16;do{if((y|0)==0){y=0}else{if((y+z|0)>>>0>x>>>0){y=0;break}y=u+(y+4)|0}}while(0);x=u+6|0;w=w-y|0;if(v>>>0>w>>>0){c[s>>2]=36232;v=w}Nl(f+t+1198|0,y|0,v|0)|0;if(((c[g>>2]|0)-x|0)<8){o=29;break}t=(d[x]|0)<<8|(d[u+7|0]|0);if((t|0)==0){break}else{u=x}}if((o|0)==22){za(36488,36544,52,36584)}else if((o|0)==29){c[s>>2]=36232}p=l+0|0;g=36256|0;o=p+10|0;do{a[p]=a[g]|0;p=p+1|0;g=g+1|0}while((p|0)<(o|0));s=a[n+(q+4)|0]|0;n=a[n+(q+5)|0]|0;if(((s&255)<<8|n&255|0)!=0){p=l+0|0;g=36272|0;o=p+13|0;do{a[p]=a[g]|0;p=p+1|0;g=g+1|0}while((p|0)<(o|0));a[f+1207|0]=n;a[f+1208|0]=s}a[f+1200|0]=r;a[f+1201|0]=r>>>8;a[f+1254|0]=-5;p=m+0|0;g=l+0|0;o=p+128|0;do{a[p]=a[g]|0;p=p+1|0;g=g+1|0}while((p|0)<(o|0));c[f+924>>2]=165;c[f+928>>2]=0;Pb(f+66992|0);c[f+916>>2]=c[f+912>>2];Mc(j,3546900);Jg(f,+h[f+240>>3]);a[f+940|0]=0;a[f+941|0]=0;c[f+936>>2]=0;z=0;i=k;return z|0}function ec(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0,k=0,l=0;j=i;g=b+941|0;k=a[g]|0;do{if(k<<24>>24==0){l=e&65279;if((l|0)==48893){a[b+940|0]=1;e=b+66992|0;l=c[b+932>>2]|0;Rb(e,d);Qb(e,l,f);i=j;return}else if((l|0)==65277){a[b+940|0]=1;c[b+932>>2]=f&15;i=j;return}else{break}}}while(0);if((a[b+940|0]|0)!=0){i=j;return}e=e>>>8;do{if((e|0)==244){c[b+936>>2]=f}else if((e|0)==246){f=f&192;if((f|0)==128){e=b+66992|0;l=c[b+932>>2]|0;k=c[b+936>>2]|0;Rb(e,d);Qb(e,l,k);k=a[g]|0;break}else if((f|0)==192){c[b+932>>2]=c[b+936>>2]&15;break}else{i=j;return}}else{i=j;return}}while(0);if(!(k<<24>>24==0)){i=j;return}a[g]=1;Mc(b,2e6);Jg(b,+h[b+240>>3]);i=j;return}function fc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=b+ -336|0;do{if((e&255|0)==254){if((a[b+605|0]|0)!=0){break}h=b+588|0;e=c[h>>2]|0;f=f&16;j=b+592|0;if((c[j>>2]|0)==(f|0)){i=g;return}c[j>>2]=f;c[h>>2]=0-e;a[b+604|0]=1;f=c[b+584>>2]|0;if((f|0)==0){i=g;return}j=_(c[f>>2]|0,d)|0;Sb(b+67128|0,j+(c[f+4>>2]|0)|0,e,f);i=g;return}}while(0);ec(h,d,e,f);i=g;return}function gc(a,b){a=a|0;b=b|0;i=i;return 255}function hc(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;k=e+336|0;j=e+856|0;s=c[j>>2]|0;c[s+4>>2]=0-(c[s>>2]|0);t=c[f>>2]|0;if((a[e+941|0]|a[e+940|0])<<24>>24==0){t=(t|0)/2|0;c[f>>2]=t}h=e+916|0;if((t|0)>0){r=e+912|0;o=e+892|0;m=e+868|0;n=e+893|0;p=e+870|0;q=e+896|0;l=e+895|0;do{s=c[h>>2]|0;Vb(k,(t|0)<(s|0)?t:s)|0;s=c[j>>2]|0;v=s+4|0;t=c[v>>2]|0;u=c[h>>2]|0;do{if(((c[s>>2]|0)+t|0)>=(u|0)){c[h>>2]=(c[r>>2]|0)+u;if((a[o]|0)==0){t=c[v>>2]|0;break}s=b[m>>1]|0;if((a[e+(s&65535)+1198|0]|0)==118){s=s+1<<16>>16;b[m>>1]=s;s=(s&65535)>>>8&255}else{s=(s&65535)>>>8&255}a[n]=0;a[o]=0;v=(b[p>>1]|0)+ -1<<16>>16;b[p>>1]=v;a[e+(v&65535)+1198|0]=s;v=b[m>>1]&255;s=(b[p>>1]|0)+ -1<<16>>16;b[p>>1]=s;a[e+(s&65535)+1198|0]=v;b[m>>1]=56;s=c[j>>2]|0;v=s+4|0;u=c[v>>2]|0;t=u+12|0;c[v>>2]=t;if((a[q]|0)!=2){break}t=u+18|0;c[v>>2]=t;v=d[l]<<8|255;b[m>>1]=d[e+(v+1&65535)+1198|0]<<8|d[e+v+1198|0]}}while(0);u=(c[s>>2]|0)+t|0;t=c[f>>2]|0;}while((u|0)<(t|0))}else{u=0}c[f>>2]=u;c[h>>2]=(c[h>>2]|0)-u;f=s+4|0;c[f>>2]=(c[f>>2]|0)-u;f=e+67040|0;h=c[f>>2]|0;if((h|0)<(u|0)){Rb(e+66992|0,u);h=c[f>>2]|0}if((h|0)<(u|0)){za(36416,36440,102,36472)}else{c[f>>2]=h-u;i=g;return 0}return 0}function ic(a){a=a|0;i=i;return}function jc(a,b){a=a|0;b=b|0;var d=0;d=i;a=a+316|0;if((c[a>>2]|0)!=0|(b|0)==0){za(36344,36360,45,36400)}else{c[a>>2]=b;i=d;return}}function kc(a,b){a=a|0;b=b|0;i=i;return}function lc(){var a=0,b=0;a=i;b=zl(68280)|0;if((b|0)==0){b=0;i=a;return b|0}Tb(b+336|0);Gc(b);c[b>>2]=35976;Ob(b+66992|0);c[b+920>>2]=0;c[b+4>>2]=36136;c[b+228>>2]=36072;c[b+332>>2]=36120;c[b+284>>2]=6;i=a;return b|0}function mc(){var a=0,b=0,d=0;a=i;b=zl(328)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=36720;c[b+4>>2]=36136;b=d;i=a;return b|0}function nc(a){a=a|0;var b=0;b=i;Eg(a);i=b;return}function oc(a){a=a|0;var b=0;b=i;Eg(a);Al(a);i=b;return}function pc(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0;f=i;c[a+316>>2]=b;c[a+320>>2]=b+e;do{if((e|0)<20){e=c[10038]|0}else{if((Jl(b,36648,8)|0)!=0){e=c[10038]|0;break}g=(d[b+16|0]|0)<<2;if((e+ -2|0)>>>0<18){za(36488,36544,52,36584)}h=((d[b+18|0]|0)<<8|(d[b+19|0]|0))<<16>>16;do{if((h|0)==0){e=0}else{h=h+18|0;if(h>>>0>(e+ -4-g|0)>>>0){e=0;break}e=b+h|0}}while(0);c[a+324>>2]=e;e=(e|0)==0?36664:0}}while(0);if((e|0)!=0){h=e;i=f;return h|0}h=(d[b+16|0]|0)+1|0;c[a+12>>2]=h;c[a+8>>2]=h;h=0;i=f;return h|0}function qc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;_b(a+316|0,b,c);i=d;return 0}function rc(a,b){a=a|0;b=b|0;i=i;return}function sc(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=2147483647;d=a+32|0;e=a+4|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;c[d>>2]=16;c[a+36>>2]=0;i=b;return}function tc(a){a=a|0;var b=0;b=i;if((c[a+12>>2]|0)==1){i=b;return}Al(c[a+8>>2]|0);i=b;return}function uc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;c[a+4>>2]=0;c[a+16>>2]=0;c[a+40>>2]=0;e=c[a+8>>2]|0;if((e|0)==0){i=d;return}if((b|0)==0){a=72}else{a=(c[a+12>>2]<<2)+72|0}Pl(e|0,0,a|0)|0;i=d;return}function vc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;h=a+12|0;k=c[h>>2]|0;if((k|0)==1){za(36864,36824,83,36872)}g=(d|0)!=0;do{if(g){j=(_(d+1|0,b)|0)+999|0;if((j|0)<65453e3){f=(j|0)/1e3|0;break}else{za(36864,36824,95,36872)}}else{f=65453}}while(0);do{if((k|0)!=(f|0)){k=a+8|0;j=Bl(c[k>>2]|0,(f<<2)+72|0)|0;if((j|0)==0){k=36888;i=e;return k|0}else{c[k>>2]=j;break}}}while(0);c[h>>2]=f;if((f|0)==1){za(36904,36824,107,36872)}c[a+24>>2]=b;k=((f*1e3|0)/(b|0)|0)+ -1|0;c[a+36>>2]=k;if(!((k|0)==(d|0)|g^1)){za(36936,36824,113,36872)}g=a+28|0;d=c[g>>2]|0;do{if((d|0)!=0){c[g>>2]=d;d=~~+M(+(+(b|0)/+(d|0)*65536.0+.5));if((d|0)>0|(b|0)==0){c[a>>2]=d;break}else{za(36952,36824,127,36984)}}}while(0);d=c[a+32>>2]|0;a:do{if((d|0)>0){d=(d<<16|0)/(b|0)|0;b=13;while(1){d=d>>1;if((d|0)==0){break a}b=b+ -1|0;if((b|0)==0){b=0;break}else{}}}else{b=31}}while(0);c[a+20>>2]=b;c[a+4>>2]=0;c[a+16>>2]=0;c[a+40>>2]=0;a=c[a+8>>2]|0;if((a|0)==0){k=0;i=e;return k|0}Pl(a|0,0,(f<<2)+72|0)|0;k=0;i=e;return k|0}function wc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;c[a+32>>2]=b;a:do{if((b|0)>0){e=(b<<16|0)/(c[a+24>>2]|0)|0;b=13;while(1){e=e>>1;if((e|0)==0){break a}b=b+ -1|0;if((b|0)==0){b=0;break}else{}}}else{b=31}}while(0);c[a+20>>2]=b;i=d;return}function xc(a,b){a=a|0;b=b|0;a=c[a+24>>2]|0;b=~~+M(+(+(a|0)/+(b|0)*65536.0+.5));if((b|0)>0|(a|0)==0){i=i;return b|0}else{za(36952,36824,127,36984)}return 0}function yc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;b=_(c[a>>2]|0,b)|0;e=a+4|0;b=(c[e>>2]|0)+b|0;c[e>>2]=b;if((b>>>16|0)>(c[a+12>>2]|0)){za(37008,36824,147,37048)}else{i=d;return}}function zc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;a=a+4|0;e=c[a>>2]|0;if((e>>>16|0)<(b|0)){za(37064,36824,152,37096)}else{c[a>>2]=e-(b<<16);i=d;return}}function Ac(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;e=i;d=c[a>>2]|0;if((d|0)==0){za(36864,36824,167,37112)}else{f=c[a+12>>2]|0;i=e;return((d+ -1-(c[a+4>>2]|0)+(((f|0)<(b|0)?f:b)<<16)|0)>>>0)/(d>>>0)|0|0}return 0}function Bc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;if((b|0)==0){i=d;return}f=a+4|0;e=c[f>>2]|0;if((e>>>16|0)<(b|0)){za(37064,36824,152,37096)}e=e-(b<<16)|0;c[f>>2]=e;f=(e>>>16)+18|0;e=a+8|0;a=c[e>>2]|0;Ol(a|0,a+(b<<2)|0,f<<2|0)|0;Pl((c[e>>2]|0)+(f<<2)|0,0,b<<2|0)|0;i=d;return}function Cc(a,b,d){a=a|0;b=b|0;d=d|0;c[a+24>>2]=b;c[a+28>>2]=d;h[a+16>>3]=0.0;c[a+32>>2]=0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=i;return}function Dc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0;e=i;f=+(c[a+12>>2]|0)*.5;r=c[a+16>>2]|0;if((r|0)==0){l=144.0/+(d|0)+.85}else{l=f/+(r|0)}f=l*+(c[a+8>>2]|0)/f;j=+h[a>>3];f=!(f>=.999)?f:.999;j=j<-300.0?-300.0:j;j=+P(10.0,+((j>5.0?6103515625.0e-14:j*1220703125.0e-14)/(1.0-f)));k=+P(+j,+(4096.0-f*4096.0));l=.0003834951969714103/(l*64.0);if((d|0)>0){a=0;do{o=l*+(a-d<<1|1|0);p=o*4096.0;q=f*p;if(q!=0.0){n=+R(+q)/q*4096.0}else{n=4096.0}m=+Q(+o);m=j*(j-m-m)+1.0;if(m>1.0e-13){n=f*n+(+Q(+q)+(k*(j*+Q(+(p-o))- +Q(+p))-j*+Q(+(q-o))))/m}g[b+(a<<2)>>2]=n;a=a+1|0;}while((a|0)!=(d|0))}f=3.141592653589793/+(d+ -1|0);if((d|0)==0){i=e;return}do{d=d+ -1|0;q=.5400000214576721- +Q(+(f*+(d|0)))*.46000000834465027;r=b+(d<<2)|0;g[r>>2]=+g[r>>2]*q;}while((d|0)!=0);i=e;return}function Ec(a,d){a=a|0;d=d|0;var f=0,j=0,k=0,l=0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0,s=0;f=i;i=i+2432|0;j=f;l=j;k=a+28|0;n=c[k>>2]|0;r=n<<5;o=r+ -32|0;Dc(d,j+256|0,o);d=r+32|0;r=r|31;s=63;while(1){g[j+(d+s<<2)>>2]=+g[j+(r-s<<2)>>2];if((s|0)==0){break}else{s=s+ -1|0}}Pl(l|0,0,256)|0;if((o|0)>0){l=(n<<5)+ -32|0;n=0;m=0.0;while(1){m=m+ +g[j+(n+64<<2)>>2];n=n+1|0;if((n|0)==(l|0)){break}else{}}}else{m=0.0}m=16384.0/m;c[a+32>>2]=32768;n=c[k>>2]|0;l=n<<5|1;k=c[a+24>>2]|0;if((l|0)>0){o=n<<5|1;d=0;p=0.0;q=0.0;while(1){b[k+(d<<1)>>1]=~~+M(+(m*(p-q)+.5));n=d+1|0;if((n|0)==(o|0)){break}else{q=q+ +g[j+(d<<2)>>2];p=p+ +g[j+(d+64<<2)>>2];d=n}}}j=l+ -64|0;if((l|0)>1){n=63;o=64;while(1){o=63-o|0;d=32768;r=1;do{d=d-(b[k+(r+n<<1)>>1]|0)-(b[k+(r+o<<1)>>1]|0)|0;r=r+64|0;}while((r|0)<(l|0));if((n|0)==(o|0)){d=(d|0)/2|0}s=k+(n+j<<1)|0;b[s>>1]=(e[s>>1]|0)+d;if((n|0)>31){o=n;n=n+ -1|0}else{break}}}else{l=63;n=64;while(1){o=k+(l+j<<1)|0;b[o>>1]=(e[o>>1]|0)+((l|0)==(63-n|0)?16384:32768);if((l|0)>31){n=l;l=l+ -1|0}else{break}}}j=a+16|0;m=+h[j>>3];if(!(m!=0.0)){i=f;return}h[j>>3]=0.0;Fc(a,m);i=f;return}function Fc(a,d){a=a|0;d=+d;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+24|0;l=f;k=a+16|0;if(!(+h[k>>3]!=d)){i=f;return}j=a+32|0;g=c[j>>2]|0;if((g|0)==0){h[l>>3]=-8.0;c[l+8>>2]=0;c[l+12>>2]=44100;c[l+16>>2]=0;Ec(a,l);g=c[j>>2]|0}h[k>>3]=d;d=d*1073741824.0/+(g|0);a:do{if(d>0.0&d<2.0){k=0;while(1){l=k+1|0;d=d*2.0;if(d<2.0){k=l}else{break}}if((l|0)==0){break}g=g>>l;c[j>>2]=g;if((g|0)<=0){za(37128,36824,381,37144)}m=(1<<k)+32768|0;o=32768>>>l;k=c[a+28>>2]<<5|1;j=c[a+24>>2]|0;n=k;do{n=n+ -1|0;p=j+(n<<1)|0;b[p>>1]=(m+(b[p>>1]|0)>>l)-o;}while((n|0)!=0);l=k+ -64|0;if((k|0)>1){m=63;n=64}else{m=(g|0)/2|0;k=63;o=64;while(1){n=j+(k+l<<1)|0;b[n>>1]=(e[n>>1]|0)+((k|0)==(63-o|0)?m:g);if((k|0)>31){o=k;k=k+ -1|0}else{break a}}}while(1){p=63-n|0;n=g;o=1;do{n=n-(b[j+(o+m<<1)>>1]|0)-(b[j+(o+p<<1)>>1]|0)|0;o=o+64|0;}while((o|0)<(k|0));if((m|0)==(p|0)){n=(n|0)/2|0}p=j+(m+l<<1)|0;b[p>>1]=(e[p>>1]|0)+n;if((m|0)>31){n=m;m=m+ -1|0}else{break}}}}while(0);c[a+8>>2]=~~+M(+(d+.5));i=f;return}function Gc(a){a=a|0;var b=0;b=i;Cg(a);c[a>>2]=37168;c[a+316>>2]=0;c[a+320>>2]=0;c[a+332>>2]=0;i=b;return}function Hc(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=37168;d=c[a+320>>2]|0;if((d|0)!=0){ib[c[(c[d>>2]|0)+4>>2]&127](d)}Eg(a);Al(a);i=b;return}function Ic(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=37168;d=c[a+320>>2]|0;if((d|0)!=0){ib[c[(c[d>>2]|0)+4>>2]&127](d)}Eg(a);i=b;return}function Jc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+24|0;e=d;f=c[(c[a>>2]|0)+76>>2]|0;h[e>>3]=+h[b>>3];c[e+8>>2]=0;c[e+12>>2]=44100;c[e+16>>2]=0;jb[f&31](a,e);b=c[a+316>>2]|0;if((b|0)==0){i=d;return}jb[c[(c[b>>2]|0)+24>>2]&31](b,~~+h[a+152>>3]);i=d;return}function Kc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=a+316|0;f=c[e>>2]|0;if((f|0)==0){f=a+320|0;a=c[f>>2]|0;do{if((a|0)==0){a=zl(172)|0;if((a|0)!=0){og(a);c[f>>2]=a;f=a;break}c[f>>2]=0;a=37256;i=d;return a|0}else{f=a}}while(0);c[e>>2]=f}a=eb[c[(c[f>>2]|0)+16>>2]&63](f,b,50)|0;i=d;return a|0}function Lc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=i;i=i+16|0;e=d;m=c[a+232>>2]|0;if((m|0)==0){i=d;return}j=a+316|0;k=a+332|0;g=e;h=e+4|0;f=e+8|0;l=a;while(1){m=m+ -1|0;if((1<<m&b|0)==0){n=c[j>>2]|0;o=c[k>>2]|0;if((o|0)==0){o=0}else{o=c[o+(m<<2)>>2]|0}pb[c[(c[n>>2]|0)+12>>2]&15](e,n,m,o);n=c[g>>2]|0;p=c[h>>2]|0;o=(p|0)==0;if((n|0)==0){if(!o){a=12;break}if((c[f>>2]|0)==0){o=0;p=0;n=0}else{a=12;break}}else{if(o){a=12;break}o=c[f>>2]|0;if((o|0)==0){a=12;break}}gb[c[(c[l>>2]|0)+72>>2]&15](a,m,n,p,o)}else{gb[c[(c[l>>2]|0)+72>>2]&15](a,m,0,0,0)}if((m|0)==0){a=15;break}else{}}if((a|0)==12){za(37272,37352,70,37392)}else if((a|0)==15){i=d;return}}function Mc(a,b){a=a|0;b=b|0;var d=0;d=i;c[a+324>>2]=b;a=c[a+316>>2]|0;jb[c[(c[a>>2]|0)+20>>2]&31](a,b);i=d;return}function Nc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;c[a+324>>2]=b;e=a+316|0;f=c[e>>2]|0;jb[c[(c[f>>2]|0)+20>>2]&31](f,b);b=c[e>>2]|0;b=ob[c[(c[b>>2]|0)+8>>2]&63](b,c[a+232>>2]|0)|0;if((b|0)!=0){f=b;i=d;return f|0}Hg(a,a+144|0);c[a+328>>2]=c[(c[e>>2]|0)+4>>2];f=0;i=d;return f|0}function Oc(a,b){a=a|0;b=b|0;b=i;a=c[a+316>>2]|0;ib[c[(c[a>>2]|0)+28>>2]&127](a);i=b;return 0}function Pc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+8|0;g=e;if((b|0)==0){r=0;i=e;return r|0}h=a+316|0;l=a+328|0;j=a+324|0;k=a;m=a;f=a+236|0;n=b;while(1){o=c[h>>2]|0;o=eb[c[(c[o>>2]|0)+36>>2]&63](o,d+(b-n<<1)|0,n)|0;p=(n|0)==(o|0);if(p){q=0;f=10;break}q=c[h>>2]|0;r=c[q+4>>2]|0;if((c[l>>2]|0)!=(r|0)){c[l>>2]=r;Ig(m,c[f>>2]|0);q=c[h>>2]|0}q=c[q+12>>2]|0;c[g>>2]=(_(c[j>>2]|0,q)|0)/1e3|0;q=eb[c[(c[k>>2]|0)+80>>2]&63](a,g,q)|0;if((q|0)!=0){f=10;break}q=c[g>>2]|0;if((q|0)==0){f=8;break}r=c[h>>2]|0;jb[c[(c[r>>2]|0)+32>>2]&31](r,q);if(p){q=0;f=10;break}else{n=n-o|0}}if((f|0)==8){za(37408,37352,114,37424)}else if((f|0)==10){i=e;return q|0}return 0}function Qc(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;k=i;l=g-d|0;c[a+12>>2]=0;c[a+16>>2]=0;c[a+20>>2]=0;h=a;m=c[h>>2]|0;c[h>>2]=0;j=a+4|0;c[j>>2]=0;Al(m);m=kb[c[(c[b>>2]|0)+16>>2]&15](b)|0;a=a+8|0;c[a>>2]=m;if((m|0)<=(d|0)){n=c[10038]|0;i=k;return n|0}n=l+g+m|0;m=Bl(c[h>>2]|0,n)|0;do{if((m|0)!=0|(n|0)==0){c[h>>2]=m;c[j>>2]=n;b=eb[c[(c[b>>2]|0)+12>>2]&63](b,m+l|0,c[a>>2]|0)|0;if((b|0)!=0){break}c[a>>2]=(c[a>>2]|0)-d;if((c[j>>2]|0)>>>0<l>>>0){za(37464,37480,58,37520)}Nl(e|0,(c[h>>2]|0)+l|0,d|0)|0;n=f&255;Pl(c[h>>2]|0,n|0,g|0)|0;Pl((c[h>>2]|0)+((c[j>>2]|0)-g)|0,n|0,g|0)|0;n=0;i=k;return n|0}else{b=37256}}while(0);n=c[h>>2]|0;c[h>>2]=0;c[j>>2]=0;Al(n);n=b;i=k;return n|0}function Rc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=b+ -8-d|0;c[a+12>>2]=f;g=b+ -1+d+(c[a+8>>2]|0)|0;d=g-((g|0)%(d|0)|0)|0;if((d|0)<1){d=0}else{g=d+ -1|0;b=0;while(1){if((g>>>b|0)==0){break}else{b=b+1|0}}c[a+16>>2]=(1<<b)+ -1}c[a+20>>2]=d;f=d-f+8|0;b=a;d=Bl(c[b>>2]|0,f)|0;if(!((d|0)!=0|(f|0)==0)){i=e;return}c[b>>2]=d;c[a+4>>2]=f;i=e;return}function Sc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;b=eb[c[(c[a>>2]|0)+8>>2]&63](a,b,d)|0;if((b|0)==(d|0)){i=e;return 0}else{i=e;return((b|0)>-1&(b|0)<(d|0)?37536:37560)|0}return 0}function Tc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+512|0;f=d;e=a;while(1){if((b|0)==0){h=0;a=4;break}g=(b|0)<512?b:512;h=eb[c[(c[e>>2]|0)+12>>2]&63](a,f,g)|0;if((h|0)==0){b=b-g|0}else{a=4;break}}if((a|0)==4){i=d;return h|0}return 0}function Uc(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=kb[c[(c[d>>2]|0)+24>>2]&15](a)|0;a=e-(kb[c[(c[d>>2]|0)+28>>2]&15](a)|0)|0;i=b;return a|0}function Vc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;if(!((b|0)>-1)){za(37576,37584,57,37624)}if((b|0)==0){b=0;i=d;return b|0}f=c[a>>2]|0;e=c[f+32>>2]|0;b=(kb[c[f+28>>2]&15](a)|0)+b|0;b=ob[e&63](a,b)|0;i=d;return b|0}function Wc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;c[a>>2]=37640;c[a+4>>2]=b;b=kb[c[(c[b>>2]|0)+16>>2]&15](b)|0;c[a+8>>2]=(b|0)>(d|0)?d:b;i=e;return}function Xc(a){a=a|0;i=i;return c[a+8>>2]|0}function Yc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=a+8|0;g=c[f>>2]|0;d=(g|0)<(d|0)?g:d;c[f>>2]=g-d;g=c[a+4>>2]|0;d=eb[c[(c[g>>2]|0)+8>>2]&63](g,b,d)|0;i=e;return d|0}function Zc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;c[a>>2]=37672;c[a+4>>2]=b;c[a+8>>2]=b+d;c[a+12>>2]=e;i=i;return}function _c(a){a=a|0;var b=0,d=0;b=i;d=(c[a+8>>2]|0)-(c[a+4>>2]|0)|0;a=c[a+12>>2]|0;a=d+(kb[c[(c[a>>2]|0)+16>>2]&15](a)|0)|0;i=b;return a|0}function $c(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;j=c[a+8>>2]|0;g=a+4|0;h=c[g>>2]|0;f=j-h|0;if((j|0)!=(h|0)){f=(f|0)>(d|0)?d:f;c[g>>2]=h+f;Nl(b|0,h|0,f|0)|0}g=d-f|0;do{if((f|0)!=(d|0)){j=c[a+12>>2]|0;g=eb[c[(c[j>>2]|0)+8>>2]&63](j,b+f|0,g)|0;if((g|0)>=1){break}i=e;return g|0}}while(0);j=g+f|0;i=e;return j|0}function ad(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;j=c[a+8>>2]|0;h=a+4|0;g=c[h>>2]|0;f=j-g|0;if((j|0)!=(g|0)){f=(f|0)>(d|0)?d:f;c[h>>2]=g+f;Nl(b|0,g|0,f|0)|0}if((f|0)==(d|0)){j=0;i=e;return j|0}j=c[a+12>>2]|0;j=eb[c[(c[j>>2]|0)+12>>2]&63](j,b+f|0,d-f|0)|0;i=e;return j|0}function bd(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=37704;c[a+4>>2]=b;c[a+8>>2]=d;c[a+12>>2]=0;i=i;return}function cd(a){a=a|0;i=i;return c[a+8>>2]|0}function dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;f=kb[c[(c[a>>2]|0)+16>>2]&15](a)|0;d=(f|0)<(d|0)?f:d;f=a+12|0;Nl(b|0,(c[a+4>>2]|0)+(c[f>>2]|0)|0,d|0)|0;c[f>>2]=(c[f>>2]|0)+d;i=e;return d|0}function ed(a){a=a|0;i=i;return c[a+12>>2]|0}function fd(a,b){a=a|0;b=b|0;if((c[a+8>>2]|0)<(b|0)){b=37536}else{c[a+12>>2]=b;b=0}i=i;return b|0}function gd(a){a=a|0;i=i;return}function hd(a){a=a|0;var b=0;b=i;Fl(a);i=b;return}function id(a){a=a|0;i=i;return}function jd(a){a=a|0;var b=0;b=i;Fl(a);i=b;return}function kd(a){a=a|0;i=i;return}function ld(a){a=a|0;var b=0;b=i;Fl(a);i=b;return}function md(a){a=a|0;var b=0;b=i;c[a>>2]=37920;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=-1;c[a+20>>2]=-1;c[a+24>>2]=0;Jd(a+32|0,12,a+84|0);i=b;return}function nd(a){a=a|0;var b=0;b=i;c[a>>2]=37920;Kd(a+32|0);Al(c[a+4>>2]|0);Fl(a);i=b;return}function od(a){a=a|0;var b=0;b=i;c[a>>2]=37920;Kd(a+32|0);Al(c[a+4>>2]|0);i=b;return}function pd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0;d=i;e=(b>>2)+b|0;g=a+4|0;f=Bl(c[g>>2]|0,e<<2)|0;if(!((f|0)!=0|(e|0)==0)){g=38136;i=d;return g|0}j=e<<1;c[g>>2]=f;c[a+8>>2]=j;e=b<<1;f=a+12|0;if(!((c[f>>2]|0)==(e|0)|e>>>0>j>>>0)){c[f>>2]=e;c[a+16>>2]=(~~(+(b|0)*+h[a+72>>3])<<1)+2;c[a+20>>2]=e;Ld(a+32|0)}j=c[a+16>>2]|0;j=(j>>2)+j|0;c[a+24>>2]=j;j=Md(a+32|0,j)|0;i=d;return j|0}function qd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=b<<1;f=a+12|0;if((c[f>>2]|0)==(e|0)){i=d;return}if(e>>>0>(c[a+8>>2]|0)>>>0){i=d;return}c[f>>2]=e;c[a+16>>2]=(~~(+(b|0)*+h[a+72>>3])<<1)+2;c[a+20>>2]=e;Ld(a+32|0);i=d;return}function rd(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;h=a+12|0;g=c[h>>2]>>1;k=Ac(d,g)|0;j=a+32|0;o=c[a+56>>2]|0;m=a+36|0;if((c[m>>2]|0)>>>0<o>>>0){za(38152,38168,58,38208)}n=a+40|0;p=c[n>>2]|0;l=j;o=mb[c[(c[a>>2]|0)+8>>2]&7](a,k,(c[a+16>>2]|0)-(p-((c[l>>2]|0)+(o<<1))>>1)|0,p)|0;if((o|0)>=(c[a+24>>2]|0)){za(37936,37968,65,38016)}yc(d,k);if(((c[d+4>>2]|0)>>>16|0)!=(g|0)){za(38032,37968,68,38016)}p=(c[n>>2]|0)+(o<<1)|0;c[n>>2]=p;if(p>>>0>((c[l>>2]|0)+(c[m>>2]<<1)|0)>>>0){za(38224,38248,96,38288)}l=a+4|0;k=sd(j,c[l>>2]|0,c[h>>2]|0)|0;if((k|0)!=(c[h>>2]|0)){za(38072,37968,73,38016)}h=d+16|0;n=c[h>>2]|0;j=c[d+20>>2]|0;m=k>>1;if((m|0)==0){p=n;c[h>>2]=p;Bc(d,g);i=f;return}k=c[d+8>>2]|0;l=c[l>>2]|0;while(1){m=m+ -1|0;o=n>>14;a=(b[l>>1]<<1)+o|0;if((a<<16>>16|0)!=(a|0)){a=32767-(a>>24)|0}n=(c[k>>2]|0)+(n-(n>>j))|0;o=(b[l+2>>1]<<1)+o|0;if((o<<16>>16|0)!=(o|0)){o=32767-(o>>24)|0}b[e>>1]=a;b[e+2>>1]=o;if((m|0)==0){break}else{e=e+4|0;k=k+4|0;l=l+4|0}}c[h>>2]=n;Bc(d,g);i=f;return}function sd(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=i;g=a;r=c[g>>2]|0;h=a+8|0;o=c[h>>2]|0;m=a+28|0;j=a+16|0;t=c[j>>2]|0;k=a+12|0;n=c[k>>2]|0;s=n-t|0;l=c[a+32>>2]|0;if((o-r|0)>46){o=o+ -48|0;n=a+52|0;e=e>>1;q=a+(t*24|0)+52|0;p=d;u=(c[m>>2]|0)>>>t;while(1){if((e|0)<1){break}v=b[q>>1]|0;t=_(b[r>>1]|0,v)|0;v=_(b[r+2>>1]|0,v)|0;w=b[q+2>>1]|0;t=t+(_(b[r+4>>1]|0,w)|0)|0;w=v+(_(b[r+6>>1]|0,w)|0)|0;v=b[q+4>>1]|0;t=(_(b[r+8>>1]|0,v)|0)+t|0;w=(_(b[r+10>>1]|0,v)|0)+w|0;v=b[q+6>>1]|0;t=t+(_(b[r+12>>1]|0,v)|0)|0;v=w+(_(b[r+14>>1]|0,v)|0)|0;w=b[q+8>>1]|0;t=(_(b[r+16>>1]|0,w)|0)+t|0;v=(_(b[r+18>>1]|0,w)|0)+v|0;w=b[q+10>>1]|0;t=t+(_(b[r+20>>1]|0,w)|0)|0;w=v+(_(b[r+22>>1]|0,w)|0)|0;v=b[q+12>>1]|0;t=(_(b[r+24>>1]|0,v)|0)+t|0;w=(_(b[r+26>>1]|0,v)|0)+w|0;v=b[q+14>>1]|0;t=t+(_(b[r+28>>1]|0,v)|0)|0;v=w+(_(b[r+30>>1]|0,v)|0)|0;w=b[q+16>>1]|0;t=(_(b[r+32>>1]|0,w)|0)+t|0;v=(_(b[r+34>>1]|0,w)|0)+v|0;w=b[q+18>>1]|0;t=t+(_(b[r+36>>1]|0,w)|0)|0;w=v+(_(b[r+38>>1]|0,w)|0)|0;v=b[q+20>>1]|0;t=(_(b[r+40>>1]|0,v)|0)+t|0;w=(_(b[r+42>>1]|0,v)|0)+w|0;v=b[q+22>>1]|0;t=t+(_(b[r+44>>1]|0,v)|0)|0;s=s+ -1|0;v=(w+(_(b[r+46>>1]|0,v)|0)|0)>>>15;r=r+((u<<1&2)+l<<1)|0;if((s|0)==0){q=n;s=c[k>>2]|0;u=c[m>>2]|0}else{q=q+24|0;u=u>>>1}b[p>>1]=t>>>15;b[p+2>>1]=v;p=p+4|0;if(r>>>0>o>>>0){break}else{e=e+ -1|0}}l=c[h>>2]|0;k=c[k>>2]|0}else{l=o;k=n;p=d}c[j>>2]=k-s;k=l-r|0;j=k>>1;if((c[a+4>>2]|0)>>>0<j>>>0){za(38152,38168,58,38208)}else{w=c[g>>2]|0;c[h>>2]=w+(j<<1);Ol(w|0,r|0,k|0)|0;i=f;return p-d>>1|0}return 0}function td(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;h=a+12|0;o=c[h>>2]|0;f=a+20|0;l=c[f>>2]|0;n=o-l|0;do{if((o|0)==(l|0)){j=b;k=d;m=o}else{n=(n|0)>(b|0)?b:n;if((c[a+8>>2]|0)>>>0<l>>>0){za(38152,38168,58,38208)}else{Nl(d|0,(c[a+4>>2]|0)+(l<<1)|0,n<<1|0)|0;c[f>>2]=(c[f>>2]|0)+n;j=b-n|0;k=d+(n<<1)|0;m=c[h>>2]|0;break}}}while(0);if((j|0)>=(m|0)){while(1){rd(a,e,k);o=c[h>>2]|0;k=k+(o<<1)|0;j=j-o|0;if((j|0)<(o|0)){break}else{}}}if((j|0)==0){i=g;return}o=a+4|0;rd(a,e,c[o>>2]|0);c[f>>2]=j;Nl(k|0,c[o>>2]|0,j<<1|0)|0;i=g;return}function ud(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0;f=i;i=i+64|0;e=f;mg(b,2);c[b>>2]=38304;g=b+328|0;j=b+20|0;do{sc(j);j=j+44|0;}while((j|0)!=(g|0));h[b+368>>3]=-.15000000596046448;h[b+376>>3]=.15000000596046448;h[b+400>>3]=88.0;h[b+416>>3]=.11999999731779099;h[b+384>>3]=61.0;h[b+392>>3]=.10000000149011612;h[b+408>>3]=18.0;a[b+424|0]=0;j=d?3:7;d=b+440|0;g=b+448|0;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[d>>2]=j;c[b+468>>2]=0;c[b+464>>2]=0;c[b+432>>2]=0;c[b+436>>2]=0;a[b+444|0]=0;h[e>>3]=-0.0;h[e+8>>3]=0.0;h[e+32>>3]=88.0;h[e+16>>3]=61.0;h[e+48>>3]=0.0;h[e+24>>3]=0.0;h[e+40>>3]=18.0;a[e+56|0]=0;jb[c[(c[b>>2]|0)+44>>2]&31](b,e);i=f;return}function vd(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=38304;Al(c[a+456>>2]|0);Al(c[a+448>>2]|0);d=a+20|0;e=a+328|0;do{e=e+ -44|0;tc(e);}while((e|0)!=(d|0));Al(a);i=b;return}function wd(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=38304;Al(c[a+456>>2]|0);Al(c[a+448>>2]|0);d=a+20|0;a=a+328|0;do{a=a+ -44|0;tc(a);}while((a|0)!=(d|0));i=b;return}function xd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=a+460|0;do{if((c[f>>2]|0)==0){g=a+456|0;h=Bl(c[g>>2]|0,8192)|0;if((h|0)==0){h=38480;i=e;return h|0}else{c[g>>2]=h;c[f>>2]=4096;break}}}while(0);f=a+452|0;do{if((c[f>>2]|0)==0){g=a+448|0;h=Bl(c[g>>2]|0,32768)|0;if((h|0)==0){h=38480;i=e;return h|0}else{c[g>>2]=h;c[f>>2]=16384;break}}}while(0);f=a+440|0;a:do{if((c[f>>2]|0)>0){g=0;while(1){h=vc(a+(g*44|0)+20|0,b,d)|0;g=g+1|0;if((h|0)!=0){break}if((g|0)>=(c[f>>2]|0)){break a}}i=e;return h|0}}while(0);jb[c[(c[a>>2]|0)+44>>2]&31](a,a+368|0);ib[c[(c[a>>2]|0)+28>>2]&127](a);h=c[a+56>>2]|0;c[a+8>>2]=c[a+44>>2];c[a+12>>2]=h;h=0;i=e;return h|0}function yd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=a+440|0;if((c[e>>2]|0)>0){f=0}else{i=d;return}do{g=a+(f*44|0)+20|0;c[a+(f*44|0)+48>>2]=b;c[g>>2]=xc(g,b)|0;f=f+1|0;}while((f|0)<(c[e>>2]|0));i=d;return}function zd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=a+440|0;if((c[e>>2]|0)>0){f=0}else{i=d;return}do{wc(a+(f*44|0)+20|0,b);f=f+1|0;}while((f|0)<(c[e>>2]|0));i=d;return}function Ad(a){a=a|0;var b=0,d=0,e=0;b=i;c[a+432>>2]=0;c[a+436>>2]=0;if((c[a+460>>2]|0)!=0){Pl(c[a+456>>2]|0,0,8192)|0}if((c[a+452>>2]|0)!=0){Pl(c[a+448>>2]|0,0,32768)|0}d=a+440|0;if((c[d>>2]|0)>0){e=0}else{i=b;return}do{uc(a+(e*44|0)+20|0,1);e=e+1|0;}while((e|0)<(c[d>>2]|0));i=b;return}function Bd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0.0,n=0;e=i;g=b+4|0;c[g>>2]=(c[g>>2]|0)+1;g=b+368|0;j=b+424|0;do{if((a[j]|0)==0){if((a[d+56|0]|0)==0){break}if((c[b+460>>2]|0)==0){break}Pl(c[b+456>>2]|0,0,8192)|0;Pl(c[b+448>>2]|0,0,32768)|0}}while(0);f=g;k=f+0|0;l=d+0|0;n=k+56|0;do{c[k>>2]=c[l>>2];k=k+4|0;l=l+4|0}while((k|0)<(n|0));a[f+56|0]=a[d+56|0]|0;if((a[j]|0)==0){f=b+20|0;g=b+64|0;j=b+108|0;c[b+328>>2]=f;c[b+332>>2]=g;c[b+336>>2]=j;c[b+340>>2]=f;c[b+344>>2]=g;c[b+348>>2]=j;c[b+352>>2]=f;c[b+356>>2]=g;c[b+360>>2]=j;j=f;g=f}else{f=32768-~~(+h[g>>3]*32768.0+.5)|0;c[b+472>>2]=f;c[b+476>>2]=65536-f;f=32768-~~(+h[b+376>>3]*32768.0+.5)|0;c[b+480>>2]=f;c[b+484>>2]=65536-f;c[b+508>>2]=~~(+h[b+416>>3]*32768.0+.5);c[b+496>>2]=~~(+h[b+392>>3]*32768.0+.5);m=+(c[b+8>>2]|0);f=~~(+h[b+408>>3]*5.0e-4*m);g=~~(m*+h[b+400>>3]*.001);j=16384-(g-f<<1)|0;if((j|0)<0){j=0}else{j=(j|0)>16382?16382:j}c[b+500>>2]=j;g=16385-(g+f<<1)|0;if((g|0)<1){g=1}else{g=(g|0)>16383?16383:g}c[b+504>>2]=g;g=~~(+h[b+384>>3]*.001*m);j=f-g+4095|0;if((j|0)<0){j=0}else{j=(j|0)>4095?4095:j}c[b+488>>2]=j;f=4095-f-g|0;if((f|0)<0){f=0}else{f=(f|0)>4095?4095:f}c[b+492>>2]=f;f=b+20|0;c[b+328>>2]=f;d=b+152|0;c[b+332>>2]=d;j=b+196|0;c[b+336>>2]=j;g=b+64|0;c[b+340>>2]=g;c[b+344>>2]=d;c[b+348>>2]=j;j=b+108|0;c[b+352>>2]=j;c[b+356>>2]=b+240;c[b+360>>2]=b+284}if((c[b+440>>2]|0)>=7){i=e;return}c[b+332>>2]=f;c[b+336>>2]=f;c[b+344>>2]=g;c[b+348>>2]=g;c[b+356>>2]=j;c[b+360>>2]=j;i=e;return}function Cd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=i;do{if((e|0)==0){d=(d|0)%5|0;d=(d|0)>2?2:d}else{if((e&512|0)!=0){d=2;break}d=(((e&255)>>>0)%3|0|0)==0?2:e&1}}while(0);e=a;d=b+(d*12|0)+328|0;c[e+0>>2]=c[d+0>>2];c[e+4>>2]=c[d+4>>2];c[e+8>>2]=c[d+8>>2];i=f;return}function Dd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;f=b+440|0;j=c[f>>2]|0;if((j|0)>0){g=0;h=0;while(1){k=b+(h*44|0)+60|0;j=c[k>>2]|0;c[k>>2]=0;g=j<<h|g;yc(b+(h*44|0)+20|0,d);h=h+1|0;j=c[f>>2]|0;if((h|0)<(j|0)){}else{break}}}else{g=0}d=a[b+424|0]|0;if(((d<<24>>24!=0?120:6)&g|0)!=0&(j|0)==7){c[b+432>>2]=((c[b+24>>2]|0)>>>16)+8}f=b+444|0;if((a[f]|d)<<24>>24==0){a[f]=d;i=e;return}c[b+436>>2]=((c[b+24>>2]|0)>>>16)+8;a[f]=d;i=e;return}function Ed(a){a=a|0;i=i;return(c[a+24>>2]|0)>>>16<<1|0}function Fd(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;f=i;if((e&1|0)!=0){za(38352,38376,251,38424)}g=(c[a+24>>2]|0)>>>16;e=e>>1;j=(g|0)>(e|0)?e:g;if((j|0)==0){C=j<<1;i=f;return C|0}l=a+440|0;m=a+436|0;n=a+432|0;g=a+40|0;o=a+36|0;q=a+80|0;p=a+124|0;e=a+116|0;h=a+72|0;k=a+28|0;t=c[l>>2]|0;r=j;while(1){s=c[m>>2]|0;do{if((s|0)==0){if((c[n>>2]|0)==0){Id(a,d,r);t=1;u=r;break}w=c[g>>2]|0;x=r;y=c[o>>2]|0;s=c[k>>2]|0;B=c[q>>2]|0;t=c[h>>2]|0;v=d;z=c[p>>2]|0;u=c[e>>2]|0;while(1){x=x+ -1|0;A=y>>14;y=(c[s>>2]|0)-(y>>w)+y|0;C=A+(B>>14)|0;A=A+(z>>14)|0;B=(c[t>>2]|0)-(B>>w)+B|0;z=(c[u>>2]|0)-(z>>w)+z|0;if((C<<16>>16|0)!=(C|0)){C=32767-(C>>24)|0}b[v>>1]=C;if((A<<16>>16|0)!=(A|0)){A=32767-(A>>24)|0}b[v+2>>1]=A;if((x|0)==0){break}else{v=v+4|0;u=u+4|0;t=t+4|0;s=s+4|0}}c[p>>2]=z;c[q>>2]=B;c[o>>2]=y;t=3;u=r}else{u=(r|0)>(s|0)?s:r;if((c[n>>2]|0)==0){Hd(a,d,u);t=3;break}else{Gd(a,d,u);break}}}while(0);d=d+(u<<1<<1)|0;s=r-u|0;v=(c[n>>2]|0)-u|0;c[n>>2]=(v|0)<0?0:v;v=(c[m>>2]|0)-u|0;c[m>>2]=(v|0)<0?0:v;v=c[l>>2]|0;if((v|0)>0){w=0;while(1){v=a+(w*44|0)+20|0;if((w|0)<(t|0)){Bc(v,u)}else{zc(v,u)}w=w+1|0;v=c[l>>2]|0;if((w|0)>=(v|0)){t=v;break}}}else{t=v}if((r|0)==(u|0)){break}else{r=s}}C=j<<1;i=f;return C|0}function Gd(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;p=i;y=c[a+128>>2]|0;g=a+124|0;O=c[g>>2]|0;f=a+168|0;R=c[f>>2]|0;k=a+212|0;P=c[k>>2]|0;j=a+256|0;L=c[j>>2]|0;h=a+300|0;Q=c[h>>2]|0;l=a+36|0;H=c[l>>2]|0;o=a+80|0;I=c[o>>2]|0;z=c[a+448>>2]|0;A=c[a+456>>2]|0;m=a+468|0;G=c[m>>2]|0;n=a+464|0;M=c[n>>2]|0;if((e|0)==0){T=O;N=G;O=R;a=L;R=Q;Q=M;e=H;S=I;c[n>>2]=Q;c[m>>2]=N;c[f>>2]=O;c[k>>2]=P;c[j>>2]=a;c[h>>2]=R;c[l>>2]=e;c[o>>2]=S;c[g>>2]=T;i=p;return}C=c[a+472>>2]|0;q=c[a+480>>2]|0;u=c[a+500>>2]|0;t=c[a+476>>2]|0;s=c[a+484>>2]|0;r=c[a+504>>2]|0;x=c[a+508>>2]|0;v=c[a+496>>2]|0;w=c[a+488>>2]|0;B=c[a+492>>2]|0;D=c[a+116>>2]|0;E=c[a+160>>2]|0;F=c[a+248>>2]|0;J=c[a+204>>2]|0;K=c[a+292>>2]|0;N=c[a+28>>2]|0;a=c[a+72>>2]|0;while(1){e=e+ -1|0;U=H>>14;S=I>>14;H=(c[N>>2]|0)-(H>>y)+H|0;I=(c[a>>2]|0)-(I>>y)+I|0;V=(_(C,U)|0)>>15;T=(_(q,S)|0)>>15;T=V+(R>>14)+T+(b[z+((u+M&16383)<<1)>>1]|0)|0;U=(_(t,U)|0)>>15;S=(_(s,S)|0)>>15;S=U+(P>>14)+S+(b[z+((r+M&16383)<<1)>>1]|0)|0;R=(c[E>>2]|0)-(R>>y)+R|0;P=(c[J>>2]|0)-(P>>y)+P|0;b[z+(M<<1)>>1]=(_(x,T)|0)>>>15;b[z+(M+1<<1)>>1]=(_(x,S)|0)>>>15;M=M+2&16383;U=O>>14;O=(c[D>>2]|0)-(O>>y)+O|0;T=U+(L>>14)+T+((_(b[A+((w+G&4095)<<1)>>1]|0,v)|0)>>15)|0;S=U+(Q>>14)+S+((_(b[A+((B+G&4095)<<1)>>1]|0,v)|0)>>15)|0;L=(c[F>>2]|0)-(L>>y)+L|0;Q=(c[K>>2]|0)-(Q>>y)+Q|0;b[A+(G<<1)>>1]=U;G=G+1&4095;if((T<<16>>16|0)!=(T|0)){T=32767-(T>>24)|0}b[d>>1]=T;if((S<<16>>16|0)!=(S|0)){S=32767-(S>>24)|0}b[d+2>>1]=S;if((e|0)==0){break}else{d=d+4|0;a=a+4|0;N=N+4|0;K=K+4|0;J=J+4|0;F=F+4|0;E=E+4|0;D=D+4|0}}c[n>>2]=M;c[m>>2]=G;c[f>>2]=R;c[k>>2]=P;c[j>>2]=L;c[h>>2]=Q;c[l>>2]=H;c[o>>2]=I;c[g>>2]=O;i=p;return}function Hd(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;k=i;r=c[a+128>>2]|0;l=a+124|0;F=c[l>>2]|0;g=a+36|0;C=c[g>>2]|0;f=a+80|0;D=c[f>>2]|0;s=c[a+448>>2]|0;t=c[a+456>>2]|0;h=a+468|0;B=c[h>>2]|0;j=a+464|0;E=c[j>>2]|0;if((e|0)==0){H=F;F=B;a=E;e=C;G=D;c[j>>2]=a;c[h>>2]=F;c[g>>2]=e;c[f>>2]=G;c[l>>2]=H;i=k;return}m=c[a+472>>2]|0;v=c[a+480>>2]|0;x=c[a+500>>2]|0;u=c[a+476>>2]|0;y=c[a+484>>2]|0;q=c[a+504>>2]|0;p=c[a+508>>2]|0;n=c[a+496>>2]|0;o=c[a+488>>2]|0;w=c[a+492>>2]|0;z=c[a+116>>2]|0;A=c[a+28>>2]|0;a=c[a+72>>2]|0;while(1){e=e+ -1|0;G=C>>14;I=D>>14;C=(c[A>>2]|0)-(C>>r)+C|0;D=(c[a>>2]|0)-(D>>r)+D|0;H=((_(v,I)|0)>>15)+((_(m,G)|0)>>15)|0;H=H+(b[s+((x+E&16383)<<1)>>1]|0)|0;G=((_(y,I)|0)>>15)+((_(u,G)|0)>>15)|0;G=G+(b[s+((q+E&16383)<<1)>>1]|0)|0;b[s+(E<<1)>>1]=(_(p,H)|0)>>>15;b[s+(E+1<<1)>>1]=(_(G,p)|0)>>>15;E=E+2&16383;I=F>>14;F=(c[z>>2]|0)-(F>>r)+F|0;H=H+I+((_(b[t+((o+B&4095)<<1)>>1]|0,n)|0)>>15)|0;G=G+I+((_(b[t+((w+B&4095)<<1)>>1]|0,n)|0)>>15)|0;b[t+(B<<1)>>1]=I;B=B+1&4095;if((H<<16>>16|0)!=(H|0)){H=32767-(H>>24)|0}b[d>>1]=H;if((G<<16>>16|0)!=(G|0)){G=32767-(G>>24)|0}b[d+2>>1]=G;if((e|0)==0){break}else{d=d+4|0;a=a+4|0;A=A+4|0;z=z+4|0}}c[j>>2]=E;c[h>>2]=B;c[g>>2]=C;c[f>>2]=D;c[l>>2]=F;i=k;return}function Id(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;g=c[a+40>>2]|0;j=c[a+28>>2]|0;a=a+36|0;m=c[a>>2]|0;o=e>>1;if((o|0)!=0){h=o<<2;k=o<<1;p=m;l=j;n=d;while(1){s=p>>14;r=(c[l>>2]|0)-(p>>g)+p|0;q=r>>14;m=r+(c[l+4>>2]|0)-(r>>g)|0;if((s<<16>>16|0)!=(s|0)){s=32767-(p>>31)|0}c[n>>2]=s&65535|s<<16;if((q<<16>>16|0)!=(q|0)){q=32767-(r>>31)|0}c[n+4>>2]=q&65535|q<<16;o=o+ -1|0;if((o|0)==0){break}else{n=n+8|0;l=l+8|0;p=m}}j=j+(k<<2)|0;d=d+(h<<1)|0}if((e&1|0)==0){s=m;c[a>>2]=s;i=f;return}s=m>>14;e=(c[j>>2]|0)-(m>>g)+m|0;r=s&65535;b[d>>1]=r;g=d+2|0;b[g>>1]=r;if((s<<16>>16|0)==(s|0)){s=e;c[a>>2]=s;i=f;return}s=32767-(m>>31)&65535;b[d>>1]=s;b[g>>1]=s;s=e;c[a>>2]=s;i=f;return}function Jd(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=0;c[a+4>>2]=0;c[a+20>>2]=b;c[a+24>>2]=(b<<1)+ -2;c[a+48>>2]=d;c[a+8>>2]=0;c[a+12>>2]=1;c[a+16>>2]=0;c[a+28>>2]=0;c[a+32>>2]=2;h[a+40>>3]=1.0;i=i;return}function Kd(a){a=a|0;var b=0;b=i;Al(c[a>>2]|0);i=b;return}function Ld(a){a=a|0;var b=0,d=0,e=0;b=i;c[a+16>>2]=0;d=c[a+4>>2]|0;if((d|0)==0){i=b;return}e=c[a+24>>2]|0;if(d>>>0<e>>>0){za(38512,38528,58,38568)}d=c[a>>2]|0;c[a+8>>2]=d+(e<<1);Pl(d|0,0,e<<1|0)|0;i=b;return}function Md(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;e=a+24|0;b=(c[e>>2]|0)+b|0;h=a;f=Bl(c[h>>2]|0,b<<1)|0;j=(b|0)==0;if(!((f|0)!=0|j)){j=38496;i=d;return j|0}g=f;c[h>>2]=g;c[a+4>>2]=b;c[a+16>>2]=0;if(j){j=0;i=d;return j|0}e=c[e>>2]|0;if(b>>>0<e>>>0){za(38512,38528,58,38568)}c[a+8>>2]=g+(e<<1);Pl(f|0,0,e<<1|0)|0;j=0;i=d;return j|0}function Nd(a,d,e,f){a=a|0;d=+d;e=+e;f=+f;var g=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0,t=0.0,u=0,v=0,w=0.0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0,F=0.0,G=0.0;g=i;j=a+40|0;h[j>>3]=d;q=a+12|0;c[q>>2]=-1;n=0.0;o=2.0;p=0.0;k=1;do{p=p+d;w=+M(+(p+.5));t=+N(+(p-w));if(t<o){c[q>>2]=k;n=w/+(k|0);o=t}k=k+1|0;}while((k|0)!=33);l=a+28|0;c[l>>2]=0;k=a+32|0;c[k>>2]=~~+M(+n)<<1;h[j>>3]=n;o=+ua(+n,1.0);d=+h[j>>3];if(d<1.0){n=1.0}else{n=1.0/d}m=a+36|0;c[m>>2]=0;q=c[q>>2]|0;if((q|0)>0){p=n*.01227184630308513;t=f*32767.0*n*.001953125;s=a+48|0;f=e*e;r=c[a+20>>2]|0;v=0;u=0;x=0.0;do{B=512.0/+(~~(n*+(r|0)+1.0)&-2|0);w=+P(+e,256.0);if((r|0)!=0){y=_(r,u)|0;A=w*e;y=(c[s>>2]|0)+(y<<1)|0;C=r;z=-(p*(x+ +(((r|0)/2|0)+ -1|0)));while(1){C=C+ -1|0;D=B*z;if(+N(+D)<3.141592653589793){F=+Q(+z)*e;G=1.0-F;F=t*(G-w*+Q(+(z*256.0))+A*+Q(+(z*255.0)))/(f+(G-F))-t;E=~~(F+ +Q(+D)*F)}else{E=0}b[y>>1]=E;if((C|0)==0){break}else{z=p+z;y=y+2|0}}}x=o+x;v=v+(c[k>>2]|0)|0;c[m>>2]=v;if(x>=.9999999){c[l>>2]=c[l>>2]|1<<u;v=v+1|0;c[m>>2]=v;x=x+-1.0}u=u+1|0;}while((u|0)<(q|0))}c[a+16>>2]=0;k=c[a+4>>2]|0;if((k|0)==0){G=d;i=g;return+G}l=c[a+24>>2]|0;if(k>>>0<l>>>0){za(38512,38528,58,38568)}E=c[a>>2]|0;c[a+8>>2]=E+(l<<1);Pl(E|0,0,l<<1|0)|0;G=+h[j>>3];i=g;return+G}function Od(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=i;f=a+8|0;d=c[a>>2]|0;g=(c[f>>2]|0)-d>>1;h=g-(c[a+20>>2]<<1)|0;h=(h|0)<(b|0)?h:b;g=g-h|0;a=c[a+4>>2]|0;if(a>>>0<g>>>0){za(38512,38528,58,38568)}c[f>>2]=d+(g<<1);if(a>>>0<h>>>0){za(38512,38528,58,38568)}else{Ol(d|0,d+(h<<1)|0,g<<1|0)|0;i=e;return h|0}return 0}function Pd(b){b=b|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0.0;e=i;f=b+376|0;Cc(f,b+416|0,12);k=b+1192|0;Cc(k,b+1232|0,8);c[b+96>>2]=f;c[b+164>>2]=f;c[b+228>>2]=k;c[b+320>>2]=k;k=b+44|0;c[b>>2]=k;f=b+112|0;c[b+4>>2]=f;g=b+180|0;c[b+8>>2]=g;j=b+268|0;c[b+12>>2]=j;c[b+68>>2]=b+328;c[b+60>>2]=0;c[k>>2]=0;c[b+48>>2]=0;c[b+52>>2]=0;c[b+56>>2]=0;c[b+136>>2]=b+333;c[b+128>>2]=0;c[f>>2]=0;c[b+116>>2]=0;c[b+120>>2]=0;c[b+124>>2]=0;c[b+204>>2]=b+338;c[b+196>>2]=0;c[g>>2]=0;c[b+184>>2]=0;c[b+188>>2]=0;c[b+192>>2]=0;c[b+292>>2]=b+343;c[b+284>>2]=0;c[j>>2]=0;c[b+272>>2]=0;c[b+276>>2]=0;c[b+280>>2]=0;c[b+24>>2]=16384;f=b+32|0;h[f>>3]=625.0e-6;k=b+348|0;m=d[k]|0;l=m&7;m=m>>>4&7;n=+((m>>>0<l>>>0?l:m)+1|0)*625.0e-6;l=b+376|0;Fc(l,n);m=b+1192|0;Fc(m,n);c[b+16>>2]=0;c[b+20>>2]=0;c[b+40>>2]=0;fe(b+44|0);fe(b+112|0);ce(g);c[b+316>>2]=0;ce(j);c[b+324>>2]=1;c[b+232>>2]=0;a[k]=119;n=+h[f>>3]*8.0;Fc(l,n);Fc(m,n);a[b+350|0]=1;Vd(b,0,65318,0);j=b+236|0;g=38736|0;f=j+32|0;do{a[j]=a[g]|0;j=j+1|0;g=g+1|0}while((j|0)<(f|0));i=e;return}function Qd(a,b){a=a|0;b=+b;var d=0;if(b!=1.0){d=~~(16384.0/b)}else{d=16384}c[a+24>>2]=d;i=i;return}function Rd(b){b=b|0;var d=0,e=0,f=0,g=0.0;d=i;c[b+16>>2]=0;c[b+20>>2]=0;c[b+40>>2]=0;fe(b+44|0);fe(b+112|0);ce(b+180|0);c[b+316>>2]=0;ce(b+268|0);c[b+324>>2]=1;c[b+232>>2]=0;a[b+348|0]=119;g=+h[b+32>>3]*8.0;Fc(b+376|0,g);Fc(b+1192|0,g);a[b+350|0]=1;Vd(b,0,65318,0);f=b+236|0;e=38736|0;b=f+32|0;do{a[f]=a[e]|0;f=f+1|0;e=e+1|0}while((f|0)<(b|0));i=d;return}function Sd(a,b){a=a|0;b=b|0;var c=0;c=i;Ec(a+376|0,b);Ec(a+1192|0,b);i=c;return}function Td(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;if(!(b>>>0<4)){za(38584,38616,59,38656)}k=(d|0)==0;j=(e|0)==0;h=(f|0)==0;if(k&j&h|(k|j|h)^1){k=c[a+(b<<2)>>2]|0;c[k+4>>2]=f;c[k+8>>2]=e;c[k+12>>2]=d;c[k+16>>2]=c[k+(c[k+20>>2]<<2)>>2];i=g;return}else{za(38672,38616,60,38656)}}function Ud(a){a=a|0;var b=0,c=0,e=0,f=0.0;b=i;e=d[a+348|0]|0;c=e&7;e=e>>>4&7;f=+h[a+32>>3]*+((e>>>0<c>>>0?c:e)+1|0);Fc(a+376|0,f);Fc(a+1192|0,f);i=b;return}function Vd(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0;j=i;if(!(g>>>0<256)){za(38864,38616,202,38888)}l=f+ -65296|0;if(l>>>0>47){i=j;return}Wd(b,e);q=b+l+328|0;k=a[q]|0;a[q]=g;if(f>>>0<65316){ke(b,(l|0)/5|0,l,g);i=j;return}k=(k&255|0)==(g|0);if(!((f|0)!=65316|k)){g=b+1192|0;l=c[b>>2]|0;q=l+32|0;k=c[q>>2]|0;c[q>>2]=0;do{if((k|0)!=0){if((c[l+44>>2]|0)==0){break}l=c[l+16>>2]|0;if((l|0)==0){break}q=_(c[l>>2]|0,e)|0;Zd(g,q+(c[l+4>>2]|0)|0,0-k|0,l)}}while(0);l=c[b+4>>2]|0;q=l+32|0;k=c[q>>2]|0;c[q>>2]=0;do{if((k|0)!=0){if((c[l+44>>2]|0)==0){break}l=c[l+16>>2]|0;if((l|0)==0){break}q=_(c[l>>2]|0,e)|0;Zd(g,q+(c[l+4>>2]|0)|0,0-k|0,l)}}while(0);l=c[b+8>>2]|0;q=l+32|0;k=c[q>>2]|0;c[q>>2]=0;do{if((k|0)!=0){if((c[l+44>>2]|0)==0){break}l=c[l+16>>2]|0;if((l|0)==0){break}q=_(c[l>>2]|0,e)|0;Zd(g,q+(c[l+4>>2]|0)|0,0-k|0,l)}}while(0);l=c[b+12>>2]|0;q=l+32|0;k=c[q>>2]|0;c[q>>2]=0;do{if((k|0)!=0){if((c[l+44>>2]|0)==0){break}l=c[l+16>>2]|0;if((l|0)==0){break}q=_(c[l>>2]|0,e)|0;Zd(g,q+(c[l+4>>2]|0)|0,0-k|0,l)}}while(0);k=b+192|0;l=c[k>>2]|0;if((l|0)!=0){q=_(c[l>>2]|0,e)|0;Zd(g,q+(c[l+4>>2]|0)|0,30,l)}f=d[b+348|0]|0;l=f&7;f=f>>>4&7;r=+h[b+32>>3]*+((f>>>0<l>>>0?l:f)+1|0);Fc(b+376|0,r);Fc(b+1192|0,r);b=c[k>>2]|0;if((b|0)==0){i=j;return}q=_(c[b>>2]|0,e)|0;Zd(g,q+(c[b+4>>2]|0)|0,-30,b);i=j;return}l=(f|0)!=65318;if(!((f+ -65317|0)>>>0<2)){if(!(f>>>0>65327)){i=j;return}q=f<<1&30;a[b+q+236|0]=g>>>4;a[b+(q|1)+236|0]=g&15;i=j;return}o=a[b+350|0]>>7<<24>>24;m=d[b+349|0]&o;f=b+1192|0;q=c[b>>2]|0;t=q+44|0;c[t>>2]=c[t>>2]&o;t=q+16|0;p=c[t>>2]|0;n=m>>>3;s=n&2|m&1;c[q+20>>2]=s;s=c[q+(s<<2)>>2]|0;c[t>>2]=s;do{if((s|0)!=(p|0)){t=q+32|0;q=c[t>>2]|0;c[t>>2]=0;if((q|0)==0|(p|0)==0){break}t=_(c[p>>2]|0,e)|0;Zd(f,t+(c[p+4>>2]|0)|0,0-q|0,p)}}while(0);q=c[b+4>>2]|0;s=q+44|0;c[s>>2]=c[s>>2]&o;s=q+16|0;p=c[s>>2]|0;t=m>>>4&2|m>>>1&1;c[q+20>>2]=t;t=c[q+(t<<2)>>2]|0;c[s>>2]=t;do{if((t|0)!=(p|0)){t=q+32|0;q=c[t>>2]|0;c[t>>2]=0;if((q|0)==0|(p|0)==0){break}t=_(c[p>>2]|0,e)|0;Zd(f,t+(c[p+4>>2]|0)|0,0-q|0,p)}}while(0);q=c[b+8>>2]|0;s=q+44|0;c[s>>2]=c[s>>2]&o;s=q+16|0;p=c[s>>2]|0;t=m>>>5&2|m>>>2&1;c[q+20>>2]=t;t=c[q+(t<<2)>>2]|0;c[s>>2]=t;do{if((t|0)!=(p|0)){t=q+32|0;q=c[t>>2]|0;c[t>>2]=0;if((q|0)==0|(p|0)==0){break}t=_(c[p>>2]|0,e)|0;Zd(f,t+(c[p+4>>2]|0)|0,0-q|0,p)}}while(0);p=c[b+12>>2]|0;s=p+44|0;c[s>>2]=c[s>>2]&o;s=p+16|0;o=c[s>>2]|0;t=m>>>6&2|n&1;c[p+20>>2]=t;t=c[p+(t<<2)>>2]|0;c[s>>2]=t;do{if((t|0)!=(o|0)){t=p+32|0;m=c[t>>2]|0;c[t>>2]=0;if((m|0)==0|(o|0)==0){break}t=_(c[o>>2]|0,e)|0;Zd(f,t+(c[o+4>>2]|0)|0,0-m|0,o)}}while(0);if((g&128|0)==0&((l|k)^1)){g=0}else{i=j;return}while(1){if((g|0)==22){g=g+1|0;continue}else{Vd(b,e,g+65296|0,d[38904+g|0]|0);g=g+1|0;if((g|0)==32){break}else{continue}}}i=j;return}function Wd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;g=i;e=b+20|0;h=c[e>>2]|0;if((h|0)>(d|0)){za(38752,38616,131,38776)}if((h|0)==(d|0)){i=g;return}m=b+16|0;k=b+44|0;l=b+112|0;j=b+180|0;h=b+268|0;n=b+24|0;o=k;p=l;q=b+180|0;r=h;s=b+40|0;t=k;u=l;v=h;while(1){w=c[m>>2]|0;w=(w|0)>(d|0)?d:w;x=0;a:while(1){y=c[b+(x<<2)>>2]|0;z=c[y+16>>2]|0;do{if((z|0)!=0){c[z+40>>2]=1;do{if((c[y+44>>2]|0)==0){y=0}else{if((c[y+36>>2]|0)==0){y=0;break}if(!((a[(c[y+24>>2]|0)+4|0]&64)==0)){if((c[y+40>>2]|0)==0){y=0;break}}y=-1}}while(0);if((x|0)==2){je(j,c[e>>2]|0,w,y)}else if((x|0)==0){he(k,c[e>>2]|0,w,y)}else if((x|0)==1){he(l,c[e>>2]|0,w,y)}else if((x|0)==3){f=16;break a}else{break}x=x+1|0;continue a}}while(0);x=x+1|0;if((x|0)==4){break}}if((f|0)==16){f=0;ie(h,c[e>>2]|0,w,y)}c[e>>2]=w;if((w|0)==(d|0)){break}c[m>>2]=(c[m>>2]|0)+(c[n>>2]|0);de(o);de(p);de(q);de(r);w=(c[s>>2]|0)+1&3;c[s>>2]=w;if((w|0)==0){ee(t);ee(u);ee(v);w=c[s>>2]|0}if((w&1|0)==0){continue}ge(k)}i=g;return}function Xd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;e=i;d=a+20|0;if((c[d>>2]|0)<(b|0)){Wd(a,b)}f=a+16|0;a=c[f>>2]|0;if((a|0)<(b|0)){za(38792,38616,193,38824)}c[f>>2]=a-b;a=c[d>>2]|0;if((a|0)<(b|0)){za(38840,38616,196,38824)}else{c[d>>2]=a-b;i=e;return}}function Yd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;g=i;Wd(b,e);e=f+ -65296|0;if(!(e>>>0<48)){za(38936,38616,291,38976)}e=d[b+e+328|0]|0;if((f|0)!=65318){h=e;i=g;return h|0}e=e&128;h=e|112;f=c[b>>2]|0;do{if((c[f+44>>2]|0)!=0){if((c[f+40>>2]|0)==0){if(!((a[(c[f+24>>2]|0)+4|0]&64)==0)){break}}h=e|113}}while(0);f=c[b+4>>2]|0;do{if((c[f+44>>2]|0)!=0){if((c[f+40>>2]|0)==0){if(!((a[(c[f+24>>2]|0)+4|0]&64)==0)){break}}h=h|2}}while(0);f=c[b+8>>2]|0;do{if((c[f+44>>2]|0)!=0){if((c[f+40>>2]|0)==0){if(!((a[(c[f+24>>2]|0)+4|0]&64)==0)){break}}h=h|4}}while(0);b=c[b+12>>2]|0;if((c[b+44>>2]|0)==0){i=g;return h|0}do{if((c[b+40>>2]|0)==0){if((a[(c[b+24>>2]|0)+4|0]&64)==0){break}i=g;return h|0}}while(0);h=h|8;i=g;return h|0}function Zd(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=d>>>16;if((g|0)<(c[f+12>>2]|0)){j=_(c[a+8>>2]|0,e)|0;e=c[f+8>>2]|0;f=d>>>10&63;k=64-f|0;n=_(b[a+(k<<1)+40>>1]|0,j)|0;m=e+(g+4<<2)|0;l=_(b[a+(k+64<<1)+40>>1]|0,j)|0;d=e+(g+5<<2)|0;l=l+(c[d>>2]|0)|0;h=b[a+((k|128)<<1)+40>>1]|0;c[m>>2]=n+(c[m>>2]|0);c[d>>2]=l;h=_(h,j)|0;d=e+(g+6<<2)|0;k=_(b[a+(k+192<<1)+40>>1]|0,j)|0;l=e+(g+7<<2)|0;k=k+(c[l>>2]|0)|0;m=b[a+((f|192)<<1)+40>>1]|0;c[d>>2]=h+(c[d>>2]|0);c[l>>2]=k;m=_(m,j)|0;l=e+(g+8<<2)|0;k=_(b[a+((f|128)<<1)+40>>1]|0,j)|0;d=e+(g+9<<2)|0;k=k+(c[d>>2]|0)|0;h=b[a+((f|64)<<1)+40>>1]|0;c[l>>2]=m+(c[l>>2]|0);c[d>>2]=k;h=_(h,j)|0;d=e+(g+10<<2)|0;f=_(b[a+(f<<1)+40>>1]|0,j)|0;e=e+(g+11<<2)|0;f=f+(c[e>>2]|0)|0;c[d>>2]=h+(c[d>>2]|0);c[e>>2]=f;i=i;return}else{za(38992,39064,342,39104)}}function _d(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=d+ -40960|0;if(!(g>>>0<24576)){if(!((d^8192)>>>0<8192)){i=f;return}se(b,e);i=f;return}g=b+g+548|0;a[g]=e;if(!((d^57344)>>>0<8064)){i=f;return}if((d+ -65296|0)>>>0<48){Vd(b+25136|0,(c[b+424>>2]|0)-(c[(c[b+356>>2]|0)+36>>2]<<2)|0,d,e);i=f;return}if((d^65286)>>>0<2){te(b);i=f;return}if((d|0)==65280){a[g]=0;i=f;return}else{a[g]=-1;i=f;return}}function $d(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e;g=b+24|0;c[b+20>>2]=g;c[b+60>>2]=0;c[g>>2]=d;c[b+28>>2]=d;c[b+32>>2]=d;c[b+36>>2]=d;c[b+40>>2]=d;c[b+44>>2]=d;c[b+48>>2]=d;c[b+52>>2]=d;c[b+56>>2]=d;d=b;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[f>>2]=1;if((a[f]|0)==0){za(39248,39280,62,39320)}else{i=e;return}}function ae(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=i;if((b&8191|0)!=0){za(39128,39152,74,39192)}if((d&8191|0)!=0){za(39208,39152,75,39192)}b=b>>>13;d=d>>>13;if((d|0)==0){i=f;return}a=a+20|0;do{d=d+ -1|0;c[(c[a>>2]|0)+(d+b<<2)>>2]=e+(d<<13);}while((d|0)!=0);i=f;return}function be(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;j=i;i=i+48|0;n=j;k=j+40|0;h=f+24|0;c[f+60>>2]=(g+4|0)>>>2;l=n;m=f+20|0;c[m>>2]=n;g=h;o=l+0|0;p=g+0|0;q=o+40|0;do{c[o>>2]=c[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(q|0));I=k;r=f;N=r;p=N;N=N+4|0;N=d[N]|d[N+1|0]<<8|d[N+2|0]<<16|d[N+3|0]<<24;q=k;c[q>>2]=d[p]|d[p+1|0]<<8|d[p+2|0]<<16|d[p+3|0]<<24;c[q+4>>2]=N;q=f+8|0;N=c[q>>2]|0;p=f+12|0;J=e[p>>1]|0;o=f+7|0;L=d[o]|0;S=c[n+(N>>>13<<2)>>2]|0;R=N&8191;T=a[S+R|0]|0;s=n+36|0;P=(c[s>>2]|0)+ -1|0;c[s>>2]=P;if((P|0)==0){P=0;U=L;S=N;T=J;Q=k;N=Q;N=c[N>>2]|0;Q=Q+4|0;Q=c[Q>>2]|0;R=r;O=R;a[O]=N;a[O+1|0]=N>>8;a[O+2|0]=N>>16;a[O+3|0]=N>>24;R=R+4|0;a[R]=Q;a[R+1|0]=Q>>8;a[R+2|0]=Q>>16;a[R+3|0]=Q>>24;c[q>>2]=S;q=T&65535;b[p>>1]=q;p=U&255;a[o]=p;c[m>>2]=h;o=g+0|0;p=l+0|0;q=o+40|0;do{c[o>>2]=c[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(q|0));U=(P|0)>0;i=j;return U|0}x=k;F=x+4|0;w=I+6|0;D=f;E=D+88|0;G=D+ -336|0;u=k;t=k;x=x+2|0;C=k;v=k;B=I+1|0;H=I+3|0;A=I+2|0;z=I+5|0;y=I+4|0;I=I+7|0;f=f+16|0;Q=T&255;O=S+(R+1)|0;a:while(1){M=N+1|0;U=a[O]|0;O=U&255;b:do{switch(Q|0){case 203:{M=N+2|0;c:do{switch(O|0){case 127:case 125:case 124:case 123:case 122:case 121:case 120:case 119:case 117:case 116:case 115:case 114:case 113:case 112:case 111:case 109:case 108:case 107:case 106:case 105:case 104:case 103:case 101:case 100:case 99:case 98:case 97:case 96:case 95:case 93:case 92:case 91:case 90:case 89:case 88:case 87:case 85:case 84:case 83:case 82:case 81:case 80:case 79:case 77:case 76:case 75:case 74:case 73:case 72:case 71:case 69:case 68:case 67:case 66:case 65:case 64:{N=d[C+(O&7^1)|0]|0;K=67;break};case 126:case 118:case 110:case 102:case 94:case 86:case 78:case 70:{N=c[F>>2]|0;K=N&65535;if(!((K+ -65296|0)>>>0<48)){N=d[(c[n+(K>>>13<<2)>>2]|0)+(N&8191)|0]|0;K=67;break c}N=Yd(D+24800|0,(c[E>>2]|0)-(P<<2)|0,K)|0;K=67;break};case 254:case 246:case 238:case 230:case 222:case 214:case 206:case 198:case 190:case 182:case 174:case 166:case 158:case 150:case 142:case 134:{R=c[F>>2]|0;P=R&65535;N=R&65535;Q=(N+ -65296|0)>>>0<48;if(Q){S=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,N)|0}else{S=d[(c[(c[D+20>>2]|0)+(N>>>13<<2)>>2]|0)+(R&8191)|0]|0}R=1<<(O>>>3&7);O=S&~R|((O&64|0)==0?0:R);R=N+ -40960|0;if(!(R>>>0<24576)){if(!((N^8192)>>>0<8192)){break b}se(G,O);break b}R=G+R+548|0;a[R]=O;if(!((N^57344)>>>0<8064)){break b}if(Q){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,N,O);break b}if((N^65286)>>>0<2){te(G);break b}if(P<<16>>16==-256){a[R]=0;break b}else{a[R]=-1;break b}};case 255:case 253:case 252:case 251:case 250:case 249:case 248:case 247:case 245:case 244:case 243:case 242:case 241:case 240:case 239:case 237:case 236:case 235:case 234:case 233:case 232:case 231:case 229:case 228:case 227:case 226:case 225:case 224:case 223:case 221:case 220:case 219:case 218:case 217:case 216:case 215:case 213:case 212:case 211:case 210:case 209:case 208:case 207:case 205:case 204:case 203:case 202:case 201:case 200:case 199:case 197:case 196:case 195:case 194:case 193:case 192:{U=C+(O&7^1)|0;a[U]=d[U]|0|1<<(O>>>3&7);break b};case 55:case 53:case 52:case 51:case 50:case 49:case 48:{N=d[C+(O&7^1)|0]|0;K=88;break};case 47:case 45:case 44:case 43:case 42:case 41:case 40:case 15:case 13:case 12:case 11:case 10:case 9:case 8:case 31:case 29:case 28:case 27:case 26:case 25:case 24:{K=98;break};case 63:case 61:case 60:case 59:case 58:case 57:case 56:{O=O+16|0;K=98;break};case 191:case 189:case 188:case 187:case 186:case 185:case 184:case 183:case 181:case 180:case 179:case 178:case 177:case 176:case 175:case 173:case 172:case 171:case 170:case 169:case 168:case 167:case 165:case 164:case 163:case 162:case 161:case 160:case 159:case 157:case 156:case 155:case 154:case 153:case 152:case 151:case 149:case 148:case 147:case 146:case 145:case 144:case 143:case 141:case 140:case 139:case 138:case 137:case 136:case 135:case 133:case 132:case 131:case 130:case 129:case 128:{U=C+(O&7^1)|0;a[U]=(d[U]|0)&(1<<(O>>>3&7)^255);break b};case 38:case 22:case 6:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){Q=O;N=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=101;break b}else{Q=O;N=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=101;break b}};case 46:case 14:case 30:{K=94;break};case 23:case 21:case 20:case 19:case 18:case 17:case 16:case 7:case 5:case 4:case 3:case 2:case 1:case 0:case 39:case 37:case 36:case 35:case 34:case 33:case 32:{Q=O;N=d[C+(O&7^1)|0]|0;K=101;break b};case 62:{O=78;K=94;break};case 54:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){N=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=88;break c}else{N=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=88;break c}};default:{K=99;break a}}}while(0);if((K|0)==67){K=0;L=N<<(O>>>3&7^7)&128^(L&-225|160);break b}else if((K|0)==88){L=0;N=N>>4|N<<4;K=108;break b}else if((K|0)==94){K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){Q=O;N=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=104;break b}else{Q=O;N=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=104;break b}}else if((K|0)==98){Q=O;N=d[C+(O&7^1)|0]|0;K=104;break b}break};case 31:case 15:{N=d[w]|0;K=104;break};case 23:case 7:{N=d[w]|0;K=101;break};case 125:case 124:case 123:case 122:case 121:case 120:case 111:case 108:case 107:case 106:case 105:case 104:case 103:case 101:case 99:case 98:case 97:case 96:case 95:case 93:case 92:case 90:case 89:case 88:case 87:case 85:case 84:case 83:case 81:case 80:case 79:case 77:case 76:case 75:case 74:case 72:case 71:case 69:case 68:case 67:case 66:case 65:{a[C+(Q>>>3&7^1)|0]=a[C+(Q&7^1)|0]|0;break};case 119:case 117:case 116:case 115:case 114:case 113:case 112:{N=d[C+(Q&7^1)|0]|0;K=111;break};case 8:{P=(d[S+(R+2)|0]|0)<<8;O=P|O;M=N+3|0;N=J&255;Q=O+ -40960|0;do{if(Q>>>0<24576){P=G+Q+548|0;a[P]=J;if(!((O^57344)>>>0<8064)){break}if((O+ -65296|0)>>>0<48){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,O,N);break}if((O^65286)>>>0<2){te(G);break}if((O|0)==65280){a[P]=0;break}else{a[P]=-1;break}}else{if(!((P^8192)>>>0<8192)){break}se(G,N)}}while(0);N=O+1|0;P=J>>>8;Q=O+ -40959|0;if(!(Q>>>0<24576)){if(!((N^8192)>>>0<8192)){break b}se(G,P);break b}Q=G+Q+548|0;a[Q]=P;if(!((N^57344)>>>0<8064)){break b}if((O+ -65295|0)>>>0<48){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,N,P);break b}if((N^65286)>>>0<2){te(G);break b}if((N|0)==65280){a[Q]=0;break b}else{a[Q]=-1;break b}};case 35:case 19:case 3:{U=v+(Q>>>4<<1)|0;b[U>>1]=(b[U>>1]|0)+1<<16>>16;break};case 34:{P=e[F>>1]|0;b[F>>1]=P+1;K=155;break};case 226:{P=d[u]|0|65280;K=155;break};case 224:{M=N+2|0;P=O|65280;K=155;break};case 62:{a[w]=U;M=N+2|0;break};case 51:{J=J+1&65535;break};case 43:case 27:case 11:{U=v+(Q>>>4<<1)|0;b[U>>1]=(b[U>>1]|0)+ -1<<16>>16;break};case 17:case 1:{b[v+(Q>>>4<<1)>>1]=(d[S+(R+2)|0]|0)<<8|O;M=N+3|0;break};case 50:{P=e[F>>1]|0;b[F>>1]=P+65535;K=155;break};case 2:{P=e[t>>1]|0;K=155;break};case 18:{P=e[x>>1]|0;K=155;break};case 22:{a[H]=U;M=N+2|0;break};case 54:{M=c[F>>2]|0;P=M&65535;M=M&65535;Q=M+ -40960|0;do{if(Q>>>0<24576){Q=G+Q+548|0;a[Q]=U;if(!((M^57344)>>>0<8064)){break}if((M+ -65296|0)>>>0<48){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,M,O);break}if((M^65286)>>>0<2){te(G);break}if(P<<16>>16==-256){a[Q]=0;break}else{a[Q]=-1;break}}else{if(!((M^8192)>>>0<8192)){break}se(G,O)}}while(0);M=N+2|0;break};case 52:{P=c[F>>2]|0;K=P&65535;O=P&65535;N=(O+ -65296|0)>>>0<48;if(N){P=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,O)|0}else{P=d[(c[(c[D+20>>2]|0)+(O>>>13<<2)>>2]|0)+(P&8191)|0]|0}Q=P+1|0;P=Q&255;R=O+ -40960|0;if(!(R>>>0<24576)){if(!((O^8192)>>>0<8192)){K=204;break b}se(G,P);K=204;break b}R=G+R+548|0;a[R]=Q;if(!((O^57344)>>>0<8064)){K=204;break b}if(N){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,O,P);K=204;break b}if((O^65286)>>>0<2){te(G);K=204;break b}if(K<<16>>16==-256){a[R]=0;K=204;break b}else{a[R]=-1;K=204;break b}};case 6:{a[B]=U;M=N+2|0;break};case 59:{J=J+65535&65535;break};case 49:{M=N+3|0;J=(d[S+(R+2)|0]|0)<<8|O;break};case 14:{a[u]=U;M=N+2|0;break};case 249:{J=c[F>>2]&65535;break};case 30:{a[A]=U;M=N+2|0;break};case 38:{a[z]=U;M=N+2|0;break};case 46:{a[y]=U;M=N+2|0;break};case 234:{M=N+3|0;P=(d[S+(R+2)|0]|0)<<8|O;K=155;break};case 232:{K=(U<<24>>24)+J|0;L=0;M=N+2|0;O=J;J=K&65535;N=K;K=226;break};case 61:case 45:case 37:case 29:case 21:case 13:case 5:{K=C+(Q>>>3&7^1)|0;Q=(d[K]|0)+ -1|0;a[K]=Q;K=220;break};case 135:case 133:case 132:case 131:case 130:case 129:case 128:{O=d[C+(Q&7^1)|0]|0;K=232;break};case 198:{M=N+2|0;K=232;break};case 142:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=238;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=238;break b}};case 53:{P=c[F>>2]|0;N=P&65535;K=P&65535;O=(K+ -65296|0)>>>0<48;if(O){P=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0}else{P=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(P&8191)|0]|0}Q=P+ -1|0;P=Q&255;R=K+ -40960|0;if(!(R>>>0<24576)){if(!((K^8192)>>>0<8192)){K=220;break b}se(G,P);K=220;break b}R=G+R+548|0;a[R]=Q;if(!((K^57344)>>>0<8064)){K=220;break b}if(O){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K,P);K=220;break b}if((K^65286)>>>0<2){te(G);K=220;break b}if(N<<16>>16==-256){a[R]=0;K=220;break b}else{a[R]=-1;K=220;break b}};case 57:{N=J;K=224;break};case 150:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=244;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=244;break b}};case 143:case 141:case 140:case 139:case 138:case 137:case 136:{O=d[C+(Q&7^1)|0]|0;K=238;break};case 151:case 149:case 148:case 147:case 146:case 145:case 144:{O=d[C+(Q&7^1)|0]|0;K=244;break};case 214:{M=N+2|0;K=244;break};case 158:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=250;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=250;break b}};case 159:case 157:case 156:case 155:case 154:case 153:case 152:{O=d[C+(Q&7^1)|0]|0;K=250;break};case 222:{M=N+2|0;K=250;break};case 166:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;M=N;K=255;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;M=N;K=255;break b}};case 248:{L=0;M=N+2|0;O=J;N=(U<<24>>24)+J|0;K=225;break};case 165:case 164:case 163:case 162:case 161:case 160:{O=d[C+(Q&7^1)|0]|0;K=256;break};case 206:{M=N+2|0;K=238;break};case 230:{K=255;break};case 60:case 44:case 36:case 28:case 20:case 12:case 4:{K=C+(Q>>>3&7^1)|0;Q=(d[K]|0)+1|0;a[K]=Q;K=204;break};case 41:case 25:case 9:{N=e[v+(Q>>>4<<1)>>1]|0;K=224;break};case 134:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=232;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=232;break b}};case 47:{a[w]=(d[w]|0)^255;L=L|96;break};case 255:{if((M|0)==61454){M=N;K=309;break a}else{K=285}break};case 213:{N=e[x>>1]|0;K=33;break};case 246:{K=262;break};case 173:case 172:case 171:case 170:case 169:case 168:{O=d[C+(Q&7^1)|0]|0;K=270;break};case 245:{N=d[w]|0|L<<8;K=33;break};case 212:{M=N+3|0;if((L&16|0)==0){K=31}break};case 216:{if((L&16|0)!=0){K=56}break};case 24:{M=N+2+(U<<24>>24)&65535;break};case 175:{a[w]=0;L=128;break};case 174:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;M=N;K=269;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;M=N;K=269;break b}};case 238:{K=269;break};case 225:case 209:case 193:case 241:{if((J+ -65296|0)>>>0<48){N=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,J)|0}else{N=d[(c[(c[D+20>>2]|0)+(J>>>13<<2)>>2]|0)+(J&8191)|0]|0}O=J+1|0;if((J+ -65295|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,O)|0}else{O=d[(c[(c[D+20>>2]|0)+(O>>>13<<2)>>2]|0)+(O&8191)|0]|0}b[v+((Q>>>4&3)<<1)>>1]=(O<<8)+N;J=J+2&65535;if(!(T<<24>>24==-15)){break b}L=a[I]&240;break};case 197:{N=e[t>>1]|0;K=33;break};case 192:{if((L&128|0)==0){K=56}break};case 182:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;M=N;K=262;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;M=N;K=262;break b}};case 208:{if((L&16|0)==0){K=56}break};case 48:{M=N+2|0;if((L&16|0)!=0){break b}M=(U<<24>>24)+M&65535;break};case 194:{if((L&128|0)==0){K=301}else{M=N+3|0}break};case 210:{if((L&16|0)==0){K=301}else{M=N+3|0}break};case 218:{if((L&16|0)==0){M=N+3|0}else{K=301}break};case 181:case 180:case 179:case 178:case 177:case 176:{O=d[C+(Q&7^1)|0]|0;K=263;break};case 204:{M=N+3|0;if((L&128|0)!=0){K=31}break};case 195:{M=(d[S+(R+2)|0]|0)<<8|O;break};case 118:case 237:case 191:case 39:case 16:case 252:case 253:case 244:case 236:case 235:case 228:case 227:case 219:case 211:case 221:{K=307;break a};case 56:{M=N+2|0;if((L&16|0)==0){break b}M=(U<<24>>24)+M&65535;break};case 233:{M=c[F>>2]&65535;break};case 247:case 239:case 231:case 223:case 215:case 207:case 199:{K=285;break};case 229:{N=c[F>>2]&65535;K=33;break};case 55:{L=L&-113|16;break};case 220:{M=N+3|0;if((L&16|0)!=0){K=31}break};case 63:{L=L&-97^16;break};case 202:{if((L&128|0)==0){M=N+3|0}else{K=301}break};case 167:{L=a[w]|0;K=257;break};case 32:{M=N+2|0;if((L&128|0)!=0){break b}M=(U<<24>>24)+M&65535;break};case 40:{M=N+2|0;if((L&128|0)==0){break b}M=(U<<24>>24)+M&65535;break};case 33:{b[F>>1]=(d[S+(R+2)|0]|0)<<8|O;M=N+3|0;break};case 126:case 110:case 102:case 94:case 86:case 78:case 70:{N=e[F>>1]|0;O=C+(Q>>>3&7^1)|0;a[O]=a[(c[n+(N>>>13<<2)>>2]|0)+(N&8191)|0]|0;if(!((N+ -65296|0)>>>0<48)){break b}a[O]=Yd(D+24800|0,(c[E>>2]|0)-(P<<2)|0,N)|0;break};case 183:{L=a[w]|0;K=264;break};case 196:{M=N+3|0;if((L&128|0)==0){K=31}break};case 58:{N=e[F>>1]|0;b[F>>1]=N+65535;K=19;break};case 242:{N=d[u]|0|65280;K=19;break};case 189:case 188:case 187:case 186:case 185:case 184:{O=d[C+(Q&7^1)|0]|0;K=26;break};case 254:{M=N+2|0;K=26;break};case 200:{if((L&128|0)!=0){K=56}break};case 250:{M=N+3|0;N=(d[S+(R+2)|0]|0)<<8|O;K=19;break};case 190:{K=e[F>>1]|0;if((K+ -65296|0)>>>0<48){O=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,K)|0;K=26;break b}else{O=d[(c[(c[D+20>>2]|0)+(K>>>13<<2)>>2]|0)+(K&8191)|0]|0;K=26;break b}};case 42:{N=e[F>>1]|0;b[F>>1]=N+1;K=19;break};case 217:case 201:{K=56;break};case 10:{N=e[t>>1]|0;K=19;break};case 26:{N=e[x>>1]|0;K=19;break};case 251:case 243:case 127:case 109:case 100:case 91:case 82:case 73:case 64:case 0:{break};case 205:{K=32;break};case 240:{M=N+2|0;N=O|65280;K=19;break};default:{K=308;break a}}}while(0);do{if((K|0)==19){K=0;a[w]=a[(c[n+(N>>>13<<2)>>2]|0)+(N&8191)|0]|0;if(!((N+ -65296|0)>>>0<48)){break}a[w]=Yd(D+24800|0,(c[E>>2]|0)-(P<<2)|0,N)|0}else if((K|0)==26){L=d[w]|0;N=L-O|0;K=27}else if((K|0)==31){M=M+ -2|0;K=32}else if((K|0)==56){K=0;if((J+ -65296|0)>>>0<48){M=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,J)|0}else{M=d[(c[(c[D+20>>2]|0)+(J>>>13<<2)>>2]|0)+(J&8191)|0]|0}N=J+1|0;if((J+ -65295|0)>>>0<48){N=Yd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,N)|0}else{N=d[(c[(c[D+20>>2]|0)+(N>>>13<<2)>>2]|0)+(N&8191)|0]|0}M=(N<<8)+M|0;J=J+2&65535}else if((K|0)==101){K=(Q&L)>>>4&1|N<<1;L=N>>>3&16;if(!(Q>>>0<16)){O=Q;N=K;K=108;break}O=Q;N=K|N>>>7&16777215;K=108}else if((K|0)==104){K=(Q&L)<<4|N;L=N<<4&16;if(Q>>>0<16){K=K<<8|K}N=K>>>1;if((Q&32|0)==0){O=Q;K=108;break}O=Q;N=N|K&128;K=108}else if((K|0)==155){K=0;N=a[w]|0;O=N&255;Q=P+ -40960|0;if(!(Q>>>0<24576)){if(!((P^8192)>>>0<8192)){break}se(G,O);break}Q=G+Q+548|0;a[Q]=N;if(!((P^57344)>>>0<8064)){break}if((P+ -65296|0)>>>0<48){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,P,O);break}if((P^65286)>>>0<2){te(G);break}if((P|0)==65280){a[Q]=0;break}else{a[Q]=-1;break}}else if((K|0)==204){K=0;L=Q>>>1&128|L&16|(Q&15)+63&32}else if((K|0)==220){K=0;L=(Q&15)+49&32|L&16|((Q&255|0)==0?192:64)}else if((K|0)==224){U=c[F>>2]&65535;L=L&128;O=U;N=U+N|0;K=225}else if((K|0)==238){O=O+(L>>>4&1)&255;K=232}else if((K|0)==250){O=O+(L>>>4&1)&255;K=244}else if((K|0)==255){M=M+1|0;K=256}else if((K|0)==262){M=M+1|0;K=263}else if((K|0)==269){M=M+1|0;K=270}else if((K|0)==285){N=M;M=(c[f>>2]|0)+(Q&56)|0;K=33}else if((K|0)==301){K=0;M=(d[S+(R+2)|0]|0)<<8|O}}while(0);do{if((K|0)==32){N=M+2|0;M=(d[S+(R+2)|0]|0)<<8|O;K=33}else if((K|0)==108){K=0;O=O&7;L=(N&255|0)==0?L|128:L;if((O|0)==6){K=111;break}a[C+(O^1)|0]=N}else if((K|0)==225){b[F>>1]=N;K=226}else if((K|0)==232){K=0;L=d[w]|0;U=L+O|0;L=(U&15)-(L&15)&32|U>>>4&16;a[w]=U;L=(U&255|0)==0?L|128:L}else if((K|0)==244){L=d[w]|0;N=L-O|0;a[w]=N;K=27}else if((K|0)==256){L=(d[w]|0)&O&255;a[w]=L;K=257}else if((K|0)==263){L=(d[w]|0|O)&255;a[w]=L;K=264}else if((K|0)==270){K=0;L=(d[w]|0)^O;a[w]=L;L=(L+511|0)>>>1&128}}while(0);do{if((K|0)==27){K=0;L=((N&255|0)==0?192:64)|N>>>4&16|(L&15)-(N&15)&32}else if((K|0)==33){K=0;O=J+65535&65535;P=N>>>8;Q=O+ -40960|0;do{if(Q>>>0<24576){Q=G+Q+548|0;a[Q]=P;if(!((O^57344)>>>0<8064)){break}if((O+ -65296|0)>>>0<48){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,O,P);break}if((O^65286)>>>0<2){te(G);break}if((O|0)==65280){a[Q]=0;break}else{a[Q]=-1;break}}else{if(!((O^8192)>>>0<8192)){break}se(G,P)}}while(0);J=J+65534&65535;O=N&255;P=J+ -40960|0;if(!(P>>>0<24576)){if(!((J^8192)>>>0<8192)){break}se(G,O);break}P=G+P+548|0;a[P]=N;if(!((J^57344)>>>0<8064)){break}if((J+ -65296|0)>>>0<48){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,J,O);break}if((J^65286)>>>0<2){te(G);break}if((J|0)==65280){a[P]=0;J=65280;break}else{a[P]=-1;break}}else if((K|0)==111){K=0;P=c[F>>2]|0;Q=P&65535;P=P&65535;O=N&255;R=P+ -40960|0;if(!(R>>>0<24576)){if(!((P^8192)>>>0<8192)){break}se(G,O);break}R=G+R+548|0;a[R]=N;if(!((P^57344)>>>0<8064)){break}if((P+ -65296|0)>>>0<48){Vd(D+24800|0,(c[D+88>>2]|0)-(c[(c[D+20>>2]|0)+36>>2]<<2)|0,P,O);break}if((P^65286)>>>0<2){te(G);break}if(Q<<16>>16==-256){a[R]=0;break}else{a[R]=-1;break}}else if((K|0)==226){K=0;L=L|N>>>12&16|((N&4095)-(O&4095)|0)>>>7&32}else if((K|0)==257){K=0;L=((L&255)+511|0)>>>1&128|32}else if((K|0)==264){K=0;L=((L&255)+511|0)>>>1&128}}while(0);S=c[n+(M>>>13<<2)>>2]|0;R=M&8191;T=a[S+R|0]|0;P=(c[s>>2]|0)+ -1|0;c[s>>2]=P;if((P|0)==0){P=0;K=309;break}else{N=M;Q=T&255;O=S+(R+1)|0}}if((K|0)==99){za(39232,39152,452,39240)}else if((K|0)==307){P=P+1|0;c[s>>2]=P;U=L;S=N;T=J;Q=k;N=Q;N=c[N>>2]|0;Q=Q+4|0;Q=c[Q>>2]|0;R=r;O=R;a[O]=N;a[O+1|0]=N>>8;a[O+2|0]=N>>16;a[O+3|0]=N>>24;R=R+4|0;a[R]=Q;a[R+1|0]=Q>>8;a[R+2|0]=Q>>16;a[R+3|0]=Q>>24;c[q>>2]=S;q=T&65535;b[p>>1]=q;p=U&255;a[o]=p;c[m>>2]=h;o=g+0|0;p=l+0|0;q=o+40|0;do{c[o>>2]=c[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(q|0));U=(P|0)>0;i=j;return U|0}else if((K|0)==308){za(39232,39152,1041,39240)}else if((K|0)==309){T=k;R=T;R=c[R>>2]|0;T=T+4|0;T=c[T>>2]|0;U=r;S=U;a[S]=R;a[S+1|0]=R>>8;a[S+2|0]=R>>16;a[S+3|0]=R>>24;U=U+4|0;a[U]=T;a[U+1|0]=T>>8;a[U+2|0]=T>>16;a[U+3|0]=T>>24;c[q>>2]=M;q=J&65535;b[p>>1]=q;p=L&255;a[o]=p;c[m>>2]=h;o=g+0|0;p=l+0|0;q=o+40|0;do{c[o>>2]=c[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(q|0));U=(P|0)>0;i=j;return U|0}return 0}function ce(a){a=a|0;c[a+28>>2]=0;c[a+32>>2]=0;c[a+40>>2]=0;c[a+20>>2]=3;c[a+16>>2]=c[a+12>>2];i=i;return}function de(b){b=b|0;var d=0,e=0;d=i;if((a[(c[b+24>>2]|0)+4|0]&64)==0){i=d;return}e=b+40|0;b=c[e>>2]|0;if((b|0)==0){i=d;return}c[e>>2]=b+ -1;i=d;return}function ee(b){b=b|0;var e=0,f=0,g=0;e=i;f=b+48|0;g=c[f>>2]|0;if((g|0)==0){i=e;return}g=g+ -1|0;c[f>>2]=g;if((g|0)!=0){i=e;return}g=(c[b+24>>2]|0)+2|0;c[f>>2]=a[g]&7;f=b+36|0;b=(c[f>>2]|0)+ -1+((d[g]|0)>>>2&2)|0;if(!(b>>>0<15)){i=e;return}c[f>>2]=b;i=e;return}function fe(a){a=a|0;c[a+64>>2]=0;c[a+60>>2]=0;c[a+56>>2]=0;c[a+48>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;c[a+40>>2]=0;c[a+20>>2]=3;c[a+16>>2]=c[a+12>>2];i=i;return}function ge(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0;f=i;g=b+24|0;h=c[g>>2]|0;k=(d[h]|0)>>>4&7;if((k|0)==0){i=f;return}e=b+56|0;j=c[e>>2]|0;if((j|0)==0){i=f;return}j=j+ -1|0;c[e>>2]=j;if((j|0)!=0){i=f;return}c[e>>2]=k;b=b+60|0;a[h+3|0]=c[b>>2];h=(c[g>>2]|0)+4|0;a[h]=(c[b>>2]|0)>>>8&7|a[h]&248;h=c[b>>2]|0;k=d[c[g>>2]|0]|0;g=h>>(k&7);g=((k&8|0)==0?g:0-g|0)+h|0;c[b>>2]=g;if((g|0)<0){c[b>>2]=0;i=f;return}if((g|0)<=2047){i=f;return}c[e>>2]=0;c[b>>2]=2048;i=f;return}function he(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;o=(c[a+60>>2]|0)==2048?0:f;l=c[a+24>>2]|0;h=d[39352+((d[l+1|0]|0)>>>6)|0]|0;k=c[a+36>>2]|0;j=k&o;f=a+64|0;l=(d[l+4|0]|0)<<8&1792|(d[l+3|0]|0);n=(l+ -1|0)>>>0>2040;m=n?k>>1:(c[f>>2]|0)<(h|0)?j:0-j|0;j=a+32|0;k=c[j>>2]|0;if((m|0)!=(k|0)){c[j>>2]=m;q=c[a+16>>2]|0;p=_(c[q>>2]|0,b)|0;Sb(c[a+52>>2]|0,p+(c[q+4>>2]|0)|0,m-k|0,q)}k=a+28|0;p=n|(o|0)==0?e:(c[k>>2]|0)+b|0;if((p|0)>=(e|0)){q=p;q=q-e|0;c[k>>2]=q;i=g;return}l=2048-l<<2;b=c[a+16>>2]|0;n=a+52|0;a=b;o=b+4|0;q=m<<1;m=c[f>>2]|0;do{m=m+1&7;if((m|0)==0|(m|0)==(h|0)){q=0-q|0;r=_(c[a>>2]|0,p)|0;Sb(c[n>>2]|0,r+(c[o>>2]|0)|0,q,b)}p=p+l|0;}while((p|0)<(e|0));c[f>>2]=m;c[j>>2]=q>>1;r=p;r=r-e|0;c[k>>2]=r;i=g;return}function ie(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;j=i;l=c[b+36>>2]&g;n=b+24|0;k=13-(a[(c[n>>2]|0)+3|0]&8)|0;h=b+56|0;o=(2<<k&c[h>>2]|0)==0?l:0-l|0;l=b+32|0;m=c[l>>2]|0;if((o|0)!=(m|0)){c[l>>2]=o;s=c[b+16>>2]|0;r=_(c[s>>2]|0,e)|0;Zd(c[b+52>>2]|0,r+(c[s+4>>2]|0)|0,o-m|0,s)}m=b+28|0;q=(g|0)==0?f:(c[m>>2]|0)+e|0;if((q|0)>=(f|0)){s=q;s=s-f|0;c[m>>2]=s;i=j;return}e=d[(c[n>>2]|0)+3|0]|0;e=(d[39360+(e&7)|0]|0)<<(e>>>4);g=c[b+16>>2]|0;s=c[g>>2]|0;n=_(s,e)|0;s=_(s,q)|0;b=b+52|0;p=c[h>>2]|0;r=o<<1;o=s+(c[g+4>>2]|0)|0;while(1){q=q+e|0;s=p<<1;if(((p>>>k)+1&2|0)==0){p=s}else{r=0-r|0;Zd(c[b>>2]|0,o,r,g);p=s|1}if((q|0)<(f|0)){o=o+n|0}else{break}}c[h>>2]=p;c[l>>2]=r>>1;s=q;s=s-f|0;c[m>>2]=s;i=j;return}function je(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;j=(c[a+36>>2]|0)+7&7;g=a+52|0;m=c[a+24>>2]|0;m=(d[m+4|0]|0)<<8&1792|(d[m+3|0]|0);if((m+ -1|0)>>>0>2044){l=0;k=30>>>j&f}else{l=f;k=((d[a+(c[g>>2]|0)+56|0]|0)>>>j&f)<<1}f=a+32|0;n=c[f>>2]|0;if((k|0)!=(n|0)){c[f>>2]=k;s=c[a+16>>2]|0;r=_(c[s>>2]|0,b)|0;Zd(c[a+48>>2]|0,r+(c[s+4>>2]|0)|0,k-n|0,s)}k=a+28|0;s=(l|0)==0?e:(c[k>>2]|0)+b|0;if((s|0)>=(e|0)){s=s-e|0;c[k>>2]=s;i=h;return}l=c[a+16>>2]|0;n=2048-m<<1;b=a+48|0;o=l;m=l+4|0;r=c[g>>2]|0;do{r=r+1&31;p=(d[a+r+56|0]|0)>>>j<<1;q=c[f>>2]|0;if((p|0)!=(q|0)){c[f>>2]=p;t=_(c[o>>2]|0,s)|0;Zd(c[b>>2]|0,t+(c[m>>2]|0)|0,p-q|0,l)}s=s+n|0;}while((s|0)<(e|0));c[g>>2]=r;t=s;t=t-e|0;c[k>>2]=t;i=h;return}function ke(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;f=(_(e,-5)|0)+f|0;j=b+112|0;if((e|0)==2){if((f|0)==2){c[b+216>>2]=g>>>5&3;i=h;return}else if((f|0)==1){c[b+220>>2]=256-(d[(c[b+204>>2]|0)+1|0]|0);i=h;return}else if((f|0)==4){if((g&128&(d[c[b+204>>2]|0]|0)|0)==0){i=h;return}c[b+232>>2]=0;c[b+224>>2]=1;b=b+220|0;if((c[b>>2]|0)!=0){i=h;return}c[b>>2]=256;i=h;return}else if((f|0)==0){if((g&128|0)!=0){i=h;return}c[b+224>>2]=0;i=h;return}else{i=h;return}}else if((e|0)!=1)if((e|0)==0){j=b+44|0}else if((e|0)==3){if((f|0)==1){c[b+308>>2]=64-(a[(c[b+292>>2]|0)+1|0]&63);i=h;return}else if((f|0)==2){if(g>>>0>15){i=h;return}c[b+312>>2]=0;i=h;return}else if((f|0)==4){if((g&128|0)==0){i=h;return}e=(c[b+292>>2]|0)+2|0;c[b+316>>2]=a[e]&7;c[b+304>>2]=(d[e]|0)>>>4;c[b+312>>2]=1;e=b+308|0;if((c[e>>2]|0)==0){c[e>>2]=64}c[b+324>>2]=32767;i=h;return}else{i=h;return}}else{i=h;return}if((f|0)==1){c[j+40>>2]=64-(a[(c[j+24>>2]|0)+1|0]&63);i=h;return}else if((f|0)==4){if((g&128|0)==0){i=h;return}g=(c[j+24>>2]|0)+2|0;c[j+48>>2]=a[g]&7;c[j+36>>2]=(d[g]|0)>>>4;c[j+44>>2]=1;g=j+40|0;if((c[g>>2]|0)==0){c[g>>2]=64}if((e|0)!=0){i=h;return}g=b+68|0;k=c[g>>2]|0;j=k+3|0;f=a[j]|0;e=b+104|0;c[e>>2]=(d[k+4|0]|0)<<8&1792|f&255;l=d[b+328|0]|0;if((l&112|0)==0|(l&7|0)==0){i=h;return}b=b+100|0;c[b>>2]=1;k=(d[k]|0)>>>4&7;if((k|0)==0){i=h;return}c[b>>2]=k;a[j]=f;f=(c[g>>2]|0)+4|0;a[f]=(c[e>>2]|0)>>>8&7|a[f]&248;f=c[e>>2]|0;l=d[c[g>>2]|0]|0;g=f>>(l&7);g=((l&8|0)==0?g:0-g|0)+f|0;c[e>>2]=g;if((g|0)<0){c[e>>2]=0;i=h;return}if((g|0)<=2047){i=h;return}c[b>>2]=0;c[e>>2]=2048;i=h;return}else if((f|0)==2){if(g>>>0>15){i=h;return}c[j+44>>2]=0;i=h;return}else{i=h;return}}function le(a){a=a|0;var b=0;b=i;c[a>>2]=39376;Al(c[a+400>>2]|0);Ic(a);Al(a);i=b;return}function me(a){a=a|0;var b=0;b=i;c[a>>2]=39376;Al(c[a+400>>2]|0);Ic(a);i=b;return}function ne(a){a=a|0;var b=0,d=0,e=0;b=i;e=a+400|0;d=c[e>>2]|0;c[e>>2]=0;c[a+404>>2]=0;Al(d);Bg(a);i=b;return}function oe(a,b,c){a=a|0;b=b|0;c=c|0;c=i;Me(b+272|0,a+452|0,32);Me(b+784|0,a+484|0,32);Me(b+1040|0,a+516|0,32);i=c;return 0}function pe(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+436|0;e=Qc(b+400|0,e,112,g,0,16392)|0;if((e|0)!=0){i=f;return e|0}e=d[b+440|0]|0;c[b+12>>2]=e;c[b+8>>2]=e;e=(Jl(g,39904,3)|0)==0;g=e?0:c[10038]|0;if((g|0)!=0){e=g;i=f;return e|0}if((a[b+439|0]|0)!=1){c[b+16>>2]=39576}if(!((a[b+451|0]&120)==0)){c[b+16>>2]=39600}e=a[b+443|0]|0;if((a[b+445|0]|e|a[b+447|0])<<24>>24<0|(e&255)<<8>>>0<1024){c[b+16>>2]=39624}c[b+232>>2]=4;h[b+25168>>3]=+h[b+248>>3]*625.0e-6;Ud(b+25136|0);e=Nc(b,4194304)|0;i=f;return e|0}function qe(a,b){a=a|0;b=b|0;var c=0;c=i;Sd(a+25136|0,b);i=c;return}function re(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=i;Td(a+25136|0,b,c,d,e);i=f;return}function se(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;b=c[a+416>>2]&b<<14;do{if((b|0)==0){if((c[a+420>>2]|0)<=16384){break}i=d;return}}while(0);e=b-(c[a+412>>2]|0)|0;b=c[a+404>>2]|0;e=e>>>0>(b+ -16392|0)>>>0?0:e;if(b>>>0<e>>>0){za(39832,39848,58,39888)}ae(a+336|0,16384,16384,(c[a+400>>2]|0)+e|0);i=d;return}function te(b){b=b|0;var e=0,f=0.0,g=0.0,j=0;e=i;j=d[b+451|0]|0;if((j&4|0)==0){c[b+428>>2]=70224;f=70224.0}else{j=256-(d[b+24874|0]|0)<<(d[39656+(a[b+24875|0]&3)|0]|0)-(j>>>7);c[b+428>>2]=j;f=+(j|0)}g=+h[b+240>>3];if(!(g!=1.0)){i=e;return}c[b+428>>2]=~~(f/g);i=e;return}function ue(b,e){b=b|0;e=+e;var f=0,g=0.0,j=0;f=i;Qd(b+25136|0,e);j=d[b+451|0]|0;if((j&4|0)==0){c[b+428>>2]=70224;e=70224.0}else{j=256-(d[b+24874|0]|0)<<(d[39656+(a[b+24875|0]&3)|0]|0)-(j>>>7);c[b+428>>2]=j;e=+(j|0)}g=+h[b+240>>3];if(!(g!=1.0)){i=f;return}c[b+428>>2]=~~(e/g);i=f;return}function ve(e,f){e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0;g=i;j=Oc(e,f)|0;if((j|0)!=0){o=j;i=g;return o|0}k=e+548|0;Pl(k|0,0,16384)|0;Pl(e+16932|0,-1,8064)|0;Pl(e+24996|0,0,136)|0;a[e+24868|0]=0;l=e+25136|0;Rd(l);j=0;do{Vd(l,0,j+65296|0,d[39664+j|0]|0);j=j+1|0;}while((j|0)!=48);m=(d[e+443|0]|0)<<8|(d[e+442|0]|0);l=e+400|0;Rc(l,m,16384);j=e+336|0;c[e+352>>2]=m;$d(j,c[l>>2]|0);ae(j,40960,24576,k);m=e+412|0;o=0-(c[m>>2]|0)|0;k=e+404|0;n=c[k>>2]|0;o=(n+ -16392|0)>>>0<o>>>0?0:o;if(n>>>0<o>>>0){za(39832,39848,58,39888)}ae(j,0,16384,(c[l>>2]|0)+o|0);o=(c[e+420>>2]|0)>16384;l=(o&1)<<14&c[e+416>>2];do{if((l|0)!=0|o^1){l=l-(c[m>>2]|0)|0;k=c[k>>2]|0;l=l>>>0>(k+ -16392|0)>>>0?0:l;if(k>>>0<l>>>0){za(39832,39848,58,39888)}else{ae(j,16384,16384,(c[e+400>>2]|0)+l|0);break}}}while(0);j=a[e+450|0]|0;a[e+24874|0]=j;k=a[e+451|0]|0;a[e+24875|0]=k;k=k&255;if((k&4|0)==0){c[e+428>>2]=70224;j=70224;p=70224.0}else{o=256-(j&255)<<(d[39656+(k&3)|0]|0)-(k>>>7);c[e+428>>2]=o;j=o;p=+(o|0)}q=+h[e+240>>3];if(q!=1.0){j=~~(p/q);c[e+428>>2]=j}c[e+432>>2]=j;a[e+342|0]=f;o=((d[e+449|0]|0)<<8|(d[e+448|0]|0))&65535;n=e+348|0;c[e+424>>2]=0;c[e+344>>2]=(d[e+445|0]|0)<<8|(d[e+444|0]|0);o=o+ -1<<16>>16;b[n>>1]=o;_d(e,o&65535,240);o=(b[n>>1]|0)+ -1<<16>>16;b[n>>1]=o;_d(e,o&65535,13);o=0;i=g;return o|0}function we(a,e,f){a=a|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;g=a+424|0;c[g>>2]=0;s=c[e>>2]|0;a:do{if((s|0)>0){j=a+336|0;n=a+356|0;o=a+344|0;q=a+432|0;h=a+428|0;l=a+446|0;m=a+447|0;k=a+348|0;p=a+16|0;r=0;b:while(1){c[g>>2]=s;t=be(j,s-r|0)|0;r=(c[g>>2]|0)-(c[(c[n>>2]|0)+36>>2]<<2)|0;c[g>>2]=r;do{if(t){s=c[o>>2]|0;if((s|0)!=61453){if((s|0)>65535){c[o>>2]=s&65535;break}else{c[p>>2]=39712;c[o>>2]=s+1&65535;r=r+6|0;c[g>>2]=r;break}}t=c[q>>2]|0;s=c[e>>2]|0;if((t|0)>(s|0)){break b}if((r|0)<(t|0)){c[g>>2]=t}c[q>>2]=t+(c[h>>2]|0);c[o>>2]=(d[m]|0)<<8|(d[l]|0);r=(b[k>>1]|0)+ -1<<16>>16;b[k>>1]=r;_d(a,r&65535,240);r=(b[k>>1]|0)+ -1<<16>>16;b[k>>1]=r;_d(a,r&65535,13);r=c[g>>2]|0}}while(0);s=c[e>>2]|0;if((r|0)>=(s|0)){break a}}c[g>>2]=s;r=s}else{q=a+432|0;r=0}}while(0);c[e>>2]=r;g=c[g>>2]|0;e=(c[q>>2]|0)-g|0;c[q>>2]=(e|0)<0?0:e;Xd(a+25136|0,g);i=f;return 0}function xe(){var a=0,b=0,d=0,e=0,f=0,g=0;a=i;i=i+80|0;b=a;f=zl(26888)|0;if((f|0)==0){g=0;i=a;return g|0}d=f;c[f+352>>2]=0;c[f+356>>2]=f+360;Gc(f);c[f>>2]=39376;c[f+400>>2]=0;c[f+404>>2]=0;Pd(f+25136|0);c[f+4>>2]=39552;c[f+228>>2]=39472;c[f+332>>2]=39536;c[f+284>>2]=6;c[f+224>>2]=21;if((c[f+256>>2]|0)!=0){za(40040,40056,228,40096)}e=f;h[f+248>>3]=1.2;g=b+0|0;f=g+80|0;do{c[g>>2]=0;g=g+4|0}while((g|0)<(f|0));h[b>>3]=-1.0;h[b+8>>3]=120.0;Hg(e,b);g=d;i=a;return g|0}function ye(){var a=0,b=0,d=0;a=i;b=zl(432)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=39936;c[b+4>>2]=39552;b=d;i=a;return b|0}function ze(a){a=a|0;var b=0;b=i;Eg(a);i=b;return}function Ae(a){a=a|0;var b=0;b=i;Eg(a);Al(a);i=b;return}function Be(a,b){a=a|0;b=b|0;var e=0,f=0;e=i;f=a+316|0;b=eb[c[(c[b>>2]|0)+12>>2]&63](b,f,112)|0;if((b|0)==0){b=d[a+320|0]|0;c[a+12>>2]=b;c[a+8>>2]=b;b=(Jl(f,39904,3)|0)==0;b=b?0:c[10038]|0;i=e;return b|0}else{b=(b|0)==37536?c[10038]|0:b;i=e;return b|0}return 0}function Ce(a,b,c){a=a|0;b=b|0;c=c|0;c=i;Me(b+272|0,a+332|0,32);Me(b+784|0,a+364|0,32);Me(b+1040|0,a+396|0,32);i=c;return 0}function De(a){a=a|0;var b=0,d=0,e=0;b=i;c[a+44>>2]=0;e=a+28|0;d=c[e>>2]|0;c[e>>2]=0;c[a+32>>2]=0;Al(d);d=a+36|0;e=c[d>>2]|0;c[d>>2]=0;c[a+40>>2]=0;Al(e);ib[c[(c[a>>2]|0)+32>>2]&127](a);c[a+8>>2]=0;c[a+12>>2]=0;e=a+132|0;d=c[e>>2]|0;c[e>>2]=0;c[a+136>>2]=0;Al(d);i=b;return}function Ee(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+8|0;e=d;c[b>>2]=40168;g=b+132|0;c[g>>2]=0;f=b+136|0;c[f>>2]=0;c[b+4>>2]=0;j=b+20|0;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+16>>2]=0;c[j+20>>2]=0;c[j+24>>2]=0;j=b+36|0;h=c[j>>2]|0;c[j>>2]=0;c[b+40>>2]=0;Al(h);ib[c[(c[b>>2]|0)+32>>2]&127](b);c[b+8>>2]=0;c[b+12>>2]=0;b=c[g>>2]|0;c[g>>2]=0;c[f>>2]=0;Al(b);c[e>>2]=1;if((a[e]|0)==0){za(40480,40512,62,40552)}else{i=d;return}}function Fe(a){a=a|0;var b=0;b=i;Ge(a);Al(a);i=b;return}function Ge(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=40168;d=c[a+24>>2]|0;if((d|0)!=0){ib[d&127](c[a+20>>2]|0)}Al(c[a+132>>2]|0);Al(c[a+36>>2]|0);Al(c[a+28>>2]|0);i=b;return}function He(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;if((c[a+132>>2]|0)==(b|0)){za(40208,40240,55,40280)}else{bd(f,b,d);b=ob[c[(c[a>>2]|0)+12>>2]&63](a,f)|0;i=e;return b|0}return 0}function Ie(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;h=kb[c[(c[b>>2]|0)+16>>2]&15](b)|0;e=a+132|0;g=Bl(c[e>>2]|0,h)|0;if(!((g|0)!=0|(h|0)==0)){b=40392;i=d;return b|0}c[e>>2]=g;f=a+136|0;c[f>>2]=h;g=eb[c[(c[b>>2]|0)+12>>2]&63](b,g,h)|0;if((g|0)!=0){b=g;i=d;return b|0}b=eb[c[(c[a>>2]|0)+16>>2]&63](a,c[e>>2]|0,c[f>>2]|0)|0;i=d;return b|0}function Je(a){a=a|0;var b=0;b=i;ib[c[(c[a>>2]|0)+8>>2]&127](a);i=b;return}function Ke(a){a=a|0;i=i;return}function Le(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=a;ib[c[(c[e>>2]|0)+24>>2]&127](a);b=ob[c[(c[a>>2]|0)+12>>2]&63](a,b)|0;f=a+8|0;if((c[f>>2]|0)==0){g=c[(c[a+4>>2]|0)+4>>2]|0;c[a+12>>2]=g;c[f>>2]=g}e=c[e>>2]|0;if((b|0)==0){ib[c[e+28>>2]&127](a);i=d;return b|0}else{ib[c[e+8>>2]&127](a);i=d;return b|0}return 0}function Me(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0;f=i;if((c|0)==0){i=f;return}g=a[c]|0;if(g<<24>>24==0){i=f;return}a:do{if((e|0)==0){g=0}else{while(1){if(!(((g<<24>>24)+ -1|0)>>>0<32)){g=e;break a}h=c+1|0;e=e+ -1|0;if((e|0)==0){g=0;c=h;break a}c=h;g=a[h]|0}}}while(0);g=(g|0)>255?255:g;b:do{if((g|0)>0){e=0;while(1){h=e+1|0;if((a[c+e|0]|0)==0){break b}if((h|0)<(g|0)){e=h}else{e=h;break}}}else{e=0}}while(0);while(1){if((e|0)==0){e=0;break}g=e+ -1|0;if((d[c+g|0]|0)<33){e=g}else{break}}a[b+e|0]=0;Nl(b|0,c|0,e|0)|0;do{if((Kl(b,40296)|0)!=0){if((Kl(b,40304)|0)==0){break}if((Kl(b,40312)|0)==0){break}i=f;return}}while(0);a[b]=0;i=f;return}function Ne(a,b){a=a|0;b=b|0;var c=0;c=i;Me(a,b,255);i=c;return}function Oe(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0;e=i;f=c[b>>2]|0;if(!(f>>>0<(c[a+8>>2]|0)>>>0)){h=40320;i=e;return h|0}g=c[a+32>>2]|0;do{if(f>>>0<g>>>0){if(g>>>0<f>>>0){za(40408,40424,58,40464)}h=c[a+28>>2]|0;c[b>>2]=0;g=c[h+(f*40|0)+16>>2]|0;do{if((g|0)>-1){c[b>>2]=g;if((c[(c[a+4>>2]|0)+20>>2]&2|0)!=0){break}g=g-(d[h+(f*40|0)+12|0]|0)|0;c[b>>2]=g}else{g=0}}while(0);if((g|0)<(c[a+12>>2]|0)){break}else{a=40336}i=e;return a|0}}while(0);h=0;i=e;return h|0}function Pe(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;s=b+8|0;c[e>>2]=c[s>>2];k=e+4|0;c[k>>2]=-1;h=e+12|0;c[h>>2]=-1;j=e+8|0;c[j>>2]=-1;l=e+528|0;a[l]=0;n=e+272|0;a[n]=0;o=e+784|0;a[o]=0;a[e+1040|0]=0;a[e+1296|0]=0;p=e+1552|0;a[p]=0;r=e+16|0;a[r]=0;q=b+4|0;Me(r,c[c[q>>2]>>2]|0,255);if(!((c[s>>2]|0)>>>0>f>>>0)){s=40320;i=g;return s|0}m=b+32|0;r=c[m>>2]|0;do{if(r>>>0>f>>>0){if(r>>>0<f>>>0){za(40408,40424,58,40464)}r=c[b+28>>2]|0;s=c[r+(f*40|0)+16>>2]|0;do{if((s|0)>-1){if((c[(c[q>>2]|0)+20>>2]&2|0)!=0){break}s=s-(d[r+(f*40|0)+12|0]|0)|0}else{s=0}}while(0);if((s|0)<(c[b+12>>2]|0)){break}else{h=40336}i=g;return h|0}else{s=f}}while(0);e=eb[c[(c[b>>2]|0)+20>>2]&63](b,e,s)|0;if((e|0)!=0){s=e;i=g;return s|0}if((c[m>>2]|0)==0){s=0;i=g;return s|0}Me(n,c[b+48>>2]|0,255);Me(o,c[b+56>>2]|0,255);Me(o,c[b+52>>2]|0,255);Me(p,c[b+60>>2]|0,255);if((c[m>>2]|0)>>>0<f>>>0){za(40408,40424,58,40464)}m=c[b+28>>2]|0;Me(l,c[m+(f*40|0)+8>>2]|0,255);l=c[m+(f*40|0)+20>>2]|0;if((l|0)>-1){c[k>>2]=l*1e3}k=c[m+(f*40|0)+24>>2]|0;if((k|0)>-1){c[j>>2]=k*1e3}j=c[m+(f*40|0)+28>>2]|0;if(!((j|0)>-1)){s=0;i=g;return s|0}c[h>>2]=j*1e3;s=0;i=g;return s|0}function Qe(a){a=a|0;var b=0;b=i;c[a>>2]=40592;c[a+320>>2]=40676;Mk(a+1692|0);tc(a+1648|0);od(a+320|0);Eg(a);Al(a);i=b;return}function Re(a){a=a|0;var b=0;b=i;Qe(a+ -320|0);i=b;return}function Se(a){a=a|0;var b=0;b=i;c[a>>2]=40592;c[a+320>>2]=40676;Mk(a+1692|0);tc(a+1648|0);od(a+320|0);Eg(a);i=b;return}function Te(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+ -320|0;c[d>>2]=40592;e=a;c[e>>2]=40676;Mk(a+1372|0);tc(a+1328|0);od(e);Eg(d);i=b;return}function Ue(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;e=i;f=a+1196|0;h=c[a+1176>>2]|0;a=c[a+1188>>2]|0;a:do{if(h>>>0<a>>>0){g=0;do{j=h;while(1){h=j+1|0;k=d[j]|0;if((k|0)==2|(k|0)==1){h=j+3|0}else if((k|0)==3){h=j+2|0}else if((k|0)==0){break}if(h>>>0<a>>>0){j=h}else{break a}}g=g+1|0;}while(h>>>0<a>>>0)}else{g=0}}while(0);Ve(f,g,b);i=e;return 0}function Ve(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0;f=i;if((Jl(a,40864,4)|0)!=0){i=f;return}g=(b*50|0)/3|0;b=(d[a+422|0]|0)<<16|(d[a+423|0]|0)<<24|(d[a+421|0]|0)<<8|(d[a+420|0]|0);if((b|0)==0){c[e+4>>2]=g;c[e+8>>2]=g;c[e+12>>2]=0}else{b=(b*50|0)/3|0;c[e+8>>2]=b;c[e+12>>2]=g-b}b=a+4|0;if((Kl(b,41048)|0)!=0){Me(e+528|0,b,32)}b=a+36|0;if((Kl(b,41064)|0)!=0){Me(e+272|0,b,32)}b=a+68|0;if((Kl(b,41080)|0)!=0){Me(e+1040|0,b,32)}b=a+132|0;if((Kl(b,41104)|0)!=0){Me(e+1552|0,b,32)}a=a+164|0;if((Kl(a,41120)|0)==0){i=f;return}Me(e+1296|0,a,256);i=f;return}function We(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0,g=0,j=0;d=i;i=i+24|0;f=d;h[f>>3]=-32.0;c[f+8>>2]=8e3;c[f+12>>2]=b;c[f+16>>2]=0;j=a+2256|0;Zi(j,f);g=a+1696|0;Ec(g,f);f=a+248|0;Wi(j,+h[f>>3]*.405);Fc(g,+h[f>>3]*.00146484375);e=+(b|0);g=a+1624|0;h[g>>3]=e*+Nd(a+352|0,1.6666666666666667,.99,+h[f>>3]*3.0*.5);f=a+1648|0;b=vc(f,b,66)|0;if((b|0)!=0){j=b;i=d;return j|0}c[a+1676>>2]=3580020;c[f>>2]=xc(f,3580020)|0;f=Lk(a+1692|0,+h[g>>3],7671471.428571428)|0;if((f|0)!=0){j=f;i=d;return j|0}j=pd(a+320|0,~~(e*.06666666666666667))|0;i=d;return j|0}function Xe(a,b){a=a|0;b=+b;var d=0;d=i;if(b<.25){Jg(a,.25);i=d;return}if((c[a+1672>>2]|0)==0){i=d;return}b=+h[a+240>>3];c[a+1632>>2]=~~(59667.0/b);qd(a+320|0,~~(+(c[a+256>>2]|0)/(b*60.0)));i=d;return}function Ye(b,c){b=b|0;c=c|0;var d=0;d=i;Qk(b+1692|0,c);a[b+1645|0]=c>>>6&1;c=(c&128|0)!=0?0:b+1648|0;$i(b+2256|0,c,c,c);i=d;return}function Ze(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0;f=i;do{if((e|0)<4){h=c[10038]|0;g=8}else{if((Jl(b,40864,4)|0)!=0){h=(d[b]|0)>3?c[10038]|0:0;g=8;break}if((e|0)<429){h=c[10038]|0;g=8;break}if((Jl(b+424|0,40872,4)|0)==0){h=428;break}else{h=40880}i=f;return h|0}}while(0);do{if((g|0)==8){if((h|0)==0){h=0;break}i=f;return h|0}}while(0);c[a+232>>2]=8;c[a+1176>>2]=b+h;c[a+1188>>2]=b+e;c[a+1180>>2]=0;a=a+1196|0;if((h|0)==0){Pl(a|0,0,428)|0;h=0;i=f;return h|0}else{Nl(a|0,b|0,428)|0;h=0;i=f;return h|0}return 0}function _e(b,e){b=b|0;e=e|0;e=i;c[b+1184>>2]=c[b+1176>>2];c[b+1192>>2]=(d[b+1618|0]|0)<<16|(d[b+1619|0]|0)<<24|(d[b+1617|0]|0)<<8|(d[b+1616|0]|0);c[b+1640>>2]=0;a[b+1644|0]=0;c[b+1636>>2]=-1;Nk(b+1692|0);Xi(b+2256|0,0,0);uc(b+1648|0,1);c[b+340>>2]=c[b+332>>2];Ld(b+352|0);i=e;return 0}function $e(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=c[b+1184>>2]|0;k=a[g]|0;if(k<<24>>24==0){j=0}else{j=0;while(1){h=(k&255)<3?g+3|0:g+2|0;j=(k<<24>>24==1&(a[g+1|0]|0)==42&1)+j|0;k=a[h]|0;if(k<<24>>24==0){break}else{g=h}}}g=c[b+1640>>2]|0;k=(g|0)!=0;h=(j|0)==0;if((j|0)>(e|0)&((k|h)^1)){h=j;k=j-e|0}else{h=k&h&(g|0)>(e|0)?g:e;k=0}g=b+1648|0;j=((_(c[g>>2]|0,c[b+1632>>2]|0)|0)>>>0)/(h>>>0)|0;l=(c[b+1652>>2]|0)+(_(j,k)|0)+(j>>>1)|0;h=b+1636|0;m=c[h>>2]|0;if((m|0)<0){m=d[b+3856|0]|0}if((e|0)<=0){o=m;c[h>>2]=o;i=f;return}k=b+1696|0;n=0;while(1){o=d[b+n+3856|0]|0;Zd(k,l,o-m|0,g);n=n+1|0;if((n|0)==(e|0)){break}l=l+j|0;m=o}c[h>>2]=o;i=f;return}function af(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;f=b+1184|0;l=c[f>>2]|0;g=b+1192|0;h=c[g>>2]|0;do{if((h|0)!=0){r=h+ -1|0;c[g>>2]=r;if((r|0)!=0){break}c[b+1180>>2]=l}}while(0);p=l+1|0;m=a[l]|0;a:do{if(m<<24>>24==0){k=0}else{g=b+1692|0;j=b+1644|0;h=b+2256|0;k=0;while(1){if((k|0)<1024){q=p;n=l}else{break}while(1){r=n+2|0;p=a[q]|0;o=p&255;if(m<<24>>24==3){dj(h,0,o);l=r}else if(m<<24>>24==1){l=n+3|0;m=a[r]|0;q=m&255;if(p<<24>>24==42){break}else if(p<<24>>24==43){a[j]=(m&255)>>>7}Ok(g,o,q)}else if(m<<24>>24==2){Pk(g,o,d[r]|0);l=n+3|0}else{l=q}p=l+1|0;m=a[l]|0;if(m<<24>>24==0){break a}else{q=p;n=l}}a[b+k+3856|0]=m;k=(d[j]|0)+k|0;p=n+4|0;m=a[l]|0;if(m<<24>>24==0){break a}}do{q=l+2|0;o=a[p]|0;n=o&255;do{if(m<<24>>24==2){Pk(g,n,d[q]|0);l=l+3|0}else if(m<<24>>24==3){dj(h,0,n);l=q}else if(m<<24>>24==1){l=l+3|0;m=a[q]|0;p=m&255;if(o<<24>>24==42){break}else if(o<<24>>24==43){a[j]=(m&255)>>>7}Ok(g,n,p)}else{l=p}}while(0);p=l+1|0;m=a[l]|0;}while(!(m<<24>>24==0))}}while(0);do{if(!(p>>>0<(c[b+1188>>2]|0)>>>0)){g=c[b+1180>>2]|0;if((g|0)!=0){p=g;break}a[b+272|0]=1}}while(0);c[f>>2]=p;if((k|0)==0){r=b+1640|0;c[r>>2]=k;i=e;return}if((a[b+1645|0]|0)!=0){r=b+1640|0;c[r>>2]=k;i=e;return}$e(b,k);r=b+1640|0;c[r>>2]=k;i=e;return}function bf(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=i;if((a[b+273|0]|0)==0){af(b)}bj(b+2256|0,c);Pl(e|0,0,d<<1|0)|0;Tk(b+1692|0,d>>1,e);i=f;return d|0}



function cf(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=i;if((a[b+ -47|0]|0)==0){af(b+ -320|0)}bj(b+1936|0,c);Pl(e|0,0,d<<1|0)|0;Tk(b+1372|0,d>>1,e);i=f;return d|0}function df(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;td(a+320|0,b,c,a+1648|0);i=d;return 0}function ef(a,b){a=a|0;b=b|0;i=i;return}function ff(){var a=0,b=0,d=0;a=i;b=zl(4880)|0;if((b|0)==0){b=0;i=a;return b|0}Cg(b);d=b+320|0;md(d);c[b>>2]=40592;c[d>>2]=40676;sc(b+1648|0);c[b+1692>>2]=0;Cc(b+1696|0,b+1736|0,8);Vi(b+2256|0);c[b+1176>>2]=0;c[b+1184>>2]=0;c[b+4>>2]=40792;c[b+228>>2]=40696;c[b+284>>2]=1;i=a;return b|0}function gf(){var a=0,b=0,d=0;a=i;b=zl(328)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=40944;c[b+4>>2]=40792;b=d;i=a;return b|0}function hf(a){a=a|0;var b=0;b=i;Eg(a);i=b;return}function jf(a){a=a|0;var b=0;b=i;Eg(a);Al(a);i=b;return}function kf(a,b,e){a=a|0;b=b|0;e=e|0;var f=0;f=i;c[a+316>>2]=b;c[a+320>>2]=b+e;a=a+324|0;c[a>>2]=0;do{if((e|0)<4){b=c[10038]|0}else{if((Jl(b,40864,4)|0)!=0){b=(d[b]|0)>3?c[10038]|0:0;break}if((e|0)<429){b=c[10038]|0;break}if((Jl(b+424|0,40872,4)|0)!=0){b=40880;break}c[a>>2]=428;b=0}}while(0);i=f;return b|0}function lf(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;e=c[a+316>>2]|0;h=e+(c[a+324>>2]|0)|0;a=c[a+320>>2]|0;a:do{if(h>>>0<a>>>0){g=0;do{j=h;while(1){h=j+1|0;k=d[j]|0;if((k|0)==0){break}else if((k|0)==3){h=j+2|0}else if((k|0)==2|(k|0)==1){h=j+3|0}if(h>>>0<a>>>0){j=h}else{break a}}g=g+1|0;}while(h>>>0<a>>>0)}else{g=0}}while(0);Ve(e,g,b);i=f;return 0}function mf(b){b=b|0;var d=0,e=0,f=0;e=i;Cc(b+536|0,b+576|0,8);d=b+412|0;f=b+500|0;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;f=b+324|0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;d=b+236|0;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;f=b+148|0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;d=b+60|0;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;f=b+528|0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[f>>2]=0;c[b+532>>2]=255;f=b+440|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+520>>2]=1;a[b+524|0]=64;a[b+494|0]=-1;f=b+352|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+432>>2]=1;a[b+436|0]=64;a[b+406|0]=-1;f=b+264|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+344>>2]=1;a[b+348|0]=64;a[b+318|0]=-1;f=b+176|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+256>>2]=1;a[b+260|0]=64;a[b+230|0]=-1;f=b+88|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+168>>2]=1;a[b+172|0]=64;a[b+142|0]=-1;f=b+0|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+80>>2]=1;a[b+84|0]=64;a[b+54|0]=-1;i=e;return}function nf(b){b=b|0;var d=0,e=0,f=0;e=i;c[b+528>>2]=0;c[b+532>>2]=255;f=b+440|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+520>>2]=1;a[b+524|0]=64;a[b+494|0]=-1;f=b+352|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+432>>2]=1;a[b+436|0]=64;a[b+406|0]=-1;f=b+264|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+344>>2]=1;a[b+348|0]=64;a[b+318|0]=-1;f=b+176|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+256>>2]=1;a[b+260|0]=64;a[b+230|0]=-1;f=b+88|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+168>>2]=1;a[b+172|0]=64;a[b+142|0]=-1;f=b+0|0;d=f+60|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[b+80>>2]=1;a[b+84|0]=64;a[b+54|0]=-1;i=e;return}function of(e,f,g,h,j){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0;k=i;if(!(f>>>0<6)){za(41144,41176,58,41216)}c[e+(f*88|0)+68>>2]=g;c[e+(f*88|0)+72>>2]=h;c[e+(f*88|0)+76>>2]=j;h=e+532|0;j=e;e=e+528|0;while(1){f=e+ -88|0;n=(a[e+ -4|0]&31)+ -60|0;m=d[e+ -34|0]|0;l=c[h>>2]|0;g=(m>>>3&30)+n+(l>>>3&30)|0;l=(m<<1&30)+n+(l<<1&30)|0;g=b[41264+(((g|0)<0?0:g)<<1)>>1]|0;l=b[41264+(((l|0)<0?0:l)<<1)>>1]|0;m=e+ -28|0;c[m>>2]=c[e+ -20>>2];n=e+ -24|0;c[n>>2]=0;if(!(g<<16>>16==l<<16>>16)){c[m>>2]=c[e+ -16>>2];c[n>>2]=c[e+ -12>>2]}m=e+ -56|0;n=e+ -52|0;c[n>>2]=((g<<16>>16)-(b[m>>1]|0)<<4)+(c[n>>2]|0);n=e+ -54|0;e=e+ -48|0;c[e>>2]=((l<<16>>16)-(b[n>>1]|0)<<4)+(c[e>>2]|0);b[m>>1]=g;b[n>>1]=l;if((f|0)==(j|0)){break}else{e=f}}i=k;return}function pf(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;h=i;p=c[e+60>>2]|0;if((p|0)==0){J=e+56|0;c[J>>2]=g;i=h;return}w=e+84|0;if((a[w]|0)>=0){J=e+56|0;c[J>>2]=g;i=h;return}k=e+55|0;s=d[k]|0;u=b[e+32>>1]|0;l=u<<16>>16;o=_(l,s)|0;j=e+36|0;m=c[j>>2]|0;if((o|0)!=(m|0)){J=_(c[p>>2]|0,c[e+56>>2]|0)|0;Zd(f,J+(c[p+4>>2]|0)|0,o-m|0,p)}c[p+40>>2]=1;q=c[e+64>>2]|0;v=b[e+34>>1]|0;m=v<<16>>16;t=(q|0)!=0;if(t){r=_(m,s)|0;o=c[e+40>>2]|0;if((r|0)!=(o|0)){J=_(c[q>>2]|0,c[e+56>>2]|0)|0;Zd(f,J+(c[q+4>>2]|0)|0,r-o|0,q)}c[q+40>>2]=1}o=e+44|0;r=(c[o>>2]|0)+(c[e+56>>2]|0)|0;do{if((r|0)<(g|0)){x=d[e+52|0]|0;if((x&128|0)!=0){if((v|u)<<16>>16==0){break}z=32-(x&31)<<6;x=e+80|0;D=c[x>>2]|0;y=p;A=p+4|0;B=q;C=q+4|0;if(t){F=s;H=r;while(1){E=D>>>1;I=0-(E&1)&31;G=0-(D&1)&57352;D=G^E;J=I-F|0;if((I|0)!=(F|0)){F=_(J,l)|0;K=_(c[y>>2]|0,H)|0;Zd(f,K+(c[A>>2]|0)|0,F,p);F=_(J,m)|0;J=_(c[B>>2]|0,H)|0;Zd(f,J+(c[C>>2]|0)|0,F,q);F=I}H=H+z|0;if((H|0)<(g|0)){}else{break}}}else{F=s;H=r;while(1){E=D>>>1;B=0-(E&1)&31;G=0-(D&1)&57352;D=G^E;if((B|0)!=(F|0)){F=_(B-F|0,l)|0;K=_(c[y>>2]|0,H)|0;Zd(f,K+(c[A>>2]|0)|0,F,p);F=B}H=H+z|0;if((H|0)<(g|0)){}else{break}}}c[x>>2]=D;if((E|0)!=(G|0)){s=F;r=H;break}za(41232,41176,127,41248)}if(!((a[w]&64)==0)){break}w=e+53|0;A=(d[w]|0)+1&31;y=c[e+48>>2]|0;x=y<<1;do{if((x|0)>13){if((v|u)<<16>>16==0){n=31;break}u=p;v=p+4|0;z=q;y=q+4|0;if(t){while(1){t=d[e+A|0]|0;A=A+1&31;B=t-s|0;if((t|0)!=(s|0)){s=_(B,l)|0;K=_(c[u>>2]|0,r)|0;Zd(f,K+(c[v>>2]|0)|0,s,p);s=_(B,m)|0;K=_(c[z>>2]|0,r)|0;Zd(f,K+(c[y>>2]|0)|0,s,q);s=t}r=r+x|0;if((r|0)<(g|0)){}else{break}}}else{while(1){q=d[e+A|0]|0;A=A+1&31;if((q|0)!=(s|0)){s=_(q-s|0,l)|0;K=_(c[u>>2]|0,r)|0;Zd(f,K+(c[v>>2]|0)|0,s,p);s=q}r=r+x|0;if((r|0)<(g|0)){}else{break}}}}else{n=31}}while(0);if((n|0)==31){K=(y|0)==0?1:x;J=(g+ -1-r+K|0)/(K|0)|0;A=J+A|0;r=(_(J,K)|0)+r|0}a[w]=A+31&31}}while(0);n=r-g|0;c[o>>2]=(n|0)<0?0:n;a[k]=s;c[j>>2]=_(s,l)|0;c[e+40>>2]=_(s,m)|0;K=e+56|0;c[K>>2]=g;i=h;return}function qf(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;if((g|0)==2049){k=e+532|0;if((c[k>>2]|0)==(h|0)){i=j;return}c[k>>2]=h;t=e+536|0;n=e;u=e+84|0;o=e+54|0;s=e+68|0;p=e+60|0;r=e+64|0;q=e+32|0;g=e+36|0;l=e+34|0;m=e+40|0;h=e+72|0;v=e+76|0;e=e+528|0;do{e=e+ -88|0;pf(e,t,f);y=(a[u]&31)+ -60|0;z=d[o]|0;w=c[k>>2]|0;x=(z>>>3&30)+y+(w>>>3&30)|0;w=(z<<1&30)+y+(w<<1&30)|0;x=b[41264+(((x|0)<0?0:x)<<1)>>1]|0;w=b[41264+(((w|0)<0?0:w)<<1)>>1]|0;c[p>>2]=c[s>>2];c[r>>2]=0;if(!(x<<16>>16==w<<16>>16)){c[p>>2]=c[h>>2];c[r>>2]=c[v>>2]}c[g>>2]=((x<<16>>16)-(b[q>>1]|0)<<4)+(c[g>>2]|0);c[m>>2]=((w<<16>>16)-(b[l>>1]|0)<<4)+(c[m>>2]|0);b[q>>1]=x;b[l>>1]=w;}while((e|0)!=(n|0));i=j;return}else if((g|0)==2048){c[e+528>>2]=h&7;i=j;return}else{k=c[e+528>>2]|0;if((k|0)>=6){i=j;return}pf(e+(k*88|0)|0,e+536|0,f);switch(g|0){case 2053:{a[e+(k*88|0)+54|0]=h;y=(a[e+(k*88|0)+84|0]&31)+ -60|0;z=c[e+532>>2]|0;f=(h>>>3&30)+y+(z>>>3&30)|0;h=(h<<1&30)+y+(z<<1&30)|0;f=b[41264+(((f|0)<0?0:f)<<1)>>1]|0;l=b[41264+(((h|0)<0?0:h)<<1)>>1]|0;h=e+(k*88|0)+60|0;c[h>>2]=c[e+(k*88|0)+68>>2];g=e+(k*88|0)+64|0;c[g>>2]=0;if(!(f<<16>>16==l<<16>>16)){c[h>>2]=c[e+(k*88|0)+72>>2];c[g>>2]=c[e+(k*88|0)+76>>2]}y=e+(k*88|0)+32|0;z=e+(k*88|0)+36|0;c[z>>2]=((f<<16>>16)-(b[y>>1]|0)<<4)+(c[z>>2]|0);z=e+(k*88|0)+34|0;x=e+(k*88|0)+40|0;c[x>>2]=((l<<16>>16)-(b[z>>1]|0)<<4)+(c[x>>2]|0);b[y>>1]=f;b[z>>1]=l;i=j;return};case 2055:{if((k|0)<=3){i=j;return}a[e+(k*88|0)+52|0]=h;i=j;return};case 2051:{z=e+(k*88|0)+48|0;c[z>>2]=c[z>>2]&255|h<<8&3840;i=j;return};case 2050:{z=e+(k*88|0)+48|0;c[z>>2]=c[z>>2]&3840|h;i=j;return};case 2054:{f=h&31;h=d[e+(k*88|0)+84|0]|0;if((h&64|0)==0){z=e+(k*88|0)+53|0;a[(d[z]|0)+(e+(k*88|0))|0]=f;a[z]=(d[z]|0)+1&31;i=j;return}if((h&128|0)==0){i=j;return}a[e+(k*88|0)+55|0]=f;i=j;return};case 2052:{f=e+(k*88|0)+84|0;if(((h&64^64)&d[f]|0)!=0){a[e+(k*88|0)+53|0]=0}a[f]=h;z=(h&31)+ -60|0;y=d[e+(k*88|0)+54|0]|0;h=c[e+532>>2]|0;f=(y>>>3&30)+z+(h>>>3&30)|0;h=(y<<1&30)+z+(h<<1&30)|0;f=b[41264+(((f|0)<0?0:f)<<1)>>1]|0;l=b[41264+(((h|0)<0?0:h)<<1)>>1]|0;h=e+(k*88|0)+60|0;c[h>>2]=c[e+(k*88|0)+68>>2];g=e+(k*88|0)+64|0;c[g>>2]=0;if(!(f<<16>>16==l<<16>>16)){c[h>>2]=c[e+(k*88|0)+72>>2];c[g>>2]=c[e+(k*88|0)+76>>2]}y=e+(k*88|0)+32|0;z=e+(k*88|0)+36|0;c[z>>2]=((f<<16>>16)-(b[y>>1]|0)<<4)+(c[z>>2]|0);z=e+(k*88|0)+34|0;x=e+(k*88|0)+40|0;c[x>>2]=((l<<16>>16)-(b[z>>1]|0)<<4)+(c[x>>2]|0);b[y>>1]=f;b[z>>1]=l;i=j;return};default:{i=j;return}}}}function rf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;f=a+536|0;e=a;g=a+528|0;while(1){a=g+ -88|0;g=g+ -32|0;h=c[g>>2]|0;if((h|0)<(b|0)){pf(a,f,b);h=c[g>>2]|0}if((h|0)<(b|0)){b=5;break}c[g>>2]=h-b;if((a|0)==(e|0)){b=7;break}else{g=a}}if((b|0)==5){za(41328,41176,311,41360)}else if((b|0)==7){i=d;return}}function sf(d){d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;g=e;c[d+8212>>2]=d+8216;c[d+8256>>2]=0;c[d+8252>>2]=0;c[d+8260>>2]=1073741824;c[d+8264>>2]=1073741824;a[d+8197|0]=4;a[d+8198|0]=0;f=g;d=d+8192|0;b[d+0>>1]=0;b[d+2>>1]=0;a[d+4|0]=0;c[g>>2]=1;if((a[f]|0)==0){za(41808,41840,62,41880)}else{i=e;return}}function tf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(!(d>>>0<9)){za(41376,41408,71,41448)}if(!(e>>>0<256)){za(41456,41408,72,41448)}a[b+d+8200|0]=e;if((b|0)==0){g=0}else{g=b+ -336|0}j=g+(d<<2)+8604|0;c[j>>2]=0;do{if((e|0)<128){e=(c[g+8656>>2]&e<<13)-(c[g+8652>>2]|0)|0;j=c[g+8644>>2]|0;e=e>>>0>(j+ -8200|0)>>>0?0:e;if(j>>>0<e>>>0){za(41736,41752,58,41792)}else{h=(c[g+8640>>2]|0)+e|0;break}}else{if((e|0)==251|(e|0)==250|(e|0)==249){h=g+((e<<13)+ -2039808)+9848|0}else if((e|0)==248){h=g+336|0}else{h=c[g+8640>>2]|0;break}c[j>>2]=h}}while(0);c[(c[b+8212>>2]|0)+(d<<2)>>2]=h;i=f;return}function uf(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;h=i;i=i+48|0;k=h;l=f+8264|0;c[l>>2]=g;m=f+8260|0;n=c[m>>2]|0;j=f+8197|0;if((n|0)<(g|0)){n=(a[j]&4)==0?n:g}else{n=g}g=f+8212|0;p=c[g>>2]|0;r=p+36|0;o=(c[r>>2]|0)-n|0;c[r>>2]=n;p=p+40|0;c[p>>2]=o+(c[p>>2]|0);p=k;n=f+8216|0;o=n;r=p+0|0;s=o+0|0;t=r+44|0;do{c[r>>2]=c[s>>2];r=r+4|0;s=s+4|0}while((r|0)<(t|0));c[g>>2]=k;s=k+40|0;D=f+8192|0;y=f+8194|0;z=f+8195|0;A=f+8196|0;x=f+8198|0;F=d[j]|0;G=F<<8;w=(f|0)==0;v=f+ -336|0;u=f+8268|0;r=f+8200|0;C=w?0:v;B=k+36|0;t=k+28|0;E=d[y]|0;K=G;q=0;M=(F&2|G)^2;N=e[D>>1]|0;S=c[s>>2]|0;I=(d[x]|0)+1|256;H=F&76;G=d[z]|0;F=d[A]|0;a:while(1){U=(H&4|0)!=0;R=c[k+(N>>>13<<2)>>2]|0;Q=N&8191;T=d[R+Q|0]|0;O=N+1|0;W=d[41480+T|0]|0;L=W+S|0;b:do{if((L|0)<0|(L|0)<(W|0)){S=a[R+(Q+1)|0]|0;P=S&255;c:do{switch(T|0){case 206:{P=d[R+(Q+2)|0]<<8|P;M=-1;J=246;break};case 72:{X=I+ -1|256;a[f+X|0]=E;P=F;Q=G;R=H;S=L;N=O;T=M;U=q;V=K;W=E;I=X;F=P;G=Q;H=R;M=T;q=U;K=V;E=W;continue a};case 170:{R=F;G=E;T=H;U=I;S=L;N=O;M=E;V=q;W=K;X=E;F=R;H=T;I=U;q=V;K=W;E=X;continue a};case 64:{P=d[f+I|0]|0;N=d[f+(I+ -254|256)|0]<<8|d[f+(I+ -255|256)|0];I=I+ -253|256;O=P&76;K=P<<8;M=(P&2|K)^2;a[j]=O;if(((P^H)&4|0)==0){U=F;V=G;S=L;W=q;X=E;H=O;F=U;G=V;q=W;E=X;continue a}H=c[l>>2]|0;if((P&4|0)==0){P=c[m>>2]|0;H=(H|0)>(P|0)?P:H}S=c[B>>2]|0;c[B>>2]=H;U=F;V=G;W=q;X=E;S=L-H+S|0;H=O;F=U;G=V;q=W;E=X;continue a};case 154:{Q=F;R=G;T=H;S=L;N=O;U=M;V=q;W=K;X=E;I=G+1|256;F=Q;G=R;H=T;M=U;q=V;K=W;E=X;continue a};case 67:{O=r;while(1){if((P&1|0)!=0){E=d[O]|0}P=P>>>1;if((P|0)==0){break}else{O=O+1|0}}Q=F;R=G;T=H;U=I;S=L;V=M;W=q;X=K;N=N+2|0;F=Q;G=R;H=T;I=U;M=V;q=W;K=X;continue a};case 104:{M=d[f+I|0]|0;T=F;U=G;V=H;S=L;N=O;W=q;X=K;E=M;I=I+ -255|256;F=T;G=U;H=V;q=W;K=X;continue a};case 35:case 19:case 3:{O=T>>>4;c[s>>2]=L;Ef(w?0:v,(O|0)==0?0:O+1|0,P);P=F;Q=G;R=H;T=I;U=M;V=q;W=K;X=E;N=N+2|0;S=c[s>>2]|0;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 248:{Q=F;R=G;T=I;S=L;N=O;U=M;V=q;W=K;X=E;H=H|8;F=Q;G=R;I=T;M=U;q=V;K=W;E=X;continue a};case 56:{Q=F;R=G;T=H;U=I;S=L;N=O;V=M;W=q;X=E;K=-1;F=Q;G=R;H=T;I=U;M=V;q=W;E=X;continue a};case 84:{Q=F;R=G;T=H;U=I;S=L;N=O;V=M;W=K;X=E;q=1;F=Q;G=R;H=T;I=U;M=V;K=W;E=X;continue a};case 227:{S=0;J=302;break};case 243:{S=1;J=302;break};case 115:{W=0;T=1;O=1;S=1;J=305;break};case 2:{P=G;Q=F;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=E;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 8:{N=H&76|(M>>>8|M)&128|K>>>8&1;I=I+ -1|256;a[f+I|0]=((M&255|0)==0?N|2:N)|16;Q=F;R=G;T=H;S=L;N=O;U=M;V=q;W=K;X=E;F=Q;G=R;H=T;M=U;q=V;K=W;E=X;continue a};case 250:{G=d[f+I|0]|0;T=F;U=H;S=L;N=O;V=q;W=K;X=E;M=G;I=I+ -255|256;F=T;H=U;q=V;K=W;E=X;continue a};case 186:{G=I+255&255;R=F;T=H;U=I;S=L;N=O;V=q;W=K;X=E;M=G;F=R;H=T;I=U;q=V;K=W;E=X;continue a};case 24:{Q=F;R=G;T=H;U=I;S=L;N=O;V=M;W=q;X=E;K=0;F=Q;G=R;H=T;I=U;M=V;q=W;E=X;continue a};case 120:{if(U){P=F;Q=G;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=E;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a}H=H|4;J=291;break};case 195:{W=0;T=-1;O=1;S=-1;J=305;break};case 211:{W=0;T=1;O=1;S=0;J=305;break};case 194:{Q=G;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=E;F=0;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 168:{F=E;R=G;T=H;U=I;S=L;N=O;M=E;V=q;W=K;X=E;G=R;H=T;I=U;q=V;K=W;E=X;continue a};case 34:{P=F;Q=E;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=G;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 218:{P=I+ -1|256;a[f+P|0]=G;Q=F;R=G;T=H;S=L;N=O;U=M;V=q;W=K;X=E;I=P;F=Q;G=R;H=T;M=U;q=V;K=W;E=X;continue a};case 66:{P=E;Q=G;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=F;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 138:{R=F;T=G;U=H;V=I;S=L;N=O;M=G;W=q;X=K;E=G;F=R;G=T;H=U;I=V;q=W;K=X;continue a};case 122:{F=d[f+I|0]|0;T=G;U=H;S=L;N=O;V=q;W=K;X=E;M=F;I=I+ -255|256;G=T;H=U;q=V;K=W;E=X;continue a};case 152:{R=F;T=G;U=H;V=I;S=L;N=O;M=F;W=q;X=K;E=F;F=R;G=T;H=U;I=V;q=W;K=X;continue a};case 98:{Q=F;R=G;T=H;U=I;S=L;N=O;V=M;W=q;X=K;E=0;F=Q;G=R;H=T;I=U;M=V;q=W;K=X;continue a};case 83:{if((P&1|0)!=0){tf(f,0,E)}if((P&2|0)!=0){tf(f,1,E)}if((P&4|0)!=0){tf(f,2,E)}if((P&8|0)!=0){tf(f,3,E)}if((P&16|0)!=0){tf(f,4,E)}if((P&32|0)!=0){tf(f,5,E)}if((P&64|0)!=0){tf(f,6,E)}if((P&128|0)!=0){tf(f,7,E)}P=F;Q=G;R=H;T=I;S=L;U=M;V=q;W=K;X=E;N=N+2|0;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 244:{Q=F;R=G;T=H;U=I;S=L;N=O;V=M;W=K;X=E;q=1;F=Q;G=R;H=T;I=U;M=V;K=W;E=X;continue a};case 88:{if(!U){P=F;Q=G;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=E;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a}H=H&-5;J=285;break};case 90:{P=I+ -1|256;a[f+P|0]=F;Q=F;R=G;T=H;S=L;N=O;U=M;V=q;W=K;X=E;I=P;F=Q;G=R;H=T;M=U;q=V;K=W;E=X;continue a};case 216:{Q=F;R=G;T=I;S=L;N=O;U=M;V=q;W=K;X=E;H=H&-9;F=Q;G=R;I=T;M=U;q=V;K=W;E=X;continue a};case 130:{Q=F;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=E;G=0;F=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 40:{P=d[f+I|0]|0;I=I+ -255|256;N=P&76;K=P<<8;M=(P&2|K)^2;if(((P^H)&4|0)==0){T=F;U=G;S=L;V=O;W=q;X=E;H=N;F=T;G=U;N=V;q=W;E=X;continue a}if((P&4|0)==0){H=N;J=285}else{H=N;J=291}break};case 184:{Q=F;R=G;T=I;S=L;N=O;U=M;V=q;W=K;X=E;H=H&-65;F=Q;G=R;I=T;M=U;q=V;K=W;E=X;continue a};case 0:{N=N+2|0;O=6;break b};case 141:{J=49;break};case 145:{P=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;N=N+2|0;J=50;break};case 146:{J=47;break};case 255:{if((O|0)==8192){S=0;J=319;break b}else{J=26}break};case 157:{O=(d[R+(Q+2)|0]<<8|P)+G|0;N=N+3|0;P=c[u+(O>>>13<<2)>>2]|0;O=O&8191;if((P|0)!=0){a[P+O|0]=E;P=F;Q=G;R=H;T=I;S=L;U=M;V=q;W=K;X=E;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a}if(!((a[r]|0)==-1)){P=F;Q=G;R=H;T=I;S=L;U=M;V=q;W=K;X=E;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a}c[s>>2]=L;Ff(C,O,E);P=F;Q=G;R=H;T=I;U=M;V=q;W=K;X=E;S=c[s>>2]|0;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 174:{X=d[R+(Q+2)|0]|0;M=X<<8|P;N=N+3|0;X=X>>>5;G=d[(c[k+(X<<2)>>2]|0)+(M&8191)|0]|0;if(!((a[f+X+8200|0]|0)==-1)){R=F;T=H;U=I;S=L;V=q;W=K;X=E;M=G;F=R;H=T;I=U;q=V;K=W;E=X;continue a}c[s>>2]=L;G=Gf(v,M)|0;R=F;T=H;U=I;V=q;W=K;X=E;M=G;S=c[s>>2]|0;F=R;H=T;I=U;q=V;K=W;E=X;continue a};case 16:{N=N+2|0;if((M&32896|0)!=0){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 144:{N=N+2|0;if((K&256|0)!=0){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 48:{N=N+2|0;if((M&32896|0)==0){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 239:case 223:case 207:case 191:case 175:case 159:case 143:case 127:case 111:case 95:case 79:case 63:case 47:case 31:case 15:{J=26;break};case 96:{Q=F;R=G;T=H;S=L;U=M;V=q;W=K;X=E;N=(d[f+I|0]|0)+1+(d[f+(I+ -255|256)|0]<<8)|0;I=I+ -254|256;F=Q;G=R;H=T;M=U;q=V;K=W;E=X;continue a};case 149:{P=P+G&255;J=41;break};case 212:case 234:{P=F;Q=G;R=H;T=I;S=L;N=O;U=M;V=q;W=K;X=E;F=P;G=Q;H=R;I=T;M=U;q=V;K=W;E=X;continue a};case 240:{N=N+2|0;if(!((M&255)<<24>>24==0)){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 176:{N=N+2|0;if((K&256|0)==0){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 80:{N=N+2|0;if((H&64|0)!=0){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 208:{N=N+2|0;if((M&255)<<24>>24==0){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 32:{T=N+2|0;O=d[R+(Q+2)|0]<<8|P;a[f+(I+ -1|256)|0]=T>>>8;P=I+ -2|256;a[f+P|0]=T;Q=F;R=G;T=H;S=L;U=M;V=q;W=K;X=E;N=O;I=P;F=Q;G=R;H=T;M=U;q=V;K=W;E=X;continue a};case 133:{J=41;break};case 153:{P=P+F|0;J=49;break};case 112:{N=N+2|0;if((H&64|0)==0){J=4;break c}O=F;P=G;Q=H;R=I;T=L;U=M;V=q;W=K;X=E;N=(S<<24>>24)+N&65535;F=O;G=P;H=Q;I=R;S=T;M=U;q=V;K=W;E=X;continue a};case 128:{J=24;break};case 76:{Z=F;Y=G;O=H;T=I;S=L;U=M;V=q;W=K;X=E;N=d[R+(Q+2)|0]<<8|P;F=Z;G=Y;H=O;I=T;M=U;q=V;K=W;E=X;continue a};case 124:{P=P+G|0;J=30;break};case 108:{J=30;break};case 161:{P=P+G&255;J=55;break};case 178:{J=55;break};case 177:{E=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;N=N+2|0;J=59;break};case 129:{P=P+G&255;J=47;break};case 165:{M=d[f+P|0]|0;U=F;V=G;W=H;X=I;S=L;Y=q;Z=K;E=M;N=N+2|0;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a};case 189:{E=(d[R+(Q+2)|0]<<8|P)+G|0;N=N+3|0;Z=E>>>13;M=d[(c[k+(Z<<2)>>2]|0)+(E&8191)|0]|0;if(!((a[f+Z+8200|0]|0)==-1)){U=F;V=G;W=H;X=I;S=L;Y=q;Z=K;E=M;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a}c[s>>2]=L;M=Gf(w?0:v,E)|0;U=F;V=G;W=H;X=I;Y=q;Z=K;E=M;S=c[s>>2]|0;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a};case 185:{P=P+F|0;J=58;break};case 68:{a[f+(I+ -1|256)|0]=O>>>8;I=I+ -2|256;a[f+I|0]=O;J=24;break};case 173:{J=58;break};case 52:{P=P+G&255;J=69;break};case 36:{J=69;break};case 182:{P=P+F&255;J=102;break};case 164:{J=105;break};case 100:{J=96;break};case 166:{J=102;break};case 119:case 103:case 87:case 71:case 55:case 39:case 23:case 7:{R=f+P|0;a[R]=d[R]&(1<<(T>>>4)^255);R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=N+2|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a};case 147:{M=d[R+(Q+2)|0]|0;J=73;break};case 188:{P=P+G|0;J=108;break};case 172:{J=108;break};case 169:{U=F;V=G;W=H;X=I;S=L;Y=q;Z=K;E=P;M=P;N=N+2|0;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a};case 247:case 231:case 215:case 199:case 183:case 167:case 151:case 135:{R=f+P|0;a[R]=d[R]|1<<(T>>>4)+ -8;R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=N+2|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a};case 140:{O=F;J=111;break};case 163:{Q=d[f+((d[R+(Q+2)|0]|0)+G&255)|0]|0;J=77;break};case 236:{K=d[R+(Q+2)|0]|0;J=K<<8|P;O=N+2|0;c[s>>2]=L;M=w?0:v;K=K>>>5;if(!((a[M+(K|8536)|0]|0)==-1)){P=d[(c[(c[M+8548>>2]|0)+(K<<2)>>2]|0)+(J&8191)|0]|0;J=119;break c}P=Gf(M,J)|0;L=c[s>>2]|0;J=119;break};case 181:{M=d[f+(P+G&255)|0]|0;U=F;V=G;W=H;X=I;S=L;Y=q;Z=K;E=M;N=N+2|0;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a};case 228:{P=d[f+P|0]|0;J=119;break};case 224:{J=119;break};case 137:{J=70;break};case 179:{M=(d[R+(Q+2)|0]|0)+G|0;J=73;break};case 204:{J=d[R+(Q+2)|0]|0;K=J<<8|P;O=N+2|0;c[s>>2]=L;M=w?0:v;J=J>>>5;if(!((a[M+(J|8536)|0]|0)==-1)){P=d[(c[(c[M+8548>>2]|0)+(J<<2)>>2]|0)+(K&8191)|0]|0;J=123;break c}P=Gf(M,K)|0;L=c[s>>2]|0;J=123;break};case 134:{J=100;break};case 196:{P=d[f+P|0]|0;J=123;break};case 148:{P=P+G&255;J=98;break};case 132:{J=98;break};case 162:{J=103;break};case 60:{P=P+G|0;J=66;break};case 150:{P=P+F&255;J=100;break};case 44:{J=66;break};case 160:{J=106;break};case 142:{O=G;J=111;break};case 131:{Q=d[f+(d[R+(Q+2)|0]|0)|0]|0;J=77;break};case 158:{P=P+G|0;J=90;break};case 20:case 4:{M=P|8192;J=80;break};case 190:{M=(d[R+(Q+2)|0]<<8|P)+F|0;N=N+3|0;c[s>>2]=L;O=w?0:v;Z=M>>>13;G=d[(c[(c[O+8548>>2]|0)+(Z<<2)>>2]|0)+(M&8191)|0]|0;if(!((a[O+(Z+8536)|0]|0)==-1)){U=F;V=H;W=I;S=L;X=q;Y=K;Z=E;M=G;F=U;H=V;I=W;q=X;K=Y;E=Z;continue a}G=Gf(O,M)|0;U=F;V=H;W=I;X=q;Y=K;Z=E;M=G;S=c[s>>2]|0;F=U;H=V;I=W;q=X;K=Y;E=Z;continue a};case 28:case 12:{M=d[R+(Q+2)|0]<<8|P;O=N+2|0;J=80;break};case 156:{J=90;break};case 116:{P=P+G&255;J=96;break};case 180:{P=P+G&255;J=105;break};case 89:{P=P+F|0;J=157;break};case 229:{J=180;break};case 209:{M=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;c[s>>2]=L;J=133;break};case 221:{P=P+G|0;J=131;break};case 217:{P=P+F|0;J=131;break};case 33:{P=P+G&255;J=138;break};case 53:{P=P+G&255;J=141;break};case 85:{P=P+G&255;J=154;break};case 5:{J=167;break};case 57:{P=P+F|0;J=144;break};case 197:{J=128;break};case 61:{P=P+G|0;J=144;break};case 77:{J=157;break};case 41:{J=149;break};case 1:{P=P+G&255;J=164;break};case 45:{J=144;break};case 50:{J=138;break};case 192:{J=123;break};case 82:{J=151;break};case 210:{J=125;break};case 93:{P=P+G|0;J=157;break};case 49:{N=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;c[s>>2]=L;J=146;break};case 69:{J=154;break};case 17:{N=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;c[s>>2]=L;J=172;break};case 205:{J=131;break};case 193:{P=P+G&255;J=125;break};case 21:{P=P+G&255;J=167;break};case 13:{J=170;break};case 73:{J=162;break};case 25:{P=P+F|0;J=170;break};case 242:{J=177;break};case 201:{J=136;break};case 65:{P=P+G&255;J=151;break};case 213:{P=P+G&255;J=128;break};case 29:{P=P+G|0;J=170;break};case 225:{P=P+G&255;J=177;break};case 245:{P=P+G&255;J=180;break};case 37:{J=141;break};case 18:{J=164;break};case 9:{J=175;break};case 249:{P=P+F|0;J=183;break};case 253:{P=P+G|0;J=183;break};case 237:{J=183;break};case 241:{N=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;c[s>>2]=L;J=185;break};case 81:{N=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;c[s>>2]=L;J=159;break};case 97:{P=P+G&255;J=190;break};case 117:{P=P+G&255;J=193;break};case 101:{J=193;break};case 42:{U=E<<1;M=U|K>>>8&1;V=F;W=G;X=H;Y=I;S=L;N=O;Z=q;E=M&255;K=U;F=V;G=W;H=X;I=Y;q=Z;continue a};case 109:{J=196;break};case 105:{break};case 126:{P=P+G|0;J=208;break};case 22:{P=P+G&255;J=229;break};case 38:{J=230;break};case 58:{M=E+ -1|0;U=F;V=G;W=H;X=I;S=L;N=O;Y=q;Z=K;E=M&255;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a};case 230:{Q=P;M=1;J=240;break};case 94:{P=P+G|0;J=207;break};case 254:{P=(d[R+(Q+2)|0]<<8|P)+G|0;M=1;J=246;break};case 125:{P=P+G|0;J=196;break};case 10:{M=E<<1;V=F;W=G;X=H;Y=I;S=L;N=O;Z=q;E=M&254;K=M;F=V;G=W;H=X;I=Y;q=Z;continue a};case 78:{J=207;break};case 118:{P=P+G&255;J=226;break};case 102:{J=226;break};case 70:{J=225;break};case 62:{P=P+G|0;J=214;break};case 136:{T=F+ -1|0;U=G;V=H;W=I;S=L;N=O;X=q;Y=K;Z=E;M=T;F=T&255;G=U;H=V;I=W;q=X;K=Y;E=Z;continue a};case 214:{P=P+G&255;J=239;break};case 222:{P=(d[R+(Q+2)|0]<<8|P)+G|0;M=-1;J=246;break};case 74:{K=0;J=203;break};case 246:{Q=P+G&255;M=1;J=240;break};case 113:{N=(d[f+P|0]|0)+F+(d[f+(P+1&255)|0]<<8)|0;c[s>>2]=L;J=198;break};case 30:{P=P+G|0;J=213;break};case 198:{J=239;break};case 202:{T=G+ -1|0;U=F;V=H;W=I;S=L;N=O;X=q;Y=K;Z=E;M=T;G=T&255;F=U;H=V;I=W;q=X;K=Y;E=Z;continue a};case 238:{P=d[R+(Q+2)|0]<<8|P;M=1;J=246;break};case 106:{J=203;break};case 233:{J=188;break};case 200:{T=F+1|0;U=G;V=H;W=I;S=L;N=O;X=q;Y=K;Z=E;M=T;F=T&255;G=U;H=V;I=W;q=X;K=Y;E=Z;continue a};case 114:{J=190;break};case 121:{P=P+F|0;J=196;break};case 14:{J=213;break};case 110:{J=208;break};case 46:{J=214;break};case 86:{P=P+G&255;J=225;break};case 54:{P=P+G&255;J=230;break};case 6:{J=229;break};case 26:{M=E+1|0;U=F;V=G;W=H;X=I;S=L;N=O;Y=q;Z=K;E=M&255;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a};case 232:{T=G+1|0;U=F;V=H;W=I;S=L;N=O;X=q;Y=K;Z=E;M=T;G=T&255;F=U;H=V;I=W;q=X;K=Y;E=Z;continue a};default:{T=F;U=G;V=H;W=I;S=L;N=O;X=M;Y=K;Z=E;q=1;F=T;G=U;H=V;I=W;M=X;K=Y;E=Z;continue a}}}while(0);do{if((J|0)==24){J=0;R=F;T=G;U=H;V=L;W=M;X=q;Y=K;Z=E;N=N+2+(S<<24>>24)&65535;F=R;G=T;H=U;S=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==26){J=0;N=N+3|0;if((((d[f+P|0]|0)*257^255)&1<<(T>>>4)|0)==0){J=4;break}P=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=(a[R+(Q+2)|0]|0)+N&65535;F=P;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==30){J=0;Q=(d[R+(Q+2)|0]<<8)+P|0;N=Q&8191;Q=c[k+(Q>>>13<<2)>>2]|0;R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=d[Q+(N+1)|0]<<8|d[Q+N|0];F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==41){J=0;a[f+P|0]=E;R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=N+2|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==47){P=d[f+(P+1&255)|0]<<8|d[f+P|0];N=N+2|0;J=50}else if((J|0)==49){P=(d[R+(Q+2)|0]<<8)+P|0;N=N+3|0;J=50}else if((J|0)==55){E=d[f+(P+1&255)|0]<<8|d[f+P|0];N=N+2|0;J=59}else if((J|0)==58){E=(d[R+(Q+2)|0]<<8)+P|0;N=N+3|0;J=59}else if((J|0)==66){O=N+2|0;J=(d[R+(Q+2)|0]<<8)+P|0;c[s>>2]=L;N=w?0:v;M=J>>>13;if(!((a[N+(M+8536)|0]|0)==-1)){P=d[(c[(c[N+8548>>2]|0)+(M<<2)>>2]|0)+(J&8191)|0]|0;J=70;break}P=Gf(N,J)|0;L=c[s>>2]|0;J=70}else if((J|0)==69){P=d[f+P|0]|0;J=70}else if((J|0)==73){J=(d[R+(Q+3)|0]<<8)+M|0;O=N+2|0;c[s>>2]=L;N=w?0:v;M=J>>>13;if(!((a[N+(M+8536)|0]|0)==-1)){Q=d[(c[(c[N+8548>>2]|0)+(M<<2)>>2]|0)+(J&8191)|0]|0;J=77;break}Q=Gf(N,J)|0;L=c[s>>2]|0;J=77}else if((J|0)==80){J=0;c[s>>2]=L;Q=w?0:v;P=M>>>13;L=M&8191;N=d[(c[(c[Q+8548>>2]|0)+(P<<2)>>2]|0)+L|0]|0;if((a[Q+(P+8536)|0]|0)==-1){N=Gf(Q,M)|0}M=(N|E)^((T&16|0)==0?0:E);H=M&64|H&-65;N=O+1|0;O=w?0:v;P=c[O+(P<<2)+8604>>2]|0;do{if((P|0)==0){if(!((a[O+8536|0]|0)==-1)){break}Ff(O,L,M)}else{a[P+L|0]=M}}while(0);U=F;V=G;W=I;X=q;Y=K;Z=E;S=c[s>>2]|0;F=U;G=V;I=W;q=X;K=Y;E=Z;continue a}else if((J|0)==90){J=0;O=(d[R+(Q+2)|0]<<8)+P|0;N=N+3|0;c[s>>2]=L;P=w?0:v;L=c[P+(O>>>13<<2)+8604>>2]|0;O=O&8191;do{if((L|0)==0){if(!((a[P+8536|0]|0)==-1)){break}Ff(P,O,0)}else{a[L+O|0]=0}}while(0);R=F;T=G;U=H;V=I;W=M;X=q;Y=K;Z=E;S=c[s>>2]|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==96){J=0;a[f+P|0]=0;R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=N+2|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==98){J=0;a[f+P|0]=F;R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=N+2|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==100){J=0;a[f+P|0]=G;R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;N=N+2|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==102){P=d[f+P|0]|0;J=103}else if((J|0)==105){P=d[f+P|0]|0;J=106}else if((J|0)==108){J=0;M=(d[R+(Q+2)|0]<<8)+P|0;N=N+3|0;c[s>>2]=L;O=w?0:v;Z=M>>>13;F=d[(c[(c[O+8548>>2]|0)+(Z<<2)>>2]|0)+(M&8191)|0]|0;if(!((a[O+(Z+8536)|0]|0)==-1)){U=G;V=H;W=I;S=L;X=q;Y=K;Z=E;M=F;G=U;H=V;I=W;q=X;K=Y;E=Z;continue a}F=Gf(O,M)|0;U=G;V=H;W=I;X=q;Y=K;Z=E;M=F;S=c[s>>2]|0;G=U;H=V;I=W;q=X;K=Y;E=Z;continue a}else if((J|0)==111){J=0;Q=d[R+(Q+2)|0]|0;N=N+3|0;c[s>>2]=L;R=w?0:v;L=c[R+(Q>>>5<<2)+8604>>2]|0;P=Q<<8&7936|P;do{if((L|0)==0){if(!((a[R+8536|0]|0)==-1)){break}Ff(R,P,O)}else{a[L+P|0]=O}}while(0);R=F;T=G;U=H;V=I;W=M;X=q;Y=K;Z=E;S=c[s>>2]|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==119){J=0;M=G-P|0;U=F;V=G;W=H;X=I;Y=q;Z=E;K=~M;M=M&255;N=O+1|0;S=L;F=U;G=V;H=W;I=X;q=Y;E=Z;continue a}else if((J|0)==123){J=0;M=F-P|0;U=F;V=G;W=H;X=I;Y=q;Z=E;K=~M;M=M&255;N=O+1|0;S=L;F=U;G=V;H=W;I=X;q=Y;E=Z;continue a}else if((J|0)==125){M=d[f+(P+1&255)|0]<<8|d[f+P|0];J=132}else if((J|0)==128){P=d[f+P|0]|0;J=136}else if((J|0)==131){M=(d[R+(Q+2)|0]<<8)+P|0;O=N+2|0;J=132}else if((J|0)==138){P=d[f+(P+1&255)|0]<<8|d[f+P|0];J=145}else if((J|0)==141){P=d[f+P|0]|0;J=149}else if((J|0)==144){P=(d[R+(Q+2)|0]<<8)+P|0;O=N+2|0;J=145}else if((J|0)==151){P=d[f+(P+1&255)|0]<<8|d[f+P|0];J=158}else if((J|0)==154){P=d[f+P|0]|0;J=162}else if((J|0)==157){P=(d[R+(Q+2)|0]<<8)+P|0;O=N+2|0;J=158}else if((J|0)==164){P=d[f+(P+1&255)|0]<<8|d[f+P|0];J=171}else if((J|0)==167){P=d[f+P|0]|0;J=175}else if((J|0)==170){P=(d[R+(Q+2)|0]<<8)+P|0;O=N+2|0;J=171}else if((J|0)==177){P=d[f+(P+1&255)|0]<<8|d[f+P|0];J=184}else if((J|0)==180){P=d[f+P|0]|0;J=188}else if((J|0)==183){P=(d[R+(Q+2)|0]<<8)+P|0;O=N+2|0;J=184}else if((J|0)==190){P=d[f+(P+1&255)|0]<<8|d[f+P|0];J=197}else if((J|0)==193){J=0;P=d[f+P|0]|0}else if((J|0)==196){P=(d[R+(Q+2)|0]<<8)+P|0;O=N+2|0;J=197}else if((J|0)==203){J=0;U=E<<8;M=K>>>1&128|E>>>1;V=F;W=G;X=H;Y=I;S=L;N=O;Z=q;E=M;K=U;F=V;G=W;H=X;I=Y;q=Z;continue a}else if((J|0)==207){K=0;J=208}else if((J|0)==213){K=0;J=214}else if((J|0)==225){K=0;J=226}else if((J|0)==229){K=0;J=230}else if((J|0)==239){Q=P;M=-1;J=240}else if((J|0)==246){J=0;c[s>>2]=L;R=w?0:v;O=P>>>13;L=P&8191;Q=d[(c[(c[R+8548>>2]|0)+(O<<2)>>2]|0)+L|0]|0;if((a[R+(O+8536)|0]|0)==-1){Q=Gf(R,P)|0}M=Q+M|0;N=N+3|0;Q=w?0:v;P=M&255;O=c[Q+(O<<2)+8604>>2]|0;do{if((O|0)==0){if(!((a[Q+8536|0]|0)==-1)){break}Ff(Q,L,P)}else{a[O+L|0]=M}}while(0);T=F;U=G;V=H;W=I;X=q;Y=K;Z=E;S=c[s>>2]|0;F=T;G=U;H=V;I=W;q=X;K=Y;E=Z;continue a}else if((J|0)==285){J=0;a[j]=H;P=c[m>>2]|0;N=(c[B>>2]|0)-P|0;if((N|0)<1){W=F;X=G;S=L;N=O;Y=q;Z=E;F=W;G=X;q=Y;E=Z;continue a}c[B>>2]=P;S=N+L|0;if((S|0)<0){W=F;X=G;N=O;Y=q;Z=E;F=W;G=X;q=Y;E=Z;continue a}L=S+1|0;if((N|0)<(L|0)){W=F;X=G;N=O;Y=q;Z=E;F=W;G=X;q=Y;E=Z;continue a}W=L+P|0;c[B>>2]=W;c[m>>2]=W;W=F;X=G;N=O;Y=q;Z=E;S=-1;F=W;G=X;q=Y;E=Z;continue a}else if((J|0)==291){J=0;a[j]=H;V=c[B>>2]|0;S=c[l>>2]|0;c[B>>2]=S;W=F;X=G;N=O;Y=q;Z=E;S=V+L-S|0;F=W;G=X;q=Y;E=Z;continue a}else if((J|0)==302){W=S;T=S^1;O=(S|0)==1;J=305}}while(0);if((J|0)==4){J=0;R=F;T=G;U=H;V=I;W=M;X=q;Y=K;Z=E;S=L+ -2|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==50){J=0;O=c[u+(P>>>13<<2)>>2]|0;P=P&8191;if((O|0)!=0){a[O+P|0]=E;R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}if(!((a[r]|0)==-1)){R=F;T=G;U=H;V=I;S=L;W=M;X=q;Y=K;Z=E;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}c[s>>2]=L;Ff(C,P,E);R=F;T=G;U=H;V=I;W=M;X=q;Y=K;Z=E;S=c[s>>2]|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}else if((J|0)==59){J=0;Z=E>>>13;M=d[(c[k+(Z<<2)>>2]|0)+(E&8191)|0]|0;if(!((a[f+Z+8200|0]|0)==-1)){U=F;V=G;W=H;X=I;S=L;Y=q;Z=K;E=M;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a}c[s>>2]=L;M=Gf(w?0:v,E)|0;U=F;V=G;W=H;X=I;Y=q;Z=K;E=M;S=c[s>>2]|0;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a}else if((J|0)==70){J=0;R=E;M=(P&E|0)==0?P<<8:P;N=O+1|0;S=L;H=P&64|H&-65;E=R;continue a}else if((J|0)==77){J=0;R=E;M=(Q&P|0)==0?Q<<8:Q;N=O+2|0;S=L;H=Q&64|H&-65;E=R;continue a}else if((J|0)==103){J=0;U=F;V=H;W=I;S=L;X=q;Y=K;Z=E;M=P;N=N+2|0;G=P;F=U;H=V;I=W;q=X;K=Y;E=Z;continue a}else if((J|0)==106){J=0;U=G;V=H;W=I;S=L;X=q;Y=K;Z=E;M=P;N=N+2|0;F=P;G=U;H=V;I=W;q=X;K=Y;E=Z;continue a}else if((J|0)==132){c[s>>2]=L;if(w){K=0;J=134}else{J=133}}else if((J|0)==145){c[s>>2]=L;if(w){M=0;N=P;J=147}else{N=P;J=146}}else if((J|0)==158){c[s>>2]=L;if(w){M=0;N=P;J=160}else{N=P;J=159}}else if((J|0)==171){c[s>>2]=L;if(w){M=0;N=P;J=173}else{N=P;J=172}}else if((J|0)==184){c[s>>2]=L;if(w){M=0;N=P;J=186}else{N=P;J=185}}else if((J|0)==197){c[s>>2]=L;if(w){M=0;N=P;J=199}else{N=P;J=198}}else if((J|0)==208){O=(d[R+(Q+2)|0]<<8)+P|0;c[s>>2]=L;L=w?0:v;Z=O>>>13;J=d[(c[(c[L+8548>>2]|0)+(Z<<2)>>2]|0)+(O&8191)|0]|0;if((a[L+(Z+8536)|0]|0)==-1){J=Gf(L,O)|0}L=J<<8;M=J>>1|K>>>1&128;J=217}else if((J|0)==214){O=(d[R+(Q+2)|0]<<8)+P|0;c[s>>2]=L;J=w?0:v;Z=O>>>13;L=d[(c[(c[J+8548>>2]|0)+(Z<<2)>>2]|0)+(O&8191)|0]|0;if((a[J+(Z+8536)|0]|0)==-1){L=Gf(J,O)|0}M=L<<1;L=M;M=M|K>>>8&1;J=217}else if((J|0)==226){M=d[f+P|0]|0;O=M<<8;M=M>>>1|K>>>1&128;J=241}else if((J|0)==230){M=d[f+P|0]<<1;O=M;M=M|K>>>8&1;J=241}else if((J|0)==240){O=K;P=Q;M=(d[f+Q|0]|0)+M|0;J=241}else if((J|0)==305){J=0;V=d[R+(Q+2)|0]<<8|P;U=d[R+(Q+4)|0]<<8|d[R+(Q+3)|0];P=d[R+(Q+6)|0]<<8|d[R+(Q+5)|0];N=N+7|0;a[f+(I+ -1|256)|0]=F;a[f+(I+ -2|256)|0]=E;a[f+(I+ -3|256)|0]=G;c[s>>2]=L;L=(W|0)==0;if(w){J=306;break a}else{P=(P|0)!=0?P:65536;Q=V}while(1){R=Q>>>13;if((a[v+(R+8536)|0]|0)==-1){R=Gf(v,Q)|0}else{R=d[(c[(c[f+8212>>2]|0)+(R<<2)>>2]|0)+(Q&8191)|0]|0}Q=Q+T&65535;c[s>>2]=(c[s>>2]|0)+6;T=L?T:0-T|0;V=c[v+(U>>>13<<2)+8604>>2]|0;W=U&8191;do{if((V|0)==0){if(!((a[f+8200|0]|0)==-1)){break}Ff(v,W,R)}else{a[V+W|0]=R}}while(0);P=P+ -1|0;if((P|0)==0){break}else{U=U+S&65535;S=O?S:0-S|0}}R=F;T=G;U=H;V=I;W=M;X=q;Y=K;Z=E;S=c[s>>2]|0;F=R;G=T;H=U;I=V;M=W;q=X;K=Y;E=Z;continue a}if((J|0)==133){K=v;J=134}else if((J|0)==146){M=v;J=147}else if((J|0)==159){M=v;J=160}else if((J|0)==172){M=v;J=173}else if((J|0)==185){M=v;J=186}else if((J|0)==198){M=v;J=199}else if((J|0)==217){J=0;N=N+3|0;Q=w?0:v;P=M&255;K=c[Q+(O>>>13<<2)+8604>>2]|0;O=O&8191;do{if((K|0)==0){if(!((a[Q+8536|0]|0)==-1)){break}Ff(Q,O,P)}else{a[K+O|0]=M}}while(0);U=F;V=G;W=H;X=I;Y=q;Z=E;K=L;S=c[s>>2]|0;F=U;G=V;H=W;I=X;q=Y;E=Z;continue a}else if((J|0)==241){J=0;a[f+P|0]=M;U=F;V=G;W=H;X=I;S=L;Y=q;Z=E;K=O;N=N+2|0;F=U;G=V;H=W;I=X;q=Y;E=Z;continue a}do{if((J|0)==134){J=M>>>13;if(!((a[K+(J+8536)|0]|0)==-1)){P=d[(c[(c[K+8548>>2]|0)+(J<<2)>>2]|0)+(M&8191)|0]|0;J=136;break}P=Gf(K,M)|0;L=c[s>>2]|0;J=136}else if((J|0)==147){J=N>>>13;if(!((a[M+(J+8536)|0]|0)==-1)){P=d[(c[(c[M+8548>>2]|0)+(J<<2)>>2]|0)+(N&8191)|0]|0;J=149;break}P=Gf(M,N)|0;L=c[s>>2]|0;J=149}else if((J|0)==160){J=N>>>13;if(!((a[M+(J+8536)|0]|0)==-1)){P=d[(c[(c[M+8548>>2]|0)+(J<<2)>>2]|0)+(N&8191)|0]|0;J=162;break}P=Gf(M,N)|0;L=c[s>>2]|0;J=162}else if((J|0)==173){J=N>>>13;if(!((a[M+(J+8536)|0]|0)==-1)){P=d[(c[(c[M+8548>>2]|0)+(J<<2)>>2]|0)+(N&8191)|0]|0;J=175;break}P=Gf(M,N)|0;L=c[s>>2]|0;J=175}else if((J|0)==186){J=N>>>13;if(!((a[M+(J+8536)|0]|0)==-1)){P=d[(c[(c[M+8548>>2]|0)+(J<<2)>>2]|0)+(N&8191)|0]|0;J=188;break}P=Gf(M,N)|0;L=c[s>>2]|0;J=188}else if((J|0)==199){J=0;P=N>>>13;if(!((a[M+(P+8536)|0]|0)==-1)){P=d[(c[(c[M+8548>>2]|0)+(P<<2)>>2]|0)+(N&8191)|0]|0;break}P=Gf(M,N)|0;L=c[s>>2]|0}}while(0);if((J|0)==136){J=0;M=E-P|0;U=F;V=G;W=H;X=I;Y=q;Z=E;K=~M;M=M&255;N=O+1|0;S=L;F=U;G=V;H=W;I=X;q=Y;E=Z;continue a}else if((J|0)==149){J=0;M=P&E;U=F;V=G;W=H;X=I;Y=q;Z=K;E=M;N=O+1|0;S=L;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a}else if((J|0)==162){J=0;M=P^E;U=F;V=G;W=H;X=I;Y=q;Z=K;E=M;N=O+1|0;S=L;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a}else if((J|0)==175){J=0;M=P|E;U=F;V=G;W=H;X=I;Y=q;Z=K;E=M;N=O+1|0;S=L;F=U;G=V;H=W;I=X;q=Y;K=Z;continue a}else if((J|0)==188){J=0;P=P^255}M=K>>>8&1;V=((E^128)+M+(P<<24>>24)|0)>>>2&64|H&-65;M=E+M+P|0;W=F;X=G;Y=I;Z=q;E=M&255;K=M;N=O+1|0;S=L;H=V;F=W;G=X;I=Y;q=Z;continue a}else{J=319}}while(0);do{if((J|0)==319){J=0;c[s>>2]=S;O=Hf(w?0:v)|0;L=c[s>>2]|0;if((O|0)>0){break}if((L|0)<0){Q=F;R=G;T=H;U=I;V=N;W=M;X=q;Y=K;Z=E;S=L;F=Q;G=R;H=T;I=U;N=V;M=W;q=X;K=Y;E=Z;continue a}else{J=321;break a}}}while(0);a[f+(I+ -1|256)|0]=N>>>8;a[f+(I+ -2|256)|0]=N;N=c[t>>2]|0;N=d[N+(O+8177)|0]<<8|d[N+(O+8176)|0];I=I+ -3|256;P=H&76|(M>>>8|M)&128|K>>>8&1;P=(M&255|0)==0?P|2:P;a[f+I|0]=(O|0)==6?P|16:P;T=H&-13|4;a[j]=T;R=c[B>>2]|0;S=c[l>>2]|0;c[B>>2]=S;U=F;V=G;W=M;X=q;Y=K;Z=E;S=L+7+R-S|0;H=T;F=U;G=V;M=W;q=X;K=Y;E=Z}if((J|0)==306){ab()}else if((J|0)==321){c[s>>2]=L;b[D>>1]=N;a[x]=I+255;a[y]=E;a[z]=G;a[A]=F;f=H&76|(M>>>8|M)&128|K>>>8&1;a[j]=(M&255|0)==0?f|2:f;r=o+0|0;s=p+0|0;t=r+44|0;do{c[r>>2]=c[s>>2];r=r+4|0;s=s+4|0}while((r|0)<(t|0));c[g>>2]=n;i=h;return q|0}return 0}function vf(a){a=a|0;var b=0;b=i;c[a>>2]=41920;Al(c[a+8640>>2]|0);Ic(a);Al(a);i=b;return}function wf(a){a=a|0;var b=0;b=i;c[a>>2]=41920;Al(c[a+8640>>2]|0);Ic(a);i=b;return}function xf(a){a=a|0;var b=0,d=0,e=0;b=i;e=a+8640|0;d=c[e>>2]|0;c[e>>2]=0;c[a+8644>>2]=0;Al(d);Bg(a);i=b;return}function yf(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;b=c[b+8640>>2]|0;n=b+8232|0;if((d[n]|0)<=31){i=f;return 0}l=e+272|0;if((a[b+8263|0]|0)==0){k=32}else{k=(a[b+8279|0]|0)==0?48:32}p=0;while(1){o=a[b+(p+8232)|0]|0;if(o<<24>>24==0){m=p;break}p=p+1|0;if(((o&255)+1&255)>>>0<33){g=31;break}if((p|0)>=(k|0)){m=p;break}}if((g|0)==31){i=f;return 0}a:do{if((m|0)<(k|0)){while(1){o=m+1|0;if((a[b+(m+8232)|0]|0)!=0){break}if((o|0)<(k|0)){m=o}else{break a}}i=f;return 0}}while(0);Me(l,n,k);n=k+8232|0;l=b+n|0;m=e+784|0;if((a[b+(k|8263)|0]|0)==0){k=32}else{k=(a[b+(k+8279)|0]|0)==0?48:32}p=0;while(1){o=a[b+(p+n)|0]|0;if(o<<24>>24==0){j=p;break}p=p+1|0;if(((o&255)+1&255)>>>0<33){g=31;break}if((p|0)>=(k|0)){j=p;break}}if((g|0)==31){i=f;return 0}b:do{if((j|0)<(k|0)){while(1){o=j+1|0;if((a[b+(j+n)|0]|0)!=0){break}if((o|0)<(k|0)){j=o}else{break b}}i=f;return 0}}while(0);Me(m,l,k);j=k+n|0;k=b+j|0;e=e+1040|0;if((k|0)==0){i=f;return 0}if((a[b+(j+31)|0]|0)==0){l=32}else{l=(a[b+(j+47)|0]|0)==0?48:32}n=0;while(1){m=a[b+(n+j)|0]|0;if(m<<24>>24==0){h=n;break}n=n+1|0;if(((m&255)+1&255)>>>0<33){g=31;break}if((n|0)>=(l|0)){h=n;break}}if((g|0)==31){i=f;return 0}c:do{if((h|0)<(l|0)){while(1){g=h+1|0;if((a[b+(h+j)|0]|0)!=0){break}if((g|0)<(l|0)){h=g}else{break c}}i=f;return 0}}while(0);Me(e,k,l);i=f;return 0}function zf(b,e){b=b|0;e=e|0;var f=0,g=0,j=0,k=0,l=0;g=i;j=b+8640|0;k=b+8664|0;f=j;e=Qc(f,e,32,k,255,8200)|0;if((e|0)!=0){l=e;i=g;return l|0}l=(Jl(k,42552,4)|0)==0;k=l?0:c[10038]|0;if((k|0)!=0){l=k;i=g;return l|0}if((a[b+8668|0]|0)!=0){c[b+16>>2]=42136}if((Jl(b+8680|0,42160,4)|0)!=0){c[b+16>>2]=42168}if((Jl(b+8692|0,42192,4)|0)!=0){c[b+16>>2]=42200}l=d[b+8690|0]<<16|d[b+8691|0]<<24|d[b+8689|0]<<8|d[b+8688|0];k=d[b+8686|0]<<16|d[b+8687|0]<<24|d[b+8685|0]<<8|d[b+8684|0];if(l>>>0>1048575){c[b+16>>2]=42224;l=l&1048575}if((l+k|0)>>>0>1048576){c[b+16>>2]=42240}e=c[b+8648>>2]|0;a:do{if((k|0)!=(e|0)){do{if((k|0)<=(e+ -4|0)){if((Jl((c[j>>2]|0)+(k+8200)|0,42160,4)|0)!=0){break}c[b+16>>2]=42256;break a}}while(0);j=b+16|0;if((k|0)<(e|0)){c[j>>2]=42288;break}else{c[j>>2]=42304;break}}}while(0);Rc(f,l,8192);c[b+232>>2]=6;Fc(b+9288|0,+h[b+248>>3]*91552734375.0e-16);l=Nc(b,7159091)|0;i=g;return l|0}function Af(a,b){a=a|0;b=b|0;var c=0;c=i;Ec(a+9288|0,b);i=c;return}function Bf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=i;of(a+8752|0,b,c,d,e);i=f;return}function Cf(a,b){a=a|0;b=+b;var d=0;c[a+8696>>2]=~~(119210.0/b);d=~~(1024.0/b);c[a+8704>>2]=d;c[a+8716>>2]=(_(d,c[a+8720>>2]|0)|0)+1;i=i;return}function Df(e,f){e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=Oc(e,f)|0;if((h|0)!=0){f=h;i=g;return f|0}j=e+336|0;h=j;Pl(j|0,0,8192)|0;Pl(e+9848|0,0,24584)|0;nf(e+8752|0);sf(h);tf(h,0,d[e+8672|0]|0);tf(h,1,d[e+8673|0]|0);tf(h,2,d[e+8674|0]|0);tf(h,3,d[e+8675|0]|0);tf(h,4,d[e+8676|0]|0);tf(h,5,d[e+8677|0]|0);tf(h,6,d[e+8678|0]|0);tf(h,7,d[e+8679|0]|0);tf(h,8,255);a[e+8744|0]=6;c[e+8736>>2]=1073741824;c[e+8740>>2]=1073741824;a[e+8724|0]=0;c[e+8720>>2]=128;h=e+8716|0;c[e+8712>>2]=c[h>>2];a[e+8725|0]=0;c[e+8708>>2]=0;a[e+8732|0]=0;a[e+8733|0]=0;c[e+8728>>2]=0;a[e+847|0]=31;a[e+846|0]=-2;a[e+8534|0]=-3;b[e+8528>>1]=(d[e+8671|0]|0)<<8|(d[e+8670|0]|0);a[e+8530|0]=f;c[h>>2]=c[e+8704>>2]<<7|1;c[e+8700>>2]=0;f=0;i=g;return f|0}function Ef(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;if((d|0)==2){if((a[b+8732|0]|0)!=5){i=f;return}if((e&4|0)!=0){c[b+16>>2]=42328}d=c[b+8548>>2]|0;g=d+40|0;d=d+36|0;j=(c[d>>2]|0)+(c[g>>2]|0)|0;k=b+8728|0;h=c[k>>2]|0;if((h|0)<(j|0)){l=c[b+8696>>2]|0;do{h=h+l|0;}while((h|0)<(j|0));c[k>>2]=h}k=b+8708|0;m=j-(c[k>>2]|0)|0;if((m|0)>0){do{if((a[b+8724|0]|0)!=0){l=b+8712|0;m=(c[l>>2]|0)-m|0;c[l>>2]=m;if((m|0)>=1){break}c[l>>2]=(c[b+8716>>2]|0)+m}}while(0);c[k>>2]=j}j=e&255;a[b+8733|0]=j;k=(c[d>>2]|0)+(c[g>>2]|0)|0;l=b+8736|0;e=c[l>>2]|0;do{if((e|0)>(k|0)){c[l>>2]=1073741824;if((a[b+8724|0]|0)==0){e=1073741824;break}if((a[b+8725|0]|0)!=0){e=1073741824;break}e=(c[b+8712>>2]|0)+k|0;c[l>>2]=e}}while(0);l=b+8740|0;m=c[l>>2]|0;if((m|0)>(k|0)){j=(j&8)==0;c[l>>2]=j?1073741824:h;m=j?1073741824:h}h=a[b+8744|0]|0;e=(h&4)==0?e:1073741824;if((h&2)==0){e=(e|0)<(m|0)?e:m}h=c[b+8600>>2]|0;c[b+8596>>2]=e;if((h|0)>(e|0)){h=(a[b+8533|0]&4)==0?e:h}m=(c[d>>2]|0)-h|0;c[d>>2]=h;c[g>>2]=m+(c[g>>2]|0);i=f;return}else if((d|0)==0){a[b+8732|0]=e&31;i=f;return}else{i=f;return}}function Ff(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;h=c[b+8548>>2]|0;g=h+40|0;h=h+36|0;j=(c[h>>2]|0)+(c[g>>2]|0)|0;if((d+ -2048|0)>>>0<10){g=(c[b+8600>>2]|0)+8|0;qf(b+8752|0,(j|0)<(g|0)?j:g,d,e);i=f;return}a:do{switch(d|0){case 3:case 2:case 0:{Ef(b,d,e);i=f;return};case 3073:{e=e&1;d=b+8724|0;k=a[d]|0;if((k&255|0)==(e|0)){i=f;return}n=b+8728|0;l=c[n>>2]|0;if((l|0)<(j|0)){m=c[b+8696>>2]|0;do{l=l+m|0;}while((l|0)<(j|0));c[n>>2]=l}m=b+8708|0;n=j-(c[m>>2]|0)|0;if((n|0)>0){do{if(!(k<<24>>24==0)){k=b+8712|0;n=(c[k>>2]|0)-n|0;c[k>>2]=n;if((n|0)>=1){break}c[k>>2]=(c[b+8716>>2]|0)+n}}while(0);c[m>>2]=j}a[d]=e;if((e|0)==0){break a}c[b+8712>>2]=c[b+8716>>2];break};case 5122:{d=b+8728|0;l=c[d>>2]|0;if((l|0)<(j|0)){k=c[b+8696>>2]|0;do{l=l+k|0;}while((l|0)<(j|0));c[d>>2]=l}d=b+8708|0;m=j-(c[d>>2]|0)|0;if((m|0)>0){do{if((a[b+8724|0]|0)!=0){k=b+8712|0;m=(c[k>>2]|0)-m|0;c[k>>2]=m;if((m|0)>=1){break}c[k>>2]=(c[b+8716>>2]|0)+m}}while(0);c[d>>2]=j}a[b+8744|0]=e;break};case 3072:{d=b+8728|0;l=c[d>>2]|0;if((l|0)<(j|0)){k=c[b+8696>>2]|0;do{l=l+k|0;}while((l|0)<(j|0));c[d>>2]=l}d=b+8708|0;m=j-(c[d>>2]|0)|0;if((m|0)>0){do{if((a[b+8724|0]|0)!=0){k=b+8712|0;m=(c[k>>2]|0)-m|0;c[k>>2]=m;if((m|0)>=1){break}c[k>>2]=(c[b+8716>>2]|0)+m}}while(0);c[d>>2]=j}n=(e&127)+1|0;c[b+8720>>2]=n;n=(_(c[b+8704>>2]|0,n)|0)+1|0;c[b+8716>>2]=n;c[b+8712>>2]=n;break};case 5123:{e=b+8728|0;l=c[e>>2]|0;if((l|0)<(j|0)){d=c[b+8696>>2]|0;do{l=l+d|0;}while((l|0)<(j|0));c[e>>2]=l}d=b+8708|0;m=j-(c[d>>2]|0)|0;e=b+8724|0;if((m|0)>0){do{if((a[e]|0)!=0){k=b+8712|0;m=(c[k>>2]|0)-m|0;c[k>>2]=m;if((m|0)>=1){break}c[k>>2]=(c[b+8716>>2]|0)+m}}while(0);c[d>>2]=j}if((a[e]|0)!=0){c[b+8712>>2]=c[b+8716>>2]}a[b+8725|0]=0;break};default:{i=f;return}}}while(0);e=(c[h>>2]|0)+(c[g>>2]|0)|0;d=b+8736|0;j=c[d>>2]|0;do{if((j|0)>(e|0)){c[d>>2]=1073741824;if((a[b+8724|0]|0)==0){j=1073741824;break}if((a[b+8725|0]|0)!=0){j=1073741824;break}j=(c[b+8712>>2]|0)+e|0;c[d>>2]=j}}while(0);d=b+8740|0;k=c[d>>2]|0;if((k|0)>(e|0)){c[d>>2]=1073741824;e=(a[b+8733|0]&8)==0;c[d>>2]=e?1073741824:l;k=e?1073741824:l}e=a[b+8744|0]|0;j=(e&4)==0?j:1073741824;if((e&2)==0){j=(j|0)<(k|0)?j:k}e=c[b+8600>>2]|0;c[b+8596>>2]=j;if((e|0)>(j|0)){e=(a[b+8533|0]&4)==0?j:e}n=(c[h>>2]|0)-e|0;c[h>>2]=e;c[g>>2]=n+(c[g>>2]|0);i=f;return}function Gf(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;h=c[b+8548>>2]|0;g=h+40|0;h=h+36|0;j=(c[h>>2]|0)+(c[g>>2]|0)|0;switch(e&8191|0){case 0:{e=b+8740|0;if((c[e>>2]|0)>(j|0)){n=0;i=f;return n|0}c[e>>2]=1073741824;m=b+8728|0;k=c[m>>2]|0;if((k|0)<(j|0)){l=c[b+8696>>2]|0;do{k=k+l|0;}while((k|0)<(j|0));c[m>>2]=k}m=b+8708|0;n=j-(c[m>>2]|0)|0;if((n|0)>0){do{if((a[b+8724|0]|0)!=0){l=b+8712|0;n=(c[l>>2]|0)-n|0;c[l>>2]=n;if((n|0)>=1){break}c[l>>2]=(c[b+8716>>2]|0)+n}}while(0);c[m>>2]=j}l=(c[h>>2]|0)+(c[g>>2]|0)|0;m=b+8736|0;j=c[m>>2]|0;do{if((j|0)>(l|0)){c[m>>2]=1073741824;if((a[b+8724|0]|0)==0){j=1073741824;break}if((a[b+8725|0]|0)!=0){j=1073741824;break}j=(c[b+8712>>2]|0)+l|0;c[m>>2]=j}}while(0);if((l|0)<1073741824){c[e>>2]=1073741824;l=(a[b+8733|0]&8)==0;c[e>>2]=l?1073741824:k;e=l?1073741824:k}else{e=1073741824}k=a[b+8744|0]|0;j=(k&4)==0?j:1073741824;if((k&2)==0){j=(j|0)<(e|0)?j:e}e=c[b+8600>>2]|0;c[b+8596>>2]=j;if((e|0)>(j|0)){e=(a[b+8533|0]&4)==0?j:e}n=(c[h>>2]|0)-e|0;c[h>>2]=e;c[g>>2]=n+(c[g>>2]|0);n=32;i=f;return n|0};case 3072:case 3073:{g=b+8728|0;e=c[g>>2]|0;if((e|0)<(j|0)){h=c[b+8696>>2]|0;do{e=e+h|0;}while((e|0)<(j|0));c[g>>2]=e}h=b+8708|0;e=j-(c[h>>2]|0)|0;if((e|0)>0){do{if((a[b+8724|0]|0)!=0){g=b+8712|0;e=(c[g>>2]|0)-e|0;c[g>>2]=e;if((e|0)>=1){break}c[g>>2]=(c[b+8716>>2]|0)+e}}while(0);c[h>>2]=j}n=(((c[b+8712>>2]|0)+ -1|0)>>>0)/((c[b+8704>>2]|0)>>>0)|0;i=f;return n|0};case 5123:{g=(c[b+8736>>2]|0)>(j|0)?0:4;n=(c[b+8740>>2]|0)>(j|0)?g:g|2;i=f;return n|0};case 3:case 2:{n=0;i=f;return n|0};case 5122:{n=d[b+8744|0]|0;i=f;return n|0};default:{n=255;i=f;return n|0}}return 0}function Hf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;do{if((a[b+8533|0]&4)==0){e=c[b+8548>>2]|0;f=e+40|0;e=e+36|0;j=(c[e>>2]|0)+(c[f>>2]|0)|0;h=b+8736|0;do{if((c[h>>2]|0)<=(j|0)){g=a[b+8744|0]|0;if(!((g&4)==0)){break}a[b+8725|0]=1;c[h>>2]=1073741824;k=(c[e>>2]|0)+(c[f>>2]|0)|0;c[h>>2]=1073741824;h=b+8740|0;j=c[h>>2]|0;do{if((j|0)>(k|0)){c[h>>2]=1073741824;if((a[b+8733|0]&8)==0){j=1073741824;break}j=c[b+8728>>2]|0;c[h>>2]=j}}while(0);if((g&2)==0){g=(j|0)>1073741824?1073741824:j}else{g=1073741824}h=c[b+8600>>2]|0;c[b+8596>>2]=g;j=(h|0)>(g|0)?g:h;k=(c[e>>2]|0)-j|0;c[e>>2]=j;c[f>>2]=k+(c[f>>2]|0);k=10;i=d;return k|0}}while(0);if((c[b+8740>>2]|0)>(j|0)){break}if((a[b+8744|0]&2)==0){b=8}else{break}i=d;return b|0}}while(0);k=0;i=d;return k|0}function If(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;e=i;d=c[d>>2]|0;if(uf(b+336|0,d)|0){c[b+16>>2]=42360}f=b+8728|0;g=c[f>>2]|0;if((g|0)<(d|0)){h=c[b+8696>>2]|0;do{g=g+h|0;}while((g|0)<(d|0));c[f>>2]=g}h=b+8708|0;j=c[h>>2]|0;k=d-j|0;if((k|0)>0){do{if((a[b+8724|0]|0)!=0){j=b+8712|0;k=(c[j>>2]|0)-k|0;c[j>>2]=k;if((k|0)>=1){break}c[j>>2]=(c[b+8716>>2]|0)+k}}while(0);c[h>>2]=d;j=d}c[h>>2]=j-d;c[f>>2]=g-d;if((c[b+8548>>2]|0)!=(b+8552|0)){za(42472,42496,118,42536)}f=b+8588|0;c[f>>2]=(c[f>>2]|0)-d;f=b+8596|0;g=c[f>>2]|0;if((g|0)<1073741824){c[f>>2]=g-d}f=b+8600|0;g=c[f>>2]|0;if((g|0)<1073741824){c[f>>2]=g-d}f=b+8736|0;g=c[f>>2]|0;if((g|0)<1073741824){g=g-d|0;c[f>>2]=(g|0)<0?0:g}f=b+8740|0;g=c[f>>2]|0;if((g|0)>=1073741824){k=b+8752|0;rf(k,d);i=e;return 0}g=g-d|0;c[f>>2]=(g|0)<0?0:g;k=b+8752|0;rf(k,d);i=e;return 0}function Jf(){var a=0,b=0;a=i;b=zl(34432)|0;if((b|0)==0){b=0;i=a;return b|0}c[b+8548>>2]=b+8552;Gc(b);c[b>>2]=41920;c[b+8640>>2]=0;c[b+8644>>2]=0;mf(b+8752|0);c[b+8720>>2]=0;c[b+4>>2]=42112;c[b+228>>2]=42016;c[b+332>>2]=42088;c[b+284>>2]=6;if((c[b+256>>2]|0)!=0){za(42696,42712,228,42752)}h[b+248>>3]=1.11;i=a;return b|0}function Kf(){var a=0,b=0,d=0;a=i;b=zl(528)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=42592;c[b+4>>2]=42112;b=d;i=a;return b|0}function Lf(a){a=a|0;var b=0;b=i;Eg(a);i=b;return}function Mf(a){a=a|0;var b=0;b=i;Eg(a);Al(a);i=b;return}function Nf(a,b){a=a|0;b=b|0;var d=0;d=i;a=a+316|0;b=eb[c[(c[b>>2]|0)+12>>2]&63](b,a,208)|0;if((b|0)==0){a=(Jl(a,42552,4)|0)==0;a=a?0:c[10038]|0;i=d;return a|0}else{a=(b|0)==37536?c[10038]|0:b;i=d;return a|0}return 0}function Of(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;k=b+380|0;m=a[k]|0;if(!((m&255)>31)){i=d;return 0}j=c+272|0;if((a[b+411|0]|0)==0){g=32}else{g=(a[b+427|0]|0)==0?48:32}n=0;while(1){if(m<<24>>24==0){l=n;break}n=n+1|0;if(((m&255)+1&255)>>>0<33){e=31;break}if((n|0)>=(g|0)){l=n;break}m=a[b+n+380|0]|0}if((e|0)==31){i=d;return 0}a:do{if((l|0)<(g|0)){while(1){m=l+1|0;if((a[b+l+380|0]|0)!=0){break}if((m|0)<(g|0)){l=m}else{break a}}i=d;return 0}}while(0);Me(j,k,g);k=b+g+380|0;j=c+784|0;if((a[b+(g+31)+380|0]|0)==0){l=32}else{l=(a[b+(g+47)+380|0]|0)==0?48:32}n=0;while(1){m=a[b+(n+g)+380|0]|0;if(m<<24>>24==0){h=n;break}n=n+1|0;if(((m&255)+1&255)>>>0<33){e=31;break}if((n|0)>=(l|0)){h=n;break}}if((e|0)==31){i=d;return 0}b:do{if((h|0)<(l|0)){while(1){m=h+1|0;if((a[b+(h+g)+380|0]|0)!=0){break}if((m|0)<(l|0)){h=m}else{break b}}i=d;return 0}}while(0);Me(j,k,l);g=l+g|0;h=b+g+380|0;j=c+1040|0;if((a[b+(g+31)+380|0]|0)==0){c=32}else{c=(a[b+(g+47)+380|0]|0)==0?48:32}l=0;while(1){k=a[b+(l+g)+380|0]|0;if(k<<24>>24==0){f=l;break}l=l+1|0;if(((k&255)+1&255)>>>0<33){e=31;break}if((l|0)>=(c|0)){f=l;break}}if((e|0)==31){i=d;return 0}c:do{if((f|0)<(c|0)){while(1){e=f+1|0;if((a[b+(f+g)+380|0]|0)!=0){break}if((e|0)<(c|0)){f=e}else{break c}}i=d;return 0}}while(0);Me(j,h,c);i=d;return 0}function Pf(b){b=b|0;var e=0,f=0,g=0,h=0;e=i;c[b+516>>2]=b+520;f=255;do{if((f|0)==0){g=4}else{h=1;g=f;do{h=g^h;g=g>>1;}while((g|0)!=0);g=h<<2&4}h=g|f&168;a[b+f|0]=h;a[b+(f+256)|0]=h|1;f=f+ -1|0;}while((f|0)>-1);h=b;a[h]=d[h]|0|64;h=b+256|0;a[h]=d[h]|0|64;i=e;return}function Qf(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=a+520|0;c[a+516>>2]=g;c[a+596>>2]=0;c[a+592>>2]=0;c[a+512>>2]=0;c[a+556>>2]=d;c[g>>2]=e;c[a+560>>2]=d;c[a+524>>2]=e;c[a+564>>2]=d;c[a+528>>2]=e;c[a+568>>2]=d;c[a+532>>2]=e;c[a+572>>2]=d;c[a+536>>2]=e;c[a+576>>2]=d;c[a+540>>2]=e;c[a+580>>2]=d;c[a+544>>2]=e;c[a+584>>2]=d;c[a+548>>2]=e;c[a+588>>2]=d;c[a+552>>2]=e;e=a+600|0;a=e+30|0;do{b[e>>1]=0;e=e+2|0}while((e|0)<(a|0));i=f;return}function Rf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;if((b&8191|0)!=0){za(42768,42792,103,42832)}if((d&8191|0)!=0){za(42840,42792,104,42832)}b=b>>>13;d=d>>>13;if((d|0)==0){i=g;return}a=a+516|0;do{d=d+ -1|0;j=d<<13;h=d+b|0;c[(c[a>>2]|0)+(h<<2)+36>>2]=e+j;c[(c[a>>2]|0)+(h<<2)>>2]=f+j;}while((d|0)!=0);i=g;return}function Sf(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0;j=i;i=i+88|0;l=j;h=j+80|0;k=f+516|0;m=c[k>>2]|0;r=m+72|0;n=(c[r>>2]|0)-g|0;c[r>>2]=g;m=m+76|0;c[m>>2]=n+(c[m>>2]|0);m=l;n=f+520|0;g=n;r=m+0|0;s=g+0|0;q=r+80|0;do{c[r>>2]=c[s>>2];r=r+4|0;s=s+4|0}while((r|0)<(q|0));c[k>>2]=l;r=h;ea=f+608|0;w=ea;v=w;u=v;v=v+4|0;v=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24;q=h;c[q>>2]=d[u]|d[u+1|0]<<8|d[u+2|0]<<16|d[u+3|0]<<24;c[q+4>>2]=v;q=l+76|0;v=f+600|0;u=f+602|0;s=f+604|0;t=f+606|0;L=f+622|0;aa=r+6|0;M=f+623|0;J=l+72|0;G=r+4|0;H=r+1|0;X=h;K=X+4|0;O=h+ -24|0;N=h;R=h+ -184|0;Q=h+ -160|0;S=h+ -176|0;T=h+ -168|0;U=h+ -112|0;P=h+ -8|0;X=X+2|0;Y=f+616|0;Z=h;_=f+618|0;$=f+620|0;V=f+624|0;W=f+625|0;D=h+ -16|0;A=h+ -32|0;y=h+ -48|0;I=h+ -40|0;C=h+ -56|0;r=r+7|0;B=f+627|0;E=f+626|0;z=f+628|0;F=h+ -96|0;x=h+ -104|0;ea=d[ea+7|0]|0;da=e[s>>1]|0;ca=e[t>>1]|0;fa=e[v>>1]|0;ga=c[q>>2]|0;ba=e[u>>1]|0;p=0;a:while(1){na=c[l+(fa>>>13<<2)>>2]|0;oa=fa&8191;pa=na+(oa+1)|0;ma=a[na+oa|0]|0;ia=ma&255;ja=fa+1|0;qa=d[42864+ia|0]|0;ha=qa+ga|0;if(!((ha|0)<0|(ha|0)<(qa|0))){o=264;break}la=a[(c[l+(ja>>>13<<2)>>2]|0)+(ja&8191)|0]|0;ka=la&255;b:do{switch(ia|0){case 226:{if((ea&4|0)!=0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 224:{if((ea&4|0)==0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 201:{ga=ha;o=57;break};case 220:{if((ea&1|0)==0){o=3}else{o=66}break};case 46:{a[G]=la;ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+2|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 242:{if((ea&128|0)!=0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 192:{if((ea&64|0)==0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 16:{qa=(d[H]|0)+ -1|0;a[H]=qa;fa=fa+2|0;if((qa|0)==0){o=2;break b}ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=(la<<24>>24)+fa&65535;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 211:{ma=d[aa]|0;cg(f,(c[J>>2]|0)+ha|0,ma<<8|ka,ma);ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+2|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 233:{ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=e[K>>1]|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 127:case 109:case 100:case 91:case 82:case 73:case 64:case 0:{ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 240:{if((ea&128|0)==0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 58:{ma=d[na+(oa+2)|0]|0;a[aa]=a[(c[l+(ma>>>5<<2)>>2]|0)+(ma<<8&7936|(d[pa]|0))|0]|0;ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+3|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 32:{fa=fa+2|0;if((ea&64|0)!=0){o=2;break b}ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=(la<<24>>24)+fa&65535;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 56:{fa=fa+2|0;if((ea&1|0)==0){o=2;break b}ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=(la<<24>>24)+fa&65535;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 40:{fa=fa+2|0;if((ea&64|0)==0){o=2;break b}ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=(la<<24>>24)+fa&65535;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 200:{if((ea&64|0)!=0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 194:{if((ea&64|0)!=0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 216:{if((ea&1|0)!=0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 202:{if((ea&64|0)==0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 24:{ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+2+(la<<24>>24)&65535;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 250:{if((ea&128|0)==0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 248:{if((ea&128|0)!=0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 62:{a[aa]=la;ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+2|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 8:{ma=a[L]|0;a[L]=a[aa]|0;a[aa]=ma;ma=d[M]|0;a[M]=ea;na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=ma;p=na;ba=oa;ca=pa;da=qa;continue a};case 210:{if((ea&1|0)!=0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 204:{if((ea&64|0)==0){o=3}else{o=66}break};case 48:{fa=fa+2|0;if((ea&1|0)!=0){o=2;break b}ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=(la<<24>>24)+fa&65535;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 218:{if((ea&1|0)==0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 232:{if((ea&4|0)!=0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 208:{if((ea&1|0)==0){ga=ha;o=57;break b}ma=p;na=ba;fa=ja;oa=ca;pa=da;qa=ea;ga=ha+ -6|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 195:{ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 212:{if((ea&1|0)==0){o=66}else{o=3}break};case 228:{if((ea&4|0)==0){o=66}else{o=3}break};case 234:{if((ea&4|0)==0){ga=ha;o=4;break b}ja=p;ka=ba;ga=ha;la=ca;ma=da;qa=ea;fa=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ja;ba=ka;ca=la;da=ma;ea=qa;continue a};case 196:{if((ea&64|0)==0){o=66}else{o=3}break};case 206:case 222:{o=77;break};case 134:case 150:{ea=ea&-2;o=75;break};case 241:{ea=d[(c[l+(ba>>>13<<2)>>2]|0)+(ba&8191)|0]|0;oa=ba+1|0;a[aa]=a[(c[l+(oa>>>13<<2)>>2]|0)+(oa&8191)|0]|0;oa=p;ga=ha;fa=ja;pa=ca;qa=da;ba=ba+2&65535;p=oa;ca=pa;da=qa;continue a};case 43:case 27:case 11:{ma=N+((ia>>>3)+ -1)|0;b[ma>>1]=(b[ma>>1]|0)+ -1<<16>>16;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 38:case 30:case 22:case 14:case 6:{a[N+(ia>>>3^1)|0]=la;ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+2|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 229:case 213:case 197:{la=e[O+(ia>>>3)>>1]|0;fa=ja;ga=ha;o=71;break};case 35:case 19:case 3:{ma=N+(ia>>>3)|0;b[ma>>1]=(b[ma>>1]|0)+1<<16>>16;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 54:{c[q>>2]=ha;bg(f,e[K>>1]|0,ka);ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+2|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 126:case 110:case 102:case 94:case 86:case 78:case 70:{ma=e[K>>1]|0;a[P+(ia>>>3^1)|0]=a[(c[l+(ma>>>13<<2)>>2]|0)+(ma&8191)|0]|0;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 49:{ka=p;ga=ha;la=ca;ma=da;qa=ea;fa=fa+3|0;ba=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);p=ka;ca=la;da=ma;ea=qa;continue a};case 50:{ma=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);c[q>>2]=ha;bg(f,ma,d[aa]|0);ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+3|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 34:{na=d[na+(oa+2)|0]|0;ma=na<<8&7936|(d[pa]|0);na=c[l+(na>>>5<<2)+36>>2]|0;ga=b[K>>1]|0;a[na+(ma+1)|0]=(ga&65535)>>>8;a[na+ma|0]=ga;ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+3|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 42:{na=d[na+(oa+2)|0]|0;ma=na<<8&7936|(d[pa]|0);na=c[l+(na>>>5<<2)>>2]|0;b[K>>1]=(d[na+(ma+1)|0]|0)<<8|(d[na+ma|0]|0);ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+3|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 167:case 165:case 164:case 163:case 162:case 161:case 160:{ka=d[Q+(ia^1)|0]|0;fa=ja;ga=ha;o=104;break};case 191:case 189:case 188:case 187:case 186:case 185:case 184:{ka=d[R+(ia^1)|0]|0;fa=ja;ga=ha;o=84;break};case 60:case 44:case 36:case 28:case 20:case 12:case 4:{fa=N+(ia>>>3^1)|0;ka=(a[fa]|0)+1<<24>>24;a[fa]=ka;ka=ka&255;fa=ja;ga=ha;o=93;break};case 183:case 181:case 180:case 179:case 178:case 177:case 176:{ka=d[S+(ia^1)|0]|0;fa=ja;ga=ha;o=108;break};case 175:case 173:case 172:case 171:case 170:case 169:case 168:{ka=d[T+(ia^1)|0]|0;fa=ja;ga=ha;o=112;break};case 135:case 133:case 132:case 131:case 130:case 129:case 128:case 151:case 149:case 148:case 147:case 146:case 145:case 144:{ea=ea&-2;o=79;break};case 125:case 124:case 123:case 122:case 121:case 120:case 111:case 108:case 107:case 106:case 105:case 104:case 103:case 101:case 99:case 98:case 97:case 96:case 95:case 93:case 92:case 90:case 89:case 88:case 87:case 85:case 84:case 83:case 81:case 80:case 79:case 77:case 76:case 75:case 74:case 72:case 71:case 69:case 68:case 67:case 66:case 65:{a[N+(ia>>>3&7^1)|0]=a[N+(ia&7^1)|0]|0;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 33:case 17:case 1:{b[N+(ia>>>3)>>1]=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+3|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 18:case 2:{c[q>>2]=ha;bg(f,e[N+(ia>>>3)>>1]|0,d[aa]|0);ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 26:case 10:{ma=e[N+((ia>>>3)+ -1)>>1]|0;a[aa]=a[(c[l+(ma>>>13<<2)>>2]|0)+(ma&8191)|0]|0;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 254:{fa=fa+2|0;ga=ha;o=84;break};case 230:{fa=fa+2|0;ga=ha;o=104;break};case 41:case 25:case 9:{fa=e[N+((ia>>>3)+ -1)>>1]|0;o=86;break};case 57:{fa=ba;o=86;break};case 247:case 239:case 231:case 223:case 215:case 207:case 199:{o=68;break};case 52:{fa=e[K>>1]|0;ka=(d[(c[l+(fa>>>13<<2)>>2]|0)+(fa&8191)|0]|0)+1|0;c[q>>2]=ha;bg(f,fa,ka);fa=ja;ga=ha;o=93;break};case 61:case 45:case 37:case 29:case 21:case 13:case 5:{fa=N+(ia>>>3^1)|0;ka=(a[fa]|0)+ -1<<24>>24;a[fa]=ka;ka=ka&255;fa=ja;ga=ha;o=96;break};case 53:{fa=e[K>>1]|0;ka=(d[(c[l+(fa>>>13<<2)>>2]|0)+(fa&8191)|0]|0)+ -1|0;c[q>>2]=ha;bg(f,fa,ka);fa=ja;ga=ha;o=96;break};case 246:{fa=fa+2|0;ga=ha;o=108;break};case 190:{ka=e[K>>1]|0;ka=d[(c[l+(ka>>>13<<2)>>2]|0)+(ka&8191)|0]|0;fa=ja;ga=ha;o=84;break};case 182:{ka=e[K>>1]|0;ka=d[(c[l+(ka>>>13<<2)>>2]|0)+(ka&8191)|0]|0;fa=ja;ga=ha;o=108;break};case 236:{if((ea&4|0)==0){o=3}else{o=66}break};case 143:case 141:case 140:case 139:case 138:case 137:case 136:case 159:case 157:case 156:case 155:case 154:case 153:case 152:{o=79;break};case 39:{ga=a[aa]|0;fa=ga&255;ga=(ga&255)>153|ea;ia=0-(ga&1)&96;if((ea&16|0)==0){if((fa&14)>>>0>9){o=89}}else{o=89}if((o|0)==89){o=0;ia=ia|6}na=((ea&2|0)==0?ia:0-ia|0)+fa|0;ea=d[f+(na&255)|0]|0|ga&3|(fa^na)&16;a[aa]=na;na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue a};case 244:{if((ea&128|0)==0){o=66}else{o=3}break};case 255:{if(ja>>>0>65535){o=262;break a}else{o=68}break};case 252:{if((ea&128|0)==0){o=3}else{o=66}break};case 142:case 158:{o=75;break};case 51:{na=p;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;ba=ba+1&65535;p=na;ca=oa;da=pa;ea=qa;continue a};case 166:{ka=e[K>>1]|0;ka=d[(c[l+(ka>>>13<<2)>>2]|0)+(ka&8191)|0]|0;fa=ja;ga=ha;o=104;break};case 198:case 214:{ea=ea&-2;o=77;break};case 59:{na=p;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;ba=ba+65535&65535;p=na;ca=oa;da=pa;ea=qa;continue a};case 174:{ka=e[K>>1]|0;ka=d[(c[l+(ka>>>13<<2)>>2]|0)+(ka&8191)|0]|0;fa=ja;ga=ha;o=112;break};case 238:{fa=fa+2|0;ga=ha;o=112;break};case 205:{o=66;break};case 119:case 117:case 116:case 115:case 114:case 113:case 112:{c[q>>2]=ha;bg(f,e[K>>1]|0,d[U+(ia^1)|0]|0);ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 225:case 209:case 193:{na=ba&8191;ga=c[l+(ba>>>13<<2)>>2]|0;b[O+(ia>>>3)>>1]=(d[ga+(na+1)|0]|0)<<8|(d[ga+na|0]|0);na=p;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;ba=ba+2&65535;p=na;ca=oa;da=pa;ea=qa;continue a};case 245:{la=((d[aa]|0)<<8)+ea|0;fa=ja;ga=ha;o=71;break};case 203:{fa=fa+2|0;switch(ka|0){case 14:{ia=e[K>>1]|0;ga=ha+7|0;o=153;break b};case 63:case 61:case 60:case 59:case 58:case 57:case 56:{na=C+(ka^1)|0;ea=d[na]|0;oa=ea>>>1;ea=ea&1|(d[f+oa|0]|0);a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue a};case 46:{ia=e[K>>1]|0;ga=ha+7|0;o=159;break b};case 62:{ia=e[K>>1]|0;ga=ha+7|0;o=162;break b};case 38:{ia=e[K>>1]|0;ga=ha+7|0;o=147;break b};case 39:case 37:case 36:case 35:case 34:case 33:case 32:{na=A+(ka^1)|0;oa=(d[na]|0)<<1;ea=d[f+oa|0]|0;a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue a};case 31:case 29:case 28:case 27:case 26:case 25:case 24:{na=O+(ka^1)|0;ma=d[na]|0;oa=ma>>>1|ea<<7&128;ma=d[f+oa|0]|0|ma&1;a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;ea=ma;p=na;ba=oa;ca=pa;da=qa;continue a};case 55:case 53:case 52:case 51:case 50:case 49:case 48:{na=y+(ka^1)|0;oa=(d[na]|0)<<1|1;ea=d[f+oa|0]|0;a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue a};case 126:case 118:case 110:case 102:case 94:case 86:case 78:case 70:{qa=e[K>>1]|0;ea=ea&1;ga=ha+4|0;ha=d[(c[l+(qa>>>13<<2)>>2]|0)+(qa&8191)|0]|0;break};case 6:{ia=e[K>>1]|0;ga=ha+7|0;o=141;break b};case 254:case 246:case 238:case 230:case 222:case 214:case 206:case 198:case 190:case 182:case 174:case 166:case 158:case 150:case 142:case 134:{ga=ha+7|0;ia=e[K>>1]|0;ha=1<<(ka>>>3&7);ma=(d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0|ha)^((ka&64|0)==0?ha:0);c[q>>2]=ga;bg(f,ia,ma);ma=p;na=ba;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 47:case 45:case 44:case 43:case 42:case 41:case 40:{na=I+(ka^1)|0;ea=d[na]|0;oa=ea&128|ea>>>1;ea=ea&1|(d[f+oa|0]|0);a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue a};case 54:{ia=e[K>>1]|0;ga=ha+7|0;o=150;break b};case 7:case 5:case 4:case 3:case 2:case 1:case 0:{na=N+(ka^1)|0;oa=d[na]|0;ea=oa>>>7;oa=oa<<1&254|ea;ea=d[f+oa|0]|0|ea;a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue a};case 15:case 13:case 12:case 11:case 10:case 9:case 8:{na=P+(ka^1)|0;ea=d[na]|0;oa=ea<<7&128|ea>>>1;ea=ea&1|(d[f+oa|0]|0);a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue a};case 127:case 125:case 124:case 123:case 122:case 121:case 120:case 119:case 117:case 116:case 115:case 114:case 113:case 112:case 111:case 109:case 108:case 107:case 106:case 105:case 104:case 103:case 101:case 100:case 99:case 98:case 97:case 96:case 95:case 93:case 92:case 91:case 90:case 89:case 88:case 87:case 85:case 84:case 83:case 82:case 81:case 80:case 79:case 77:case 76:case 75:case 74:case 73:case 72:case 71:case 69:case 68:case 67:case 66:case 65:case 64:{qa=d[N+(ka&7^1)|0]|0;ea=qa&40|ea&1;ga=ha;ha=qa;break};case 30:{ia=e[K>>1]|0;ga=ha+7|0;o=156;break b};case 191:case 189:case 188:case 187:case 186:case 185:case 184:case 183:case 181:case 180:case 179:case 178:case 177:case 176:case 175:case 173:case 172:case 171:case 170:case 169:case 168:case 167:case 165:case 164:case 163:case 162:case 161:case 160:case 159:case 157:case 156:case 155:case 154:case 153:case 152:case 151:case 149:case 148:case 147:case 146:case 145:case 144:case 143:case 141:case 140:case 139:case 138:case 137:case 136:case 135:case 133:case 132:case 131:case 130:case 129:case 128:{ma=N+(ka&7^1)|0;a[ma]=(d[ma]|0)&(1<<(ka>>>3&7)^255);ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 22:{ia=e[K>>1]|0;ga=ha+7|0;o=144;break b};case 23:case 21:case 20:case 19:case 18:case 17:case 16:{na=D+(ka^1)|0;oa=(d[na]|0)<<1|ea&1;ma=d[f+oa|0]|0;a[na]=oa;na=p;oa=ba;ga=ha;pa=ca;qa=da;ea=ma;p=na;ba=oa;ca=pa;da=qa;continue a};case 255:case 253:case 252:case 251:case 250:case 249:case 248:case 247:case 245:case 244:case 243:case 242:case 241:case 240:case 239:case 237:case 236:case 235:case 234:case 233:case 232:case 231:case 229:case 228:case 227:case 226:case 225:case 224:case 223:case 221:case 220:case 219:case 218:case 217:case 216:case 215:case 213:case 212:case 211:case 210:case 209:case 208:case 207:case 205:case 204:case 203:case 202:case 201:case 200:case 199:case 197:case 196:case 195:case 194:case 193:case 192:{ma=N+(ka&7^1)|0;a[ma]=d[ma]|0|1<<(ka>>>3&7);ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};default:{o=170;break a}}ma=ha&1<<(ka>>>3&7);na=p;oa=ba;pa=ca;qa=da;ea=ea|ma&128|(ma+32767|0)>>>8&68|16;p=na;ba=oa;ca=pa;da=qa;continue a};case 227:{na=ba&8191;ga=ba>>>13;ma=c[l+(ga<<2)>>2]|0;oa=na+1|0;ma=(d[ma+oa|0]|0)<<8|(d[ma+na|0]|0);ga=c[l+(ga<<2)+36>>2]|0;fa=b[K>>1]|0;a[ga+oa|0]=(fa&65535)>>>8;a[ga+na|0]=fa;b[K>>1]=ma;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 23:{la=d[aa]|0;ma=la<<1;a[aa]=ma|ea&1;na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=la>>>7|ea&196|ma&40;p=na;ba=oa;ca=pa;da=qa;continue a};case 249:{na=p;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;ba=e[K>>1]|0;p=na;ca=oa;da=pa;ea=qa;continue a};case 55:{na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=ea&196|a[aa]&40|1;p=na;ba=oa;ca=pa;da=qa;continue a};case 251:{a[V]=1;a[W]=1;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 47:{ma=~(d[aa]|0);a[aa]=ma;na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=ea&197|ma&40|18;p=na;ba=oa;ca=pa;da=qa;continue a};case 243:{a[V]=0;a[W]=0;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 15:{la=d[aa]|0;ma=la>>>1;a[aa]=la<<7|ma;na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=la&1|ea&196|ma&40;p=na;ba=oa;ca=pa;da=qa;continue a};case 31:{la=d[aa]|0;ma=la>>>1;a[aa]=ma|ea<<7;na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=la&1|ea&196|ma&40;p=na;ba=oa;ca=pa;da=qa;continue a};case 7:{ma=d[aa]|0;ma=ma<<1|ma>>>7;a[aa]=ma;na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=ma&41|ea&196;p=na;ba=oa;ca=pa;da=qa;continue a};case 63:{na=p;oa=ba;ga=ha;fa=ja;pa=ca;qa=da;ea=(ea<<4&16|ea&197|a[aa]&40)^1;p=na;ba=oa;ca=pa;da=qa;continue a};case 235:{ma=b[K>>1]|0;b[K>>1]=b[X>>1]|0;b[X>>1]=ma;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 237:{ia=fa+2|0;ga=((d[43136+ka|0]|0)>>>4)+ha|0;switch(ka|0){case 103:{fa=c[K>>2]|0;oa=fa&65535;na=d[(c[l+(oa>>>13<<2)>>2]|0)+(fa&8191)|0]|0;c[q>>2]=ga;fa=fa>>>16;bg(f,oa,fa<<4&4080|na>>>4);na=fa&240|na&15;fa=d[f+na|0]|0|ea&1;a[aa]=na;na=p;oa=ba;pa=ca;qa=da;ea=fa;fa=ia;p=na;ba=oa;ca=pa;da=qa;continue a};case 83:case 67:{ha=e[P+(ka>>>3)>>1]|0;o=178;break};case 176:case 160:{ha=1;o=188;break};case 115:{ha=ba;o=178;break};case 184:case 168:{ha=-1;o=188;break};case 120:case 112:case 104:case 96:case 88:case 80:case 72:case 64:{fa=dg(f,(c[J>>2]|0)+ga|0,e[Z>>1]|0)|0;a[P+(ka>>>3^1)|0]=fa;na=p;oa=ba;pa=ca;qa=da;ea=d[f+fa|0]|0|ea&1;fa=ia;p=na;ba=oa;ca=pa;da=qa;continue a};case 121:case 105:case 97:case 89:case 81:case 73:case 65:{o=176;break};case 91:case 75:{pa=d[na+(oa+3)|0]|0;ma=pa<<8&7936|(d[na+(oa+2)|0]|0);na=c[l+(pa>>>5<<2)>>2]|0;b[N+((ka>>>3)+ -9)>>1]=(d[na+(ma+1)|0]|0)<<8|(d[na+ma|0]|0);ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=fa+4|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 122:case 114:{fa=ba;o=173;break};case 123:{ma=d[na+(oa+3)|0]|0;ba=ma<<8&7936|(d[na+(oa+2)|0]|0);ma=c[l+(ma>>>5<<2)>>2]|0;na=p;oa=ca;pa=da;qa=ea;fa=fa+4|0;ba=(d[ma+(ba+1)|0]|0)<<8|(d[ma+ba|0]|0);p=na;ca=oa;da=pa;ea=qa;continue a};case 124:case 116:case 108:case 100:case 92:case 84:case 76:case 68:{la=d[aa]|0;a[aa]=0;ea=ea&-2;ka=16;fa=ia;o=80;break b};case 111:{fa=c[K>>2]|0;oa=fa&65535;na=d[(c[l+(oa>>>13<<2)>>2]|0)+(fa&8191)|0]|0;c[q>>2]=ga;fa=fa>>>16;bg(f,oa,fa&15|na<<4);na=fa&240|na>>>4;fa=d[f+na|0]|0|ea&1;a[aa]=na;na=p;oa=ba;pa=ca;qa=da;ea=fa;fa=ia;p=na;ba=oa;ca=pa;da=qa;continue a};case 177:case 161:{ha=1;o=185;break};case 185:case 169:{ha=-1;o=185;break};case 106:case 90:case 74:case 98:case 82:case 66:{fa=e[N+(ka>>>3&6)>>1]|0;o=173;break};case 113:{a[r]=0;o=176;break};case 87:{fa=B;o=197;break};case 179:case 163:{ea=1;o=191;break};case 126:case 94:{a[z]=2;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 178:case 162:{ea=1;o=193;break};case 110:case 102:case 78:case 70:{a[z]=0;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 95:{fa=E;p=1;o=197;break};case 71:{a[B]=a[aa]|0;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 118:case 86:{a[z]=1;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 187:case 171:{ea=-1;o=191;break};case 125:case 117:case 109:case 101:case 93:case 85:case 77:case 69:{a[V]=a[W]|0;o=57;break b};case 79:{a[E]=a[aa]|0;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=1;ba=na;ca=oa;da=pa;ea=qa;continue a};case 186:case 170:{ea=-1;o=193;break};default:{na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=1;ba=na;ca=oa;da=pa;ea=qa;continue a}}if((o|0)==173){o=0;ea=fa+(ea&1)|0;ha=ka>>>2&2;ja=e[K>>1]|0;qa=((ha|0)==0?0-ea|0:ea)+ja|0;ea=ja^fa^qa;ea=(qa>>>16&1|ha|qa>>>8&168|ea>>>8&16|(ea+32768|0)>>>14&4)^2;qa=qa&65535;b[K>>1]=qa;ea=qa<<16>>16==0?ea|64:ea;fa=ia;continue a}else if((o|0)==176){o=0;cg(f,(c[J>>2]|0)+ga|0,e[Z>>1]|0,d[P+(ka>>>3^1)|0]|0);ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a}else if((o|0)==178){o=0;pa=d[na+(oa+3)|0]|0;ma=pa<<8&7936|(d[na+(oa+2)|0]|0);na=c[l+(pa>>>5<<2)+36>>2]|0;a[na+(ma+1)|0]=ha>>>8;a[na+ma|0]=ha;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=fa+4|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a}else if((o|0)==185){o=0;qa=c[K>>2]|0;b[K>>1]=qa+ha;ja=a[(c[l+((qa>>>13&7)<<2)>>2]|0)+(qa&8191)|0]|0;qa=qa>>>16;ka=(qa&255)-(ja&255)|0;ja=(qa&255^ja)&16^ka&144;ha=(ka&255)<<24>>24==0?66:2;qa=ka-(ja>>>4&1)|0;ea=ja|ea&1|ha|qa&8|qa<<4&32;qa=(b[Z>>1]|0)+ -1<<16>>16;b[Z>>1]=qa;if(qa<<16>>16==0){na=p;oa=ba;pa=ca;qa=da;fa=ia;p=na;ba=oa;ca=pa;da=qa;continue a}ha=(ha&64|0)!=0|(la&255)<176;ea=ea|4;fa=ha?ia:fa;ga=ha?ga:ga+5|0;continue a}else if((o|0)==188){o=0;pa=c[K>>2]|0;b[K>>1]=pa+ha;qa=d[(c[l+((pa>>>13&7)<<2)>>2]|0)+(pa&8191)|0]|0;oa=e[X>>1]|0;b[X>>1]=oa+ha;c[q>>2]=ga;bg(f,oa,qa);qa=(pa>>>16&255)+qa|0;ea=qa&8|ea&193|qa<<4&32;qa=(b[Z>>1]|0)+ -1<<16>>16;b[Z>>1]=qa;if(qa<<16>>16==0){na=p;oa=ba;pa=ca;qa=da;fa=ia;p=na;ba=oa;ca=pa;da=qa;continue a}ha=(la&255)<176;ea=ea|4;fa=ha?ia:fa;ga=ha?ga:ga+5|0;continue a}else if((o|0)==191){o=0;ja=e[K>>1]|0;b[K>>1]=ja+ea;ja=d[(c[l+(ja>>>13<<2)>>2]|0)+(ja&8191)|0]|0;ha=(a[H]|0)+ -1<<24>>24;a[H]=ha;ea=a[f+(ha&255)|0]&251|ja>>>6&2;ha=ha<<24>>24!=0&(la&255)>175;ga=ha?ga+5|0:ga;cg(f,ga+(c[J>>2]|0)|0,e[Z>>1]|0,ja);fa=ha?fa:ia;continue a}else if((o|0)==193){o=0;ja=e[K>>1]|0;b[K>>1]=ja+ea;ka=dg(f,(c[J>>2]|0)+ga|0,e[Z>>1]|0)|0;ha=(a[H]|0)+ -1<<24>>24;a[H]=ha;ea=a[f+(ha&255)|0]&251|ka>>>6&2;ha=ha<<24>>24!=0&(la&255)>175;ga=ha?ga+5|0:ga;c[q>>2]=ga;bg(f,ja,ka);fa=ha?fa:ia;continue a}else if((o|0)==197){o=0;fa=a[fa]|0;a[aa]=fa;oa=ba;pa=ca;qa=da;ea=a[f+(fa&255)|0]&251|ea&1|(d[W]|0)<<2&4;fa=ia;ba=oa;ca=pa;da=qa;continue a}break};case 217:{ma=b[Y>>1]|0;na=c[h>>2]|0;b[Y>>1]=na;b[Z>>1]=ma;ma=b[_>>1]|0;b[_>>1]=na>>>16;b[X>>1]=ma;ma=b[$>>1]|0;b[$>>1]=b[K>>1]|0;b[K>>1]=ma;ma=p;na=ba;ga=ha;fa=ja;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 219:{a[aa]=dg(f,(c[J>>2]|0)+ha|0,(d[aa]|0)<<8|ka)|0;ma=p;na=ba;ga=ha;oa=ca;pa=da;qa=ea;fa=fa+2|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 253:{la=ca;o=203;break};case 221:{la=da;o=203;break};case 118:{o=263;break a};default:{o=261;break a}}}while(0);c:do{if((o|0)==2){o=0;ma=p;na=ba;oa=ca;pa=da;qa=ea;ga=ha+ -5|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a}else if((o|0)==3){ga=ha+ -7|0;o=4}else if((o|0)==57){o=0;fa=ba&8191;ma=c[l+(ba>>>13<<2)>>2]|0;na=p;oa=ca;pa=da;qa=ea;fa=(d[ma+(fa+1)|0]|0)<<8|(d[ma+fa|0]|0);ba=ba+2&65535;p=na;ca=oa;da=pa;ea=qa;continue a}else if((o|0)==66){o=0;qa=fa+3|0;la=(d[na+(oa+2)|0]|0)<<8|(d[pa]|0);na=ba+65534|0;ma=na&65535;na=na&8191;ga=c[l+(ma>>>13<<2)+36>>2]|0;a[ga+(na+1)|0]=qa>>>8;a[ga+na|0]=qa;na=p;ga=ha;oa=ca;pa=da;qa=ea;fa=la;ba=ma;p=na;ca=oa;da=pa;ea=qa;continue a}else if((o|0)==68){la=ja;fa=ia&56;ga=ha;o=71}else if((o|0)==75){la=e[K>>1]|0;la=d[(c[l+(la>>>13<<2)>>2]|0)+(la&8191)|0]|0;ka=ia;fa=ja;ga=ha;o=80}else if((o|0)==77){la=ka;ka=ia;fa=fa+2|0;ga=ha;o=80}else if((o|0)==79){la=d[N+(ia&7^1)|0]|0;ka=ia;fa=ja;ga=ha;o=80}else if((o|0)==86){o=0;ka=e[K>>1]|0;la=ka+fa|0;b[K>>1]=la;ma=p;na=ba;ga=ha;oa=ja;pa=ca;qa=da;ea=la>>>16|ea&196|la>>>8&40|(ka^fa^la)>>>8&16;p=ma;ba=na;fa=oa;ca=pa;da=qa;continue a}else if((o|0)==203){o=0;ia=fa+2|0;pa=a[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0;qa=pa&255;ga=(a[43136+ka|0]&15)+ha|0;switch(ka|0){case 109:case 100:{ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 229:{fa=ia;o=71;break c};case 173:{ka=la&255;fa=ia;o=112;break c};case 190:{ka=(pa<<24>>24)+la|0;ka=d[(c[l+((ka>>>13&7)<<2)>>2]|0)+(ka&8191)|0]|0;fa=fa+3|0;o=84;break c};case 119:case 117:case 116:case 115:case 114:case 113:case 112:{fa=U+(ka^1)|0;o=227;break};case 54:{ia=fa+3|0;fa=(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0;o=227;break};case 125:case 93:case 85:case 77:case 69:{a[P+(ka>>>3^1)|0]=la;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 103:case 99:case 98:case 97:case 96:{qa=d[F+(ka^1)|0]|0;fa=ia;o=234;break};case 108:{qa=la>>>8;fa=ia;o=238;break};case 188:{ka=la>>>8;fa=ia;o=84;break c};case 132:case 148:{ea=ea&-2;o=207;break};case 180:{ka=la>>>8;fa=ia;o=108;break c};case 174:{ka=(pa<<24>>24)+la|0;ka=d[(c[l+((ka>>>13&7)<<2)>>2]|0)+(ka&8191)|0]|0;fa=fa+3|0;o=112;break c};case 189:{ka=la&255;fa=ia;o=84;break c};case 41:{fa=la;o=212;break};case 166:{ka=(pa<<24>>24)+la|0;ka=d[(c[l+((ka>>>13&7)<<2)>>2]|0)+(ka&8191)|0]|0;fa=fa+3|0;o=104;break c};case 124:case 92:case 84:case 76:case 68:{a[P+(ka>>>3^1)|0]=la>>>8;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 38:{fa=fa+3|0;o=234;break};case 33:{ha=(d[na+(oa+3)|0]|0)<<8|(d[na+(oa+2)|0]|0);fa=fa+4|0;break};case 203:{ha=(pa<<24>>24)+la|0;ia=ha&65535;ja=fa+3|0;ja=d[(c[l+(ja>>>13<<2)>>2]|0)+(ja&8191)|0]|0;fa=fa+4|0;switch(ja|0){case 6:{o=141;break c};case 22:{o=144;break c};case 38:{o=147;break c};case 46:{o=159;break c};case 14:{o=153;break c};case 54:{o=150;break c};case 62:{o=162;break c};case 30:{o=156;break c};case 126:case 118:case 110:case 102:case 94:case 86:case 78:case 70:{ma=(d[(c[l+(ia>>>13<<2)>>2]|0)+(ha&8191)|0]|0)&1<<(ja>>>3&7);na=p;oa=ba;pa=ca;qa=da;ea=ea&1|ma&128|(ma+32767|0)>>>8&68|16;p=na;ba=oa;ca=pa;da=qa;continue a};case 254:case 246:case 238:case 230:case 222:case 214:case 206:case 198:case 190:case 182:case 174:case 166:case 158:case 150:case 142:case 134:{ka=1<<(ja>>>3&7);ma=(d[(c[l+(ia>>>13<<2)>>2]|0)+(ha&8191)|0]|0|ka)^((ja&64|0)==0?ka:0);c[q>>2]=ga;bg(f,ia,ma);ma=p;na=ba;oa=ca;pa=da;qa=ea;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};default:{na=ba;oa=ca;pa=da;qa=ea;p=1;ba=na;ca=oa;da=pa;ea=qa;continue a}}};case 181:{ka=la&255;fa=ia;o=108;break c};case 249:{na=p;oa=ca;pa=da;qa=ea;fa=ia;ba=la;p=na;ca=oa;da=pa;ea=qa;continue a};case 52:{ka=(pa<<24>>24)+la|0;o=ka&65535;ka=(d[(c[l+(o>>>13<<2)>>2]|0)+(ka&8191)|0]|0)+1|0;c[q>>2]=ga;bg(f,o,ka);fa=fa+3|0;o=93;break c};case 142:case 158:{o=205;break};case 25:case 9:{fa=e[N+((ka>>>3)+ -1)>>1]|0;o=212;break};case 53:{ka=(pa<<24>>24)+la|0;o=ka&65535;ka=(d[(c[l+(o>>>13<<2)>>2]|0)+(ka&8191)|0]|0)+ -1|0;c[q>>2]=ga;bg(f,o,ka);fa=fa+3|0;o=96;break c};case 43:{ha=la+65535&65535;fa=ia;break};case 134:case 150:{ea=ea&-2;o=205;break};case 46:{fa=fa+3|0;o=238;break};case 35:{ha=la+1&65535;fa=ia;break};case 36:{fa=la+256&65535;ka=fa>>>8;o=253;break};case 141:case 157:{o=209;break};case 57:{fa=ba;o=212;break};case 164:{ka=la>>>8;fa=ia;o=104;break c};case 111:case 107:case 106:case 105:case 104:{qa=d[x+(ka^1)|0]|0;fa=ia;o=238;break};case 101:{qa=la&255;fa=ia;o=234;break};case 133:case 149:{ea=ea&-2;o=209;break};case 34:{pa=d[na+(oa+3)|0]|0;ma=pa<<8&7936|(d[na+(oa+2)|0]|0);na=c[l+(pa>>>5<<2)+36>>2]|0;a[na+(ma+1)|0]=la>>>8;a[na+ma|0]=la;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=fa+4|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 172:{ka=la>>>8;fa=ia;o=112;break c};case 126:case 110:case 102:case 94:case 86:case 78:case 70:{ma=(pa<<24>>24)+la|0;a[P+(ka>>>3^1)|0]=a[(c[l+((ma>>>13&7)<<2)>>2]|0)+(ma&8191)|0]|0;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=fa+3|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 165:{ka=la&255;fa=ia;o=104;break c};case 182:{ka=(pa<<24>>24)+la|0;ka=d[(c[l+((ka>>>13&7)<<2)>>2]|0)+(ka&8191)|0]|0;fa=fa+3|0;o=108;break c};case 42:{qa=d[na+(oa+3)|0]|0;ha=qa<<8&7936|(d[na+(oa+2)|0]|0);qa=c[l+(qa>>>5<<2)>>2]|0;ha=(d[qa+(ha+1)|0]|0)<<8|(d[qa+ha|0]|0);fa=fa+4|0;break};case 140:case 156:{o=207;break};case 37:{fa=la+65280&65535;ka=fa>>>8;o=256;break};case 233:{ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=la;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a};case 225:{ha=ba&8191;fa=c[l+(ba>>>13<<2)>>2]|0;ha=(d[fa+(ha+1)|0]|0)<<8|(d[fa+ha|0]|0);fa=ia;ba=ba+2&65535;break};case 44:{fa=la+1&255;ka=fa;fa=fa|la&65280;o=253;break};case 45:{fa=la+255&255;ka=fa;fa=fa|la&65280;o=256;break};case 227:{fa=ba&8191;qa=ba>>>13;ha=c[l+(qa<<2)>>2]|0;pa=fa+1|0;ha=(d[ha+pa|0]|0)<<8|(d[ha+fa|0]|0);qa=c[l+(qa<<2)+36>>2]|0;a[qa+pa|0]=la>>>8;a[qa+fa|0]=la;fa=ia;break};default:{na=ba;fa=ja;oa=ca;pa=da;qa=ea;p=1;ba=na;ca=oa;da=pa;ea=qa;continue a}}if((o|0)==205){la=(pa<<24>>24)+la|0;la=d[(c[l+((la>>>13&7)<<2)>>2]|0)+(la&8191)|0]|0;fa=fa+3|0;o=80;break}else if((o|0)==207){la=la>>>8;fa=ia;o=80;break}else if((o|0)==209){la=la&255;fa=ia;o=80;break}else if((o|0)==212){o=0;ha=fa+la|0;ea=ha>>>16|ea&196|ha>>>8&40|(fa^la^ha)>>>8&16;ha=ha&65535;fa=ia}else if((o|0)==227){o=0;ma=d[fa]|0;c[q>>2]=ga;bg(f,(pa<<24>>24)+la&65535,ma);ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=ia+1|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue a}else if((o|0)==234){o=0;ha=qa<<8|la&255}else if((o|0)==238){o=0;ha=qa|la&65280}else if((o|0)==253){o=ma<<24>>24==-35;da=o?fa:da;ca=o?ca:fa;fa=ia;o=93;break}else if((o|0)==256){o=ma<<24>>24==-35;da=o?fa:da;ca=o?ca:fa;fa=ia;o=96;break}ia=ma<<24>>24==-35;da=ia?ha:da;ca=ia?ca:ha;continue a}}while(0);if((o|0)==4){o=0;ma=p;na=ba;oa=ca;pa=da;qa=ea;fa=fa+3|0;p=ma;ba=na;ca=oa;da=pa;ea=qa;continue}else if((o|0)==71){o=0;na=ba+65534|0;ma=na&65535;na=na&8191;oa=c[l+(ma>>>13<<2)+36>>2]|0;a[oa+(na+1)|0]=la>>>8;a[oa+na|0]=la;na=p;oa=ca;pa=da;qa=ea;ba=ma;p=na;ca=oa;da=pa;ea=qa;continue}else if((o|0)==80){o=0;ea=(ea&1)+la|0;ha=d[aa]|0;ia=ka>>>3&2;na=ha+((ia|0)==0?ea:0-ea|0)|0;ea=ha^la^na;ea=a[f+(na&511)|0]&251|ia|ea&16|(ea+128|0)>>>6&4;a[aa]=na;na=p;oa=ba;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==84){o=0;ia=d[aa]|0;ea=ia-ka|0;ha=ia^ka;ea=ea>>>8&1|ka&40|ha&16^ea&144|((ea&255)<<24>>24==0?66:2)|((ea^ia)&ha)>>>5&4;continue}else if((o|0)==93){o=0;ea=(ka&15)+31&16|ea&1|a[f+(ka&255)|0]&251;ea=(ka|0)==128?ea|4:ea;continue}else if((o|0)==96){o=0;ea=((ka|0)==127?6:2)|ea&1|(ka&15)+1&16|a[f+(ka&255)|0]&249;continue}else if((o|0)==104){o=0;ea=(d[aa]|0)&ka;a[aa]=ea;na=p;oa=ba;pa=ca;qa=da;ea=d[f+ea|0]|0|16;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==108){o=0;ea=d[aa]|0|ka;a[aa]=ea;na=p;oa=ba;pa=ca;qa=da;ea=d[f+(ea&255)|0]|0;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==112){o=0;ea=(d[aa]|0)^ka;a[aa]=ea;na=p;oa=ba;pa=ca;qa=da;ea=d[f+(ea&255)|0]|0;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==141){o=0;na=d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0;ea=na>>>7;na=na<<1&254|ea;ea=d[f+na|0]|0|ea;c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==144){o=0;na=(d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0)<<1|ea&1;ma=d[f+na|0]|0;c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;ea=ma;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==147){o=0;na=(d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0)<<1;ea=d[f+na|0]|0;c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==150){o=0;na=(d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0)<<1|1;ea=d[f+na|0]|0;c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==153){o=0;ea=d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0;na=ea<<7&128|ea>>>1;ea=ea&1|(d[f+na|0]|0);c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==156){o=0;ma=d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0;na=ma>>>1|ea<<7&128;ma=d[f+na|0]|0|ma&1;c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;ea=ma;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==159){o=0;ea=d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0;na=ea&128|ea>>>1;ea=ea&1|(d[f+na|0]|0);c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue}else if((o|0)==162){o=0;ea=d[(c[l+(ia>>>13<<2)>>2]|0)+(ia&8191)|0]|0;na=ea>>>1;ea=ea&1|(d[f+na|0]|0);c[q>>2]=ga;bg(f,ia,na);na=p;oa=ba;pa=ca;qa=da;p=na;ba=oa;ca=pa;da=qa;continue}}if((o|0)==170){za(43120,42792,1059,43128)}else if((o|0)==261){za(43120,42792,1686,43128)}else if((o|0)==262){qa=ha+ -11|0;c[q>>2]=qa;qa=ea&255;a[r]=qa;qa=da&65535;b[s>>1]=qa;s=ca&65535;b[t>>1]=s;s=ba&65535;b[u>>1]=s;s=fa&65535;b[v>>1]=s;s=h;qa=s;qa=c[qa>>2]|0;s=s+4|0;s=c[s>>2]|0;r=w;q=r;a[q]=qa;a[q+1|0]=qa>>8;a[q+2|0]=qa>>16;a[q+3|0]=qa>>24;r=r+4|0;a[r]=s;a[r+1|0]=s>>8;a[r+2|0]=s>>16;a[r+3|0]=s>>24;r=g+0|0;s=m+0|0;q=r+80|0;do{c[r>>2]=c[s>>2];r=r+4|0;s=s+4|0}while((r|0)<(q|0));c[k>>2]=n;i=j;return p|0}else if((o|0)==263){qa=ha&3;c[q>>2]=qa;qa=ea&255;a[r]=qa;qa=da&65535;b[s>>1]=qa;s=ca&65535;b[t>>1]=s;s=ba&65535;b[u>>1]=s;s=fa&65535;b[v>>1]=s;s=h;qa=s;qa=c[qa>>2]|0;s=s+4|0;s=c[s>>2]|0;r=w;q=r;a[q]=qa;a[q+1|0]=qa>>8;a[q+2|0]=qa>>16;a[q+3|0]=qa>>24;r=r+4|0;a[r]=s;a[r+1|0]=s>>8;a[r+2|0]=s>>16;a[r+3|0]=s>>24;r=g+0|0;s=m+0|0;q=r+80|0;do{c[r>>2]=c[s>>2];r=r+4|0;s=s+4|0}while((r|0)<(q|0));c[k>>2]=n;i=j;return p|0}else if((o|0)==264){c[q>>2]=ga;qa=ea&255;a[r]=qa;qa=da&65535;b[s>>1]=qa;s=ca&65535;b[t>>1]=s;s=ba&65535;b[u>>1]=s;s=fa&65535;b[v>>1]=s;s=h;qa=s;qa=c[qa>>2]|0;s=s+4|0;s=c[s>>2]|0;r=w;q=r;a[q]=qa;a[q+1|0]=qa>>8;a[q+2|0]=qa>>16;a[q+3|0]=qa>>24;r=r+4|0;a[r]=s;a[r+1|0]=s>>8;a[r+2|0]=s>>16;a[r+3|0]=s>>24;r=g+0|0;s=m+0|0;q=r+80|0;do{c[r>>2]=c[s>>2];r=r+4|0;s=s+4|0}while((r|0)<(q|0));c[k>>2]=n;i=j;return p|0}return 0}function Tf(a){a=a|0;var b=0;b=i;Uf(a);Al(a);i=b;return}function Uf(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=43400;d=a+68920|0;e=c[d>>2]|0;if((e|0)!=0){Yi(e);Fl(e)}c[d>>2]=0;Bg(a);Al(c[a+968>>2]|0);Ic(a);i=b;return}function Vf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+68920|0;e=c[d>>2]|0;if((e|0)!=0){Yi(e);Fl(e)}c[d>>2]=0;Bg(a);i=b;return}function Wf(a,b,c){a=a|0;b=b|0;c=c|0;c=i;a=d[a+1007|0]|0;if((a&2|0)==0){a=44176}else{a=(a&4|0)!=0?44328:44304}Ne(b+16|0,a);i=c;return 0}function Xf(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;h=b+992|0;g=h+0|0;j=g+32|0;do{a[g]=0;g=g+1|0}while((g|0)<(j|0));g=b+968|0;e=Qc(g,e,16,h,0,8200)|0;if((e|0)!=0){j=e;i=f;return j|0}do{if((Jl(h,44160,4)|0)!=0){j=(Jl(h,44168,4)|0)==0;h=j?0:c[10038]|0;if((h|0)==0){break}i=f;return h|0}}while(0);do{if((a[b+995|0]|0)==67){g=b+1006|0;if((a[g]|0)!=0){a[g]=0;c[b+16>>2]=43672}h=b+1007|0;g=d[h]|0;if((g&240|0)==0){break}a[h]=g&15;c[b+16>>2]=43672}else{e=a[b+1006|0]|0;h=e&255;Nl(b+1008|0,(c[g>>2]|0)+8200|0,(h>>>0>16?16:h)|0)|0;if(!((e&255)>16)){break}c[b+16>>2]=43672}}while(0);g=a[b+1007|0]|0;if(!((g&9)==0)){c[b+16>>2]=43696}c[b+1028>>2]=(g&4)==0?49152:0;do{if(!((g&2)==0)){g=b+68920|0;if((c[g>>2]|0)!=0){break}j=El(1600)|0;e=j;Vi(e);c[g>>2]=e;if((j|0)==0){h=43720}else{break}i=f;return h|0}}while(0);c[b+232>>2]=8;j=Nc(b,3579545)|0;i=f;return j|0}function Yf(a,b){a=a|0;b=b|0;var d=0;d=i;Ec(a+67312|0,b);Ec(a+68360|0,b);a=c[a+68920>>2]|0;if((a|0)==0){i=d;return}Zi(a,b);i=d;return}function Zf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;h=b+ -3|0;do{if((h|0)>-1){if(h>>>0<5){c[a+(h<<4)+68140>>2]=d;break}else{za(44128,43968,66,44112)}}else{if(b>>>0<3){c[a+(b<<4)+66852>>2]=d;break}else{za(44080,44048,86,44112)}}}while(0);a=c[a+68920>>2]|0;if(!((a|0)!=0&(b|0)<4)){i=g;return}_i(a,b,d,e,f);i=g;return}function _f(b,d){b=b|0;d=+d;c[b+1036>>2]=~~(((a[b+1007|0]&64)!=0?71590.0:59659.0)/d);i=i;return}function $f(e,f){e=e|0;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0;g=i;j=Oc(e,f)|0;if((j|0)!=0){p=j;i=g;return p|0}j=e+1048|0;Pl(j|0,-55,16384)|0;Pl(e+17432|0,0,49408)|0;k=e+1049|0;m=43736|0;l=k+13|0;do{a[k]=a[m]|0;k=k+1|0;m=m+1|0}while((k|0)<(l|0));n=e+1195|0;a[n+0|0]=a[43752|0]|0;a[n+1|0]=a[43753|0]|0;a[n+2|0]=a[43754|0]|0;a[n+3|0]=a[43755|0]|0;a[n+4|0]=a[43756|0]|0;a[n+5|0]=a[43757|0]|0;n=(d[e+997|0]|0)<<8|(d[e+996|0]|0);l=(d[e+999|0]|0)<<8|(d[e+998|0]|0);m=e+968|0;k=e+976|0;o=c[k>>2]|0;o=(l|0)<(o|0)?l:o;p=65536-n|0;o=(o|0)<(p|0)?o:p;if((o|0)!=(l|0)){c[e+16>>2]=43760}p=e+1006|0;Nl(e+n+1048|0,(c[m>>2]|0)+((d[p]|0)+8200)|0,o|0)|0;Rc(m,0-((d[p]|0)+o)|0,8192);p=d[e+1005|0]|0;l=16384>>>(p>>>7);l=((c[k>>2]|0)+~o+l|0)/(l|0)|0;p=p&127;k=e+1032|0;c[k>>2]=p;if((p|0)>(l|0)){c[k>>2]=l;c[e+16>>2]=43784}a[e+66583|0]=-1;k=e+336|0;Qf(k,e+69180|0,e+68924|0);Rf(k,0,65536,j,j);Pb(e+66840|0);j=e+68208|0;k=e+68128|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;k=e+68144|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;k=e+68160|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;k=e+68176|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;k=e+68192|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;Pl(j|0,0,148)|0;j=e+68920|0;k=c[j>>2]|0;if((k|0)!=0){Xi(k,0,0)}a[e+63383|0]=-1;b[e+938>>1]=-3202;a[e+63382|0]=-1;a[e+950|0]=f;b[e+936>>1]=(d[e+1001|0]|0)<<8|(d[e+1e3|0]|0);c[e+1040>>2]=c[e+1036>>2];a[e+1024|0]=0;a[e+1025|0]=0;q=+h[e+248>>3]*1.4;Fc(e+67312|0,q*.000915032679738562);Fc(e+68360|0,q*262451171875.0e-17);f=c[j>>2]|0;if((f|0)!=0){Wi(f,q)}c[e+1044>>2]=0;p=0;i=g;return p|0}function ag(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;g=16384>>>((d[a+1005|0]|0)>>>7);b=(b|0)!=0&(g|0)==8192?40960:32768;e=e-(d[a+1004|0]|0)|0;if(!(e>>>0<(c[a+1032>>2]|0)>>>0)){p=a+b+1048|0;Rf(a+336|0,b,g,p,p);i=f;return}j=_(e,g)|0;if((g|0)==0){i=f;return}l=a+984|0;m=a+980|0;h=a+972|0;e=a+69180|0;k=a+336|0;a=a+968|0;o=0;while(1){p=(c[l>>2]&o+j)-(c[m>>2]|0)|0;n=c[h>>2]|0;p=p>>>0>(n+ -8200|0)>>>0?0:p;if(n>>>0<p>>>0){g=6;break}Rf(k,o+b|0,8192,e,(c[a>>2]|0)+p|0);o=o+8192|0;if(!(o>>>0<g>>>0)){g=8;break}}if((g|0)==6){za(43880,43896,58,43936)}else if((g|0)==8){i=f;return}}function bg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;g=e&255;a[(c[(c[b+516>>2]|0)+(d>>>13<<2)+36>>2]|0)+(d&8191)|0]=g;if((c[b+692>>2]&d|0)!=32768){i=f;return}h=b+ -336|0;e=e&255;if((d|0)==45056){ag(h,1,e);i=f;return}else if((d|0)==36864){ag(h,0,e);i=f;return}else{d=d&57343^38912;if(!(d>>>0<144)){i=f;return}a[b+688|0]=1;e=c[b+516>>2]|0;lg(b+67792|0,(c[e+72>>2]|0)+(c[e+76>>2]|0)|0);a[h+d+68212|0]=g;i=f;return}}function cg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;h=f&255;a:do{switch(e&255|0){case 254:{ag(b+ -336|0,0,h);break};case 160:{c[b+708>>2]=f&15;break};case 6:{f=c[b+68584>>2]|0;if((f|0)==0){break a}if((a[b+671|0]&4)==0){break a}cj(f,d,h);break};case 127:case 126:{b=c[b+68584>>2]|0;if((b|0)==0){break a}dj(b,d,h);break};case 161:{f=b+66504|0;e=c[b+708>>2]|0;Rb(f,d);Qb(f,e,h);break};default:{}}}while(0);i=g;return}function dg(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return 0}function eg(e,f,g){e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0;g=i;j=e+852|0;x=c[j>>2]|0;y=c[x+76>>2]|0;A=(c[x+72>>2]|0)+y|0;z=c[f>>2]|0;if((A|0)<(z|0)){l=e+336|0;k=e+1040|0;q=e+936|0;m=e+1036|0;v=e+1025|0;w=e+1024|0;r=e+248|0;s=e+67312|0;t=e+68360|0;u=e+68920|0;n=e+938|0;p=e+1002|0;o=e+1003|0;do{x=c[k>>2]|0;y=(z|0)<(x|0)?z:x;Sf(l,y)|0;z=(b[q>>1]|0)==-1;x=c[j>>2]|0;if(z){A=c[x+72>>2]|0;y=y-A|0;c[x+76>>2]=y}else{A=c[x+72>>2]|0;y=c[x+76>>2]|0}B=c[k>>2]|0;do{if((A+y|0)<(B|0)){z=A}else{c[k>>2]=(c[m>>2]|0)+B;if(!z){z=A;break}do{if((a[v]|0)==0){a[v]=1;if((a[w]|0)==0){break}C=+h[r>>3]*1.4*1.5;Fc(s,C*.000915032679738562);Fc(t,C*262451171875.0e-17);x=c[u>>2]|0;if((x|0)==0){break}Wi(x,C)}}while(0);x=(b[n>>1]|0)+ -1<<16>>16;b[n>>1]=x;a[e+(x&65535)+1048|0]=-1;x=(b[n>>1]|0)+ -1<<16>>16;b[n>>1]=x;a[e+(x&65535)+1048|0]=-1;b[q>>1]=d[o]<<8|d[p];x=c[j>>2]|0;z=c[x+72>>2]|0;y=c[x+76>>2]|0}}while(0);A=z+y|0;z=c[f>>2]|0;}while((A|0)<(z|0))}else{k=e+1040|0}c[f>>2]=A;c[k>>2]=(c[k>>2]|0)-A;j=c[f>>2]|0;c[x+76>>2]=y-j;k=e+66888|0;l=c[k>>2]|0;if((l|0)<(j|0)){Rb(e+66840|0,j);l=c[k>>2]|0}if((l|0)<(j|0)){za(44024,44048,102,44008)}c[k>>2]=l-j;j=c[f>>2]|0;k=e+68208|0;l=c[k>>2]|0;if((l|0)<(j|0)){lg(e+68128|0,j);l=c[k>>2]|0}B=l-j|0;c[k>>2]=B;if(!((B|0)>-1)){za(43952,43968,82,44008)}e=c[e+68920>>2]|0;if((e|0)==0){i=g;return 0}bj(e,c[f>>2]|0);i=g;return 0}function fg(){var a=0,b=0;a=i;b=zl(77376)|0;if((b|0)==0){b=0;i=a;return b|0}Pf(b+336|0);Gc(b);c[b>>2]=43400;c[b+968>>2]=0;c[b+972>>2]=0;Ob(b+66840|0);Cc(b+68360|0,b+68400|0,8);c[b+68140>>2]=0;c[b+68156>>2]=0;c[b+68172>>2]=0;c[b+68188>>2]=0;c[b+68204>>2]=0;c[b+68920>>2]=0;c[b+4>>2]=43648;c[b+284>>2]=6;c[b+228>>2]=43496;c[b+332>>2]=43616;Pl(b+68924|0,-1,256)|0;i=a;return b|0}function gg(){var a=0,b=0,d=0;a=i;b=zl(336)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=44200;c[b+4>>2]=43648;b=d;i=a;return b|0}function hg(a){a=a|0;var b=0;b=i;Eg(a);i=b;return}function ig(a){a=a|0;var b=0;b=i;Eg(a);Al(a);i=b;return}function jg(a,b){a=a|0;b=b|0;var d=0;d=i;a=a+316|0;b=eb[c[(c[b>>2]|0)+12>>2]&63](b,a,16)|0;if((b|0)!=0){a=(b|0)==37536?c[10038]|0:b;i=d;return a|0}if((Jl(a,44160,4)|0)==0){a=0;i=d;return a|0}a=(Jl(a,44168,4)|0)==0;a=a?0:c[10038]|0;i=d;return a|0}function kg(a,b,c){a=a|0;b=b|0;c=c|0;c=i;a=d[a+331|0]|0;if((a&2|0)==0){a=44176}else{a=(a&4|0)!=0?44328:44304}Ne(b+16|0,a);i=c;return 0}function lg(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;h=b+227|0;k=b+80|0;g=b+232|0;f=0;do{l=c[b+(f<<4)+12>>2]|0;if((l|0)!=0){c[l+40>>2]=1;s=f<<1;s=d[b+(s+129)+84|0]<<8&3840|d[b+(s+128)+84|0];m=s+1|0;do{if((d[h]&1<<f|0)==0){n=0}else{if(!(m>>>0>((c[l+28>>2]|0)+524288|0)>>>18>>>0)){n=0;break}n=d[b+(f+138)+84|0]<<3&120}}while(0);o=f<<5;p=(f|0)==4?o+ -32|0:o;q=b+(f<<4)+4|0;r=_(a[b+((c[q>>2]|0)+p)+84|0]|0,n)|0;o=b+(f<<4)+8|0;t=c[o>>2]|0;if((r|0)!=(t|0)){c[o>>2]=r;y=_(c[l>>2]|0,c[k>>2]|0)|0;Zd(g,y+(c[l+4>>2]|0)|0,r-t|0,l)}r=b+(f<<4)|0;x=(c[r>>2]|0)+(c[k>>2]|0)|0;do{if((x|0)<(e|0)){if((n|0)==0){y=(s+e-x|0)/(m|0)|0;c[q>>2]=(c[q>>2]|0)+y&31;x=(_(y,m)|0)+x|0;break}w=c[q>>2]|0;s=l;t=l+4|0;u=a[b+(w+p)+84|0]|0;do{w=w+1&31;v=b+(w|p)+84|0;y=a[v]|0;if((y|0)!=(u|0)){u=_(y-u|0,n)|0;z=_(c[s>>2]|0,x)|0;Zd(g,z+(c[t>>2]|0)|0,u,l);u=y}x=x+m|0;}while((x|0)<(e|0));c[q>>2]=w;c[o>>2]=_(a[v]|0,n)|0}}while(0);c[r>>2]=x-e}f=f+1|0;}while((f|0)!=5);c[k>>2]=e;i=j;return}function mg(a,b){a=a|0;b=b|0;c[a>>2]=44352;c[a+16>>2]=b;c[a+12>>2]=0;c[a+8>>2]=0;c[a+4>>2]=1;i=i;return}function ng(a,b){a=a|0;b=b|0;i=i;return 0}function og(a){a=a|0;var b=0,d=0,e=0,f=0;d=i;c[a+16>>2]=2;c[a+12>>2]=0;c[a+8>>2]=0;c[a+4>>2]=1;c[a>>2]=44408;b=a+20|0;e=a+152|0;f=b;do{sc(f);f=f+44|0;}while((f|0)!=(e|0));c[a+152>>2]=b;c[a+156>>2]=a+64;c[a+160>>2]=a+108;i=d;return}function pg(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=44408;d=a+20|0;e=a+152|0;do{e=e+ -44|0;tc(e);}while((e|0)!=(d|0));Al(a);i=b;return}function qg(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=44408;d=a+20|0;a=a+152|0;do{a=a+ -44|0;tc(a);}while((a|0)!=(d|0));i=b;return}function rg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;g=0;do{h=vc(a+(g*44|0)+20|0,b,d)|0;g=g+1|0;if((h|0)!=0){f=5;break}}while((g|0)<3);if((f|0)==5){i=e;return h|0}h=c[a+56>>2]|0;c[a+8>>2]=c[a+44>>2];c[a+12>>2]=h;h=0;i=e;return h|0}function sg(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=a+20|0;c[a+48>>2]=b;c[e>>2]=xc(e,b)|0;e=a+64|0;c[a+92>>2]=b;c[e>>2]=xc(e,b)|0;e=a+108|0;c[a+136>>2]=b;c[e>>2]=xc(e,b)|0;i=d;return}function tg(a,b){a=a|0;b=b|0;var c=0;c=i;wc(a+20|0,b);wc(a+64|0,b);wc(a+108|0,b);i=c;return}function ug(a){a=a|0;var b=0;b=i;c[a+164>>2]=0;c[a+168>>2]=0;uc(a+20|0,1);uc(a+64|0,1);uc(a+108|0,1);i=b;return}function vg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=a+164|0;g=a+60|0;f=c[g>>2]|0;c[g>>2]=0;c[e>>2]=f;yc(a+20|0,b);f=a+104|0;g=c[f>>2]|0;c[f>>2]=0;c[e>>2]=c[e>>2]|g<<1;yc(a+64|0,b);g=a+148|0;f=c[g>>2]|0;c[g>>2]=0;c[e>>2]=c[e>>2]|f<<2;yc(a+108|0,b);i=d;return}function wg(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;f=i;if((e&1|0)!=0){za(44456,44472,108,44512)}h=e>>>1;e=a+20|0;g=a+24|0;j=(c[g>>2]|0)>>>16;h=h>>>0>j>>>0?j:h;if((h|0)==0){x=h<<1;i=f;return x|0}j=a+164|0;k=a+168|0;o=c[k>>2]|c[j>>2];do{if((o|0)<2){l=c[a+40>>2]|0;m=a+36|0;o=h;p=c[m>>2]|0;n=c[a+28>>2]|0;while(1){q=p>>14;if((q<<16>>16|0)!=(q|0)){q=32767-(p>>31)|0}p=(c[n>>2]|0)+(p-(p>>l))|0;x=q&65535;b[d>>1]=x;b[d+2>>1]=x;o=o+ -1|0;if((o|0)==0){break}else{n=n+4|0;d=d+4|0}}c[m>>2]=p;Bc(e,h);zc(a+64|0,h);zc(a+108|0,h)}else{l=c[a+84>>2]|0;n=a+80|0;u=c[n>>2]|0;m=a+124|0;s=c[m>>2]|0;if((o&1|0)==0){o=h;p=c[a+72>>2]|0;q=c[a+116>>2]|0;while(1){r=u>>14;if((r<<16>>16|0)!=(r|0)){r=32767-(u>>31)|0}t=s>>14;if((t<<16>>16|0)!=(t|0)){t=32767-(s>>31)|0}u=(c[p>>2]|0)+(u-(u>>l))|0;s=(c[q>>2]|0)+(s-(s>>l))|0;b[d>>1]=r;b[d+2>>1]=t;o=o+ -1|0;if((o|0)==0){break}else{p=p+4|0;d=d+4|0;q=q+4|0}}c[m>>2]=s;c[n>>2]=u;zc(e,h);Bc(a+64|0,h);Bc(a+108|0,h);break}else{o=a+36|0;r=h;t=c[o>>2]|0;p=c[a+28>>2]|0;q=c[a+72>>2]|0;v=s;s=c[a+116>>2]|0;while(1){x=t>>14;w=(u>>14)+x|0;x=(v>>14)+x|0;if((w<<16>>16|0)!=(w|0)){w=32767-(w>>24)|0}t=(c[p>>2]|0)+(t-(t>>l))|0;if((x<<16>>16|0)!=(x|0)){x=32767-(x>>24)|0}u=(c[q>>2]|0)+(u-(u>>l))|0;v=(c[s>>2]|0)+(v-(v>>l))|0;b[d>>1]=w;b[d+2>>1]=x;r=r+ -1|0;if((r|0)==0){break}else{p=p+4|0;q=q+4|0;d=d+4|0;s=s+4|0}}c[o>>2]=t;c[m>>2]=v;c[n>>2]=u;Bc(e,h);Bc(a+64|0,h);Bc(a+108|0,h);break}}}while(0);if(!((c[g>>2]|0)>>>0<65536)){x=h<<1;i=f;return x|0}c[k>>2]=c[j>>2];c[j>>2]=0;x=h<<1;i=f;return x|0}function xg(a){a=a|0;i=i;return}function yg(a){a=a|0;var b=0;b=i;Al(a);i=b;return}function zg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;d=a;a=b+152|0;c[d+0>>2]=c[a+0>>2];c[d+4>>2]=c[a+4>>2];c[d+8>>2]=c[a+8>>2];i=e;return}function Ag(a){a=a|0;i=i;return(c[a+24>>2]|0)>>>16<<1|0}function Bg(b){b=b|0;var d=0;d=i;c[b+232>>2]=0;c[b+260>>2]=-1;c[b+264>>2]=0;c[b+268>>2]=0;a[b+272|0]=1;a[b+273|0]=1;c[b+276>>2]=1073741824;c[b+280>>2]=1;c[b+292>>2]=0;c[b+296>>2]=0;c[b+300>>2]=0;c[b+16>>2]=0;De(b);i=d;return}function Cg(b){b=b|0;var d=0,e=0;d=i;e=b;Ee(e);c[b>>2]=44592;c[b+304>>2]=0;c[b+308>>2]=0;c[b+312>>2]=0;c[b+256>>2]=0;c[b+236>>2]=0;h[b+240>>3]=1.0;h[b+248>>3]=1.0;c[b+224>>2]=2;c[b+284>>2]=3;a[b+288|0]=0;h[b+144>>3]=-1.0;h[b+152>>3]=60.0;c[b+228>>2]=44664;c[b+232>>2]=0;c[b+260>>2]=-1;c[b+264>>2]=0;c[b+268>>2]=0;a[b+272|0]=1;a[b+273|0]=1;c[b+276>>2]=1073741824;c[b+280>>2]=1;c[b+292>>2]=0;c[b+296>>2]=0;c[b+300>>2]=0;c[b+16>>2]=0;De(e);i=d;return}function Dg(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=44592;d=c[a+312>>2]|0;if((d|0)!=0){ib[c[(c[d>>2]|0)+4>>2]&127](d)}Al(c[a+304>>2]|0);Ge(a);Al(a);i=b;return}function Eg(a){a=a|0;var b=0,d=0;b=i;c[a>>2]=44592;d=c[a+312>>2]|0;if((d|0)!=0){ib[c[(c[d>>2]|0)+4>>2]&127](d)}Al(c[a+304>>2]|0);Ge(a);i=b;return}function Fg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=a+256|0;if((c[e>>2]|0)!=0){za(44760,44776,80,44816)}f=ob[c[(c[a>>2]|0)+40>>2]&63](a,b)|0;if((f|0)!=0){g=f;i=d;return g|0}g=a+304|0;f=Bl(c[g>>2]|0,4096)|0;if((f|0)==0){g=45104;i=d;return g|0}c[g>>2]=f;c[a+308>>2]=2048;c[e>>2]=b;g=0;i=d;return g|0}function Gg(a){a=a|0;var b=0;b=i;if((c[a+256>>2]|0)==0){za(44832,44776,89,44848)}else{Je(a);i=b;return}}function Hg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;e=i;g=a+144|0;f=b+0|0;d=g+80|0;do{c[g>>2]=c[f>>2];g=g+4|0;f=f+4|0}while((g|0)<(d|0));jb[c[(c[a>>2]|0)+44>>2]&31](a,b);i=e;return}function Ig(a,b){a=a|0;b=b|0;var d=0;d=i;if((c[a+256>>2]|0)==0){za(44832,44776,111,44864)}else{c[a+236>>2]=b;jb[c[(c[a>>2]|0)+52>>2]&31](a,b);i=d;return}}function Jg(a,b){a=a|0;b=+b;var d=0;d=i;if((c[a+256>>2]|0)==0){za(44832,44776,118,44880)}else{b=b<.02?.02:b;b=b>4.0?4.0:b;h[a+240>>3]=b;fb[c[(c[a>>2]|0)+56>>2]&15](a,b);i=d;return}}function Kg(a){a=a|0;var b=0,d=0,e=0,f=0.0,g=0;b=i;e=a+240|0;f=+h[e>>3];d=a+256|0;if((c[d>>2]|0)==0){za(44832,44776,118,44880)}f=f<.02?.02:f;f=f>4.0?4.0:f;h[e>>3]=f;fb[c[(c[a>>2]|0)+56>>2]&15](a,f);g=a+236|0;e=c[g>>2]|0;if((c[d>>2]|0)==0){za(44832,44776,111,44864)}else{c[g>>2]=e;jb[c[(c[a>>2]|0)+52>>2]&31](a,e);i=b;return}}function Lg(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;m=i;i=i+8|0;r=m;q=b+260|0;c[q>>2]=-1;j=b+264|0;c[j>>2]=0;h=b+268|0;c[h>>2]=0;p=b+272|0;a[p]=1;g=b+273|0;a[g]=1;c[b+276>>2]=1073741824;c[b+280>>2]=1;k=b+292|0;c[k>>2]=0;l=b+296|0;c[l>>2]=0;o=b+300|0;c[o>>2]=0;n=b+16|0;c[n>>2]=0;c[r>>2]=e;s=Oe(b,r)|0;if((s|0)!=0){e=s;i=m;return e|0}c[q>>2]=e;q=ob[c[(c[b>>2]|0)+60>>2]&63](b,c[r>>2]|0)|0;if((q|0)!=0){e=q;i=m;return e|0}a[p]=0;a[g]=0;if((a[b+288|0]|0)==0){q=_(c[b+224>>2]<<1,c[b+256>>2]|0)|0;do{if((c[h>>2]|0)>=(q|0)){f=6;break}Mg(b);r=c[o>>2]|0;}while((d[p]|r|0)==0);if((f|0)==6){r=c[o>>2]|0}c[h>>2]=r;c[j>>2]=0;c[k>>2]=0;c[l>>2]=0}if((a[g]|0)==0){e=0;i=m;return e|0}e=c[n>>2]|0;c[n>>2]=0;i=m;return e|0}function Mg(d){d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;g=i;e=d+300|0;if((c[e>>2]|0)!=0){za(44920,44776,324,44936)}h=d+272|0;do{if((a[h]|0)==0){j=d+304|0;k=c[j>>2]|0;f=d+268|0;c[f>>2]=(c[f>>2]|0)+2048;do{if((c[d+260>>2]|0)>-1){k=eb[c[(c[d>>2]|0)+64>>2]&63](d,2048,k)|0;if((k|0)==0){break}a[h]=1;c[d+16>>2]=k}else{Pl(k|0,0,4096)|0}}while(0);j=c[j>>2]|0;h=b[j>>1]|0;b[j>>1]=16;k=j+4096|0;do{k=k+ -2|0;}while(((b[k>>1]|0)+8|0)>>>0<17);b[j>>1]=h;h=k-j|0;if((h|0)<=0){break}c[d+292>>2]=(h>>1)+ -2048+(c[f>>2]|0);c[e>>2]=2048;i=g;return}}while(0);k=d+296|0;c[k>>2]=(c[k>>2]|0)+2048;i=g;return}function Ng(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;do{if((d|0)>3e4){j=b+236|0;k=c[j>>2]|0;h=b+256|0;if((c[h>>2]|0)==0){za(44832,44776,111,44864)}c[j>>2]=-1;g=b;jb[c[(c[g>>2]|0)+52>>2]&31](b,-1);a:do{if((d|0)>15e3){n=b+272|0;m=b;l=b+304|0;while(1){if((a[n]|0)!=0){break a}o=eb[c[(c[m>>2]|0)+64>>2]&63](b,2048,c[l>>2]|0)|0;d=d+ -2048|0;if((o|0)!=0){break}if((d|0)<=15e3){break a}}i=e;return o|0}}while(0);if((c[h>>2]|0)==0){za(44832,44776,111,44864)}else{c[j>>2]=k;jb[c[(c[g>>2]|0)+52>>2]&31](b,k);f=d;break}}else{f=d}}while(0);j=b+272|0;h=b;g=b+304|0;while(1){if((f|0)==0){o=0;b=16;break}if((a[j]|0)!=0){o=0;b=16;break}k=(f|0)<2048?f:2048;o=eb[c[(c[h>>2]|0)+64>>2]&63](b,k,c[g>>2]|0)|0;if((o|0)==0){f=f-k|0}else{b=16;break}}if((b|0)==16){i=e;return o|0}return 0}function Og(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;k=e+273|0;if((a[k]|0)!=0){Pl(g|0,0,f<<1|0)|0;s=e+264|0;r=c[s>>2]|0;r=r+f|0;c[s>>2]=r;i=h;return 0}n=e+260|0;if(!((c[n>>2]|0)>-1)){za(44896,44776,347,44952)}if((f&1|0)!=0){za(44960,44776,348,44952)}l=e+268|0;r=c[l>>2]|0;j=e+264|0;q=c[j>>2]|0;if((r|0)<(q|0)){za(44984,44776,350,44952)}p=e+296|0;do{if((c[p>>2]|0)==0){q=e+300|0;r=0}else{o=e+292|0;s=c[o>>2]|0;s=(_(q+f-s|0,c[e+284>>2]|0)|0)+s|0;q=e+300|0;a:do{if((r|0)<(s|0)){r=e+272|0;do{if((d[r]|c[q>>2]|0)!=0){break a}Mg(e);}while((c[l>>2]|0)<(s|0))}}while(0);r=c[p>>2]|0;r=(r|0)<(f|0)?r:f;Pl(g|0,0,r<<1|0)|0;c[p>>2]=(c[p>>2]|0)-r;if(((c[l>>2]|0)-(c[o>>2]|0)|0)<=((c[e+256>>2]|0)*12|0)){break}a[e+272|0]=1;a[k]=1;c[p>>2]=0;c[q>>2]=0}}while(0);p=c[q>>2]|0;if((p|0)!=0){o=f-r|0;s=(p|0)<(o|0)?p:o;Nl(g+(r<<1)|0,(c[e+304>>2]|0)+(2048-p<<1)|0,s<<1|0)|0;c[q>>2]=(c[q>>2]|0)-s;r=s+r|0}o=f-r|0;do{if((r|0)!=(f|0)){p=g+(r<<1)|0;c[l>>2]=(c[l>>2]|0)+o;q=e+272|0;do{if((c[n>>2]|0)>-1){if((a[q]|0)!=0){m=24;break}n=eb[c[(c[e>>2]|0)+64>>2]&63](e,o,p)|0;if((n|0)==0){break}a[q]=1;c[e+16>>2]=n}else{m=24}}while(0);if((m|0)==24){Pl(p|0,0,o<<1|0)|0}a[k]=a[k]|a[q];if((a[e+288|0]|0)!=0){if((c[j>>2]|0)<=(c[e+276>>2]|0)){break}}n=b[p>>1]|0;b[p>>1]=16;m=g+(f<<1)|0;do{m=m+ -2|0;}while(((b[m>>1]|0)+8|0)>>>0<17);b[p>>1]=n;m=m-p|0;if((m|0)>0){s=e+292|0;c[s>>2]=(m>>1)-o+(c[l>>2]|0);m=s}else{m=e+292|0}if(((c[l>>2]|0)-(c[m>>2]|0)|0)<=2047){break}Mg(e)}}while(0);n=c[j>>2]|0;m=c[e+276>>2]|0;if(!((n|0)>(m|0)&(f|0)>0)){s=j;r=c[s>>2]|0;r=r+f|0;c[s>>2]=r;i=h;return 0}l=c[e+280>>2]|0;e=e+272|0;m=n-m|0;o=0;do{s=(m+o|0)/512|0;n=(s|0)/(l|0)|0;s=(s-(_(n,l)|0)<<14|0)/(l|0)|0;n=16384-s+(s>>1)>>n;if((n|0)<64){a[e]=1;a[k]=1}p=f-o|0;q=(p|0)>512?512:p;if((q|0)!=0){p=g+(o<<1)|0;while(1){b[p>>1]=(_(b[p>>1]|0,n)|0)>>>14;q=q+ -1|0;if((q|0)==0){break}else{p=p+2|0}}}o=o+512|0;}while((o|0)<(f|0));s=c[j>>2]|0;s=s+f|0;c[j>>2]=s;i=h;return 0}function Pg(a,b){a=a|0;b=b|0;i=i;return 0}function Qg(a){a=a|0;var b=0;b=i;Je(a);i=b;return}function Rg(a){a=a|0;i=i;return}function Sg(a,b){a=a|0;b=b|0;i=i;return}function Tg(a,b){a=a|0;b=b|0;i=i;return}function Ug(a,b){a=a|0;b=b|0;i=i;return}function Vg(a,b){a=a|0;b=+b;i=i;return}function Wg(a,b){a=a|0;b=b|0;i=i;return 45008}function Xg(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return 45008}function Yg(b){b=b|0;var d=0,e=0,f=0,g=0,j=0;g=i;j=b+1992|0;c[b+60>>2]=j;c[b+104>>2]=j;e=b+152|0;Cc(e,b+192|0,8);d=b+744|0;Cc(d,b+784|0,8);f=b+1376|0;Cc(f,b+1416|0,8);Cc(j,b+2032|0,12);h[b+1936>>3]=1.0;c[b+1372>>2]=b;c[b+1364>>2]=0;c[b+1984>>2]=0;c[b>>2]=b+20;c[b+4>>2]=b+64;c[b+8>>2]=b+712;c[b+12>>2]=b+112;c[b+16>>2]=b+1304;j=0;while(1){if(!(j>>>0<5)){j=3;break}c[(c[b+(j<<2)>>2]|0)+8>>2]=0;j=j+1|0;if((j|0)>=5){j=5;break}}if((j|0)==3){za(45344,45376,143,45416)}else if((j|0)==5){a[b+1363|0]=0;Fc(b+1992|0,.00752);Fc(d,.00851);Fc(e,.00494);Fc(f,.00335);_g(b,0,0);i=g;return}}function Zg(b,c){b=b|0;c=+c;var d=0;d=i;a[b+1363|0]=0;Fc(b+1992|0,c*.00752);Fc(b+744|0,c*.00851);Fc(b+152|0,c*.00494);Fc(b+1376|0,c*.00335);i=d;return}function _g(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0.0,l=0,m=0,n=0,o=0;f=i;j=b+1304|0;a[b+1362|0]=d&1;k=+h[b+1936>>3];d=d?8314:7458;g=b+1960|0;if(k!=1.0){d=~~(+(d|0)/k)&-2}c[g>>2]=d;c[b+56>>2]=0;d=b+36|0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[b+100>>2]=0;d=b+80|0;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[b+740>>2]=0;c[b+736>>2]=1;c[b+728>>2]=0;d=b+732|0;c[d>>2]=0;c[b+144>>2]=16384;m=b+128|0;c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;c[m+12>>2]=0;xh(j);c[b+1944>>2]=0;c[b+1948>>2]=0;c[b+1972>>2]=0;m=b+1980|0;a[m]=0;j=b+1952|0;c[j>>2]=1073741824;n=b+1964|0;c[n>>2]=1;dh(b,0);c[b+1976>>2]=0;m=a[m]|0;o=c[n>>2]&1;c[b+1968>>2]=1;l=c[g>>2]|0;g=o+l|0;c[n>>2]=g;l=g+1+(l*3|0)|0;c[b+1956>>2]=l;g=c[b+1356>>2]|0;if((a[b+1361|0]|m)<<24>>24==0){g=(g|0)>(l|0)?l:g}else{g=0}do{if((g|0)!=(c[j>>2]|0)){c[j>>2]=g;g=c[b+1984>>2]|0;if((g|0)==0){break}ib[g&127](c[b+1988>>2]|0)}}while(0);bh(b,0,16405,0);g=16384;do{bh(b,0,g,(g&3|0)!=0?0:16);g=g+1|0;}while((g|0)!=16404);c[b+1352>>2]=e;if((a[b+1363|0]|0)!=0){i=f;return}c[d>>2]=15;c[b+1324>>2]=e;i=f;return}function $g(a,b){a=a|0;b=b|0;var c=0;c=i;Ec(a+1992|0,b);Ec(a+744|0,b);Ec(a+152|0,b);Ec(a+1376|0,b);i=c;return}function ah(b,d){b=b|0;d=+d;var e=0,f=0;e=i;h[b+1936>>3]=d;f=(a[b+1362|0]|0)!=0?8314:7458;b=b+1960|0;if(!(d!=1.0)){c[b>>2]=f;i=e;return}f=~~(+(f|0)/d)&-2;c[b>>2]=f;i=e;return}function bh(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;if(!(f>>>0>32)){za(45256,45120,285,45272)}if(!(g>>>0<256)){za(45288,45120,286,45272)}j=f+ -16384|0;if(j>>>0>23){i=h;return}dh(b,e);if(f>>>0<16404){e=j>>>2;k=c[b+(e<<2)>>2]|0;f=f&3;a[k+f|0]=g;a[k+f+4|0]=1;if((e|0)==4){yh(b+1304|0,f,g);i=h;return}if((f|0)!=3){i=h;return}if((c[b+1972>>2]&1<<e|0)!=0){c[k+12>>2]=d[45312+(g>>>3&31)|0]|0}if(!(j>>>0<8)){i=h;return}c[k+32>>2]=7;i=h;return}if((f|0)==16407){c[b+1976>>2]=g;f=g&64;k=b+1980|0;j=(d[k]|0)&(f>>>6^1)&255;a[k]=j;k=b+1956|0;c[k>>2]=1073741824;l=b+1964|0;m=c[l>>2]&1;c[l>>2]=m;n=b+1968|0;c[n>>2]=0;do{if((g&128|0)==0){c[n>>2]=1;g=c[b+1960>>2]|0;m=m+g|0;c[l>>2]=m;if((f|0)!=0){e=1073741824;break}e=e+1+m+(g*3|0)|0;c[k>>2]=e}else{e=1073741824}}while(0);g=c[b+1356>>2]|0;if((j|a[b+1361|0])<<24>>24==0){e=(g|0)>(e|0)?e:g}else{e=0}g=b+1952|0;if((e|0)==(c[g>>2]|0)){i=h;return}c[g>>2]=e;g=c[b+1984>>2]|0;if((g|0)==0){i=h;return}ib[g&127](c[b+1988>>2]|0);i=h;return}else if((f|0)==16405){k=(g&16|0)==0;if(k){c[(c[b+16>>2]|0)+12>>2]=0}if((g&8|0)==0){c[(c[b+12>>2]|0)+12>>2]=0}if((g&4|0)==0){c[(c[b+8>>2]|0)+12>>2]=0}if((g&2|0)==0){c[(c[b+4>>2]|0)+12>>2]=0}if((g&1|0)==0){c[(c[b>>2]|0)+12>>2]=0}f=b+1304|0;e=b+1361|0;l=a[e]|0;a[e]=0;n=b+1972|0;j=c[n>>2]|0;c[n>>2]=g;do{if(k){c[b+1356>>2]=1073741824;e=0;g=1073741824}else{if((j&16|0)==0){zh(f)}if(l<<24>>24==0){i=h;return}else{e=a[e]|0;g=c[b+1356>>2]|0;break}}}while(0);if((a[b+1980|0]|e)<<24>>24==0){e=c[b+1956>>2]|0;g=(g|0)>(e|0)?e:g}else{g=0}e=b+1952|0;if((g|0)==(c[e>>2]|0)){i=h;return}c[e>>2]=g;g=c[b+1984>>2]|0;if((g|0)==0){i=h;return}ib[g&127](c[b+1988>>2]|0);i=h;return}else{i=h;return}}function ch(b){b=b|0;var d=0,e=0,f=0;d=i;e=c[b+1356>>2]|0;if((a[b+1980|0]|a[b+1361|0])<<24>>24==0){f=c[b+1956>>2]|0;e=(e|0)>(f|0)?f:e}else{e=0}f=b+1952|0;if((e|0)==(c[f>>2]|0)){i=d;return}c[f>>2]=e;e=c[b+1984>>2]|0;if((e|0)==0){i=d;return}ib[e&127](c[b+1988>>2]|0);i=d;return}function dh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;g=i;f=b+1944|0;h=c[f>>2]|0;if((h|0)>(d|0)){za(45160,45120,150,45184)}if((h|0)==(d|0)){i=g;return}h=b+1948|0;j=c[h>>2]|0;if((j|0)<(d|0)){c[h>>2]=d;Bh(b+1304|0,j,d)}m=b+1964|0;h=b+20|0;u=b+64|0;v=b+712|0;w=b+112|0;s=b+1960|0;o=b+1968|0;x=h;y=u;n=w;p=b+1976|0;q=b+1956|0;r=b+1980|0;l=h;k=u;j=w;t=v;b=b+1362|0;while(1){B=c[f>>2]|0;A=(c[m>>2]|0)+B|0;z=(A|0)>(d|0)?d:A;c[m>>2]=A-z;uh(h,B,z);uh(u,c[f>>2]|0,z);wh(v,c[f>>2]|0,z);Ch(w,c[f>>2]|0,z);c[f>>2]=z;if((z|0)==(d|0)){break}A=c[s>>2]|0;c[m>>2]=A;B=c[o>>2]|0;c[o>>2]=B+1;do{if((B|0)==3){c[o>>2]=0;if((c[p>>2]&128|0)==0){break}c[m>>2]=(A<<1)+((a[b]|0)!=0?-2:-6)}else if((B|0)==1){if((a[b]|0)!=0){break}c[m>>2]=A+ -2}else if((B|0)==0){if((c[p>>2]&192|0)!=0){e=11;break}c[q>>2]=z+2+(A<<2);a[r]=1;e=11}else if((B|0)==2){e=11}}while(0);do{if((e|0)==11){e=0;rh(l,32);rh(k,32);rh(j,32);rh(t,128);th(h,-1);th(u,0);if((a[b]|0)==0){break}if((c[o>>2]|0)!=3){break}c[m>>2]=(c[m>>2]|0)+ -2}}while(0);vh(v);sh(x);sh(y);sh(n)}i=g;return}function eh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;f=b+1944|0;if((c[f>>2]|0)<(d|0)){dh(b,d)}do{if((a[b+1363|0]|0)!=0){g=c[f>>2]|0;h=c[b+28>>2]|0;k=b+40|0;j=c[k>>2]|0;c[k>>2]=0;if(!((h|0)==0|(j|0)==0)){g=_(c[h>>2]|0,g)|0;Sb(c[b+60>>2]|0,g+(c[h+4>>2]|0)|0,0-j|0,h);g=c[f>>2]|0}h=c[b+72>>2]|0;k=b+84|0;j=c[k>>2]|0;c[k>>2]=0;if(!((h|0)==0|(j|0)==0)){g=_(c[h>>2]|0,g)|0;Sb(c[b+104>>2]|0,g+(c[h+4>>2]|0)|0,0-j|0,h);g=c[f>>2]|0}h=c[b+720>>2]|0;k=b+732|0;j=c[k>>2]|0;c[k>>2]=0;if(!((h|0)==0|(j|0)==0)){g=_(c[h>>2]|0,g)|0;Zd(b+744|0,g+(c[h+4>>2]|0)|0,0-j|0,h);g=c[f>>2]|0}h=c[b+120>>2]|0;k=b+132|0;j=c[k>>2]|0;c[k>>2]=0;if(!((h|0)==0|(j|0)==0)){g=_(c[h>>2]|0,g)|0;Zd(b+152|0,g+(c[h+4>>2]|0)|0,0-j|0,h);g=c[f>>2]|0}h=c[b+1312>>2]|0;k=b+1324|0;j=c[k>>2]|0;c[k>>2]=0;if((h|0)==0|(j|0)==0){break}k=_(c[h>>2]|0,g)|0;Zd(b+1376|0,k+(c[h+4>>2]|0)|0,0-j|0,h)}}while(0);k=(c[f>>2]|0)-d|0;c[f>>2]=k;if(!((k|0)>-1)){za(45200,45120,254,45216)}j=b+1948|0;k=(c[j>>2]|0)-d|0;c[j>>2]=k;if(!((k|0)>-1)){za(45232,45120,257,45216)}f=b+1956|0;g=c[f>>2]|0;if((g|0)!=1073741824){c[f>>2]=g-d}f=b+1356|0;g=c[f>>2]|0;if((g|0)!=1073741824){c[f>>2]=g-d}b=b+1952|0;f=c[b>>2]|0;if((f|0)==1073741824){i=e;return}else{d=f-d|0;c[b>>2]=(d|0)<0?0:d;i=e;return}}function fh(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;dh(b,e+ -1|0);g=b+1361|0;h=b+1980|0;j=d[h]<<6|d[g]<<7|(c[(c[b>>2]|0)+12>>2]|0)!=0;j=(c[(c[b+4>>2]|0)+12>>2]|0)==0?j:j|2;j=(c[(c[b+8>>2]|0)+12>>2]|0)==0?j:j|4;j=(c[(c[b+12>>2]|0)+12>>2]|0)==0?j:j|8;j=(c[(c[b+16>>2]|0)+12>>2]|0)==0?j:j|16;dh(b,e);if((a[h]|0)==0){i=f;return j|0}e=j|64;a[h]=0;h=c[b+1356>>2]|0;if((a[g]|0)==0){g=c[b+1956>>2]|0;g=(h|0)>(g|0)?g:h}else{g=0}h=b+1952|0;if((g|0)==(c[h>>2]|0)){j=e;i=f;return j|0}c[h>>2]=g;g=c[b+1984>>2]|0;if((g|0)==0){j=e;i=f;return j|0}ib[g&127](c[b+1988>>2]|0);j=e;i=f;return j|0}function gh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;g=d^24576;if(g>>>0<8192){a[b+g+5576|0]=e;i=f;return}if((d&57344|0)==0){a[b+((d&2047)+336)|0]=e;i=f;return}if((d+ -16384|0)>>>0<24){g=c[b+2392>>2]|0;bh(b+2640|0,(c[g+132>>2]|0)+(c[g+136>>2]|0)|0,d,e);i=f;return}if(!((d+ -24568|0)>>>0<8)){Uh(b,d,e);i=f;return}e=c[b+2620>>2]&e<<12;if((e|0)>=(c[b+2624>>2]|0)){c[b+16>>2]=45432}d=d<<12;g=e-(c[b+2616>>2]|0)|0;e=c[b+2608>>2]|0;g=g>>>0>(e+ -4104|0)>>>0?0:g;if(e>>>0<g>>>0){za(45840,45856,58,45896)}if(!((d+ -100593664|0)>>>0<65537)){za(45552,45472,94,45512)}h=c[b+2604>>2]|0;e=(d+ -100597760|0)>>>11;d=b+2392|0;c[(c[d>>2]|0)+(e<<2)>>2]=h+g;c[(c[d>>2]|0)+((e|1)<<2)>>2]=h+(g+2048);i=f;return}function hh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0;g=i;if((b&2047|0)!=0){za(45448,45472,92,45512)}if((d&2047|0)!=0){za(45528,45472,93,45512)}if(!((d+b|0)>>>0<65537)){za(45552,45472,94,45512)}b=b>>>11;d=d>>>11;if((d|0)==0){i=g;return}a=a+2056|0;if(f){while(1){c[(c[a>>2]|0)+(b<<2)>>2]=e;d=d+ -1|0;if((d|0)==0){break}else{b=b+1|0}}i=g;return}else{while(1){c[(c[a>>2]|0)+(b<<2)>>2]=e;d=d+ -1|0;if((d|0)==0){break}else{b=b+1|0;e=e+2048|0}}i=g;return}}function ih(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+8|0;h=f;l=d+2060|0;g=d+2056|0;c[g>>2]=l;a[d+2053|0]=4;a[d+2054|0]=-1;c[d+2196>>2]=0;c[d+2192>>2]=0;j=d+2200|0;k=d+2048|0;b[k+0>>1]=0;b[k+2>>1]=0;a[k+4|0]=0;c[j>>2]=1073741824;c[d+2204>>2]=1073741824;c[d+2208>>2]=0;c[d+2188>>2]=e;j=27;k=4;while(1){c[l+(k<<2)>>2]=e;if((j|0)==0){break}l=c[g>>2]|0;j=j+ -1|0;k=k+1|0}e=d;c[c[g>>2]>>2]=e;c[(c[g>>2]|0)+4>>2]=e;c[(c[g>>2]|0)+8>>2]=e;c[(c[g>>2]|0)+12>>2]=e;c[h>>2]=1;if((a[h]|0)==0){za(45912,45944,62,45984)}else{i=f;return}}



function jh(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;j=i;i=i+144|0;k=j;l=f+2204|0;c[l>>2]=g;m=f+2200|0;n=c[m>>2]|0;h=f+2053|0;if((n|0)<(g|0)){n=(a[h]&4)==0?n:g}else{n=g}g=f+2056|0;o=c[g>>2]|0;r=o+132|0;p=(c[r>>2]|0)-n|0;c[r>>2]=n;o=o+136|0;c[o>>2]=p+(c[o>>2]|0);o=k;n=f+2060|0;p=n;Nl(o|0,p|0,140)|0;c[g>>2]=k;r=k+136|0;q=f+2048|0;v=f+2050|0;t=f+2051|0;s=f+2052|0;u=f+2054|0;G=d[h]|0;M=G<<8;C=f+2208|0;x=f+ -336|0;y=f+2056|0;z=f+2304|0;A=f+2292|0;B=k+132|0;w=k+124|0;F=d[v]|0;J=M;M=(G&2|M)^2;L=e[q>>1]|0;Q=c[r>>2]|0;H=(d[u]|0)+1|256;G=G&76;E=d[t]|0;D=d[s]|0;a:while(1){O=c[k+(L>>>11<<2)>>2]|0;P=L&2047;R=a[O+P|0]|0;S=R&255;N=L+1|0;T=d[45576+S|0]|0;K=T+Q|0;if(!((K|0)<0|(K|0)<(T|0))){c[r>>2]=Q;if((Q|0)<0){V=D;U=E;K=G;N=H;O=Q;P=L;R=M;S=J;T=F;D=V;E=U;G=K;H=N;Q=O;L=P;M=R;J=S;F=T;continue}else{K=Q;I=360;break}}T=a[O+(P+1)|0]|0;Q=T&255;b:do{switch(S|0){case 157:{N=((d[O+(P+2)|0]|0)<<8|Q)+E|0;L=L+3|0;if(!(N>>>0<2048)){I=62;break b}a[f+N|0]=F;O=D;P=E;R=G;S=H;Q=K;T=M;U=J;V=F;D=O;E=P;G=R;H=S;M=T;J=U;F=V;continue a};case 145:{N=(d[f+Q|0]|0)+D+((d[f+(Q+1&255)|0]|0)<<8)|0;L=L+2|0;I=62;break};case 129:{N=Q+E|0;N=(d[f+(N+1&255)|0]|0)<<8|(d[f+(N&255)|0]|0);L=L+2|0;I=62;break};case 169:{P=D;R=E;S=G;T=H;U=K;V=J;F=Q;M=Q;L=L+2|0;D=P;E=R;G=S;H=T;Q=U;J=V;continue a};case 161:{F=Q+E|0;F=(d[f+(F+1&255)|0]|0)<<8|(d[f+(F&255)|0]|0);L=L+2|0;I=70;break};case 182:{Q=Q+D&255;I=94;break};case 164:{I=97;break};case 160:{I=98;break};case 148:{Q=Q+E&255;I=90;break};case 144:{N=T<<24>>24;O=L+2|0;if((J&256|0)!=0){L=O;I=4;break b}W=D;P=E;R=G;S=H;T=M;U=J;V=F;L=N+O&65535;Q=((N+(O&255)|0)>>>8&1)+K|0;D=W;E=P;G=R;H=S;M=T;J=U;F=V;continue a};case 172:{I=100;break};case 80:{N=T<<24>>24;O=L+2|0;if((G&64|0)!=0){L=O;I=4;break b}P=D;R=E;S=G;T=H;U=M;V=J;W=F;L=N+O&65535;Q=((N+(O&255)|0)>>>8&1)+K|0;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 112:{N=T<<24>>24;O=L+2|0;if((G&64|0)==0){L=O;I=4;break b}P=D;R=E;S=G;T=H;U=M;V=J;W=F;L=N+O&65535;Q=((N+(O&255)|0)>>>8&1)+K|0;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 188:{I=Q+E|0;Q=I;K=(I>>>8)+K|0;I=100;break};case 190:{I=Q+D|0;Q=I;K=(I>>>8)+K|0;I=112;break};case 162:{I=95;break};case 177:{F=(d[f+Q|0]|0)+D|0;K=(F>>>8)+K|0;F=((d[f+(Q+1&255)|0]|0)<<8)+F|0;L=L+2|0;M=d[(c[k+(F>>>11<<2)>>2]|0)+(F&2047)|0]|0;if((F^32768)>>>0<40960){S=D;T=E;U=G;V=H;W=J;F=M;Q=K;D=S;E=T;G=U;H=V;J=W;continue a}else{I=70}break};case 166:{I=94;break};case 180:{Q=Q+E&255;I=97;break};case 134:{I=92;break};case 174:{I=112;break};case 176:{O=T<<24>>24;N=L+2|0;if((J&256|0)==0){L=N;I=4;break b}P=D;R=E;S=G;T=H;U=M;V=J;W=F;L=O+N&65535;Q=((O+(N&255)|0)>>>8&1)+K|0;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 140:{N=D;I=124;break};case 150:{Q=Q+D&255;I=92;break};case 132:{I=90;break};case 142:{N=E;I=124;break};case 185:{K=((Q+D|0)>>>8)+K|0;F=((d[O+(P+2)|0]|0)<<8|Q)+D|0;L=L+3|0;M=d[(c[k+(F>>>11<<2)>>2]|0)+(F&2047)|0]|0;if((F^32768)>>>0<40960){S=D;T=E;U=G;V=H;W=J;F=M;Q=K;D=S;E=T;G=U;H=V;J=W;continue a}else{I=70}break};case 189:{K=((Q+E|0)>>>8)+K|0;F=((d[O+(P+2)|0]|0)<<8|Q)+E|0;L=L+3|0;M=d[(c[k+(F>>>11<<2)>>2]|0)+(F&2047)|0]|0;if((F^32768)>>>0<40960){S=D;T=E;U=G;V=H;W=J;F=M;Q=K;D=S;E=T;G=U;H=V;J=W;continue a}else{I=70}break};case 57:{M=D;I=156;break};case 192:{I=150;break};case 65:{M=Q+E|0;M=(d[f+(M+1&255)|0]|0)<<8|(d[f+(M&255)|0]|0);I=177;break};case 69:{I=173;break};case 89:{M=D;I=175;break};case 224:{I=138;break};case 49:{I=(d[f+Q|0]|0)+D|0;M=((d[f+(Q+1&255)|0]|0)<<8)+I|0;K=(I>>>8)+K|0;I=158;break};case 77:{I=176;break};case 204:{I=d[O+(P+2)|0]|0;W=I<<8;J=W|Q;N=L+2|0;c[r>>2]=K;K=J&2047;do{if((W&57344|0)==0){Q=d[x+(K+336)|0]|0}else{L=c[y>>2]|0;if(J>>>0>32767){Q=d[(c[L+(I>>>3<<2)>>2]|0)+K|0]|0;break}if(J>>>0>24575){Q=d[x+(J&8191)+5576|0]|0;break}if((J|0)==16405){Q=fh(z,(c[L+132>>2]|0)+(c[L+136>>2]|0)|0)|0;break}else if((J|0)!=18432){Q=I;break}J=c[A>>2]|0;if((J|0)==0){Q=I;break}K=J+100|0;W=c[K>>2]|0;I=W&127;if((W&128|0)!=0){c[K>>2]=I+1|128}Q=d[J+I+104|0]|0}}while(0);K=c[r>>2]|0;I=150;break};case 228:{Q=d[f+Q|0]|0;I=138;break};case 85:{Q=Q+E&255;I=173;break};case 61:{M=E;I=156;break};case 37:{I=154;break};case 236:{I=d[O+(P+2)|0]|0;W=I<<8;J=W|Q;N=L+2|0;c[r>>2]=K;K=J&2047;do{if((W&57344|0)==0){Q=d[x+(K+336)|0]|0}else{L=c[y>>2]|0;if(J>>>0>32767){Q=d[(c[L+(I>>>3<<2)>>2]|0)+K|0]|0;break}if(J>>>0>24575){Q=d[x+(J&8191)+5576|0]|0;break}if((J|0)==16405){Q=fh(z,(c[L+132>>2]|0)+(c[L+136>>2]|0)|0)|0;break}else if((J|0)!=18432){Q=I;break}J=c[A>>2]|0;if((J|0)==0){Q=I;break}I=J+100|0;W=c[I>>2]|0;K=W&127;if((W&128|0)!=0){c[I>>2]=K+1|128}Q=d[J+K+104|0]|0}}while(0);K=c[r>>2]|0;I=138;break};case 45:{I=157;break};case 53:{Q=Q+E&255;I=154;break};case 81:{I=(d[f+Q|0]|0)+D|0;M=((d[f+(Q+1&255)|0]|0)<<8)+I|0;K=(I>>>8)+K|0;I=177;break};case 196:{Q=d[f+Q|0]|0;I=150;break};case 41:{I=169;break};case 33:{M=Q+E|0;M=(d[f+(M+1&255)|0]|0)<<8|(d[f+(M&255)|0]|0);I=158;break};case 93:{M=E;I=175;break};case 1:{M=Q+E|0;M=(d[f+(M+1&255)|0]|0)<<8|(d[f+(M&255)|0]|0);I=196;break};case 73:{I=188;break};case 125:{M=E;I=243;break};case 237:{I=225;break};case 229:{I=222;break};case 36:{O=d[f+Q|0]|0;N=F;M=(O&F|0)==0?O<<8:O;L=L+2|0;G=O&64|G&-65;Q=K;F=N;continue a};case 29:{M=E;I=194;break};case 9:{I=207;break};case 13:{I=195;break};case 17:{I=(d[f+Q|0]|0)+D|0;M=((d[f+(Q+1&255)|0]|0)<<8)+I|0;K=(I>>>8)+K|0;I=196;break};case 25:{M=D;I=194;break};case 225:{M=Q+E|0;M=(d[f+(M+1&255)|0]|0)<<8|(d[f+(M&255)|0]|0);I=226;break};case 245:{Q=Q+E&255;I=222;break};case 253:{M=E;I=224;break};case 5:{I=192;break};case 97:{M=Q+E|0;M=(d[f+(M+1&255)|0]|0)<<8|(d[f+(M&255)|0]|0);I=245;break};case 109:{I=244;break};case 241:{I=(d[f+Q|0]|0)+D|0;M=((d[f+(Q+1&255)|0]|0)<<8)+I|0;K=(I>>>8)+K|0;I=226;break};case 113:{I=(d[f+Q|0]|0)+D|0;M=((d[f+(Q+1&255)|0]|0)<<8)+I|0;K=(I>>>8)+K|0;I=245;break};case 44:{M=d[O+(P+2)|0]|0;W=M<<8;N=W|Q;L=L+3|0;G=G&-65;c[r>>2]=K;O=N&2047;do{if((W&57344|0)==0){K=d[x+(O+336)|0]|0}else{K=c[y>>2]|0;if(N>>>0>32767){K=d[(c[K+(M>>>3<<2)>>2]|0)+O|0]|0;break}if(N>>>0>24575){K=d[x+(N&8191)+5576|0]|0;break}if((N|0)==16405){K=fh(z,(c[K+132>>2]|0)+(c[K+136>>2]|0)|0)|0;break}else if((N|0)!=18432){K=M;break}K=c[A>>2]|0;if((K|0)==0){K=M;break}N=K+100|0;W=c[N>>2]|0;M=W&127;if((W&128|0)!=0){c[N>>2]=M+1|128}K=d[K+M+104|0]|0}}while(0);N=F;M=(K&F|0)==0?K<<8:K;Q=c[r>>2]|0;G=K&64|G;F=N;continue a};case 117:{Q=Q+E&255;I=241;break};case 235:case 233:{I=237;break};case 21:{Q=Q+E&255;I=192;break};case 249:{M=D;I=224;break};case 101:{I=241;break};case 121:{M=D;I=243;break};case 94:{Q=Q+E|0;I=262;break};case 105:{break};case 106:{I=258;break};case 30:{Q=Q+E|0;I=276;break};case 46:{I=277;break};case 118:{Q=Q+E&255;I=293;break};case 74:{J=0;I=258;break};case 42:{S=F<<1;M=S|J>>>8&1;T=D;U=E;V=G;W=H;Q=K;L=N;F=M&255;J=S;D=T;E=U;G=V;H=W;continue a};case 78:{I=262;break};case 14:{I=276;break};case 238:{M=(d[O+(P+2)|0]|0)<<8|Q;N=1;I=309;break};case 102:{I=293;break};case 136:{R=D+ -1|0;S=E;T=G;U=H;Q=K;L=N;V=J;W=F;M=R;D=R&255;E=S;G=T;H=U;J=V;F=W;continue a};case 246:{O=Q+E&255;M=1;I=303;break};case 214:{Q=Q+E&255;I=302;break};case 222:{M=((d[O+(P+2)|0]|0)<<8|Q)+E|0;N=-1;I=309;break};case 206:{M=(d[O+(P+2)|0]|0)<<8|Q;N=-1;I=309;break};case 198:{I=302;break};case 254:{M=((d[O+(P+2)|0]|0)<<8|Q)+E|0;N=1;I=309;break};case 10:{M=F<<1;T=D;U=E;V=G;W=H;Q=K;L=N;F=M&254;J=M;D=T;E=U;G=V;H=W;continue a};case 62:{Q=Q+E|0;I=277;break};case 126:{Q=Q+E|0;I=263;break};case 86:{Q=Q+E&255;I=292;break};case 6:{I=296;break};case 110:{I=263;break};case 70:{I=292;break};case 54:{Q=Q+E&255;I=297;break};case 22:{Q=Q+E&255;I=296;break};case 38:{I=297;break};case 202:{R=E+ -1|0;S=D;T=G;U=H;Q=K;L=N;V=J;W=F;M=R;E=R&255;D=S;G=T;H=U;J=V;F=W;continue a};case 230:{O=Q;M=1;I=303;break};case 186:{E=H+255&255;S=D;T=G;U=H;Q=K;L=N;V=J;W=F;M=E;D=S;G=T;H=U;J=V;F=W;continue a};case 8:{L=G&76|(M>>>8|M)&128|J>>>8&1;H=H+ -1|256;a[f+H|0]=((M&255|0)==0?L|2:L)|48;R=D;S=E;T=G;Q=K;L=N;U=M;V=J;W=F;D=R;E=S;G=T;M=U;J=V;F=W;continue a};case 255:{J=J|1;I=354;break};case 24:{R=D;S=E;T=G;U=H;Q=K;L=N;V=M;W=F;J=0;D=R;E=S;G=T;H=U;M=V;F=W;continue a};case 40:{O=d[f+H|0]|0;H=H+ -255|256;L=O&76;J=O<<8;M=(O&2|J)^2;if(((O^G)&4|0)==0){T=D;U=E;Q=K;V=N;W=F;G=L;D=T;E=U;L=V;F=W;continue a}if((O&4|0)==0){G=L;I=341}else{G=L;I=347}break};case 252:case 220:case 124:case 92:case 60:case 28:{K=((Q+E|0)>>>8)+K|0;I=349;break};case 138:{S=D;T=E;U=G;V=H;Q=K;L=N;M=E;W=J;F=E;D=S;E=T;G=U;H=V;J=W;continue a};case 104:{M=d[f+H|0]|0;T=D;U=E;V=G;Q=K;L=N;W=J;F=M;H=H+ -255|256;D=T;E=U;G=V;J=W;continue a};case 210:case 178:case 146:case 114:case 98:case 82:case 66:case 50:case 34:case 18:case 2:{L=N;I=360;break a};case 88:{if((G&4|0)==0){P=D;R=E;S=G;T=H;Q=K;L=N;U=M;V=J;W=F;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a}G=G&-5;I=341;break};case 184:{R=D;S=E;T=H;Q=K;L=N;U=M;V=J;W=F;G=G&-65;D=R;E=S;H=T;M=U;J=V;F=W;continue a};case 170:{S=D;E=F;T=G;U=H;Q=K;L=N;M=F;V=J;W=F;D=S;G=T;H=U;J=V;F=W;continue a};case 0:{L=L+2|0;Q=K+7|0;a[f+(H+ -1|256)|0]=L>>>8;a[f+(H+ -2|256)|0]=L;L=c[w>>2]|0;L=(d[L+2047|0]|0)<<8|(d[L+2046|0]|0);H=H+ -3|256;K=G&76|(M>>>8|M)&128|J>>>8&1;a[f+H|0]=((M&255|0)==0?K|2:K)|48;G=G|4;a[h]=G;N=c[l>>2]|0;K=(c[B>>2]|0)-N|0;if((K|0)>-1){S=D;T=E;U=M;V=J;W=F;D=S;E=T;M=U;J=V;F=W;continue a}c[B>>2]=N;S=D;T=E;U=M;V=J;W=F;Q=K+Q|0;D=S;E=T;M=U;J=V;F=W;continue a};case 154:{R=D;S=E;T=G;Q=K;L=N;U=M;V=J;W=F;H=E+1|256;D=R;E=S;G=T;M=U;J=V;F=W;continue a};case 56:{R=D;S=E;T=G;U=H;Q=K;L=N;V=M;W=F;J=-1;D=R;E=S;G=T;H=U;M=V;F=W;continue a};case 242:{if(!(L>>>0>65535)){I=360;break a}P=D;R=E;S=G;T=H;Q=K;U=M;V=J;W=F;L=L&65535;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 244:case 226:case 212:case 194:case 137:case 130:case 128:case 100:case 84:case 68:case 52:case 20:case 4:case 116:{I=350;break};case 120:{if((G&4|0)!=0){P=D;R=E;S=G;T=H;Q=K;L=N;U=M;V=J;W=F;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a}G=G|4;I=347;break};case 216:{R=D;S=E;T=H;Q=K;L=N;U=M;V=J;W=F;G=G&-9;D=R;E=S;H=T;M=U;J=V;F=W;continue a};case 108:{L=d[O+(P+2)|0]|0;N=c[k+(L>>>3<<2)>>2]|0;L=L<<8&1792;O=D;P=E;R=G;S=H;T=K;U=M;V=J;W=F;L=(d[N+(L|Q+1&255)|0]|0)<<8|(d[N+(L|Q)|0]|0);D=O;E=P;G=R;H=S;Q=T;M=U;J=V;F=W;continue a};case 248:{R=D;S=E;T=H;Q=K;L=N;U=M;V=J;W=F;G=G|8;D=R;E=S;H=T;M=U;J=V;F=W;continue a};case 64:{O=d[f+H|0]|0;L=(d[f+(H+ -254|256)|0]|0)<<8|(d[f+(H+ -255|256)|0]|0);H=H+ -253|256;N=O&76;J=O<<8;M=(O&2|J)^2;if(((O^G)&4|0)==0){U=D;V=E;Q=K;W=F;G=N;D=U;E=V;F=W;continue a}a[h]=N;P=c[m>>2]|0;G=(c[B>>2]|0)-P|0;if((G|0)<1){U=D;V=E;Q=K;W=F;G=N;D=U;E=V;F=W;continue a}if((O&4|0)!=0){U=D;V=E;Q=K;W=F;G=N;D=U;E=V;F=W;continue a}c[B>>2]=P;U=D;V=E;W=F;Q=G+K|0;G=N;D=U;E=V;F=W;continue a};case 72:{P=H+ -1|256;a[f+P|0]=F;R=D;S=E;T=G;Q=K;L=N;U=M;V=J;W=F;H=P;D=R;E=S;G=T;M=U;J=V;F=W;continue a};case 12:{I=349;break};case 48:{O=T<<24>>24;N=L+2|0;if((M&32896|0)==0){L=N;I=4;break b}P=D;R=E;S=G;T=H;U=M;V=J;W=F;L=O+N&65535;Q=((O+(N&255)|0)>>>8&1)+K|0;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 250:case 218:case 122:case 90:case 58:case 26:case 234:{P=D;R=E;S=G;T=H;Q=K;L=N;U=M;V=J;W=F;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 152:{S=D;T=E;U=G;V=H;Q=K;L=N;M=D;W=J;F=D;D=S;E=T;G=U;H=V;J=W;continue a};case 217:{J=D;I=22;break};case 201:{I=35;break};case 197:{I=20;break};case 221:{J=E;I=22;break};case 16:{O=T<<24>>24;N=L+2|0;if((M&32896|0)!=0){L=N;I=4;break b}P=D;R=E;S=G;T=H;U=M;V=J;W=F;L=O+N&65535;Q=((O+(N&255)|0)>>>8&1)+K|0;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 240:{O=T<<24>>24;N=L+2|0;if(!((M&255)<<24>>24==0)){L=N;I=4;break b}P=D;R=E;S=G;T=H;U=M;V=J;W=F;L=O+N&65535;Q=((O+(N&255)|0)>>>8&1)+K|0;D=P;E=R;G=S;H=T;M=U;J=V;F=W;continue a};case 205:{I=23;break};case 181:{M=d[f+(Q+E&255)|0]|0;S=D;T=E;U=G;V=H;Q=K;W=J;F=M;L=L+2|0;D=S;E=T;G=U;H=V;J=W;continue a};case 76:{X=D;N=E;R=G;S=H;T=K;U=M;V=J;W=F;L=(d[O+(P+2)|0]|0)<<8|Q;D=X;E=N;G=R;H=S;Q=T;M=U;J=V;F=W;continue a};case 173:{F=d[O+(P+2)|0]|0;X=F<<8;M=X|Q;L=L+3|0;c[r>>2]=K;N=M&2047;do{if((X&57344|0)==0){K=d[x+(N+336)|0]|0}else{K=c[y>>2]|0;if(M>>>0>32767){K=d[(c[K+(F>>>3<<2)>>2]|0)+N|0]|0;break}if(M>>>0>24575){K=d[x+(M&8191)+5576|0]|0;break}if((M|0)==16405){K=fh(z,(c[K+132>>2]|0)+(c[K+136>>2]|0)|0)|0;break}else if((M|0)!=18432){K=F;break}K=c[A>>2]|0;if((K|0)==0){K=F;break}F=K+100|0;X=c[F>>2]|0;M=X&127;if((X&128|0)!=0){c[F>>2]=M+1|128}K=d[K+M+104|0]|0}}while(0);T=D;U=E;V=G;W=H;X=J;F=K;M=K;Q=c[r>>2]|0;D=T;E=U;G=V;H=W;J=X;continue a};case 200:{S=D+1|0;T=E;U=G;V=H;Q=K;L=N;W=J;X=F;M=S;D=S&255;E=T;G=U;H=V;J=W;F=X;continue a};case 232:{S=E+1|0;T=D;U=G;V=H;Q=K;L=N;W=J;X=F;M=S;E=S&255;D=T;G=U;H=V;J=W;F=X;continue a};case 209:{I=(d[f+Q|0]|0)+D|0;J=((d[f+(Q+1&255)|0]|0)<<8)+I|0;K=(I>>>8)+K|0;I=24;break};case 96:{S=D;T=E;U=G;Q=K;V=M;W=J;X=F;L=(d[f+H|0]|0)+1+((d[f+(H+ -255|256)|0]|0)<<8)|0;H=H+ -254|256;D=S;E=T;G=U;M=V;J=W;F=X;continue a};case 153:{N=((d[O+(P+2)|0]|0)<<8|Q)+D|0;L=L+3|0;if(!(N>>>0<2048)){I=62;break b}a[f+N|0]=F;R=D;S=E;T=G;U=H;Q=K;V=M;W=J;X=F;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue a};case 32:{S=L+2|0;P=(d[O+(P+2)|0]|0)<<8|Q;a[f+(H+ -1|256)|0]=S>>>8;R=H+ -2|256;a[f+R|0]=S;S=D;T=E;U=G;Q=K;V=M;W=J;X=F;L=P;H=R;D=S;E=T;G=U;M=V;J=W;F=X;continue a};case 141:{N=(d[O+(P+2)|0]|0)<<8|Q;L=L+3|0;if(!(N>>>0<2048)){I=62;break b}a[f+N|0]=F;R=D;S=E;T=G;U=H;Q=K;V=M;W=J;X=F;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue a};case 208:{O=T<<24>>24;N=L+2|0;if((M&255)<<24>>24==0){L=N;I=4;break b}R=D;S=E;T=G;U=H;V=M;W=J;X=F;L=O+N&65535;Q=((O+(N&255)|0)>>>8&1)+K|0;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue a};case 193:{J=Q+E|0;J=(d[f+(J+1&255)|0]|0)<<8|(d[f+(J&255)|0]|0);I=24;break};case 213:{Q=Q+E&255;I=20;break};case 133:{I=41;break};case 149:{Q=Q+E&255;I=41;break};case 168:{D=F;T=E;U=G;V=H;Q=K;L=N;M=F;W=J;X=F;E=T;G=U;H=V;J=W;F=X;continue a};case 165:{M=d[f+Q|0]|0;T=D;U=E;V=G;W=H;Q=K;X=J;F=M;L=L+2|0;D=T;E=U;G=V;H=W;J=X;continue a};default:{I=354}}}while(0);if((I|0)==4){I=0;R=D;S=E;T=G;U=H;V=M;W=J;X=F;Q=K+ -1|0;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}else if((I|0)==20){Q=d[f+Q|0]|0;I=35}else if((I|0)==22){X=J+Q|0;Q=X;K=(X>>>8)+K|0;I=23}else if((I|0)==41){I=0;a[f+Q|0]=F;R=D;S=E;T=G;U=H;Q=K;V=M;W=J;X=F;L=L+2|0;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}else if((I|0)==62){I=0;c[r>>2]=K;gh(x,N,F);R=D;S=E;T=G;U=H;V=M;W=J;X=F;Q=c[r>>2]|0;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}else if((I|0)==70){I=0;c[r>>2]=K;K=F&2047;c:do{if((F&57344|0)==0){K=d[x+(K+336)|0]|0}else{M=c[y>>2]|0;if(F>>>0>32767){K=d[(c[M+(F>>>11<<2)>>2]|0)+K|0]|0;break}if(F>>>0>24575){K=d[x+(F&8191)+5576|0]|0;break}if((F|0)==18432){I=75}else if((F|0)==16405){K=fh(z,(c[M+132>>2]|0)+(c[M+136>>2]|0)|0)|0;break}do{if((I|0)==75){I=0;K=c[A>>2]|0;if((K|0)==0){break}F=K+100|0;X=c[F>>2]|0;M=X&127;if((X&128|0)!=0){c[F>>2]=M+1|128}K=d[K+M+104|0]|0;break c}}while(0);K=F>>>8}}while(0);T=D;U=E;V=G;W=H;X=J;F=K;M=K;Q=c[r>>2]|0;D=T;E=U;G=V;H=W;J=X;continue}else if((I|0)==90){I=0;a[f+Q|0]=D;R=D;S=E;T=G;U=H;Q=K;V=M;W=J;X=F;L=L+2|0;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}else if((I|0)==92){I=0;a[f+Q|0]=E;R=D;S=E;T=G;U=H;Q=K;V=M;W=J;X=F;L=L+2|0;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}else if((I|0)==94){Q=d[f+Q|0]|0;I=95}else if((I|0)==97){Q=d[f+Q|0]|0;I=98}else if((I|0)==100){I=0;D=((d[O+(P+2)|0]|0)<<8)+Q|0;L=L+3|0;c[r>>2]=K;K=D&2047;d:do{if((D&57344|0)==0){D=d[x+(K+336)|0]|0}else{M=c[y>>2]|0;if(D>>>0>32767){D=d[(c[M+(D>>>11<<2)>>2]|0)+K|0]|0;break}if(D>>>0>24575){D=d[x+(D&8191)+5576|0]|0;break}if((D|0)==18432){I=105}else if((D|0)==16405){D=fh(z,(c[M+132>>2]|0)+(c[M+136>>2]|0)|0)|0;break}do{if((I|0)==105){I=0;K=c[A>>2]|0;if((K|0)==0){break}D=K+100|0;X=c[D>>2]|0;M=X&127;if((X&128|0)!=0){c[D>>2]=M+1|128}D=d[K+M+104|0]|0;break d}}while(0);D=D>>>8}}while(0);T=E;U=G;V=H;W=J;X=F;M=D;Q=c[r>>2]|0;E=T;G=U;H=V;J=W;F=X;continue}else if((I|0)==112){I=0;E=((d[O+(P+2)|0]|0)<<8)+Q|0;L=L+3|0;c[r>>2]=K;K=E&2047;e:do{if((E&57344|0)==0){E=d[x+(K+336)|0]|0}else{M=c[y>>2]|0;if(E>>>0>32767){E=d[(c[M+(E>>>11<<2)>>2]|0)+K|0]|0;break}if(E>>>0>24575){E=d[x+(E&8191)+5576|0]|0;break}if((E|0)==16405){E=fh(z,(c[M+132>>2]|0)+(c[M+136>>2]|0)|0)|0;break}else if((E|0)==18432){I=117}do{if((I|0)==117){I=0;K=c[A>>2]|0;if((K|0)==0){break}M=K+100|0;X=c[M>>2]|0;E=X&127;if((X&128|0)!=0){c[M>>2]=E+1|128}E=d[K+E+104|0]|0;break e}}while(0);E=E>>>8}}while(0);T=D;U=G;V=H;W=J;X=F;M=E;Q=c[r>>2]|0;D=T;G=U;H=V;J=W;F=X;continue}else if((I|0)==124){I=0;O=(d[O+(P+2)|0]|0)<<8|Q;L=L+3|0;if(O>>>0<2048){a[f+O|0]=N;R=D;S=E;T=G;U=H;Q=K;V=M;W=J;X=F;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}else{c[r>>2]=K;gh(x,O,N);R=D;S=E;T=G;U=H;V=M;W=J;X=F;Q=c[r>>2]|0;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}}else if((I|0)==138){I=0;M=E-Q|0;T=D;U=E;V=G;W=H;X=F;J=~M;M=M&255;L=N+1|0;Q=K;D=T;E=U;G=V;H=W;F=X;continue}else if((I|0)==150){I=0;M=D-Q|0;T=D;U=E;V=G;W=H;X=F;J=~M;M=M&255;L=N+1|0;Q=K;D=T;E=U;G=V;H=W;F=X;continue}else if((I|0)==154){Q=d[f+Q|0]|0;I=169}else if((I|0)==156){X=M+Q|0;Q=X;K=(X>>>8)+K|0;I=157}else if((I|0)==173){Q=d[f+Q|0]|0;I=188}else if((I|0)==175){X=M+Q|0;Q=X;K=(X>>>8)+K|0;I=176}else if((I|0)==192){Q=d[f+Q|0]|0;I=207}else if((I|0)==194){X=M+Q|0;Q=X;K=(X>>>8)+K|0;I=195}else if((I|0)==222){Q=d[f+Q|0]|0;I=237}else if((I|0)==224){X=M+Q|0;Q=X;K=(X>>>8)+K|0;I=225}else if((I|0)==241){I=0;Q=d[f+Q|0]|0}else if((I|0)==243){X=M+Q|0;Q=X;K=(X>>>8)+K|0;I=244}else if((I|0)==258){I=0;T=F<<8;M=J>>>1&128|F>>>1;U=D;V=E;W=G;X=H;Q=K;L=N;F=M;J=T;D=U;E=V;G=W;H=X;continue}else if((I|0)==262){J=0;I=263}else if((I|0)==276){J=0;I=277}else if((I|0)==292){J=0;I=293}else if((I|0)==296){J=0;I=297}else if((I|0)==302){O=Q;M=-1;I=303}else if((I|0)==309){I=0;c[r>>2]=K;K=M&2047;f:do{if((M&57344|0)==0){K=d[x+(K+336)|0]|0}else{O=c[y>>2]|0;if(M>>>0>32767){K=d[(c[O+(M>>>11<<2)>>2]|0)+K|0]|0;break}if(M>>>0>24575){K=d[x+(M&8191)+5576|0]|0;break}if((M|0)==16405){K=fh(z,(c[O+132>>2]|0)+(c[O+136>>2]|0)|0)|0;break}else if((M|0)==18432){I=314}do{if((I|0)==314){I=0;K=c[A>>2]|0;if((K|0)==0){break}P=K+100|0;X=c[P>>2]|0;O=X&127;if((X&128|0)!=0){c[P>>2]=O+1|128}K=d[K+O+104|0]|0;break f}}while(0);K=M>>>8}}while(0);Q=K+N|0;gh(x,M,Q&255);S=D;T=E;U=G;V=H;W=J;X=F;M=Q;L=L+3|0;Q=c[r>>2]|0;D=S;E=T;G=U;H=V;J=W;F=X;continue}else if((I|0)==341){I=0;a[h]=G;L=c[m>>2]|0;O=(c[B>>2]|0)-L|0;if((O|0)<1){V=D;W=E;Q=K;L=N;X=F;D=V;E=W;F=X;continue}c[B>>2]=L;Q=O+K|0;if((Q|0)<0){V=D;W=E;L=N;X=F;D=V;E=W;F=X;continue}K=Q+1|0;if((O|0)<(K|0)){V=D;W=E;L=N;X=F;D=V;E=W;F=X;continue}c[B>>2]=K+L;V=D;W=E;L=N;X=F;Q=-1;D=V;E=W;F=X;continue}else if((I|0)==347){I=0;a[h]=G;U=c[B>>2]|0;Q=c[l>>2]|0;c[B>>2]=Q;V=D;W=E;L=N;X=F;Q=U+K-Q|0;D=V;E=W;F=X;continue}else if((I|0)==349){N=L+2|0;I=350}else if((I|0)==354){I=0;L=(R<<24>>24==-100?2:(d[45832+(S>>>2&7)|0]|0)>>>(S<<1&6)&3)+N|0;c[C>>2]=(c[C>>2]|0)+1;if((S&240|0)!=176){S=D;T=E;U=G;V=H;Q=K;W=M;X=F;D=S;E=T;G=U;H=V;M=W;F=X;continue}if(R<<24>>24==-77){Q=d[f+Q|0]|0}else if(R<<24>>24==-73){S=D;T=E;U=G;V=H;Q=K;W=M;X=F;D=S;E=T;G=U;H=V;M=W;F=X;continue}S=D;T=E;U=G;V=H;W=M;X=F;Q=((Q+D|0)>>>8)+K|0;D=S;E=T;G=U;H=V;M=W;F=X;continue}if((I|0)==23){J=((d[O+(P+2)|0]|0)<<8)+Q|0;N=L+2|0;I=24}else if((I|0)==95){I=0;S=D;T=G;U=H;V=K;W=J;X=F;M=Q;L=L+2|0;E=Q;D=S;G=T;H=U;Q=V;J=W;F=X;continue}else if((I|0)==98){I=0;S=E;T=G;U=H;V=K;W=J;X=F;M=Q;L=L+2|0;D=Q;E=S;G=T;H=U;Q=V;J=W;F=X;continue}else if((I|0)==157){M=((d[O+(P+2)|0]|0)<<8)+Q|0;N=L+2|0;I=158}else if((I|0)==176){M=((d[O+(P+2)|0]|0)<<8)+Q|0;N=L+2|0;I=177}else if((I|0)==195){M=((d[O+(P+2)|0]|0)<<8)+Q|0;N=L+2|0;I=196}else if((I|0)==225){M=((d[O+(P+2)|0]|0)<<8)+Q|0;N=L+2|0;I=226}else if((I|0)==244){M=((d[O+(P+2)|0]|0)<<8)+Q|0;N=L+2|0;I=245}else if((I|0)==263){I=0;M=((d[O+(P+2)|0]|0)<<8)+Q|0;c[r>>2]=K;K=M&2047;g:do{if((M&57344|0)==0){I=d[x+(K+336)|0]|0}else{N=c[y>>2]|0;if(M>>>0>32767){I=d[(c[N+(M>>>11<<2)>>2]|0)+K|0]|0;break}if(M>>>0>24575){I=d[x+(M&8191)+5576|0]|0;break}if((M|0)==18432){I=268}else if((M|0)==16405){I=fh(z,(c[N+132>>2]|0)+(c[N+136>>2]|0)|0)|0;break}do{if((I|0)==268){N=c[A>>2]|0;if((N|0)==0){break}I=N+100|0;X=c[I>>2]|0;K=X&127;if((X&128|0)!=0){c[I>>2]=K+1|128}I=d[N+K+104|0]|0;break g}}while(0);I=M>>>8}}while(0);K=I<<8;N=M;M=I>>1|J>>>1&128;I=288}else if((I|0)==277){I=0;M=((d[O+(P+2)|0]|0)<<8)+Q|0;J=J>>>8&1;c[r>>2]=K;K=M&2047;h:do{if((M&57344|0)==0){I=d[x+(K+336)|0]|0}else{N=c[y>>2]|0;if(M>>>0>32767){I=d[(c[N+(M>>>11<<2)>>2]|0)+K|0]|0;break}if(M>>>0>24575){I=d[x+(M&8191)+5576|0]|0;break}if((M|0)==18432){I=282}else if((M|0)==16405){I=fh(z,(c[N+132>>2]|0)+(c[N+136>>2]|0)|0)|0;break}do{if((I|0)==282){K=c[A>>2]|0;if((K|0)==0){break}N=K+100|0;X=c[N>>2]|0;I=X&127;if((X&128|0)!=0){c[N>>2]=I+1|128}I=d[K+I+104|0]|0;break h}}while(0);I=M>>>8}}while(0);I=I<<1;K=I;N=M;M=I|J;I=288}else if((I|0)==293){M=d[f+Q|0]|0;N=M<<8;M=M>>>1|J>>>1&128;I=304}else if((I|0)==297){M=(d[f+Q|0]|0)<<1;N=M;M=M|J>>>8&1;I=304}else if((I|0)==303){N=J;Q=O;M=(d[f+O|0]|0)+M|0;I=304}else if((I|0)==350){I=0;R=D;S=E;T=G;U=H;V=M;W=J;X=F;L=N+1|0;Q=K;D=R;E=S;G=T;H=U;M=V;J=W;F=X;continue}if((I|0)==24){I=0;c[r>>2]=K;K=J&2047;i:do{if((J&57344|0)==0){Q=d[x+(K+336)|0]|0}else{L=c[y>>2]|0;if(J>>>0>32767){Q=d[(c[L+(J>>>11<<2)>>2]|0)+K|0]|0;break}if(J>>>0>24575){Q=d[x+(J&8191)+5576|0]|0;break}if((J|0)==16405){Q=fh(z,(c[L+132>>2]|0)+(c[L+136>>2]|0)|0)|0;break}else if((J|0)==18432){I=29}do{if((I|0)==29){I=c[A>>2]|0;if((I|0)==0){break}J=I+100|0;X=c[J>>2]|0;K=X&127;if((X&128|0)!=0){c[J>>2]=K+1|128}Q=d[I+K+104|0]|0;break i}}while(0);Q=J>>>8}}while(0);K=c[r>>2]|0;I=35}else if((I|0)==158){I=0;c[r>>2]=K;K=M&2047;j:do{if((M&57344|0)==0){Q=d[x+(K+336)|0]|0}else{L=c[y>>2]|0;if(M>>>0>32767){Q=d[(c[L+(M>>>11<<2)>>2]|0)+K|0]|0;break}if(M>>>0>24575){Q=d[x+(M&8191)+5576|0]|0;break}if((M|0)==18432){I=163}else if((M|0)==16405){Q=fh(z,(c[L+132>>2]|0)+(c[L+136>>2]|0)|0)|0;break}do{if((I|0)==163){I=c[A>>2]|0;if((I|0)==0){break}K=I+100|0;X=c[K>>2]|0;L=X&127;if((X&128|0)!=0){c[K>>2]=L+1|128}Q=d[I+L+104|0]|0;break j}}while(0);Q=M>>>8}}while(0);K=c[r>>2]|0;I=169}else if((I|0)==177){I=0;c[r>>2]=K;K=M&2047;k:do{if((M&57344|0)==0){Q=d[x+(K+336)|0]|0}else{L=c[y>>2]|0;if(M>>>0>32767){Q=d[(c[L+(M>>>11<<2)>>2]|0)+K|0]|0;break}if(M>>>0>24575){Q=d[x+(M&8191)+5576|0]|0;break}if((M|0)==16405){Q=fh(z,(c[L+132>>2]|0)+(c[L+136>>2]|0)|0)|0;break}else if((M|0)==18432){I=182}do{if((I|0)==182){I=c[A>>2]|0;if((I|0)==0){break}K=I+100|0;X=c[K>>2]|0;L=X&127;if((X&128|0)!=0){c[K>>2]=L+1|128}Q=d[I+L+104|0]|0;break k}}while(0);Q=M>>>8}}while(0);K=c[r>>2]|0;I=188}else if((I|0)==196){I=0;c[r>>2]=K;L=M&2047;l:do{if((M&57344|0)==0){Q=d[x+(L+336)|0]|0}else{K=c[y>>2]|0;if(M>>>0>32767){Q=d[(c[K+(M>>>11<<2)>>2]|0)+L|0]|0;break}if(M>>>0>24575){Q=d[x+(M&8191)+5576|0]|0;break}if((M|0)==18432){I=201}else if((M|0)==16405){Q=fh(z,(c[K+132>>2]|0)+(c[K+136>>2]|0)|0)|0;break}do{if((I|0)==201){I=c[A>>2]|0;if((I|0)==0){break}K=I+100|0;X=c[K>>2]|0;L=X&127;if((X&128|0)!=0){c[K>>2]=L+1|128}Q=d[I+L+104|0]|0;break l}}while(0);Q=M>>>8}}while(0);K=c[r>>2]|0;I=207}else if((I|0)==226){I=0;c[r>>2]=K;K=M&2047;m:do{if((M&57344|0)==0){Q=d[x+(K+336)|0]|0}else{L=c[y>>2]|0;if(M>>>0>32767){Q=d[(c[L+(M>>>11<<2)>>2]|0)+K|0]|0;break}if(M>>>0>24575){Q=d[x+(M&8191)+5576|0]|0;break}if((M|0)==18432){I=231}else if((M|0)==16405){Q=fh(z,(c[L+132>>2]|0)+(c[L+136>>2]|0)|0)|0;break}do{if((I|0)==231){I=c[A>>2]|0;if((I|0)==0){break}K=I+100|0;X=c[K>>2]|0;L=X&127;if((X&128|0)!=0){c[K>>2]=L+1|128}Q=d[I+L+104|0]|0;break m}}while(0);Q=M>>>8}}while(0);K=c[r>>2]|0;I=237}else if((I|0)==245){I=0;c[r>>2]=K;L=M&2047;n:do{if((M&57344|0)==0){Q=d[x+(L+336)|0]|0}else{K=c[y>>2]|0;if(M>>>0>32767){Q=d[(c[K+(M>>>11<<2)>>2]|0)+L|0]|0;break}if(M>>>0>24575){Q=d[x+(M&8191)+5576|0]|0;break}if((M|0)==18432){I=250}else if((M|0)==16405){Q=fh(z,(c[K+132>>2]|0)+(c[K+136>>2]|0)|0)|0;break}do{if((I|0)==250){I=0;K=c[A>>2]|0;if((K|0)==0){break}L=K+100|0;X=c[L>>2]|0;M=X&127;if((X&128|0)!=0){c[L>>2]=M+1|128}Q=d[K+M+104|0]|0;break n}}while(0);Q=M>>>8}}while(0);K=c[r>>2]|0}else if((I|0)==288){I=0;gh(x,N,M&255);T=D;U=E;V=G;W=H;X=F;J=K;L=L+3|0;Q=c[r>>2]|0;D=T;E=U;G=V;H=W;F=X;continue}else if((I|0)==304){I=0;a[f+Q|0]=M;T=D;U=E;V=G;W=H;Q=K;X=F;J=N;L=L+2|0;D=T;E=U;G=V;H=W;F=X;continue}if((I|0)==35){I=0;M=F-Q|0;T=D;U=E;V=G;W=H;X=F;J=~M;M=M&255;L=N+1|0;Q=K;D=T;E=U;G=V;H=W;F=X;continue}else if((I|0)==169){I=0;M=Q&F;T=D;U=E;V=G;W=H;X=J;F=M;L=N+1|0;Q=K;D=T;E=U;G=V;H=W;J=X;continue}else if((I|0)==188){I=0;M=Q^F;T=D;U=E;V=G;W=H;X=J;F=M;L=N+1|0;Q=K;D=T;E=U;G=V;H=W;J=X;continue}else if((I|0)==207){I=0;M=Q|F;T=D;U=E;V=G;W=H;X=J;F=M;L=N+1|0;Q=K;D=T;E=U;G=V;H=W;J=X;continue}else if((I|0)==237){I=0;Q=Q^255}M=J>>>8&1;U=((F^128)+M+(Q<<24>>24)|0)>>>2&64|G&-65;M=F+M+Q|0;V=D;W=E;X=H;F=M&255;J=M;L=N+1|0;Q=K;G=U;D=V;E=W;H=X}if((I|0)==360){c[r>>2]=K;b[q>>1]=L;a[u]=H+255;a[v]=F;a[t]=E;a[s]=D;f=G&76|(M>>>8|M)&128|J>>>8&1;a[h]=(M&255|0)==0?f|2:f;Nl(p|0,o|0,140)|0;c[g>>2]=n;i=j;return(K|0)<0|0}return 0}function kh(a){a=a|0;var d=0,e=0;d=i;c[a+48>>2]=0;c[a+28>>2]=0;c[a+36>>2]=0;c[a+44>>2]=0;e=a+0|0;a=e+24|0;do{b[e>>1]=0;e=e+2|0}while((e|0)<(a|0));i=d;return}function lh(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;h=i;n=f+48|0;if((c[n>>2]|0)>(g|0)){za(46032,46056,43,46096)}m=f+7|0;k=g+ -1|0;l=f+56|0;j=0;do{s=d[f+(j+8)|0]|0;o=c[f+(j<<3)+24>>2]|0;if((o|0)!=0){r=d[46016+(s&15)|0]|0;q=(d[m]|0)>>>j;c[o+40>>2]=1;p=j<<1;p=d[f+(p|1)|0]<<12&61440|d[f+p|0]<<4;if(p>>>0<50){p=(p|0)==0?16:p;r=0}else{r=(q&1|s&16|0)==0?r:0}s=f+j+14|0;w=(a[s]|0)!=0?r:0;q=f+(j<<3)+28|0;t=c[q>>2]|0;if((w|0)!=(t|0)){c[q>>2]=w;y=_(c[o>>2]|0,c[n>>2]|0)|0;Sb(l,y+(c[o+4>>2]|0)|0,w-t|0,o)}t=f+(j<<1)+18|0;y=(e[t>>1]|0)+(c[n>>2]|0)|0;do{if((y|0)<(g|0)){if((r|0)==0){x=((k+p-y|0)>>>0)/(p>>>0)|0;a[s]=d[s]^x&1;y=(_(x,p)|0)+y|0;break}u=o;v=o+4|0;w=(w<<1)-r|0;while(1){x=0-w|0;z=_(c[u>>2]|0,y)|0;Sb(l,z+(c[v>>2]|0)|0,x,o);y=y+p|0;if((y|0)<(g|0)){w=x}else{break}}c[q>>2]=r-w>>1;a[s]=w>>>31}}while(0);b[t>>1]=y-g}j=j+1|0;}while((j|0)!=3);c[n>>2]=g;i=h;return}function mh(a){a=a|0;var d=0,e=0,f=0;e=i;d=a+232|0;Cc(d,a+272|0,12);f=0;while(1){if(!(f>>>0<8)){f=3;break}c[a+(f*12|0)+4>>2]=0;f=f+1|0;if((f|0)>=8){f=5;break}}if((f|0)==3){za(46336,46368,92,46408)}else if((f|0)==5){Fc(d,.0008333333333333334);c[a>>2]=0;f=a+8|0;d=f;b[d>>1]=0;b[d+2>>1]=0>>>16;f=f+4|0;b[f>>1]=0;b[f+2>>1]=0>>>16;f=a+20|0;d=f;b[d>>1]=0;b[d+2>>1]=0>>>16;f=f+4|0;b[f>>1]=0;b[f+2>>1]=0>>>16;f=a+32|0;d=f;b[d>>1]=0;b[d+2>>1]=0>>>16;f=f+4|0;b[f>>1]=0;b[f+2>>1]=0>>>16;f=a+44|0;d=f;b[d>>1]=0;b[d+2>>1]=0>>>16;f=f+4|0;b[f>>1]=0;b[f+2>>1]=0>>>16;f=a+56|0;d=f;b[d>>1]=0;b[d+2>>1]=0>>>16;f=f+4|0;b[f>>1]=0;b[f+2>>1]=0>>>16;f=a+68|0;d=f;b[d>>1]=0;b[d+2>>1]=0>>>16;f=f+4|0;b[f>>1]=0;b[f+2>>1]=0>>>16;f=a+80|0;d=f;b[d>>1]=0;b[d+2>>1]=0>>>16;f=f+4|0;b[f>>1]=0;b[f+2>>1]=0>>>16;Pl(a+92|0,0,140)|0;i=e;return}}function nh(a){a=a|0;var d=0,e=0,f=0;d=i;c[a>>2]=0;e=a+8|0;f=e;b[f>>1]=0;b[f+2>>1]=0>>>16;e=e+4|0;b[e>>1]=0;b[e+2>>1]=0>>>16;e=a+20|0;f=e;b[f>>1]=0;b[f+2>>1]=0>>>16;e=e+4|0;b[e>>1]=0;b[e+2>>1]=0>>>16;e=a+32|0;f=e;b[f>>1]=0;b[f+2>>1]=0>>>16;e=e+4|0;b[e>>1]=0;b[e+2>>1]=0>>>16;e=a+44|0;f=e;b[f>>1]=0;b[f+2>>1]=0>>>16;e=e+4|0;b[e>>1]=0;b[e+2>>1]=0>>>16;e=a+56|0;f=e;b[f>>1]=0;b[f+2>>1]=0>>>16;e=e+4|0;b[e>>1]=0;b[e+2>>1]=0>>>16;e=a+68|0;f=e;b[f>>1]=0;b[f+2>>1]=0>>>16;e=e+4|0;b[e>>1]=0;b[e+2>>1]=0>>>16;e=a+80|0;f=e;b[f>>1]=0;b[f+2>>1]=0>>>16;e=e+4|0;b[e>>1]=0;b[e+2>>1]=0>>>16;Pl(a+92|0,0,140)|0;i=d;return}function oh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;e=i;d=a+96|0;f=c[d>>2]|0;if((f|0)<(b|0)){ph(a,b);f=c[d>>2]|0}if((f|0)<(b|0)){za(46112,46136,72,46184)}else{c[d>>2]=f-b;i=e;return}}function ph(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;g=i;o=(d[e+231|0]|0)>>>4&7;j=o+1|0;l=e+96|0;k=j<<6;h=e+232|0;o=o^7;do{p=c[e+(o*12|0)+4>>2]|0;do{if((p|0)!=0){c[p+40>>2]=1;t=c[p>>2]|0;x=_(t,c[l>>2]|0)|0;m=c[p+4>>2]|0;n=e+(o*12|0)|0;x=x+m+(c[n>>2]|0)|0;m=(_(t,f)|0)+m|0;c[n>>2]=0;if(x>>>0<m>>>0){v=o<<3;s=d[e+(v+68)+104|0]|0;if((s&224|0)==0){break}q=a[e+(v+71)+104|0]&15;if((q|0)==0){break}r=d[e+(v+66)+104|0]<<8|s<<16&196608|d[e+(v+64)+104|0];if((r|0)<(k|0)){break}r=_(((t*983040|0)>>>0)/(r>>>0)|0,j)|0;u=32-(s&28)|0;t=e+(o*12|0)+8|0;s=e+(o*12|0)+10|0;v=e+(v+70)+104|0;w=b[t>>1]|0;y=b[s>>1]|0;do{z=(d[v]|0)+y|0;y=y+1|0;z=_((d[e+(z>>1)+104|0]|0)>>>(z<<2&4)&15,q)|0;if((z|0)!=(w|0)){qh(h,x,z-w|0,p);w=z}x=x+r|0;y=(y|0)<(u|0)?y:0;}while(x>>>0<m>>>0);b[s>>1]=y;b[t>>1]=w}c[n>>2]=x-m}}while(0);o=o+1|0;}while((o|0)!=8);c[l>>2]=f;i=g;return}function qh(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=d>>>16;if((g|0)<(c[f+12>>2]|0)){j=_(c[a+8>>2]|0,e)|0;e=c[f+8>>2]|0;f=d>>>10&63;k=64-f|0;m=_(b[a+(k<<1)+40>>1]|0,j)|0;l=e+(g+2<<2)|0;d=_(b[a+(k+64<<1)+40>>1]|0,j)|0;h=e+(g+3<<2)|0;d=d+(c[h>>2]|0)|0;n=b[a+((k|128)<<1)+40>>1]|0;c[l>>2]=m+(c[l>>2]|0);c[h>>2]=d;n=_(n,j)|0;h=e+(g+4<<2)|0;d=_(b[a+(k+192<<1)+40>>1]|0,j)|0;l=e+(g+5<<2)|0;d=d+(c[l>>2]|0)|0;m=b[a+((k|256)<<1)+40>>1]|0;c[h>>2]=n+(c[h>>2]|0);c[l>>2]=d;m=_(m,j)|0;l=e+(g+6<<2)|0;k=_(b[a+(k+320<<1)+40>>1]|0,j)|0;d=e+(g+7<<2)|0;k=k+(c[d>>2]|0)|0;h=b[a+((f|320)<<1)+40>>1]|0;c[l>>2]=m+(c[l>>2]|0);c[d>>2]=k;h=_(h,j)|0;d=e+(g+8<<2)|0;k=_(b[a+((f|256)<<1)+40>>1]|0,j)|0;l=e+(g+9<<2)|0;k=k+(c[l>>2]|0)|0;m=b[a+((f|192)<<1)+40>>1]|0;c[d>>2]=h+(c[d>>2]|0);c[l>>2]=k;m=_(m,j)|0;l=e+(g+10<<2)|0;k=_(b[a+((f|128)<<1)+40>>1]|0,j)|0;d=e+(g+11<<2)|0;k=k+(c[d>>2]|0)|0;h=b[a+((f|64)<<1)+40>>1]|0;c[l>>2]=m+(c[l>>2]|0);c[d>>2]=k;h=_(h,j)|0;d=e+(g+12<<2)|0;f=_(b[a+(f<<1)+40>>1]|0,j)|0;e=e+(g+13<<2)|0;f=f+(c[e>>2]|0)|0;c[d>>2]=h+(c[d>>2]|0);c[e>>2]=f;i=i;return}else{za(46200,46272,342,46312)}}function rh(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;e=i;g=a+12|0;f=c[g>>2]|0;do{if((f|0)!=0){if(((d[a]|0)&b|0)!=0){break}c[g>>2]=f+ -1}}while(0);i=e;return}function sh(b){b=b|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=d[b]|0;g=f&15;h=b+7|0;if((a[h]|0)!=0){a[h]=0;c[b+28>>2]=g;c[b+24>>2]=15;i=e;return}h=b+28|0;j=c[h>>2]|0;c[h>>2]=j+ -1;if((j|0)>=1){i=e;return}c[h>>2]=g;g=b+24|0;b=c[g>>2]|0;if((f&32|b|0)==0){i=e;return}c[g>>2]=b+15&15;i=e;return}function th(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;h=d[b+1|0]|0;f=b+36|0;n=c[f>>2]|0;c[f>>2]=n+ -1;j=b+5|0;do{if((n|0)<1){a[j]=1;j=b+3|0;l=d[j]|0;k=b+2|0;m=l<<8&1792|d[k];n=h&7;if(!((h&128|0)!=0&(n|0)!=0&m>>>0>7)){break}n=m>>>n;e=((h&8|0)==0?n:e-n|0)+m|0;if((e|0)>=2048){break}a[k]=e;a[j]=l&248|e>>>8&7}else{if((a[j]|0)!=0){break}i=g;return}}while(0);a[b+5|0]=0;c[f>>2]=h>>>4&7;i=g;return}function uh(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;l=(d[a+3|0]|0)<<8&1792|(d[a+2|0]|0);k=l<<1;g=k+2|0;o=a+8|0;n=c[o>>2]|0;if((n|0)==0){h=a+16|0;l=(c[h>>2]|0)+b|0;j=e-l|0;if((j|0)>0){s=(j+(k|1)|0)/(g|0)|0;r=a+32|0;c[r>>2]=(c[r>>2]|0)+s&7;l=(_(s,g)|0)+l|0}c[h>>2]=l-e;i=f;return}c[n+40>>2]=1;j=d[a+1|0]|0;m=(j&8|0)!=0?0:l>>>(j&7);do{if((c[a+12>>2]|0)==0){h=11}else{p=d[a]|0;if((p&16|0)==0){j=c[a+24>>2]|0}else{j=p&15}if((j|0)==0|l>>>0<8){h=11;break}if((m+l|0)>2047){h=11;break}k=p>>>6;m=(k|0)==3;l=m?2:1<<k;k=a+32|0;q=((c[k>>2]|0)<(l|0)?j:0)^(m?j:0);m=a+20|0;p=c[m>>2]|0;c[m>>2]=q;if((q|0)!=(p|0)){s=_(c[n>>2]|0,b)|0;Sb(c[a+40>>2]|0,s+(c[n+4>>2]|0)|0,q-p|0,n)}r=(c[a+16>>2]|0)+b|0;if((r|0)>=(e|0)){break}b=c[o>>2]|0;n=c[a+40>>2]|0;p=b;o=b+4|0;s=(q<<1)-j|0;q=c[k>>2]|0;do{q=q+1&7;if((q|0)==0|(q|0)==(l|0)){s=0-s|0;t=_(c[p>>2]|0,r)|0;Sb(n,t+(c[o>>2]|0)|0,s,b)}r=r+g|0;}while((r|0)<(e|0));c[m>>2]=s+j>>1;c[k>>2]=q}}while(0);do{if((h|0)==11){h=a+20|0;j=c[h>>2]|0;if((j|0)!=0){t=_(c[n>>2]|0,b)|0;Sb(c[a+40>>2]|0,t+(c[n+4>>2]|0)|0,0-j|0,n);c[h>>2]=0}r=(c[a+16>>2]|0)+b|0;h=e-r|0;if((h|0)<=0){break}t=(h+(k|1)|0)/(g|0)|0;s=a+32|0;c[s>>2]=(c[s>>2]|0)+t&7;r=(_(t,g)|0)+r|0}}while(0);c[a+16>>2]=r-e;i=f;return}function vh(b){b=b|0;var d=0,e=0,f=0,g=0;d=i;e=b+7|0;do{if((a[e]|0)==0){g=b+28|0;f=c[g>>2]|0;if((f|0)==0){break}c[g>>2]=f+ -1}else{c[b+28>>2]=a[b]&127}}while(0);if((a[b]|0)<0){i=d;return}a[e]=0;i=d;return}function wh(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;h=(d[a+3|0]|0)<<8&1792|(d[a+2|0]|0);g=h+1|0;l=a+8|0;k=c[l>>2]|0;if((k|0)==0){j=a+16|0;k=(c[j>>2]|0)+b|0;c[j>>2]=0;if((c[a+12>>2]|0)==0){i=f;return}if(!((c[a+28>>2]|0)!=0&h>>>0>1)){i=f;return}l=e-k|0;if((l|0)>0){p=(l+h|0)/(g|0)|0;o=a+24|0;c[o>>2]=(1-p+(c[o>>2]|0)&31)+1;k=(_(p,g)|0)+k|0}c[j>>2]=k-e;i=f;return}c[k+40>>2]=1;h=a+24|0;j=c[h>>2]|0;m=16-j|0;n=(m|0)<0?j+ -17|0:m;j=a+20|0;m=c[j>>2]|0;c[j>>2]=n;if((n|0)!=(m|0)){p=_(c[k>>2]|0,b)|0;Zd(a+32|0,p+(c[k+4>>2]|0)|0,n-m|0,k)}k=a+16|0;n=(c[k>>2]|0)+b|0;do{if((c[a+12>>2]|0)==0){n=e}else{if((c[a+28>>2]|0)==0|g>>>0<3){n=e;break}if((n|0)>=(e|0)){break}l=c[l>>2]|0;p=c[h>>2]|0;o=(p|0)>16;m=a+32|0;a=l;b=l+4|0;p=o?p+ -16|0:p;o=o?-1:1;do{p=p+ -1|0;if((p|0)==0){p=16;o=0-o|0}else{q=_(c[a>>2]|0,n)|0;Zd(m,q+(c[b>>2]|0)|0,o,l)}n=n+g|0;}while((n|0)<(e|0));g=(o|0)<0?p+16|0:p;c[h>>2]=g;h=16-g|0;c[j>>2]=(h|0)<0?g+ -17|0:h}}while(0);c[k>>2]=n-e;i=f;return}function xh(b){b=b|0;c[b+24>>2]=0;c[b+48>>2]=0;c[b+32>>2]=0;c[b+36>>2]=1;c[b+40>>2]=0;a[b+44|0]=0;a[b+45|0]=1;c[b+52>>2]=1073741824;a[b+57|0]=0;a[b+56|0]=0;c[b+16>>2]=0;c[b+20>>2]=0;c[b+28>>2]=428;i=i;return}function yh(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0;h=i;if((f|0)==1){j=e+48|0;f=c[j>>2]|0;g=g&127;c[j>>2]=g;if((a[e+59|0]|0)!=0){i=h;return}c[e+20>>2]=(d[46488+f|0]|0)+g-(d[46488+g|0]|0);i=h;return}else if((f|0)==0){f=b[46424+(d[e+58|0]<<5)+((g&15)<<1)>>1]|0;c[e+28>>2]=f;j=(g&192|0)==128;a[e+56|0]=j&1;g=e+57|0;a[g]=d[g]&(j&1);do{if(j){g=c[e+12>>2]|0;if((g|0)==0){f=1073741824;break}f=(c[(c[e+68>>2]|0)+1948>>2]|0)+1+(c[e+16>>2]|0)+(_((g<<3)+ -9+(c[e+36>>2]|0)|0,f)|0)|0}else{f=1073741824}}while(0);g=e+52|0;if((f|0)==(c[g>>2]|0)){i=h;return}c[g>>2]=f;ch(c[e+68>>2]|0);i=h;return}else{i=h;return}}function zh(b){b=b|0;var e=0,f=0,g=0;e=i;c[b+24>>2]=d[b+2|0]<<6|16384;f=b+12|0;c[f>>2]=d[b+3|0]<<4|1;Ah(b);do{if((a[b+56|0]|0)==0){g=1073741824}else{f=c[f>>2]|0;if((f|0)==0){g=1073741824;break}g=(c[(c[b+68>>2]|0)+1948>>2]|0)+1+(c[b+16>>2]|0)+(_((f<<3)+ -9+(c[b+36>>2]|0)|0,c[b+28>>2]|0)|0)|0}}while(0);f=b+52|0;if((g|0)==(c[f>>2]|0)){i=e;return}c[f>>2]=g;ch(c[b+68>>2]|0);i=e;return}function Ah(b){b=b|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=b+44|0;if((a[f]|0)!=0){i=e;return}g=b+12|0;if((c[g>>2]|0)==0){i=e;return}h=c[b+60>>2]|0;if((h|0)==0){za(46616,46632,380,46672)}j=b+24|0;c[b+32>>2]=ob[h&63](c[b+64>>2]|0,(c[j>>2]|0)+32768|0)|0;c[j>>2]=(c[j>>2]|0)+1&32767;a[f]=1;h=(c[g>>2]|0)+ -1|0;c[g>>2]=h;if((h|0)!=0){i=e;return}if((a[b]&64)==0){j=c[b+68>>2]|0;h=j+1972|0;c[h>>2]=c[h>>2]&-17;a[b+57|0]=a[b+56|0]|0;c[b+52>>2]=1073741824;ch(j);i=e;return}else{c[j>>2]=d[b+2|0]<<6|16384;c[g>>2]=d[b+3|0]<<4|1;i=e;return}}function Bh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;h=b+48|0;j=c[h>>2]|0;g=b+20|0;l=c[g>>2]|0;o=j-l|0;c[g>>2]=j;n=b+8|0;m=c[n>>2]|0;do{if((m|0)==0){a[b+45|0]=1}else{c[m+40>>2]=1;if((j|0)==(l|0)){break}y=_(c[m>>2]|0,d)|0;Zd(b+72|0,y+(c[m+4>>2]|0)|0,o,m)}}while(0);j=b+16|0;t=(c[j>>2]|0)+d|0;if((t|0)>=(e|0)){y=t;y=y-e|0;c[j>>2]=y;i=f;return}d=b+36|0;u=c[d>>2]|0;l=b+45|0;w=a[l]|0;m=b+44|0;do{if(w<<24>>24==0){k=9}else{if((a[m]|0)!=0){k=9;break}x=c[b+28>>2]|0;y=(e+ -1-t+x|0)/(x|0)|0;t=(_(y,x)|0)+t|0;u=((u+7-((y|0)%8|0)|0)%8|0)+1|0}}while(0);if((k|0)==9){s=c[n>>2]|0;o=c[b+28>>2]|0;k=b+40|0;x=c[k>>2]|0;v=c[h>>2]|0;p=b+72|0;n=s;r=s+4|0;q=b+32|0;a:do{if((s|0)==0){while(1){do{if(w<<24>>24==0){s=(x<<2&4)+ -2|0;x=x>>1;w=s+v|0;if(!(w>>>0<128)){break}v=_(c[n>>2]|0,t)|0;Zd(p,v+(c[r>>2]|0)|0,s,0);v=w}}while(0);t=t+o|0;u=u+ -1|0;do{if((u|0)==0){if((a[m]|0)==0){a[l]=1;u=8;break}else{x=c[q>>2]|0;a[m]=0;a[l]=1;Ah(b);u=8;break}}}while(0);if((t|0)>=(e|0)){break a}w=a[l]|0}}else{while(1){do{if(w<<24>>24==0){y=(x<<2&4)+ -2|0;x=x>>1;w=y+v|0;if(!(w>>>0<128)){break}v=_(c[n>>2]|0,t)|0;Zd(p,v+(c[r>>2]|0)|0,y,s);v=w}}while(0);t=t+o|0;u=u+ -1|0;do{if((u|0)==0){if((a[m]|0)==0){a[l]=1;u=8;break}else{a[l]=0;x=c[q>>2]|0;a[m]=0;Ah(b);u=8;break}}}while(0);if((t|0)>=(e|0)){break a}w=a[l]|0}}}while(0);c[h>>2]=v;c[g>>2]=v;c[k>>2]=x}c[d>>2]=u;y=t;y=y-e|0;c[j>>2]=y;i=f;return}function Ch(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;p=e+2|0;k=b[46688+((a[p]&15)<<1)>>1]|0;o=e+8|0;n=c[o>>2]|0;if((n|0)==0){u=e+16|0;s=(c[u>>2]|0)+f|0;t=g+ -1+k-s|0;c[u>>2]=s-(((t|0)%(k|0)|0)+g)+t;i=h;return}c[n+40>>2]=1;do{if((c[e+12>>2]|0)==0){m=0}else{j=d[e]|0;if((j&16|0)==0){m=c[e+24>>2]|0;break}else{m=j&15;break}}}while(0);j=e+32|0;q=(c[j>>2]&1|0)!=0?m:0;l=e+20|0;r=c[l>>2]|0;c[l>>2]=q;if((q|0)!=(r|0)){u=_(c[n>>2]|0,f)|0;Zd(e+40|0,u+(c[n+4>>2]|0)|0,q-r|0,n)}n=e+16|0;s=(c[n>>2]|0)+f|0;do{if((s|0)<(g|0)){if((m|0)==0){u=g+ -1+k-s|0;s=u-((u|0)%(k|0)|0)+s|0;if((a[p]|0)<0){break}u=c[j>>2]|0;c[j>>2]=(u<<13^u<<14)&16384|u>>1;break}f=c[o>>2]|0;r=c[f>>2]|0;o=_(r,k)|0;r=_(r,s)|0;p=(a[p]|0)<0?8:13;e=e+40|0;u=s;t=(q<<1)-m|0;s=c[j>>2]|0;q=r+(c[f+4>>2]|0)|0;while(1){r=u+k|0;if((s+1&2|0)!=0){t=0-t|0;Zd(e,q,t,f)}s=(s<<p^s<<14)&16384|s>>1;if((r|0)<(g|0)){q=q+o|0;u=r}else{break}}c[l>>2]=t+m>>1;c[j>>2]=s;s=r}}while(0);c[n>>2]=s-g;i=h;return}function Dh(d){d=d|0;var e=0,f=0,g=0,h=0;g=i;e=d+80|0;Cc(e,d+120|0,8);f=d+640|0;Cc(f,d+680|0,12);h=0;while(1){if(!(h>>>0<3)){h=3;break}c[d+(h*24|0)+4>>2]=0;h=h+1|0;if((h|0)>=3){h=5;break}}if((h|0)==3){za(46928,46960,78,47e3)}else if((h|0)==5){Fc(e,.006238709677419354);Fc(f,.0064466666666666665);c[d+72>>2]=0;h=d;a[h+0|0]=0;a[h+1|0]=0;a[h+2|0]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=1;c[d+32>>2]=0;c[d+36>>2]=0;h=d+40|0;f=d+20|0;c[f+0>>2]=0;b[f+4>>1]=0;a[f+6|0]=0;c[h>>2]=1;c[d+56>>2]=0;c[d+60>>2]=0;h=d+64|0;f=d+44|0;c[f+0>>2]=0;b[f+4>>1]=0;a[f+6|0]=0;c[h>>2]=1;c[d+68>>2]=0;i=g;return}}function Eh(d){d=d|0;var e=0,f=0,g=0;e=i;c[d+72>>2]=0;f=d;a[f+0|0]=0;a[f+1|0]=0;a[f+2|0]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=1;c[d+32>>2]=0;c[d+36>>2]=0;f=d+40|0;g=d+20|0;c[g+0>>2]=0;b[g+4>>1]=0;a[g+6|0]=0;c[f>>2]=1;c[d+56>>2]=0;c[d+60>>2]=0;f=d+64|0;g=d+44|0;c[g+0>>2]=0;b[g+4>>1]=0;a[g+6|0]=0;c[f>>2]=1;c[d+68>>2]=0;i=e;return}function Fh(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;h=c[e+4>>2]|0;if((h|0)==0){i=g;return}c[h+40>>2]=1;n=d[e]|0;p=e+2|0;m=a[p]|0;k=m<<24>>24<0?n&15:0;j=(n>>>4&7)+1|0;o=(n&128|0)!=0;if(o){l=4}else{if((c[e+16>>2]|0)<(j|0)){l=4}else{q=0}}if((l|0)==4){q=k}l=e+12|0;r=c[l>>2]|0;n=c[b+72>>2]|0;if((q|0)==(r|0)){q=m}else{c[l>>2]=q;s=_(c[h>>2]|0,n)|0;Sb(b+640|0,s+(c[h+4>>2]|0)|0,q-r|0,h);q=a[p]|0}m=e+8|0;p=(c[m>>2]|0)+n|0;c[m>>2]=0;n=((q&255)<<8&3840|(d[e+1|0]|0))+1|0;if(!(n>>>0>4&(((k|0)==0|o)^1))){i=g;return}if((p|0)<(f|0)){e=e+16|0;q=b+640|0;r=h;o=h+4|0;b=0-k|0;s=c[e>>2]|0;do{s=s+1|0;do{if((s|0)==16){c[l>>2]=k;s=_(c[r>>2]|0,p)|0;Sb(q,s+(c[o>>2]|0)|0,k,h);s=0}else{if((s|0)!=(j|0)){break}c[l>>2]=0;s=_(c[r>>2]|0,p)|0;Sb(q,s+(c[o>>2]|0)|0,b,h);s=j}}while(0);p=p+n|0;}while((p|0)<(f|0));c[e>>2]=s}c[m>>2]=p-f;i=g;return}function Gh(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;h=i;m=c[b+52>>2]|0;if((m|0)==0){i=h;return}c[m+40>>2]=1;k=b+68|0;s=c[k>>2]|0;l=a[b+48|0]&63;o=c[b+72>>2]|0;g=b+60|0;r=c[g>>2]|0;n=a[b+50|0]|0;do{if(n<<24>>24<0){if((l|s|0)==0){f=4;break}j=b+56|0;u=(c[j>>2]|0)+o|0;if((u|0)<(e|0)){n=(((n&255)<<8&3840|(d[b+49|0]|0))<<1)+2|0;o=b+64|0;q=b+80|0;b=m;p=m+4|0;t=c[o>>2]|0;do{t=t+ -1|0;v=(t|0)==0;t=v?7:t;s=v?0:s;v=s>>3;if((v|0)!=(r|0)){w=_(c[b>>2]|0,u)|0;Zd(q,w+(c[p>>2]|0)|0,v-r|0,m);r=v}u=n+u|0;s=s+l&255;}while((u|0)<(e|0));c[o>>2]=t;c[k>>2]=s}c[j>>2]=u-e}else{f=4}}while(0);if((f|0)==4){c[b+56>>2]=0;w=s>>3;v=_(c[m>>2]|0,o)|0;Zd(b+80|0,v+(c[m+4>>2]|0)|0,w-r|0,m);r=w}c[g>>2]=r;i=h;return}function Hh(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;h=i;if(!(e>>>0<3)){za(46800,46744,57,46840)}if(!(f>>>0<3)){za(46856,46744,58,46840)}j=b+72|0;if((c[j>>2]|0)>(d|0)){za(46720,46744,48,46784)}else{Fh(b,b,d);Fh(b,b+24|0,d);Gh(b,d);c[j>>2]=d;a[b+(e*24|0)+f|0]=g;i=h;return}}function Ih(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;e=i;d=a+72|0;f=c[d>>2]|0;if((f|0)>=(b|0)){if((f|0)<(b|0)){za(46888,46744,69,46912)}else{b=f-b|0;c[d>>2]=b;i=e;return}}if((f|0)>(b|0)){za(46720,46744,48,46784)}Fh(a,a,b);Fh(a,a+24|0,b);Gh(a,b);c[d>>2]=b;f=b;b=f-b|0;c[d>>2]=b;i=e;return}function Jh(a,b){a=a|0;b=b|0;i=i;return d[(c[(c[a+2392>>2]|0)+(b>>>11<<2)>>2]|0)+(b&2047)|0]|0|0}function Kh(a){a=a|0;var b=0;b=i;c[a+2392>>2]=a+2396;Gc(a);c[a>>2]=47104;c[a+2604>>2]=0;c[a+2608>>2]=0;Yg(a+2640|0);c[a+2632>>2]=0;c[a+2628>>2]=0;c[a+2636>>2]=0;c[a+4>>2]=47200;c[a+284>>2]=6;c[a+4008>>2]=a;c[a+4004>>2]=36;Hg(a,47016);if((c[a+256>>2]|0)==0){h[a+248>>3]=1.4;Pl(a+13768|0,-14,2056)|0;i=b;return}else{za(48368,48384,228,48424)}}function Lh(a){a=a|0;var b=0;b=i;Mh(a);Al(a);i=b;return}function Mh(a){a=a|0;var b=0,d=0,e=0;b=i;c[a>>2]=47104;d=a+2632|0;e=c[d>>2]|0;if((e|0)!=0){Al(e)}c[d>>2]=0;d=a+2628|0;e=c[d>>2]|0;if((e|0)!=0){Al(e)}c[d>>2]=0;d=a+2636|0;e=c[d>>2]|0;if((e|0)!=0){Al(e)}c[d>>2]=0;e=a+2604|0;d=c[e>>2]|0;c[e>>2]=0;c[a+2608>>2]=0;Al(d);Bg(a);Al(c[e>>2]|0);Ic(a);i=b;return}function Nh(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+2632|0;e=c[d>>2]|0;if((e|0)!=0){Al(e)}c[d>>2]=0;d=a+2628|0;e=c[d>>2]|0;if((e|0)!=0){Al(e)}c[d>>2]=0;d=a+2636|0;e=c[d>>2]|0;if((e|0)!=0){Al(e)}c[d>>2]=0;d=a+2604|0;e=c[d>>2]|0;c[d>>2]=0;c[a+2608>>2]=0;Al(e);Bg(a);i=b;return}function Oh(b,c,d){b=b|0;c=c|0;d=d|0;d=i;Me(c+272|0,b+5462|0,32);Me(c+784|0,b+5494|0,32);Me(c+1040|0,b+5526|0,32);if((a[b+5571|0]|0)==0){i=d;return 0}Ne(c+16|0,48360);i=d;return 0}function Ph(b,e){b=b|0;e=+e;var f=0,g=0,j=0.0,k=0,l=0;f=i;k=d[b+5559|0]<<8|d[b+5558|0];l=b+2568|0;h[l>>3]=1789772.72727;g=b+2592|0;c[g>>2]=357366;if((a[b+2576|0]|0)==0){j=1789772.72727;l=k;k=16666}else{c[g>>2]=398964;h[l>>3]=1662607.125;j=1662607.125;l=d[b+5569|0]<<8|d[b+5568|0];k=2e4}l=(l|0)==0?k:l;if(!((l|0)!=(k|0)|e!=1.0)){l=b+2640|0;ah(l,e);i=f;return}c[g>>2]=~~(+(l>>>0)*j/(e*83333.33333333333));l=b+2640|0;ah(l,e);i=f;return}function Qh(b){b=b|0;var d=0.0,e=0,f=0,g=0,j=0,k=0.0,l=0,m=0;e=i;j=b+5571|0;l=a[j]|0;if(!((l&-50)<<24>>24==0)){c[b+16>>2]=47224}f=b+232|0;c[f>>2]=5;g=b+228|0;c[g>>2]=47272;c[b+332>>2]=47360;k=+h[b+248>>3];if(!((l&49)==0)){c[f>>2]=8}do{if(!((l&16)==0)){l=zl(1048)|0;if((l|0)!=0){mh(l);c[b+2628>>2]=l;c[f>>2]=13;c[g>>2]=47440;l=a[j]|0;k=k*.75;break}c[b+2628>>2]=0;m=47424;i=e;return m|0}}while(0);do{if(!((l&1)==0)){l=zl(1456)|0;if((l|0)==0){c[b+2632>>2]=0;m=47424;i=e;return m|0}else{Dh(l);c[b+2632>>2]=l;k=k*.75;c[f>>2]=8;c[g>>2]=47560;l=a[j]|0;if((l&16)==0){break}c[f>>2]=16;c[g>>2]=47640;break}}}while(0);do{if((l&32)==0){d=k}else{m=zl(872)|0;if((m|0)==0){c[b+2636>>2]=0;m=47424;i=e;return m|0}j=m;l=m+56|0;Cc(l,m+96|0,12);m=0;while(1){if(!(m>>>0<3)){m=19;break}c[j+(m<<3)+24>>2]=0;m=m+1|0;if((m|0)>=3){m=21;break}}if((m|0)==19){za(48016,47960,77,48088)}else if((m|0)==21){Fc(l,.001979166666666667);kh(j);c[b+2636>>2]=j;c[f>>2]=8;c[g>>2]=47704;d=k*.75;break}}}while(0);f=c[b+2628>>2]|0;if((f|0)!=0){Fc(f+232|0,d*.0125*.06666666666666667)}f=c[b+2632>>2]|0;if((f|0)!=0){Fc(f+80|0,d*.006238709677419354);Fc(f+640|0,d*.0064466666666666665)}f=c[b+2636>>2]|0;if((f|0)!=0){Fc(f+56|0,d*.001979166666666667)}Zg(b+2640|0,d);m=0;i=e;return m|0}function Rh(b,e){b=b|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0;f=i;k=b+5448|0;j=b+2604|0;e=Qc(j,e,128,k,0,4104)|0;if((e|0)!=0){n=e;i=f;return n|0}n=d[b+5454|0]|0;c[b+12>>2]=n;c[b+8>>2]=n;n=(Jl(k,48216,5)|0)==0;k=n?0:c[10038]|0;if((k|0)!=0){n=k;i=f;return n|0}if((a[b+5453|0]|0)!=1){c[b+16>>2]=47752}k=Qh(b)|0;if((k|0)!=0){n=k;i=f;return n|0}k=d[b+5457|0]<<8|d[b+5456|0];n=d[b+5459|0]<<8|d[b+5458|0];m=b+2556|0;c[m>>2]=n;e=d[b+5461|0]<<8|d[b+5460|0];l=b+2560|0;c[l>>2]=e;k=(k|0)==0?32768:k;if((n|0)==0){c[m>>2]=32768;n=32768}if((e|0)==0){c[l>>2]=32768}if(k>>>0<32768|n>>>0<32768){n=b+16|0;b=c[n>>2]|0;c[n>>2]=0;n=(b|0)!=0?b:47776;i=f;return n|0}Rc(j,k&4095,4096);j=(c[b+2624>>2]|0)/4096|0;e=(k+ -32768|0)>>>12;k=0;while(1){l=k-e|0;a[b+k+2548|0]=l>>>0>=j>>>0?0:l&255;l=k+1|0;if((a[b+k+5560|0]|0)!=0){g=15;break}if((l|0)<8){k=l}else{break}}if((g|0)==15){m=b+5560|0;e=m;e=d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24;m=m+4|0;m=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24;n=b+2548|0;l=n;a[l]=e;a[l+1|0]=e>>8;a[l+2|0]=e>>16;a[l+3|0]=e>>24;n=n+4|0;a[n]=m;a[n+1|0]=m>>8;a[n+2|0]=m>>16;a[n+3|0]=m>>24}n=b+5570|0;a[b+2576|0]=(a[n]&3)==1|0;a[n]=0;Jg(b,+h[b+240>>3]);n=Nc(b,~~(+h[b+2568>>3]+.5))|0;i=f;return n|0}function Sh(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;$g(a+2640|0,b);e=c[a+2628>>2]|0;if((e|0)!=0){Ec(e+232|0,b)}e=c[a+2632>>2]|0;if((e|0)!=0){Ec(e+80|0,b);Ec(e+640|0,b)}a=c[a+2636>>2]|0;if((a|0)==0){i=d;return}Ec(a+56|0,b);i=d;return}function Th(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;f=i;if((b|0)<5){if(!(b>>>0<5)){za(48144,48176,143,48088)}c[(c[a+(b<<2)+2640>>2]|0)+8>>2]=d;i=f;return}h=b+ -5|0;e=c[a+2636>>2]|0;g=(h|0)<3;if((e|0)!=0&g){if(!(h>>>0<3)){za(48016,47960,77,48088)}c[e+(h<<3)+24>>2]=d;i=f;return}e=c[a+2632>>2]|0;do{if((e|0)!=0){if(!g){h=b+ -8|0;break}a=b+ -6|0;a=(a|0)<0?2:a;if(!(a>>>0<3)){za(48016,48104,78,48088)}c[e+(a*24|0)+4>>2]=d;i=f;return}}while(0);a=c[a+2628>>2]|0;if(!((a|0)!=0&(h|0)<8)){i=f;return}if(!(h>>>0<8)){za(48016,48048,92,48088)}c[a+(h*12|0)+4>>2]=d;i=f;return}function Uh(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=c[b+2628>>2]|0;do{if((h|0)!=0){if((e|0)==63488){c[h+100>>2]=f;i=g;return}else if((e|0)!=18432){break}b=c[b+2392>>2]|0;ph(h,(c[b+132>>2]|0)+(c[b+136>>2]|0)|0);b=h+100|0;j=c[b>>2]|0;e=j&127;if((j&128|0)!=0){c[b>>2]=e+1|128}a[h+e+104|0]=f;i=g;return}}while(0);do{if(e>>>0>49151){h=c[b+2636>>2]|0;if((h|0)==0){break}j=e&57344;if((j|0)==49152){a[h+17|0]=f;i=g;return}else if((j|0)!=57344){break}b=c[b+2392>>2]|0;e=h+17|0;if((d[e]|0)>13){i=g;return}lh(h,(c[b+136>>2]|0)+(c[b+132>>2]|0)|0);a[h+(d[e]|0)|0]=f;i=g;return}}while(0);j=c[b+2632>>2]|0;if((j|0)==0){i=g;return}h=e&4095;e=e+ -36864|0;if(!(e>>>0<12288&h>>>0<3)){i=g;return}b=c[b+2392>>2]|0;Hh(j,(c[b+132>>2]|0)+(c[b+136>>2]|0)|0,e>>>12,h,f);i=g;return}function Vh(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;h=Oc(e,f)|0;if((h|0)!=0){k=h;i=g;return k|0}j=e+336|0;h=j;Pl(j|0,0,2048)|0;j=e+5576|0;Pl(j|0,0,8192)|0;ih(h,e+13768|0);hh(h,24576,8192,j,0);gh(e,24568,d[e+2548|0]|0);gh(e,24569,d[e+2549|0]|0);gh(e,24570,d[e+2550|0]|0);gh(e,24571,d[e+2551|0]|0);gh(e,24572,d[e+2552|0]|0);gh(e,24573,d[e+2553|0]|0);gh(e,24574,d[e+2554|0]|0);gh(e,24575,d[e+2555|0]|0);j=e+2640|0;h=e+2576|0;k=e+5570|0;_g(j,(a[h]|0)!=0,(a[k]&32)!=0?63:0);bh(j,0,16405,15);bh(j,0,16407,(a[k]&16)!=0?128:0);j=c[e+2628>>2]|0;if((j|0)!=0){nh(j)}j=c[e+2632>>2]|0;if((j|0)!=0){Eh(j)}j=c[e+2636>>2]|0;if((j|0)!=0){kh(j)}c[e+2600>>2]=4;c[e+2596>>2]=0;c[e+2588>>2]=(c[e+2592>>2]|0)/12|0;b[e+2578>>1]=24568;a[e+847|0]=95;a[e+846|0]=-9;a[e+2390|0]=-3;b[e+2384>>1]=c[e+2556>>2];a[e+2386|0]=f;a[e+2387|0]=a[h]|0;k=0;i=g;return k|0}function Wh(d,f,g){d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;g=i;j=d+336|0;h=d+2392|0;v=c[h>>2]|0;y=c[v+132>>2]|0;w=0-y|0;c[v+136>>2]=w;z=c[f>>2]|0;a:do{if((z|0)>0){k=d+2588|0;q=d+2384|0;s=q;t=d+2600|0;r=d+2578|0;o=r;p=d+16|0;n=d+2592|0;m=d+2596|0;l=d+2560|0;u=d+2390|0;v=32767;while(1){w=c[k>>2]|0;w=(w|0)<(z|0)?w:z;v=(w|0)<(v|0)?w:v;do{if(jh(j,v)|0){w=b[s>>1]|0;if(!(w<<16>>16==24568)){c[p>>2]=47824;b[s>>1]=w+1<<16>>16;break}c[t>>2]=1;if((b[o>>1]|0)==24568){z=c[h>>2]|0;c[z+136>>2]=v-(c[z+132>>2]|0);break}else{y=r;w=y;w=e[w>>1]|e[w+2>>1]<<16;y=y+4|0;y=e[y>>1]|e[y+2>>1]<<16;z=q;x=z;b[x>>1]=w;b[x+2>>1]=w>>>16;z=z+4|0;b[z>>1]=y;b[z+2>>1]=y>>>16;b[o>>1]=24568;break}}}while(0);v=c[h>>2]|0;w=c[k>>2]|0;do{if(((c[v+132>>2]|0)+(c[v+136>>2]|0)|0)>=(w|0)){y=c[n>>2]|0;z=((c[m>>2]|0)+y|0)/12|0;c[m>>2]=(_(z,-12)|0)+y;c[k>>2]=w+z;w=c[t>>2]|0;if((w|0)==0){break}z=w+ -1|0;c[t>>2]=z;if((z|0)!=0){break}if((b[s>>1]|0)!=24568){y=q;w=y;w=e[w>>1]|e[w+2>>1]<<16;y=y+4|0;y=e[y>>1]|e[y+2>>1]<<16;z=r;x=z;b[x>>1]=w;b[x+2>>1]=w>>>16;z=z+4|0;b[z>>1]=y;b[z+2>>1]=y>>>16}b[s>>1]=c[l>>2];v=a[u]|0;a[u]=v+ -1<<24>>24;a[d+((v&255|256)+336)|0]=95;v=a[u]|0;a[u]=v+ -1<<24>>24;a[d+((v&255|256)+336)|0]=-9;v=c[h>>2]|0}}while(0);w=c[v+136>>2]|0;y=c[v+132>>2]|0;x=y+w|0;z=c[f>>2]|0;if((x|0)>=(z|0)){break a}v=x+32767|0}}}while(0);h=d+2544|0;if((c[h>>2]|0)!=0){c[h>>2]=0;c[d+16>>2]=47824;y=c[v+132>>2]|0}j=y+w|0;c[f>>2]=j;h=d+2588|0;k=(c[h>>2]|0)-j|0;c[h>>2]=(k|0)<0?0:k;eh(d+2640|0,j);h=c[d+2628>>2]|0;if((h|0)!=0){oh(h,c[f>>2]|0)}h=c[d+2632>>2]|0;if((h|0)!=0){Ih(h,c[f>>2]|0)}d=c[d+2636>>2]|0;if((d|0)==0){i=g;return 0}f=c[f>>2]|0;h=d+48|0;j=c[h>>2]|0;if((j|0)<(f|0)){lh(d,f);j=c[h>>2]|0}if((j|0)<(f|0)){za(47936,47960,115,48e3)}c[h>>2]=j-f;i=g;return 0}function Xh(){var a=0,b=0,d=0;a=i;b=zl(15824)|0;if((b|0)==0){d=0;i=a;return d|0}c[b+2392>>2]=b+2396;Gc(b);c[b>>2]=47104;c[b+2604>>2]=0;c[b+2608>>2]=0;Yg(b+2640|0);c[b+2632>>2]=0;c[b+2628>>2]=0;c[b+2636>>2]=0;c[b+4>>2]=47200;d=b;c[b+284>>2]=6;c[b+4008>>2]=b;c[b+4004>>2]=36;Hg(d,47016);if((c[b+256>>2]|0)!=0){za(48368,48384,228,48424)}h[b+248>>3]=1.4;Pl(b+13768|0,-14,2056)|0;i=a;return d|0}function Yh(){var a=0,b=0,d=0;a=i;b=zl(448)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=48256;c[b+4>>2]=47200;b=d;i=a;return b|0}function Zh(a){a=a|0;var b=0;b=i;Eg(a);i=b;return}function _h(a){a=a|0;var b=0;b=i;Eg(a);Al(a);i=b;return}function $h(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+316|0;e=eb[c[(c[e>>2]|0)+12>>2]&63](e,g,128)|0;if((e|0)!=0){e=(e|0)==37536?c[10038]|0:e;i=f;return e|0}if(!((a[b+439|0]&-50)<<24>>24==0)){c[b+16>>2]=47224}e=d[b+322|0]|0;c[b+12>>2]=e;c[b+8>>2]=e;e=(Jl(g,48216,5)|0)==0;e=e?0:c[10038]|0;i=f;return e|0}function ai(b,c,d){b=b|0;c=c|0;d=d|0;d=i;Me(c+272|0,b+330|0,32);Me(c+784|0,b+362|0,32);Me(c+1040|0,b+394|0,32);if((a[b+439|0]|0)==0){i=d;return 0}Ne(c+16|0,48360);i=d;return 0}function bi(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0;g=i;i=i+80|0;C=g+8|0;J=g+16|0;n=g+32|0;j=g+40|0;k=g+48|0;l=g+64|0;m=e;p=g;o=eb[c[(c[m>>2]|0)+12>>2]&63](e,p,4)|0;if((o|0)!=0){ga=(o|0)==37536?c[10038]|0:o;i=g;return ga|0}if((Jl(p,48440,4)|0)!=0){ga=c[10038]|0;i=g;return ga|0}t=b+1152|0;r=t;u=c[r>>2]|0;c[r>>2]=0;c[b+1156>>2]=0;Al(u);u=b+1160|0;r=u;p=c[r>>2]|0;c[r>>2]=0;c[b+1164>>2]=0;Al(p);p=b+1168|0;r=c[p>>2]|0;c[p>>2]=0;q=b+1172|0;c[q>>2]=0;Al(r);r=b+1176|0;o=c[r>>2]|0;c[r>>2]=0;s=b+1180|0;c[s>>2]=0;Al(o);o=b;x=o+0|0;v=48448|0;w=x+128|0;do{a[x]=a[v]|0;x=x+1|0;v=v+1|0}while((x|0)<(w|0));B=C;z=C+3|0;y=C+2|0;A=C+1|0;v=C+4|0;w=C+7|0;x=C+6|0;C=C+5|0;I=e;E=J+8|0;D=J+9|0;H=J;G=J+6|0;F=b+122|0;_=J+7|0;Z=b+123|0;Y=b+6|0;X=b+1184|0;W=b+7|0;V=b+8|0;K=b+112|0;N=n;O=n+4|0;P=j;Q=j+4|0;S=b+896|0;R=b+1151|0;T=b+640|0;J=b+895|0;L=b+384|0;M=b+639|0;U=b+128|0;aa=b+383|0;b=(f|0)==0;$=k;ba=l;ca=0;while(1){da=eb[c[(c[m>>2]|0)+12>>2]&63](e,B,8)|0;if((da|0)!=0){ca=da;h=34;break}da=(d[y]|0)<<16|(d[z]|0)<<24|(d[A]|0)<<8|(d[B]|0);ea=(d[x]|0)<<16|(d[w]|0)<<24|(d[C]|0)<<8|(d[v]|0);if((ea|0)==1263419714){if((da|0)>8){ca=48576;h=34;break}da=eb[c[(c[m>>2]|0)+12>>2]&63](e,K,da)|0;if((da|0)==0){ga=ca;ca=ga;continue}else{ca=da;h=34;break}}else if((ea|0)==1752462689){c[N>>2]=0;c[O>>2]=0;c[P>>2]=0;c[Q>>2]=0;ea=ci(e,da,n,j)|0;a:do{if((ea|0)==0){da=c[Q>>2]|0;do{if((da|0)>3){h=c[(c[P>>2]|0)+12>>2]|0;a[R]=0;Rl(S|0,h|0,255)|0;h=19}else{if((da|0)>2){h=19;break}if((da|0)>1){h=21;break}if((da|0)<=0){da=1;break a}}}while(0);if((h|0)==19){ga=c[(c[P>>2]|0)+8>>2]|0;a[J]=0;Rl(T|0,ga|0,255)|0;h=21}if((h|0)==21){h=0;ga=c[(c[P>>2]|0)+4>>2]|0;a[M]=0;Rl(L|0,ga|0,255)|0}da=c[c[P>>2]>>2]|0;a[aa]=0;Rl(U|0,da|0,255)|0;da=1}else{da=0;ca=ea}}while(0);Al(c[P>>2]|0);Al(c[N>>2]|0);if(da){continue}else{h=34;break}}else if((ea|0)==1953721456){ea=Bl(c[p>>2]|0,da)|0;if(!((ea|0)!=0|(da|0)==0)){ca=48824;h=34;break}c[p>>2]=ea;c[q>>2]=da;da=eb[c[(c[m>>2]|0)+12>>2]&63](e,ea,da)|0;if((da|0)==0){ga=ca;ca=ga;continue}else{ca=da;h=34;break}}else if((ea|0)==1701669236){ea=(da|0)/4|0;ga=ea<<2;fa=Bl(c[r>>2]|0,ga)|0;if(!((fa|0)!=0|(da+3|0)>>>0<7)){ca=48824;h=34;break}c[r>>2]=fa;c[s>>2]=ea;da=eb[c[(c[m>>2]|0)+12>>2]&63](e,fa,ga)|0;if((da|0)==0){ga=ca;ca=ga;continue}else{ca=da;h=34;break}}else if((ea|0)==1818389620){da=ci(e,da,t,u)|0;if((da|0)==0){ga=ca;ca=ga;continue}else{ca=da;h=34;break}}else if((ea|0)==1096040772){if(b){da=ob[c[(c[I>>2]|0)+20>>2]&63](e,da)|0;if((da|0)==0){ga=ca;ca=ga;continue}else{ca=da;h=34;break}}else{Wc(k,e,da);Zc(l,o,128,$);ea=Le(f,ba)|0;da=(ea|0)==0;ca=da?ca:ea;if(da){continue}else{h=34;break}}}else if((ea|0)==1330007625){if((da|0)<8){ca=48576;h=34;break}a[E]=1;a[D]=0;ea=eb[c[(c[m>>2]|0)+12>>2]&63](e,H,(da|0)<16?da:16)|0;if((ea|0)!=0){ca=ea;h=34;break}if((da|0)>16){da=ob[c[(c[I>>2]|0)+20>>2]&63](e,da+ -16|0)|0;if((da|0)!=0){ca=da;h=34;break}}a[F]=a[G]|0;a[Z]=a[_]|0;ga=a[E]|0;a[Y]=ga;c[X>>2]=ga&255;a[W]=a[D]|0;a[V+0|0]=a[H+0|0]|0;a[V+1|0]=a[H+1|0]|0;a[V+2|0]=a[H+2|0]|0;a[V+3|0]=a[H+3|0]|0;a[V+4|0]=a[H+4|0]|0;a[V+5|0]=a[H+5|0]|0;ga=ca;ca=ga;continue}else if((ea|0)==1145980238){ca=0;h=34;break}else{da=ob[c[(c[I>>2]|0)+20>>2]&63](e,da)|0;if((da|0)==0){ga=ca;ca=ga;continue}else{ca=da;h=34;break}}}if((h|0)==34){i=g;return ca|0}return 0}function ci(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;l=d+1|0;k=e;m=Bl(c[k>>2]|0,l)|0;if(!((m|0)!=0|(l|0)==0)){p=48824;i=g;return p|0}c[k>>2]=m;e=e+4|0;c[e>>2]=l;if((d|0)==-1){za(48752,48768,58,48808)}a[m+d|0]=0;b=eb[c[(c[b>>2]|0)+12>>2]&63](b,m,d)|0;if((b|0)!=0){p=b;i=g;return p|0}b=f;l=Bl(c[b>>2]|0,512)|0;if((l|0)==0){p=48824;i=g;return p|0}c[b>>2]=l;f=f+4|0;c[f>>2]=128;do{if((d|0)>0){m=128;n=0;p=0;a:while(1){if((m|0)<=(n|0)){l=Bl(c[b>>2]|0,n<<3)|0;if(!((l|0)!=0|(n|0)==0)){h=48824;d=23;break}m=n<<1;c[b>>2]=l;c[f>>2]=m}o=c[e>>2]|0;if(o>>>0<p>>>0){d=11;break}l=n+1|0;if(m>>>0<n>>>0){d=13;break}c[(c[b>>2]|0)+(n<<2)>>2]=(c[k>>2]|0)+p;b:do{if((p|0)<(d|0)){while(1){if(o>>>0<p>>>0){d=17;break a}n=p+1|0;if((a[(c[k>>2]|0)+p|0]|0)==0){break b}if((n|0)<(d|0)){p=n}else{p=n;break}}}}while(0);p=p+1|0;if((p|0)<(d|0)){n=l}else{d=20;break}}if((d|0)==11){za(48752,48768,58,48808)}else if((d|0)==13){za(48752,48768,58,48808)}else if((d|0)==17){za(48752,48768,58,48808)}else if((d|0)==20){j=c[b>>2]|0;h=l;break}else if((d|0)==23){i=g;return h|0}}else{j=l;h=0}}while(0);j=Bl(j,h<<2)|0;if(!((j|0)!=0|(h|0)==0)){p=48824;i=g;return p|0}c[b>>2]=j;c[f>>2]=h;p=0;i=g;return p|0}function di(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;do{if((a[b+1188|0]|0)==0){j=c[b+1172>>2]|0;if(!(j>>>0>f>>>0)){h=f;break}if(j>>>0<f>>>0){za(48752,48768,58,48808)}else{h=d[(c[b+1168>>2]|0)+f|0]|0;break}}else{h=f}}while(0);f=c[b+1180>>2]|0;do{if(h>>>0<f>>>0){if(f>>>0<h>>>0){za(48752,48768,58,48808)}f=c[b+1176>>2]|0;f=d[f+(h<<2)+2|0]<<16|d[f+(h<<2)+3|0]<<24|d[f+(h<<2)+1|0]<<8|d[f+(h<<2)|0];if((f|0)<=0){break}c[e+4>>2]=f}}while(0);f=c[b+1164>>2]|0;do{if(h>>>0<f>>>0){if(f>>>0<h>>>0){za(48752,48768,58,48808)}else{Ne(e+528|0,c[(c[b+1160>>2]|0)+(h<<2)>>2]|0);break}}}while(0);Me(e+272|0,b+128|0,256);Me(e+784|0,b+384|0,256);Me(e+1040|0,b+640|0,256);Me(e+1552|0,b+896|0,256);i=g;return 0}function ei(a){a=a|0;var b=0;b=i;c[a>>2]=48600;Al(c[a+17e3>>2]|0);Al(c[a+16992>>2]|0);Al(c[a+16984>>2]|0);Al(c[a+16976>>2]|0);Mh(a);Al(a);i=b;return}function fi(a){a=a|0;var b=0;b=i;c[a>>2]=48600;Al(c[a+17e3>>2]|0);Al(c[a+16992>>2]|0);Al(c[a+16984>>2]|0);Al(c[a+16976>>2]|0);Mh(a);i=b;return}function gi(b){b=b|0;var d=0,e=0,f=0;d=i;if((a[b+17016|0]|0)!=0){Nh(b);i=d;return}e=b+16976|0;f=c[e>>2]|0;c[e>>2]=0;c[b+16980>>2]=0;Al(f);f=b+16984|0;e=c[f>>2]|0;c[f>>2]=0;c[b+16988>>2]=0;Al(e);e=b+16992|0;f=c[e>>2]|0;c[e>>2]=0;c[b+16996>>2]=0;Al(f);f=b+17e3|0;e=c[f>>2]|0;c[f>>2]=0;c[b+17004>>2]=0;Al(e);Nh(b);i=d;return}function hi(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;di(a+15824|0,b,c)|0;i=d;return 0}function ii(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=b+17016|0;if((a[f]|0)!=0){g=Rh(b,d)|0;i=e;return g|0}a[f]=1;d=bi(b+15824|0,d,b)|0;a[f]=0;a[b+17012|0]=0;g=c[b+16996>>2]|0;h=g&255;f=b+15830|0;a[f]=h;if(h<<24>>24==0){g=c[b+17008>>2]|0;a[f]=g}h=g&255;c[b+12>>2]=h;c[b+8>>2]=h;h=d;i=e;return h|0}function ji(b){b=b|0;var d=0;a[b+17012|0]=1;d=c[b+17008>>2]|0;a[b+15830|0]=d;d=d&255;c[b+12>>2]=d;c[b+8>>2]=d;i=i;return}function ki(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=b;do{if((a[b+17012|0]|0)==0){j=c[b+16996>>2]|0;if(!(j>>>0>e>>>0)){h=e;break}if(j>>>0<e>>>0){za(48752,48768,58,48808)}else{h=d[(c[b+16992>>2]|0)+e|0]|0;break}}else{h=e}}while(0);j=Vh(g,h)|0;i=f;return j|0}function li(){var b=0,d=0,e=0;b=i;d=zl(17024)|0;if((d|0)==0){d=0;i=b;return d|0}Kh(d);c[d>>2]=48600;e=d+16976|0;a[d+17012|0]=0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;c[e+28>>2]=0;a[d+17016|0]=0;c[d+4>>2]=48696;i=b;return d|0}function mi(){var b=0,d=0,e=0,f=0;b=i;d=zl(1512)|0;if((d|0)==0){d=0;i=b;return d|0}e=d;Cg(e);c[d>>2]=48864;f=d+1468|0;a[d+1504|0]=0;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[f+20>>2]=0;c[f+24>>2]=0;c[f+28>>2]=0;c[d+4>>2]=48696;d=e;i=b;return d|0}function ni(a){a=a|0;var b=0;b=i;c[a>>2]=48864;Al(c[a+1492>>2]|0);Al(c[a+1484>>2]|0);Al(c[a+1476>>2]|0);Al(c[a+1468>>2]|0);Eg(a);i=b;return}function oi(a){a=a|0;var b=0;b=i;c[a>>2]=48864;Al(c[a+1492>>2]|0);Al(c[a+1484>>2]|0);Al(c[a+1476>>2]|0);Al(c[a+1468>>2]|0);Eg(a);Al(a);i=b;return}function pi(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;d=bi(b+316|0,d,0)|0;if((d|0)!=0){f=d;i=e;return f|0}a[b+1504|0]=0;f=c[b+1488>>2]|0;g=f&255;d=b+322|0;a[d]=g;if(g<<24>>24==0){f=c[b+1500>>2]|0;a[d]=f}g=f&255;c[b+12>>2]=g;c[b+8>>2]=g;g=0;i=e;return g|0}function qi(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;di(a+316|0,b,c)|0;i=d;return 0}function ri(a){a=a|0;var b=0;b=i;Cc(a,a+40|0,12);si(12,2,a+816|0);si(264,64,a+818|0);si(67584,16384,a+882|0);i=b;return}function si(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;f=1;while(1){h=f&1;f=0-h&b^f>>>1;j=f&1;f=0-j&b^f>>>1;k=f&1;f=0-k&b^f>>>1;l=f&1;f=0-l&b^f>>>1;m=f&1;f=0-m&b^f>>>1;n=f&1;f=0-n&b^f>>>1;o=f&1;f=0-o&b^f>>>1;g=f&1;a[d]=g<<7|(o<<6|(n<<5|(m<<4|(l<<3|(k<<2|(j<<1|h))))));c=c+ -1|0;if((c|0)==0){break}else{f=0-g&b^f>>>1;d=d+1|0}}i=e;return}function ti(a){a=a|0;var b=0,d=0;b=i;c[a+80>>2]=0;d=0;while(1){if(!(d>>>0<4)){a=3;break}c[a+(d*20|0)+16>>2]=0;d=d+1|0;if((d|0)>=4){a=5;break}}if((a|0)==3){za(48992,49024,73,49064)}else if((a|0)==5){i=b;return}}function ui(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;c[a+80>>2]=b;b=a+84|0;e=a;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;e=a+20|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;e=a+40|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;a=a+60|0;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[b+0>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;i=d;return}function vi(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;g=i;f=b+100|0;k=c[f>>2]|0;h=(k&1|0)!=0?114:28;j=0;while(1){l=d[b+(j*20|0)|0]|0;m=_(l+1|0,h)|0;do{if((d[48984+j|0]&k|0)!=0){if((j&1|0)==0){m=l+4|0;break}N=j+ -1|0;l=d[b+(N*20|0)|0]|l<<8;if((d[48984+N|0]&k|0)!=0){m=l+7|0;break}m=_(l+1|0,h)|0}}while(0);c[b+(j*20|0)+12>>2]=m;j=j+1|0;if((j|0)==4){break}k=c[f>>2]|0}p=c[b+80>>2]|0;j=(c[f>>2]&128|0)==0;h=j?131071:511;o=j?p+882|0:p+818|0;j=b+96|0;c[j>>2]=(c[j>>2]|0)%(h|0)|0;m=b+84|0;n=p+816|0;l=b+92|0;k=b+88|0;s=c[m>>2]|0;q=0;do{r=b+(q*20|0)+8|0;H=(c[r>>2]|0)+s|0;s=c[b+(q*20|0)+12>>2]|0;t=c[b+(q*20|0)+16>>2]|0;a:do{if((t|0)!=0){c[t+40>>2]=1;z=d[b+(q*20|0)+1|0]|0;E=z<<1&30;u=z&16;do{if((E|0)!=0&(u|0)==0){if((z&160|0)==160&(s|0)<74){break}do{if((d[48968+q|0]&c[f>>2]|0)==0){u=0;F=e}else{F=q+2|0;u=c[b+(F*20|0)+12>>2]|0;F=(c[b+(F*20|0)+8>>2]|0)+(c[m>>2]|0)|0;if((a[b+(q*20|0)+3|0]|0)==0){break}N=b+(q*20|0)+4|0;c[N>>2]=(c[N>>2]|0)-E;E=0-E|0}}while(0);if((H|0)<(e|0)|(F|0)<(e|0)){v=b+(q*20|0)+2|0;if((z&32|0)==0){B=(z&64|0)==0;A=B?h:15;w=B?o:n;x=(s|0)%(A|0)|0;y=A;I=((c[r>>2]|0)+(c[(B?j:l)>>2]|0)|0)%(A|0)|0}else{w=48976;x=1;y=16;I=a[v]&1}y=x-y|0;if((z&128|0)==0){J=((c[k>>2]|0)+(c[r>>2]|0)|0)%31|0;C=(s|0)%31|0;J=377253537<<J&2147483647|377253537>>>(31-J|0)}else{C=0;J=377253537}z=b+(q*20|0)+4|0;B=t;A=t+4|0;D=31-C|0;G=c[z>>2]|0;while(1){K=0-E|0;do{if((F|0)<(H|0)){N=(E|0)<0?E:0;L=N-G|0;if((N|0)==(G|0)){L=G;break}N=_(c[B>>2]|0,F)|0;Sb(p,N+(c[A>>2]|0)|0,L,t);L=G-E+L|0;E=K}else{L=G}}while(0);while(1){if((F|0)>(H|0)){break}else{F=F+u|0}}G=(F|0)<(e|0);K=G?F:e;if((H|0)<(K|0)){do{do{if((J&1|0)!=0){M=E&0-((d[w+(I>>3)|0]|0)>>>(I&7)&1);N=I+y|0;I=(N|0)<0?I+x|0:N;if((M|0)==(L|0)){break}N=_(c[B>>2]|0,H)|0;Sb(p,N+(c[A>>2]|0)|0,M-L|0,t);L=M}}while(0);J=J<<C&2147483647|J>>>D;H=H+s|0;}while((H|0)<(K|0))}if((H|0)<(e|0)){G=L;continue}if(G){G=L}else{break}}a[v]=I;c[z>>2]=L}t=b+(q*20|0)+3|0;a[t]=0;if((E|0)>=0){break a}N=b+(q*20|0)+4|0;c[N>>2]=(c[N>>2]|0)-E;a[t]=1;break a}}while(0);u=E>>>(u>>>4^1);w=b+(q*20|0)+4|0;v=c[w>>2]|0;if((u|0)==(v|0)){break}c[w>>2]=u;N=_(c[t>>2]|0,c[m>>2]|0)|0;Sb(p,N+(c[t+4>>2]|0)|0,u-v|0,t)}}while(0);t=e-H|0;if((t|0)>0){N=(s+ -1+t|0)/(s|0)|0;M=b+(q*20|0)+2|0;a[M]=d[M]^N;H=(_(N,s)|0)+H|0}c[r>>2]=H-e;q=q+1|0;s=c[m>>2]|0;}while((q|0)!=4);N=e-s|0;c[m>>2]=e;c[l>>2]=((c[l>>2]|0)+N|0)%15|0;c[k>>2]=((c[k>>2]|0)+N|0)%31|0;c[j>>2]=(c[j>>2]|0)+N;i=g;return}function wi(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;g=i;vi(b,d);d=e>>>1^26880;if(d>>>0<4){a[(e&1)+(b+(d*20|0))|0]=f;i=g;return}if((e|0)==53769){c[b+8>>2]=0;c[b+28>>2]=0;c[b+48>>2]=0;c[b+68>>2]=0;i=g;return}else if((e|0)==53768){c[b+100>>2]=f;i=g;return}else{i=g;return}}function xi(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=a+84|0;f=c[e>>2]|0;if((f|0)<(b|0)){vi(a,b);f=c[e>>2]|0}c[e>>2]=f-b;i=d;return}function yi(d,e){d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+8|0;g=f;h=d+12|0;c[d+8>>2]=h;c[d+28>>2]=e;a[d+5|0]=4;a[d+6|0]=-1;c[d+16>>2]=0;c[h>>2]=0;e=d+20|0;h=d;b[h+0>>1]=0;b[h+2>>1]=0;a[h+4|0]=0;c[e>>2]=1073741824;c[d+24>>2]=1073741824;c[g>>2]=1;if((a[g]|0)==0){za(49336,49368,62,49408)}else{i=f;return}}function zi(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;j=i;i=i+8|0;h=j;q=h;m=f+24|0;c[m>>2]=g;n=f+20|0;o=c[n>>2]|0;k=f+5|0;if((o|0)<(g|0)){o=(a[k]&4)==0?o:g}else{o=g}g=f+8|0;p=c[g>>2]|0;K=p;w=(c[K>>2]|0)-o|0;c[K>>2]=o;p=p+4|0;c[p>>2]=w+(c[p>>2]|0);p=f+12|0;o=p;w=o;K=c[w+4>>2]|0;t=h;c[t>>2]=c[w>>2];c[t+4>>2]=K;c[g>>2]=q;t=q+4|0;w=c[f+28>>2]|0;s=f;v=f+2|0;u=f+3|0;r=f+4|0;q=f+6|0;D=d[k]|0;I=D<<8;y=f+ -336|0;f=h;z=w+65534|0;x=w+65535|0;A=d[v]|0;F=I;I=(D&2|I)^2;H=e[s>>1]|0;E=(d[q]|0)+1|256;D=D&76;C=d[u]|0;B=d[r]|0;a:while(1){M=(D&4|0)!=0;L=d[w+H|0]|0;J=H+1|0;N=d[49080+L|0]|0;G=N+K|0;if(!((G|0)<0|(G|0)<(N|0))){c[t>>2]=K;if((K|0)<0){R=B;Q=C;P=D;O=E;G=K;J=H;L=I;M=F;N=A;B=R;C=Q;D=P;E=O;K=G;H=J;I=L;F=M;A=N;continue}else{m=0;G=K;l=201;break}}N=a[w+J|0]|0;K=N&255;b:do{switch(L|0){case 88:{if(!M){L=B;M=C;N=D;O=E;K=G;H=J;P=I;Q=F;R=A;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a}D=D&-5;l=189;break};case 120:{if(M){L=B;M=C;N=D;O=E;K=G;H=J;P=I;Q=F;R=A;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a}D=D|4;l=195;break};case 12:{l=197;break};case 252:case 220:case 124:case 92:case 60:case 28:{G=((K+C|0)>>>8)+G|0;l=197;break};case 244:case 226:case 212:case 194:case 137:case 130:case 128:case 100:case 84:case 68:case 52:case 20:case 4:case 116:{l=198;break};case 0:{if(H>>>0>65278){m=0;l=201;break a}H=H+2|0;a[w+(E+ -1|256)|0]=H>>>8;a[w+(E+ -2|256)|0]=H;H=(d[x]|0)<<8|(d[z]|0);E=E+ -3|256;J=D&76|(I>>>8|I)&128|F>>>8&1;a[w+E|0]=((I&255|0)==0?J|2:J)|48;M=D&-13|4;a[k]=M;L=c[f>>2]|0;K=c[m>>2]|0;c[f>>2]=K;N=B;O=C;P=I;Q=F;R=A;K=G+7+L-K|0;D=M;B=N;C=O;I=P;F=Q;A=R;continue a};case 165:{I=d[w+K|0]|0;N=B;O=C;P=D;Q=E;K=G;R=F;A=I;H=H+2|0;B=N;C=O;D=P;E=Q;F=R;continue a};case 250:case 218:case 122:case 90:case 58:case 26:case 234:{L=B;M=C;N=D;O=E;K=G;H=J;P=I;Q=F;R=A;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 217:{F=B;l=22;break};case 213:{K=K+C&255;l=20;break};case 201:{l=25;break};case 149:{K=K+C&255;l=31;break};case 133:{l=31;break};case 168:{B=A;N=C;O=D;P=E;K=G;H=J;I=A;Q=F;R=A;C=N;D=O;E=P;F=Q;A=R;continue a};case 232:{M=C+1|0;N=B;O=D;P=E;K=G;H=J;Q=F;R=A;I=M;C=M&255;B=N;D=O;E=P;F=Q;A=R;continue a};case 209:{l=(d[w+K|0]|0)+B|0;F=((d[w+(K+1&255)|0]|0)<<8)+l|0;G=(l>>>8)+G|0;l=24;break};case 16:{K=N<<24>>24;J=H+2|0;if((I&32896|0)!=0){H=J;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=K+J|0;K=((K+(J&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 197:{l=20;break};case 96:{M=B;N=C;O=D;K=G;P=I;Q=F;R=A;H=(d[w+E|0]|0)+1+((d[w+(E+ -255|256)|0]|0)<<8)|0;E=E+ -254|256;B=M;C=N;D=O;I=P;F=Q;A=R;continue a};case 141:{J=(d[w+(H+2)|0]|0)<<8|K;H=H+3|0;if(!(J>>>0<2048)){l=43;break b}a[w+J|0]=A;L=B;M=C;N=D;O=E;K=G;P=I;Q=F;R=A;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 32:{M=H+2|0;J=(d[w+M|0]|0)<<8|K;a[w+(E+ -1|256)|0]=M>>>8;L=E+ -2|256;a[w+L|0]=M;M=B;N=C;O=D;K=G;P=I;Q=F;R=A;H=J;E=L;B=M;C=N;D=O;I=P;F=Q;A=R;continue a};case 145:{J=(d[w+K|0]|0)+B+((d[w+(K+1&255)|0]|0)<<8)|0;H=H+2|0;l=43;break};case 221:{F=C;l=22;break};case 129:{J=K+C|0;J=(d[w+(J+1&255)|0]|0)<<8|(d[w+(J&255)|0]|0);H=H+2|0;l=43;break};case 161:{A=K+C|0;A=(d[w+(A+1&255)|0]|0)<<8|(d[w+(A&255)|0]|0);H=H+2|0;l=52;break};case 185:{G=((K+B|0)>>>8)+G|0;A=((d[w+(H+2)|0]|0)<<8|K)+B|0;H=H+3|0;I=d[w+A|0]|0;if((A^32768)>>>0<40960){N=B;O=C;P=D;Q=E;R=F;A=I;K=G;B=N;C=O;D=P;E=Q;F=R;continue a}else{l=52}break};case 189:{G=((K+C|0)>>>8)+G|0;A=((d[w+(H+2)|0]|0)<<8|K)+C|0;H=H+3|0;I=d[w+A|0]|0;if((A^32768)>>>0<40960){N=B;O=C;P=D;Q=E;R=F;A=I;K=G;B=N;C=O;D=P;E=Q;F=R;continue a}else{l=52}break};case 80:{K=N<<24>>24;J=H+2|0;if((D&64|0)!=0){H=J;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=K+J|0;K=((K+(J&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 152:{N=B;O=C;P=D;Q=E;K=G;H=J;I=B;R=F;A=B;B=N;C=O;D=P;E=Q;F=R;continue a};case 112:{J=N<<24>>24;K=H+2|0;if((D&64|0)==0){H=K;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=J+K|0;K=((J+(K&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 208:{J=N<<24>>24;K=H+2|0;if((I&255)<<24>>24==0){H=K;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=J+K|0;K=((J+(K&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 205:{l=23;break};case 169:{M=B;N=C;O=D;P=E;Q=G;R=F;A=K;I=K;H=H+2|0;B=M;C=N;D=O;E=P;K=Q;F=R;continue a};case 177:{A=(d[w+K|0]|0)+B|0;G=(A>>>8)+G|0;A=((d[w+(K+1&255)|0]|0)<<8)+A|0;H=H+2|0;I=d[w+A|0]|0;if((A^32768)>>>0<40960){N=B;O=C;P=D;Q=E;R=F;A=I;K=G;B=N;C=O;D=P;E=Q;F=R;continue a}else{l=52}break};case 176:{J=N<<24>>24;K=H+2|0;if((F&256|0)==0){H=K;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=J+K|0;K=((J+(K&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 173:{I=d[y+((d[w+(H+2)|0]|0)<<8|K)+1428|0]|0;N=B;O=C;P=D;Q=E;K=G;R=F;A=I;H=H+3|0;B=N;C=O;D=P;E=Q;F=R;continue a};case 240:{J=N<<24>>24;K=H+2|0;if(!((I&255)<<24>>24==0)){H=K;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=J+K|0;K=((J+(K&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 157:{J=((d[w+(H+2)|0]|0)<<8|K)+C|0;H=H+3|0;if(!(J>>>0<2048)){l=43;break b}a[w+J|0]=A;L=B;M=C;N=D;O=E;K=G;P=I;Q=F;R=A;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 153:{J=((d[w+(H+2)|0]|0)<<8|K)+B|0;H=H+3|0;if(!(J>>>0<2048)){l=43;break b}a[w+J|0]=A;L=B;M=C;N=D;O=E;K=G;P=I;Q=F;R=A;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 181:{I=d[w+(K+C&255)|0]|0;N=B;O=C;P=D;Q=E;K=G;R=F;A=I;H=H+2|0;B=N;C=O;D=P;E=Q;F=R;continue a};case 200:{M=B+1|0;N=C;O=D;P=E;K=G;H=J;Q=F;R=A;I=M;B=M&255;C=N;D=O;E=P;F=Q;A=R;continue a};case 144:{J=N<<24>>24;K=H+2|0;if((F&256|0)!=0){H=K;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=J+K|0;K=((J+(K&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 76:{J=B;L=C;M=D;N=E;O=G;P=I;Q=F;R=A;H=(d[w+(H+2)|0]|0)<<8|K;B=J;C=L;D=M;E=N;K=O;I=P;F=Q;A=R;continue a};case 193:{F=K+C|0;F=(d[w+(F+1&255)|0]|0)<<8|(d[w+(F&255)|0]|0);l=24;break};case 148:{K=K+C&255;l=62;break};case 48:{J=N<<24>>24;K=H+2|0;if((I&32896|0)==0){H=K;l=4;break b}L=B;M=C;N=D;O=E;P=I;Q=F;R=A;H=J+K|0;K=((J+(K&255)|0)>>>8&1)+G|0;B=L;C=M;D=N;E=O;I=P;F=Q;A=R;continue a};case 132:{l=62;break};case 150:{K=K+B&255;l=64;break};case 81:{l=(d[w+K|0]|0)+B|0;H=((d[w+(K+1&255)|0]|0)<<8)+l|0;G=(l>>>8)+G|0;l=102;break};case 93:{I=C;l=100;break};case 29:{I=C;l=109;break};case 73:{l=103;break};case 192:{l=85;break};case 57:{I=B;l=91;break};case 245:{K=K+C&255;l=118;break};case 249:{I=B;l=120;break};case 41:{l=94;break};case 228:{K=d[w+K|0]|0;l=82;break};case 174:{l=74;break};case 253:{I=C;l=120;break};case 49:{l=(d[w+K|0]|0)+B|0;H=((d[w+(K+1&255)|0]|0)<<8)+l|0;G=(l>>>8)+G|0;l=93;break};case 5:{l=107;break};case 182:{K=K+B&255;l=66;break};case 236:{J=H+2|0;K=(d[w+J|0]|0)<<8|K;c[t>>2]=G;K=d[y+K+1428|0]|0;l=82;break};case 61:{I=C;l=91;break};case 85:{K=K+C&255;l=98;break};case 164:{l=69;break};case 69:{l=98;break};case 25:{I=B;l=109;break};case 225:{H=K+C|0;H=(d[w+(H+1&255)|0]|0)<<8|(d[w+(H&255)|0]|0);l=122;break};case 237:{l=121;break};case 9:{l=112;break};case 21:{K=K+C&255;l=107;break};case 235:case 233:{l=123;break};case 97:{H=K+C|0;H=(d[w+(H+1&255)|0]|0)<<8|(d[w+(H&255)|0]|0);l=131;break};case 113:{l=(d[w+K|0]|0)+B|0;H=((d[w+(K+1&255)|0]|0)<<8)+l|0;G=(l>>>8)+G|0;l=131;break};case 142:{J=C;l=76;break};case 172:{l=72;break};case 1:{H=K+C|0;H=(d[w+(H+1&255)|0]|0)<<8|(d[w+(H&255)|0]|0);l=111;break};case 204:{J=H+2|0;K=(d[w+J|0]|0)<<8|K;c[t>>2]=G;K=d[y+K+1428|0]|0;l=85;break};case 53:{K=K+C&255;l=89;break};case 160:{l=70;break};case 77:{l=101;break};case 241:{l=(d[w+K|0]|0)+B|0;H=((d[w+(K+1&255)|0]|0)<<8)+l|0;G=(l>>>8)+G|0;l=122;break};case 101:{l=127;break};case 180:{K=K+C&255;l=69;break};case 117:{K=K+C&255;l=127;break};case 166:{l=66;break};case 162:{l=67;break};case 188:{l=K+C|0;K=l;G=(l>>>8)+G|0;l=72;break};case 224:{l=82;break};case 196:{K=d[w+K|0]|0;l=85;break};case 65:{H=K+C|0;H=(d[w+(H+1&255)|0]|0)<<8|(d[w+(H&255)|0]|0);l=102;break};case 134:{l=64;break};case 37:{l=89;break};case 190:{l=K+B|0;K=l;G=(l>>>8)+G|0;l=74;break};case 89:{I=B;l=100;break};case 17:{l=(d[w+K|0]|0)+B|0;H=((d[w+(K+1&255)|0]|0)<<8)+l|0;G=(l>>>8)+G|0;l=111;break};case 13:{l=110;break};case 140:{J=B;l=76;break};case 45:{l=92;break};case 36:{K=d[w+K|0]|0;J=A;I=(K&A|0)==0?K<<8:K;H=H+2|0;D=K&64|D&-65;K=G;A=J;continue a};case 229:{l=118;break};case 44:{K=d[y+((d[w+(H+2)|0]|0)<<8|K)+1428|0]|0;J=A;I=(K&A|0)==0?K<<8:K;H=H+3|0;D=K&64|D&-65;K=G;A=J;continue a};case 33:{H=K+C|0;H=(d[w+(H+1&255)|0]|0)<<8|(d[w+(H&255)|0]|0);l=93;break};case 206:{J=(d[w+(H+2)|0]|0)<<8|K;I=-1;l=166;break};case 94:{K=K+C|0;l=138;break};case 202:{M=C+ -1|0;N=B;O=D;P=E;K=G;H=J;Q=F;R=A;I=M;C=M&255;B=N;D=O;E=P;F=Q;A=R;continue a};case 186:{C=E+255&255;N=B;O=D;P=E;K=G;H=J;Q=F;R=A;I=C;B=N;D=O;E=P;F=Q;A=R;continue a};case 70:{l=149;break};case 118:{K=K+C&255;l=150;break};case 136:{M=B+ -1|0;N=C;O=D;P=E;K=G;H=J;Q=F;R=A;I=M;B=M&255;C=N;D=O;E=P;F=Q;A=R;continue a};case 222:{J=((d[w+(H+2)|0]|0)<<8|K)+C|0;I=-1;l=166;break};case 72:{L=E+ -1|256;a[w+L|0]=A;M=B;N=C;O=D;K=G;H=J;P=I;Q=F;R=A;E=L;B=M;C=N;D=O;I=P;F=Q;A=R;continue a};case 106:{l=134;break};case 121:{I=B;l=129;break};case 30:{K=K+C|0;l=142;break};case 126:{K=K+C|0;l=139;break};case 22:{K=K+C&255;l=153;break};case 214:{K=K+C&255;l=159;break};case 198:{l=159;break};case 104:{I=d[w+E|0]|0;O=B;P=C;Q=D;K=G;H=J;R=F;A=I;E=E+ -255|256;B=O;C=P;D=Q;F=R;continue a};case 42:{N=A<<1;I=N|F>>>8&1;O=B;P=C;Q=D;R=E;K=G;H=J;A=I&255;F=N;B=O;C=P;D=Q;E=R;continue a};case 246:{I=K+C&255;L=1;l=160;break};case 238:{J=(d[w+(H+2)|0]|0)<<8|K;I=1;l=166;break};case 125:{I=C;l=129;break};case 138:{N=B;O=C;P=D;Q=E;K=G;H=J;I=C;R=F;A=C;B=N;C=O;D=P;E=Q;F=R;continue a};case 14:{l=142;break};case 38:{l=154;break};case 64:{K=d[w+E|0]|0;H=(d[w+(E+ -254|256)|0]|0)<<8|(d[w+(E+ -255|256)|0]|0);E=E+ -253|256;J=K&76;F=K<<8;I=(K&2|F)^2;a[k]=J;if(((K^D)&4|0)==0){P=B;Q=C;K=G;R=A;D=J;B=P;C=Q;A=R;continue a}D=c[m>>2]|0;if((K&4|0)==0){K=c[n>>2]|0;D=(D|0)>(K|0)?K:D}K=c[f>>2]|0;c[f>>2]=D;P=B;Q=C;R=A;K=G-D+K|0;D=J;B=P;C=Q;A=R;continue a};case 109:{l=130;break};case 40:{K=d[w+E|0]|0;E=E+ -255|256;H=K&76;F=K<<8;I=(K&2|F)^2;if(((K^D)&4|0)==0){O=B;P=C;K=G;Q=J;R=A;D=H;B=O;C=P;H=Q;A=R;continue a}if((K&4|0)==0){D=H;l=189}else{D=H;l=195}break};case 230:{I=K;L=1;l=160;break};case 110:{l=139;break};case 170:{N=B;C=A;O=D;P=E;K=G;H=J;I=A;Q=F;R=A;B=N;D=O;E=P;F=Q;A=R;continue a};case 154:{M=B;N=C;O=D;K=G;H=J;P=I;Q=F;R=A;E=C+1|256;B=M;C=N;D=O;I=P;F=Q;A=R;continue a};case 8:{H=D&76|(I>>>8|I)&128|F>>>8&1;E=E+ -1|256;a[w+E|0]=((I&255|0)==0?H|2:H)|48;M=B;N=C;O=D;K=G;H=J;P=I;Q=F;R=A;B=M;C=N;D=O;I=P;F=Q;A=R;continue a};case 108:{S=(d[w+(H+2)|0]|0)<<8;J=B;L=C;M=D;N=E;O=G;P=I;Q=F;R=A;H=(d[w+(S|K+1&255)|0]|0)<<8|(d[w+(S|K)|0]|0);B=J;C=L;D=M;E=N;K=O;I=P;F=Q;A=R;continue a};case 56:{N=B;O=C;P=D;Q=E;K=G;H=J;R=I;S=A;F=-1;B=N;C=O;D=P;E=Q;I=R;A=S;continue a};case 24:{N=B;O=C;P=D;Q=E;K=G;H=J;R=I;S=A;F=0;B=N;C=O;D=P;E=Q;I=R;A=S;continue a};case 184:{N=B;O=C;P=E;K=G;H=J;Q=I;R=F;S=A;D=D&-65;B=N;C=O;E=P;I=Q;F=R;A=S;continue a};case 248:{N=B;O=C;P=E;K=G;H=J;Q=I;R=F;S=A;D=D|8;B=N;C=O;E=P;I=Q;F=R;A=S;continue a};case 10:{I=A<<1;P=B;Q=C;R=D;S=E;K=G;H=J;A=I&254;F=I;B=P;C=Q;D=R;E=S;continue a};case 216:{N=B;O=C;P=E;K=G;H=J;Q=I;R=F;S=A;D=D&-9;B=N;C=O;E=P;I=Q;F=R;A=S;continue a};case 78:{l=138;break};case 6:{l=153;break};case 105:{break};case 46:{l=143;break};case 74:{F=0;l=134;break};case 86:{K=K+C&255;l=149;break};case 102:{l=150;break};case 54:{K=K+C&255;l=154;break};case 254:{J=((d[w+(H+2)|0]|0)<<8|K)+C|0;I=1;l=166;break};case 62:{K=K+C|0;l=143;break};default:{m=1;l=201;break a}}}while(0);if((l|0)==4){l=0;M=B;N=C;O=D;P=E;Q=I;R=F;S=A;K=G+ -1|0;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}else if((l|0)==20){K=d[w+K|0]|0;l=25}else if((l|0)==22){S=F+K|0;K=S;G=(S>>>8)+G|0;l=23}else if((l|0)==31){l=0;a[w+K|0]=A;M=B;N=C;O=D;P=E;K=G;Q=I;R=F;S=A;H=H+2|0;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}else if((l|0)==43){l=0;c[t>>2]=G;a[y+J+1428|0]=A;if((J&-256|0)!=53760){M=B;N=C;O=D;P=E;K=G;Q=I;R=F;S=A;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}Ki(y,J,A);M=B;N=C;O=D;P=E;Q=I;R=F;S=A;K=c[t>>2]|0;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}else if((l|0)==52){l=0;c[t>>2]=G;I=d[y+A+1428|0]|0;O=B;P=C;Q=D;R=E;S=F;A=I;K=G;B=O;C=P;D=Q;E=R;F=S;continue}else if((l|0)==62){l=0;a[w+K|0]=B;M=B;N=C;O=D;P=E;K=G;Q=I;R=F;S=A;H=H+2|0;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}else if((l|0)==64){l=0;a[w+K|0]=C;M=B;N=C;O=D;P=E;K=G;Q=I;R=F;S=A;H=H+2|0;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}else if((l|0)==66){K=d[w+K|0]|0;l=67}else if((l|0)==69){K=d[w+K|0]|0;l=70}else if((l|0)==72){l=0;B=((d[w+(H+2)|0]|0)<<8)+K|0;c[t>>2]=G;B=d[y+B+1428|0]|0;O=C;P=D;Q=E;R=F;S=A;I=B;H=H+3|0;K=G;C=O;D=P;E=Q;F=R;A=S;continue}else if((l|0)==74){l=0;C=((d[w+(H+2)|0]|0)<<8)+K|0;c[t>>2]=G;C=d[y+C+1428|0]|0;O=B;P=D;Q=E;R=F;S=A;I=C;H=H+3|0;K=G;B=O;D=P;E=Q;F=R;A=S;continue}else if((l|0)==76){l=0;L=a[w+(H+2)|0]|0;K=(L&255)<<8|K;H=H+3|0;if(K>>>0<2048){a[w+K|0]=J;M=B;N=C;O=D;P=E;K=G;Q=I;R=F;S=A;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}c[t>>2]=G;a[y+K+1428|0]=J;if(!(L<<24>>24==-46)){M=B;N=C;O=D;P=E;K=G;Q=I;R=F;S=A;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}Ki(y,K,J);M=B;N=C;O=D;P=E;Q=I;R=F;S=A;K=c[t>>2]|0;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}else if((l|0)==82){l=0;I=C-K|0;O=B;P=C;Q=D;R=E;K=G;S=A;F=~I;I=I&255;H=J+1|0;B=O;C=P;D=Q;E=R;A=S;continue}else if((l|0)==85){l=0;I=B-K|0;O=B;P=C;Q=D;R=E;K=G;S=A;F=~I;I=I&255;H=J+1|0;B=O;C=P;D=Q;E=R;A=S;continue}else if((l|0)==89){K=d[w+K|0]|0;l=94}else if((l|0)==91){S=I+K|0;K=S;G=(S>>>8)+G|0;l=92}else if((l|0)==98){K=d[w+K|0]|0;l=103}else if((l|0)==100){S=I+K|0;K=S;G=(S>>>8)+G|0;l=101}else if((l|0)==107){K=d[w+K|0]|0;l=112}else if((l|0)==109){S=I+K|0;K=S;G=(S>>>8)+G|0;l=110}else if((l|0)==118){K=d[w+K|0]|0;l=123}else if((l|0)==120){S=I+K|0;K=S;G=(S>>>8)+G|0;l=121}else if((l|0)==127){l=0;K=d[w+K|0]|0}else if((l|0)==129){S=I+K|0;K=S;G=(S>>>8)+G|0;l=130}else if((l|0)==134){l=0;O=A<<8;I=F>>>1&128|A>>>1;P=B;Q=C;R=D;S=E;K=G;H=J;A=I;F=O;B=P;C=Q;D=R;E=S;continue}else if((l|0)==138){F=0;l=139}else if((l|0)==142){F=0;l=143}else if((l|0)==149){F=0;l=150}else if((l|0)==153){F=0;l=154}else if((l|0)==159){I=K;L=-1;l=160}else if((l|0)==166){l=0;c[t>>2]=G;S=y+J+1428|0;I=(d[S]|0)+I|0;H=H+3|0;a[S]=I;if((J&-256|0)!=53760){N=B;O=C;P=D;Q=E;K=G;R=F;S=A;B=N;C=O;D=P;E=Q;F=R;A=S;continue}Ki(y,J,I&255);N=B;O=C;P=D;Q=E;R=F;S=A;K=c[t>>2]|0;B=N;C=O;D=P;E=Q;F=R;A=S;continue}else if((l|0)==189){l=0;a[k]=D;L=c[n>>2]|0;H=(c[f>>2]|0)-L|0;if((H|0)<1){Q=B;R=C;K=G;H=J;S=A;B=Q;C=R;A=S;continue}c[f>>2]=L;K=H+G|0;if((K|0)<0){Q=B;R=C;H=J;S=A;B=Q;C=R;A=S;continue}G=K+1|0;if((H|0)<(G|0)){Q=B;R=C;H=J;S=A;B=Q;C=R;A=S;continue}Q=G+L|0;c[f>>2]=Q;c[n>>2]=Q;Q=B;R=C;H=J;S=A;K=-1;B=Q;C=R;A=S;continue}else if((l|0)==195){l=0;a[k]=D;P=c[f>>2]|0;K=c[m>>2]|0;c[f>>2]=K;Q=B;R=C;H=J;S=A;K=P+G-K|0;B=Q;C=R;A=S;continue}else if((l|0)==197){J=H+2|0;l=198}if((l|0)==23){J=H+2|0;F=((d[w+J|0]|0)<<8)+K|0;l=24}else if((l|0)==67){l=0;N=B;O=D;P=E;Q=G;R=F;S=A;I=K;H=H+2|0;C=K;B=N;D=O;E=P;K=Q;F=R;A=S;continue}else if((l|0)==70){l=0;N=C;O=D;P=E;Q=G;R=F;S=A;I=K;H=H+2|0;B=K;C=N;D=O;E=P;K=Q;F=R;A=S;continue}else if((l|0)==92){J=H+2|0;H=((d[w+J|0]|0)<<8)+K|0;l=93}else if((l|0)==101){J=H+2|0;H=((d[w+J|0]|0)<<8)+K|0;l=102}else if((l|0)==110){J=H+2|0;H=((d[w+J|0]|0)<<8)+K|0;l=111}else if((l|0)==121){J=H+2|0;H=((d[w+J|0]|0)<<8)+K|0;l=122}else if((l|0)==130){J=H+2|0;H=((d[w+J|0]|0)<<8)+K|0;l=131}else if((l|0)==139){J=((d[w+(H+2)|0]|0)<<8)+K|0;c[t>>2]=G;I=d[y+J+1428|0]|0;K=I<<8;I=I>>>1|F>>>1&128;l=144}else if((l|0)==143){J=((d[w+(H+2)|0]|0)<<8)+K|0;c[t>>2]=G;I=(d[y+J+1428|0]|0)<<1;K=I;I=I|F>>>8&1;l=144}else if((l|0)==150){I=d[w+K|0]|0;J=I<<8;I=I>>>1|F>>>1&128;l=161}else if((l|0)==154){I=(d[w+K|0]|0)<<1;J=I;I=I|F>>>8&1;l=161}else if((l|0)==160){J=F;K=I;I=(d[w+I|0]|0)+L|0;l=161}else if((l|0)==198){l=0;M=B;N=C;O=D;P=E;Q=I;R=F;S=A;H=J+1|0;K=G;B=M;C=N;D=O;E=P;I=Q;F=R;A=S;continue}if((l|0)==24){c[t>>2]=G;K=d[y+F+1428|0]|0;l=25}else if((l|0)==93){c[t>>2]=G;K=d[y+H+1428|0]|0;l=94}else if((l|0)==102){c[t>>2]=G;K=d[y+H+1428|0]|0;l=103}else if((l|0)==111){c[t>>2]=G;K=d[y+H+1428|0]|0;l=112}else if((l|0)==122){c[t>>2]=G;K=d[y+H+1428|0]|0;l=123}else if((l|0)==131){l=0;c[t>>2]=G;K=d[y+H+1428|0]|0}else if((l|0)==144){l=0;H=H+3|0;a[y+J+1428|0]=I;if((J&-256|0)!=53760){N=B;O=C;P=D;Q=E;R=G;S=A;F=K;B=N;C=O;D=P;E=Q;K=R;A=S;continue}Ki(y,J,I&255);O=B;P=C;Q=D;R=E;S=A;F=K;K=c[t>>2]|0;B=O;C=P;D=Q;E=R;A=S;continue}else if((l|0)==161){l=0;a[w+K|0]=I;O=B;P=C;Q=D;R=E;K=G;S=A;F=J;H=H+2|0;B=O;C=P;D=Q;E=R;A=S;continue}if((l|0)==25){l=0;I=A-K|0;O=B;P=C;Q=D;R=E;S=A;F=~I;I=I&255;H=J+1|0;K=G;B=O;C=P;D=Q;E=R;A=S;continue}else if((l|0)==94){l=0;I=K&A;O=B;P=C;Q=D;R=E;S=F;A=I;H=J+1|0;K=G;B=O;C=P;D=Q;E=R;F=S;continue}else if((l|0)==103){l=0;I=K^A;O=B;P=C;Q=D;R=E;S=F;A=I;H=J+1|0;K=G;B=O;C=P;D=Q;E=R;F=S;continue}else if((l|0)==112){l=0;I=K|A;O=B;P=C;Q=D;R=E;S=F;A=I;H=J+1|0;K=G;B=O;C=P;D=Q;E=R;F=S;continue}else if((l|0)==123){l=0;K=K^255}I=F>>>8&1;P=((A^128)+I+(K<<24>>24)|0)>>>2&64|D&-65;I=A+I+K|0;Q=B;R=C;S=E;A=I&255;F=I;H=J+1|0;K=G;D=P;B=Q;C=R;E=S}if((l|0)==201){c[t>>2]=G;b[s>>1]=H;a[q]=E+255;a[v]=A;a[u]=C;a[r]=B;l=D&76|(I>>>8|I)&128|F>>>8&1;a[k]=(I&255|0)==0?l|2:l;Q=h;R=c[Q+4>>2]|0;S=o;c[S>>2]=c[Q>>2];c[S+4>>2]=R;c[g>>2]=p;i=j;return m|0}return 0}function Ai(a){a=a|0;var b=0;b=i;Ic(a);Al(a);i=b;return}function Bi(a){a=a|0;var b=0;b=i;Ic(a);i=b;return}function Ci(a,b,c){a=a|0;b=b|0;c=c|0;c=i;Ne(b+272|0,a+657|0);Ne(b+784|0,a+401|0);Ne(b+1040|0,a+913|0);i=c;return 0}function Di(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,j=0,k=0;g=i;c[b+948>>2]=e+f;j=b+372|0;c[j>>2]=0;c[b+388>>2]=66;k=b+400|0;a[k]=0;c[b+376>>2]=-1;c[b+380>>2]=-1;c[b+384>>2]=-1;c[b+396>>2]=312;f=Ei(e,f,b+368|0)|0;if((f|0)!=0){e=f;i=g;return e|0}c[b+16>>2]=c[j>>2];e=c[b+392>>2]|0;c[b+12>>2]=e;c[b+8>>2]=e;c[b+232>>2]=4<<(d[k]|0);Fc(b+67224|0,+h[b+248>>3]*.008333333333333333);e=Nc(b,1773447)|0;i=g;return e|0}function Ei(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;h=f+24|0;c[h>>2]=1;j=f+33|0;a[j]=0;k=f+289|0;a[k]=0;l=f+545|0;a[l]=0;do{if((e|0)>=16){if((Jl(b,49920,5)|0)!=0){break}w=e+ -5|0;m=b+w|0;s=b+5|0;a:do{if((w|0)>5){p=f+20|0;q=f+32|0;e=f+28|0;o=f+16|0;n=f+12|0;b=f+8|0;b:while(1){u=a[s]|0;if(u<<24>>24==-1){if((a[s+1|0]|0)==-1){break a}}c:do{if(s>>>0<m>>>0){t=u;r=s;while(1){v=r+1|0;if(t<<24>>24==13){break c}if(!(v>>>0<m>>>0)){r=v;break c}t=a[v]|0;r=v}}else{r=s}}while(0);d:do{if(s>>>0<r>>>0){t=s;while(1){v=t+1|0;if(!((u&255)>32)){break d}if(!(v>>>0<r>>>0)){t=v;break d}u=a[v]|0;t=v}}else{t=s}}while(0);u=t-s|0;e:do{if(t>>>0<r>>>0){while(1){v=t+1|0;if((d[t]|0)>=33){v=1;break e}if(v>>>0<r>>>0){t=v}else{t=v;v=0;break}}}else{v=0}}while(0);do{if((u|0)>=1){if((Ll(49928,s,u)|0)==0){s=3;u=0;while(1){w=d[t]|0;v=w+ -48|0;if(v>>>0>9){v=(w+191&223)+10|0;if(v>>>0>15){j=23;break b}}u=v+u|0;if((s|0)==0){break}t=t+1|0;s=s+ -1|0;u=u<<4}c[b>>2]=u;if(u>>>0>65535){f=49936;j=81;break b}else{break}}if((Ll(49960,s,u)|0)==0){s=3;u=0;while(1){v=d[t]|0;w=v+ -48|0;if(w>>>0>9){w=(v+191&223)+10|0;if(w>>>0>15){j=30;break b}}u=w+u|0;if((s|0)==0){break}t=t+1|0;s=s+ -1|0;u=u<<4}c[n>>2]=u;if(u>>>0>65535){f=49968;j=81;break b}else{break}}if((Ll(49992,s,u)|0)==0){s=3;u=0;while(1){w=d[t]|0;v=w+ -48|0;if(v>>>0>9){v=(w+191&223)+10|0;if(v>>>0>15){j=37;break b}}u=v+u|0;if((s|0)==0){break}t=t+1|0;s=s+ -1|0;u=u<<4}c[o>>2]=u;if(u>>>0>65535){f=5e4;j=81;break b}else{break}}if((Ll(50024,s,u)|0)==0){if(v){s=0}else{j=46;break b}while(1){u=(d[t]|0)+ -48|0;if(u>>>0>9){j=46;break b}t=t+1|0;s=u+s|0;if(!(t>>>0<r>>>0)){break}s=s*10|0}c[h>>2]=s;if((s|0)<1){f=50032;j=81;break b}else{break}}if((Ll(50056,s,u)|0)==0){s=d[t]|0;c[p>>2]=s;if((s|0)==66|(s|0)==67){break}else if((s|0)==68){f=50064;j=81;break b}else{f=50088;j=82;break b}}if((Ll(50112,s,u)|0)==0){a[q]=1;break}if((Ll(50120,s,u)|0)==0){if(v){u=0}else{j=57;break b}while(1){s=(d[t]|0)+ -48|0;if(s>>>0>9){j=57;break b}t=t+1|0;s=s+u|0;if(!(t>>>0<r>>>0)){break}u=s*10|0}c[e>>2]=s;if((s|0)<1){f=50136;j=81;break b}else{break}}if((Ll(50160,s,u)|0)==0){s=t+1|0;f:do{if((a[t]|0)==34){if(s>>>0<r>>>0){u=s}else{u=s;t=s;break}while(1){t=u+1|0;if((a[u]|0)==34){t=s;break f}if(t>>>0<r>>>0){u=t}else{u=t;t=s;break}}}else{u=r}}while(0);s=u-t|0;w=(s|0)>255?255:s;a[f+w+33|0]=0;Nl(j|0,t|0,w|0)|0;break}if((Ll(50168,s,u)|0)==0){s=t+1|0;g:do{if((a[t]|0)==34){if(s>>>0<r>>>0){u=s}else{u=s;t=s;break}while(1){t=u+1|0;if((a[u]|0)==34){t=s;break g}if(t>>>0<r>>>0){u=t}else{u=t;t=s;break}}}else{u=r}}while(0);s=u-t|0;w=(s|0)>255?255:s;a[f+w+289|0]=0;Nl(k|0,t|0,w|0)|0;break}if((Ll(50176,s,u)|0)!=0){break}s=t+1|0;h:do{if((a[t]|0)==34){if(s>>>0<r>>>0){u=s}else{u=s;t=s;break}while(1){t=u+1|0;if((a[u]|0)==34){t=s;break h}if(t>>>0<r>>>0){u=t}else{u=t;t=s;break}}}else{u=r}}while(0);s=u-t|0;w=(s|0)>31?31:s;a[f+w+545|0]=0;Nl(l|0,t|0,w|0)|0}}while(0);s=r+2|0;if(!(s>>>0<m>>>0)){break a}}if((j|0)==23){c[b>>2]=-1;w=49936;i=g;return w|0}else if((j|0)==30){c[n>>2]=-1;w=49968;i=g;return w|0}else if((j|0)==37){c[o>>2]=-1;w=5e4;i=g;return w|0}else if((j|0)==46){c[h>>2]=-1;w=50032;i=g;return w|0}else if((j|0)==57){c[e>>2]=-1;w=50136;i=g;return w|0}else if((j|0)==81){w=f;i=g;return w|0}else if((j|0)==82){i=g;return f|0}}}while(0);if(!((a[s]|0)==-1)){w=50184;i=g;return w|0}if(!((a[s+1|0]|0)==-1)){w=50184;i=g;return w|0}c[f>>2]=s+2;w=0;i=g;return w|0}}while(0);w=c[10038]|0;i=g;return w|0}function Fi(a,b){a=a|0;b=b|0;var c=0;c=i;Ec(a+67224|0,b);i=c;return}function Gi(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;j=i;h=d+ -4|0;if((h|0)>-1){if(!(h>>>0<4)){za(49832,49864,73,49904)}c[b+(h*20|0)+1084>>2]=g;i=j;return}else{if(!(d>>>0<4)){za(49832,49864,73,49904)}c[b+(d*20|0)+980>>2]=(a[b+400|0]|0)!=0?f:e;i=j;return}}function Hi(a,b){a=a|0;b=+b;c[a+952>>2]=~~(114.0/b);i=i;return}function Ii(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;g=Oc(b,e)|0;if((g|0)!=0){n=g;i=f;return n|0}Pl(b+1172|0,0,66048)|0;h=c[b+368>>2]|0;g=b+948|0;j=c[g>>2]|0;a:do{if((j-h|0)>4){while(1){m=d[h+1|0]<<8|d[h];k=d[h+3|0]<<8|d[h+2|0];l=h+4|0;if(k>>>0<m>>>0){g=4;break}k=k-m|0;n=k+1|0;if((n|0)>(j-l|0)){g=6;break}Nl(b+m+1428|0,l|0,n|0)|0;l=h+(k+5)|0;j=c[g>>2]|0;do{if((j-l|0)>1){if(!((a[l]|0)==-1)){h=l;break}if(!((a[h+(k+6)|0]|0)==-1)){h=l;break}h=h+(k+7)|0}else{h=l}}while(0);if((j-h|0)<=4){break a}}if((g|0)==4){c[b+16>>2]=49696;break}else if((g|0)==6){c[b+16>>2]=49696;break}}}while(0);n=b+67224|0;ui(b+964|0,n);ui(b+1068|0,n);yi(b+336|0,b+1428|0);n=b+960|0;c[n>>2]=0;Ji(b,e);c[n>>2]=-1;c[b+956>>2]=_(c[b+952>>2]|0,c[b+396>>2]|0)|0;n=0;i=f;return n|0}function Ji(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;g=c[d+388>>2]|0;if((g|0)==66){a[d+338|0]=e;g=d+336|0;b[g>>1]=c[d+376>>2];e=d+342|0;h=a[e]|0;do{if(h<<24>>24==-2){if(!((a[d+1939|0]|0)==-2)){h=-2;break}a[e]=-1;h=-1}}while(0);a[e]=h+ -1<<24>>24;a[d+(h&255|256)+1428|0]=-2;n=a[e]|0;a[e]=n+ -1<<24>>24;a[d+(n&255|256)+1428|0]=-2;n=a[e]|0;a[e]=n+ -1<<24>>24;a[d+(n&255|256)+1428|0]=-2;zi(g,2134080)|0;i=f;return}else if((g|0)==67){l=d+338|0;a[l]=112;j=c[d+384>>2]|0;k=d+339|0;a[k]=j;a[d+340|0]=j>>>8;j=d+380|0;m=d+336|0;h=m;b[h>>1]=(c[j>>2]|0)+3;g=d+342|0;n=a[g]|0;do{if(n<<24>>24==-2){if(!((a[d+1939|0]|0)==-2)){n=-2;break}a[g]=-1;n=-1}}while(0);a[g]=n+ -1<<24>>24;a[d+(n&255|256)+1428|0]=-2;n=a[g]|0;a[g]=n+ -1<<24>>24;a[d+(n&255|256)+1428|0]=-2;n=a[g]|0;a[g]=n+ -1<<24>>24;a[d+(n&255|256)+1428|0]=-2;zi(m,2134080)|0;a[l]=0;a[k]=e;b[h>>1]=(c[j>>2]|0)+3;e=a[g]|0;do{if(e<<24>>24==-2){if(!((a[d+1939|0]|0)==-2)){e=-2;break}a[g]=-1;e=-1}}while(0);a[g]=e+ -1<<24>>24;a[d+(e&255|256)+1428|0]=-2;n=a[g]|0;a[g]=n+ -1<<24>>24;a[d+(n&255|256)+1428|0]=-2;n=a[g]|0;a[g]=n+ -1<<24>>24;a[d+(n&255|256)+1428|0]=-2;zi(m,2134080)|0;i=f;return}else{i=f;return}}function Ki(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;if((d^53760)>>>0<10){g=c[b+344>>2]|0;wi(b+964|0,(c[g>>2]|0)+(c[g+4>>2]|0)&c[b+960>>2],d,e);i=f;return}if(!((d^53776)>>>0<10)){i=f;return}if((a[b+400|0]|0)==0){i=f;return}g=c[b+344>>2]|0;wi(b+1068|0,(c[g>>2]|0)+(c[g+4>>2]|0)&c[b+960>>2],d^16,e);i=f;return}function Li(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;k=d+336|0;g=k;j=d+344|0;n=c[j>>2]|0;c[n+4>>2]=0-(c[n>>2]|0);n=c[e>>2]|0;a:do{if((n|0)>0){h=d+956|0;l=d+396|0;m=d+952|0;while(1){if(zi(g,n)|0){e=49720;g=13;break}n=b[k>>1]|0;if((n&65535)>65279){e=49720;g=13;break}do{if(n<<16>>16==-257){n=c[h>>2]|0;o=c[e>>2]|0;q=c[j>>2]|0;p=c[q>>2]|0;if((n|0)>(o|0)){c[q+4>>2]=o-p;break}else{c[q+4>>2]=n-p;q=_(c[m>>2]|0,c[l>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+q;Mi(d);break}}}while(0);o=c[j>>2]|0;o=(c[o>>2]|0)+(c[o+4>>2]|0)|0;n=c[e>>2]|0;if((o|0)>=(n|0)){break a}}if((g|0)==13){i=f;return e|0}}else{o=0;h=d+956|0}}while(0);c[e>>2]=o;g=(c[h>>2]|0)-o|0;c[h>>2]=(g|0)<0?0:g;xi(d+964|0,o);if((a[d+400|0]|0)==0){q=0;i=f;return q|0}xi(d+1068|0,c[e>>2]|0);q=0;i=f;return q|0}function Mi(d){d=d|0;var e=0,f=0,g=0;e=i;f=c[d+388>>2]|0;if((f|0)==67){b[d+336>>1]=(c[d+380>>2]|0)+6;f=d+342|0;g=a[f]|0;do{if(g<<24>>24==-2){if(!((a[d+1939|0]|0)==-2)){g=-2;break}a[f]=-1;g=-1}}while(0);a[f]=g+ -1<<24>>24;a[d+(g&255|256)+1428|0]=-2;g=a[f]|0;a[f]=g+ -1<<24>>24;a[d+(g&255|256)+1428|0]=-2;g=a[f]|0;a[f]=g+ -1<<24>>24;a[d+(g&255|256)+1428|0]=-2;i=e;return}else if((f|0)==66){b[d+336>>1]=c[d+380>>2];f=d+342|0;g=a[f]|0;do{if(g<<24>>24==-2){if(!((a[d+1939|0]|0)==-2)){g=-2;break}a[f]=-1;g=-1}}while(0);a[f]=g+ -1<<24>>24;a[d+(g&255|256)+1428|0]=-2;g=a[f]|0;a[f]=g+ -1<<24>>24;a[d+(g&255|256)+1428|0]=-2;g=a[f]|0;a[f]=g+ -1<<24>>24;a[d+(g&255|256)+1428|0]=-2;i=e;return}else{i=e;return}}function Ni(){var a=0,b=0;a=i;b=zl(84496)|0;if((b|0)==0){b=0;i=a;return b|0}c[b+344>>2]=b+348;Gc(b);c[b>>2]=49448;ti(b+964|0);ti(b+1068|0);ri(b+67224|0);c[b+4>>2]=49672;c[b+228>>2]=49544;c[b+332>>2]=49640;c[b+284>>2]=6;i=a;return b|0}function Oi(){var a=0,b=0,d=0;a=i;b=zl(896)|0;if((b|0)==0){b=0;i=a;return b|0}d=b;Cg(d);c[b>>2]=50240;c[b+4>>2]=49672;b=d;i=a;return b|0}function Pi(a){a=a|0;var b=0;b=i;Eg(a);i=b;return}function Qi(a){a=a|0;var b=0;b=i;Eg(a);Al(a);i=b;return}function Ri(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;d=Ei(b,d,a+316|0)|0;if((d|0)!=0){b=d;i=e;return b|0}b=c[a+340>>2]|0;c[a+12>>2]=b;c[a+8>>2]=b;b=0;i=e;return b|0}function Si(a,b,c){a=a|0;b=b|0;c=c|0;c=i;Ne(b+272|0,a+605|0);Ne(b+784|0,a+349|0);Ne(b+1040|0,a+861|0);i=c;return 0}function Ti(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;h=a+32|0;g=c[h>>2]|0;do{if((g|0)!=0){j=a+36|0;if((c[j>>2]|0)<129){break}f=a+40|0;k=(c[f>>2]|0)!=0?g:0-g|0;g=a+28|0;l=c[g>>2]|0;if((k|0)!=(l|0)){c[g>>2]=k;p=c[a+16>>2]|0;o=_(c[p>>2]|0,b)|0;Sb(c[a+44>>2]|0,o+(c[p+4>>2]|0)|0,k-l|0,p)}b=(c[a+24>>2]|0)+b|0;if((b|0)>=(d|0)){o=b;o=o-d|0;p=a+24|0;c[p>>2]=o;i=e;return}o=c[a+16>>2]|0;m=a+44|0;l=o;n=o+4|0;p=k<<1;do{p=0-p|0;k=_(c[l>>2]|0,b)|0;Sb(c[m>>2]|0,k+(c[n>>2]|0)|0,p,o);b=(c[j>>2]|0)+b|0;k=c[f>>2]|0;c[f>>2]=k^1;}while((b|0)<(d|0));f=c[h>>2]|0;c[g>>2]=(k|0)!=1?f:0-f|0;o=b;o=o-d|0;p=a+24|0;c[p>>2]=o;i=e;return}}while(0);g=a+28|0;f=c[g>>2]|0;if((f|0)!=0){p=c[a+16>>2]|0;o=_(c[p>>2]|0,b)|0;Sb(c[a+44>>2]|0,o+(c[p+4>>2]|0)|0,0-f|0,p);c[g>>2]=0}f=(c[a+24>>2]|0)+b|0;g=c[a+36>>2]|0;if((g|0)==0){o=d;o=o-d|0;p=a+24|0;c[p>>2]=o;i=e;return}if((f|0)>=(d|0)){o=f;o=o-d|0;p=a+24|0;c[p>>2]=o;i=e;return}o=(d+ -1-f+g|0)/(g|0)|0;p=a+40|0;c[p>>2]=(c[p>>2]|0)+o&1;o=(_(g,o)|0)+f|0;o=o-d|0;p=a+24|0;c[p>>2]=o;i=e;return}function Ui(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;k=a+32|0;h=c[k>>2]|0;e=a+40|0;j=(c[e>>2]&1|0)==0?h:0-h|0;g=a+28|0;l=c[g>>2]|0;if((j|0)==(l|0)){k=h}else{c[g>>2]=j;q=c[a+16>>2]|0;p=_(c[q>>2]|0,b)|0;Zd(a+48|0,p+(c[q+4>>2]|0)|0,j-l|0,q);k=c[k>>2]|0}h=a+24|0;o=(k|0)==0?d:(c[h>>2]|0)+b|0;if((o|0)>=(d|0)){q=o;q=q-d|0;c[h>>2]=q;i=f;return}b=c[a+16>>2]|0;k=c[c[a+36>>2]>>2]|0;l=(k|0)!=0?k<<1:16;k=a+44|0;m=a+48|0;a=b;n=b+4|0;p=j<<1;q=c[e>>2]|0;while(1){j=c[k>>2]&0-(q&1)^q>>>1;if((q+1&2|0)!=0){p=0-p|0;q=_(c[a>>2]|0,o)|0;Zd(m,q+(c[n>>2]|0)|0,p,b)}o=o+l|0;if((o|0)<(d|0)){q=j}else{break}}c[e>>2]=j;c[g>>2]=p>>1;q=o;q=q-d|0;c[h>>2]=q;i=f;return}function Vi(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;f=a+16|0;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;f=a+64|0;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;f=a+112|0;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;f=a+160|0;Cc(f,a+200|0,12);e=a+984|0;d=e;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;d=a+1032|0;Cc(d,a+1072|0,8);c[a+60>>2]=f;c[a>>2]=a+16;c[a+108>>2]=f;c[a+4>>2]=a+64;c[a+156>>2]=f;c[a+8>>2]=a+112;c[a+12>>2]=e;Fc(a+160|0,.00166015625);Fc(d,.00166015625);c[a+976>>2]=0;c[a+980>>2]=0;c[a+1596>>2]=32768;c[a+1592>>2]=36864;d=a+36|0;e=a+40|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[d>>2]=3;c[a+32>>2]=c[a+28>>2];d=a+84|0;e=a+88|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[d>>2]=3;c[a+80>>2]=c[a+76>>2];d=a+132|0;e=a+136|0;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[d>>2]=3;c[a+128>>2]=c[a+124>>2];c[a+1020>>2]=50648;c[a+1024>>2]=32768;c[a+1028>>2]=36864;c[a+1008>>2]=0;c[a+1012>>2]=0;c[a+1016>>2]=0;c[a+1004>>2]=3;c[a+1e3>>2]=c[a+996>>2];i=b;return}function Wi(a,b){a=a|0;b=+b;var c=0;c=i;b=b*.00166015625;Fc(a+160|0,b);Fc(a+1032|0,b);i=c;return}function Xi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;c[a+976>>2]=0;c[a+980>>2]=0;f=(b|0)==0|(d|0)==0;g=f?16:d;c[a+1596>>2]=1<<g+ -1;d=a+1592|0;c[d>>2]=0;if((g|0)!=0){f=f?9:b;b=0;while(1){g=g+ -1|0;b=b<<1|f&1;if((g|0)==0){break}else{f=f>>>1}}c[d>>2]=b}b=a+36|0;g=a+40|0;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+16>>2]=0;c[b>>2]=3;c[a+32>>2]=c[a+28>>2];b=a+84|0;g=a+88|0;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+16>>2]=0;c[b>>2]=3;c[a+80>>2]=c[a+76>>2];b=a+132|0;g=a+136|0;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+16>>2]=0;c[b>>2]=3;c[a+128>>2]=c[a+124>>2];c[a+1020>>2]=50648;c[a+1024>>2]=32768;c[a+1028>>2]=36864;c[a+1008>>2]=0;c[a+1012>>2]=0;c[a+1016>>2]=0;c[a+1004>>2]=3;c[a+1e3>>2]=c[a+996>>2];i=e;return}function Yi(a){a=a|0;i=i;return}function Zi(a,b){a=a|0;b=b|0;var c=0;c=i;Ec(a+160|0,b);Ec(a+1032|0,b);i=c;return}function _i(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;if(!(b>>>0<4)){za(50344,50376,194,50416)}k=(d|0)==0;j=(e|0)==0;h=(f|0)==0;if(k&j&h|(k|j|h)^1){k=c[a+(b<<2)>>2]|0;c[k+4>>2]=f;c[k+8>>2]=e;c[k+12>>2]=d;c[k+16>>2]=c[k+(c[k+20>>2]<<2)>>2];i=g;return}else{za(50432,50376,195,50416)}}function $i(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;k=(b|0)==0;j=(d|0)==0;h=(e|0)==0;if(k&j&h|(k|j|h)^1){g=0}else{za(50432,50376,195,50416)}while(1){if(!(g>>>0<4)){a=4;break}k=c[a+(g<<2)>>2]|0;c[k+4>>2]=e;c[k+8>>2]=d;c[k+12>>2]=b;c[k+16>>2]=c[k+(c[k+20>>2]<<2)>>2];g=g+1|0;if((g|0)>=4){a=6;break}}if((a|0)==4){za(50344,50376,194,50416)}else if((a|0)==6){i=f;return}}function aj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=a+976|0;f=c[e>>2]|0;if((f|0)>(b|0)){za(50496,50376,236,50520)}if((f|0)>=(b|0)){i=d;return}f=c[(c[a>>2]|0)+16>>2]|0;if((f|0)!=0){c[f+40>>2]=1;Ti(a+16|0,c[e>>2]|0,b)}f=c[(c[a+4>>2]|0)+16>>2]|0;if((f|0)!=0){c[f+40>>2]=1;Ti(a+64|0,c[e>>2]|0,b)}f=c[(c[a+8>>2]|0)+16>>2]|0;if((f|0)!=0){c[f+40>>2]=1;Ti(a+112|0,c[e>>2]|0,b)}f=c[(c[a+12>>2]|0)+16>>2]|0;if((f|0)!=0){c[f+40>>2]=1;Ui(a+984|0,c[e>>2]|0,b)}c[e>>2]=b;i=d;return}function bj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;e=i;d=a+976|0;f=c[d>>2]|0;if((f|0)<(b|0)){aj(a,b);f=c[d>>2]|0}if((f|0)<(b|0)){za(50536,50376,263,50560)}else{c[d>>2]=f-b;i=e;return}}function cj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;f=i;if(!(d>>>0<256)){za(50576,50376,269,50600)}aj(a,b);e=a+160|0;h=c[a>>2]|0;k=h+16|0;g=c[k>>2]|0;j=d>>>3&2|d&1;c[h+20>>2]=j;j=c[h+(j<<2)>>2]|0;c[k>>2]=j;do{if((j|0)!=(g|0)){h=h+28|0;if((c[h>>2]|0)==0){break}if((g|0)!=0){c[g+40>>2]=1;k=_(c[g>>2]|0,b)|0;Sb(e,k+(c[g+4>>2]|0)|0,0-(c[h>>2]|0)|0,g)}c[h>>2]=0}}while(0);h=c[a+4>>2]|0;k=d>>1;j=h+16|0;g=c[j>>2]|0;k=k>>>3&2|k&1;c[h+20>>2]=k;k=c[h+(k<<2)>>2]|0;c[j>>2]=k;do{if((k|0)!=(g|0)){h=h+28|0;if((c[h>>2]|0)==0){break}if((g|0)!=0){c[g+40>>2]=1;k=_(c[g>>2]|0,b)|0;Sb(e,k+(c[g+4>>2]|0)|0,0-(c[h>>2]|0)|0,g)}c[h>>2]=0}}while(0);h=c[a+8>>2]|0;k=d>>2;j=h+16|0;g=c[j>>2]|0;k=k>>>3&2|k&1;c[h+20>>2]=k;k=c[h+(k<<2)>>2]|0;c[j>>2]=k;do{if((k|0)!=(g|0)){h=h+28|0;if((c[h>>2]|0)==0){break}if((g|0)!=0){c[g+40>>2]=1;k=_(c[g>>2]|0,b)|0;Sb(e,k+(c[g+4>>2]|0)|0,0-(c[h>>2]|0)|0,g)}c[h>>2]=0}}while(0);a=c[a+12>>2]|0;k=d>>3;j=a+16|0;d=c[j>>2]|0;k=k>>>3&2|k&1;c[a+20>>2]=k;k=c[a+(k<<2)>>2]|0;c[j>>2]=k;if((k|0)==(d|0)){i=f;return}a=a+28|0;if((c[a>>2]|0)==0){i=f;return}if((d|0)!=0){c[d+40>>2]=1;k=_(c[d>>2]|0,b)|0;Sb(e,k+(c[d+4>>2]|0)|0,0-(c[a>>2]|0)|0,d)}c[a>>2]=0;i=f;return}function dj(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0;f=i;if(!(e>>>0<256)){za(50576,50376,299,50616)}aj(a,b);b=(e&128|0)!=0;g=a+980|0;if(b){c[g>>2]=e;g=e}else{g=c[g>>2]|0}h=g>>>5&3;if((g&16|0)!=0){c[(c[a+(h<<2)>>2]|0)+32>>2]=d[50632+(e&15)|0]|0;i=f;return}if((h|0)==3){b=e&3;if((b|0)==3){c[a+1020>>2]=a+148}else{c[a+1020>>2]=50648+(b<<2)}c[a+1028>>2]=c[((e&4|0)==0?a+1596|0:a+1592|0)>>2];c[a+1024>>2]=32768;i=f;return}else{g=a+(h*48|0)+52|0;a=c[g>>2]|0;if(b){c[g>>2]=a&65280|e<<4&240;i=f;return}else{c[g>>2]=a&255|e<<8&16128;i=f;return}}}function ej(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;d=i;Pl(b+1868|0,0,66640)|0;e=b;g=b+2716|0;xj(e,g);c[b+2008>>2]=256;a[b+2138|0]=-1;a[b+2139|0]=-64;f=0;do{l=a[50664+f|0]|0;m=f<<1;a[b+m+2204|0]=(l&255)>>>4;a[b+(m|1)+2204|0]=l&15;f=f+1|0;}while((f|0)!=128);Nl(b+1612|0,51048,256)|0;Pl(g|0,-1,65536)|0;c[b+2072>>2]=0;k=b+2460|0;m=b+2956|0;l=b+1940|0;f=l+0|0;g=m+0|0;h=f+16|0;do{a[f]=a[g]|0;f=f+1|0;g=g+1|0}while((f|0)<(h|0));j=b+1956|0;f=j+0|0;g=m+0|0;h=f+12|0;do{a[f]=a[g]|0;f=f+1|0;g=g+1|0}while((f|0)<(h|0));a[j]=0;a[b+1957|0]=0;a[b+1966|0]=0;a[b+1967|0]=0;a[b+1968|0]=0;Pl(k|0,-1,256)|0;Pl(b+68252|0,-1,256)|0;m=b+1969|0;a[m+0|0]=15;a[m+1|0]=15;a[m+2|0]=15;m=b+1972|0;k=m;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[k+16>>2]=0;c[k+20>>2]=0;c[m>>2]=65472;a[l]=10;a[b+1941|0]=-80;m=b+1960|0;a[m]=0;a[m+1|0]=0;a[m+2|0]=0;a[m+3|0]=0;gj(b);yj(e);i=d;return 0}function fj(a,b){a=a|0;b=b|0;c[a+2008>>2]=b;b=(b|0)==0?1:b;b=((b>>1)+4096|0)/(b|0)|0;b=(b|0)<4?4:b;c[a+1920>>2]=b;b=b<<3;c[a+1896>>2]=b;c[a+1872>>2]=b;i=i;return}function gj(e){e=e|0;var f=0,g=0,h=0,j=0;f=i;c[e+2020>>2]=0;a[e+2004|0]=0;c[e+2e3>>2]=0;c[e+1996>>2]=33;c[e+1868>>2]=1;c[e+1880>>2]=0;c[e+1892>>2]=1;c[e+1904>>2]=0;c[e+1916>>2]=1;c[e+1928>>2]=0;g=e+1941|0;nj(e,a[g]&128);c[e+1876>>2]=((d[e+1950|0]|0)+255&255)+1;g=d[g]|0;c[e+1884>>2]=g&1;c[e+1888>>2]=a[e+1969|0]&15;c[e+1900>>2]=((d[e+1951|0]|0)+255&255)+1;c[e+1908>>2]=g>>>1&1;c[e+1912>>2]=a[e+1970|0]&15;c[e+1924>>2]=((d[e+1952|0]|0)+255&255)+1;c[e+1932>>2]=g>>>2&1;c[e+1936>>2]=a[e+1971|0]&15;g=c[e+2008>>2]|0;g=(g|0)==0?1:g;g=((g>>1)+4096|0)/(g|0)|0;g=(g|0)<4?4:g;c[e+1920>>2]=g;g=g<<3;c[e+1896>>2]=g;c[e+1872>>2]=g;c[e+2024>>2]=0;g=e+2056|0;h=e+2040|0;while(1){j=h+2|0;b[h>>1]=0;if(j>>>0<g>>>0){h=j}else{break}}c[e+2036>>2]=j;c[e+2028>>2]=0;uj(e,0,0);i=f;return}function hj(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;if((f|0)<35){m=50832;i=g;return m|0}if((Jl(e,50792,27)|0)!=0){m=50832;i=g;return m|0}if((f|0)<65920){m=50848;i=g;return m|0}c[b+1972>>2]=(d[e+38|0]|0)<<8|(d[e+37|0]|0);c[b+1976>>2]=d[e+39|0]|0;c[b+1980>>2]=d[e+40|0]|0;c[b+1984>>2]=d[e+41|0]|0;c[b+1988>>2]=d[e+42|0]|0;c[b+1992>>2]=d[e+43|0]|0;Nl(b+2716|0,e+256|0,65536)|0;c[b+2072>>2]=0;j=b+2460|0;h=b+2956|0;l=b+1940|0;k=h+0|0;f=l+16|0;do{a[l]=a[k]|0;l=l+1|0;k=k+1|0}while((l|0)<(f|0));m=b+1956|0;l=m+0|0;k=h+0|0;f=l+16|0;do{a[l]=a[k]|0;l=l+1|0;k=k+1|0}while((l|0)<(f|0));a[m]=0;a[b+1957|0]=0;a[b+1966|0]=0;a[b+1967|0]=0;a[b+1968|0]=0;Pl(j|0,-1,256)|0;Pl(b+68252|0,-1,256)|0;zj(b,e+65792|0);gj(b);m=0;i=g;return m|0}function ij(b){b=b|0;var c=0,e=0,f=0;c=i;if(!((a[b+108|0]&32)==0)){i=c;return}e=(d[b+109|0]|0)<<8;f=((d[b+125|0]|0)<<11&30720)+e|0;Pl(b+e+2716|0,-1,((f|0)>65536?65536:f)-e|0)|0;i=c;return}function jj(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;if((e&1|0)!=0){za(50872,50888,279,50928)}m=a+2024|0;c[m>>2]=c[m>>2]&31;if((d|0)==0){h=a+2056|0;j=a+2040|0;while(1){g=j+2|0;b[j>>1]=0;if(g>>>0<h>>>0){j=g}else{break}}c[a+2036>>2]=g;c[a+2028>>2]=0;uj(a,0,0);i=f;return}k=d+(e<<1)|0;c[a+2028>>2]=d;c[a+2032>>2]=k;l=a+2040|0;h=c[a+2036>>2]|0;e=(e|0)>0;if(l>>>0<h>>>0&e){e=l;while(1){l=e+2|0;m=d+2|0;b[d>>1]=b[e>>1]|0;e=m>>>0<k>>>0;if(l>>>0<h>>>0&e){e=l;d=m}else{d=m;break}}}do{if(e){j=d;g=k}else{d=a+1580|0;k=a+1612|0;if(!(l>>>0<h>>>0)){j=d;g=k;break}while(1){e=l+2|0;m=d+2|0;b[d>>1]=b[l>>1]|0;if(e>>>0<h>>>0){l=e;d=m}else{break}}if(!(m>>>0>k>>>0)){j=m;g=k;break}za(50944,50888,303,50928)}}while(0);uj(a,j,g-j>>1);i=f;return}function kj(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;g=c[a+2032>>2]|0;e=c[a+1568>>2]|0;h=c[a+2028>>2]|0;j=h>>>0>e>>>0|e>>>0>g>>>0;f=a+1580|0;g=j?g:e;e=j?e:f;j=a+2040|0;h=h+(c[a+2024>>2]>>5<<1<<1)|0;if(h>>>0<g>>>0){while(1){k=j+2|0;b[j>>1]=b[h>>1]|0;h=h+2|0;if(h>>>0<g>>>0){j=k}else{j=k;break}}}if(f>>>0<e>>>0){while(1){g=j+2|0;b[j>>1]=b[f>>1]|0;f=f+2|0;if(f>>>0<e>>>0){j=g}else{j=g;break}}}c[a+2036>>2]=j;if(j>>>0>(a+2072|0)>>>0){za(50960,50888,334,51e3)}else{i=d;return}}function lj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;if((b&1|0)!=0){za(51016,50888,339,51040)}if((b|0)!=0){jj(a,d,b);sj(a,b<<4)}d=a+2020|0;b=c[d>>2]|0;c[d>>2]=0;i=e;return b|0}function mj(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;do{if((f|0)>128e3){h=e+2024|0;c[h>>2]=c[h>>2]&31;h=e+2056|0;j=e+2040|0;while(1){k=j+2|0;b[j>>1]=0;if(k>>>0<h>>>0){j=k}else{break}}c[e+2036>>2]=k;c[e+2028>>2]=0;uj(e,0,0);h=f&3|64e3;n=f-h<<4;k=e+2012|0;c[k>>2]=0;j=e+2016|0;c[j>>2]=0;f=e+1996|0;m=c[f>>2]|0;l=c[e+2e3>>2]|0;c[f>>2]=n+127-l;sj(e,n);c[f>>2]=m+ -127+l+(c[f>>2]|0);k=c[k>>2]|0;a[e+92|0]=(k^255)&c[j>>2];a[e+76|0]=k;c[e+300>>2]=k&255;if(!((a[e+108|0]&32)==0)){f=h;break}j=(d[e+109|0]|0)<<8;f=((d[e+125|0]|0)<<11&30720)+j|0;Pl(e+j+2716|0,-1,((f|0)>65536?65536:f)-j|0)|0;f=h}}while(0);if((f&1|0)!=0){za(51016,50888,339,51040)}if((f|0)==0){m=e+2020|0;n=c[m>>2]|0;c[m>>2]=0;i=g;return n|0}k=e+2024|0;c[k>>2]=c[k>>2]&31;k=e+2056|0;j=e+2040|0;while(1){h=j+2|0;b[j>>1]=0;if(h>>>0<k>>>0){j=h}else{break}}c[e+2036>>2]=h;c[e+2028>>2]=0;uj(e,0,0);sj(e,f<<4);m=e+2020|0;n=c[m>>2]|0;c[m>>2]=0;i=g;return n|0}function nj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=b+2072|0;if((c[f>>2]|0)==(d|0)){i=e;return}c[f>>2]=d;f=(d|0)!=0;if(f){g=b+68188|0;j=b+2140|0;h=g+0|0;d=j+64|0;do{a[j]=a[h]|0;j=j+1|0;h=h+1|0}while((j|0)<(d|0))}else{g=b+68188|0}j=g+0|0;h=(f?b+2076|0:b+2140|0)+0|0;d=j+64|0;do{a[j]=a[h]|0;j=j+1|0;h=h+1|0}while((j|0)<(d|0));i=e;return}function oj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;switch(f|0){case 1:{if((d&16|0)!=0){a[b+1960|0]=0;a[b+1961|0]=0}if((d&32|0)==0){j=0}else{a[b+1962|0]=0;a[b+1963|0]=0;j=0}do{h=d>>>j&1;f=b+(j*24|0)+1884|0;n=c[f>>2]|0;do{if((n|0)!=(h|0)){o=b+(j*24|0)+1868|0;m=c[o>>2]|0;do{if((m|0)<=(e|0)){p=c[b+(j*24|0)+1872>>2]|0;l=(e-m|0)/(p|0)|0;k=l+1|0;c[o>>2]=(_(k,p)|0)+m;if((n|0)==0){break}n=c[b+(j*24|0)+1876>>2]|0;m=b+(j*24|0)+1880|0;o=c[m>>2]|0;l=l-(n+255-o&255)|0;if((l|0)>-1){k=(l|0)/(n|0)|0;p=b+(j*24|0)+1888|0;c[p>>2]=k+1+(c[p>>2]|0)&15;k=l-(_(k,n)|0)|0}else{k=o+k|0}c[m>>2]=k&255}}while(0);c[f>>2]=h;if((h|0)==0){break}c[b+(j*24|0)+1880>>2]=0;c[b+(j*24|0)+1888>>2]=0}}while(0);j=j+1|0;}while((j|0)!=3);d=d&128;e=b+2072|0;if((c[e>>2]|0)==(d|0)){i=g;return}c[e>>2]=d;e=(d|0)!=0;if(e){d=b+68188|0;f=b+2140|0;h=d+0|0;j=f+64|0;do{a[f]=a[h]|0;f=f+1|0;h=h+1|0}while((f|0)<(j|0))}else{d=b+68188|0}f=d+0|0;h=(e?b+2076|0:b+2140|0)+0|0;j=f+64|0;do{a[f]=a[h]|0;f=f+1|0;h=h+1|0}while((f|0)<(j|0));i=g;return};case 12:case 11:case 10:{h=f+ -10|0;f=(d+255&255)+1|0;d=b+(h*24|0)+1876|0;j=c[d>>2]|0;if((j|0)==(f|0)){i=g;return}k=b+(h*24|0)+1868|0;m=c[k>>2]|0;do{if((m|0)<=(e|0)){p=c[b+(h*24|0)+1872>>2]|0;l=(e-m|0)/(p|0)|0;e=l+1|0;c[k>>2]=(_(e,p)|0)+m;if((c[b+(h*24|0)+1884>>2]|0)==0){break}k=b+(h*24|0)+1880|0;m=c[k>>2]|0;l=l-(j+255-m&255)|0;if((l|0)>-1){p=(l|0)/(j|0)|0;b=b+(h*24|0)+1888|0;c[b>>2]=p+1+(c[b>>2]|0)&15;b=l-(_(p,j)|0)|0}else{b=m+e|0}c[k>>2]=b&255}}while(0);c[d>>2]=f;i=g;return};case 15:case 14:case 13:{if((d|0)>=4096){i=g;return}d=f+ -13|0;e=e+ -1|0;j=b+(d*24|0)+1868|0;f=c[j>>2]|0;do{if((f|0)<=(e|0)){p=c[b+(d*24|0)+1872>>2]|0;h=(e-f|0)/(p|0)|0;e=h+1|0;c[j>>2]=(_(e,p)|0)+f;if((c[b+(d*24|0)+1884>>2]|0)==0){break}k=c[b+(d*24|0)+1876>>2]|0;f=b+(d*24|0)+1880|0;j=c[f>>2]|0;h=h-(k+255-j&255)|0;if((h|0)>-1){e=(h|0)/(k|0)|0;p=b+(d*24|0)+1888|0;c[p>>2]=e+1+(c[p>>2]|0)&15;e=h-(_(e,k)|0)|0}else{e=j+e|0}c[f>>2]=e&255}}while(0);c[b+(d*24|0)+1888>>2]=0;i=g;return};case 9:case 8:{a[b+f+1956|0]=d;i=g;return};default:{i=g;return}}}function pj(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;j=b+1942|0;m=a[j]|0;k=b+1996|0;l=c[k>>2]|0;f=f-(a[b+(m&255)+1612|0]|0)-l|0;do{if((f|0)>-1){m=f+32&-32;c[k>>2]=m+l;vj(b,m);m=a[j]|0;h=7}else{if((l|0)!=127){h=7;break}if(m<<24>>24==76){m=b+2012|0;c[m>>2]=~d[b+92|0]&e|c[m>>2];m=76;break}else if(m<<24>>24==92){m=b+2016|0;c[m>>2]=c[m>>2]|e;m=b+2012|0;c[m>>2]=c[m>>2]&~e;m=92;break}else{h=7;break}}}while(0);do{if((h|0)==7){if(m<<24>>24>-1){break}i=g;return}}while(0);h=m&255;a[b+h|0]=e;j=h&15;if(j>>>0<2){e=j^h;j=a[b+e|0]|0;e=a[b+(e+1)|0]|0;f=_(e,j)|0;if((f|0)<(c[b+1564>>2]|0)){j=j>>7^j;e=e>>7^e}f=h>>>4;m=c[b+(f*140|0)+444>>2]|0;c[b+(f*140|0)+436>>2]=m&j;c[b+(f*140|0)+440>>2]=m&e;i=g;return}if((j|0)!=12){i=g;return}if((h|0)==124){a[b+124|0]=0;i=g;return}else if((h|0)==76){c[b+300>>2]=e&255;i=g;return}else{i=g;return}}function qj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;h=d&255;while(1){if((e|0)<64){j=3;break}j=b+(e+65472)+2716|0;if(!((a[j]|0)==h<<24>>24)){j=6;break}a[j]=-1;a[b+(e+ -64)+2716|0]=h;k=e+ -304|0;if(!((k|0)>-1)){j=14;break}if((k|0)<16){j=9;break}e=e+ -65536|0;if(!((e|0)>-1)){j=14;break}}if((j|0)==3){a[b+e+2140|0]=h;if((c[b+2072>>2]|0)==0){i=g;return}a[b+(e+65472)+2716|0]=a[b+e+2076|0]|0;i=g;return}else if((j|0)==6){za(51304,51344,406,51384)}else if((j|0)==9){a[b+k+1940|0]=h;if(!((k|0)!=2&(e+ -308|0)>>>0>3)){i=g;return}if((k|0)==3){pj(b,d,f);i=g;return}else{oj(b,d,f,k);i=g;return}}else if((j|0)==14){i=g;return}}function rj(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;while(1){j=e+ -240|0;if(!((j|0)>-1&(e+ -256|0)>>>0>65279)){k=18;break}h=e+ -253|0;if(h>>>0<3){k=4;break}if((h|0)<0){k=11;break}e=e+ -65536|0;if((e|0)>=256){k=17;break}}if((k|0)==4){e=b+(h*24|0)+1868|0;k=c[e>>2]|0;do{if((k|0)<=(f|0)){l=c[b+(h*24|0)+1872>>2]|0;j=(f-k|0)/(l|0)|0;f=j+1|0;c[e>>2]=(_(f,l)|0)+k;if((c[b+(h*24|0)+1884>>2]|0)==0){break}e=c[b+(h*24|0)+1876>>2]|0;k=b+(h*24|0)+1880|0;l=c[k>>2]|0;j=j-(e+255-l&255)|0;if((j|0)>-1){f=(j|0)/(e|0)|0;l=b+(h*24|0)+1888|0;c[l>>2]=f+1+(c[l>>2]|0)&15;f=j-(_(f,e)|0)|0}else{f=l+f|0}c[k>>2]=f&255}}while(0);e=b+(h*24|0)+1888|0;l=c[e>>2]|0;c[e>>2]=0;i=g;return l|0}else if((k|0)==11){k=e+ -242|0;if(!(k>>>0<2)){l=d[b+j+1956|0]|0;i=g;return l|0}h=b+1942|0;j=a[h]|0;e=j&255;if((k|0)!=1){l=e;i=g;return l|0}l=b+1996|0;k=c[l>>2]|0;f=f-(a[b+(e&127)+1612|0]|0)-k|0;if((f|0)>-1){j=f+32&-32;c[l>>2]=j+k;vj(b,j);j=a[h]|0}l=d[b+(j&127)|0]|0;i=g;return l|0}else if((k|0)==17){za(51400,51344,496,51448)}else if((k|0)==18){l=d[b+e+2716|0]|0;i=g;return l|0}return 0}function sj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=a+2e3|0;f=c[e>>2]|0;if((f|0)<(b|0)){tj(a,b)|0;f=c[e>>2]|0}h=f-b|0;c[e>>2]=h;g=a+2024|0;c[g>>2]=(c[g>>2]|0)+b;if(!((h+11|0)>>>0<12)){za(51464,51344,545,51512)}b=a+1868|0;g=c[b>>2]|0;do{if((g|0)<=0){h=c[a+1872>>2]|0;f=(0-g|0)/(h|0)|0;e=f+1|0;c[b>>2]=(_(e,h)|0)+g;if((c[a+1884>>2]|0)==0){break}g=c[a+1876>>2]|0;b=a+1880|0;h=c[b>>2]|0;f=f-(g+255-h&255)|0;if((f|0)>-1){e=(f|0)/(g|0)|0;h=a+1888|0;c[h>>2]=e+1+(c[h>>2]|0)&15;e=f-(_(e,g)|0)|0}else{e=h+e|0}c[b>>2]=e&255}}while(0);f=a+1892|0;g=c[f>>2]|0;do{if((g|0)<=0){h=c[a+1896>>2]|0;b=(0-g|0)/(h|0)|0;e=b+1|0;c[f>>2]=(_(e,h)|0)+g;if((c[a+1908>>2]|0)==0){break}g=c[a+1900>>2]|0;f=a+1904|0;h=c[f>>2]|0;b=b-(g+255-h&255)|0;if((b|0)>-1){e=(b|0)/(g|0)|0;h=a+1912|0;c[h>>2]=e+1+(c[h>>2]|0)&15;e=b-(_(e,g)|0)|0}else{e=h+e|0}c[f>>2]=e&255}}while(0);f=a+1916|0;g=c[f>>2]|0;do{if((g|0)<=0){h=c[a+1920>>2]|0;b=(0-g|0)/(h|0)|0;e=b+1|0;c[f>>2]=(_(e,h)|0)+g;if((c[a+1932>>2]|0)==0){break}h=c[a+1924>>2]|0;f=a+1928|0;g=c[f>>2]|0;b=b-(h+255-g&255)|0;if((b|0)>-1){e=(b|0)/(h|0)|0;g=a+1936|0;c[g>>2]=e+1+(c[g>>2]|0)&15;e=b-(_(e,h)|0)|0}else{e=g+e|0}c[f>>2]=e&255}}while(0);e=a+1996|0;b=c[e>>2]|0;do{if((b|0)<0){f=-29-b|0;if(!((f|0)>-1)){break}h=f+32&-32;c[e>>2]=h+b;vj(a,h)}}while(0);if((c[a+2028>>2]|0)==0){i=d;return}kj(a);i=d;return}



function $k(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;oa=i;o=d+504|0;Ga=c[o>>2]|0;r=d+156|0;Fa=c[r>>2]|0;q=d+272|0;Ja=c[q>>2]|0;p=d+388|0;Ka=c[p>>2]|0;j=d+4|0;k=d+144|0;l=d+376|0;m=d+260|0;n=d+492|0;s=c[a+8196>>2]|0;if((Fa+ -536870912|Ga+ -536870912|Ja+ -536870912|Ka+ -536870912|0)==0){i=oa;return}pa=d+100|0;la=d+120|0;ua=d+196|0;ma=d+124|0;qa=d+332|0;O=d+352|0;ta=d+428|0;P=d+356|0;ra=d+216|0;Y=d+236|0;A=d+312|0;Z=d+240|0;J=d+468|0;K=d+472|0;B=d;z=d+32|0;y=d+148|0;x=d+380|0;w=d+264|0;v=d+496|0;u=d+16|0;t=d+20|0;ia=d+164|0;ga=d+160|0;X=d+280|0;W=d+276|0;N=d+396|0;M=d+392|0;F=d+512|0;D=d+508|0;G=d+500|0;C=d+520|0;E=d+452|0;H=d+524|0;L=d+464|0;I=d+516|0;R=d+384|0;T=d+404|0;U=d+336|0;V=d+408|0;S=d+348|0;Q=d+400|0;aa=d+268|0;ea=d+288|0;ca=d+220|0;da=d+292|0;ba=d+232|0;$=d+284|0;ja=d+152|0;fa=d+172|0;ha=d+104|0;ka=d+176|0;h=d+116|0;na=d+168|0;sa=c[d+448>>2]|0;va=c[d+544>>2]|0;d=c[d+28>>2]|0;za=c[a+8192>>2]|0;wa=c[B>>2]|0;ya=c[K>>2]|0;xa=c[J>>2]|0;Ha=c[j>>2]|0;Ba=c[k>>2]|0;Ca=c[l>>2]|0;Da=c[m>>2]|0;Ea=c[n>>2]|0;while(1){za=za+s|0;Ia=za>>>18&1023;La=b[a+(Ia<<1)+26744>>1]|0;Aa=(b[a+(Fa>>16<<1)+10344>>1]|0)+(c[pa>>2]|0)|0;Fa=(b[a+(Ka>>16<<1)+10344>>1]|0)+(c[qa>>2]|0)|0;Ma=(b[a+(Ja>>16<<1)+10344>>1]|0)+(c[ra>>2]|0)|0;Ga=(b[a+(Ga>>16<<1)+10344>>1]|0)+sa|0;Aa=c[a+((b[a+((((wa+Ha>>d)+Ba|0)>>>14&4095)<<1)>>1]|0)+(Aa-(c[ma>>2]|0)>>31&(La>>c[ua>>2])+(Aa^c[la>>2]))<<2)+30840>>2]|0;Ha=(c[a+((b[a+((Ea>>>14&4095)<<1)>>1]|0)+(Ga-ya>>31&(La>>va)+(Ga^xa))<<2)+30840>>2]|0)+wa+(c[a+((b[a+((Ca>>>14&4095)<<1)>>1]|0)+(Fa-(c[P>>2]|0)>>31&(La>>c[ta>>2])+(Fa^c[O>>2]))<<2)+30840>>2]|0)+(c[a+((b[a+((Da>>>14&4095)<<1)>>1]|0)+(Ma-(c[Z>>2]|0)>>31&(La>>c[A>>2])+(Ma^c[Y>>2]))<<2)+30840>>2]|0)>>16;Ga=((_(b[a+(Ia<<1)+28792>>1]|0,c[z>>2]|0)|0)>>10)+256|0;Ba=((_(Ga,c[y>>2]|0)|0)>>>8)+Ba|0;Ca=((_(Ga,c[x>>2]|0)|0)>>>8)+Ca|0;Da=((_(c[w>>2]|0,Ga)|0)>>>8)+Da|0;Ea=((_(c[v>>2]|0,Ga)|0)>>>8)+Ea|0;Ga=(c[u>>2]&Ha)+(e[f>>1]|0)|0;Ia=f+2|0;Ha=(c[t>>2]&Ha)+(e[Ia>>1]|0)|0;Ma=c[ia>>2]|0;Fa=(c[r>>2]|0)+(c[ga>>2]|0)|0;c[r>>2]=Fa;a:do{if((Fa|0)>=(Ma|0)){Ja=c[ja>>2]|0;do{if((Ja|0)==0){c[r>>2]=268435456;c[ga>>2]=c[fa>>2];c[ia>>2]=c[ha>>2];c[ja>>2]=1;Fa=268435456;break a}else if((Ja|0)==1){Fa=c[ha>>2]|0;c[r>>2]=Fa;c[ga>>2]=c[ka>>2];c[ia>>2]=536870912;c[ja>>2]=2;break a}else if((Ja|0)==2){Fa=c[h>>2]|0;if((Fa&8|0)==0){break}if((Fa&1|0)==0){c[r>>2]=0;c[ga>>2]=c[na>>2];c[ia>>2]=268435456;c[ja>>2]=0;Ma=Fa<<1&4;c[la>>2]=0;c[ma>>2]=2147483647;c[h>>2]=Ma;if((Ma|0)==0){Fa=0;break a}c[la>>2]=4095;c[ma>>2]=4095;Fa=0;break a}else{Ma=Fa<<1&4;c[la>>2]=0;c[ma>>2]=2147483647;c[h>>2]=Ma;if((Ma|0)==0){break}c[la>>2]=4095;c[ma>>2]=4095;break}}else if((Ja|0)!=3){break a}}while(0);c[r>>2]=536870912;c[ga>>2]=0;c[ia>>2]=536870913;Fa=536870912}}while(0);Ma=c[X>>2]|0;Ja=(c[q>>2]|0)+(c[W>>2]|0)|0;c[q>>2]=Ja;b:do{if((Ja|0)>=(Ma|0)){Ka=c[aa>>2]|0;do{if((Ka|0)==2){Ja=c[ba>>2]|0;if((Ja&8|0)==0){break}if((Ja&1|0)==0){c[q>>2]=0;c[W>>2]=c[$>>2];c[X>>2]=268435456;c[aa>>2]=0;Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[ba>>2]=Ma;if((Ma|0)==0){Ja=0;break b}c[Y>>2]=4095;c[Z>>2]=4095;Ja=0;break b}else{Ma=Ja<<1&4;c[Y>>2]=0;c[Z>>2]=2147483647;c[ba>>2]=Ma;if((Ma|0)==0){break}c[Y>>2]=4095;c[Z>>2]=4095;break}}else if((Ka|0)==1){Ja=c[ca>>2]|0;c[q>>2]=Ja;c[W>>2]=c[da>>2];c[X>>2]=536870912;c[aa>>2]=2;break b}else if((Ka|0)==0){c[q>>2]=268435456;c[W>>2]=c[ea>>2];c[X>>2]=c[ca>>2];c[aa>>2]=1;Ja=268435456;break b}else if((Ka|0)!=3){break b}}while(0);c[q>>2]=536870912;c[W>>2]=0;c[X>>2]=536870913;Ja=536870912}}while(0);Ma=c[N>>2]|0;Ka=(c[p>>2]|0)+(c[M>>2]|0)|0;c[p>>2]=Ka;c:do{if((Ka|0)>=(Ma|0)){La=c[R>>2]|0;do{if((La|0)==2){Ka=c[S>>2]|0;if((Ka&8|0)==0){break}if((Ka&1|0)==0){c[p>>2]=0;c[M>>2]=c[Q>>2];c[N>>2]=268435456;c[R>>2]=0;Ma=Ka<<1&4;c[O>>2]=0;c[P>>2]=2147483647;c[S>>2]=Ma;if((Ma|0)==0){Ka=0;break c}c[O>>2]=4095;c[P>>2]=4095;Ka=0;break c}else{Ma=Ka<<1&4;c[O>>2]=0;c[P>>2]=2147483647;c[S>>2]=Ma;if((Ma|0)==0){break}c[O>>2]=4095;c[P>>2]=4095;break}}else if((La|0)==0){c[p>>2]=268435456;c[M>>2]=c[T>>2];c[N>>2]=c[U>>2];c[R>>2]=1;Ka=268435456;break c}else if((La|0)==1){Ka=c[U>>2]|0;c[p>>2]=Ka;c[M>>2]=c[V>>2];c[N>>2]=536870912;c[R>>2]=2;break c}else if((La|0)!=3){break c}}while(0);c[p>>2]=536870912;c[M>>2]=0;c[N>>2]=536870913;Ka=536870912}}while(0);Ma=c[F>>2]|0;La=(c[o>>2]|0)+(c[D>>2]|0)|0;c[o>>2]=La;d:do{if((La|0)>=(Ma|0)){Ma=c[G>>2]|0;do{if((Ma|0)==0){c[o>>2]=268435456;c[D>>2]=c[C>>2];c[F>>2]=c[E>>2];c[G>>2]=1;La=268435456;break d}else if((Ma|0)==1){La=c[E>>2]|0;c[o>>2]=La;c[D>>2]=c[H>>2];c[F>>2]=536870912;c[G>>2]=2;break d}else if((Ma|0)==2){La=c[L>>2]|0;if((La&8|0)==0){break}if((La&1|0)==0){c[o>>2]=0;c[D>>2]=c[I>>2];c[F>>2]=268435456;c[G>>2]=0;Ma=La<<1&4;c[J>>2]=0;c[K>>2]=2147483647;c[L>>2]=Ma;if((Ma|0)==0){ya=2147483647;xa=0;La=0;break d}c[J>>2]=4095;c[K>>2]=4095;ya=4095;xa=4095;La=0;break d}else{Ma=La<<1&4;c[J>>2]=0;c[K>>2]=2147483647;c[L>>2]=Ma;if((Ma|0)==0){ya=2147483647;xa=0;break}c[J>>2]=4095;c[K>>2]=4095;ya=4095;xa=4095;break}}else if((Ma|0)!=3){break d}}while(0);c[o>>2]=536870912;c[D>>2]=0;c[F>>2]=536870913;La=536870912}}while(0);c[B>>2]=Aa;b[f>>1]=Ga;b[Ia>>1]=Ha;g=g+ -1|0;if((g|0)==0){break}f=f+4|0;Ga=La;Ha=wa;wa=Aa}c[j>>2]=wa;c[k>>2]=Ba;c[l>>2]=Ca;c[m>>2]=Da;c[n>>2]=Ea;i=oa;return}function al(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+8|0;f=d;g=sa(b|0,46)|0;g=(g|0)==0?b:g+1|0;b=f;h=0;while(1){j=(Ta(a[g+h|0]|0)|0)&255;a[f+h|0]=j;h=h+1|0;if(j<<24>>24==0){break}if((h|0)<6){}else{e=4;break}}if((e|0)==4){a[b]=0}do{if((a[55280]|0)==0){if((va(55280)|0)==0){break}c[13808]=c[9016];c[55236>>2]=c[9866];c[55240>>2]=c[10172];c[55244>>2]=c[10502];c[55248>>2]=c[10872];c[55252>>2]=c[11798];c[55256>>2]=c[12172];c[55260>>2]=c[12384];c[55264>>2]=c[13324];c[55268>>2]=c[13514];c[55272>>2]=c[13536];c[55276>>2]=0;Fa(55280)}}while(0);e=c[13808]|0;if((e|0)==0){j=0;i=d;return j|0}else{f=55232}while(1){f=f+4|0;if((Kl(b,c[e+16>>2]|0)|0)==0){b=e;e=11;break}e=c[f>>2]|0;if((e|0)==0){b=0;e=11;break}else{}}if((e|0)==11){i=d;return b|0}return 0}function bl(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g;if((b|0)!=0&(a|0)==0|(e|0)==0){za(55376,55400,131,55432)}c[e>>2]=0;do{if((b|0)>3){j=(d[a+1|0]|0)<<16|(d[a]|0)<<24|(d[a+2|0]|0)<<8|(d[a+3|0]|0);if((j|0)==1449618720){j=55360}else if((j|0)==1396789261){j=55344}else if((j|0)==1212502861){j=55312}else if((j|0)==1263752024|(j|0)==1263747907){j=55320}else if((j|0)==1195528961){j=55296}else if((j|0)==1313166157){j=55328}else if((j|0)==1314080325){j=55336}else if((j|0)==1397638483){j=55352}else if((j|0)==1515733337){j=55288}else if((j|0)==1197034840){j=55304}else{j=55368}j=al(j)|0;if((j|0)==0){break}f=cl(j,f)|0;if((f|0)==0){j=55448;i=g;return j|0}bd(h,a,b);h=Le(f,h)|0;if((h|0)==0){c[e>>2]=f;j=0;i=g;return j|0}else{ib[c[(c[f>>2]|0)+4>>2]&127](f);j=h;i=g;return j|0}}}while(0);j=c[10038]|0;i=g;return j|0}function cl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;if((a|0)==0){g=0;i=d;return g|0}if((b|0)==-1){g=hb[c[a+12>>2]&31]()|0;i=d;return g|0}e=hb[c[a+8>>2]&31]()|0;if((e|0)==0){g=0;i=d;return g|0}a=a+20|0;do{if((c[a>>2]&1|0)!=0){g=zl(512)|0;if((g|0)==0){c[e+312>>2]=0;break}else{ud(g,0);c[e+312>>2]=g;jb[c[(c[e>>2]|0)+36>>2]&31](e,g);break}}}while(0);if((c[a>>2]&1|0)==0){f=11}else{if((c[e+312>>2]|0)!=0){f=11}}do{if((f|0)==11){f=(Fg(e,b)|0)==0;if(f){e=f?e:0}else{break}i=d;return e|0}}while(0);ib[c[(c[e>>2]|0)+4>>2]&127](e);g=0;i=d;return g|0}function dl(a){a=a|0;i=i;return c[a+8>>2]|0}function el(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;c[b>>2]=0;f=zl(1936)|0;if((f|0)==0){l=55448;i=e;return l|0}d=Pe(a,f+128|0,d)|0;if((d|0)!=0){Al(f);l=d;i=e;return l|0}d=f;k=f;c[k>>2]=c[f+132>>2];a=f+4|0;c[a>>2]=c[f+136>>2];g=c[f+140>>2]|0;c[f+8>>2]=g;j=f+92|0;l=f+16|0;h=l+48|0;do{c[l>>2]=-1;l=l+4|0}while((l|0)<(h|0));c[j>>2]=55368;c[f+96>>2]=55368;c[f+100>>2]=55368;c[f+104>>2]=55368;c[f+108>>2]=55368;c[f+112>>2]=55368;c[f+116>>2]=55368;c[f+120>>2]=55368;c[f+124>>2]=55368;c[f+64>>2]=f+144;c[f+68>>2]=f+400;c[f+72>>2]=f+656;c[f+76>>2]=f+912;c[f+80>>2]=f+1168;c[f+84>>2]=f+1424;c[f+88>>2]=f+1680;l=c[k>>2]|0;f=f+12|0;c[f>>2]=l;if((l|0)<1){a=(g<<1)+(c[a>>2]|0)|0;c[f>>2]=(a|0)<1?15e4:a}c[b>>2]=d;l=0;i=e;return l|0}function fl(a,b){a=a|0;b=b|0;var c=0;c=i;a=Lg(a,b)|0;i=c;return a|0}function gl(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;a=Og(a,b,c)|0;i=d;return a|0}function hl(a){a=a|0;i=i;return}function il(a){a=a|0;i=i;return}function jl(a){a=a|0;i=i;return}function kl(a){a=a|0;i=i;return}function ll(a){a=a|0;var b=0;b=i;Fl(a);i=b;return}function ml(a){a=a|0;var b=0;b=i;Fl(a);i=b;return}function nl(a){a=a|0;var b=0;b=i;Fl(a);i=b;return}function ol(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e;if((a|0)==(b|0)){j=1;i=e;return j|0}if((b|0)==0){j=0;i=e;return j|0}g=sl(b,55528,55584,0)|0;b=g;if((g|0)==0){j=0;i=e;return j|0}j=f+0|0;h=j+56|0;do{c[j>>2]=0;j=j+4|0}while((j|0)<(h|0));c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;pb[c[(c[g>>2]|0)+28>>2]&15](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){j=0;i=e;return j|0}c[d>>2]=c[f+16>>2];j=1;i=e;return j|0}function pl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((c[d+8>>2]|0)!=(b|0)){i=g;return}b=d+16|0;h=c[b>>2]|0;if((h|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function ql(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((b|0)!=(c[d+8>>2]|0)){h=c[b+8>>2]|0;pb[c[(c[h>>2]|0)+28>>2]&15](h,d,e,f);i=g;return}b=d+16|0;h=c[b>>2]|0;if((h|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function rl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;if((b|0)==(c[d+8>>2]|0)){j=d+16|0;h=c[j>>2]|0;if((h|0)==0){c[j>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){m=d+36|0;c[m>>2]=(c[m>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}k=c[b+12>>2]|0;h=b+(k<<3)+16|0;j=c[b+20>>2]|0;l=j>>8;if((j&1|0)!=0){l=c[(c[e>>2]|0)+l>>2]|0}m=c[b+16>>2]|0;pb[c[(c[m>>2]|0)+28>>2]&15](m,d,e+l|0,(j&2|0)!=0?f:2);if((k|0)<=1){i=g;return}k=d+54|0;j=e;l=b+24|0;while(1){b=c[l+4>>2]|0;m=b>>8;if((b&1|0)!=0){m=c[(c[j>>2]|0)+m>>2]|0}n=c[l>>2]|0;pb[c[(c[n>>2]|0)+28>>2]&15](n,d,e+m|0,(b&2|0)!=0?f:2);if((a[k]|0)!=0){f=16;break}l=l+8|0;if(!(l>>>0<h>>>0)){f=16;break}}if((f|0)==16){i=g;return}}function sl(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+56|0;m=h;l=c[d>>2]|0;k=d+(c[l+ -8>>2]|0)|0;l=c[l+ -4>>2]|0;j=l;c[m>>2]=f;c[m+4>>2]=d;c[m+8>>2]=e;c[m+12>>2]=g;g=m+16|0;p=m+20|0;o=m+24|0;n=m+28|0;d=m+32|0;e=m+40|0;q=(l|0)==(f|0);r=g;f=r+0|0;s=f+36|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(s|0));b[r+36>>1]=0;a[r+38|0]=0;if(q){c[m+48>>2]=1;nb[c[(c[l>>2]|0)+20>>2]&3](j,m,k,k,1,0);s=(c[o>>2]|0)==1?k:0;i=h;return s|0}gb[c[(c[l>>2]|0)+24>>2]&15](j,m,k,1,0);j=c[m+36>>2]|0;if((j|0)==1){do{if((c[o>>2]|0)!=1){if((c[e>>2]|0)!=0){s=0;i=h;return s|0}if((c[n>>2]|0)!=1){s=0;i=h;return s|0}if((c[d>>2]|0)==1){break}else{j=0}i=h;return j|0}}while(0);s=c[g>>2]|0;i=h;return s|0}else if((j|0)==0){if((c[e>>2]|0)!=1){s=0;i=h;return s|0}if((c[n>>2]|0)!=1){s=0;i=h;return s|0}s=(c[d>>2]|0)==1?c[p>>2]|0:0;i=h;return s|0}else{s=0;i=h;return s|0}return 0}function tl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=i;l=b;if((l|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}d=d+28|0;if((c[d>>2]|0)==1){i=h;return}c[d>>2]=f;i=h;return}if((l|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){l=d+20|0;if((c[l>>2]|0)==(e|0)){break}c[d+32>>2]=f;m=d+44|0;if((c[m>>2]|0)==4){i=h;return}x=c[b+12>>2]|0;n=b+(x<<3)+16|0;a:do{if((x|0)>0){s=d+52|0;t=d+53|0;u=d+54|0;q=b+8|0;r=d+24|0;o=e;v=0;p=0;b=b+16|0;b:do{a[s]=0;a[t]=0;w=c[b+4>>2]|0;x=w>>8;if((w&1|0)!=0){x=c[(c[o>>2]|0)+x>>2]|0}y=c[b>>2]|0;nb[c[(c[y>>2]|0)+20>>2]&3](y,d,e,e+x|0,2-(w>>>1&1)|0,g);if((a[u]|0)!=0){break}do{if((a[t]|0)!=0){if((a[s]|0)==0){if((c[q>>2]&1|0)==0){p=1;break b}else{p=1;break}}if((c[r>>2]|0)==1){b=27;break a}if((c[q>>2]&2|0)==0){b=27;break a}else{v=1;p=1}}}while(0);b=b+8|0;}while(b>>>0<n>>>0);if(v){k=p;b=26}else{j=p;b=23}}else{j=0;b=23}}while(0);do{if((b|0)==23){c[l>>2]=e;y=d+40|0;c[y>>2]=(c[y>>2]|0)+1;if((c[d+36>>2]|0)!=1){k=j;b=26;break}if((c[d+24>>2]|0)!=2){k=j;b=26;break}a[d+54|0]=1;if(j){b=27}else{b=28}}}while(0);if((b|0)==26){if(k){b=27}else{b=28}}if((b|0)==27){c[m>>2]=3;i=h;return}else if((b|0)==28){c[m>>2]=4;i=h;return}}}while(0);if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}l=c[b+12>>2]|0;j=b+(l<<3)+16|0;k=c[b+20>>2]|0;m=k>>8;if((k&1|0)!=0){m=c[(c[e>>2]|0)+m>>2]|0}y=c[b+16>>2]|0;gb[c[(c[y>>2]|0)+24>>2]&15](y,d,e+m|0,(k&2|0)!=0?f:2,g);k=b+24|0;if((l|0)<=1){i=h;return}m=c[b+8>>2]|0;do{if((m&2|0)==0){l=d+36|0;if((c[l>>2]|0)==1){break}if((m&1|0)==0){b=d+54|0;m=e;o=k;while(1){if((a[b]|0)!=0){b=53;break}if((c[l>>2]|0)==1){b=53;break}n=c[o+4>>2]|0;p=n>>8;if((n&1|0)!=0){p=c[(c[m>>2]|0)+p>>2]|0}y=c[o>>2]|0;gb[c[(c[y>>2]|0)+24>>2]&15](y,d,e+p|0,(n&2|0)!=0?f:2,g);o=o+8|0;if(!(o>>>0<j>>>0)){b=53;break}}if((b|0)==53){i=h;return}}n=d+24|0;m=d+54|0;b=e;p=k;while(1){if((a[m]|0)!=0){b=53;break}if((c[l>>2]|0)==1){if((c[n>>2]|0)==1){b=53;break}}o=c[p+4>>2]|0;q=o>>8;if((o&1|0)!=0){q=c[(c[b>>2]|0)+q>>2]|0}y=c[p>>2]|0;gb[c[(c[y>>2]|0)+24>>2]&15](y,d,e+q|0,(o&2|0)!=0?f:2,g);p=p+8|0;if(!(p>>>0<j>>>0)){b=53;break}}if((b|0)==53){i=h;return}}}while(0);l=d+54|0;m=e;while(1){if((a[l]|0)!=0){b=53;break}b=c[k+4>>2]|0;n=b>>8;if((b&1|0)!=0){n=c[(c[m>>2]|0)+n>>2]|0}y=c[k>>2]|0;gb[c[(c[y>>2]|0)+24>>2]&15](y,d,e+n|0,(b&2|0)!=0?f:2,g);k=k+8|0;if(!(k>>>0<j>>>0)){b=53;break}}if((b|0)==53){i=h;return}}function ul(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;k=b;if((k|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}d=d+28|0;if((c[d>>2]|0)==1){i=h;return}c[d>>2]=f;i=h;return}if((k|0)!=(c[d>>2]|0)){l=c[b+8>>2]|0;gb[c[(c[l>>2]|0)+24>>2]&15](l,d,e,f,g);i=h;return}do{if((c[d+16>>2]|0)!=(e|0)){k=d+20|0;if((c[k>>2]|0)==(e|0)){break}c[d+32>>2]=f;f=d+44|0;if((c[f>>2]|0)==4){i=h;return}l=d+52|0;a[l]=0;m=d+53|0;a[m]=0;b=c[b+8>>2]|0;nb[c[(c[b>>2]|0)+20>>2]&3](b,d,e,e,1,g);if((a[m]|0)==0){g=0;j=13}else{if((a[l]|0)==0){g=1;j=13}}a:do{if((j|0)==13){c[k>>2]=e;m=d+40|0;c[m>>2]=(c[m>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){j=16;break}a[d+54|0]=1;if(g){break a}}else{j=16}}while(0);if((j|0)==16){if(g){break}}c[f>>2]=4;i=h;return}}while(0);c[f>>2]=3;i=h;return}}while(0);if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}function vl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=i;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){i=g;return}d=d+28|0;if((c[d>>2]|0)==1){i=g;return}c[d>>2]=f;i=g;return}if((c[d>>2]|0)!=(b|0)){i=g;return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;i=g;return}}while(0);if((f|0)!=1){i=g;return}c[d+32>>2]=1;i=g;return}function wl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;j=i;if((b|0)!=(c[d+8>>2]|0)){m=d+52|0;l=a[m]|0;o=d+53|0;n=a[o]|0;q=c[b+12>>2]|0;k=b+(q<<3)+16|0;a[m]=0;a[o]=0;p=c[b+20>>2]|0;r=p>>8;if((p&1|0)!=0){r=c[(c[f>>2]|0)+r>>2]|0}u=c[b+16>>2]|0;nb[c[(c[u>>2]|0)+20>>2]&3](u,d,e,f+r|0,(p&2|0)!=0?g:2,h);a:do{if((q|0)>1){r=d+24|0;q=b+8|0;s=d+54|0;p=f;b=b+24|0;do{if((a[s]|0)!=0){break a}do{if((a[m]|0)==0){if((a[o]|0)==0){break}if((c[q>>2]&1|0)==0){break a}}else{if((c[r>>2]|0)==1){break a}if((c[q>>2]&2|0)==0){break a}}}while(0);a[m]=0;a[o]=0;t=c[b+4>>2]|0;u=t>>8;if((t&1|0)!=0){u=c[(c[p>>2]|0)+u>>2]|0}v=c[b>>2]|0;nb[c[(c[v>>2]|0)+20>>2]&3](v,d,e,f+u|0,(t&2|0)!=0?g:2,h);b=b+8|0;}while(b>>>0<k>>>0)}}while(0);a[m]=l;a[o]=n;i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;k=d+16|0;l=c[k>>2]|0;if((l|0)==0){c[k>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((l|0)!=(e|0)){v=d+36|0;c[v>>2]=(c[v>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;k=c[e>>2]|0;if((k|0)==2){c[e>>2]=g}else{g=k}if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function xl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0;j=i;if((b|0)!=(c[d+8>>2]|0)){b=c[b+8>>2]|0;nb[c[(c[b>>2]|0)+20>>2]&3](b,d,e,f,g,h);i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;b=d+16|0;f=c[b>>2]|0;if((f|0)==0){c[b>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((f|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g}else{g=b}if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function yl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;h=i;if((c[d+8>>2]|0)!=(b|0)){i=h;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=h;return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}if((b|0)!=(e|0)){b=d+36|0;c[b>>2]=(c[b>>2]|0)+1;a[d+54|0]=1;i=h;return}e=d+24|0;f=c[e>>2]|0;if((f|0)==2){c[e>>2]=g}else{g=f}if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}function zl(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;b=i;do{if(a>>>0<245){if(a>>>0<11){a=16}else{a=a+11&-8}p=a>>>3;n=c[13958]|0;o=n>>>p;if((o&3|0)!=0){d=(o&1^1)+p|0;j=d<<1;g=55872+(j<<2)|0;j=55872+(j+2<<2)|0;e=c[j>>2]|0;f=e+8|0;h=c[f>>2]|0;do{if((g|0)==(h|0)){c[13958]=n&~(1<<d)}else{if(h>>>0<(c[55848>>2]|0)>>>0){Ya()}k=h+12|0;if((c[k>>2]|0)==(e|0)){c[k>>2]=g;c[j>>2]=h;break}else{Ya()}}}while(0);z=d<<3;c[e+4>>2]=z|3;z=e+(z|4)|0;c[z>>2]=c[z>>2]|1;z=f;i=b;return z|0}if(!(a>>>0>(c[55840>>2]|0)>>>0)){break}if((o|0)!=0){e=2<<p;e=o<<p&(e|0-e);e=(e&0-e)+ -1|0;d=e>>>12&16;e=e>>>d;g=e>>>5&8;e=e>>>g;f=e>>>2&4;e=e>>>f;h=e>>>1&2;e=e>>>h;j=e>>>1&1;j=(g|d|f|h|j)+(e>>>j)|0;e=j<<1;h=55872+(e<<2)|0;e=55872+(e+2<<2)|0;f=c[e>>2]|0;d=f+8|0;g=c[d>>2]|0;do{if((h|0)==(g|0)){c[13958]=n&~(1<<j)}else{if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}k=g+12|0;if((c[k>>2]|0)==(f|0)){c[k>>2]=h;c[e>>2]=g;break}else{Ya()}}}while(0);h=j<<3;e=h-a|0;c[f+4>>2]=a|3;z=f;f=z+a|0;c[z+(a|4)>>2]=e|1;c[z+h>>2]=e;h=c[55840>>2]|0;if((h|0)!=0){g=c[55852>>2]|0;k=h>>>3;j=k<<1;h=55872+(j<<2)|0;l=c[13958]|0;k=1<<k;do{if((l&k|0)==0){c[13958]=l|k;u=55872+(j+2<<2)|0;v=h}else{k=55872+(j+2<<2)|0;j=c[k>>2]|0;if(!(j>>>0<(c[55848>>2]|0)>>>0)){u=k;v=j;break}Ya()}}while(0);c[u>>2]=g;c[v+12>>2]=g;c[g+8>>2]=v;c[g+12>>2]=h}c[55840>>2]=e;c[55852>>2]=f;z=d;i=b;return z|0}n=c[55836>>2]|0;if((n|0)==0){break}d=(n&0-n)+ -1|0;y=d>>>12&16;d=d>>>y;x=d>>>5&8;d=d>>>x;z=d>>>2&4;d=d>>>z;f=d>>>1&2;d=d>>>f;e=d>>>1&1;e=c[56136+((x|y|z|f|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-a|0;f=e;while(1){g=c[f+16>>2]|0;if((g|0)==0){g=c[f+20>>2]|0;if((g|0)==0){break}}f=(c[g+4>>2]&-8)-a|0;h=f>>>0<d>>>0;d=h?f:d;f=g;e=h?g:e}g=e;j=c[55848>>2]|0;if(g>>>0<j>>>0){Ya()}z=g+a|0;f=z;if(!(g>>>0<z>>>0)){Ya()}h=c[e+24>>2]|0;k=c[e+12>>2]|0;do{if((k|0)==(e|0)){l=e+20|0;k=c[l>>2]|0;if((k|0)==0){l=e+16|0;k=c[l>>2]|0;if((k|0)==0){t=0;break}}while(1){n=k+20|0;m=c[n>>2]|0;if((m|0)!=0){l=n;k=m;continue}n=k+16|0;m=c[n>>2]|0;if((m|0)==0){break}else{k=m;l=n}}if(l>>>0<j>>>0){Ya()}else{c[l>>2]=0;t=k;break}}else{l=c[e+8>>2]|0;if(l>>>0<j>>>0){Ya()}m=l+12|0;if((c[m>>2]|0)!=(e|0)){Ya()}j=k+8|0;if((c[j>>2]|0)==(e|0)){c[m>>2]=k;c[j>>2]=l;t=k;break}else{Ya()}}}while(0);a:do{if((h|0)!=0){j=c[e+28>>2]|0;k=56136+(j<<2)|0;do{if((e|0)==(c[k>>2]|0)){c[k>>2]=t;if((t|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<j);break a}else{if(h>>>0<(c[55848>>2]|0)>>>0){Ya()}j=h+16|0;if((c[j>>2]|0)==(e|0)){c[j>>2]=t}else{c[h+20>>2]=t}if((t|0)==0){break a}}}while(0);if(t>>>0<(c[55848>>2]|0)>>>0){Ya()}c[t+24>>2]=h;h=c[e+16>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[t+16>>2]=h;c[h+24>>2]=t;break}}}while(0);h=c[e+20>>2]|0;if((h|0)==0){break}if(h>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[t+20>>2]=h;c[h+24>>2]=t;break}}}while(0);if(d>>>0<16){z=d+a|0;c[e+4>>2]=z|3;z=g+(z+4)|0;c[z>>2]=c[z>>2]|1}else{c[e+4>>2]=a|3;c[g+(a|4)>>2]=d|1;c[g+(d+a)>>2]=d;h=c[55840>>2]|0;if((h|0)!=0){g=c[55852>>2]|0;k=h>>>3;j=k<<1;h=55872+(j<<2)|0;l=c[13958]|0;k=1<<k;do{if((l&k|0)==0){c[13958]=l|k;r=55872+(j+2<<2)|0;s=h}else{k=55872+(j+2<<2)|0;j=c[k>>2]|0;if(!(j>>>0<(c[55848>>2]|0)>>>0)){r=k;s=j;break}Ya()}}while(0);c[r>>2]=g;c[s+12>>2]=g;c[g+8>>2]=s;c[g+12>>2]=h}c[55840>>2]=d;c[55852>>2]=f}z=e+8|0;i=b;return z|0}else{if(a>>>0>4294967231){a=-1;break}r=a+11|0;a=r&-8;t=c[55836>>2]|0;if((t|0)==0){break}s=0-a|0;r=r>>>8;do{if((r|0)==0){u=0}else{if(a>>>0>16777215){u=31;break}y=(r+1048320|0)>>>16&8;z=r<<y;x=(z+520192|0)>>>16&4;z=z<<x;u=(z+245760|0)>>>16&2;u=14-(x|y|u)+(z<<u>>>15)|0;u=a>>>(u+7|0)&1|u<<1}}while(0);x=c[56136+(u<<2)>>2]|0;b:do{if((x|0)==0){v=0;r=0}else{if((u|0)==31){r=0}else{r=25-(u>>>1)|0}v=0;w=a<<r;r=0;while(1){z=c[x+4>>2]&-8;y=z-a|0;if(y>>>0<s>>>0){if((z|0)==(a|0)){s=y;v=x;r=x;break b}else{s=y;r=x}}y=c[x+20>>2]|0;x=c[x+(w>>>31<<2)+16>>2]|0;v=(y|0)==0|(y|0)==(x|0)?v:y;if((x|0)==0){break}else{w=w<<1}}}}while(0);if((v|0)==0&(r|0)==0){z=2<<u;t=t&(z|0-z);if((t|0)==0){break}z=(t&0-t)+ -1|0;w=z>>>12&16;z=z>>>w;u=z>>>5&8;z=z>>>u;x=z>>>2&4;z=z>>>x;y=z>>>1&2;z=z>>>y;v=z>>>1&1;v=c[56136+((u|w|x|y|v)+(z>>>v)<<2)>>2]|0}if((v|0)!=0){while(1){u=(c[v+4>>2]&-8)-a|0;t=u>>>0<s>>>0;s=t?u:s;r=t?v:r;t=c[v+16>>2]|0;if((t|0)!=0){v=t;continue}v=c[v+20>>2]|0;if((v|0)==0){break}}}if((r|0)==0){break}if(!(s>>>0<((c[55840>>2]|0)-a|0)>>>0)){break}d=r;h=c[55848>>2]|0;if(d>>>0<h>>>0){Ya()}f=d+a|0;e=f;if(!(d>>>0<f>>>0)){Ya()}g=c[r+24>>2]|0;j=c[r+12>>2]|0;do{if((j|0)==(r|0)){k=r+20|0;j=c[k>>2]|0;if((j|0)==0){k=r+16|0;j=c[k>>2]|0;if((j|0)==0){q=0;break}}while(1){l=j+20|0;m=c[l>>2]|0;if((m|0)!=0){k=l;j=m;continue}l=j+16|0;m=c[l>>2]|0;if((m|0)==0){break}else{j=m;k=l}}if(k>>>0<h>>>0){Ya()}else{c[k>>2]=0;q=j;break}}else{k=c[r+8>>2]|0;if(k>>>0<h>>>0){Ya()}h=k+12|0;if((c[h>>2]|0)!=(r|0)){Ya()}l=j+8|0;if((c[l>>2]|0)==(r|0)){c[h>>2]=j;c[l>>2]=k;q=j;break}else{Ya()}}}while(0);c:do{if((g|0)!=0){j=c[r+28>>2]|0;h=56136+(j<<2)|0;do{if((r|0)==(c[h>>2]|0)){c[h>>2]=q;if((q|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<j);break c}else{if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}h=g+16|0;if((c[h>>2]|0)==(r|0)){c[h>>2]=q}else{c[g+20>>2]=q}if((q|0)==0){break c}}}while(0);if(q>>>0<(c[55848>>2]|0)>>>0){Ya()}c[q+24>>2]=g;g=c[r+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[q+16>>2]=g;c[g+24>>2]=q;break}}}while(0);g=c[r+20>>2]|0;if((g|0)==0){break}if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[q+20>>2]=g;c[g+24>>2]=q;break}}}while(0);d:do{if(s>>>0<16){z=s+a|0;c[r+4>>2]=z|3;z=d+(z+4)|0;c[z>>2]=c[z>>2]|1}else{c[r+4>>2]=a|3;c[d+(a|4)>>2]=s|1;c[d+(s+a)>>2]=s;g=s>>>3;if(s>>>0<256){j=g<<1;f=55872+(j<<2)|0;h=c[13958]|0;g=1<<g;do{if((h&g|0)==0){c[13958]=h|g;p=55872+(j+2<<2)|0;o=f}else{h=55872+(j+2<<2)|0;g=c[h>>2]|0;if(!(g>>>0<(c[55848>>2]|0)>>>0)){p=h;o=g;break}Ya()}}while(0);c[p>>2]=e;c[o+12>>2]=e;c[d+(a+8)>>2]=o;c[d+(a+12)>>2]=f;break}e=s>>>8;do{if((e|0)==0){e=0}else{if(s>>>0>16777215){e=31;break}y=(e+1048320|0)>>>16&8;z=e<<y;x=(z+520192|0)>>>16&4;z=z<<x;e=(z+245760|0)>>>16&2;e=14-(x|y|e)+(z<<e>>>15)|0;e=s>>>(e+7|0)&1|e<<1}}while(0);g=56136+(e<<2)|0;c[d+(a+28)>>2]=e;c[d+(a+20)>>2]=0;c[d+(a+16)>>2]=0;j=c[55836>>2]|0;h=1<<e;if((j&h|0)==0){c[55836>>2]=j|h;c[g>>2]=f;c[d+(a+24)>>2]=g;c[d+(a+12)>>2]=f;c[d+(a+8)>>2]=f;break}g=c[g>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}e:do{if((c[g+4>>2]&-8|0)==(s|0)){n=g}else{e=s<<e;h=g;while(1){g=h+(e>>>31<<2)+16|0;j=c[g>>2]|0;if((j|0)==0){break}if((c[j+4>>2]&-8|0)==(s|0)){n=j;break e}else{e=e<<1;h=j}}if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[g>>2]=f;c[d+(a+24)>>2]=h;c[d+(a+12)>>2]=f;c[d+(a+8)>>2]=f;break d}}}while(0);e=n+8|0;h=c[e>>2]|0;g=c[55848>>2]|0;if(n>>>0<g>>>0){Ya()}if(h>>>0<g>>>0){Ya()}else{c[h+12>>2]=f;c[e>>2]=f;c[d+(a+8)>>2]=h;c[d+(a+12)>>2]=n;c[d+(a+24)>>2]=0;break}}}while(0);z=r+8|0;i=b;return z|0}}while(0);n=c[55840>>2]|0;if(!(a>>>0>n>>>0)){d=n-a|0;e=c[55852>>2]|0;if(d>>>0>15){z=e;c[55852>>2]=z+a;c[55840>>2]=d;c[z+(a+4)>>2]=d|1;c[z+n>>2]=d;c[e+4>>2]=a|3}else{c[55840>>2]=0;c[55852>>2]=0;c[e+4>>2]=n|3;z=e+(n+4)|0;c[z>>2]=c[z>>2]|1}z=e+8|0;i=b;return z|0}n=c[55844>>2]|0;if(a>>>0<n>>>0){x=n-a|0;c[55844>>2]=x;z=c[55856>>2]|0;y=z;c[55856>>2]=y+a;c[y+(a+4)>>2]=x|1;c[z+4>>2]=a|3;z=z+8|0;i=b;return z|0}do{if((c[14076]|0)==0){n=Oa(30)|0;if((n+ -1&n|0)==0){c[56312>>2]=n;c[56308>>2]=n;c[56316>>2]=-1;c[56320>>2]=-1;c[56324>>2]=0;c[56276>>2]=0;c[14076]=(Za(0)|0)&-16^1431655768;break}else{Ya()}}}while(0);r=a+48|0;o=c[56312>>2]|0;q=a+47|0;n=o+q|0;o=0-o|0;p=n&o;if(!(p>>>0>a>>>0)){z=0;i=b;return z|0}s=c[56272>>2]|0;do{if((s|0)!=0){y=c[56264>>2]|0;z=y+p|0;if(z>>>0<=y>>>0|z>>>0>s>>>0){d=0}else{break}i=b;return d|0}}while(0);f:do{if((c[56276>>2]&4|0)==0){u=c[55856>>2]|0;g:do{if((u|0)==0){m=182}else{w=56280|0;while(1){t=w;v=c[t>>2]|0;if(!(v>>>0>u>>>0)){s=w+4|0;if((v+(c[s>>2]|0)|0)>>>0>u>>>0){break}}w=c[w+8>>2]|0;if((w|0)==0){m=182;break g}}if((w|0)==0){m=182;break}o=n-(c[55844>>2]|0)&o;if(!(o>>>0<2147483647)){o=0;break}m=Ia(o|0)|0;u=(m|0)==((c[t>>2]|0)+(c[s>>2]|0)|0);s=m;t=o;n=u?m:-1;o=u?o:0;m=191}}while(0);do{if((m|0)==182){n=Ia(0)|0;if((n|0)==(-1|0)){o=0;break}s=n;t=c[56308>>2]|0;o=t+ -1|0;if((o&s|0)==0){o=p}else{o=p-s+(o+s&0-t)|0}t=c[56264>>2]|0;u=t+o|0;if(!(o>>>0>a>>>0&o>>>0<2147483647)){o=0;break}s=c[56272>>2]|0;if((s|0)!=0){if(u>>>0<=t>>>0|u>>>0>s>>>0){o=0;break}}s=Ia(o|0)|0;m=(s|0)==(n|0);t=o;n=m?n:-1;o=m?o:0;m=191}}while(0);h:do{if((m|0)==191){m=0-t|0;if((n|0)!=(-1|0)){m=202;break f}do{if((s|0)!=(-1|0)&t>>>0<2147483647&t>>>0<r>>>0){n=c[56312>>2]|0;n=q-t+n&0-n;if(!(n>>>0<2147483647)){break}if((Ia(n|0)|0)==(-1|0)){Ia(m|0)|0;break h}else{t=n+t|0;break}}}while(0);if((s|0)!=(-1|0)){n=s;o=t;m=202;break f}}}while(0);c[56276>>2]=c[56276>>2]|4;m=199}else{o=0;m=199}}while(0);do{if((m|0)==199){if(!(p>>>0<2147483647)){break}n=Ia(p|0)|0;p=Ia(0)|0;if(!((p|0)!=(-1|0)&(n|0)!=(-1|0)&n>>>0<p>>>0)){break}p=p-n|0;q=p>>>0>(a+40|0)>>>0;if(q){o=q?p:o;m=202}}}while(0);do{if((m|0)==202){p=(c[56264>>2]|0)+o|0;c[56264>>2]=p;if(p>>>0>(c[56268>>2]|0)>>>0){c[56268>>2]=p}p=c[55856>>2]|0;i:do{if((p|0)==0){z=c[55848>>2]|0;if((z|0)==0|n>>>0<z>>>0){c[55848>>2]=n}c[56280>>2]=n;c[56284>>2]=o;c[56292>>2]=0;c[55868>>2]=c[14076];c[55864>>2]=-1;d=0;do{z=d<<1;y=55872+(z<<2)|0;c[55872+(z+3<<2)>>2]=y;c[55872+(z+2<<2)>>2]=y;d=d+1|0;}while((d|0)!=32);d=n+8|0;if((d&7|0)==0){d=0}else{d=0-d&7}z=o+ -40-d|0;c[55856>>2]=n+d;c[55844>>2]=z;c[n+(d+4)>>2]=z|1;c[n+(o+ -36)>>2]=40;c[55860>>2]=c[56320>>2]}else{q=56280|0;do{t=c[q>>2]|0;s=q+4|0;r=c[s>>2]|0;if((n|0)==(t+r|0)){m=214;break}q=c[q+8>>2]|0;}while((q|0)!=0);do{if((m|0)==214){if((c[q+12>>2]&8|0)!=0){break}q=p;if(!(q>>>0>=t>>>0&q>>>0<n>>>0)){break}c[s>>2]=r+o;d=(c[55844>>2]|0)+o|0;e=p+8|0;if((e&7|0)==0){e=0}else{e=0-e&7}z=d-e|0;c[55856>>2]=q+e;c[55844>>2]=z;c[q+(e+4)>>2]=z|1;c[q+(d+4)>>2]=40;c[55860>>2]=c[56320>>2];break i}}while(0);if(n>>>0<(c[55848>>2]|0)>>>0){c[55848>>2]=n}q=n+o|0;s=56280|0;do{r=s;if((c[r>>2]|0)==(q|0)){m=224;break}s=c[s+8>>2]|0;}while((s|0)!=0);do{if((m|0)==224){if((c[s+12>>2]&8|0)!=0){break}c[r>>2]=n;h=s+4|0;c[h>>2]=(c[h>>2]|0)+o;h=n+8|0;if((h&7|0)==0){h=0}else{h=0-h&7}j=n+(o+8)|0;if((j&7|0)==0){q=0}else{q=0-j&7}s=n+(q+o)|0;t=s;j=h+a|0;m=n+j|0;k=m;p=s-(n+h)-a|0;c[n+(h+4)>>2]=a|3;j:do{if((t|0)==(c[55856>>2]|0)){z=(c[55844>>2]|0)+p|0;c[55844>>2]=z;c[55856>>2]=k;c[n+(j+4)>>2]=z|1}else{if((t|0)==(c[55852>>2]|0)){z=(c[55840>>2]|0)+p|0;c[55840>>2]=z;c[55852>>2]=k;c[n+(j+4)>>2]=z|1;c[n+(z+j)>>2]=z;break}r=o+4|0;v=c[n+(r+q)>>2]|0;if((v&3|0)==1){a=v&-8;u=v>>>3;k:do{if(v>>>0<256){g=c[n+((q|8)+o)>>2]|0;r=c[n+(o+12+q)>>2]|0;s=55872+(u<<1<<2)|0;do{if((g|0)!=(s|0)){if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}if((c[g+12>>2]|0)==(t|0)){break}Ya()}}while(0);if((r|0)==(g|0)){c[13958]=c[13958]&~(1<<u);break}do{if((r|0)==(s|0)){l=r+8|0}else{if(r>>>0<(c[55848>>2]|0)>>>0){Ya()}s=r+8|0;if((c[s>>2]|0)==(t|0)){l=s;break}Ya()}}while(0);c[g+12>>2]=r;c[l>>2]=g}else{l=c[n+((q|24)+o)>>2]|0;v=c[n+(o+12+q)>>2]|0;do{if((v|0)==(s|0)){v=q|16;u=n+(r+v)|0;t=c[u>>2]|0;if((t|0)==0){u=n+(v+o)|0;t=c[u>>2]|0;if((t|0)==0){g=0;break}}while(1){v=t+20|0;w=c[v>>2]|0;if((w|0)!=0){u=v;t=w;continue}w=t+16|0;v=c[w>>2]|0;if((v|0)==0){break}else{t=v;u=w}}if(u>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[u>>2]=0;g=t;break}}else{w=c[n+((q|8)+o)>>2]|0;if(w>>>0<(c[55848>>2]|0)>>>0){Ya()}u=w+12|0;if((c[u>>2]|0)!=(s|0)){Ya()}t=v+8|0;if((c[t>>2]|0)==(s|0)){c[u>>2]=v;c[t>>2]=w;g=v;break}else{Ya()}}}while(0);if((l|0)==0){break}t=c[n+(o+28+q)>>2]|0;u=56136+(t<<2)|0;do{if((s|0)==(c[u>>2]|0)){c[u>>2]=g;if((g|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<t);break k}else{if(l>>>0<(c[55848>>2]|0)>>>0){Ya()}t=l+16|0;if((c[t>>2]|0)==(s|0)){c[t>>2]=g}else{c[l+20>>2]=g}if((g|0)==0){break k}}}while(0);if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}c[g+24>>2]=l;l=q|16;s=c[n+(l+o)>>2]|0;do{if((s|0)!=0){if(s>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[g+16>>2]=s;c[s+24>>2]=g;break}}}while(0);l=c[n+(r+l)>>2]|0;if((l|0)==0){break}if(l>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[g+20>>2]=l;c[l+24>>2]=g;break}}}while(0);t=n+((a|q)+o)|0;p=a+p|0}g=t+4|0;c[g>>2]=c[g>>2]&-2;c[n+(j+4)>>2]=p|1;c[n+(p+j)>>2]=p;g=p>>>3;if(p>>>0<256){l=g<<1;d=55872+(l<<2)|0;a=c[13958]|0;g=1<<g;do{if((a&g|0)==0){c[13958]=a|g;e=55872+(l+2<<2)|0;f=d}else{l=55872+(l+2<<2)|0;g=c[l>>2]|0;if(!(g>>>0<(c[55848>>2]|0)>>>0)){e=l;f=g;break}Ya()}}while(0);c[e>>2]=k;c[f+12>>2]=k;c[n+(j+8)>>2]=f;c[n+(j+12)>>2]=d;break}e=p>>>8;do{if((e|0)==0){e=0}else{if(p>>>0>16777215){e=31;break}y=(e+1048320|0)>>>16&8;z=e<<y;x=(z+520192|0)>>>16&4;z=z<<x;e=(z+245760|0)>>>16&2;e=14-(x|y|e)+(z<<e>>>15)|0;e=p>>>(e+7|0)&1|e<<1}}while(0);f=56136+(e<<2)|0;c[n+(j+28)>>2]=e;c[n+(j+20)>>2]=0;c[n+(j+16)>>2]=0;g=c[55836>>2]|0;k=1<<e;if((g&k|0)==0){c[55836>>2]=g|k;c[f>>2]=m;c[n+(j+24)>>2]=f;c[n+(j+12)>>2]=m;c[n+(j+8)>>2]=m;break}k=c[f>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}l:do{if((c[k+4>>2]&-8|0)==(p|0)){d=k}else{e=p<<e;while(1){g=k+(e>>>31<<2)+16|0;f=c[g>>2]|0;if((f|0)==0){break}if((c[f+4>>2]&-8|0)==(p|0)){d=f;break l}else{e=e<<1;k=f}}if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[g>>2]=m;c[n+(j+24)>>2]=k;c[n+(j+12)>>2]=m;c[n+(j+8)>>2]=m;break j}}}while(0);f=d+8|0;g=c[f>>2]|0;e=c[55848>>2]|0;if(d>>>0<e>>>0){Ya()}if(g>>>0<e>>>0){Ya()}else{c[g+12>>2]=m;c[f>>2]=m;c[n+(j+8)>>2]=g;c[n+(j+12)>>2]=d;c[n+(j+24)>>2]=0;break}}}while(0);z=n+(h|8)|0;i=b;return z|0}}while(0);d=p;l=56280|0;while(1){f=c[l>>2]|0;if(!(f>>>0>d>>>0)){g=c[l+4>>2]|0;e=f+g|0;if(e>>>0>d>>>0){break}}l=c[l+8>>2]|0}l=f+(g+ -39)|0;if((l&7|0)==0){l=0}else{l=0-l&7}f=f+(g+ -47+l)|0;f=f>>>0<(p+16|0)>>>0?d:f;l=f+8|0;g=l;m=n+8|0;if((m&7|0)==0){m=0}else{m=0-m&7}z=o+ -40-m|0;c[55856>>2]=n+m;c[55844>>2]=z;c[n+(m+4)>>2]=z|1;c[n+(o+ -36)>>2]=40;c[55860>>2]=c[56320>>2];c[f+4>>2]=27;c[l+0>>2]=c[56280>>2];c[l+4>>2]=c[56284>>2];c[l+8>>2]=c[56288>>2];c[l+12>>2]=c[56292>>2];c[56280>>2]=n;c[56284>>2]=o;c[56292>>2]=0;c[56288>>2]=g;g=f+28|0;c[g>>2]=7;if((f+32|0)>>>0<e>>>0){while(1){l=g+4|0;c[l>>2]=7;if((g+8|0)>>>0<e>>>0){g=l}else{break}}}if((f|0)==(d|0)){break}e=f-p|0;f=d+(e+4)|0;c[f>>2]=c[f>>2]&-2;c[p+4>>2]=e|1;c[d+e>>2]=e;f=e>>>3;if(e>>>0<256){g=f<<1;d=55872+(g<<2)|0;e=c[13958]|0;f=1<<f;do{if((e&f|0)==0){c[13958]=e|f;j=55872+(g+2<<2)|0;k=d}else{f=55872+(g+2<<2)|0;e=c[f>>2]|0;if(!(e>>>0<(c[55848>>2]|0)>>>0)){j=f;k=e;break}Ya()}}while(0);c[j>>2]=p;c[k+12>>2]=p;c[p+8>>2]=k;c[p+12>>2]=d;break}d=p;f=e>>>8;do{if((f|0)==0){f=0}else{if(e>>>0>16777215){f=31;break}y=(f+1048320|0)>>>16&8;z=f<<y;x=(z+520192|0)>>>16&4;z=z<<x;f=(z+245760|0)>>>16&2;f=14-(x|y|f)+(z<<f>>>15)|0;f=e>>>(f+7|0)&1|f<<1}}while(0);k=56136+(f<<2)|0;c[p+28>>2]=f;c[p+20>>2]=0;c[p+16>>2]=0;g=c[55836>>2]|0;j=1<<f;if((g&j|0)==0){c[55836>>2]=g|j;c[k>>2]=d;c[p+24>>2]=k;c[p+12>>2]=p;c[p+8>>2]=p;break}j=c[k>>2]|0;if((f|0)==31){f=0}else{f=25-(f>>>1)|0}m:do{if((c[j+4>>2]&-8|0)==(e|0)){h=j}else{f=e<<f;while(1){g=j+(f>>>31<<2)+16|0;k=c[g>>2]|0;if((k|0)==0){break}if((c[k+4>>2]&-8|0)==(e|0)){h=k;break m}else{f=f<<1;j=k}}if(g>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[g>>2]=d;c[p+24>>2]=j;c[p+12>>2]=p;c[p+8>>2]=p;break i}}}while(0);g=h+8|0;f=c[g>>2]|0;e=c[55848>>2]|0;if(h>>>0<e>>>0){Ya()}if(f>>>0<e>>>0){Ya()}else{c[f+12>>2]=d;c[g>>2]=d;c[p+8>>2]=f;c[p+12>>2]=h;c[p+24>>2]=0;break}}}while(0);d=c[55844>>2]|0;if(!(d>>>0>a>>>0)){break}x=d-a|0;c[55844>>2]=x;z=c[55856>>2]|0;y=z;c[55856>>2]=y+a;c[y+(a+4)>>2]=x|1;c[z+4>>2]=a|3;z=z+8|0;i=b;return z|0}}while(0);c[(Ua()|0)>>2]=12;z=0;i=b;return z|0}function Al(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;if((a|0)==0){i=b;return}p=a+ -8|0;r=p;s=c[55848>>2]|0;if(p>>>0<s>>>0){Ya()}u=c[a+ -4>>2]|0;o=u&3;if((o|0)==1){Ya()}j=u&-8;m=a+(j+ -8)|0;k=m;a:do{if((u&1|0)==0){w=c[p>>2]|0;if((o|0)==0){i=b;return}r=-8-w|0;u=a+r|0;o=u;p=w+j|0;if(u>>>0<s>>>0){Ya()}if((o|0)==(c[55852>>2]|0)){d=a+(j+ -4)|0;if((c[d>>2]&3|0)!=3){d=o;n=p;break}c[55840>>2]=p;c[d>>2]=c[d>>2]&-2;c[a+(r+4)>>2]=p|1;c[m>>2]=p;i=b;return}v=w>>>3;if(w>>>0<256){d=c[a+(r+8)>>2]|0;n=c[a+(r+12)>>2]|0;q=55872+(v<<1<<2)|0;do{if((d|0)!=(q|0)){if(d>>>0<s>>>0){Ya()}if((c[d+12>>2]|0)==(o|0)){break}Ya()}}while(0);if((n|0)==(d|0)){c[13958]=c[13958]&~(1<<v);d=o;n=p;break}do{if((n|0)==(q|0)){t=n+8|0}else{if(n>>>0<s>>>0){Ya()}q=n+8|0;if((c[q>>2]|0)==(o|0)){t=q;break}Ya()}}while(0);c[d+12>>2]=n;c[t>>2]=d;d=o;n=p;break}t=c[a+(r+24)>>2]|0;w=c[a+(r+12)>>2]|0;do{if((w|0)==(u|0)){w=a+(r+20)|0;v=c[w>>2]|0;if((v|0)==0){w=a+(r+16)|0;v=c[w>>2]|0;if((v|0)==0){q=0;break}}while(1){x=v+20|0;y=c[x>>2]|0;if((y|0)!=0){w=x;v=y;continue}y=v+16|0;x=c[y>>2]|0;if((x|0)==0){break}else{v=x;w=y}}if(w>>>0<s>>>0){Ya()}else{c[w>>2]=0;q=v;break}}else{v=c[a+(r+8)>>2]|0;if(v>>>0<s>>>0){Ya()}s=v+12|0;if((c[s>>2]|0)!=(u|0)){Ya()}x=w+8|0;if((c[x>>2]|0)==(u|0)){c[s>>2]=w;c[x>>2]=v;q=w;break}else{Ya()}}}while(0);if((t|0)==0){d=o;n=p;break}v=c[a+(r+28)>>2]|0;s=56136+(v<<2)|0;do{if((u|0)==(c[s>>2]|0)){c[s>>2]=q;if((q|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<v);d=o;n=p;break a}else{if(t>>>0<(c[55848>>2]|0)>>>0){Ya()}s=t+16|0;if((c[s>>2]|0)==(u|0)){c[s>>2]=q}else{c[t+20>>2]=q}if((q|0)==0){d=o;n=p;break a}}}while(0);if(q>>>0<(c[55848>>2]|0)>>>0){Ya()}c[q+24>>2]=t;s=c[a+(r+16)>>2]|0;do{if((s|0)!=0){if(s>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[q+16>>2]=s;c[s+24>>2]=q;break}}}while(0);r=c[a+(r+20)>>2]|0;if((r|0)==0){d=o;n=p;break}if(r>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[q+20>>2]=r;c[r+24>>2]=q;d=o;n=p;break}}else{d=r;n=j}}while(0);o=d;if(!(o>>>0<m>>>0)){Ya()}p=a+(j+ -4)|0;q=c[p>>2]|0;if((q&1|0)==0){Ya()}do{if((q&2|0)==0){if((k|0)==(c[55856>>2]|0)){y=(c[55844>>2]|0)+n|0;c[55844>>2]=y;c[55856>>2]=d;c[d+4>>2]=y|1;if((d|0)!=(c[55852>>2]|0)){i=b;return}c[55852>>2]=0;c[55840>>2]=0;i=b;return}if((k|0)==(c[55852>>2]|0)){y=(c[55840>>2]|0)+n|0;c[55840>>2]=y;c[55852>>2]=d;c[d+4>>2]=y|1;c[o+y>>2]=y;i=b;return}n=(q&-8)+n|0;p=q>>>3;b:do{if(q>>>0<256){h=c[a+j>>2]|0;a=c[a+(j|4)>>2]|0;j=55872+(p<<1<<2)|0;do{if((h|0)!=(j|0)){if(h>>>0<(c[55848>>2]|0)>>>0){Ya()}if((c[h+12>>2]|0)==(k|0)){break}Ya()}}while(0);if((a|0)==(h|0)){c[13958]=c[13958]&~(1<<p);break}do{if((a|0)==(j|0)){l=a+8|0}else{if(a>>>0<(c[55848>>2]|0)>>>0){Ya()}j=a+8|0;if((c[j>>2]|0)==(k|0)){l=j;break}Ya()}}while(0);c[h+12>>2]=a;c[l>>2]=h}else{k=c[a+(j+16)>>2]|0;p=c[a+(j|4)>>2]|0;do{if((p|0)==(m|0)){p=a+(j+12)|0;l=c[p>>2]|0;if((l|0)==0){p=a+(j+8)|0;l=c[p>>2]|0;if((l|0)==0){h=0;break}}while(1){q=l+20|0;r=c[q>>2]|0;if((r|0)!=0){p=q;l=r;continue}r=l+16|0;q=c[r>>2]|0;if((q|0)==0){break}else{l=q;p=r}}if(p>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[p>>2]=0;h=l;break}}else{q=c[a+j>>2]|0;if(q>>>0<(c[55848>>2]|0)>>>0){Ya()}r=q+12|0;if((c[r>>2]|0)!=(m|0)){Ya()}l=p+8|0;if((c[l>>2]|0)==(m|0)){c[r>>2]=p;c[l>>2]=q;h=p;break}else{Ya()}}}while(0);if((k|0)==0){break}l=c[a+(j+20)>>2]|0;p=56136+(l<<2)|0;do{if((m|0)==(c[p>>2]|0)){c[p>>2]=h;if((h|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<l);break b}else{if(k>>>0<(c[55848>>2]|0)>>>0){Ya()}l=k+16|0;if((c[l>>2]|0)==(m|0)){c[l>>2]=h}else{c[k+20>>2]=h}if((h|0)==0){break b}}}while(0);if(h>>>0<(c[55848>>2]|0)>>>0){Ya()}c[h+24>>2]=k;k=c[a+(j+8)>>2]|0;do{if((k|0)!=0){if(k>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[h+16>>2]=k;c[k+24>>2]=h;break}}}while(0);a=c[a+(j+12)>>2]|0;if((a|0)==0){break}if(a>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[h+20>>2]=a;c[a+24>>2]=h;break}}}while(0);c[d+4>>2]=n|1;c[o+n>>2]=n;if((d|0)!=(c[55852>>2]|0)){break}c[55840>>2]=n;i=b;return}else{c[p>>2]=q&-2;c[d+4>>2]=n|1;c[o+n>>2]=n}}while(0);a=n>>>3;if(n>>>0<256){h=a<<1;e=55872+(h<<2)|0;j=c[13958]|0;a=1<<a;do{if((j&a|0)==0){c[13958]=j|a;f=55872+(h+2<<2)|0;g=e}else{a=55872+(h+2<<2)|0;h=c[a>>2]|0;if(!(h>>>0<(c[55848>>2]|0)>>>0)){f=a;g=h;break}Ya()}}while(0);c[f>>2]=d;c[g+12>>2]=d;c[d+8>>2]=g;c[d+12>>2]=e;i=b;return}f=d;g=n>>>8;do{if((g|0)==0){g=0}else{if(n>>>0>16777215){g=31;break}x=(g+1048320|0)>>>16&8;y=g<<x;w=(y+520192|0)>>>16&4;y=y<<w;g=(y+245760|0)>>>16&2;g=14-(w|x|g)+(y<<g>>>15)|0;g=n>>>(g+7|0)&1|g<<1}}while(0);a=56136+(g<<2)|0;c[d+28>>2]=g;c[d+20>>2]=0;c[d+16>>2]=0;j=c[55836>>2]|0;h=1<<g;c:do{if((j&h|0)==0){c[55836>>2]=j|h;c[a>>2]=f;c[d+24>>2]=a;c[d+12>>2]=d;c[d+8>>2]=d}else{a=c[a>>2]|0;if((g|0)==31){g=0}else{g=25-(g>>>1)|0}d:do{if((c[a+4>>2]&-8|0)==(n|0)){e=a}else{g=n<<g;j=a;while(1){a=j+(g>>>31<<2)+16|0;h=c[a>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(n|0)){e=h;break d}else{g=g<<1;j=h}}if(a>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[a>>2]=f;c[d+24>>2]=j;c[d+12>>2]=d;c[d+8>>2]=d;break c}}}while(0);a=e+8|0;g=c[a>>2]|0;h=c[55848>>2]|0;if(e>>>0<h>>>0){Ya()}if(g>>>0<h>>>0){Ya()}else{c[g+12>>2]=f;c[a>>2]=f;c[d+8>>2]=g;c[d+12>>2]=e;c[d+24>>2]=0;break}}}while(0);y=(c[55864>>2]|0)+ -1|0;c[55864>>2]=y;if((y|0)==0){d=56288|0}else{i=b;return}while(1){d=c[d>>2]|0;if((d|0)==0){break}else{d=d+8|0}}c[55864>>2]=-1;i=b;return}function Bl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;if((a|0)==0){f=zl(b)|0;i=d;return f|0}if(b>>>0>4294967231){c[(Ua()|0)>>2]=12;f=0;i=d;return f|0}if(b>>>0<11){e=16}else{e=b+11&-8}e=Cl(a+ -8|0,e)|0;if((e|0)!=0){f=e+8|0;i=d;return f|0}e=zl(b)|0;if((e|0)==0){f=0;i=d;return f|0}f=c[a+ -4>>2]|0;f=(f&-8)-((f&3|0)==0?8:4)|0;Nl(e|0,a|0,(f>>>0<b>>>0?f:b)|0)|0;Al(a);f=e;i=d;return f|0}function Cl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;e=a+4|0;g=c[e>>2]|0;k=g&-8;f=a;n=f+k|0;o=n;l=c[55848>>2]|0;if(f>>>0<l>>>0){Ya()}p=g&3;if(!((p|0)!=1&f>>>0<n>>>0)){Ya()}h=f+(k|4)|0;q=c[h>>2]|0;if((q&1|0)==0){Ya()}if((p|0)==0){if(b>>>0<256){r=0;i=d;return r|0}do{if(!(k>>>0<(b+4|0)>>>0)){if((k-b|0)>>>0>c[56312>>2]<<1>>>0){break}i=d;return a|0}}while(0);r=0;i=d;return r|0}if(!(k>>>0<b>>>0)){j=k-b|0;if(!(j>>>0>15)){r=a;i=d;return r|0}c[e>>2]=g&1|b|2;c[f+(b+4)>>2]=j|3;c[h>>2]=c[h>>2]|1;Dl(f+b|0,j);r=a;i=d;return r|0}if((o|0)==(c[55856>>2]|0)){h=(c[55844>>2]|0)+k|0;if(!(h>>>0>b>>>0)){r=0;i=d;return r|0}r=h-b|0;c[e>>2]=g&1|b|2;c[f+(b+4)>>2]=r|1;c[55856>>2]=f+b;c[55844>>2]=r;r=a;i=d;return r|0}if((o|0)==(c[55852>>2]|0)){j=(c[55840>>2]|0)+k|0;if(j>>>0<b>>>0){r=0;i=d;return r|0}h=j-b|0;if(h>>>0>15){c[e>>2]=g&1|b|2;c[f+(b+4)>>2]=h|1;c[f+j>>2]=h;e=f+(j+4)|0;c[e>>2]=c[e>>2]&-2;e=f+b|0}else{c[e>>2]=g&1|j|2;e=f+(j+4)|0;c[e>>2]=c[e>>2]|1;e=0;h=0}c[55840>>2]=h;c[55852>>2]=e;r=a;i=d;return r|0}if((q&2|0)!=0){r=0;i=d;return r|0}h=(q&-8)+k|0;if(h>>>0<b>>>0){r=0;i=d;return r|0}g=h-b|0;p=q>>>3;a:do{if(q>>>0<256){j=c[f+(k+8)>>2]|0;k=c[f+(k+12)>>2]|0;n=55872+(p<<1<<2)|0;do{if((j|0)!=(n|0)){if(j>>>0<l>>>0){Ya()}if((c[j+12>>2]|0)==(o|0)){break}Ya()}}while(0);if((k|0)==(j|0)){c[13958]=c[13958]&~(1<<p);break}do{if((k|0)==(n|0)){m=k+8|0}else{if(k>>>0<l>>>0){Ya()}l=k+8|0;if((c[l>>2]|0)==(o|0)){m=l;break}Ya()}}while(0);c[j+12>>2]=k;c[m>>2]=j}else{m=c[f+(k+24)>>2]|0;p=c[f+(k+12)>>2]|0;do{if((p|0)==(n|0)){p=f+(k+20)|0;o=c[p>>2]|0;if((o|0)==0){p=f+(k+16)|0;o=c[p>>2]|0;if((o|0)==0){j=0;break}}while(1){q=o+20|0;r=c[q>>2]|0;if((r|0)!=0){p=q;o=r;continue}r=o+16|0;q=c[r>>2]|0;if((q|0)==0){break}else{o=q;p=r}}if(p>>>0<l>>>0){Ya()}else{c[p>>2]=0;j=o;break}}else{o=c[f+(k+8)>>2]|0;if(o>>>0<l>>>0){Ya()}l=o+12|0;if((c[l>>2]|0)!=(n|0)){Ya()}q=p+8|0;if((c[q>>2]|0)==(n|0)){c[l>>2]=p;c[q>>2]=o;j=p;break}else{Ya()}}}while(0);if((m|0)==0){break}o=c[f+(k+28)>>2]|0;l=56136+(o<<2)|0;do{if((n|0)==(c[l>>2]|0)){c[l>>2]=j;if((j|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<o);break a}else{if(m>>>0<(c[55848>>2]|0)>>>0){Ya()}l=m+16|0;if((c[l>>2]|0)==(n|0)){c[l>>2]=j}else{c[m+20>>2]=j}if((j|0)==0){break a}}}while(0);if(j>>>0<(c[55848>>2]|0)>>>0){Ya()}c[j+24>>2]=m;l=c[f+(k+16)>>2]|0;do{if((l|0)!=0){if(l>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[j+16>>2]=l;c[l+24>>2]=j;break}}}while(0);k=c[f+(k+20)>>2]|0;if((k|0)==0){break}if(k>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[j+20>>2]=k;c[k+24>>2]=j;break}}}while(0);if(g>>>0<16){c[e>>2]=h|c[e>>2]&1|2;r=f+(h|4)|0;c[r>>2]=c[r>>2]|1;r=a;i=d;return r|0}else{c[e>>2]=c[e>>2]&1|b|2;c[f+(b+4)>>2]=g|3;r=f+(h|4)|0;c[r>>2]=c[r>>2]|1;Dl(f+b|0,g);r=a;i=d;return r|0}return 0}function Dl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;h=a;m=h+b|0;l=m;o=c[a+4>>2]|0;a:do{if((o&1|0)==0){q=c[a>>2]|0;if((o&3|0)==0){i=d;return}t=h+(0-q)|0;o=t;a=q+b|0;r=c[55848>>2]|0;if(t>>>0<r>>>0){Ya()}if((o|0)==(c[55852>>2]|0)){e=h+(b+4)|0;if((c[e>>2]&3|0)!=3){e=o;n=a;break}c[55840>>2]=a;c[e>>2]=c[e>>2]&-2;c[h+(4-q)>>2]=a|1;c[m>>2]=a;i=d;return}u=q>>>3;if(q>>>0<256){e=c[h+(8-q)>>2]|0;n=c[h+(12-q)>>2]|0;p=55872+(u<<1<<2)|0;do{if((e|0)!=(p|0)){if(e>>>0<r>>>0){Ya()}if((c[e+12>>2]|0)==(o|0)){break}Ya()}}while(0);if((n|0)==(e|0)){c[13958]=c[13958]&~(1<<u);e=o;n=a;break}do{if((n|0)==(p|0)){s=n+8|0}else{if(n>>>0<r>>>0){Ya()}p=n+8|0;if((c[p>>2]|0)==(o|0)){s=p;break}Ya()}}while(0);c[e+12>>2]=n;c[s>>2]=e;e=o;n=a;break}s=c[h+(24-q)>>2]|0;v=c[h+(12-q)>>2]|0;do{if((v|0)==(t|0)){w=16-q|0;v=h+(w+4)|0;u=c[v>>2]|0;if((u|0)==0){v=h+w|0;u=c[v>>2]|0;if((u|0)==0){p=0;break}}while(1){x=u+20|0;w=c[x>>2]|0;if((w|0)!=0){v=x;u=w;continue}x=u+16|0;w=c[x>>2]|0;if((w|0)==0){break}else{u=w;v=x}}if(v>>>0<r>>>0){Ya()}else{c[v>>2]=0;p=u;break}}else{u=c[h+(8-q)>>2]|0;if(u>>>0<r>>>0){Ya()}r=u+12|0;if((c[r>>2]|0)!=(t|0)){Ya()}w=v+8|0;if((c[w>>2]|0)==(t|0)){c[r>>2]=v;c[w>>2]=u;p=v;break}else{Ya()}}}while(0);if((s|0)==0){e=o;n=a;break}r=c[h+(28-q)>>2]|0;u=56136+(r<<2)|0;do{if((t|0)==(c[u>>2]|0)){c[u>>2]=p;if((p|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<r);e=o;n=a;break a}else{if(s>>>0<(c[55848>>2]|0)>>>0){Ya()}r=s+16|0;if((c[r>>2]|0)==(t|0)){c[r>>2]=p}else{c[s+20>>2]=p}if((p|0)==0){e=o;n=a;break a}}}while(0);if(p>>>0<(c[55848>>2]|0)>>>0){Ya()}c[p+24>>2]=s;r=16-q|0;q=c[h+r>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[p+16>>2]=q;c[q+24>>2]=p;break}}}while(0);q=c[h+(r+4)>>2]|0;if((q|0)==0){e=o;n=a;break}if(q>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[p+20>>2]=q;c[q+24>>2]=p;e=o;n=a;break}}else{e=a;n=b}}while(0);o=c[55848>>2]|0;if(m>>>0<o>>>0){Ya()}a=h+(b+4)|0;p=c[a>>2]|0;do{if((p&2|0)==0){if((l|0)==(c[55856>>2]|0)){x=(c[55844>>2]|0)+n|0;c[55844>>2]=x;c[55856>>2]=e;c[e+4>>2]=x|1;if((e|0)!=(c[55852>>2]|0)){i=d;return}c[55852>>2]=0;c[55840>>2]=0;i=d;return}if((l|0)==(c[55852>>2]|0)){x=(c[55840>>2]|0)+n|0;c[55840>>2]=x;c[55852>>2]=e;c[e+4>>2]=x|1;c[e+x>>2]=x;i=d;return}n=(p&-8)+n|0;a=p>>>3;b:do{if(p>>>0<256){j=c[h+(b+8)>>2]|0;h=c[h+(b+12)>>2]|0;b=55872+(a<<1<<2)|0;do{if((j|0)!=(b|0)){if(j>>>0<o>>>0){Ya()}if((c[j+12>>2]|0)==(l|0)){break}Ya()}}while(0);if((h|0)==(j|0)){c[13958]=c[13958]&~(1<<a);break}do{if((h|0)==(b|0)){k=h+8|0}else{if(h>>>0<o>>>0){Ya()}b=h+8|0;if((c[b>>2]|0)==(l|0)){k=b;break}Ya()}}while(0);c[j+12>>2]=h;c[k>>2]=j}else{k=c[h+(b+24)>>2]|0;l=c[h+(b+12)>>2]|0;do{if((l|0)==(m|0)){a=h+(b+20)|0;l=c[a>>2]|0;if((l|0)==0){a=h+(b+16)|0;l=c[a>>2]|0;if((l|0)==0){j=0;break}}while(1){p=l+20|0;q=c[p>>2]|0;if((q|0)!=0){a=p;l=q;continue}p=l+16|0;q=c[p>>2]|0;if((q|0)==0){break}else{l=q;a=p}}if(a>>>0<o>>>0){Ya()}else{c[a>>2]=0;j=l;break}}else{a=c[h+(b+8)>>2]|0;if(a>>>0<o>>>0){Ya()}o=a+12|0;if((c[o>>2]|0)!=(m|0)){Ya()}p=l+8|0;if((c[p>>2]|0)==(m|0)){c[o>>2]=l;c[p>>2]=a;j=l;break}else{Ya()}}}while(0);if((k|0)==0){break}l=c[h+(b+28)>>2]|0;o=56136+(l<<2)|0;do{if((m|0)==(c[o>>2]|0)){c[o>>2]=j;if((j|0)!=0){break}c[55836>>2]=c[55836>>2]&~(1<<l);break b}else{if(k>>>0<(c[55848>>2]|0)>>>0){Ya()}l=k+16|0;if((c[l>>2]|0)==(m|0)){c[l>>2]=j}else{c[k+20>>2]=j}if((j|0)==0){break b}}}while(0);if(j>>>0<(c[55848>>2]|0)>>>0){Ya()}c[j+24>>2]=k;k=c[h+(b+16)>>2]|0;do{if((k|0)!=0){if(k>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[j+16>>2]=k;c[k+24>>2]=j;break}}}while(0);h=c[h+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[55848>>2]|0)>>>0){Ya()}else{c[j+20>>2]=h;c[h+24>>2]=j;break}}}while(0);c[e+4>>2]=n|1;c[e+n>>2]=n;if((e|0)!=(c[55852>>2]|0)){break}c[55840>>2]=n;i=d;return}else{c[a>>2]=p&-2;c[e+4>>2]=n|1;c[e+n>>2]=n}}while(0);k=n>>>3;if(n>>>0<256){b=k<<1;h=55872+(b<<2)|0;j=c[13958]|0;k=1<<k;do{if((j&k|0)==0){c[13958]=j|k;g=55872+(b+2<<2)|0;f=h}else{b=55872+(b+2<<2)|0;j=c[b>>2]|0;if(!(j>>>0<(c[55848>>2]|0)>>>0)){g=b;f=j;break}Ya()}}while(0);c[g>>2]=e;c[f+12>>2]=e;c[e+8>>2]=f;c[e+12>>2]=h;i=d;return}f=e;g=n>>>8;do{if((g|0)==0){g=0}else{if(n>>>0>16777215){g=31;break}w=(g+1048320|0)>>>16&8;x=g<<w;v=(x+520192|0)>>>16&4;x=x<<v;g=(x+245760|0)>>>16&2;g=14-(v|w|g)+(x<<g>>>15)|0;g=n>>>(g+7|0)&1|g<<1}}while(0);h=56136+(g<<2)|0;c[e+28>>2]=g;c[e+20>>2]=0;c[e+16>>2]=0;j=c[55836>>2]|0;b=1<<g;if((j&b|0)==0){c[55836>>2]=j|b;c[h>>2]=f;c[e+24>>2]=h;c[e+12>>2]=e;c[e+8>>2]=e;i=d;return}h=c[h>>2]|0;if((g|0)==31){g=0}else{g=25-(g>>>1)|0}c:do{if((c[h+4>>2]&-8|0)!=(n|0)){g=n<<g;b=h;while(1){j=b+(g>>>31<<2)+16|0;h=c[j>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(n|0)){break c}else{g=g<<1;b=h}}if(j>>>0<(c[55848>>2]|0)>>>0){Ya()}c[j>>2]=f;c[e+24>>2]=b;c[e+12>>2]=e;c[e+8>>2]=e;i=d;return}}while(0);b=h+8|0;g=c[b>>2]|0;j=c[55848>>2]|0;if(h>>>0<j>>>0){Ya()}if(g>>>0<j>>>0){Ya()}c[g+12>>2]=f;c[b>>2]=f;c[e+8>>2]=g;c[e+12>>2]=h;c[e+24>>2]=0;i=d;return}function El(a){a=a|0;var b=0,d=0;b=i;a=(a|0)==0?1:a;while(1){d=zl(a)|0;if((d|0)!=0){a=6;break}d=c[14082]|0;c[14082]=d+0;if((d|0)==0){a=5;break}lb[d&1]()}if((a|0)==5){d=Ba(4)|0;c[d>>2]=56344;Pa(d|0,56392,92)}else if((a|0)==6){i=b;return d|0}return 0}function Fl(a){a=a|0;var b=0;b=i;if((a|0)!=0){Al(a)}i=b;return}function Gl(a){a=a|0;var b=0;b=i;Va(a|0);Fl(a);i=b;return}function Hl(a){a=a|0;var b=0;b=i;Va(a|0);i=b;return}function Il(a){a=a|0;i=i;return 56360}function Jl(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;e=i;a:do{if((d|0)==0){b=0}else{while(1){g=a[b]|0;f=a[c]|0;if(!(g<<24>>24==f<<24>>24)){break}d=d+ -1|0;if((d|0)==0){b=0;break a}else{b=b+1|0;c=c+1|0}}b=(g&255)-(f&255)|0}}while(0);i=e;return b|0}function Kl(b,c){b=b|0;c=c|0;var d=0,e=0,f=0;d=i;f=a[b]|0;e=a[c]|0;if(f<<24>>24!=e<<24>>24|f<<24>>24==0|e<<24>>24==0){b=f;f=e;b=b&255;f=f&255;f=b-f|0;i=d;return f|0}while(1){b=b+1|0;c=c+1|0;f=a[b]|0;e=a[c]|0;if(f<<24>>24!=e<<24>>24|f<<24>>24==0|e<<24>>24==0){break}else{}}b=f&255;f=e&255;f=b-f|0;i=d;return f|0}function Ll(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0;f=i;if((e|0)==0){b=0;i=f;return b|0}g=a[b]|0;a:do{if(g<<24>>24==0){g=0}else{while(1){e=e+ -1|0;h=a[c]|0;if(!((e|0)!=0&h<<24>>24!=0&g<<24>>24==h<<24>>24)){break a}b=b+1|0;c=c+1|0;g=a[b]|0;if(g<<24>>24==0){g=0;break}else{}}}}while(0);h=(g&255)-(d[c]|0)|0;i=f;return h|0}function Ml(){c[14100]=m}function Nl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return La(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Ol(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{Nl(b,c,d)|0}return b|0}function Pl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function Ql(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function Rl(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){a[b+e|0]=f?0:a[c+e|0]|0;f=f?1:(a[c+e|0]|0)==0;e=e+1|0}return b|0}function Sl(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return eb[a&63](b|0,c|0,d|0)|0}function Tl(a,b,c){a=a|0;b=b|0;c=+c;fb[a&15](b|0,+c)}function Ul(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;gb[a&15](b|0,c|0,d|0,e|0,f|0)}function Vl(a){a=a|0;return hb[a&31]()|0}function Wl(a,b){a=a|0;b=b|0;ib[a&127](b|0)}function Xl(a,b,c){a=a|0;b=b|0;c=c|0;jb[a&31](b|0,c|0)}function Yl(a,b){a=a|0;b=b|0;return kb[a&15](b|0)|0}function Zl(a){a=a|0;lb[a&1]()}function _l(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return mb[a&7](b|0,c|0,d|0,e|0)|0}function $l(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;nb[a&3](b|0,c|0,d|0,e|0,f|0,g|0)}function am(a,b,c){a=a|0;b=b|0;c=c|0;return ob[a&63](b|0,c|0)|0}function bm(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;pb[a&15](b|0,c|0,d|0,e|0)}function cm(a,b,c){a=a|0;b=b|0;c=c|0;$(0);return 0}function dm(a,b){a=a|0;b=+b;$(1)}function em(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;$(2)}function fm(){$(3);return 0}function gm(a){a=a|0;$(4)}function hm(a,b){a=a|0;b=b|0;$(5)}function im(a){a=a|0;$(6);return 0}function jm(){$(7)}function km(){cb()}function lm(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;$(8);return 0}function mm(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;$(9)}function nm(a,b){a=a|0;b=b|0;$(10);return 0}function om(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;$(11)}




// EMSCRIPTEN_END_FUNCS
var eb=[cm,$b,Zb,Pc,hc,pc,qc,Xg,He,Yc,Sc,$c,ad,dd,xd,Fd,oe,we,Ce,Ze,Ue,df,kf,lf,yf,If,Of,Wf,eg,kg,rg,wg,Oh,Wh,ai,hi,qi,Di,Ci,Li,Ri,Si,Hj,Cj,Lj,Sj,gk,ak,kk,jk,qk,ol,cm,cm,cm,cm,cm,cm,cm,cm,cm,cm,cm,cm];var fb=[dm,cc,Vg,ue,Xe,Cf,_f,Ph,Hi,Ij,bk,dm,dm,dm,dm,dm];var gb=[em,bc,re,Bf,Zf,Th,Gi,ek,vl,ul,tl,em,em,em,em,em];var hb=[fm,lc,mc,xe,ye,ff,gf,Jf,Kf,fg,gg,Xh,Yh,li,mi,Ni,Oi,Nj,Oj,lk,mk,fm,fm,fm,fm,fm,fm,fm,fm,fm,fm,fm];var ib=[gm,Yb,Xb,Bg,Gg,Kg,ic,nc,oc,Qg,Rg,Ic,Hc,gd,hd,id,jd,kd,ld,od,nd,wd,vd,Ad,me,le,ne,ze,Ae,Ge,Fe,De,Je,Ke,Se,Qe,Te,Re,hf,jf,wf,vf,xf,Lf,Mf,Uf,Tf,Vf,hg,ig,xg,yg,qg,pg,ug,Eg,Dg,Mh,Lh,Nh,Zh,_h,fi,ei,gi,ji,ni,oi,Bi,Ai,Pi,Qi,Bj,Aj,Pj,Qj,Zj,Xj,_j,Yj,nk,ok,rk,sk,tk,uk,il,ll,jl,kl,ml,nl,Hl,Gl,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm,gm];var jb=[hm,jc,Jc,kc,Lc,ac,rc,Sg,Tg,Ug,yd,zd,Dd,Bd,qe,ef,Ye,Af,Yf,sg,tg,vg,Sh,Fi,Fj,Gj,fk,dk,hm,hm,hm,hm];var kb=[im,Xc,_c,Uc,cd,ed,Ed,Ag,Il,im,im,im,im,im,im,im];var lb=[jm,km];var mb=[lm,bf,cf,wk,xk,lm,lm,lm];var nb=[mm,yl,xl,wl];var ob=[nm,Ie,Kc,dc,Ng,Pg,Wg,Tc,Vc,fd,ng,pe,ve,Be,We,_e,zf,Df,Nf,Xf,$f,jg,Rh,Vh,$h,ii,ki,pi,Ii,Ej,Jj,Kj,Rj,ck,ik,pk,Jh,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm,nm];var pb=[om,Cd,zg,Uk,Vk,Wk,Xk,Yk,Zk,_k,$k,pl,ql,rl,om,om];return{_strlen:Ql,_open_data:Ib,_generate_sound_data:Nb,_realloc:Bl,_open_track:Jb,_memmove:Ol,_initialize:Hb,_memset:Pl,_malloc:zl,_free:Al,_memcpy:Nl,_strncpy:Rl,_track_info:Kb,_track_count:Lb,_gmemujs_test:Gb,_track_start:Mb,runPostSets:Ml,stackAlloc:qb,stackSave:rb,stackRestore:sb,setThrew:tb,setTempRet0:wb,setTempRet1:xb,setTempRet2:yb,setTempRet3:zb,setTempRet4:Ab,setTempRet5:Bb,setTempRet6:Cb,setTempRet7:Db,setTempRet8:Eb,setTempRet9:Fb,dynCall_iiii:Sl,dynCall_vid:Tl,dynCall_viiiii:Ul,dynCall_i:Vl,dynCall_vi:Wl,dynCall_vii:Xl,dynCall_ii:Yl,dynCall_v:Zl,dynCall_iiiii:_l,dynCall_viiiiii:$l,dynCall_iii:am,dynCall_viiii:bm}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiii": invoke_iiii, "invoke_vid": invoke_vid, "invoke_viiiii": invoke_viiiii, "invoke_i": invoke_i, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iiiii": invoke_iiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_fabs": _fabs, "_sin": _sin, "_strrchr": _strrchr, "__ZSt9terminatev": __ZSt9terminatev, "_fmod": _fmod, "___cxa_guard_acquire": ___cxa_guard_acquire, "_llvm_lifetime_start": _llvm_lifetime_start, "__reallyNegative": __reallyNegative, "___cxa_is_number_type": ___cxa_is_number_type, "___assert_fail": ___assert_fail, "_llvm_invariant_start": _llvm_invariant_start, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_floor": _floor, "_fflush": _fflush, "___cxa_guard_release": ___cxa_guard_release, "_llvm_pow_f64": _llvm_pow_f64, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_snprintf": _snprintf, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "___resumeException": ___resumeException, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_sysconf": _sysconf, "___cxa_throw": ___cxa_throw, "_cos": _cos, "_sprintf": _sprintf, "_llvm_lifetime_end": _llvm_lifetime_end, "_toupper": _toupper, "___errno_location": ___errno_location, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "___cxa_does_inherit": ___cxa_does_inherit, "__exit": __exit, "_abort": _abort, "_time": _time, "__formatString": __formatString, "_log10": _log10, "_llvm_trap": _llvm_trap, "_exit": _exit, "___cxa_pure_virtual": ___cxa_pure_virtual, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "__ZTISt9exception": __ZTISt9exception }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _open_data = Module["_open_data"] = asm["_open_data"];
var _generate_sound_data = Module["_generate_sound_data"] = asm["_generate_sound_data"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _open_track = Module["_open_track"] = asm["_open_track"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _initialize = Module["_initialize"] = asm["_initialize"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _free = Module["_free"] = asm["_free"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _track_info = Module["_track_info"] = asm["_track_info"];
var _track_count = Module["_track_count"] = asm["_track_count"];
var _gmemujs_test = Module["_gmemujs_test"] = asm["_gmemujs_test"];
var _track_start = Module["_track_start"] = asm["_track_start"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_vid = Module["dynCall_vid"] = asm["dynCall_vid"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






