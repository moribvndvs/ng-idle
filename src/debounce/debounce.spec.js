'use strict';

describe('ngIdle', function() {
  describe('Debounce', function() {
    beforeEach(module('ngIdle.debounce'));
    beforeEach(function() {
      angular.module('app', function() {});
    });

    var debounce;
    beforeEach(inject(function(_Debounce_) {
      debounce = _Debounce_;
    }));

    it ('should invoke only the first function within a second', function() {
      var spy = jasmine.createSpy('testFn');
      var debounced = debounce('interrupt');

      debounced(spy, 1000);
      expect(spy.callCount).toBe(1);

      debounced(spy, 1000);
      expect(spy.callCount).toBe(1);

      debounced.flush();

      debounced(spy, 1000);
      expect(spy.callCount).toBe(2);

      debounced(spy, 1000);
      expect(spy.callCount).toBe(2);

    });
  });
});
