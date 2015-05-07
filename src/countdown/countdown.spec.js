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

  describe('idle-countdown', function() {
    beforeEach(module('ngIdle.countdown'));

    var $compile, $scope, create, Idle;

    beforeEach(inject(function(_$rootScope_, _$compile_, _Idle_) {
      $scope = _$rootScope_;
      $compile = _$compile_;
      Idle = _Idle_;

      create = function() {
        var el = $compile(angular.element('<div idle-countdown="countdown">{{countdown}} seconds remaining.</div>'))($scope);
        $scope.$digest();
        return el;
      };
    }));

    it('should initialize the countdown scope value to the Idle timeout', function() {
      var randomTimeout = Math.floor(Math.random() * 100);
      Idle.setTimeout(randomTimeout);
      create();
      expect($scope.countdown).toBe(randomTimeout);
    });

    it('should update countdown scope value when receiving new IdleWarning event', function() {
      create();

      $scope.$broadcast('IdleWarn', 5);
      $scope.$apply();
      expect($scope.countdown).toBe(5);
    });

    it('should update countdown scope value to 0 on IdleTimeout event', function() {
      create();

      $scope.$broadcast('IdleTimeout');
      $scope.$apply();

      expect($scope.countdown).toBe(0);
    });
  });
});
