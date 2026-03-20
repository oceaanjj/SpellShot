// =============================================
//  characters.js
//  The list of characters + the logic for
//  switching between them with a slide animation.
//
//  To add a new character:
//    1. Create a new Image() below
//    2. Add it to the CHARACTERS array
//    3. Set its .src in main.js
// =============================================


// -- Character images --
// Each one is a sprite sheet (all frames side by side in one image)
const girlieImg = new Image();
const markImg   = new Image();
const pattieImg = new Image();
const peterImg  = new Image();

// -- Locked state images --
// Each character can have a separate image shown when they are locked.
// For now they use the same image as the normal one.
// When you have a real locked image later, just change the .src in main.js.
const girlieLockedImg = new Image();
const markLockedImg   = new Image();
const pattieLockedImg = new Image();
const peterLockedImg  = new Image();


// -- Character list --
// Each character needs:
//   img           → the sprite sheet shown when unlocked
//   lockedImg     → the sprite sheet shown when locked (swap this later for a real locked image)
//   totalFrames   → how many animation frames are in the sprite sheet
//   scale         → extra size multiplier (1.0 = no change)
//   frameDuration → how long each frame stays before moving to the next (ms)
//   unlocked      → true = playable,  false = shows a lock on top
//
//  To unlock a character later:
//    Change  unlocked: false  →  unlocked: true
//    (or do it in code when the player reaches a certain level)
const CHARACTERS = [
  { img: girlieImg, lockedImg: girlieLockedImg, totalFrames: 5, scale: 1.0, frameDuration: 300, unlocked: true  },
  { img: markImg,   lockedImg: markLockedImg,   totalFrames: 5, scale: 1.0, frameDuration: 300, unlocked: false },
  { img: pattieImg, lockedImg: pattieLockedImg, totalFrames: 5, scale: 1.0, frameDuration: 300, unlocked: false },
  { img: peterImg,  lockedImg: peterLockedImg,  totalFrames: 5, scale: 1.0, frameDuration: 300, unlocked: false },
];


// -- Which character is showing right now --
let currentCharIdx  = 0;     // index in CHARACTERS array
let incomingCharIdx = null;  // the character sliding in (null when not sliding)


// -- Idle animation state --
let idleFrame    = 0;   // which frame of the idle animation we're on
let lastIdleTime = 0;   // when we last changed frames (used to time the animation)


// -- Slide animation state --
let isSliding      = false;  // are we currently sliding?
let slideStartTime = 0;      // when the slide started (so we know how far along it is)
let slideDirection = 1;      // +1 = sliding right-to-left,  -1 = sliding left-to-right


// -- Switch to the next or previous character --
// dir = +1 means go right (next), -1 means go left (previous)
function switchCharacter(dir) {
  // Don't start a new slide if one is already playing
  if (isSliding) return;

  const nextIdx = currentCharIdx + dir;

  // Don't go past the first or last character
  if (nextIdx < 0 || nextIdx >= CHARACTERS.length) return;

  // Set up the slide
  slideDirection  = dir;
  incomingCharIdx = nextIdx;
  isSliding       = true;
  slideStartTime  = performance.now();

  // Reset idle so the new character starts on frame 0
  idleFrame    = 0;
  lastIdleTime = 0;

  // Dim the arrows so the player can't spam click during the slide
  setArrowsInteractive(false);
}


// -- Show or hide the left/right arrows --
// Called after a slide finishes to update which arrows should be visible
function updateArrowVisibility() {
  const btnLeft  = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');

  // Hide the left arrow if we're on the first character
  if (btnLeft)  btnLeft.style.display  = currentCharIdx === 0                     ? 'none' : 'block';

  // Hide the right arrow if we're on the last character
  if (btnRight) btnRight.style.display = currentCharIdx === CHARACTERS.length - 1 ? 'none' : 'block';
}


// -- Enable or disable the arrow buttons --
// enabled = false → dim them + block clicks (used during slide)
// enabled = true  → bring them back to normal
function setArrowsInteractive(enabled) {
  const btnLeft  = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');

  [btnLeft, btnRight].forEach(btn => {
    if (!btn) return;
    btn.style.opacity       = enabled ? '1'    : '0.25';
    btn.style.pointerEvents = enabled ? 'auto' : 'none';
  });
}