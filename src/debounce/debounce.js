angular.module('ngIdle.debounce', [])
  .factory('Debounce', [function() {
    var state = {};

    return function(name) {
      function debounce(fn, wait) {
        var now = new Date().getTime();

        if (now < state[name]) return;

        state[name] = now + wait;
        var context = this, args = arguments;
        fn.apply(context, args);
      }

      debounce.flush = function() {
        delete state[name];
      };

      return debounce;
    };
  }]);
