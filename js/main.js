// =============================================
//  main.js  ← start here when reading the code
//
//  This file is the entry point of the whole game.
//  It does 4 things in order:
//
//  1. Grabs the canvas elements from the HTML
//  2. Sets the image file paths
//  3. Waits for every image to finish loading
//  4. Sets up buttons and starts the game loop
//
//  All the actual logic lives in the other files.
//  This file just wires them together.
// =============================================


// -- Grab the two canvas layers from the HTML --
// mainCanvas → background + character are drawn here
// fxCanvas   → particles and effects are drawn here (sits on top)
const mainCanvas = document.getElementById('mainCanvas');
const mainCtx    = mainCanvas.getContext('2d');
mainCtx.imageSmoothingEnabled = false;  // keeps pixel art sharp

const fxCanvas = document.getElementById('fxCanvas');
const fxCtx    = fxCanvas.getContext('2d');
fxCtx.imageSmoothingEnabled = false;


// -- Background image --
// Declared here since it's not a character (lives in characters.js)
const bgImg = new Image();


// -- Set the file path for every image --
// Characters are inside assets/characters/
// Everything else is directly in assets/
bgImg.src     = 'assets/background.png';
girlieImg.src = 'assets/character/mainMenu/girlie.png';
markImg.src   = 'assets/character/mainMenu/mark.png';
pattieImg.src = 'assets/character/mainMenu/pattie.png';
peterImg.src  = 'assets/character/mainMenu/peter.png';

// -- Locked state images --
// For now these point to the same image as the normal ones.
// Later, just change the path to your real locked artwork.
// Example: girlieLockedImg.src = 'assets/characters/characterGirlieLocked.png';
girlieLockedImg.src = 'assets/character/mainMenu/girlie.png';
markLockedImg.src   = 'assets/character/mainMenu/mark.png';
pattieLockedImg.src = 'assets/character/mainMenu/pattie.png';
peterLockedImg.src  = 'assets/character/mainMenu/peter.png';


// -- Asset loader --
// The game won't start until every image has loaded.
// Each image calls onAssetLoaded() when it's ready (or if it fails).
// When the count reaches TOTAL_ASSETS, everything starts.

let loadedCount    = 0;
const TOTAL_ASSETS = 9; // background + 4 normal + 4 locked  ← update this if you add more images

function onAssetLoaded() {
  loadedCount++;

  // Not everything is ready yet — keep waiting
  if (loadedCount < TOTAL_ASSETS) return;

  // -- All images are loaded! --

  // Calculate the sprite frame size for the starting character
  const startChar = CHARACTERS[currentCharIdx];
  FRAME_W = startChar.img.naturalWidth / startChar.totalFrames;
  FRAME_H = startChar.img.naturalHeight;

  // Show or hide the left/right arrows based on which character we start on
  updateArrowVisibility();


  // -- Register all buttons --
  // setupBtn( elementId, burstColour, callbackFunction )
  // burstColour = colour of the dots that explode out when clicked
  // callback    = what happens after the click (optional)
setupBtn('btnSettings', '#aaddff', openSettings);                    // no action yet
  setupBtn('btnSkins', '#ff9944', openCannonShop);              // opens cannon skin shop
  setupBtn('btnBalls',    '#55ff99', openBallShop);            // opens cannon ball skin shop
  setupBtn('btnPlay',     '#ffcc00', goToGame);                // goes to game.html
  setupBtn('btnRight',    '#ffd966', () => switchCharacter(+1)); // next character
  setupBtn('btnLeft',     '#ffd966', () => switchCharacter(-1)); // previous character
  // ↑ Add future buttons here — one line each


  // -- Start the game loop --
  startLoop(mainCtx, fxCtx, bgImg);
}


// -- Attach the loader to every image --
// onload  = image loaded successfully
// onerror = image failed (still counts so the game doesn't get stuck)
[
  bgImg,
  girlieImg, markImg, pattieImg, peterImg,              // normal character images
  girlieLockedImg, markLockedImg, pattieLockedImg, peterLockedImg  // locked state images
].forEach(img => {
  img.onload  = onAssetLoaded;
  img.onerror = onAssetLoaded;
});