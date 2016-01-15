function NestedView() {
  this._pentagon = new Pentagon(310, 30, 10);
  this._clock = new Clock(350, 70, 30);
  this._harmonizer = new window.harmonizer.Harmonizer();
  this._harmonizer.appendChild(this._pentagon.harmonizer());
  this._harmonizer.appendChild(this._clock.harmonizer());
}

NestedView.prototype.harmonizer = function() {
  return this._harmonizer;
};

NestedView.prototype.paint = function(ctx) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(290, 10, 100, 100);
  ctx.stroke();

  this._pentagon.paint(ctx);
  this._clock.paint(ctx);
};
