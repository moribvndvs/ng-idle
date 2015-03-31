angular.module('ngIdle.idle', ['ngIdle.keepalive', 'ngIdle.localStorage'])
  .provider('Idle', function() {
    var options = {
      idle: 20 * 60, // in seconds (default is 20min)
      timeout: 30, // in seconds (default is 30sec)
      autoResume: 'idle', // lets events automatically resume (unsets idle state/resets warning)
      interrupt: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll',
      keepalive: true
    };

    /**
     *  Sets the number of seconds a user can be idle before they are considered timed out.
     *  @param {Number|Boolean} seconds A positive number representing seconds OR 0 or false to disable this feature.
     */
    var setTimeout = this.timeout = function(seconds) {
      if (seconds === false) options.timeout = 0;
      else if (angular.isNumber(seconds) && seconds >= 0) options.timeout = seconds;
      else throw new Error('Timeout must be zero or false to disable the feature, or a positive integer (in seconds) to enable it.');
    };

    this.interrupt = function(events) {
      options.interrupt = events;
    };

    var setIdle = this.idle = function(seconds) {
      if (seconds <= 0) throw new Error('Idle must be a value in seconds, greater than 0.');

      options.idle = seconds;
    };

    this.autoResume = function(value) {
      if (value === true) options.autoResume = 'idle';
      else if (value === false) options.autoResume = 'off';
      else options.autoResume = value;
    };

    this.keepalive = function(enabled) {
      options.keepalive = enabled === true;
    };

    this.$get = ['$interval', '$log', '$rootScope', '$document', 'Keepalive', 'IdleLocalStorage', '$window',
      function($interval, $log, $rootScope, $document, Keepalive, LocalStorage, $window) {
        var state = {
          idle: null,
          timeout: null,
          idling: false,
          running: false,
          countdown: null
        };

        var id = new Date().getTime();

        function startKeepalive() {
          if (!options.keepalive) return;

          if (state.running) Keepalive.ping();

          Keepalive.start();
        }

        function stopKeepalive() {
          if (!options.keepalive) return;

          Keepalive.stop();
        }

        function toggleState() {
          state.idling = !state.idling;
          var name = state.idling ? 'Start' : 'End';

          $rootScope.$broadcast('Idle' + name);

          if (state.idling) {
            stopKeepalive();
            if (options.timeout) {
              state.countdown = options.timeout;
              countdown();
              state.timeout = $interval(countdown, 1000, options.timeout, false);
            }
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
          $rootScope.$broadcast('IdleWarn', state.countdown);
          state.countdown--;
        }

        function timeout() {
          stopKeepalive();
          $interval.cancel(state.idle);
          $interval.cancel(state.timeout);

          state.idling = true;
          state.running = false;
          state.countdown = 0;

          $rootScope.$broadcast('IdleTimeout');
        }

        function changeOption(self, fn, value) {
          var reset = self.running();

          self.unwatch();
          fn(value);
          if (reset) self.watch();
        }

        function getExpiry() {
          var obj = LocalStorage.get('expiry');

          return new Date(obj.time);
        }

        function setExpiry(date) {
          if (!date) LocalStorage.remove('expiry');
          else LocalStorage.set('expiry', {id: id, time: date});
        }

        var svc = {
          _options: function() {
            return options;
          },
          _getNow: function() {
            return new Date();
          },
          setIdle: function(seconds) {
            changeOption(this, setIdle, seconds);
          },
          setTimeout: function(seconds) {
            changeOption(this, setTimeout, seconds);
          },
          isExpired: function() {
            var expiry = getExpiry();
            return expiry && expiry <= this._getNow();
          },
          running: function() {
            return state.running;
          },
          idling: function() {
            return state.idling;
          },
          watch: function(noExpiryUpdate) {
            $interval.cancel(state.idle);
            $interval.cancel(state.timeout);

            // calculate the absolute expiry date, as added insurance against a browser sleeping or paused in the background
            var timeout = !options.timeout ? 0 : options.timeout;
            if (!noExpiryUpdate) setExpiry(new Date(new Date().getTime() + ((options.idle + timeout) * 1000)));


            if (state.idling) toggleState(); // clears the idle state if currently idling
            else if (!state.running) startKeepalive(); // if about to run, start keep alive

            state.running = true;

            state.idle = $interval(toggleState, options.idle * 1000, 0, false);
          },
          unwatch: function() {
            $interval.cancel(state.idle);
            $interval.cancel(state.timeout);

            state.idling = false;
            state.running = false;
            setExpiry(null);

            stopKeepalive();
          },
          interrupt: function(noExpiryUpdate) {
            if (!state.running) return;

            if (options.timeout && this.isExpired()) {
              timeout();
              return;
            }

            // note: you can no longer auto resume once we exceed the expiry; you will reset state by calling watch() manually
            if (options.autoResume === 'idle' || (options.autoResume === 'notIdle' && !state.idling)) this.watch(noExpiryUpdate);
          }
        };

        $document.find('body').on(options.interrupt, function() {
          svc.interrupt();
        });

        var wrap = function(event) {
          if (event.key === 'ngIdle.expiry' && event.newValue !== event.oldValue) {
            var val = angular.fromJson(event.newValue);
            if (val.id === id) return;
            svc.interrupt(true);
          }
        };

        if ($window.addEventListener) $window.addEventListener('storage', wrap, false);
        else $window.attachEvent('onstorage', wrap);

        return svc;
      }
    ];
  });
