window.addEventListener('load', function() {
  var objects = [new Clock(), new Pentagon(), new FPSCounter(),
    new NestedView(), new MouseFollower()];

  var rootHarmonizer = new harmonizer.Harmonizer();
  for (var i = 0, len = objects.length; i < len; ++i) {
    rootHarmonizer.appendChild(objects[i].harmonizer());
  }

  rootHarmonizer.on('paint', function() {
    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0, 0, 400, 400);
    for (var i = 0, len = objects.length; i < len; ++i) {
      objects[i].paint(ctx);
    }
  });

  rootHarmonizer.requestPaint();
});
