var POLYFILL_FPS = 60;

var supportsAnimationFrame = ('requestAnimationFrame' in window &&
  'undefined' !== typeof performance && 'now' in performance);

function getCurrentTime() {
  if (supportsAnimationFrame) {
    return performance.now();
  } else {
    return new Date().getTime();
  }
}

function requestAnimationFrameOrPolyfill(func) {
  if (supportsAnimationFrame) {
    return window.requestAnimationFrame(func);
  } else {
    return setTimeout(function() {
      func(getCurrentTime());
    }, 1000/POLYFILL_FPS);
  }
}

function cancelAnimationFrameOrPolyfill(id) {
  if (supportsAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}
