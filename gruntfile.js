module.exports = function(grunt) {
	// load all grunt tasks
  	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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
		}
	});

	grunt.registerTask('test', ['karma:unit']);
	grunt.registerTask('test-server', ['karma:server']);
};