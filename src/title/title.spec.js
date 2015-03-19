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

  beforeEach(module('ngIdle.title'));

  describe('Title service', function() {
    var $document, doc;
    beforeEach(function() {
      angular.module('app', function() {});

      module('app', function($provide) {
        doc = {title:'Hello, World!'};
        $document = [doc];

        $provide.value('$document', $document);
      })
    });

    var Title;
    beforeEach(inject(function(_Title_) {
      Title = _Title_;
    }));

    it ('value() should return document title', function() {
      expect(Title.value()).toBe('Hello, World!');
    });

    it ('value() should set document title', function() {
      Title.value('test');
      expect(doc.title).toBe('test');
    });

    it ('original() should set original value', function() {
      expect(Title.original()).toBeNull();
      Title.original('test');
      expect(Title.original()).toBe('test');
    });

    it ('store() should overwrite original title with the current title', function() {
      Title.original('test');
      Title.store(true);
      expect(Title.original()).toBe('Hello, World!');
    });

    it ('store() should not overwrite original title', function() {
      Title.original('test');
      Title.store();
      expect(Title.original()).toBe('test');
    });

    it ('store() should set the original title to current title', function() {
      expect(Title.original()).toBeNull();
      Title.store();
      expect(Title.original()).toBe('Hello, World!');
    });

    it ('idleMessage() sets and gets the message to use when idle', function() {
      expect(Title.idleMessage()).toBe('{{minutes}}:{{seconds}} until your session times out!');
      Title.idleMessage('test');
      expect(Title.idleMessage()).toBe('test');
    });

    it ('timedOutMessage() sets and gets the message to use when idle', function() {
      expect(Title.timedOutMessage()).toBe('Your session has expired.');
      Title.timedOutMessage('test');
      expect(Title.timedOutMessage()).toBe('test');
    });

    it ('setAsIdle() should ensure the original title is stored and set it to the idle message', function() {
      Title.idleMessage('Timeout in {{minutes}}:{{seconds}} or {{totalSeconds}} seconds.');
      Title.setAsIdle(60);
      expect(Title.original()).toBe('Hello, World!');
      expect(doc.title).toBe('Timeout in 1:00 or 60 seconds.');
    });

    it ('setAsTimedOut() should ensure the original title is stored and set it to the timed out message', function() {
      Title.setAsTimedOut();
      expect(Title.original()).toBe('Hello, World!');
      expect(doc.title).toBe('Your session has expired.');
    });

    it ('restore() should set title back to the original', function() {
      Title.store();
      doc.title = 'test';
      Title.restore();
      expect(doc.title).toBe('Hello, World!');
    });

    it ('restore() should do nothing if the original title has not yet been set', function() {
      doc.title = 'test';
      Title.restore();
      expect(doc.title).toBe('test');
    });
  });

  describe('title directive', function() {

    var $compile, $scope, create, Title;

    beforeEach(inject(function(_$rootScope_, _$compile_, _Title_) {
      $scope = _$rootScope_;
      $compile = _$compile_;
      Title = _Title_;

      spyOn(Title, 'setAsIdle');
      spyOn(Title, 'setAsTimedOut');
      spyOn(Title, 'restore');
      spyOn(Title, 'store');

      create = function(template) {
        var el = $compile(angular.element(template||'<title>Hello World</title>'))($scope);
        $scope.$digest();
        return el;
      };
    }));

    describe('when enabled by default', function() {

      beforeEach(function() {
        create();
      });

      it ('should store title on init', function() {
        expect(Title.store).toHaveBeenCalledWith(true);
      });

      it('should set title to idle message on IdleWarn event', function() {
        $scope.$broadcast('IdleWarn', 5);
        $scope.$apply();

        expect(Title.setAsIdle).toHaveBeenCalledWith(5);
      });

      it('should set title to timeout message on IdleTimeout event', function() {
        $scope.$broadcast('IdleTimeout');
        $scope.$apply();

        expect(Title.setAsTimedOut).toHaveBeenCalled();
      });

      it ('should restore title on IdleEnd event', function() {
        $scope.$broadcast('IdleEnd');
        $scope.$apply();

        expect(Title.restore).toHaveBeenCalled();
      });
    });


    describe('when explicitly disabled', function() {

      beforeEach(function() {
        create('<div title idle-disabled="false">Hello World</div>');
      });

      it ('should not store title on init', function() {
        expect(Title.store).not.toHaveBeenCalled();
      });

      it('should not set title to idle message on IdleWarn event', function() {
        $scope.$broadcast('IdleWarn', 5);
        $scope.$apply();

        expect(Title.setAsIdle).not.toHaveBeenCalled();
      });

      it('should not set title to timeout message on IdleTimeout event', function() {
        $scope.$broadcast('IdleTimeout');
        $scope.$apply();

        expect(Title.setAsTimedOut).not.toHaveBeenCalled();
      });

      it ('should not restore title on IdleEnd event', function() {
        $scope.$broadcast('IdleEnd');
        $scope.$apply();

        expect(Title.restore).not.toHaveBeenCalled();
      });
    });
  });
});
