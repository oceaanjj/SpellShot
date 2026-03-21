// =============================================
//  ui.js
//  Everything related to buttons and screen transitions.
//
//  setupBtn()  → makes a button interactive (press effect + particles)
//  goToGame()  → white flash then goes to game.html
//
//  To add a new button: just call setupBtn() in main.js.
//  No changes needed here.
// =============================================


// -- Get the centre point of a button --
// Returns { x, y } relative to the game container
// Used so particles know where to spawn when a button is clicked
function getCenter(el) {
  const container     = document.getElementById('container');
  const containerRect = container.getBoundingClientRect();
  const buttonRect    = el.getBoundingClientRect();

  return {
    x: buttonRect.left - containerRect.left + buttonRect.width  / 2,
    y: buttonRect.top  - containerRect.top  + buttonRect.height / 2,
  };
}


// -- Make a button interactive --
// id          → the HTML element id (e.g. 'btnPlay')
// burstColor  → colour of the dot burst when clicked (e.g. '#ffcc00')
// callback    → optional function to call after the click animation
function setupBtn(id, burstColor, callback) {
  const el = document.getElementById(id);
  if (!el) return; // stop if the button doesn't exist in the HTML

  // When the player presses down on the button
  const onPress = () => {
    el.classList.remove('released');
    el.classList.add('pressing');     // CSS handles the press-down look
  };

  // When the player releases the button
  const onRelease = () => {
    el.classList.remove('pressing');
    void el.offsetWidth;              // forces the browser to restart the CSS animation
    el.classList.add('released');     // CSS handles the bounce-back look

    // Spawn particles at the centre of the button
    const pos = getCenter(el);
    spawnClickBurst(pos.x, pos.y, burstColor);
    spawnSparkles(pos.x, pos.y);

    // Run the callback after the particle animation has a moment to play
    if (callback) setTimeout(callback, 230);
  };

  // If the mouse leaves the button without releasing, cancel the press look
  const onLeave = () => el.classList.remove('pressing');

  // -- Mouse events (desktop) --
  el.addEventListener('mousedown',  onPress);
  el.addEventListener('mouseup',    onRelease);
  el.addEventListener('mouseleave', onLeave);

  // -- Touch events (mobile) --
  el.addEventListener('touchstart',  (e) => { e.preventDefault(); onPress();   }, { passive: false });
  el.addEventListener('touchend',    (e) => { e.preventDefault(); onRelease(); }, { passive: false });
  el.addEventListener('touchcancel', onLeave);
}


// -- Go to the game screen --
// Flashes the screen white then loads game.html
function goToGame() {
  document.body.style.transition = 'opacity 0.35s ease';
  document.body.style.opacity    = '0';
  setTimeout(() => { window.location.href = 'game.html'; }, 350);
}