Ng-Idle
=======

[![Join the chat at https://gitter.im/HackedByChinese/ng-idle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/HackedByChinese/ng-idle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/HackedByChinese/ng-idle.png?branch=master)](https://travis-ci.org/HackedByChinese/ng-idle)

## About
 You may wish to detect idle users and respond, for example, to log them out so their sensitive data is protected, or taunt them, or whatever. I don't care.

This module will include a variety of services and directives to help you in this task.

========

Authored by Mike Grabski @HackedByChinese <me@mikegrabski.com>

Licensed under [MIT](http://www.opensource.org/licenses/mit-license.php)

## Requirements
* Angular 1.2.0 or later.

## What NgIdle Does
Check out the Overview in the wiki.

## Getting Help / "How do I..."

I know a lot of GH projects give you the basics on the README and don't bother with a wiki. I assure you [our wiki is fully operational](https://github.com/HackedByChinese/ng-idle/wiki) and documents the full API. Before opening an issue asking me how to do something, please stop by the wiki first; I'll probably just end up linking you to your answer in the wiki anyways :wink:.

## Getting Started

Include `angular-idle.js` after `angular.js`. You can install using Bower with this command: `bower install --save ng-idle`.

Bare bones example:

	// include the `ngIdle` module
	var app = angular.module('demo', ['ngIdle']);

	app
	.controller('EventsCtrl', function($scope, Idle) {
		$scope.events = [];

		$scope.$on('IdleStart', function() {
			// the user appears to have gone idle
		});

		$scope.$on('IdleWarn', function(e, countdown) {
			// follows after the IdleStart event, but includes a countdown until the user is considered timed out
			// the countdown arg is the number of seconds remaining until then.
			// you can change the title or display a warning dialog from here.
			// you can let them resume their session by calling Idle.watch()
		});

		$scope.$on('IdleTimeout', function() {
			// the user has timed out (meaning idleDuration + timeout has passed without any activity)
			// this is where you'd log them
		});

		$scope.$on('IdleEnd', function() {
			// the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
		});

		$scope.$on('Keepalive', function() {
			// do something to keep the user's session alive
		});

	})
	.config(function(IdleProvider, KeepaliveProvider) {
		// configure Idle settings
		IdleProvider.idle(5); // in seconds
		IdleProvider.timeout(5); // in seconds
		KeepaliveProvider.interval(2); // in seconds
	})
	.run(function(Idle){
		// start watching when the app runs. also starts the Keepalive service by default.
		Idle.watch();
	});

You may use `Keepalive` and `Idle` independently if you desire, but they are contained in the same script.

## Migrating to 1.0.0 from 0.x

The following [wiki page](https://github.com/HackedByChinese/ng-idle/wiki/Migrating-to-version-1.0.0-from-0.x) details the breaking changes made in 1.0.0 and how you can migrate your application from a prior version of `ng-idle`.

## Roadmap

I am interested in suggestions for new features or improvements. Please get in touch.

## Contributing

Contributors are welcome. I use the `git-flow` lifecyle, so `master` is the stable release and `development` is where latest ongoing development is happening.

## Developing

You will need Node/NPM and Grunt (don't forget `grunt-cli`). Once you checkout from git, run `npm install`. This will install all dev and bower dependencies so you can immediately build and test your working copy.

### Building
You can build the module by running `grunt build`.

### Testing

Use `grunt test` to run unit tests once, or `grunt test-server` to run them continuously.
