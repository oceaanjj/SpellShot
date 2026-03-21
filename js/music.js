// =============================================
//  music.js
//  Handles background music.
//
//  - Plays sounds/background.mp3 automatically on page load
//  - Volume is controlled by the Music slider in settings.js
//  - Restarts fresh on each page (index.html and game.html)
//
//  Load order in HTML (settings.js MUST come first):
//    <script src="js/settings.js"></script>
//    <script src="js/music.js"></script>
// =============================================


const musicAudio = new Audio('sounds/tentative.mp3');
musicAudio.loop   = true;
musicAudio.volume = getMusicVolume(); // reads from settings.js


// ── Start music ────────────────────────────────────────────────────────────
// Browsers block autoplay until the user interacts with the page.
// We try immediately, and if it's blocked we wait for the first click/tap.

function startMusic() {
  musicAudio.play().catch(() => {
    // Autoplay was blocked — wait for first user interaction then try again
    function onFirstInteraction() {
      musicAudio.play().catch(() => {}); // silently ignore if still blocked
      document.removeEventListener('click',     onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('keydown',    onFirstInteraction);
    }
    document.addEventListener('click',     onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);
    document.addEventListener('keydown',    onFirstInteraction);
  });
}

startMusic();


// ── Volume control ─────────────────────────────────────────────────────────
// Called by settings.js whenever the Music slider moves
function updateMusicVolume() {
  musicAudio.volume = getMusicVolume();
}


// ── Mute / Unmute (optional — call these anywhere if you need them) ────────
function muteMusic()   { musicAudio.muted = true;  }
function unmuteMusic() { musicAudio.muted = false; }