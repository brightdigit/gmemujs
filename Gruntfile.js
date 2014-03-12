var path = require('path');
var spawn = require('child_process').spawn;

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean : ["tmp/build"],
    svn_export: {
      dev: {
        options: {
          repository: 'http://game-music-emu.googlecode.com/svn/trunk',
          output: 'tmp/src'
        }
      }
    },
    includes: {
      files: {
        src: ['src/js/*.js'], // Source files
        dest: 'dist', // Destination directory
        flatten: true,
        cwd: '.'
      }
    },
    uglify: {
      gmemu : {
        files: {
          'dist/gmemujs.min.js': ['dist/gmemujs.js']
        }
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: 'dist/',
        src: '**',
        dest: 'demo/gmemujs/',
      },
    },
  });

   grunt.registerTask('compile', 'Compile the C libraries with emscripten.', function(outfile) {
        grunt.file.mkdir('tmp/build');
        var cb = this.async();

        var emcc = process.env.EMCC_BIN || grunt.option('emcc') || 'emcc';
        var gme_dir = path.join('src', 'game-music-emu', 'gme');
        var gme_files = grunt.file.expand(gme_dir + '/*.cpp');

        var import_flags = [];
        var source_files = grunt.file.expand('src/c/*.c').concat(gme_files);
        outfile = outfile || 'tmp/build/a.out.js';
        var flags = [
            '-s', 'ASM_JS=1',
            //'-g3',
            //'-s', "EXPORTED_FUNCTIONS=['_gme_track_info','_gme_open_data','_gme_track_count','_gme_start_track','_gme_play','_gme_track_ended']",
            '-s', "EXPORTED_FUNCTIONS=['_initialize', '_gmemujs_test', '_open_data', '_track_count', '_open_track', '_track_info', '_track_start', '_generate_sound_data']",
            //'-s', 'LABEL_DEBUG=1',
            '-O1',
            '-I' + gme_dir,
            '-o',  outfile,

            // GCC/Clang arguments to shut up about warnings in code I didn't
            // write. :D
            '-Wno-deprecated',
            '-Qunused-arguments',
            '-Wno-logical-op-parentheses'
        ];
        var args = [].concat(flags, source_files);
        //console.log(args);
        grunt.log.writeln('Compiling via emscripten to ' + outfile);
        var build_proc = spawn(emcc, args, {stdio: 'inherit'});
        build_proc.on('exit', function() {
            cb();
        });
    });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-includes');
  grunt.registerTask('default', ['clean', 'compile', 'includes', 'uglify', 'copy']);
};