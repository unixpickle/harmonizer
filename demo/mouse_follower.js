function MouseFollower() {
  this._x = 200;
  this._y = 200;
  this._r = 5;
  this._harmonizer = new window.harmonizer.Harmonizer();
  this._harmonizer.makeSingleShot();

  var canvas = document.getElementById('canvas');
  canvas.addEventListener('mousemove', function(e) {
    var clientRect = canvas.getBoundingClientRect();
    this._x = e.clientX - clientRect.left;
    this._y = e.clientY - clientRect.top;
    this._harmonizer.start();
  }.bind(this));
}

MouseFollower.prototype.harmonizer = function() {
  return this._harmonizer;
};

MouseFollower.prototype.paint = function(ctx) {
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(this._x, this._y, this._r, 0, Math.PI*2);
  ctx.fill();
};
