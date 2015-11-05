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

    var IdleStorageAccessor;
    beforeEach(inject(function(_$window_, _IdleStorageAccessor_) {
      IdleStorageAccessor = _IdleStorageAccessor_;
    }));

    describe('using localStorage', function() {
      var storage, $window;

      beforeEach(inject(function(_$window_, _IdleLocalStorage_) {
        $window = _$window_;
        storage = _IdleLocalStorage_;
        spyOn($window.localStorage, 'setItem').andCallThrough();
      }));

      it ('should be using correct implementation', function() {
        expect(storage._wrapped().constructor.name).not.toBe('AlternativeStorage');
      });

      it ('set() should set value', function() {
        storage.set('key', 1);
        expect($window.localStorage.setItem).toHaveBeenCalledWith('ngIdle.key', '1');
      });

      it ('get() should retrieve value as JSON', function() {
        spyOn($window.localStorage, 'getItem').andReturn('{"value": 1}');
        var actual = storage.get('key');
        expect(actual).toEqualData({value:1});
      });

      it ('remove() should remove key/value', function() {
        spyOn($window.localStorage, 'removeItem');
        storage.remove('key');
        expect($window.localStorage.removeItem).toHaveBeenCalledWith('ngIdle.key');
      });
    });

    describe('using AlternativeStorage', function() {
      var storage, wrapped;

      beforeEach(function() {
        spyOn(IdleStorageAccessor, 'get').andCallFake(function() {
          throw new Error('localStorage is not available');
        });

        inject(function(_IdleLocalStorage_) {
          storage = _IdleLocalStorage_;
          wrapped = storage._wrapped();

          spyOn(wrapped, 'setItem').andCallThrough();
        })
      });

      it ('should be using correct implementation', function() {
        expect(wrapped.constructor.name).toBe('AlternativeStorage');
      });

      it ('set() should set value', function() {
        storage.set('key', 1);
        expect(wrapped.setItem).toHaveBeenCalledWith('ngIdle.key', '1');
      });

      it ('get() should retrieve value as JSON', function() {
        spyOn(wrapped, 'getItem').andReturn('{"value": 1}');
        var actual = storage.get('key');
        expect(actual).toEqualData({value:1});
      });

      it ('remove() should remove key/value', function() {
        spyOn(wrapped, 'removeItem');
        storage.remove('key');
        expect(wrapped.removeItem).toHaveBeenCalledWith('ngIdle.key');
      });
    });
  });
});
