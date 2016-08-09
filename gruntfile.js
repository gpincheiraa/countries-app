module.exports = function(grunt) {
  //required for postCss
  require('es6-promise').polyfill();

  //Variables que representan aspectos de la estructura de la aplicación
  var INDEX_URL = 'http://localhost:9000/#/',
      
      ANGULAR_MAIN_MODULE  = 'CountriesApp',
      
      ANGULAR_TEMPLATES    = ['assets/views/**/*.html'],
      TEMPLATE_CACHE_DEST  = 'src/templates.js',
      
      WIREDEP_APP_DEST     = 'index.html',
      WIREDEP_TEST_DEST    = 'karma.conf.js',
      
      JAVASCRIPT_ARRAY_SRC = ['src/**/*.js'],


      COVERAGE_URL = 'http://localhost:9001',
      COVERAGE_BASE = './test/coverage/report-html',

      INJECTOR_ARRAY_SRC      = ['src/**/*.js', 'assets/css/**/*.css'],
      INJECTOR_ARRAY_SRC_DIST = ['dist/js/vendor.js', 'dist/js/app.js', 'dist/css/vendor.css', 'dist/css/app.css'],

      FILES_FOR_WATCH = { 'JS'    : [ 'src/**/*.js', 'components/**/*.js','test/unit/**/*.js','!src/templates.js'],
                          'CSS'   : [ 'assets/css/**/*.css' ],
                          'SCSS'  : [ 'src/**/*.scss', 'components/**/*.scss'],
                          'JADE'  : [ 'src/**/*.jade', 'components/**/*.jade' ],
                          'INDEX' : [ 'index.html' ],
                          'GRUNT' : [ 'gruntfile.js' ]
                        },
       
      TASKS_WHEN_FILES_CHANGE = { 'JS'    : [ 'injector:local_dependencies','shell:test' ],
                                  'CSS'   : [ 'postcss','injector:local_dependencies' ],
                                  'SCSS'  : [ 'compass', 'copy:dev', 'clean:tmpcss'],
                                  'JADE'  : [ 'jade', 'ngtemplates' ],
                                  'INDEX' : [ 'injector'],
                                  'GRUNT' : [ 'jade', 'ngtemplates', 'wiredep', 'compass','postcss', 'injector:local_dependencies' , 'shell:test' ],
                                },
      // Tasks
      DEFAULT_TASKS        = [  'jade',
                                'ngtemplates',
                                'wiredep',
                                'compass',
                                'postcss',
                                'copy:dev',
                                'clean:tmpcss',
                                'injector:local_dependencies',
                                'shell:test',
                                'connect:server',
                                'open:dev',
                                'watch' ],

      COVERAGE_TASKS = [  'shell:test',
                          'open:coverage',
                          'connect:coverage',
                          'watch'],

      DIST_TASKS = [  'clean:dist',
                      'jade',
                      'ngtemplates',
                      'compass',
                      'postcss',
                      'copy:distFA',
                      'cssmin',
                      'clean:tmpcss',
                      'uglify:dist',
                      'injector:dist',
                      'imagemin:dist',
                      'htmlmin:dist'
                    ];

  //Cargar paquetes de grunt
  require('load-grunt-tasks')(grunt);
  
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-injector');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-postcss');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  //Tareas de grunt
  grunt.registerTask('default', DEFAULT_TASKS);
  grunt.registerTask('coverage', COVERAGE_TASKS);
  grunt.registerTask('dist', DIST_TASKS);


  //Configuracion de tareas
  grunt.initConfig({
    clean: {
      // options: {"no-write": true},
      dist: ["dist/**/*", "!dist/index.html"],
      tmpcss: ['assets/tmpcss/']
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: false,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    uglify:{
      options: {compress: true, mangle: false},
      dist: {
        files: { 'dist/js/vendor.js': require('wiredep')().js, 'dist/js/app.js': 'src/**/*.js' }
      }
    },
    cssmin:{
      minify: {
        files: {'dist/css/vendor.css': require('wiredep')().css, 'dist/css/app.css': 'assets/css/**/*.css' }
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'assets/images/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'dist/images/',
        }]
      }
    },
    copy:{
      dev: {
        files: [{
          expand: true,
          flatten: true,
          src: 'assets/tmpcss/**/*.css',
          dest: 'assets/css'
        }]
      },
      distFA: {
        /* FontAwesome */
        expand: true,
        flatten: true,
        src: 'bower_components/font-awesome/fonts/*',
        dest: 'dist/fonts'
      }
    },

    shell: {
      test: {
        command: 'karma start'
      },

      e2e: {
        command: ''
      }
    },

    compass:{
      temp: {
        options: {
          sassDir: 'src',
          cssDir: 'assets/css',
          cssPath: 'assets/tmpcss'
        }
      }
    },

    postcss: {
      options: {
          map: true,
          processors: [
              require('autoprefixer')({
                  browsers: ['last 10 versions']
              })
          ]
      },
      dist: {
        src: 'assets/css/**/*.css'
      }
    },

    jade: {
      compile: {
        options: {
          pretty: true,
        },
        files: grunt.file.expandMapping(['**/*.jade'], 'assets/views/', {
          cwd: 'src',
          ext: '.html',
          rename: function(destBase, destPath) {
            return destBase + destPath.replace(/views\//, '');
          }
        })
      }
    },
    wiredep: {
      app: {
        src: WIREDEP_APP_DEST ,
        ignorePath: /^\/.*/
      },

      test: {
        devDependencies: true,
        src: WIREDEP_TEST_DEST,
        ignorePath:  /\.\.\//,
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        }
      }
    },
    injector: {
      options: {
        addRootSlash: false,
        ignorePath: 'dist'
      },
      local_dependencies: {
        files: {
          'index.html' : INJECTOR_ARRAY_SRC
        }
      },
      dist: {
        files:{
          'dist/index.html': INJECTOR_ARRAY_SRC_DIST
        }
      }
    },
    ngtemplates: {
      app: {
        src: ANGULAR_TEMPLATES,
        dest: TEMPLATE_CACHE_DEST,
        options: {
          module: ANGULAR_MAIN_MODULE,
          quotes: 'single',
          htmlmin: {
            collapseBooleanAttributes:      false,
            collapseWhitespace:             false,
            removeAttributeQuotes:          false,
            removeComments:                 true,
            removeEmptyAttributes:          false,
            removeRedundantAttributes:      false,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  false
          }
        }
      }
    },

    connect: {
      server: {
        options: {
          //keepalive: true,
          port: 9000,
          base: '.',
          open: false
        }
      },
      dist:{
        options: {
          keepalive: true,
          port: 9000,
          base: './dist',
          open: false
        }
      },
      coverage: {
        options: {
          keepalive: true,
          port: 9001,
          base: COVERAGE_BASE ,
          open: false
        }
      },
      integration:{
        options: {
          keepalive: true,
          port: 9000,
          base: '.' ,
          open: false
        }
      }
    },
    watch: {
      css: {
        files: FILES_FOR_WATCH.CSS,
        options: {livereload:true},
        tasks: TASKS_WHEN_FILES_CHANGE.CSS,
      },
      js: {
        files: FILES_FOR_WATCH.JS,
        options: {livereload:true},
        tasks: TASKS_WHEN_FILES_CHANGE.JS
      },
      jade:{
        files: FILES_FOR_WATCH.JADE,
        options: {livereload: true},
        tasks: TASKS_WHEN_FILES_CHANGE.JADE
      },
      grunt: {
        files: FILES_FOR_WATCH.GRUNT,
        options: {livereload:true},
        tasks: TASKS_WHEN_FILES_CHANGE.GRUNT
      },
      index: {
        files: FILES_FOR_WATCH.INDEX,
        options: {livereload:true},
        tasks: TASKS_WHEN_FILES_CHANGE.INDEX
      },
      scss: {
        files: FILES_FOR_WATCH.SCSS,
        tasks: TASKS_WHEN_FILES_CHANGE.SCSS
      }
    },
    open: {
      dev: {
        url: INDEX_URL,
        app: function() {
          return process.platform === "linux"? 'Chromium' : 'Google Chrome';
        }
      },
      dist: {
        options: {delay: 500},
        url: INDEX_URL,
        app: function(){
          return process.platform === 'linux'? 'Chromium' : 'Google Chrome';
        }
      },
      coverage: {
        options: {delay: 1000},
        url: COVERAGE_URL,
        app: function() {
          return process.platform === "linux"? 'Chromium' : 'Google Chrome';
        }
      }
    },
  });
};