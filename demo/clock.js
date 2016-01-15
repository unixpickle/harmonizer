function Clock(x, y, r) {
  this._harmonizer = new window.harmonizer.Harmonizer();
  this._harmonizer.makeSingleShot();
  setInterval(function() {
    this._harmonizer.start();
  }.bind(this), 1000);
  this._x = x || 60;
  this._y = y || 60;
  this._r = r || 40;
}

Clock.prototype.harmonizer = function() {
  return this._harmonizer;
};

Clock.prototype.paint = function(ctx) {
  var now = new Date();
  var second = (now.getSeconds()*Math.PI/30) - Math.PI/2;
  var minute = (now.getMinutes()*Math.PI/30) - Math.PI/2;

  ctx.lineCap = 'round';

  ctx.strokeStyle = 'black';
  ctx.fillStyle = '#65bcd4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(this._x, this._y, this._r, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(this._x, this._y);
  ctx.lineTo(this._x+Math.cos(minute)*this._r*0.5, this._y+Math.sin(minute)*this._r*0.5);
  ctx.stroke();

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(this._x, this._y);
  ctx.lineTo(this._x+Math.cos(second)*this._r*0.8, this._y+Math.sin(second)*this._r*0.8);
  ctx.stroke();

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(this._x, this._y, 3, 0, Math.PI*2);
  ctx.fill();
};
