angular.module('ngIdle.localStorage', [])
  .service('IdleStorageAccessor', ['$window', function($window) {
    return {
      get: function() {
        return $window.localStorage;
      }
    }
  }])
  .service('IdleLocalStorage', ['IdleStorageAccessor', function(IdleStorageAccessor) {
    function AlternativeStorage() {
      var storageMap = {};

      this.setItem = function (key, value) {
          storageMap[key] = value;
      };

      this.getItem = function (key) {
          if(typeof storageMap[key] !== 'undefined' ) {
              return storageMap[key];
          }
          return null;
      };

      this.removeItem = function (key) {
          storageMap[key] = undefined;
      };
    }

    function getStorage() {
       try {
          var s = IdleStorageAccessor.get();
          s.setItem('ngIdleStorage', '');
          s.removeItem('ngIdleStorage');

          return s;
       } catch(err) {
          return new AlternativeStorage();
       }
    }

    // Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem
    // throw QuotaExceededError. We're going to detect this and just silently drop any calls to setItem
    // to avoid the entire page breaking, without having to do a check at each usage of Storage.
    var storage = getStorage();

    return {
      set: function(key, value) {
        storage.setItem('ngIdle.'+key, angular.toJson(value));
      },
      get: function(key) {
        return angular.fromJson(storage.getItem('ngIdle.'+key));
      },
      remove: function(key) {
        storage.removeItem('ngIdle.'+key);
      },
      _wrapped: function() {
        return storage;
      }
    };
}]);
