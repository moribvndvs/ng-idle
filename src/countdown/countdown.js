angular.module('ngIdle.countdown', ['ngIdle.idle'])
  .directive('idleCountdown', ['Idle', function(Idle) {
    return {
      restrict: 'A',
      scope: {
        value: '=idleCountdown'
      },
      link: function($scope) {
        // Initialize the scope's value to the configured timeout.
        $scope.value = Idle._options().timeout;

        $scope.$on('IdleWarn', function(e, countdown) {
          $scope.$apply(function() {
            $scope.value = countdown;
          });
        });

        $scope.$on('IdleTimeout', function() {
          $scope.$apply(function() {
            $scope.value = 0;
          });
        });
      }
    };
  }]);
