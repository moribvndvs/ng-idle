'use strict';

describe('ngIdle', function() {
  // helpers
  beforeEach(function() {
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  describe('idle', function() {
    var IdleProvider, $interval, $rootScope, $log, $document, Keepalive, $injector, LocalStorage;
    var DEFAULTIDLEDURATION = 20*60*1000, DEFAULTTIMEOUT = 30 * 1000;

    beforeEach(module('ngIdle.idle'));


    beforeEach(function() {
      angular.module('app', []).config(['IdleProvider',
      function(_IdleProvider_) {
        IdleProvider = _IdleProvider_;
      }
      ]);

      module('app');

      inject(function(_$interval_, _$log_, _$rootScope_, _$document_, _$injector_, _IdleLocalStorage_) {
        $rootScope = _$rootScope_;
        $interval = _$interval_;
        $log = _$log_;
        $document = _$document_;
        $injector = _$injector_;
        LocalStorage = _IdleLocalStorage_;
      });

      Keepalive = {
        start: function() {},
        stop: function() {},
        ping: function() {}
      };

      spyOn(Keepalive, 'start');
      spyOn(Keepalive, 'stop');
      spyOn(Keepalive, 'ping');
    });

    var create = function(keepalive) {
      if (angular.isDefined(keepalive)) IdleProvider.keepalive(keepalive);
      return $injector.invoke(IdleProvider.$get, null, {$interval: $interval, $log: $log, $rootScope: $rootScope, $document: $document, Keepalive: Keepalive, LocalStorage:LocalStorage});
    };

    describe('IdleProvider', function() {

      it('interrupt() should update defaults', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.interrupt('click');

        expect(create()._options().interrupt).toBe('click');
      });

      it('windowInterrupt() should update defaults', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.windowInterrupt('focus');

        expect(create()._options().windowInterrupt).toBe('focus');
      });

      it('idle() should update defaults', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.idle(500);

        expect(create()._options().idle).toBe(500);
      });

      it('idle() should throw if argument is less than or equal to zero.', function() {
        var expected = new Error('Idle must be a value in seconds, greater than 0.');
        expect(function() {
          IdleProvider.idle(0);
        }).toThrow(expected);

        expect(function() {
          IdleProvider.idle(-1);
        }).toThrow(expected);
      });

      it('autoResume() should interpret false as off', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.autoResume(false);

        expect(create()._options().autoResume).toBe('off');
      });


      it('autoResume() should interpret true as idle', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.autoResume(true);

        expect(create()._options().autoResume).toBe('idle');
      });

      it('keepalive() should update defaults', function() {
        IdleProvider.keepalive(false);

        expect(create()._options().keepalive).toBe(false);
      });

      it ('setting timeout() with false should set timeout to 0', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.timeout(false);

        expect(create()._options().timeout).toBe(0);
      });

      it ('setting timeout() with 0 should set timeout to 0', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.timeout(0);

        expect(create()._options().timeout).toBe(0);
      });

      it ('setting timeout() with should throw an error if NaN', function() {
        expect(IdleProvider).not.toBeUndefined();

        expect(function() {
          IdleProvider.timeout('hello');
        }).toThrow(new Error('Timeout must be zero or false to disable the feature, or a positive integer (in seconds) to enable it.'));
      });

      it ('setting timeout() with with positive integer should set timeout', function() {
        expect(IdleProvider).not.toBeUndefined();

        IdleProvider.timeout(999);

        expect(create()._options().timeout).toBe(999);
      });
    });

    describe('Idle', function() {
      var Idle;

      beforeEach(function() {
        LocalStorage.remove('expiry');
        IdleProvider.timeout(3);
        Idle = create();

      });

      it ('setIdle() should update option.idle and restart', function() {
        spyOn(Idle, 'watch');
        spyOn(Idle, 'unwatch');
        spyOn(Idle, 'running').andCallFake(function() {return true;});

        Idle.setIdle(100);

        expect(Idle._options().idle).toBe(100);
        expect(Idle.unwatch).toHaveBeenCalled();
        expect(Idle.watch).toHaveBeenCalled();
      });

      it ('getIdle() should return the current idle value', function(){
        Idle.setIdle(100);
        expect(Idle.getIdle()).toBe(100);
      });

      it ('getTimeout() should return the current timeout value', function(){
        Idle.setTimeout(100);
        expect(Idle.getTimeout()).toBe(100);
      });

      it ('setTimeout() should update option.timeout and restart', function() {
        spyOn(Idle, 'watch');
        spyOn(Idle, 'unwatch');
        spyOn(Idle, 'running').andCallFake(function() {return true;});

        Idle.setTimeout(100);

        expect(Idle._options().timeout).toBe(100);
        expect(Idle.unwatch).toHaveBeenCalled();
        expect(Idle.watch).toHaveBeenCalled();
      });

      it('watch() should clear timeouts and start running', function() {
        spyOn($interval, 'cancel');

        Idle.watch();

        expect($interval.cancel).toHaveBeenCalled();
        expect(Idle.running()).toBe(true);
        expect(Keepalive.start).toHaveBeenCalled();
      });

      it('watch() should not start keepalive if disabled', function() {
        Idle = create(false);

        Idle.watch();
        expect(Keepalive.start).not.toHaveBeenCalled();
      });

      it('should not stop keepalive when idle if keepalive integration is disabled', function() {
        Idle = create(false);

        Idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);

        expect(Keepalive.stop).not.toHaveBeenCalled();
      });

      it('should not start or ping keepalive when returning from idle if integration is disabled', function() {
        Idle = create(false);

        Idle.watch();
        $interval.flush(DEFAULTIDLEDURATION);
        Idle.watch();

        expect(Keepalive.ping).not.toHaveBeenCalled();
        expect(Keepalive.start).not.toHaveBeenCalled();
      });

      it('unwatch() should clear timeouts and stop running', function() {
        Idle.watch();

        spyOn($interval, 'cancel');

        Idle.unwatch();

        expect($interval.cancel).toHaveBeenCalled();
        expect(Idle.running()).toBe(false);
      });

      it('unwatch() should stop keepalive if enabled', function() {
        Idle.watch();

        Idle.unwatch();

        expect(Keepalive.stop).toHaveBeenCalled();
      });

      it('should broadcast IdleStart and stop keepalive', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);
        $rootScope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleStart');
        expect(Keepalive.stop).toHaveBeenCalled();
      });

      it('should broadcast IdleStart then IdleWarn', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);
        $rootScope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleStart');
        expect($rootScope.$broadcast.mostRecentCall.args[0]).toBe('IdleWarn');
      });

      it('should broadcast IdleEnd, start keepalive and ping', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);
        $rootScope.$digest();

        Idle.watch();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleEnd');
        expect(Keepalive.ping).toHaveBeenCalled();
        expect(Keepalive.start).toHaveBeenCalled();
      });

      it('should count down warning and then signal timeout', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);
        $rootScope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleStart');
        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleWarn', 3);

        $interval.flush(1000);
        $rootScope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleWarn', 2);

        $interval.flush(1000);
        $rootScope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleWarn', 1);

        $interval.flush(1000);
        $rootScope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleTimeout');

        // ensure idle interval doesn't keep executing after IdleStart
        $rootScope.$broadcast.reset();
        $interval.flush(DEFAULTIDLEDURATION);
        $interval.flush(DEFAULTIDLEDURATION);
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('IdleStart');
      });

      it('watch() should interrupt countdown', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();
        $interval.flush(DEFAULTIDLEDURATION);

        $interval.flush(1000);
        $rootScope.$digest();

        expect(Idle.idling()).toBe(true);

        Idle.watch();
        expect(Idle.idling()).toBe(false);
      });

      it ('isExpired() should return false if the date/time is less than the idle duration', function() {
        // sets the expiry to now + idle + warning duration
        Idle.watch();

        expect(Idle.isExpired()).toBe(false);
      });

      it ('isExpired() should return true if the date/time is greater than or equal the idle duration + warning duration.', function() {
        var secondsPassed = 0;

        // fake now to return a time in the future.
        spyOn(Idle, '_getNow').andCallFake(function() {
          return new Date(new Date().getTime() + ((DEFAULTIDLEDURATION + DEFAULTTIMEOUT + secondsPassed) * 1000));
        });

        // equal to expiry
        Idle.watch();
        expect(Idle.isExpired()).toBe(true);

        // greater than expiry
        secondsPassed = 1;
        Idle.watch();
        expect(Idle.isExpired()).toBe(true);

        // far greater than expiry (90 days)
        secondsPassed = 60 * 60 * 24 * 90;
        Idle.watch();
        expect(Idle.isExpired()).toBe(true);
      });

      it ('isExpired() should return false if there is no expiry yet', function() {
        expect(Idle.isExpired()).toBe(false);
      });

      it ('interrupt() should broadcast $timeout if running and past expiry', function() {
        spyOn($rootScope, '$broadcast');

        // fake now to return a time in the future.
        spyOn(Idle, '_getNow').andCallFake(function() {
          return new Date(new Date().getTime() + ((DEFAULTIDLEDURATION + DEFAULTTIMEOUT + 60) * 1000));
        });

        spyOn(Idle, 'watch').andCallThrough();

        // the original call to start watching
        Idle.watch();
        expect($rootScope.$broadcast).not.toHaveBeenCalled();
        Idle.watch.reset();

        // a subsequent call represents an interrupt
        Idle.interrupt();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleTimeout');
        expect(Idle.idling()).toBe(true);
        expect(Idle.watch).not.toHaveBeenCalled();
      });

      it ('interrupt(true) should not update expiry', function() {
        Idle.watch();

        spyOn(LocalStorage, 'set').andCallThrough();
        Idle.interrupt(true);

        expect(LocalStorage.set).not.toHaveBeenCalled();
      });

      it ('interrupt() should update expiry', function() {
        Idle.watch();

        spyOn(LocalStorage, 'set').andCallThrough();
        Idle.interrupt();

        expect(LocalStorage.set).toHaveBeenCalled();
      });

      it ('interrupt() should broadcast IdleInterrupt if user has not timed out', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();
        Idle.interrupt();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleInterrupt', undefined);
      });

      it ('interrupt() should broadcast IdleInterrupt from another tab', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();
        Idle.interrupt(true);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleInterrupt', true);
      });

      it ('interrupt() should not broadcast IdleInterrupt if user has timed out', function() {
        spyOn($rootScope, '$broadcast');

        // fake now to return a time in the future.
        spyOn(Idle, '_getNow').andCallFake(function() {
          return new Date(new Date().getTime() + ((DEFAULTIDLEDURATION + DEFAULTTIMEOUT + 60) * 1000));
        });

        Idle.watch();
        Idle.interrupt();

        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('IdleInterrupt');
      });

      // HACK: the body event listener is only respected the first time, and thus always checks the first Idle instance we created rather than the one we created last.
      // in practice, the functionality works fine, but here the test always fails. dunno how to fix it right now.
      // it ('document event should interrupt idle timeout', function() {

      //   Idle.watch();
      //   $timeout.flush();

      //   expect(Idle.idling()).toBe(true);

      //   var e = $.Event('click');
      //   $('body').trigger(e);

      //   expect(Idle.idling()).toBe(false);
      // });


      //HACK: this has the same issues as the test above
      //it('window event should interrupt idle timeout', function() {
      //  IdleProvider.windowInterrupt('focus');
      //  Idle = create();
      //
      //  Idle.watch();
      //
      //});
    });

    describe('Idle with different autoResume values', function() {
      var Idle;

      it('interrupt() should NOT call watch() if autoResume is off', function() {
        IdleProvider.autoResume('off');
        Idle = create();

        spyOn(Idle, 'watch').andCallThrough();

        Idle.watch();
        Idle.watch.reset();

        Idle.interrupt();
        expect(Idle.watch).not.toHaveBeenCalled();
      });

      it ('interrupt() should call watch() if running and autoResume is idle', function() {
        IdleProvider.autoResume('idle');
        Idle = create();

        spyOn(Idle, 'watch').andCallThrough();

        // arrange
        Idle.watch(); // start watching
        Idle.watch.reset(); // reset watch spy to ignore the prior setup call

        Idle.interrupt();
        expect(Idle.watch).toHaveBeenCalled();
      });

      it ('interrupt() should call watch() if not idle and autoResume is notIdle', function() {
        IdleProvider.autoResume('notIdle');
        Idle = create();

        spyOn(Idle, 'watch').andCallThrough();

        // arrange
        Idle.watch(); // start watching
        Idle.watch.reset(); // reset watch spy to ignore the prior setup call

        Idle.interrupt();
        expect(Idle.watch).toHaveBeenCalled();
      });

      it ('interrupt() should NOT call watch() if idle and autoResume is notIdle', function() {
        IdleProvider.autoResume('notIdle');
        Idle = create();

        spyOn(Idle, 'watch').andCallThrough();

        // arrange
        Idle.watch(); // start watching
        Idle.watch.reset(); // reset watch spy to ignore the prior setup call

        $interval.flush(DEFAULTIDLEDURATION);

        Idle.interrupt();
        expect(Idle.watch).not.toHaveBeenCalled();
      });

      it ('interrupt(true) should call watch() if idle and autoResume is notIdle', function() {
        IdleProvider.autoResume('notIdle');
        Idle = create();

        spyOn(Idle, 'watch').andCallThrough();

        // arrange
        Idle.watch(); // start watching
        Idle.watch.reset(); // reset watch spy to ignore the prior setup call

        $interval.flush(DEFAULTIDLEDURATION);

        Idle.interrupt(true);
        expect(Idle.watch).toHaveBeenCalled();
      });

    });

    describe('Idle with timeout disabled', function() {
      var Idle;

      beforeEach(function() {
        IdleProvider.timeout(false);
        Idle = create();
      });

      it('should NOT count down warning or signal timeout', function() {
        spyOn($rootScope, '$broadcast');

        Idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);
        $rootScope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('IdleStart');
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('IdleWarn');

        $interval.flush(1000);
        $rootScope.$digest();

        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('IdleWarn');

        $interval.flush(1000);
        $rootScope.$digest();

        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('IdleWarn');

        $interval.flush(1000);
        $rootScope.$digest();

        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('IdleTimeout');
      });

      it ('interrupt() should not timeout if running and past expiry', function() {
        spyOn($rootScope, '$broadcast');

        // fake now to return a time in the future.
        spyOn(Idle, '_getNow').andCallFake(function() {
          return new Date(new Date().getTime() + ((DEFAULTIDLEDURATION + DEFAULTTIMEOUT + 60) * 1000));
        });

        spyOn(Idle, 'watch').andCallThrough();

        // the original call to start watching
        Idle.watch();
        expect($rootScope.$broadcast).not.toHaveBeenCalled();
        Idle.watch.reset();

        // a subsequent call represents an interrupt
        Idle.interrupt();
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('IdleTimeout');
        expect(Idle.idling()).toBe(false);
        expect(Idle.watch).toHaveBeenCalled();
      });

    });
  });
});
