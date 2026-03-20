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


// ── State ──────────────────────────────────────────────────────────────────
let musicVolume = 0.7;   // 0.0 → 1.0  (70% filled by default, matches mockup)
let sfxVolume   = 0.0;   // 0.0 → 1.0  (0% filled by default, matches mockup)
let aimGuideOn  = true;  // true = ON button shown


// ── Modal element (built once, reused) ────────────────────────────────────
let settingsModal = null;


function buildSettingsModal() {

  // ╔══════════════════════════════════════════════════════╗
  // ║              BACKDROP (dark background)              ║
  // ╚══════════════════════════════════════════════════════╝
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


  // ╔══════════════════════════════════════════════════════╗
  // ║                  PANEL (stone box)                   ║
  // ║  ↓ Change width here to resize the whole modal       ║
  // ╚══════════════════════════════════════════════════════╝
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position:    'relative',
    width:       '560px',    // ← CHANGE THIS to resize the whole panel
    aspectRatio: '4 / 2.8', // ← keep this ratio to match your background image
    userSelect:  'none',
  });


  // ── Background image ───────────────────────────────────────────────────
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


  // ╔══════════════════════════════════════════════════════╗
  // ║                  CLOSE (X) BUTTON                    ║
  // ║                                                      ║
  // ║  top   → move UP (smaller %) or DOWN (bigger %)      ║
  // ║  right → move LEFT (bigger %) or RIGHT (smaller %)   ║
  // ║  width → resize the button (% of panel width)        ║
  // ║                                                      ║
  // ║  Negative values push it outside the panel edge.     ║
  // ╚══════════════════════════════════════════════════════╝
  const closeBtn = document.createElement('img');
  closeBtn.src = 'assets/closeButton.png'; // ← your X button asset

  Object.assign(closeBtn.style, {
    position:    'absolute',
    top:         '-4%',   // ← ADJUST: move the X button up/down
    right:       '-4%',   // ← ADJUST: move the X button left/right
    width:       '13%',   // ← ADJUST: resize the X button
    aspectRatio: '1',
    cursor:      'pointer',
    zIndex:      '10',
    transition:  'transform 0.1s ease',
  });

  closeBtn.addEventListener('click', closeSettings);

  // Small press-down animation on click
  closeBtn.addEventListener('mousedown', () => {
    closeBtn.style.transform = 'scale(0.9)';
  });
  document.addEventListener('mouseup', () => {
    closeBtn.style.transform = 'scale(1)';
  });

  panel.appendChild(closeBtn);


  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║                         SLIDER FACTORY                              ║
  // ║                                                                      ║
  // ║  makeSlider( topPct, leftPct, widthPct, initVal, onChange )          ║
  // ║                                                                      ║
  // ║  topPct   → vertical position (% of panel height)                   ║
  // ║             e.g. '38%' = 38% down from the top of the panel         ║
  // ║             → make this SMALLER to move slider UP                    ║
  // ║             → make this BIGGER  to move slider DOWN                  ║
  // ║                                                                      ║
  // ║  leftPct  → horizontal start of the slider (% of panel width)       ║
  // ║             e.g. '15%' = starts 15% from the left edge of the panel ║
  // ║             → make this SMALLER to push slider LEFT                  ║
  // ║             → make this BIGGER  to push slider RIGHT                 ║
  // ║                                                                      ║
  // ║  widthPct → how wide the slider track is (% of panel width)         ║
  // ║             e.g. '72%' = slider stretches 72% across the panel      ║
  // ║             → make this BIGGER  to stretch it wider                  ║
  // ║             → make this SMALLER to shrink it                         ║
  // ║                                                                      ║
  // ║  initVal  → starting knob position   0.0 = left,  1.0 = right       ║
  // ║                                                                      ║
  // ║  onChange → called while dragging:  (value) => { ... }              ║
  // ╚══════════════════════════════════════════════════════════════════════╝
  function makeSlider(topPct, leftPct, widthPct, initVal, onChange) {

    // ── Visual sizes of the slider images ─────────────────────────────
    const TRACK_HEIGHT = '38px'; // ← height of slider.png
    const KNOB_WIDTH   = '32px'; // ← width  of sliderButton.png
    const YELLOW_FILL  = 'rgba(255, 185, 0, 0.82)'; // ← fill colour

    const row = document.createElement('div');
    Object.assign(row.style, {
      position:  'absolute',
      top:       topPct,    // ← controlled by the argument
      left:      leftPct,   // ← controlled by the argument
      width:     widthPct,  // ← controlled by the argument
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
    track.src = 'assets/slider.png';
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
    knob.src = 'assets/sliderButton.png';
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

   
const LEFT_LIMIT  = 6;   // ← knob won't go past this % from the left
const RIGHT_LIMIT = 95;  // ← knob won't go past this % from the right
    // ── Drag logic ─────────────────────────────────────────────────────
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


  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║                  SLIDER POSITIONS — EDIT HERE                        ║
  // ║                                                                      ║
  // ║  makeSlider( topPct, leftPct, widthPct, initVal, onChange )          ║
  // ║                                                                      ║
  // ║  Step 1 → Adjust topPct  so the slider sits on the right ROW        ║
  // ║  Step 2 → Adjust leftPct so the left  edge lines up with the art    ║
  // ║  Step 3 → Adjust widthPct so the right edge lines up with the art   ║
  // ╚══════════════════════════════════════════════════════════════════════╝

  //                         top      left    width   start  callback
  const musicSlider = makeSlider('38%', '15%',  '72%',  musicVolume, v => { musicVolume = v; });
  const sfxSlider   = makeSlider('63%', '15%',  '72%',  sfxVolume,   v => { sfxVolume   = v; });

  panel.appendChild(musicSlider);
  panel.appendChild(sfxSlider);


  // ╔══════════════════════════════════════════════════════╗
  // ║               AIM GUIDE TOGGLE BUTTON                ║
  // ║                                                      ║
  // ║  bottom → move UP (bigger %) or DOWN (smaller %)     ║
  // ║  right  → move LEFT (bigger %) or RIGHT (smaller %)  ║
  // ║  width  → resize the button (% of panel width)       ║
  // ╚══════════════════════════════════════════════════════╝
  const toggleBtn = document.createElement('img');
  toggleBtn.src = aimGuideOn ? 'assets/onButton.png' : 'assets/offButton.png';

  Object.assign(toggleBtn.style, {
    position:   'absolute',
    bottom:     '20%',  // ← ADJUST: move toggle UP or DOWN
    right:      '17%',   // ← ADJUST: move toggle LEFT or RIGHT
    width:      '22%',  // ← ADJUST: resize the toggle
    cursor:     'pointer',
    zIndex:     '5',
    transition: 'transform 0.1s ease',
  });

  toggleBtn.addEventListener('click', () => {
    aimGuideOn    = !aimGuideOn;
    toggleBtn.src = aimGuideOn ? 'assets/onButton.png' : 'assets/offButton.png';

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
  document.getElementById('container').appendChild(settingsModal);
}


// ── Open / Close ───────────────────────────────────────────────────────────

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


// ── Getters (OPTIONAL — only needed if you add audio/aim-guide logic) ──────
// These let other files read the current slider values. For example:
//
//   audioNode.gain.value = getMusicVolume();   ← in your audio file
//   showAimDots = getAimGuide();               ← in your gameplay file
//
// If you never write audio code, you can ignore these completely.

function getMusicVolume() { return musicVolume; }
function getSfxVolume()   { return sfxVolume;   }
function getAimGuide()    { return aimGuideOn;  }