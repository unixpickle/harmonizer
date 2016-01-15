function FPSCounter() {
  this._harmonizer = new window.harmonizer.Harmonizer();
  this._recentDates = [];
  this._x = 10;
  this._y = 390;

  this._harmonizer.makeSingleShot();
  setInterval(function() {
    this._harmonizer.start();
  }.bind(this), 1000);
}

FPSCounter.BUFFER_TIME = 2000;

FPSCounter.prototype.harmonizer = function() {
  return this._harmonizer;
};

FPSCounter.prototype.paint = function(ctx) {
  var fps = this._pushRecentDate().toFixed(1);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'black';
  ctx.fillText(fps+' FPS', this._x, this._y);
};

FPSCounter.prototype._pushRecentDate = function() {
  var now = new Date().getTime();
  while (this._recentDates.length > 0) {
    if (this._recentDates[0] > now-FPSCounter.BUFFER_TIME) {
      break;
    }
    this._recentDates.splice(0, 1);
  }
  this._recentDates.push(now);
  if (this._recentDates.length === 1) {
    return 0;
  }
  return this._recentDates.length / (FPSCounter.BUFFER_TIME / 1000);
};
