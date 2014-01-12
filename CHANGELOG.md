## 0.3.0

### Features
* Added `ng-idle-countdown` directive.

## 0.2.3

### Fixes
* #6: Minified output is mangled.

## 0.2.2

Housekeeping

## 0.2.1

### Fixes

* #1: $keepaliveProvider.httpOptions throws an exception when passing a null argument
* #3: Default keepalive interval is 500 seconds, should be 600
* #4: idleDuration should not allow zero
* #5: Added touchstart event to IdleProvider options.

## 0.2.0

### Features

* Added `$keepalive` and `$keepaliveProvider` and integrated them with `$idle`.

## 0.1.0

### Features

* Added `$idle` and `$idleProvider`.