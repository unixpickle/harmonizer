function Context() {
  this._paintHarmonizers = [];
  this._animatingHarmonizers = [];
  this._animationFrameRequest = null;
  this._boundCallback = this._animationFrame.bind(this);
  this._isHandlingAnimationFrame = false;
}

Context.prototype._addAnimatingHarmonizer = function(h) {
  this._animatingHarmonizers.push(h);
  if (this._animationFrameRequest === null) {
    this._animationFrameRequest = requestAnimationFrameOrPolyfill(this._boundCallback);
  }
};

Context.prototype._removeAnimatingHarmonizer = function(h) {
  var idx = this._animatingHarmonizers.indexOf(h);
  assert(idx >= 0);
  this._animatingHarmonizers.splice(idx, 1);
  if (this._animatingHarmonizers.length === 0) {
    cancelAnimationFrameOrPolyfill(this._animationFrameRequest);
    this._animationFrameRequest = null;
  }
};

Context.prototype._inAnimationFrame = function() {
  return this._isHandlingAnimationFrame;
};

Context.prototype._addPaintHarmonizer = function(h) {
  var idx = this._paintHarmonizers.indexOf(h);
  if (idx < 0) {
    this._paintHarmonizers.push(h);
  }
};

Context.prototype._animationFrame = function(time) {
  this._isHandlingAnimationFrame = true;
  this._animationFrameRequest = requestAnimationFrameOrPolyfill(this._boundCallback);

  var destinations = this._animatingHarmonizers.slice();
  for (var i = 0, len = destinations.length; i < len; ++i) {
    var destination = destinations[i];
    if (this._animatingHarmonizers.indexOf(destination) < 0) {
      continue;
    }
    destination._handleFrame(time);
  }

  var paintHarmonizers = this._paintHarmonizers.slice();
  for (var i = 0, len = paintHarmonizers.length; i < len; ++i) {
    paintHarmonizers[i]._paint();
  }
  this._paintHarmonizers = [];

  this._isHandlingAnimationFrame = false;
};

exports.defaultContext = new Context();
exports.Context = Context;
