// =============================================
//  music.js
//  Handles background music.
//
//  - index.html   → sounds/tentative.mp3
//  - game.html    → sounds/mainGame.mp3
//  - tutorial.html → sounds/mainGame.mp3
// =============================================

const isGamePage = window.location.pathname.includes('game.html') 
                || window.location.pathname.includes('tutorial.html');

const musicAudio = new Audio(isGamePage ? 'sounds/mainGame.mp3' : 'sounds/tentative.mp3');
musicAudio.loop   = true;
musicAudio.volume = getMusicVolume();

window.bgMusic = musicAudio;

function startMusic() {
  musicAudio.play().catch(() => {
    function onFirstInteraction() {
      musicAudio.play().catch(() => {});
      document.removeEventListener('click',      onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('keydown',    onFirstInteraction);
    }
    document.addEventListener('click',      onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);
    document.addEventListener('keydown',    onFirstInteraction);
  });
}

startMusic();

function updateMusicVolume() {
  musicAudio.volume = getMusicVolume();
}

function muteMusic()   { musicAudio.muted = true;  }
function unmuteMusic() { musicAudio.muted = false; }