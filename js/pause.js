// =============================================
//  pause.js
//  Handles the pause menu in game.html
//  and tutorial.html.
//
//  Depends on: game variables gamePaused,
//  gameOver, isDragging, lastTimerTimestamp
//  being in the global scope of the page.
// =============================================

function addUIButtonPressEffects(el) {
  if (!el) return;
  const onPress = () => {
    el.classList.remove("released");
    el.classList.add("pressing");
  };
  const onRelease = () => {
    el.classList.remove("pressing");
    void el.offsetWidth;
    el.classList.add("released");
  };
  const onLeave = () => {
    el.classList.remove("pressing");
  };

  el.addEventListener("mousedown", onPress);
  el.addEventListener("mouseup", onRelease);
  el.addEventListener("mouseleave", onLeave);
  el.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      onPress();
    },
    { passive: false },
  );
  el.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      onRelease();
    },
    { passive: false },
  );
  el.addEventListener("touchcancel", onLeave);
}

function setPauseToggleEnabled(enabled) {
  const btn = document.getElementById("pauseToggle");
  if (!btn) return;
  btn.disabled = !enabled;
  btn.classList.toggle("disabled", !enabled);
}

function showPauseOverlay() {
  if (gameOver || gamePaused) return;
  gamePaused = true;
  isDragging = false;
  stopTickingSfx();
  if (typeof bgMusic !== "undefined") bgMusic.pause();
  document.getElementById("pauseOverlay")?.classList.add("active");
  document.getElementById("pauseBackdrop")?.classList.add("active");
  setPauseToggleEnabled(false);
}

function hidePauseOverlay() {
  const wasPaused = gamePaused;
  gamePaused = false;
  document.getElementById("pauseOverlay")?.classList.remove("active");
  document.getElementById("pauseBackdrop")?.classList.remove("active");
  if (wasPaused) {
    lastTimerTimestamp = null;
    if (typeof bgMusic !== "undefined") bgMusic.play().catch(() => {});
  }
  setPauseToggleEnabled(true);
}

function togglePauseMenu() {
  if (gamePaused) {
    hidePauseOverlay();
    return;
  }
  showPauseOverlay();
}

function goToHome() {
  if (typeof clearSavedGameState === "function") clearSavedGameState();
  document.body.style.transition = "opacity 0.35s ease";
  document.body.style.opacity = "0";
  setTimeout(() => {
    window.location.href = "index.html";
  }, 350);
}

function goToSettings() {
  openSettings();
}

function handlePauseAction(action) {
  switch (action) {
    case "resume":
      hidePauseOverlay();
      break;
    case "restart":
      hidePauseOverlay();
      if (typeof restartGame === "function") restartGame();
      break;
    case "setting":
      openSettings();
      break;
    case "home":
      if (typeof clearSavedGameState === "function") clearSavedGameState();
      document.body.style.transition = "opacity 0.35s ease";
      document.body.style.opacity = "0";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 350);
      break;
  }
}

// ── Wire up all pause buttons on DOM ready ────
function initPause() {
  const pauseToggleButton = document.getElementById("pauseToggle");
  const pauseOptionButtons = document.querySelectorAll(
    "#pausePanel [data-pause-action]",
  );
  const pauseBackdrop = document.getElementById("pauseBackdrop");

  if (pauseToggleButton) {
    addUIButtonPressEffects(pauseToggleButton);
    pauseToggleButton.addEventListener("click", (e) => {
      e.stopPropagation();
      playClickSfx();
      togglePauseMenu();
    });
  }

  pauseOptionButtons.forEach((btn) => {
    addUIButtonPressEffects(btn);
    btn.addEventListener("click", () => {
      playClickSfx();
      const action = btn.dataset.pauseAction;
      if (action) handlePauseAction(action);
    });
  });

  pauseBackdrop?.addEventListener("click", () => {
    playClickSfx();
    hidePauseOverlay();
  });

  hidePauseOverlay();
}
