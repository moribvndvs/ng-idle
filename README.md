Ng-Idle &nbsp;[![Build Status](https://travis-ci.org/HackedByChinese/ng-idle.png?branch=master)](https://travis-ci.org/HackedByChinese/ng-idle)
=======

## About
 You may wish to detect idle users and respond, for example, to log them out so their sensitive data is protected, or taunt them, or whatever. I don't care.

This module will include a variety of services and directives to help you in this task.

_**Warning:** This is still in active development and subject to change without noticed. Consider that carefully before including in your production projects. I expect the beta phase to last 1 to 20 years, and that should start in a decade or so._

========

Authored by Mike Grabski @HackedByChinese <me@mikegrabski.com>

Licensed under [MIT](http://www.opensource.org/licenses/mit-license.php)

## Requirements
* Angular 1.2.0 or later (earlier might be possible but not tested).

## What NgIdle Does
Check out the Overview in the wiki.

## Getting Started

Include `angular-idle.js` after `angular.js`. 

Bare bones example:

			// include the `ngIdle` module
			var app = angular.module('demo', ['ngIdle']);

			app
			.controller('EventsCtrl', function($scope, $idle) {
				$scope.events = [];

				$scope.$on('$idleStart', function() {
					// the user appears to have gone idle					
				});

				$scope.$on('$idleWarn', function(e, countdown) {
					// follows after the $idleStart event, but includes a countdown until the user is considered timed out
					// the countdown arg is the number of seconds remaining until then.
					// you can change the title or display a warning dialog from here.
					// you can let them resume their session by calling $idle.watch()
				});

				$scope.$on('$idleTimeout', function() {
					// the user has timed out (meaning idleDuration + warningDuration has passed without any activity)
					// this is where you'd log them
				})

				$scope.$on('$idleEnd', function() {
					// the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog	
				});

				$scope.$on('$keepalive', function() {
					// do something to keep the user's session alive
				})

			})
			.config(function($idleProvider, $keepaliveProvider) {
				// configure $idle settings
				$idleProvider.idleDuration(5); // in seconds
				$idleProvider.warningDuration(5); // in seconds
				$keepaliveProvider.interval(2); // in seconds
			})
			.run(function($idle){
				// start watching when the app runs. also starts the $keepalive service by default.
				$idle.watch();
			});

You may use `$keepalive` and `$idle` independently if you desire, but they are contained in the same script.

## Roadmap

I am interested in suggestions for new features or improvements. Please get in touch.

## Contributing

Contributors are welcome. I use the `git-flow` lifecyle, so `master` is the stable release and `development` is where latest ongoing development is happening.

## Developing

You will need Node/NPM, Grunt, and Bower. Once you checkout from git, run `npm install` then `bower install` to get dependencies.

### Testing

Use `grunt test` to run unit tests once, or `grunt test-server` to run them continuously.
