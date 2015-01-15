angular.module('ngIdle.countdown', [])
  .directive('idleCountdown', function() {
    return {
      restrict: 'A',
      scope: {
        value: '=idleCountdown'
      },
      link: function($scope) {
        $scope.$on('IdleWarn', function(e, countdown) {
          $scope.value = countdown;
        });

        $scope.$on('IdleTimeout', function() {
          $scope.value = 0;
        });
      }
    };
  });
