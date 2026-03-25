// =============================================
//  tutorial.js  — Interactive text-based tutorial system
//
//  Step flow:
//    1. Welcome (info) → click to continue (game paused)
//    2. Aim cannon (action) → wait for mouse move (game paused)
//    3. Fire spell (action) → wait for first fire (game unpaused)
//    4. Target word (info) → click to continue (game paused)
//    5. Ball bouncing (info) → click to continue (game paused)
//    6. Hit 3 letters (action) → wait for 3 fires (game unpaused)
//    7. Bonus hearts (info) → click to continue (game paused)
//    8. Shop & skins (info) → click to continue (game paused)
//    9. Avoid wrong letters (info) → click to continue (game paused)
//   10. Limited resources (info) → click to continue (game paused)
//   11. You're ready (info) → wait until word complete (game unpaused)
//
//  Hooks called by tutorial.html:
//    tutorialOnCorrectHit()   — call when correct letter is hit
//    tutorialOnBallHit()      — call when ball hits a block
//    tutorialOnWrongHit()     — call when wrong letter is hit
//    tutorialOnWordComplete() — call when word is completed
// =============================================

(function () {

  // ── State ─────────────────────────────────────────────────────────────
  let currentStep = 0;
  let previousStep = null;  // Track step to return to after wrong letter warning
  let stepTimer = null;
  let fireCount = 0;
  let correctHitCount = 0;
  let tutDone = false;
  let wrongLetterPromptShown = false;
  let showingWrongLetterWarning = false;  // Flag to prevent re-triggering

  // One-shot listener guards
  let listeningForMouseMove = false;
  let listeningForFirstBallHit = false;
  let listeningForThreeFires = false;

  // Compact panel position configuration (can be customized)
  let compactPanelConfig = {
    top: '300px',
    right: '600px'
  };

  // Tutorial steps definition
  const steps = [
    {
      id: 1,
      type: 'info',
      title: 'WELCOME TO SPELL SHOT!',
      text: 'Spell words to earn coins while getting familiar with computer terms. Let\'s learn how!',
      requiresClick: true,
      pauseGame: true
    },
    {
      id: 2,
      type: 'action-mouse',
      title: 'AIM YOUR CANNON',
      text: 'Move your mouse to aim the cannon at the letter blocks.',
      requiresClick: false,
      pauseGame: true
    },
    {
      id: 3,
      type: 'action-ball-hit',
      title: 'RELEASE YOUR FIRST CANNON',
      text: 'Press SPACE or click to fire at the blocks.',
      requiresClick: false,
      pauseGame: false
    },
    {
      id: 4,
      type: 'info',
      title: 'TARGET WORD',
      text: 'Spell the target word by hitting its letters in order.',
      requiresClick: true,
      pauseGame: true
    },
    {
      id: 5,
      type: 'info',
      title: 'BALL BOUNCING',
      text: 'Your spells bounce off walls twice before disappearing. Use this to reach blocks!',
      requiresClick: true,
      pauseGame: true
    },
    {
      id: 6,
      type: 'action-fire-count',
      fireTarget: 3,
      title: 'HIT 3 LETTERS',
      text: 'Fire and hit 3 letters from the target word to complete it.',
      requiresClick: false,
      pauseGame: false
    },
    {
      id: 7,
      type: 'info',
      title: 'BONUS HEARTS',
      text: 'Sometimes random hearts appear! Hit them for bonus lives to stay in the game.',
      requiresClick: true,
      pauseGame: true
    },
    {
      id: 8,
      type: 'info',
      title: 'SHOP & SKINS',
      text: 'Spend your coins at the shop to buy cool cannon ball skins and upgrades!',
      requiresClick: true,
      pauseGame: true
    },
    {
      id: 9,
      type: 'info',
      title: 'AVOID WRONG LETTERS',
      text: 'Hit a wrong letter and you lose a life. Stay focused!',
      requiresClick: true,
      pauseGame: true,
      skipable: true  // Can skip if wrong letter not hit yet
    },
    {
      id: 10,
      type: 'info',
      title: 'LIMITED RESOURCES',
      text: 'You have limited ammo and time. Running out of either ends the game!',
      requiresClick: true,
      pauseGame: true
    },
    {
      id: 11,
      type: 'info',
      title: 'YOU\'RE READY!',
      text: 'Now complete the word to finish the tutorial.',
      requiresClick: true,
      pauseGame: true
    }
  ];

  // ── Inject CSS ─────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #tutorialOverlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    #tutorialOverlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    #tutorialOverlay.compact {
      background: transparent;
      opacity: 1;
      pointer-events: none;
      position: absolute;
      inset: auto;
      top: 10px;
      right: 30px;
      width: auto;
      height: auto;
      align-items: flex-start;
      justify-content: flex-end;
    }

    #tutorialPanel {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #7efc7f;
      border-radius: 8px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 0 20px rgba(126, 252, 127, 0.4), 0 0 40px rgba(0, 0, 0, 0.8);
      text-align: center;
      animation: panelEnter 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    #tutorialPanel.compact {
      max-width: 280px;
      width: 280px;
      padding: 16px;
      animation: panelCompact 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    @keyframes panelEnter {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes panelCompact {
      from {
        transform: translateX(100px) scale(1);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(0.85);
        opacity: 1;
      }
    }

    #tutorialTitle {
      font-family: "PixelFont", sans-serif;
      font-size: 24px;
      color: #7efc7f;
      text-shadow: 0 0 10px rgba(126, 252, 127, 0.6);
      margin: 0 0 15px 0;
      letter-spacing: 2px;
    }

    #tutorialPanel.compact #tutorialTitle {
      font-size: 16px;
      margin: 0 0 10px 0;
    }

    #tutorialText {
      font-family: "PixelFont", sans-serif;
      font-size: 14px;
      color: #e0e0e0;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }

    #tutorialPanel.compact #tutorialText {
      font-size: 12px;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }

    #tutorialHint {
      font-family: "PixelFont", sans-serif;
      font-size: 12px;
      color: #afd5ff;
      margin-bottom: 15px;
      font-weight: bold;
      letter-spacing: 1px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    #tutorialPanel.compact #tutorialHint {
      font-size: 11px;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }

    #tutorialButton {
      background: linear-gradient(135deg, #7efc7f 0%, #5fc766 100%);
      border: 2px solid #3d7f40;
      color: #000;
      font-family: "PixelFont", sans-serif;
      font-size: 12px;
      padding: 10px 30px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
      font-weight: bold;
      letter-spacing: 1px;
    }

    #tutorialButton:hover {
      transform: scale(1.05);
      filter: brightness(1.1);
      box-shadow: 0 0 15px rgba(126, 252, 127, 0.6);
    }

    #tutorialButton:active {
      transform: scale(0.95);
    }

    #tutorialButton.hidden {
      display: none;
    }

    /* ── Success overlay ── */
    #tutorialSuccess {
      position: absolute;
      inset: 0;
      z-index: 105;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.85);
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
      text-shadow: 0 0 18px rgba(126, 252, 127, 0.9), 2px 3px 0 rgba(0, 0, 0, 0.6);
      letter-spacing: 6px;
      margin-bottom: 36px;
      animation: successPop 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    @keyframes successPop {
      0% { transform: scale(0.6); opacity: 0; }
      70% { transform: scale(1.12); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    #tutorialReturnBtn {
      cursor: pointer;
      width: 260px;
      image-rendering: pixelated;
      filter: drop-shadow(2px 4px 0 rgba(0, 0, 0, 0.6));
      transition: transform 0.1s ease, filter 0.1s ease;
    }

    #tutorialReturnBtn:hover {
      transform: scale(1.08) translateY(-3px);
      filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 210, 60, 0.9));
    }

    #tutorialReturnBtn:active {
      transform: scale(0.93) translateY(3px);
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ────────────────────────────────────────────────────────
  const host = document.getElementById('gameShell') || document.body;

  // Create main overlay
  const overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';

  // Create panel
  const panel = document.createElement('div');
  panel.id = 'tutorialPanel';
  panel.innerHTML = `
    <div id="tutorialTitle"></div>
    <div id="tutorialText"></div>
    <div id="tutorialHint"></div>
    <button id="tutorialButton" type="button">Continue</button>
  `;
  overlay.appendChild(panel);
  host.appendChild(overlay);

  // Create success overlay
  const successOverlay = document.createElement('div');
  successOverlay.id = 'tutorialSuccess';
  successOverlay.innerHTML = `
    <div id="tutorialSuccessText">WELL DONE!</div>
    <img id="tutorialReturnBtn" src="assets/button/returnHomeButton.png" alt="Return Home" />
  `;
  host.appendChild(successOverlay);

  const continueButton = document.getElementById('tutorialButton');
  const returnBtn = document.getElementById('tutorialReturnBtn');

  continueButton.addEventListener('click', () => {
    // If on the wrong letter warning step and we have a previous step to return to
    if (currentStep === 8 && showingWrongLetterWarning && previousStep !== null) {
      showingWrongLetterWarning = false;
      showStep(previousStep);
    }
    // If on the last step ("You're Ready!"), just hide overlay and unpause for gameplay
    // Success will show when word is actually completed (via onWordCompleted() hook)
    else if (currentStep === steps.length - 1) {
      const tutOverlay = document.getElementById('tutorialOverlay');
      if (tutOverlay) tutOverlay.classList.remove('visible');
      // Unpause game to let player complete the word
      if (typeof gamePaused !== 'undefined') {
        gamePaused = false;
      }
    } else {
      advanceStep();
    }
  });
  returnBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ── Display a step ────────────────────────────────────────────────────
  function showStep(stepIndex) {
    if (tutDone || stepIndex < 0 || stepIndex >= steps.length) return;

    clearTimeout(stepTimer);
    
    // Only save previous step if not showing wrong letter warning
    if (!showingWrongLetterWarning) {
      previousStep = currentStep;
    }
    
    currentStep = stepIndex;
    fireCount = 0;
    correctHitCount = 0;

    // Clear all listener guards
    listeningForMouseMove = false;
    listeningForFirstBallHit = false;
    listeningForThreeFires = false;

    const step = steps[stepIndex];
    const title = document.getElementById('tutorialTitle');
    const text = document.getElementById('tutorialText');
    const hint = document.getElementById('tutorialHint');
    const btn = document.getElementById('tutorialButton');
    const tutOverlay = document.getElementById('tutorialOverlay');
    const panel = document.getElementById('tutorialPanel');

    title.textContent = step.title;
    text.textContent = step.text;

    // Set hint text based on step type
    if (step.requiresClick) {
      hint.textContent = 'Click button to continue';
    } else if (step.type === 'action-mouse') {
      hint.textContent = 'Fire a cannon to continue';
    } else if (step.type === 'action-fire') {
      hint.textContent = 'Move your mouse to continue';
    } else if (step.type === 'action-fire-count') {
      hint.textContent = 'Fire 3 times to continue';
    }

    // Show or hide button based on step type
    if (step.requiresClick) {
      btn.textContent = 'Continue';
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }

    // Pause or unpause game
    if (step.pauseGame && typeof gamePaused !== 'undefined') {
      gamePaused = true;
    }

    // Set layout: centered for info steps, compact/sidebar for action steps
    const isActionStep = !step.requiresClick;
    if (isActionStep) {
      // Action step: move to sidebar, hide dark overlay
      tutOverlay.classList.add('compact');
      panel.classList.add('compact');
    } else {
      // Info step: centered, show dark overlay
      tutOverlay.classList.remove('compact');
      panel.classList.remove('compact');
    }

    // Show the overlay
    tutOverlay.classList.add('visible');

    // Setup trigger for this step
    setupStepTrigger(stepIndex);
  }

  // ── Advance to next step ──────────────────────────────────────────────
  function advanceStep() {
    if (tutDone) return;
    
    let nextStepIndex = currentStep + 1;
    
    // Skip the "Avoid Wrong Letters" step (index 8) if it was already shown
    // This prevents showing it twice if player hit a wrong letter earlier
    if (nextStepIndex === 8 && wrongLetterPromptShown) {
      nextStepIndex = 9;  // Jump to Limited Resources step instead
    }
    
    // Unpause game before advancing (unless next step also pauses)
    if (typeof gamePaused !== 'undefined') {
      const nextStep = nextStepIndex < steps.length ? steps[nextStepIndex] : null;
      if (!nextStep || !nextStep.pauseGame) {
        gamePaused = false;
      }
    }
    
    showStep(nextStepIndex);
  }

  // ── Setup trigger logic per step ──────────────────────────────────────
  function setupStepTrigger(stepIndex) {
    const step = steps[stepIndex];

    switch (step.type) {
      case 'info':
        // Info steps require click — button click handled by continueButton listener
        break;

      case 'action-mouse':
        if (!listeningForMouseMove) {
          listeningForMouseMove = true;
          const onMove = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            if (currentStep === stepIndex) {
              advanceStep();
            }
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('touchmove', onMove, { passive: true });
        }
        break;

      case 'action-ball-hit':
        if (!listeningForFirstBallHit) {
          listeningForFirstBallHit = true;
        }
        break;

      case 'action-fire':
        if (!listeningForFirstFire) {
          listeningForFirstFire = true;
        }
        break;

      case 'action-fire-count':
        if (!listeningForThreeFires) {
          listeningForThreeFires = true;
          fireCount = 0;
        }
        break;

      default:
        break;
    }
  }

  // ── Public hooks — called by tutorial.html ────────────────────────────

  // Call this every time the cannon fires
  window.tutorialOnFire = function () {
    if (tutDone) return;

    // Step 2 (old step 3): first fire — but don't advance yet, wait for ball hit
    // This hook is kept for compatibility but ball hit is tracked separately
  };

  // Call when cannon ball hits ANY block
  window.tutorialOnBallHit = function () {
    if (tutDone) return;

    // Step 3: first ball hit (after firing)
    if (currentStep === 2 && listeningForFirstBallHit) {
      listeningForFirstBallHit = false;
      advanceStep();
      return;
    }
  };

  // Call when a CORRECT letter is hit (advances word progress)
  window.tutorialOnCorrectHit = function () {
    if (tutDone) return;

    // Step 6 (index 5): count 3 correct hits to complete the word
    if (currentStep === 5 && listeningForThreeFires) {
      correctHitCount++;
      const countHint = document.getElementById('tutorialHint');
      if (countHint) {
        const remaining = 3 - correctHitCount;
        countHint.textContent = remaining > 0 ? `Hit ${remaining} more letter${remaining === 1 ? '' : 's'}` : 'Word complete!';
      }
      if (correctHitCount >= 3) {
        listeningForThreeFires = false;
        advanceStep();
      }
    }
  };

  // Call this when a wrong letter is hit (first time only)
  window.tutorialOnWrongHit = function () {
    if (tutDone) return;

    // Only show wrong letter warning if we're NOT currently in the middle of hitting letters (step 6)
    // Step 6 is index 5
    if (!wrongLetterPromptShown && !showingWrongLetterWarning && currentStep !== 5) {
      wrongLetterPromptShown = true;
      showingWrongLetterWarning = true;
      // Show wrong letter warning step (step 9 = array index 8)
      // Save the current step so we can return to it after the warning
      const stepBeforeWarning = currentStep;
      showStep(8);
      // After showing, restore reference to return to
      previousStep = stepBeforeWarning;
    }
  };

  // Call this when the word is completed
  window.tutorialOnWordComplete = function () {
    if (tutDone) return;
    // Check if we're at the final step waiting for word completion
    if (currentStep === steps.length - 1) {
      // Give user time to see the result, then auto-hide and show success
      setTimeout(() => {
        const tutOverlay = document.getElementById('tutorialOverlay');
        if (tutOverlay) {
          tutOverlay.classList.remove('visible');
        }
        setTimeout(showTutorialSuccess, 300);
      }, 500);  // Wait 500ms before hiding to let user see completion
    }
  };

  // ── Success screen ────────────────────────────────────────────────────
  function showTutorialSuccess() {
    if (tutDone) return;
    tutDone = true;
    clearTimeout(stepTimer);

    // Hide tutorial overlay
    const tutOverlay = document.getElementById('tutorialOverlay');
    if (tutOverlay) tutOverlay.classList.remove('visible');

    // Pause game and show success
    if (typeof gamePaused !== 'undefined') gamePaused = true;
    if (typeof gameOver !== 'undefined') gameOver = false;
    const mapOverlay = document.getElementById('mapOverlay');
    if (mapOverlay) mapOverlay.style.display = 'none';

    const successOverlay = document.getElementById('tutorialSuccess');
    if (successOverlay) {
      requestAnimationFrame(() => successOverlay.classList.add('visible'));
    }
  }

  // ── Start on load ────────────────────────────────────────────────────
  window.startTutorialSlides = function () {
    setTimeout(() => showStep(0), 200);
  };

  // Export success function for use by tutorial.html
  window.showTutorialSuccess = showTutorialSuccess;

  // ── Configuration ─────────────────────────────────────────────────────
  // Allow customization of compact panel position
  window.setTutorialCompactPosition = function (top, right) {
    compactPanelConfig.top = top;
    compactPanelConfig.right = right;
    // Update CSS variable if needed
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay && overlay.classList.contains('compact')) {
      overlay.style.top = top;
      overlay.style.right = right;
    }
  };

})();