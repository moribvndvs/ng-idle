angular.module('ngIdle.countdown', [])
  .directive('idleCountdown', function() {
    return {
      restrict: 'A',
      scope: {
        value: '=idleCountdown'
      },
      link: function($scope) {
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
  });
