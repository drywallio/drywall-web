module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ghost');
	grunt.loadNpmTasks('grunt-rev');
	grunt.loadNpmTasks('grunt-usemin');

	grunt.initConfig({

		base: grunt.config('base') || grunt.option('base') || process.cwd(),

		source: 'source',

		staging: 'intermediate',

		production: 'publish',

		clean: {
			staging: ['<%= staging %>/'],
			production: ['<%= production %>/'],
			tests: ['tests/ghost/temp']
		},

		copy: {
			staging: {
				files: [{
					expand: true,
					cwd: '<%= source %>/',
					dest: '<%= staging %>/',
					src: [
						'index.html',
						'robots.txt',
						'js/**',
						'styles/**',
						'img/**',
						'templates/**'
					]
				}]
			},
			production: {
				files: [{
					expand: true,
					cwd: '<%= staging %>/',
					dest: '<%= production %>/',
					src: [
						'index.html',
						'robots.txt',
						'js/*.loader.js',
						'styles/*.app.css',
						'img/**/*.{jpg,jpeg,gif,png,ico,webp}'
					]
				}]
			}
		},

		stylus: {
			options: {
				compress: true
			},
			file: {
				src: '<%= staging %>/styles/app.styl',
				dest: '<%= staging %>/styles/app.css'
			}
		},

		cssmin: {
			options: {
				report: 'min'
			},
			compress: {
				src: ['<%= staging %>/styles/app.css'],
				dest: '<%= staging %>/styles/app.css'
			}
		},

		handlebars: {
			compile: {
				options: {
					processName: function (filename) {
						var prefix = 'templates/',
							cutoff = filename.indexOf(prefix);
						if (cutoff === -1) {
							throw new Error('Invalid template path');
						}
						return filename
							// Strip "templates/" prefix
							.substring(cutoff + prefix.length)
							// Trim ".html" extension
							.split('.').slice(0, -1).join('.');
					},
					namespace: 'JST',
					amd: true
				},
				files: {
					'<%= staging %>/js/templates.built.js':
						'<%= staging %>/templates/**/*.html'
				}
			}
		},

		htmlmin: {
			options: {
				removeComments: true,
				removeCommentsFromCDATA: true,
				removeCDATASectionsFromCDATA: true,
				collapseWhitespace: false,
				collapseBooleanAttributes: true,
				removeAttributeQuotes: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeOptionalTags: true,
				removeEmptyElements: false
			},
			html: {
				files: [{
					expand: true,
					src: [
						'<%= staging %>/index.html'
					]
				}]
			},
			templates: {
				files: [{
					expand: true,
					src: [
						'<%= staging %>/templates/**/*.html'
					]
				}]
			}
		},

		imagemin: {
			images: {
				options: {
					optimizationLevel: 7,
					progressive: true
				},
				files: [{
					expand: true,
					src: ['<%= staging %>/img/**/*.{jpg,jpeg,png}'],
					dest: ''
				}]
			}
		},

		rev: {
			js: {
				files: [{
					src: [
						'<%= staging %>/js/loader.js'
					]
				}]
			},
			css: {
				files: [{
					src: [
						'<%= staging %>/styles/app.css'
					]
				}]
			},
			assets: {
				files: [{
					src: [
						'<%= staging %>/img/**/*.{jpg,jpeg,gif,png,webp}',
						'<%= staging %>/fonts/**/*.{eot,svg,ttf,woff}'
					]
				}]
			}
		},

		usemin: {
			options: {
				dirs: ['<%= staging %>']
			},
			templates: {
				options: {
					type: 'html',
					basedir: '.'
				},
				files: [{
					src: ['<%= staging %>/templates/**/*.html']
				}]
			},
			css: ['<%= staging %>/styles/app.css'],
			html: ['<%= staging %>/index.html']
		},

		requirejs: {
			compile: {
				options: {
					baseUrl: '<%= staging %>/js',
					mainConfigFile: '<%= staging %>/js/loader.js',
					out: '<%= staging %>/js/loader.js',
					name: 'loader',
					optimize: 'uglify',
					// generateSourceMaps: true,
					preserveLicenseComments: false
				}
			}
		},

		jshint: {
			build: {
				options: grunt.util._.merge({
					node: true
				}, grunt.file.readJSON('.jshintrc')),
				src: [
					'package.json',
					'Gruntfile.js'
				]
			},
			tests: {
				options: grunt.util._.merge({
					node: true
				}, grunt.file.readJSON('.jshintrc')),
				src: [
					'tests/*_test.js'
				]
			},
			app: {
				options: grunt.util._.merge({
					browser: true,
					devel: true,
					globals: {
						require: true,
						define: true
					}
				}, grunt.file.readJSON('.jshintrc')),
				src: [
					'<%= source %>/js/**/*.js',
					'!<%= source %>/js/libs/**/*.js'
				]
			}
		},

		connect: {
			development: {
				options: {
					base: '<%= source %>',
					port: 9000
				}
			},
			staging: {
				options: {
					base: '<%= staging %>',
					port: 9001
				}
			},
			production: {
				options: {
					base: '<%= production %>',
					port: 9002
				}
			},
			options: {
				middleware: function (connect, options) {
					return [
						connect.static(options.base),
						function (req, res) {
							var path = options.base + '/index.html';
							var file = grunt.file.read(path);
							res.end(file);
						}
					];
				}
			}
		},

		nodeunit: {
			tests: ['tests/nodeunit/*_test.js']
		},

		ghost: {
			test: {
				files: [{
					src: ['tests/ghost/**/*_test.js']
				}]
			},
			options: {
				args: {
					baseUrl: 'http://localhost:' +
						'<%= connect.staging.options.port %>/',
					'cookies-file': './tests/ghost/temp/cookies.txt',
					'disk-cache': false,
					'ignore-ssl-errors': true,
					'local-storage': './tests/ghost/temp/storage'
				},
				direct: false,
				logLevel: 'error',
				printCommand: true,
				printFilePaths: true
			}
		},

		preflight: {
			options: {},
			staging: {
				files: {
					'/': ['tests/**/preflight-*.js']
				}
			}
		},

		watch: {
			dev: {
				files: [
					'Gruntfile.js',
					'package.json',
					'<%= source %>/index.html',
					'<%= source %>/robots.txt',
					'<%= source %>/js/**',
					'<%= source %>/styles/**',
					'<%= source %>/img/**',
					'<%= source %>/templates/**'
				],
				tasks: ['test', 'publish']
			}
		}

	});

	grunt.registerTask('stage', [
		'clean:staging',
		'copy:staging',
		'imagemin',
		'rev:assets',
		'usemin:templates',
		'stylus',
		'cssmin',
		'usemin:css',
		'rev:css',
		'htmlmin:templates',
		'handlebars',
		'requirejs',
		'rev:js',
		'usemin:html',
		'htmlmin:html'
	]);

	grunt.registerTask('publish', [
		'clean:production',
		'copy:production'
	]);

	grunt.registerTask('default', [
		'stage',
		'publish'
	]);

	grunt.registerTask('test', [
		'clean:tests',
		'jshint',
		'nodeunit',
		'stage',
		'connect:staging',
		'ghost'
	]);

	grunt.registerTask('dev', [
		'test',
		'publish',
		'watch'
	]);

};
