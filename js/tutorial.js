// =============================================
//  tutorial.js  — Interactive slide state machine
//
//  Slide flow:
//    1 → (auto)          → 2
//    2 → (mouse moves)   → 3
//    3 → (user fires)    → 8
//    8 → (auto)          → 5
//    5 → (3 fires)       → 6
//    6 → (wrong letter)  → 4
//    4 → (auto)          → 7
//    7 → (auto)          → 9  ← "Good Luck" stays until word complete
//
//  Hooks called by tutorial.html:
//    tutorialOnFire()       — call every time the cannon fires
//    tutorialOnWrongHit()   — call when wrong letter is hit
//
//  Assets:
//    assets/tutorial/slide1.png … slide9.png
//    assets/tutorial/returnHomeButton.png
// =============================================

(function () {

  // ── Config ────────────────────────────────────────────────────────────
  const AUTO_DELAY = 3000; // ms for auto-advance slides

  // ── State ─────────────────────────────────────────────────────────────
  let activeSlide   = null;  // currently shown slide number
  let slideTimer    = null;
  let fireCount     = 0;     // fires counted during slide 5
  let tutDone       = false;

  // One-shot listener guards
  let listeningForMouse  = false;
  let listeningForFire3  = false;
  let listeningForWrong  = false;

  // ── Inject CSS ─────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #tutorialSlideWrap {
      position: absolute;
      bottom: 20px;
      right: 24px;
      z-index: 50;
      pointer-events: none;
      width: 280px;  
    }

    #tutorialSlideImg {
      width: 100%;
      height: auto;
      display: block;
      image-rendering: pixelated;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.7));
    }

    @keyframes tutSlideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    @keyframes tutSlideDown {
      from { transform: translateY(0);    opacity: 1; }
      to   { transform: translateY(60px); opacity: 0; }
    }

    #tutorialSlideImg.entering {
      animation: tutSlideIn 0.45s cubic-bezier(0.22,0.61,0.36,1) forwards;
    }

    #tutorialSlideImg.exiting {
      animation: tutSlideDown 0.38s ease-in forwards;
    }

    /* ── Success overlay ── */
    #tutorialSuccess {
      position: absolute;
      inset: 0;
      z-index: 90;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.72);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    #tutorialSuccess.visible {
      opacity: 1;
      pointer-events: auto;
    }

    #tutorialSuccessText {
      font-family: "PixelFont", sans-serif;
      font-size: 64px;
      color: #7efc7f;
      text-shadow: 0 0 18px rgba(126,252,127,0.9), 2px 3px 0 rgba(0,0,0,0.6);
      letter-spacing: 6px;
      margin-bottom: 36px;
      animation: successPop 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
    }

    @keyframes successPop {
      0%   { transform: scale(0.6); opacity: 0; }
      70%  { transform: scale(1.12); opacity: 1; }
      100% { transform: scale(1);   opacity: 1; }
    }

    #tutorialReturnBtn {
      cursor: pointer;
      width: 260px;
      image-rendering: pixelated;
      filter: drop-shadow(2px 4px 0 rgba(0,0,0,0.6));
      transition: transform 0.1s ease, filter 0.1s ease;
    }

    #tutorialReturnBtn:hover {
      transform: scale(1.08) translateY(-3px);
      filter: brightness(1.2) drop-shadow(0 0 10px rgba(255,210,60,0.9));
    }

    #tutorialReturnBtn:active { transform: scale(0.93) translateY(3px); }
  `;
  document.head.appendChild(style);

  // ── Build DOM ────────────────────────────────────────────────────────
  const host = document.getElementById('gameShell') || document.body;

  const slideWrap = document.createElement('div');
  slideWrap.id = 'tutorialSlideWrap';

  const slideImg = document.createElement('img');
  slideImg.id  = 'tutorialSlideImg';
  slideImg.alt = 'Tutorial';
  slideWrap.appendChild(slideImg);
  host.appendChild(slideWrap);

  const successOverlay = document.createElement('div');
  successOverlay.id = 'tutorialSuccess';
  successOverlay.innerHTML = `
    <div id="tutorialSuccessText">WELL DONE!</div>
    <img id="tutorialReturnBtn" src="assets/button/returnHomeButton.png" alt="Return Home" />
  `;
  host.appendChild(successOverlay);

  document.getElementById('tutorialReturnBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ── Core: show a slide ────────────────────────────────────────────────
  function showSlide(index) {
    if (tutDone) return;
    clearTimeout(slideTimer);

    activeSlide = index;
    fireCount   = 0; // reset fire counter whenever we change slides

    // Clear all listener guards — each slide sets up its own
    listeningForMouse = false;
    listeningForFire3 = false;
    listeningForWrong = false;

    const wrap = document.getElementById('tutorialSlideWrap');
    const img  = document.getElementById('tutorialSlideImg');
    if (!wrap || !img) return;

    wrap.style.display = '';
    img.classList.remove('entering', 'exiting');
    void img.offsetWidth;
    img.src = `assets/tutorial/slide${index}.png`;
    img.classList.add('entering');

    // Set up the trigger for this slide
    setupTrigger(index);
  }

  // ── Transition: exit current → show next ─────────────────────────────
  function goToSlide(next) {
    if (tutDone) return;
    clearTimeout(slideTimer);

    const img = document.getElementById('tutorialSlideImg');
    if (!img) { showSlide(next); return; }

    img.classList.remove('entering');
    void img.offsetWidth;
    img.classList.add('exiting');

    setTimeout(() => showSlide(next), 400);
  }

  // ── Trigger logic per slide ──────────────────────────────────────────
  function setupTrigger(index) {
    switch (index) {

      // Slide 1 — auto → slide 2
      case 1:
        slideTimer = setTimeout(() => goToSlide(2), AUTO_DELAY);
        break;

      // Slide 2 — wait for mouse move → slide 3
      case 2:
        if (!listeningForMouse) {
          listeningForMouse = true;
          const onMove = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            if (activeSlide === 2) goToSlide(3);
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('touchmove', onMove, { passive: true });
        }
        break;

      // Slide 3 — wait for one fire → slide 8
      case 3:
        listeningForFire3 = false; // not listening for 3-fire count yet
        // handled by tutorialOnFire() below
        break;

      // Slide 8 — auto → slide 5
      case 8:
        slideTimer = setTimeout(() => goToSlide(5), AUTO_DELAY);
        break;

      // Slide 5 — wait for 3 fires → slide 6
      case 5:
        listeningForFire3 = true;
        fireCount = 0;
        break;

      // Slide 6 — wait for wrong letter hit → slide 4
      case 6:
        listeningForWrong = true;
        break;

      // Slide 4 — auto → slide 7
      case 4:
        slideTimer = setTimeout(() => goToSlide(7), AUTO_DELAY);
        break;

      // Slide 7 — auto → slide 9
      case 7:
        slideTimer = setTimeout(() => goToSlide(9), AUTO_DELAY);
        break;

      // Slide 9 — "Good Luck" — stays until word is complete
      case 9:
        // nothing — word completion calls showTutorialSuccess()
        break;

      default:
        break;
    }
  }


  // ── Public hooks — called by tutorial.html ────────────────────────────

  // Call this every time the cannon fires
  window.tutorialOnFire = function () {
    if (tutDone) return;

    // Slide 3: first fire → jump to slide 8
    if (activeSlide === 3) {
      goToSlide(8);
      return;
    }

    // Slide 5: count 3 fires → slide 6
    if (activeSlide === 5 && listeningForFire3) {
      fireCount++;
      if (fireCount >= 3) {
        listeningForFire3 = false;
        goToSlide(6);
      }
    }
  };

  // Call this when a wrong letter is hit
  window.tutorialOnWrongHit = function () {
    if (tutDone) return;
    if (activeSlide === 6 && listeningForWrong) {
      listeningForWrong = false;
      goToSlide(4);
    }
  };

  // ── Success screen — called by tutorial.html's onWordCompleted ────────
  window.showTutorialSuccess = function () {
  if (tutDone) return;
  tutDone = true;
  clearTimeout(slideTimer);

  // ── ADD THESE ─────────────────────────────────────
  if (typeof gamePaused !== 'undefined') gamePaused = true;  // freeze game loop
  if (typeof gameOver   !== 'undefined') gameOver   = false; // prevent game over draw
  const mapOverlay = document.getElementById('mapOverlay');
  if (mapOverlay) mapOverlay.style.display = 'none';         // hide timer
  // ──────────────────────────────────────────────────

  const wrap = document.getElementById('tutorialSlideWrap');
  if (wrap) wrap.style.display = 'none';

  const overlay = document.getElementById('tutorialSuccess');
  if (overlay) requestAnimationFrame(() => overlay.classList.add('visible'));
};

  // ── Start on load ────────────────────────────────────────────────────
//   window.addEventListener('load', () => {
//     setTimeout(() => showSlide(1), 200);
//   });

// Add this instead:
window.startTutorialSlides = function() {
  setTimeout(() => showSlide(1), 200);
};

})();