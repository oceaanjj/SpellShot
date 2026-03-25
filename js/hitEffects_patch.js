// ── Helper: draw a single heart shape centered at (0,0) ──────────────────────
function drawHeartPath(ctx, size) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 1.2, -s * 0.6, -s * 2.0, s * 0.6, 0, s * 1.6);
  ctx.bezierCurveTo(s * 2.0, s * 0.6, s * 1.2, -s * 0.6, 0, s * 0.3);
  ctx.closePath();
}

// ── Helper: draw a 6-point star centered at (0,0) ────────────────────────────
function drawStarPath(ctx, outerR, innerR, points) {
  const pts = points || 6;
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const angle = (Math.PI * i) / pts - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    i === 0
      ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
      : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
}

// ── Helper: draw a shard (thin elongated quad) centered at (0,0) ─────────────
function drawShardPath(ctx, len, width) {
  ctx.beginPath();
  ctx.moveTo(0, -len);
  ctx.lineTo(width * 0.5, 0);
  ctx.lineTo(0, len * 0.4);
  ctx.lineTo(-width * 0.5, 0);
  ctx.closePath();
}

// ─────────────────────────────────────────────────────────────────────────────
// spawnLetterHitParticles  (replaces the original)
// ─────────────────────────────────────────────────────────────────────────────
function spawnLetterHitParticles(x, y) {
  const fx = (window.BallSkins ? window.BallSkins.getHitEffect() : null) || {
    colors: ["#ffe06a"],
    count: 26,
    speedMin: 2,
    speedMax: 6,
    sizeMin: 2,
    sizeMax: 3,
    decay: 0.018,
    gravity: 0.08,
    drag: 0.95,
    shape: "circle",
    blendMode: "lighter",
    flashColor: "rgba(255,220,100,",
  };

  for (let i = 0; i < fx.count; i++) {
    const angle = (Math.PI * 2 * i) / fx.count + (Math.random() - 0.5) * 0.5;
    const speed = fx.speedMin + Math.random() * (fx.speedMax - fx.speedMin);
    const color = fx.colors[Math.floor(Math.random() * fx.colors.length)];
    const size = fx.sizeMin + Math.random() * (fx.sizeMax - fx.sizeMin);

    letterHitParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: fx.decay + Math.random() * 0.008,
      radius: size,
      color,
      shape: fx.shape,
      gravity: fx.gravity ?? 0.08,
      drag: fx.drag ?? 0.95,
      blendMode: fx.blendMode || "lighter",
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.25,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// drawLetterHitParticles  (replaces the original)
// ─────────────────────────────────────────────────────────────────────────────
function drawLetterHitParticles() {
  if (!letterHitParticles.length) return;

  ctx.save();

  letterHitParticles.forEach((p) => {
    const alpha = Math.max(0, p.life);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = p.blendMode || "lighter";

    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.rotation !== undefined) ctx.rotate(p.rotation);

    const r = Math.max(0.5, p.radius * p.life);

    switch (p.shape) {
      case "star":
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        drawStarPath(ctx, r * 1.8, r * 0.7, 6);
        ctx.fill();
        // thin cross-sparkle on top
        ctx.beginPath();
        ctx.moveTo(-r * 2.2, 0);
        ctx.lineTo(r * 2.2, 0);
        ctx.moveTo(0, -r * 2.2);
        ctx.lineTo(0, r * 2.2);
        ctx.globalAlpha = alpha * 0.5;
        ctx.stroke();
        break;

      case "shard":
        ctx.fillStyle = p.color;
        drawShardPath(ctx, r * 2.5, r * 0.8);
        ctx.fill();
        // glint line along shard axis
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -r * 2.5);
        ctx.lineTo(0, r * 1.0);
        ctx.stroke();
        break;

      case "ring":
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, r * 0.55);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "heart":
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.scale(r * 0.22, r * 0.22); // scale the unit heart
        drawHeartPath(ctx, 1);
        ctx.fill();
        ctx.restore();
        break;

      case "circle":
      default:
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        // cross-sparkle on every 4th particle for extra pop
        if (Math.round(p.radius) % 4 === 0) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          const cr = r * 1.8;
          ctx.beginPath();
          ctx.moveTo(-cr, 0);
          ctx.lineTo(cr, 0);
          ctx.moveTo(0, -cr);
          ctx.lineTo(0, cr);
          ctx.globalAlpha = alpha * 0.45;
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  });

  ctx.restore();
}

function drawLetterSuccessFlash() {
  if (successFlash.timer <= 0) return;

  const fx = (window.BallSkins ? window.BallSkins.getHitEffect() : null) || {};
  const flashBase = fx.flashColor || "rgba(255,255,255,";

  const progress = successFlash.timer / SUCCESS_FLASH_DURATION;
  const radius = 180 * (1 - progress);
  const alpha = 0.42 * progress;

  const grad = ctx.createRadialGradient(
    successFlash.x,
    successFlash.y,
    0,
    successFlash.x,
    successFlash.y,
    radius,
  );
  grad.addColorStop(0, `${flashBase}${alpha})`);
  grad.addColorStop(0.5, `${flashBase}${alpha * 0.5})`);
  grad.addColorStop(1, `${flashBase}0)`);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.fillRect(
    successFlash.x - radius,
    successFlash.y - radius,
    radius * 2,
    radius * 2,
  );
  ctx.restore();
}

function updateLetterHitEffects() {
  for (let i = letterHitParticles.length - 1; i >= 0; i--) {
    const p = letterHitParticles[i];
    p.vy += p.gravity ?? 0.08;
    p.vx *= p.drag ?? 0.95;
    p.vy *= p.drag ?? 0.95;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.rotation !== undefined) p.rotation += p.rotSpeed;
    if (p.life <= 0) letterHitParticles.splice(i, 1);
  }
  if (successFlash.timer > 0) successFlash.timer--;
}
