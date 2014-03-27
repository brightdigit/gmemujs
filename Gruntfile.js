var path = require('path');
var spawn = require('child_process').spawn;
var os = require('os');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean : ["tmp/build"],
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
      demo: {
        expand: true,
        cwd: 'dist/',
        src: '**',
        dest: 'demo/gmemujs/'
      },
      'gh-pages' : {
        expand: true,
        cwd: 'demo/dist',
        src: '**',
        dest: 'gh-pages'
      }
    },
    grunt: {
      demo : {
        gruntfile : 'demo/Gruntfile.js',
        tasks: 'build'
      },
      server : {
        gruntfile : 'demo/Gruntfile.js',
        tasks: ['server']
      }
    }
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
            '-s', "EXPORTED_FUNCTIONS=['_initialize','_gmemujs_test','_open_data','_track_count','_open_track','_track_info','_track_start','_generate_sound_data']",
            '-O3',
            '-I' + gme_dir,
            '-o',  outfile,

            // GCC/Clang arguments to shut up about warnings in code I didn't
            // write. :D
            '-Wno-deprecated',
            '-Qunused-arguments',
            '-Wno-logical-op-parentheses'
        ];
        var args = [].concat(flags, source_files);
        grunt.log.writeln('Compiling via emscripten to ' + outfile);
        var build_proc;
        if (os.type() === "Windows_NT"){
          build_proc = spawn('cmd', ['/c', emcc].concat(args), {stdio: 'inherit'});
        } else {
          build_proc = spawn(emcc, args, {stdio: 'inherit'});
        }
        build_proc.on('exit', function() {
            cb();
        });
    });

  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-includes');
  grunt.registerTask('default', ['clean', 'compile', 'includes', 'uglify', 'copy:demo', 'grunt:demo', 'copy:gh-pages', 'grunt:server']);
};