module.exports = function(grunt) {
	// load all grunt tasks
  	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '/**'+
 '* <%= pkg.description %>\n'+
 '* @author <%= pkg.author %>\n'+
 '* @version v<%= pkg.version %>\n'+
 '* @link <%= pkg.repository.url %>\n' +
 '* @license <%= pkg.license %>\n'+
 '*/',
  		bump: {
 			options: {
 				files: ['package.json', 'bower.json'],
 				commit: false,
 				createTag: false,
 				push: false
 			}
 		},
		karma: {
			options: {
				configFile: 'karma.conf.js',
				browsers: [ grunt.option('browser') || 'PhantomJS' ]
			},
			unit: {
				singleRun: true
			},
			server: {
				autoWatch: true,
				browsers: [ grunt.option('browser') || 'Chrome']
			}
		},
		clean: pkg.main,
		concat: {
			options: {
				stripBanners: true,
				banner: '<%= banner %>'
			},
			js: {
				src: ['src/angular-idle.js'],
				dest: 'angular-idle.js'
			}
		},
		uglify: {
			js: {
				src: ['angular-idle.js'],
				dest: 'angular-idle.min.js',
				options: {
					banner: '<%= banner %>',
					sourceMap: true,
					sourceMapName: 'angular-idle.map'
				}
			}
		}
	});

	grunt.registerTask('test', ['karma:unit']);
	grunt.registerTask('test-server', ['karma:server']);
	grunt.registerTask('build', ['clean', 'concat:js', 'uglify']);
};