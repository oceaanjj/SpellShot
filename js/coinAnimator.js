window.CoinAnimator = (() => {
  let _element   = null;
  let _displayed = 0;
  let _target    = 0;
  let _rafId     = null;
  let _startTime = null;
  let _startValue = 0;

  const MAX_DIGITS_PER_SEC = 600;
  const MIN_MS = 180, MAX_MS = 1200, BASE_MS = 700;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function calcDuration(delta) {
    const abs = Math.abs(delta);
    if (abs === 0) return 0;
    return Math.max(MIN_MS, Math.min(MAX_MS, Math.max((abs / MAX_DIGITS_PER_SEC) * 1000, BASE_MS)));
  }

  function _tick(now) {
    if (_startTime === null) _startTime = now;
    const delta    = _target - _startValue;
    const duration = calcDuration(delta);
    const current  = duration === 0
      ? _target
      : Math.round(_startValue + delta * easeOut(Math.min((now - _startTime) / duration, 1)));
    _displayed = current;
    if (_element) _element.textContent = _displayed.toLocaleString();
    if (current !== _target) { _rafId = requestAnimationFrame(_tick); }
    else { _rafId = null; }
  }

  function _cancel() {
    if (_rafId !== null) { cancelAnimationFrame(_rafId); _rafId = null; }
  }

  function setElement(el) { _element = el; if (_element) _element.textContent = _displayed.toLocaleString(); }

  function jumpTo(value) {
    _cancel();
    _displayed = _target = Math.max(0, Math.round(value));
    if (_element) _element.textContent = _displayed.toLocaleString();
  }

  function animateTo(value) {
    const newTarget = Math.max(0, Math.round(value));
    if (newTarget === _target && _rafId === null) return;
    _cancel();
    _startValue = _displayed;
    _target     = newTarget;
    _startTime  = null;
    _rafId = requestAnimationFrame(_tick);
  }

  function getCurrent() { return _displayed; }
  function finish() { _cancel(); _displayed = _target; if (_element) _element.textContent = _displayed.toLocaleString(); }

  return { setElement, jumpTo, animateTo, getCurrent, finish };
})();