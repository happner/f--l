'use strict';

var escapeStringRegexp = require('./lib/escape-string-regexp');
var LRU = require("lru-cache");

if (!global.Map) global.Map = require('es6-map');

function Fool(opts){

  if (!opts) opts = {};

  if (!opts.cache) opts.cache = 0;

  this.__reCache = new Map();

  if (opts.cache){
    this.__cache = new LRU(opts.cache);
    this.matches = this.__cachedMatches.bind(this);
  }
}

Fool.prototype.makeRe = function(pattern){

  if (this.__reCache.has(pattern)) return this.__reCache.get(pattern);

  pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '.*');

  var re = new RegExp('^' + pattern + '$', 'i');

  this.__reCache.set(pattern, re);

  return re;
};

Fool.prototype.prepareWildPath = function(path) {

  //strips out duplicate sequential wildcards, ie simon***bishop -> simon*bishop

  if (!path) return '';

  var prepared = '';

  var lastChar = null;

  var currentChar = null;

  for (var i = 0; i < path.length; i++) {
    currentChar = path[i];

    if (currentChar == '*' && lastChar == '*') continue;
    prepared += currentChar;
  }

  return prepared;
};

Fool.prototype.__conventionalMatch = function(pattern, path) {

  return this.makeRe(pattern).test(path);
};

Fool.prototype.__internalMatch = function(path1, path2) {

  path1 = this.prepareWildPath(path1);

  path2 = this.prepareWildPath(path2);

  if (path1 == path2) return true;//equal to each other

  var path1WildcardIndex = path1.indexOf('*');

  var path2WildcardIndex = path2.indexOf('*');

  //one is * or ** or *** etc
  if (path1 == '*' || path2 == '*') return true;//one is anything

  //precise match, no wildcards
  if (path1WildcardIndex == -1 && path2WildcardIndex == -1) return path1 == path2;

  //if we only have a wildcard on one side, use conventional means
  if (path1WildcardIndex == -1) return this.__conventionalMatch(path2, path1);

  if (path2WildcardIndex == -1) return this.__conventionalMatch(path1, path2);

  //biggest path is our x-axis
  var vertical = (path1.length >= path2.length ? path1 : path2).split('');

  //smallest path is our y-axis
  var horizontal = (path1.length < path2.length ? path1 : path2).split('');

  var matrix = [];

  //build a 2d matrix using our words
  vertical.forEach(function (verticalChar) {

    horizontal.forEach(function (horizontalChar, horizontalIndex) {

      if (!matrix[horizontalIndex]) matrix[horizontalIndex] = [];

      if (horizontalChar == verticalChar || horizontalChar == '*' || verticalChar == '*')
        matrix[horizontalIndex].push(horizontalChar);

      else  matrix[horizontalIndex].push(0);
    });
  });

  var matched = false;

  //walk through the matrix looking for diagonals
  for (var i = 0; i < matrix[0].length; i++) {

    if (matrix[0][i] != 0) {

      var x = i;

      var total = 1;

      for (var y = 1; y < horizontal.length; y++) {

        x++;

        var intersection = matrix[y][x];

        if (!intersection) {
          if (y - 1 != 0 && matrix[y - 1][x - 1] == '*') { //this happens when one of the words has * in between letters that take up no space, ie test vs. t*e*s*t
                                                           // causes striping (parallel diagonals starting at x + 1, y + 1 or x - 1, y - 1)

            var foundShift = -1;

            for (var xShiftForward = x + 1; xShiftForward < matrix[0].length; xShiftForward++) {
              if (matrix[y][xShiftForward]) {
                foundShift = xShiftForward;
                break;
              }
            }

            if (foundShift == -1)
              for (var xShiftBackward = x - 1; xShiftBackward >= 0; xShiftBackward--) {
                if (matrix[y][xShiftBackward]) {
                  foundShift = xShiftBackward;
                  break;
                }
              }

            if (foundShift > -1) {
              x = foundShift;
            } else break;

          } else break;
        }

        total++;

        if (total == horizontal.length) {
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
  }

  return matched;
};

Fool.prototype.__cachedMatches = function (input, pattern) {

  var cacheKey = input + '<<>>' + pattern;

  var cached = this.__cache.get(cacheKey);

  if (cached != null) return cached;

  var answer = this.__internalMatch(input, pattern);

  this.__cache.set(cacheKey, answer);

  return answer;
};

Fool.prototype.matches = function (input, pattern) {

  return this.__internalMatch(input, pattern);
};

module.exports = Fool;
