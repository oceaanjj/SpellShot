// =============================================
//  sfx.js — Centralized sound effects
// =============================================

function _playSfx(path) {
  const sfx = new Audio(path);
  sfx.volume = (typeof getSfxVolume === 'function') ? getSfxVolume() : 1;
  sfx.play().catch(() => {});
}

function playClickSfx()    { _playSfx('sounds/sfx/clickButton.mp3');  }
function playFireSfx()     { _playSfx('sounds/sfx/firingBall.mp3');   }
function playGameOverSfx() { _playSfx('sounds/sfx/gameOver.mp3');     }
function playHitSfx()      { _playSfx('sounds/sfx/hittingBlocks.mp3');}

// Timeticking loops — needs special handling
let _tickingAudio = null;
function startTickingSfx() {
  if (_tickingAudio) return;
  _tickingAudio = new Audio('sounds/sfx/Timeticking.mp3');
  _tickingAudio.loop   = true;
  _tickingAudio.volume = (typeof getSfxVolume === 'function') ? getSfxVolume() : 1;
  _tickingAudio.play().catch(() => {});
}
function stopTickingSfx() {
  if (!_tickingAudio) return;
  _tickingAudio.pause();
  _tickingAudio.currentTime = 0;
  _tickingAudio = null;
}