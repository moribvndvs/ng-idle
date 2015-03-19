angular.module('ngIdle.localStorage', [])
  .factory('LocalStorage', ['$window', function($window) {
    var storage = $window.localStorage;

    function tryParseJson(value) {
      try {
        return JSON.parse(value, function(key, value) {
          var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
          if (match) return new Date(value);

          return value;
        });
      }
      catch(e) {
        return value;
      }
    }

    return {
      set: function(key, value) {
        storage.setItem('ngIdle.'+key, JSON.stringify(value));
      },
      get: function(key) {
        var raw = storage.getItem('ngIdle.'+key);
        return tryParseJson(raw);
      },
      remove: function(key) {
        storage.removeItem('ngIdle.'+key);
      }
    };
  }]);
