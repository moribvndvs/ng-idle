module.exports = function(grunt) {
	// load all grunt tasks
  	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '/**'+
 '* Respond to idle users in AngularJS\n'+
 '* @version v<%= pkg.version %>\n'+
 '* @link http://hackedbychinese.github.io/ng-idle\n' +
 '* @license MIT License, http://www.opensource.org/licenses/MIT\n'+
 '*/',
		karma: {
			options: {
				configFile: 'karma.conf.js'
			},
			unit: {
				singleRun: true
			},
			server: {
				autoWatch: true
			}
		},
		copy: {
			js: {
				src: '/src/angular-idle.js',
				dest: 'angular-idle.js'
			}
		},
		uglify: {
			js: {
				src: ['src/angular-idle.js'],
				dest: 'angular-idle.min.js',
				options: {
					banner: '<%= banner %>',
					sourceMap: 'angular-idle.map'
				}
			}
		}
	});

	grunt.registerTask('test', ['karma:unit']);
	grunt.registerTask('test-server', ['karma:server']);
	grunt.registerTask('build', ['uglify','copy:js']);
};