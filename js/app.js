(function(window, angular, undefined) {
	'use strict';
	angular.module('demo', ['ngIdle', 'ui.bootstrap'])
		.controller('DemoCtrl', function($scope, $idle, $keepalive, $modal){
			$scope.started = false;

			function closeModals() {
				if ($scope.warning) {
					$scope.warning.close();
					$scope.warning = null;
				}

				if ($scope.timedout) {
					$scope.timedout.close();
					$scope.timedout = null;
				}
			}

			$scope.$on('$idleStart', function() {
				closeModals();

				$scope.warning = $modal.open({
					templateUrl: 'warning-dialog.html',
					windowClass: 'modal-danger'
				});
			});

			$scope.$on('$idleEnd', function() {
				closeModals();
			});

			$scope.$on('$idleTimeout', function() {
				closeModals();
				$scope.timedout = $modal.open({
					templateUrl: 'timedout-dialog.html',
					windowClass: 'modal-danger'
				});
			});

			$scope.start = function() {
				closeModals();
				$idle.watch();
				$scope.started = true;
			};

			$scope.stop = function() {
				closeModals();
				$idle.unwatch();
				$scope.started = false;

			};
		})
		.config(function($idleProvider, $keepaliveProvider) {
			$idleProvider.idleDuration(5);
            $idleProvider.warningDuration(5);
            $keepaliveProvider.interval(10);
		});
	
})(window, window.angular);