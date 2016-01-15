var ANIMATION_STOPPED = 0;
var ANIMATION_RUNNING = 1;
var ANIMATION_PAUSED = 2;

function Harmonizer() {
  EventEmitter.call(this);

  this._rootFrameSource = new RootFrameSource();
  this._frameSource = this._rootFrameSource;
  this._frameDestinations = [];

  this._children = [];
  this._parent = null;

  this._animationState = ANIMATION_STOPPED;
  this._animationStartTime = 0;
  this._animationSkipTime = 0;

  this._takesRepaintRequests = false;
  this._propagatingPaint = false;
  this._needsRepaint = false;
}

Harmonizer.prototype = Object.create(EventEmitter.prototype);

Harmonizer.prototype.start = function() {
  // TODO: start or resume the animation here.
};

Harmonizer.prototype.stop = function() {
  // TODO: stop the animation here.
};

Harmonizer.prototype.pause = function() {
  // TODO: pause the animation here.
};

Harmonizer.prototype.requestPaint = function() {
  var root = this._rootHarmonizer();
  if (root._takesRepaintRequests) {
    root._needsRepaint = true;
  } else {
    root.emit('paint');
  }
};

Harmonizer.prototype.appendChild = function(child) {
  // TODO: add the child and potentially hook it up to receive
  // animation frames.
};

Harmonizer.prototype.removeChild = function(child) {
  // TODO: remove the child and potentially hook it up to its root frame source.
};

Harmonizer.prototype._addFrameDestination = function(dest) {
  this._frameDestinations.push(dest);
  if (this._frameRetainCount() === 1) {
    this._frameSource._addFrameDestination(this);
  }
};

Harmonizer.prototype._removeFrameDestination = function(dest) {
  var idx = this._frameDestinations.indexOf(dest);
  assert(idx >= 0);
  this._frameDestinations.splice(idx, 1);
  if (this._frameRetainCount() === 0) {
    this._frameSource._removeFrameDestination(this);
  }
};

Harmonizer.prototype._handleFrame = function(time) {
  this._takesRepaintRequests = (this._parent === null);
  this._needsRepaint = false;

  if (this._animationState === ANIMATION_RUNNING) {
    this.emit('animationFrame', time-this._animationStartTime+this._animationSkipTime);
  }

  // Prevent new destinations from getting callbacks for this animation frame.
  var destinations = this._frameDestinations.slice();
  for (var i = 0, len = destinations.length; i < len; ++i) {
    // Allow destinations to be removed during the animation frame.
    var dest = destinations[i];
    if (this._frameDestinations.indexOf(dest) < 0) {
      continue;
    }
    dest._handleFrame(time);
  }

  if (this._needsRepaint) {
    this.emit('paint');
  }
  this._takesRepaintRequests = false;
};

Harmonizer.prototype._frameRetainCount = function() {
  if (this._animationState === ANIMATION_RUNNING) {
    return 1 + this._frameDestinations.length;
  } else {
    return this._frameDestinations.length;
  }
};

Harmonizer.prototype._rootHarmonizer = function() {
  var root = this;
  while (root._parent !== null) {
    root = root._parent;
  }
  return root;
};
