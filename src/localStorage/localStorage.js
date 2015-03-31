angular.module('ngIdle.localStorage', [])
  .service('IdleLocalStorage', ['$window', function($window) {
    var storage = $window.localStorage;
    
    return {
      set: function(key, value) {
        storage.setItem('ngIdle.'+key, angular.toJson(value));
      },
      get: function(key) {
        return angular.fromJson(storage.getItem('ngIdle.'+key));
      },
      remove: function(key) {
        storage.removeItem('ngIdle.'+key);
      }
    };
  }]);
