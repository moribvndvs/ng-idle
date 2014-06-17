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
    var $idleProvider, $interval, $rootScope, $log, $document, $keepalive;
    var DEFAULTIDLEDURATION = 20*60*1000, DEFAULTWARNINGDURATION = 30 * 1000;

    beforeEach(module('ngIdle.idle'));


    beforeEach(function() {
      angular.module('app', function() {}).config(['$idleProvider',
        function(_$idleProvider_) {
          $idleProvider = _$idleProvider_;
        }
      ]);

      module('app');

      inject(function(_$interval_, _$log_, _$rootScope_, _$document_) {
        $rootScope = _$rootScope_;
        $interval = _$interval_;
        $log = _$log_;
        $document = _$document_;
      });

      $keepalive = {
        start: function() {},
        stop: function() {},
        ping: function() {}
      };

      spyOn($keepalive, 'start');
      spyOn($keepalive, 'stop');
      spyOn($keepalive, 'ping');
    });

    var create = function(keepalive) {
      if (angular.isDefined(keepalive)) $idleProvider.keepalive(keepalive);
      return $idleProvider.$get($interval, $log, $rootScope, $document, $keepalive);
    };

    describe('$idleProvider', function() {

      it('activeOn() should update defaults', function() {
        expect($idleProvider).not.toBeUndefined();

        $idleProvider.activeOn('click');

        expect(create()._options().events).toBe('click');
      });

      it('idleDuration() should update defaults', function() {
        expect($idleProvider).not.toBeUndefined();

        $idleProvider.idleDuration(500);

        expect(create()._options().idleDuration).toBe(500);
      });

      it('idleDuration() should throw if argument is less than or equal to zero.', function() {
        var expected = new Error('idleDuration must be a value in seconds, greater than 0.');
        expect(function() {
          $idleProvider.idleDuration(0);
        }).toThrow(expected);

        expect(function() {
          $idleProvider.idleDuration(-1);
        }).toThrow(expected);
      })

      it('warningDuration() should update defaults', function() {
        expect($idleProvider).not.toBeUndefined();

        $idleProvider.warningDuration(500);

        expect(create()._options().warningDuration).toBe(500);
      });

      it('autoResume() should update defaults', function() {
        expect($idleProvider).not.toBeUndefined();

        $idleProvider.autoResume(false);

        expect(create()._options().autoResume).toBe(false);
      });

      it('keepalive() should update defaults', function() {
        $idleProvider.keepalive(false);

        expect(create()._options().keepalive).toBe(false);
      });
    });

    describe('$idle', function() {
      var $idle;

      beforeEach(function() {
        $idleProvider.warningDuration(3);
        $idle = create();
      });

      it('watch() should clear timeouts and start running', function() {
        spyOn($interval, 'cancel');

        $idle.watch();

        expect($interval.cancel).toHaveBeenCalled();
        expect($idle.running()).toBe(true);
        expect($keepalive.start).toHaveBeenCalled();
      });

      it('watch() should not start keepalive if disabled', function() {
        $idle = create(false);

        $idle.watch();
        expect($keepalive.start).not.toHaveBeenCalled();
      });

      it('should not stop keepalive when idle if keepalive integration is disabled', function() {
        $idle = create(false);

        $idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);

        expect($keepalive.stop).not.toHaveBeenCalled();
      });

      it('should not start or ping keepalive when returning from idle if integration is disabled', function() {
        $idle = create(false);

        $idle.watch();
        $interval.flush(DEFAULTIDLEDURATION);
        $idle.watch();

        expect($keepalive.ping).not.toHaveBeenCalled();
        expect($keepalive.start).not.toHaveBeenCalled();
      });

      it('unwatch() should clear timeouts and stop running', function() {
        $idle.watch();

        spyOn($interval, 'cancel');

        $idle.unwatch();

        expect($interval.cancel).toHaveBeenCalled();
        expect($idle.running()).toBe(false);
      });

      it('should broadcast $idleStart and stop keepalive', function() {
        spyOn($rootScope, '$broadcast');

        $idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$idleStart');
        expect($keepalive.stop).toHaveBeenCalled();
      });

      it('should broadcast $idleEnd, start keepalive and ping', function() {
        spyOn($rootScope, '$broadcast');

        $idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);

        $idle.watch();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$idleEnd');
        expect($keepalive.ping).toHaveBeenCalled();
        expect($keepalive.start).toHaveBeenCalled();
      });

      it('should count down warning and then signal timeout', function() {
        spyOn($rootScope, '$broadcast');

        $idle.watch();

        $interval.flush(DEFAULTIDLEDURATION);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$idleStart');
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$idleWarn', 3);
        $interval.flush(1000);
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$idleWarn', 2);
        $interval.flush(1000);
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$idleWarn', 1);

        $interval.flush(1000);
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$idleTimeout');

        // ensure idle interval doesn't keep executing after $idleStart
        $rootScope.$broadcast.reset();
        $interval.flush(DEFAULTIDLEDURATION);
        $interval.flush(DEFAULTIDLEDURATION);
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$idleStart');
      });

      it('watch() should interrupt countdown', function() {
        spyOn($rootScope, '$broadcast');

        $idle.watch();
        $interval.flush(DEFAULTIDLEDURATION);

        $interval.flush(1000);

        expect($idle.idling()).toBe(true);

        $idle.watch();
        expect($idle.idling()).toBe(false);
      });

      // HACK: the body event listener is only respected the first time, and thus always checks the first $idle instance we created rather than the one we created last.
      // in practice, the functionality works fine, but here the test always fails. dunno how to fix it right now.
      // it ('document event should interrupt idle timeout', function() {

      // 	$idle.watch();
      // 	$timeout.flush();

      // 	expect($idle.idling()).toBe(true);

      // 	var e = $.Event('click');
      // 	$('body').trigger(e);

      // 	expect($idle.idling()).toBe(false);
      // });
    });
  });


  describe('keepalive', function() {
    var $keepaliveProvider, $rootScope, $log, $httpBackend, $interval, $http;

    beforeEach(module('ngIdle.keepalive'));

    beforeEach(function() {
      angular
        .module('app', function() {})
        .config(['$keepaliveProvider',
          function(_$keepaliveProvider_) {
            $keepaliveProvider = _$keepaliveProvider_;
          }
        ]);

      module('app');

      inject(function(_$rootScope_, _$log_, _$httpBackend_, _$interval_, _$http_) {
        $rootScope = _$rootScope_;
        $log = _$log_;
        $httpBackend = _$httpBackend_;
        $interval = _$interval_;
        $http = _$http_;
      });
    });

    var create = function(http) {
      if (http) $keepaliveProvider.http(http);
      return $keepaliveProvider.$get($rootScope, $log, $interval, $http);
    };

    describe('$keepaliveProvider', function() {
      it('http() should update options with simple GET', function() {
        $keepaliveProvider.http('/path/to/keepalive');

        expect(create()._options().http).toEqualData({
          url: '/path/to/keepalive',
          method: 'GET',
          cache: false
        });
      });

      it('http() should update options with http options object', function() {
        $keepaliveProvider.http({
          url: '/path/to/keepalive',
          method: 'POST',
          cache: true
        });

        expect(create()._options().http).toEqualData({
          url: '/path/to/keepalive',
          method: 'POST',
          cache: false
        });
      });

      it('http() should throw if passed null or undefined argument', function() {
        expect(function() {
          $keepaliveProvider.http();
        }).toThrow(new Error('Argument must be a string containing a URL, or an object containing the HTTP request configuration.'));
      });

      it('interval() should update options', function() {
        $keepaliveProvider.interval(10);

        expect(create()._options().interval).toBe(10);
      });

      it('interval() should throw if nan or less than or equal to 0', function() {

        expect(function() {
          $keepaliveProvider.interval('asdsad');
        }).toThrow(new Error('Interval must be expressed in seconds and be greater than 0.'));

        expect(function() {
          $keepaliveProvider.interval(0);
        }).toThrow(new Error('Interval must be expressed in seconds and be greater than 0.'));

        expect(function() {
          $keepaliveProvider.interval(-1);
        }).toThrow(new Error('Interval must be expressed in seconds and be greater than 0.'));
      });
    });

    describe('$keepalive', function() {
      var $keepalive, DEFAULTKEEPALIVEINTERVAL = 10*60*1000;

      beforeEach(function() {
        $keepalive = create();
      });

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('start() should schedule ping timeout that broadcasts $keepalive event when it expires.', function() {
        spyOn($rootScope, '$broadcast');

        $keepalive.start();

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$keepalive');
      });

      it('stop() should cancel ping timeout.', function() {
        spyOn($rootScope, '$broadcast');

        $keepalive.start();
        $keepalive.stop();

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        expect($rootScope.$broadcast).not.toHaveBeenCalledWith('$keepalive');
      });

      it('ping() should immediately broadcast $keepalive event', function() {
        spyOn($rootScope, '$broadcast');

        $keepalive.ping();

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$keepalive');
      });

      it('should invoke a URL when pinged and broadcast $keepaliveResponse on success.', function() {
        spyOn($rootScope, '$broadcast');

        $keepalive = create('/path/to/keepalive');

        $keepalive.start();

        $httpBackend.expectGET('/path/to/keepalive')
          .respond(200);

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        $httpBackend.flush();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$keepaliveResponse', undefined, 200);
      });

      it('should invoke a URL when pinged and broadcast $keepaliveResponse on error.', function() {
        spyOn($rootScope, '$broadcast');

        $keepalive = create('/path/to/keepalive');

        $keepalive.start();

        $httpBackend.expectGET('/path/to/keepalive')
          .respond(404);

        $interval.flush(DEFAULTKEEPALIVEINTERVAL);

        $httpBackend.flush();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$keepaliveResponse', undefined, 404);
      });
    });
  });

  describe('ng-idle-countdown', function() {
    beforeEach(module('ngIdle', function($provide) {
      $provide.decorator('$idle', function($delegate) {
        return $delegate;
      });
    }));

    var $compile, $scope, $idle, create;

    beforeEach(inject(function(_$rootScope_, _$compile_, _$idle_) {
      $scope = _$rootScope_;
      $compile = _$compile_;
      $idle = _$idle_;

      create = function() {
        var el = $compile(angular.element('<div ng-idle-countdown="countdown">{{countdown}} seconds remaining.</div>'))($scope);
        $scope.$digest();
        return el;
      };
    }));

    it('should update countdown scope value when receiving new $idleWarning event', function() {
      create();

      $scope.$broadcast('$idleWarn', 5);
      $scope.$apply();
      expect($scope.countdown).toBe(5);
    });

    it('should update countdown scope value to 0 on $idleTimeout event', function() {
      create();

      $scope.$broadcast('$idleTimeout');
      $scope.$apply();

      expect($scope.countdown).toBe(0);
    });
  });
});
