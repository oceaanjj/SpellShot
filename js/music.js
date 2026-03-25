// =============================================
//  music.js
//  Handles background music.
//
//  - index.html    → sounds/tentative.mp3
//  - level.html    → sounds/tentative.mp3  (continues from main menu)
//  - game.html     → sounds/mainGame.mp3
//  - tutorial.html → sounds/mainGame.mp3
// =============================================

const isGamePage =
  window.location.pathname.includes("game.html") ||
  window.location.pathname.includes("tutorial.html");

const musicAudio = new Audio(
  isGamePage ? "sounds/mainGame.mp3" : "sounds/tentative.mp3",
);
musicAudio.loop = true;
musicAudio.volume = getMusicVolume();

window.bgMusic = musicAudio;

// ── Seamless continuation between index ↔ level ──────────────────
// Restore saved position (only for tentative.mp3 pages)
if (!isGamePage) {
  const savedPos = sessionStorage.getItem("spellshot-music-pos");
  if (savedPos) {
    musicAudio.currentTime = parseFloat(savedPos) || 0;
    sessionStorage.removeItem("spellshot-music-pos");
  }
}

// Save position before leaving (only for tentative.mp3 pages)
if (!isGamePage) {
  window.addEventListener("beforeunload", () => {
    if (!musicAudio.paused) {
      sessionStorage.setItem(
        "spellshot-music-pos",
        String(musicAudio.currentTime),
      );
    }
  });
}
// ─────────────────────────────────────────────────────────────────

function startMusic() {
  musicAudio.play().catch(() => {
    function onFirstInteraction() {
      musicAudio.play().catch(() => {});
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
      document.removeEventListener("keydown", onFirstInteraction);
    }
    document.addEventListener("click", onFirstInteraction);
    document.addEventListener("touchstart", onFirstInteraction);
    document.addEventListener("keydown", onFirstInteraction);
  });
}

startMusic();

function updateMusicVolume() {
  musicAudio.volume = getMusicVolume();
}

function muteMusic() {
  musicAudio.muted = true;
}
function unmuteMusic() {
  musicAudio.muted = false;
}
