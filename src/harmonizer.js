var ANIMATION_STOPPED = 0;
var ANIMATION_RUNNING = 1;
var ANIMATION_PAUSED = 2;

function Harmonizer() {
  EventEmitter.call(this);

  this._rootFrameSource = new RootFrameSource();
  this._frameSource = this._rootFrameSource;
  this._frameDestinations = [];

  this._parent = null;
  this._children = [];

  this._animationState = ANIMATION_STOPPED;
  this._animationStartTime = 0;
  this._animationSkipTime = 0;

  this._takesRepaintRequests = false;
  this._propagatingPaint = false;
  this._needsRepaint = false;
}

Harmonizer.prototype = Object.create(EventEmitter.prototype);
Harmonizer.prototype.constructor = Harmonizer;

Harmonizer.prototype.start = function() {
  switch (this._animationState) {
  case ANIMATION_RUNNING:
    return;
  case ANIMATION_STOPPED:
  case ANIMATION_PAUSED:
    this._animationState = ANIMATION_RUNNING;
    this._animationStartTime = getCurrentTime();
    if (this._frameRetainCount() === 1) {
      this._frameSource._addFrameDestination(this);
    }
  }
};

Harmonizer.prototype.stop = function() {
  switch (this._animationState) {
  case ANIMATION_STOPPED:
    break;
  case ANIMATION_PAUSED:
    this._animationSkipTime = 0;
    this._animationState = ANIMATION_STOPPED;
    break;
  case ANIMATION_RUNNING:
    this._animationSkipTime = 0;
    this._animationState = ANIMATION_STOPPED;
    if (this._frameRetainCount() === 0) {
      this._frameSource._removeFrameDestination(this);
    }
    break;
  }
};

Harmonizer.prototype.pause = function() {
  switch (this._animationState) {
  case ANIMATION_PAUSED:
  case ANIMATION_STOPPED:
    break;
  case ANIMATION_RUNNING:
    this._animationSkipTime += getCurrentTime() - this._animationStartTime;
    this._animationState = ANIMATION_PAUSED;
    if (this._frameRetainCount() === 0) {
      this._frameSource._removeFrameDestination(this);
    }
    break;
  }
};

Harmonizer.prototype.requestPaint = function() {
  var root = this._rootHarmonizer();
  if (root._takesRepaintRequests) {
    root._needsRepaint = true;
  } else {
    root._propagatePaint();
  }
};

Harmonizer.prototype.appendChild = function(child) {
  this._children.push(child);
  if (child._frameRetainCount() > 0) {
    child._frameSource._removeFrameDestination(child);
  }
  child._frameSource = this;
  child._parent = this;
  if (child._frameRetainCount() > 0) {
    this._addFrameDestination(child);
  }
};

Harmonizer.prototype.removeChild = function(child) {
  var idx = this._children.indexOf(child);
  assert(idx >= 0);
  this._children.splice(idx, 1);
  if (child._frameRetainCount() > 0) {
    this._removeFrameDestination(child);
  }
  child._frameSource = child._rootFrameSource;
  child._parent = null;
  if (child._frameRetainCount() > 0) {
    child._frameSource._addFrameDestination(child);
  }
};

Harmonizer.prototype.getParent = function() {
  return this._parent;
};

Harmonizer.prototype.spawnChild = function() {
  var res = new Harmonizer();
  this.appendChild(res);
  return res;
};

Harmonizer.prototype.makeSingleShot = function() {
  this.on('animationFrame', function() {
    this.stop();
    this.requestPaint();
  }.bind(this));
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
  this._takesRepaintRequests = true;
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
    this._propagatePaint();
  }
  this._takesRepaintRequests = false;
};

Harmonizer.prototype._propagatePaint = function() {
  var tookRepaintRequests = this._takesRepaintRequests;
  this._takesRepaintRequests = true;

  this.emit('paint');

  // Prevent new children from getting the paint callback.
  var children = this._children.slice();
  for (var i = 0, len = children.length; i < len; ++i) {
    // Allow children to be removed during the propagation.
    var child = children[i];
    if (child._parent !== this) {
      continue;
    }
    child._propagatePaint();
  }

  this._takesRepaintRequests = tookRepaintRequests;
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

exports.Harmonizer = Harmonizer;
