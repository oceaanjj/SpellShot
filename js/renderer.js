// =============================================
//  renderer.js
//  Draws everything on the main canvas each frame.
//
//  drawScene()   → draws background + character
//  startLoop()   → starts the game loop (runs forever)
//
//  Uses values from: constants.js, characters.js, particles.js
// =============================================

// -- Sprite sheet info --
// These get filled in once the character images have loaded
let FRAME_W = 0; // width of a single animation frame
let FRAME_H = 0; // height of the sprite sheet

// -- Draw a character name below the character --
// x    → horizontal centre of the character on screen
// y    → vertical position (bottom of character + a little padding)
function drawCharacterName(mainCtx, name, x, y) {
  mainCtx.save();
  mainCtx.font = "bold 18px PixelFont";
  mainCtx.textAlign = "center";
  mainCtx.textBaseline = "top";

  // Dark brown stroke for readability
  mainCtx.strokeStyle = "#3B1A00";
  mainCtx.lineWidth = 7;
  mainCtx.lineJoin = "round";
  mainCtx.strokeText(name, x, y);

  // Gold fill — matches the coin counter style
  mainCtx.fillStyle = "#FFD700";
  mainCtx.fillText(name, x, y);

  mainCtx.restore();
}

// -- Draw everything for one frame --
// mainCtx → the main canvas context
// bgImg   → the background image
// ts      → current timestamp from requestAnimationFrame (used for animation timing)
function drawScene(mainCtx, bgImg, ts) {
  // Wipe the canvas clean before drawing the new frame
  mainCtx.clearRect(0, 0, GAME_W, GAME_H);

  // -- Background image --
  mainCtx.drawImage(bgImg, 0, 0, GAME_W, GAME_H);

  // -- Dark overlay --
  // Makes the background darker so UI buttons are easier to see
  mainCtx.fillStyle = "rgba(0, 8, 24, 0.52)";
  mainCtx.fillRect(0, 0, GAME_W, GAME_H);

  // -- Vignette (dark edges around the screen) --
  // Creates a radial gradient: transparent in the middle, dark on the edges
  const vignette = mainCtx.createRadialGradient(
    GAME_W / 2,
    GAME_H / 2,
    GAME_H * 0.28, // inner circle (clear)
    GAME_W / 2,
    GAME_H / 2,
    GAME_H * 0.85, // outer circle (dark)
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)"); // centre = transparent
  vignette.addColorStop(1, "rgba(0,0,0,0.55)"); // edges = dark
  mainCtx.fillStyle = vignette;
  mainCtx.fillRect(0, 0, GAME_W, GAME_H);

  // -- Character --
  // Don't try to draw if images haven't loaded yet
  if (FRAME_W === 0) return;

  const ch = CHARACTERS[currentCharIdx];

  // -- Advance the idle animation --
  // Every frameDuration ms, move to the next frame in the sprite sheet
  if (!lastIdleTime) lastIdleTime = ts;
  if (ts - lastIdleTime > ch.frameDuration) {
    idleFrame = (idleFrame + 1) % ch.totalFrames; // loop back to 0 after last frame
    lastIdleTime = ts;
  }

  // -- Helper: draw one character + its name --
  // character  → which character to draw
  // xOffset    → how far to shift it left or right (used for slide animation)
  // alpha      → opacity, 0 = invisible, 1 = fully visible (used for fade effect)
  const drawCharacter = (character, xOffset, alpha = 1) => {
    // Use the locked image if the character is locked, otherwise use the normal image
    const img = character.unlocked ? character.img : character.lockedImg;

    const fw = img.naturalWidth / character.totalFrames; // single frame width
    const fh = img.naturalHeight; // full height

    mainCtx.save();
    mainCtx.globalAlpha = alpha; // apply fade
    mainCtx.translate(PLAYER_X + xOffset, PLAYER_Y);
    mainCtx.scale(PLAYER_SCALE, PLAYER_SCALE);

    mainCtx.drawImage(
      img, // ← locked or normal image
      idleFrame * fw,
      0,
      fw,
      fh, // which frame to cut from the sprite sheet
      0,
      0,
      fw * character.scale,
      fh * character.scale, // where to draw it on canvas
    );

    mainCtx.restore();

    // -- Draw name below the character --
    // Compute the screen-space centre and bottom of the character
    const charScreenW = fw * character.scale * PLAYER_SCALE;
    const charScreenH = fh * character.scale * PLAYER_SCALE;
    const nameCentreX = 725;
    const nameY = PLAYER_Y + charScreenH + 10;

    // Apply the same alpha fade as the character
    mainCtx.save();
    mainCtx.globalAlpha = alpha;
    drawCharacterName(mainCtx, character.name, nameCentreX, nameY);
    mainCtx.restore();
  };

  // -- Slide + fade transition between characters --
  if (isSliding && incomingCharIdx !== null) {
    // t goes from 0 (just started) to 1 (finished)
    const t = Math.min((ts - slideStartTime) / SLIDE_DURATION, 1);

    // ease makes it start fast and slow down at the end (ease-out cubic)
    const ease = 1 - Math.pow(1 - t, 3);

    // Outgoing character: slides away and fades out
    const offsetOut = -slideDirection * ease * 180; // moves in the direction of the slide
    const alphaOut = 1 - ease; // fades from 1 → 0

    // Incoming character: slides in from the side and fades in
    const offsetIn = slideDirection * (1 - ease) * 180; // starts offscreen, moves to centre
    const alphaIn = ease; // fades from 0 → 1

    // Draw outgoing character + name
    drawCharacter(CHARACTERS[currentCharIdx], offsetOut, alphaOut);

    // Draw incoming character + name
    drawCharacter(CHARACTERS[incomingCharIdx], offsetIn, alphaIn);

    // Once the animation is done (t reached 1), clean everything up
    if (t >= 1) {
      currentCharIdx = incomingCharIdx;
      incomingCharIdx = null;
      isSliding = false;

      // Update sprite dimensions for the new character
      const newCh = CHARACTERS[currentCharIdx];
      FRAME_W = newCh.img.naturalWidth / newCh.totalFrames;
      FRAME_H = newCh.img.naturalHeight;

      updateArrowVisibility(); // show/hide arrows based on new position
      setArrowsInteractive(true); // re-enable the arrow buttons
    }
  } else {
    // No slide happening — draw the current character + name normally
    drawCharacter(ch, 0, 1);
  }
}

// -- Start the game loop --
// Runs forever using requestAnimationFrame (synced to screen refresh)
function startLoop(mainCtx, fxCtx, bgImg) {
  function loop(ts) {
    drawScene(mainCtx, bgImg, ts); // draw background + character

    if (Math.random() < 0.35) spawnEmber(); // randomly spawn a fire ember
    tickParticles(); // move all particles
    drawParticles(fxCtx); // draw all particles on the fx canvas

    requestAnimationFrame(loop); // schedule the next frame
  }

  requestAnimationFrame(loop); // kick it off
}
