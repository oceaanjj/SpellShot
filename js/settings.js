// =============================================
//  settings.js
//  Handles the Settings modal window.
//
//  Assets used:
//    assets/settingsBg.png      ← stone panel background
//    assets/closeButton.png     ← the X button (top-right of panel)
//    assets/onButton.png        ← aim guide ON state
//    assets/offButton.png       ← aim guide OFF state
//    assets/slider.png          ← horizontal slider track
//    assets/sliderButton.png    ← draggable knob
// =============================================


// ── State
let musicVolume = parseFloat(localStorage.getItem('musicVolume') ?? '0.7'); 
let sfxVolume = parseFloat(localStorage.getItem('sfxVolume') ?? '0.5');  
let aimGuideOn = localStorage.getItem('aimGuide') !== 'false'; 


let settingsModal = null;


function buildSettingsModal() {

  // dark backdrop (covers whole screen, sits behind panel)
  const backdrop = document.createElement('div');
  backdrop.id = 'settingsBackdrop';
  Object.assign(backdrop.style, {
    position:       'absolute',
    inset:          '0',
    background:     'rgba(0,0,0,0.55)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         '100',
    opacity:        '0',
    transition:     'opacity 0.25s ease',
  });


  // panel element (holds all the content, sits on top of backdrop)
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position:    'relative',
    width:       '560px',    // ← CHANGE THIS to resize the whole panel
    aspectRatio: '4 / 2.8', // ← keep this ratio to match your background image
    userSelect:  'none',
  });


  // ── Background image
  const bg = document.createElement('img');
  bg.src = 'assets/settingsBg.png';
  Object.assign(bg.style, {
    position: 'absolute',
    inset:    '0',
    width:    '100%',
    height:   '100%',
    display:  'block',
  });
  panel.appendChild(bg);


  // close button (top-right corner)
  const closeBtn = document.createElement('img');
  closeBtn.src = 'assets/button/closeButton.png'; // ← your X button asset

  Object.assign(closeBtn.style, {
    position:    'absolute',
    top:         '-4%',   
    right:       '-4%',   
    width:       '13%',   
    aspectRatio: '1',
    cursor:      'pointer',
    zIndex:      '10',
    transition:  'transform 0.1s ease',
  });

  closeBtn.addEventListener('click', () => {
    playClickSfx(); // ← add this
    closeSettings();
  });

  // Small press-down animation on click
  closeBtn.addEventListener('mousedown', () => {
    closeBtn.style.transform = 'scale(0.9)';
  });
  document.addEventListener('mouseup', () => {
    closeBtn.style.transform = 'scale(1)';
  });

  panel.appendChild(closeBtn);


  // sliders and toggle button
  function makeSlider(topPct, leftPct, widthPct, initVal, onChange) {


    // ── Visual sizes of the slider images ─────────────────────────────
    const TRACK_HEIGHT = '38px'; 
    const KNOB_WIDTH   = '32px'; 
    const YELLOW_FILL  = 'rgba(255, 185, 0, 0.82)'; 

    const row = document.createElement('div');
    Object.assign(row.style, {
      position:  'absolute',
      top:       topPct,    
      left:      leftPct,   
      width:     widthPct, 
      height:    TRACK_HEIGHT,
      transform: 'translateY(-50%)',
    });

    // Yellow fill bar (sits behind the track image, grows as knob moves right)
    const fill = document.createElement('div');
    Object.assign(fill.style, {
      position:      'absolute',
      top:           '15%',
      left:          '3%',
      height:        '70%',
      width:         '0%',
      background:    YELLOW_FILL,
      borderRadius:  '4px',
      pointerEvents: 'none',
      zIndex:        '1',
    });

    // Slider track image (transparent middle lets yellow show through)
    const track = document.createElement('img');
    track.src = 'assets/button/slider.png';
    Object.assign(track.style, {
      position: 'absolute',
      inset:    '0',
      width:    '100%',
      height:   '100%',
      zIndex:   '2',
      display:  'block',
    });

    // Draggable knob image
    const knob = document.createElement('img');
    knob.src = 'assets/button/sliderButton.png';
    Object.assign(knob.style, {
      position:    'absolute',
      top:         '50%',
      width:       KNOB_WIDTH,
      aspectRatio: '1',
      transform:   'translate(-50%, -50%)',
      cursor:      'grab',
      zIndex:      '10',
    });

    row.appendChild(fill);
    row.appendChild(track);
    row.appendChild(knob);

   
    const LEFT_LIMIT  = 6;   
    const RIGHT_LIMIT = 95; 

  // ── Drag logic 
  function setKnobValue(val) {
  const clamped    = Math.max(0, Math.min(1, val));
  const pct        = LEFT_LIMIT + clamped * (RIGHT_LIMIT - LEFT_LIMIT);
  knob.style.left  = pct + '%';
  fill.style.width = pct + '%';
  onChange(clamped);
    }

    setKnobValue(initVal); // apply the starting position

    let dragging = false;

    knob.addEventListener('mousedown', e => {
      playClickSfx();
      dragging = true;
      knob.style.cursor = 'grabbing';
      e.preventDefault();
    });
    knob.addEventListener('touchstart', e => {
      dragging = true;
      e.preventDefault();
    }, { passive: false });

    function onMove(clientX) {
      if (!dragging) return;
      const rect        = track.getBoundingClientRect();
      const rawFraction = (clientX - rect.left) / rect.width;
      setKnobValue(rawFraction);
    }

    document.addEventListener('mousemove', e => onMove(e.clientX));
    document.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: false });

    function stopDrag() {
      if (!dragging) return;
      dragging          = false;
      knob.style.cursor = 'grab';
    }
    document.addEventListener('mouseup',  stopDrag);
    document.addEventListener('touchend', stopDrag);

    // Click anywhere on the track to jump knob there instantly
    track.addEventListener('click', e => {
      const rect = track.getBoundingClientRect();
      setKnobValue((e.clientX - rect.left) / rect.width);
    });

    return row;
  }


  // sliders positioning

  //                         top      left    width   start  callback
    const musicSlider = makeSlider('38%', '15%', '72%', musicVolume, v => {
            musicVolume = v;
            localStorage.setItem('musicVolume', v);
            if (typeof updateMusicVolume === 'function') updateMusicVolume(); // ← add this
    });


  const sfxSlider   = makeSlider('63%', '15%',  '72%',  sfxVolume,   v => { 
    sfxVolume   = v; 
    localStorage.setItem('sfxVolume', v);
  });

  panel.appendChild(musicSlider);
  panel.appendChild(sfxSlider);


  // Aim guide button (ON/OFF toggle)
  const toggleBtn = document.createElement('img');
  toggleBtn.src = aimGuideOn ? 'assets/button/offButton.png' : 'assets/button/onButton.png';

  Object.assign(toggleBtn.style, {
    position:   'absolute',
    bottom:     '20%', 
    right:      '17%',   
    width:      '22%',
    cursor:     'pointer',
    zIndex:     '5',
    transition: 'transform 0.1s ease',
  });

  toggleBtn.addEventListener('click', () => {
    playClickSfx();
    aimGuideOn    = !aimGuideOn;
    toggleBtn.src = aimGuideOn ? 'assets/button/offButton.png' : 'assets/button/onButton.png';
    localStorage.setItem('aimGuide', aimGuideOn);


    toggleBtn.style.transform = 'scale(0.93)';
    setTimeout(() => { toggleBtn.style.transform = 'scale(1)'; }, 120);
  });

  panel.appendChild(toggleBtn);


  // ── Assemble and attach ────────────────────────────────────────────────
  backdrop.appendChild(panel);

  // Click the dark backdrop (outside the panel) to close
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeSettings();
  });

  settingsModal = backdrop;
  (document.getElementById('container') || document.getElementById('gameShell')).appendChild(settingsModal);
}


// ── Open / Close 

function openSettings() {
  if (!settingsModal) buildSettingsModal();
  settingsModal.style.display = 'flex';
  void settingsModal.offsetWidth; // force reflow so fade-in transition fires
  settingsModal.style.opacity = '1';
}

function closeSettings() {
  if (!settingsModal) return;
  settingsModal.style.opacity = '0';
  setTimeout(() => {
    if (settingsModal) settingsModal.style.display = 'none';
  }, 250);
}

function getMusicVolume() { return musicVolume; }
function getSfxVolume()   { return sfxVolume;   }
function getAimGuide()    { return aimGuideOn;  }