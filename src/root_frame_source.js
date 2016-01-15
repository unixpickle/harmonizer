function RootFrameSource() {
  this._frameDestination = null;
  this._animationFrameRequest = null;
  this._boundCallback = this._animationFrame.bind(this);
}

RootFrameSource.prototype._addFrameDestination = function(dest) {
  assert(this._frameDestination !== null);
  assert(this._animationFrameRequest === null);
  this._animationFrameRequest = requestAnimationFrameOrPolyfill(this._boundCallback);
};

RootFrameSource.prototype._removeFrameDestination = function(dest) {
  assert(this._frameDestination !== null);
  assert(this._animationFrameRequest !== null);
  this._frameDestination = null;
  cancelAnimationFrameOrPolyfill(this._animationFrameRequest);
  this._animationFrameRequest = null;
};

RootFrameSource.prototype._animationFrame = function(time) {
  this._animationFrameRequest = requestAnimationFrameOrPolyfill(this._boundCallback);
  this._frameDestination._handleFrame(time);
};
