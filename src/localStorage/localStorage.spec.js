'use strict';

describe('ngIdle', function() {
  // helpers
  beforeEach(function() {
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(module('ngIdle.localStorage'));

  describe('IdleLocalStorage service', function() {
    beforeEach(function() {
      angular.module('app', []);
    });

    var $window, IdleLocalStorage;
    beforeEach(inject(function(_$window_, _IdleLocalStorage_) {
      $window = _$window_;
      IdleLocalStorage = _IdleLocalStorage_;

      spyOn($window.localStorage, 'setItem').andCallThrough();
    }));

    it ('set() should set value', function() {
      IdleLocalStorage.set('key', 1);
      expect($window.localStorage.setItem).toHaveBeenCalledWith('ngIdle.key', '1');
    });

    it ('get() should retrieve value as JSON', function() {
      spyOn($window.localStorage, 'getItem').andReturn('{"value": 1}');
      var actual = IdleLocalStorage.get('key');
      expect(actual).toEqualData({value:1});
    });

    it ('remove() should remove key/value', function() {
      spyOn($window.localStorage, 'removeItem');
      IdleLocalStorage.remove('key');
      expect($window.localStorage.removeItem).toHaveBeenCalledWith('ngIdle.key');
    });
  });
});
