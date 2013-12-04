/**
 * Respond to idle users in AngularJS
 * @version v0.1.0
 * @link http://hackedbychinese.github.io/ng-idle
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (window, angular, undefined) {
    'use strict';

    // register modules
    var idleNs = angular.module('ngIdle.idle', []);
    var keepaliveNs = angular.module('ngIdle.keepalive', [])
    angular.module('ngIdle', ['ngIdle.keepalive', 'ngIdle.idle']);

    // $keepalive service and provider
    function $KeepaliveProvider() {
    	var options = {
    		httpOptions: null,
    		interval: 10*50,
    		timeout: 0
    	};

    	this.httpOptions = httpOptions;
    	function httpOptions(value) {
    		if (angular.isString(value)) {
    			value = {url: value, method: 'GET'};
    		}

    		value['cache'] = false;

    		options.http = value;
    	}

    	this.interval = interval;
    	function interval(seconds) {
    		seconds = parseInt(seconds);

    		if (isNaN(seconds) || seconds <= 0) throw new Error('Interval must be expressed in seconds and be greater than 0.');
    		options.interval = seconds;
    	}

    	this.$get = $get;
    	$get.inject = ['$rootScope', '$log', '$timeout', '$http'];

    	function $get($rootScope, $log, $timeout, $http) {
    		
    		var state = {ping: null};


    		function handleResponse(data, status) {
    			$rootScope.$broadcast('$keepaliveResponse', data, status);

    			schedulePing();
    		}

    		function schedulePing() {
    			state.ping = $timeout(ping, options.interval * 1000);
    		}

    		function ping() {
    			$rootScope.$broadcast('$keepalive');

    			if (angular.isObject(options.http)) {
    			 	$http(options.http)
    			 		.success(handleResponse)
    			 		.error(handleResponse);
    			} else schedulePing();
    		};

    		return {
    			_options: function() {
    				return options;
    			},
    			start: function() {
    				$timeout.cancel(state.ping);

    				schedulePing();
    			},
    			stop: function() {
    				$timeout.cancel(state.ping);
    			}
    		};
    	}
    }

    keepaliveNs.provider('$keepalive', $KeepaliveProvider);

    // $idle service and provider
    function $IdleProvider() {

        var options = {
            idleDuration: 20 * 60, // in seconds (default is 20min)
            warningDuration: 30, // in seconds (default is 30sec)
            autoResume: true, // lets events automatically resume (unsets idle state/resets warning)
            events: 'mousemove keydown DOMMouseScroll mousewheel mousedown'
        };

        this.activeOn = activeOn;
        function activeOn (events) {
            options.events = events;
        };

        this.idleDuration = idleDuration;
        function idleDuration(seconds) {
        	if (seconds < 0) throw new Error("idleDuration must be a value in seconds, greatner than 0.");

        	options.idleDuration = seconds;
        }

        this.warningDuration = warningDuration;
        function warningDuration(seconds) {
        	if (seconds < 0) throw new Error("warning must be a value in seconds, greatner than 0.");

        	options.warningDuration = seconds;
        }

        this.autoResume = autoResume;
        function autoResume(value) {
        	options.autoResume = value === true;
        }

        this.$get = $get;
        $get.$inject = ['$timeout', '$log', '$rootScope', '$document'];
        
        function $get($timeout, $log, $rootScope, $document) {
        	var state = {idle: null, warning: null, idling: false, running: false, countdown: null};

        	function toggleState() {
        		state.idling = !state.idling;
        		var name = state.idling ? 'Start' : 'End';

        		$rootScope.$broadcast('$idle' + name);

        		if (state.idling) {
        			state.countdown = options.warningDuration;
        			countdown();
        		}
        	}

        	function countdown() {
        		if (state.countdown <= 0) {
        			$rootScope.$broadcast('$idleTimeout');
        		} else {
        			$rootScope.$broadcast('$idleWarn', state.countdown);

        			state.warning = $timeout(countdown, 1000);
        		}

        		state.countdown--;
        	}

            var svc = {
                _options: function() {
                    return options;
                },
                running: function() {
                	return state.running;
                },
                idling: function() {
                	return state.idling;
                },
                watch: function() {
                	$timeout.cancel(state.idle);
                	$timeout.cancel(state.warning);

                	state.running = true;

                	if (state.idling) toggleState();

                	state.idle = $timeout(toggleState, options.idleDuration * 1000);
                },
                unwatch: function() {
                	$timeout.cancel(state.idle);
                	$timeout.cancel(state.warning);

                	state.idling = false;
                	state.running = false;
                }
            };
           
            var interrupt = function () {
            	if (state.running && options.autoResume) svc.watch();
            };

            $document.find('body').on(options.events, interrupt);

            return svc;
        };
    }

    idleNs.provider('$idle', $IdleProvider);
    
})(window, window.angular);