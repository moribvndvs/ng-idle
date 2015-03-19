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

    var $compile, $scope, create;

    beforeEach(inject(function(_$rootScope_, _$compile_) {
      $scope = _$rootScope_;
      $compile = _$compile_;

      create = function() {
        var el = $compile(angular.element('<div idle-countdown="countdown">{{countdown}} seconds remaining.</div>'))($scope);
        $scope.$digest();
        return el;
      };
    }));

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
