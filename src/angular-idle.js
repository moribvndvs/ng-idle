(function(window, angular, undefined) {
  'use strict';

  // $keepalive service and provider
  function $KeepaliveProvider() {
    var options = {
      http: null,
      interval: 10 * 60
    };

    this.http = function(value) {
      if (!value) throw new Error('Argument must be a string containing a URL, or an object containing the HTTP request configuration.');
      if (angular.isString(value)) {
        value = {
          url: value,
          method: 'GET'
        };
      }

      value['cache'] = false;

      options.http = value;
    };

    this.interval = function(seconds) {
      seconds = parseInt(seconds);

      if (isNaN(seconds) || seconds <= 0) throw new Error('Interval must be expressed in seconds and be greater than 0.');
      options.interval = seconds;
    };

    this.$get = ['$rootScope', '$log', '$interval', '$http', function($rootScope, $log, $interval, $http) {

      var state = {
        ping: null
      };


      function handleResponse(data, status) {
        $rootScope.$broadcast('$keepaliveResponse', data, status);
      }

      function ping() {
        $rootScope.$broadcast('$keepalive');

        if (angular.isObject(options.http)) {
          $http(options.http)
            .success(handleResponse)
            .error(handleResponse);
        }
      }

      return {
        _options: function() {
          return options;
        },
        start: function() {
          $interval.cancel(state.ping);

          state.ping = $interval(ping, options.interval * 1000);
        },
        stop: function() {
          $interval.cancel(state.ping);
        },
        ping: function() {
          ping();
        }
      };
    }];
  }

  angular.module('ngIdle.keepalive', [])
    .provider('$keepalive', $KeepaliveProvider);

  // $idle service and provider
  function $IdleProvider() {

    var options = {
      idleDuration: 20 * 60, // in seconds (default is 20min)
      warningDuration: 30, // in seconds (default is 30sec)
      autoResume: true, // lets events automatically resume (unsets idle state/resets warning)
      events: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart',
      keepalive: true
    };

    this.activeOn = function(events) {
      options.events = events;
    };

    this.idleDuration = function(seconds) {
      if (seconds <= 0) throw new Error("idleDuration must be a value in seconds, greater than 0.");

      options.idleDuration = seconds;
    };

    this.warningDuration = function(seconds) {
      if (seconds < 0) throw new Error("warning must be a value in seconds, greater than 0.");

      options.warningDuration = seconds;
    };

    this.autoResume = function(value) {
      options.autoResume = value === true;
    };

    this.keepalive = function(enabled) {
      options.keepalive = enabled === true;
    };

    this.$get = ['$interval', '$log', '$rootScope', '$document', '$keepalive', function($interval, $log, $rootScope, $document, $keepalive) {
      var state = {
        idle: null,
        warning: null,
        idling: false,
        running: false,
        countdown: null
      };

      function startKeepalive() {
        if (!options.keepalive) return;

        if (state.running) $keepalive.ping();

        $keepalive.start();
      }

      function stopKeepalive() {
        if (!options.keepalive) return;

        $keepalive.stop();
      }

      function toggleState() {
        state.idling = !state.idling;
        var name = state.idling ? 'Start' : 'End';

        $rootScope.$broadcast('$idle' + name);

        if (state.idling) {
          stopKeepalive();
          state.countdown = options.warningDuration;
          countdown();
          state.warning = $interval(countdown, 1000, options.warningDuration, false);
        } else {
          startKeepalive();
        }

        $interval.cancel(state.idle);
      }

      function countdown() {
        // countdown has expired, so signal timeout
        if (state.countdown <= 0) {
          timeout();
          return;
        }

        // countdown hasn't reached zero, so warn and decrement
        $rootScope.$broadcast('$idleWarn', state.countdown);
        state.countdown--;
      }

      function timeout() {
        stopKeepalive();
        $interval.cancel(state.idle);
        $interval.cancel(state.warning);

        state.idling = true;
        state.running = false;
        state.countdown = 0;

        $rootScope.$broadcast('$idleTimeout');
      }

      var svc = {
        _options: function() {
          return options;
        },
        _getNow: function() {
          return new Date();
        },
        isExpired: function() {
          return state.expiry && state.expiry <= this._getNow();
        },
        running: function() {
          return state.running;
        },
        idling: function() {
          return state.idling;
        },
        watch: function() {
          $interval.cancel(state.idle);
          $interval.cancel(state.warning);

          // calculate the absolute expiry date, as added insurance against a browser sleeping or paused in the background
          state.expiry = new Date(new Date().getTime() + ((options.idleDuration + options.warningDuration) * 1000));

          if (state.idling) toggleState(); // clears the idle state if currently idling
          else if (!state.running) startKeepalive(); // if about to run, start keep alive

          state.running = true;

          state.idle = $interval(toggleState, options.idleDuration * 1000, 0, false);
        },
        unwatch: function() {
          $interval.cancel(state.idle);
          $interval.cancel(state.warning);

          state.idling = false;
          state.running = false;
          state.expiry = null;
        },
        interrupt: function() {
          if (!state.running) return;

          if (this.isExpired()) {
            timeout();
            return;
          }

          // note: you can no longer auto resume once we exceed the expiry; you will reset state by calling watch() manually
          if (options.autoResume) this.watch();
        }
      };

      $document.find('body').on(options.events, function() {
        svc.interrupt();
      });

      return svc;
    }];
  }

  angular.module('ngIdle.idle', [])
    .provider('$idle', $IdleProvider);

  angular.module('ngIdle.ngIdleCountdown', [])
    .directive('ngIdleCountdown', function() {
      return {
        restrict: 'A',
        scope: {
          value: '=ngIdleCountdown'
        },
        link: function($scope) {
          $scope.$on('$idleWarn', function(e, countdown) {
            $scope.value = countdown;
          });

          $scope.$on('$idleTimeout', function() {
            $scope.value = 0;
          });
        }
      };
    });

  angular.module('ngIdle', ['ngIdle.keepalive', 'ngIdle.idle', 'ngIdle.ngIdleCountdown']);

})(window, window.angular);
