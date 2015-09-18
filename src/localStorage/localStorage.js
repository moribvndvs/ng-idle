angular.module('ngIdle.localStorage', [])
  .service('IdleLocalStorage', ['$window', function($window) {
    var storage = null;

    function AlternativeStorage() {
      var strorageMap = {};

      this.setItem = function (key, value) {
          strorageMap[key] = value;
      };

      this.getItem = function (key) {
          if(typeof strorageMap[key] !== 'undefined' ) {
              return strorageMap[key];
          }
          return null;
      };

      this.removeItem = function (key) {
          strorageMap[key] = undefined;
      };
    }

    function getStorage() {
      var storage = $window.localStorage;

       try { 
          localStorage.setItem('ngIdleStorage', ''); 
          localStorage.removeItem('ngIdleStorage');
          storage = localStorage;
       } catch(err) { 
          storage = new AlternativeStorage();
       }
        return storage;
    }

    // Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem
    // throw QuotaExceededError. We're going to detect this and just silently drop any calls to setItem
    // to avoid the entire page breaking, without having to do a check at each usage of Storage.
    storage = getStorage();

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