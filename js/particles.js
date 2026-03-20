// =============================================
//  particles.js
//  Three visual effects used in the game:
//
//  1. spawnClickBurst  → coloured dots that explode out when you click a button
//  2. spawnSparkles    → white star sparks that also appear on button click
//  3. spawnEmber       → small glowing fire bits floating up in the background
//
//  tickParticles()  → moves all particles every frame
//  drawParticles()  → draws all particles onto the fxCanvas
// =============================================


// -- Storage for active particles and embers --
const particles = [];  // button click effects
const embers    = [];  // background fire bits


// -- Burst of coloured dots from a point --
// Called when the player clicks a button
// x, y    → where the burst starts (centre of the button)
// color   → what colour the dots are
function spawnClickBurst(x, y, color) {
  const totalDots = 28;

  for (let i = 0; i < totalDots; i++) {
    // Spread dots evenly in a circle, with a tiny random wobble
    const angle = (Math.PI * 2 * i) / totalDots + (Math.random() - 0.5) * 0.4;
    const speed = 2.5 + Math.random() * 8;

    particles.push({
      x, y,
      vx:     Math.cos(angle) * speed,   // horizontal speed
      vy:     Math.sin(angle) * speed,   // vertical speed
      life:   1,                         // 1 = fully visible, 0 = gone
      decay:  0.020 + Math.random() * 0.022,  // how fast it fades out
      radius: 2.5   + Math.random() * 5.5,    // dot size
      color,
      star: false,  // this is a dot, not a star shape
    });
  }
}


// -- White star sparks that drift upward --
// Also called on button click, layered on top of the dot burst
function spawnSparkles(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;

    particles.push({
      x, y,
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed - 1.5,  // -1.5 makes them drift upward
      life:   1,
      decay:  0.018 + Math.random() * 0.012,
      radius: 4    + Math.random() * 4,
      color: '#ffffff',
      star: true,  // drawn as a cross/star shape instead of a dot
    });
  }
}


// -- One small glowing ember floating upward --
// Called randomly every frame to keep the background feeling alive
function spawnEmber() {
  embers.push({
    x:      55  + Math.random() * 480,   // random spot along the bottom area
    y:      270 + Math.random() * 20,
    vx:     (Math.random() - 0.5) * 1.4, // slight sideways drift
    vy:     -(0.8 + Math.random() * 2.5), // floats upward
    life:   1,
    decay:  0.008 + Math.random() * 0.012,
    radius: 2    + Math.random() * 5,
    hue:    18   + Math.random() * 32,   // warm orange/yellow colour range
  });
}


// -- Move all particles forward by one frame --
// Called every frame before drawing
function tickParticles() {
  // Update regular particles (dots + sparkles)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x    += p.vx;
    p.y    += p.vy;
    p.vy   += 0.20;   // gravity pulls them down
    p.vx   *= 0.965;  // slow down sideways over time
    p.life -= p.decay;

    // Remove it once it's fully faded
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update embers
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i];

    e.x    += e.vx + Math.sin(e.life * 8) * 0.3;  // gentle swaying side to side
    e.y    += e.vy;
    e.life -= e.decay;

    if (e.life <= 0) embers.splice(i, 1);
  }
}


// -- Draw all particles onto the effects canvas --
// fxCtx is the canvas context passed in from main
function drawParticles(fxCtx) {
  // Clear the whole canvas first so old frames don't leave trails
  fxCtx.clearRect(0, 0, GAME_W, GAME_H);

  // Draw embers (glowing orange fire dots)
  for (const e of embers) {
    fxCtx.save();
    fxCtx.globalAlpha = e.life * 0.75;                        // fade as it dies
    fxCtx.shadowColor = `hsl(${e.hue}, 100%, 60%)`;           // glow colour
    fxCtx.shadowBlur  = 12;
    fxCtx.fillStyle   = `hsl(${e.hue}, 100%, ${55 + e.life * 30}%)`;
    fxCtx.beginPath();
    fxCtx.arc(e.x, e.y, e.radius * e.life, 0, Math.PI * 2);  // shrinks as it fades
    fxCtx.fill();
    fxCtx.restore();
  }

  // Draw button particles (dots or star sparks)
  for (const p of particles) {
    fxCtx.save();
    fxCtx.globalAlpha = p.life;      // fade as it dies
    fxCtx.shadowColor = p.color;
    fxCtx.shadowBlur  = 9;

    if (p.star) {
      // Draw a cross (+) with diagonal lines to make a star shape
      const size = p.radius * p.life;
      const diag = size * 0.65;

      fxCtx.strokeStyle = p.color;
      fxCtx.lineWidth   = 2.2;
      fxCtx.lineCap     = 'round';
      fxCtx.beginPath();

      // Horizontal line
      fxCtx.moveTo(p.x - size, p.y);
      fxCtx.lineTo(p.x + size, p.y);

      // Vertical line
      fxCtx.moveTo(p.x, p.y - size);
      fxCtx.lineTo(p.x, p.y + size);

      // Diagonal lines
      fxCtx.moveTo(p.x - diag, p.y - diag);
      fxCtx.lineTo(p.x + diag, p.y + diag);
      fxCtx.moveTo(p.x + diag, p.y - diag);
      fxCtx.lineTo(p.x - diag, p.y + diag);

      fxCtx.stroke();
    } else {
      // Draw a simple filled circle
      fxCtx.fillStyle = p.color;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      fxCtx.fill();
    }

    fxCtx.restore();
  }
}