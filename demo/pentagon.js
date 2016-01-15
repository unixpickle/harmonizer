function Pentagon(x, y, r) {
  this._harmonizer = new window.harmonizer.Harmonizer();
  this._harmonizer.start();
  this._harmonizer.on('animationFrame', function(time) {
    this._angle = (time/1000) % Math.PI*2;
    this._harmonizer.requestPaint();
  }.bind(this));
  this._angle = 0;
  this._x = x || 350;
  this._y = y || 350;
  this._r = r || 20;

  var running = true;
  var canvas = document.getElementById('canvas');
  canvas.addEventListener('click', function(e) {
    var clientRect = canvas.getBoundingClientRect();
    var x = e.clientX - clientRect.left;
    var y = e.clientY - clientRect.top;
    var distance = Math.sqrt(Math.pow(this._x-x, 2) + Math.pow(this._y-y, 2));
    if (distance <= this._r) {
      if (running) {
        this._harmonizer.pause();
      } else {
        this._harmonizer.start();
      }
      running = !running;
    }
  }.bind(this));
}

Pentagon.prototype.harmonizer = function() {
  return this._harmonizer;
};

Pentagon.prototype.paint = function(ctx) {
  ctx.beginPath();
  ctx.fillStyle = '#65bcd4';
  for (var i = 0; i < 5; ++i) {
    var angle = this._angle + (Math.PI*2/5)*i;
    var x = Math.cos(angle)*this._r + this._x;
    var y = Math.sin(angle)*this._r + this._y;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
};
