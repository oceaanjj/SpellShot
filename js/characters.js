// -- Character images --
// Each one is a sprite sheet (all frames side by side in one image)
const girlieImg = new Image();
const markImg = new Image();
const pattieImg = new Image();
const peterImg = new Image();

// -- Locked state images --
const girlieLockedImg = new Image();
const markLockedImg = new Image();
const pattieLockedImg = new Image();
const peterLockedImg = new Image();

// -- Character list --
const CHARACTERS = [
  {
    img: girlieImg,
    lockedImg: girlieLockedImg,
    totalFrames: 5,
    scale: 1.0,
    frameDuration: 300,
    unlocked: true,
    name: "GIRLIE",
    sound: "sounds/character/girlie.mp3",
  },
  {
    img: markImg,
    lockedImg: markLockedImg,
    totalFrames: 5,
    scale: 1.0,
    frameDuration: 300,
    unlocked: false,
    name: "PATTIE",
    sound: "sounds/character/pattie.mp3",
  },
  {
    img: pattieImg,
    lockedImg: pattieLockedImg,
    totalFrames: 5,
    scale: 1.0,
    frameDuration: 300,
    unlocked: false,
    name: "MARK",
    sound: "sounds/character/mark.mp3",
  },
  {
    img: peterImg,
    lockedImg: peterLockedImg,
    totalFrames: 5,
    scale: 1.0,
    frameDuration: 300,
    unlocked: false,
    name: "PETER",
    sound: "sounds/character/peter.mp3",
  },
];

// -- Which character is showing right now --
let currentCharIdx = 0; // index in CHARACTERS array
let incomingCharIdx = null; // the character sliding in (null when not sliding)

// -- Idle animation state --
let idleFrame = 0;
let lastIdleTime = 0;

// -- Slide animation state --
let isSliding = false;
let slideStartTime = 0;
let slideDirection = 1;

// -- Switch to the next or previous character --
// dir = +1 means go right (next), -1 means go left (previous)
function switchCharacter(dir) {
  if (isSliding) return;

  const nextIdx = currentCharIdx + dir;

  // Don't go past the first or last character
  if (nextIdx < 0 || nextIdx >= CHARACTERS.length) return;

  // Set up the slide
  slideDirection = dir;
  incomingCharIdx = nextIdx;
  isSliding = true;
  slideStartTime = performance.now();

  // Reset idle so the new character starts on frame 0
  idleFrame = 0;
  lastIdleTime = 0;

  playCharacterSfx(nextIdx);

  // Dim the arrows so the player can't spam click during the slide
  setArrowsInteractive(false);
}

// -- Show or hide the left/right arrows --
// Called after a slide finishes to update which arrows should be visible
function updateArrowVisibility() {
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");

  // Hide the left arrow if we're on the first character
  if (btnLeft) btnLeft.style.display = currentCharIdx === 0 ? "none" : "block";

  // Hide the right arrow if we're on the last character
  if (btnRight)
    btnRight.style.display =
      currentCharIdx === CHARACTERS.length - 1 ? "none" : "block";
}

// -- Enable or disable the arrow buttons --
function setArrowsInteractive(enabled) {
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");

  [btnLeft, btnRight].forEach((btn) => {
    if (!btn) return;
    btn.style.opacity = enabled ? "1" : "0.25";
    btn.style.pointerEvents = enabled ? "auto" : "none";
  });
}

function playCharacterSfx(idx) {
  const char = CHARACTERS[idx];
  if (!char?.sound) return;
  const sfx = new Audio(char.sound);
  sfx.volume = typeof getSfxVolume === "function" ? getSfxVolume() : 1;
  sfx.play().catch(() => {});
}

function drawCharacterName(ctx, name, x, y) {
  ctx.save();
  ctx.font = "bold 32px PixelFont";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Dark brown stroke
  ctx.strokeStyle = "#3B1A00";
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.strokeText(name, x, y);

  // Gold fill — same as coin display
  ctx.fillStyle = "#FFD700";
  ctx.fillText(name, x, y);

  ctx.restore();
}
