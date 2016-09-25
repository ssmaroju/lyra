/* eslint no-unused-expressions:0 */
'use strict';
var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
var expect = chai.expect;
var sinon = require('sinon');

var CancellablePromise = require('./simple-cancellable-promise');

describe('CancellablePromise utility', function() {

  it('is a function', function() {
    expect(CancellablePromise).to.be.a('function');
  });

  it('returns a promise-like object', function() {
    expect(CancellablePromise.prototype).to.have.property('then');
    expect(CancellablePromise.prototype.then).to.be.a('function');
    expect(CancellablePromise.prototype).to.have.property('catch');
    expect(CancellablePromise.prototype.catch).to.be.a('function');
  });

  it('resolves like a regular promise', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      resolve('success!');
    });
    return expect(prom).to.eventually.equal('success!');
  });

  it('rejects like a regular promise', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      reject('failure!');
    });
    return expect(prom).to.eventually.be.rejectedWith('failure!');
  });

  it('can be caught like a regular promise', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      reject('failure!');
    });
    return expect(prom.catch(function(err) {
      return 'acceptable failure';
    })).to.eventually.equal('acceptable failure');
  });

  it('can be chained like a regular promise', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      resolve('success!');
    });
    return expect(prom.then(function(result) {
      return result.toUpperCase();
    }).then(function(result) {
      return result + '!?';
    })).to.eventually.equal('SUCCESS!!?');
  });

  it('handles chained rejection like a regular promise via .then', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      resolve('success!');
    });
    return expect(prom.then(function(result) {
      throw new Error('BAM');
    }).then(function(result) {
      return 'success';
    }, function(err) {
      return err.message;
    })).to.eventually.equal('BAM');
  });

  it('handles chained rejection like a regular promise via .catch', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      resolve('success!');
    });
    return expect(prom.then(function(result) {
      throw new Error('BAM');
    }).then(function(result) {
      throw new Error('POW');
    }).catch(function(err) {
      return err.message;
    })).to.eventually.equal('BAM');
  });

  // This "canary" test must succeed in order to prove that the next test fails
  it('can be used to cancel the callbacks for a promise (canary)', function(done) {
    var didComplete = false,
        ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      resolve();
    });
    prom.then(function() {
      didComplete = true;
    });
    expect(didComplete).to.equal(false);
    setTimeout(function() {
      // Clumsy way to validate that promise did complete
      expect(ran).to.equal(true);
      expect(didComplete).to.equal(true);
      done();
    }, 50);
  });

  it('can be used to cancel registered callbacks for a promise', function(done) {
    var didComplete = false,
        ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      resolve();
    });
    prom.then(function() {
      didComplete = true;
    });
    prom.cancel();
    expect(didComplete).to.equal(false);
    setTimeout(function() {
      // Clumsy way to validate that promise did complete
      expect(ran).to.equal(true);
      expect(didComplete).to.equal(false);
      done();
    }, 50);
  });

  it('can be used to cancel yet-to-be-registered callbacks for a promise', function(done) {
    var didComplete = false,
        ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      resolve();
    });
    prom.cancel();
    prom.then(function() {
      didComplete = true;
    });
    expect(didComplete).to.equal(false);
    setTimeout(function() {
      // Clumsy way to validate that promise did complete
      expect(ran).to.equal(true);
      expect(didComplete).to.equal(false);
      done();
    }, 50);
  });

  it('can be used to cancel a chain of registered promise callbacks (canary)', function(done) {
    var didComplete = false,
        ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      resolve();
    });
    prom.then(function() {
      return 1;
    }).then(function() {
      return 2;
    }).then(function() {
      didComplete = true;
    });
    expect(didComplete).to.equal(false);
    setTimeout(function() {
      // Clumsy way to validate that promise did complete
      expect(ran).to.equal(true);
      expect(didComplete).to.equal(true);
      done();
    }, 50);
  });

  it('can be used to cancel a chain of registered promise callbacks', function(done) {
    var didComplete = false,
        ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      resolve();
    });
    prom.then(function() {
      return 1;
    }).then(function() {
      return 2;
    }).then(function() {
      didComplete = true;
    });
    prom.cancel();
    expect(didComplete).to.equal(false);
    setTimeout(function() {
      // Clumsy way to validate that promise did complete
      expect(ran).to.equal(true);
      expect(didComplete).to.equal(false);
      done();
    }, 50);
  });

  it('can be used to cancel a chain of to-be-registered promise callbacks (canary)', function(done) {
    var didComplete = false,
        ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      resolve();
    });
    prom.cancel();
    prom.then(function() {
      return 1;
    }).then(function() {
      return 2;
    }).then(function() {
      didComplete = true;
    });
    expect(didComplete).to.equal(false);
    setTimeout(function() {
      // Clumsy way to validate that promise did complete
      expect(ran).to.equal(true);
      expect(didComplete).to.equal(false);
      done();
    }, 50);
  });

  it('cannot, however, be used to cancel in-progress callbacks', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      resolve('success!');
    });
    expect(prom.then(function() {
      prom.cancel();
      return 'foo';
    }).then(function(result) {
      if (result === 'foo') {
        return 'did not cancel';
      }
    })).to.eventually.equal('did not cancel');
  });

  it('does not swallow errors within the initial promise', function() {
    var prom = new CancellablePromise(function(resolve, reject) {
      throw new Error('BAM');
    });
    prom.cancel();
    return expect(prom.catch(function(err) {
      expect(err).to.be.an.instanceOf(Error);
      throw err;
    })).to.eventually.be.rejectedWith('BAM');
  });

  it('binds the executor function to expose cancelled state', function(done) {
    var cancelledVisibleWithinPromise = false,
        ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      expect(this.cancelled).to.equal(false);
      var that = this;
      // Introduce asynchronicity to allow a two-state initial promise action
      setTimeout(function() {
        if (that.cancelled) {
          cancelledVisibleWithinPromise = true;
        }
      }, 10);
    });
    var spy = sinon.spy();
    prom.then(spy);
    prom.cancel();
    setTimeout(function() {
      // Clumsy way to validate that promise did what we want
      expect(ran).to.equal(true);
      expect(cancelledVisibleWithinPromise).to.equal(true);
      expect(spy).not.to.have.been.called;
      done();
    }, 50);
  });

  it('can use function context to manipulate cancelled status within executor', function(done) {
    var ran = false;
    var prom = new CancellablePromise(function(resolve, reject) {
      ran = true;
      expect(this.cancelled).to.equal(false);
      this.cancel();
      resolve(this);
    });
    var spy = sinon.spy();
    prom.then(spy);
    setTimeout(function() {
      // Clumsy way to validate that promise did what we want
      expect(ran).to.equal(true);
      expect(spy).not.to.have.been.called;
      done();
    }, 50);
  });

});
