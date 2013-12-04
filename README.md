ng-idle
=======

## About
Your user may be sitting at the bottom of the ocean like an addled schoolboy (his/her orders are 7 bloody hours old!). You may wish to detect these guys and respond, for example, to log them out so their sensitive data is protected, or taunt them, or whatever. I don't care.

This module will include a variety of services and directives to help you in this task.

_**Warning:** This is still in active development and subject to change without noticed. Consider that carefully before including in your production projects. I expect the beta phase to last 1 to 20 years, and that should start in a decade or so._

========

Authored by Mike Grabski
Licensed under [MIT](http://www.opensource.org/licenses/mit-license.php)

## Getting Started

First, you'll need AngularJS 1.2.1 or later (earlier possible, but not tested yet). You can then inject the `$idle` service into your app `run` or in a controller and call `$idle.watch()` when you want to start watching for idleness. You can stop watching anytime by calling `$idle.unwatch()`. `$idle` communicates through events broadcasted on `$rootScope`.

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


			})
			.config(function($idleProvider) {
				// configure $idle settings
				$idleProvider.idleDuration(5);
				$idleProvider.warningDuration(5);
			})
			.run(function($idle){
				// start watching when the app runs
				$idle.watch();
			});

You can stop watching for idleness at any time by calling `$idle.unwatch()`.

Also available is the `$keepalive` service. It will run on a configurable interval to perform some keepalive task, broadcasting a `$keepalive` event on the `$rootScope`. Usually, this would be to make a request to a URL to keep the user's session alive. Therefore, `$keepalive` has the option to make the request for you during a keepalive. 

## Roadmap

* **0.1**: Add the basic `$idle` service and `$idleProvider`.
* **0.2**: Add the `$keepalive` service and `$keepaliveProvider`.

TBD

## Contributing

TBD

## Developing

TBD