describe('performance tests', function () {

  this.timeout(5000);

  var random = require('./fixtures/random');

  var Fool = require('..');

  var fool = new Fool({cache:1000});

  var foolNoCache = new Fool();

  var VERBOSE = true;

  var testLog = function(message, object){
    if (VERBOSE){
      console.log(message);
      if (object) console.log(JSON.stringify(object, null,2));
    }
  };

  var W_SUBSCRIPTION_COUNT = 10000;

  it('wildcard on both paths, ie: t*st -> t*t', function(done){

    //construct our wildcard paths

    var paths = random.randomPaths({count:W_SUBSCRIPTION_COUNT});

    var wildcardPaths1 = paths.map(function(path){
      return  path.substring(0, random.integer(0, path.length - 1))  + '*';
    });

    var wildcardPaths2 = wildcardPaths1.map(function(path){
      return  '*' + path.substring(random.integer(1, path.length - 1), path.length - 2);
    });

    var started = Date.now();

    //now iterate and check they all match

    paths.every(function(path, pathIndex){
      if (!fool.matches(wildcardPaths1[pathIndex], wildcardPaths2[pathIndex])){
        done(new Error('expected a true'));
        return false;
      }
      return true;
    });

    var completed = Date.now() - started;

    console.log('did ', W_SUBSCRIPTION_COUNT, ' bi-directional compares in ', completed, 'milliseconds');

    done();
  });

  it('wildcard on left path, ie: te*t -> test', function(done){

    //construct our wildcard paths

    var paths = random.randomPaths({count:W_SUBSCRIPTION_COUNT});

    var wildcardPaths = paths.map(function(path){
      return  path.substring(0, random.integer(0, path.length - 1))  + '*';
    });

    var started = Date.now();

    //now iterate and check they all match

    paths.every(function(path, pathIndex){
      if (!fool.matches(wildcardPaths[pathIndex], path)){
        done(new Error('expected a true'));
        return false;
      }
      return true;
    });

    var completed = Date.now() - started;

    console.log('did ', W_SUBSCRIPTION_COUNT, ' left wildcard compares in ', completed, 'milliseconds');

    done();
  });

  it('wildcard on right path, ie: test -> t*st', function(done){

    //construct our wildcard paths

    var paths = random.randomPaths({count:W_SUBSCRIPTION_COUNT});

    var wildcardPaths = paths.map(function(path){
      return  path.substring(0, random.integer(0, path.length - 1))  + '*';
    });

    var started = Date.now();

    //now iterate and check they all match

    paths.every(function(path, pathIndex){
      if (!fool.matches(wildcardPaths[pathIndex], path)){
        done(new Error('expected a true'));
        return false;
      }
      return true;
    });

    var completed = Date.now() - started;

    console.log('did ', W_SUBSCRIPTION_COUNT, ' right wildcard compares in ', completed, 'milliseconds');

    done();
  });

  it('wildcard on both paths, ie: t*st -> t*t, no caching', function(done){

    //construct our wildcard paths

    var paths = random.randomPaths({count:W_SUBSCRIPTION_COUNT});

    var wildcardPaths1 = paths.map(function(path){
      return  path.substring(0, random.integer(0, path.length - 1))  + '*';
    });

    var wildcardPaths2 = wildcardPaths1.map(function(path){
      return  '*' + path.substring(random.integer(1, path.length - 1), path.length - 2);
    });

    var started = Date.now();

    //now iterate and check they all match

    paths.every(function(path, pathIndex){
      if (!foolNoCache.matches(wildcardPaths1[pathIndex], wildcardPaths2[pathIndex])){
        done(new Error('expected a true'));
        return false;
      }
      return true;
    });

    var completed = Date.now() - started;

    console.log('did ', W_SUBSCRIPTION_COUNT, ' bi-directional compares in ', completed, 'milliseconds');

    done();
  });

  it('wildcard on left path, ie: te*t -> test, no caching', function(done){

    //construct our wildcard paths

    var paths = random.randomPaths({count:W_SUBSCRIPTION_COUNT});

    var wildcardPaths = paths.map(function(path){
      return  path.substring(0, random.integer(0, path.length - 1))  + '*';
    });

    var started = Date.now();

    //now iterate and check they all match

    paths.every(function(path, pathIndex){
      if (!foolNoCache.matches(wildcardPaths[pathIndex], path)){
        done(new Error('expected a true'));
        return false;
      }
      return true;
    });

    var completed = Date.now() - started;

    console.log('did ', W_SUBSCRIPTION_COUNT, ' left wildcard compares in ', completed, 'milliseconds');

    done();
  });

  it('wildcard on right path, ie: test -> t*st, no caching', function(done){

    //construct our wildcard paths

    var paths = random.randomPaths({count:W_SUBSCRIPTION_COUNT});

    var wildcardPaths = paths.map(function(path){
      return  path.substring(0, random.integer(0, path.length - 1))  + '*';
    });

    var started = Date.now();

    //now iterate and check they all match

    paths.every(function(path, pathIndex){
      if (!foolNoCache.matches(wildcardPaths[pathIndex], path)){
        done(new Error('expected a true'));
        return false;
      }
      return true;
    });

    var completed = Date.now() - started;

    console.log('did ', W_SUBSCRIPTION_COUNT, ' right wildcard compares in ', completed, 'milliseconds');

    done();
  });

});
