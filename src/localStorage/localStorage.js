angular.module('ngIdle.localStorage', ['ngCookies'])
  .service('IdleLocalStorage', ['$window', '$cookieStore', function($window, $cookieStore) {
    var storage, methods;

    try {
      storage = $window.localStorage;

      methods = {
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
    } catch (err){
      methods = {
        set: function(key, value) {
          $cookieStore.put('ngIdle.'+key, angular.toJson(value));
        },
        get: function(key) {
          return angular.fromJson($cookieStore.get('ngIdle.'+key));
        },
        remove: function(key) {
          $cookieStore.remove('ngIdle.'+key);
        }
      };
    }

    return methods;
  }]);
