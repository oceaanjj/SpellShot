(function () {
  // ── SKIN DEFINITIONS ─────────────────────────────────────────────────────
  const SKINS = [
    {
      id:           'default',
      name:         'Default',
      price:        0,
      unlockedSlot: 'assets/cannon/unlocked/default.png',
      lockedSlot:   null,
      previewSrc:   'assets/cannon/themes/default.png',
      barrelSrc:    'assets/canon.png',
      wheelSrc:     'assets/wheel.png',
      description:  'A trusty iron cannon, weathered by countless battles. It may lack glamour, but it has never failed its wielder.',
    },
    {
      id:           'gold',
      name:         'Gold',
      price:        1500,
      unlockedSlot: 'assets/cannon/unlocked/gold.png',
      lockedSlot:   'assets/cannon/locked/gold.png',
      previewSrc:   'assets/cannon/themes/gold.png',
      barrelSrc:    'assets/cannon/cannon/gold.png',
      wheelSrc:     'assets/cannon/wheel/gold.png',
      description:  'Gilded in pure gold and adorned with royal crests. A symbol of power and prestige fit for a champion.',
    },
    {
      id:           'ice',
      name:         'Ice',
      price:        1500,
      unlockedSlot: 'assets/cannon/unlocked/ice.png',
      lockedSlot:   'assets/cannon/locked/ice.png',
      previewSrc:   'assets/cannon/themes/ice.png',
      barrelSrc:    'assets/cannon/cannon/ice.png',
      wheelSrc:     'assets/cannon/wheel/ice.png',
      description:  'Encased in eternal frost, this cannon was carved from a glacier at the edge of the world. Cold, precise, and unforgiving.',
    },
    {
      id:           'lava',
      name:         'Lava',
      price:        1500,
      unlockedSlot: 'assets/cannon/unlocked/lava.png',
      lockedSlot:   'assets/cannon/locked/lava.png',
      previewSrc:   'assets/cannon/themes/lava.png',
      barrelSrc:    'assets/cannon/cannon/lava.png',
      wheelSrc:     'assets/cannon/wheel/lava.png',
      description:  'Forged in the depths of a magma chamber, it pulses with molten fury. The ground trembles at the sound of its roar.',
    },
    {
      id:           'punk',
      name:         'Punk',
      price:        1500,
      unlockedSlot: 'assets/cannon/unlocked/punk.png',
      lockedSlot:   'assets/cannon/locked/punk.png',
      previewSrc:   'assets/cannon/themes/punk.png',
      barrelSrc:    'assets/cannon/cannon/punk.png',
      wheelSrc:     'assets/cannon/wheel/punk.png',
      description:  'Built by rogue engineers who refused to follow the rules. Riveted, rugged, and ready to cause a ruckus.',
    },
    {
      id:           'stone',
      name:         'Stone',
      price:        1500,
      unlockedSlot: 'assets/cannon/unlocked/stone.png',
      lockedSlot:   'assets/cannon/locked/stone.png',
      previewSrc:   'assets/cannon/themes/stone.png',
      barrelSrc:    'assets/cannon/cannon/stone.png',
      wheelSrc:     'assets/cannon/wheel/stone.png',
      description:  'Hewn from ancient ruins and overgrown with moss, this relic of a forgotten civilization still holds its ground.',
    },
  ];

  // ── PERSISTENCE ──────────────────────────────────────────────────────────
  const KEY_EQUIPPED = "spellshot-cannon-skin";
  const KEY_OWNED = "spellshot-cannon-owned";

  let equippedId = localStorage.getItem(KEY_EQUIPPED) || "default";
  let ownedIds = JSON.parse(localStorage.getItem(KEY_OWNED) || '["default"]');
  let selectedId = equippedId;

  function isOwned(id) {
    return ownedIds.includes(id);
  }
  function isEquipped(id) {
    return equippedId === id;
  }

  function saveState() {
    localStorage.setItem(KEY_EQUIPPED, equippedId);
    localStorage.setItem(KEY_OWNED, JSON.stringify(ownedIds));
  }

  function getSkin(id) {
    return SKINS.find((s) => s.id === id) || SKINS[0];
  }

  // ── COINS ────────────────────────────────────────────────────────────────
  function getCoins() {
    const coins = window.TargetWord?.state?.coins;
    if (typeof coins === "number") return coins;
    try {
      const saved = JSON.parse(
        localStorage.getItem("spellshot-game-state-v1") || "{}",
      );
      return typeof saved.coins === "number" ? saved.coins : 0;
    } catch {
      return 0;
    }
  }

  function spendCoins(amount) {
    if (window.TargetWord?.adjustCoins) {
      window.TargetWord.adjustCoins(-amount);
    }
    try {
      const raw = localStorage.getItem("spellshot-game-state-v1");
      const saved = raw ? JSON.parse(raw) : {};
      if (typeof saved.coins === "number") {
        saved.coins = Math.max(0, saved.coins - amount);
        localStorage.setItem("spellshot-game-state-v1", JSON.stringify(saved));
      }
    } catch {
      /* ignore */
    }
  }

  // ── PUBLIC API ───────────────────────────────────────────────────────────
  window.getEquippedCannonSrc = function () {
    return getSkin(equippedId).previewSrc;
  };
  window.getEquippedCannonId = function () {
    return equippedId;
  };
  window.openCannonShop = openShop;

  // ── OPEN MODAL ───────────────────────────────────────────────────────────
  function openShop() {
    if (document.getElementById("cannonShopBackdrop")) return;
    selectedId = equippedId;

    const backdrop = document.createElement("div");
    backdrop.id = "cannonShopBackdrop";
    Object.assign(backdrop.style, {
      position: "absolute",
      inset: "0",
      zIndex: "80",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.6)",
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeShop();
    });

    const modal = document.createElement("div");
    modal.id = "cannonShopModal";
    Object.assign(modal.style, {
      position: "relative",
      width: "680px",
      height: "460px",
      backgroundImage: "url(assets/cannon/modalBg.png)",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      flexShrink: "0",
      overflow: "hidden",
    });

    // ── Close button ──
    const closeBtn = document.createElement("img");
    closeBtn.src = "assets/button/closeButton.png";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "2%",
      right: "1%",
      width: "10%",
      height: "auto",
      imageRendering: "pixelated",
      cursor: "pointer",
      zIndex: "10",
      userSelect: "none",
      transition: "transform 0.1s ease, filter 0.1s ease",
      filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.8))",
    });
    closeBtn.addEventListener("click", () => {
      playClickSfx();
      closeShop();
    });
    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.transform = "scale(1.12)";
      closeBtn.style.filter =
        "brightness(1.3) drop-shadow(0 0 6px rgba(255,80,80,0.9))";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.transform = "scale(1)";
      closeBtn.style.filter = "drop-shadow(1px 1px 2px rgba(0,0,0,0.8))";
    });

    // ── Skin name label ──
    // Displayed above the preview image so the player knows which skin is selected
    const skinNameLabel = document.createElement('p');
    skinNameLabel.id = 'cannonShopSkinName';
    skinNameLabel.textContent = getSkin(selectedId).name.toUpperCase();
    Object.assign(skinNameLabel.style, {
      position:      'absolute',
      left:          '8%',
      top:           '20%',
      width:         '40%',
      margin:        '0',
      fontFamily:    '"PixelFont", sans-serif',
      fontSize:      '11px',
      color:         '#ffe066',
      textAlign:     'center',
      textShadow: `
        -2px -2px 0 #452103,
        2px -2px 0 #452103,
        -2px  2px 0 #452103,
        2px  2px 0 #452103,
        -2px  1px 0 #452103,
        2px  1px 0 #452103,
        1px -2px 0 #452103,
        1px  2px 0 #452103
      `,
      letterSpacing: '2px',
      zIndex:        '4',
      pointerEvents: 'none',
    });

    // ── Preview image  (left panel, large landscape cannon) ──
    const previewImg = document.createElement("img");
    previewImg.id = "cannonShopPreview";
    previewImg.src = getSkin(selectedId).previewSrc;
    Object.assign(previewImg.style, {
      position:       'absolute',
      left:           '15%',
      top:            '26%',
      width:          '25%',
      height:         'auto',
      maxHeight:      '25%',
      imageRendering: 'pixelated',
      objectFit:      'contain',
    });

    // ── Description panel ──
    // Uses the parchment background asset; tall enough to show the full description text
    const descPanel = document.createElement('div');
    descPanel.id = 'cannonShopDescPanel';
    Object.assign(descPanel.style, {
      position:         'absolute',
      left:             '12%',
      top:              '50%',
      width:            '30%',
      height:           '23%',
      backgroundImage:  'url(assets/descriptionBg.png)',
      backgroundSize:   '100% 100%',
      backgroundRepeat: 'no-repeat',
      display:          'flex',
      alignItems:       'center',
      justifyContent:   'center',
      padding:          '1% 2.5%',
      boxSizing:        'border-box',
      zIndex:           '3',
      pointerEvents:    'none',
    });

    const descText = document.createElement('p');
    descText.id = 'cannonShopDescText';
    descText.textContent = getSkin(selectedId).description;
    Object.assign(descText.style, {
      margin:        '0',
      fontFamily:    '"PixelFont", sans-serif',
      fontSize:      '7px',
      lineHeight:    '1.75',
      color:         '#ffe066',
      textAlign:     'center',
      wordBreak:     'break-word',
      textShadow: `
        -1px -1px 0 #452103,
        1px -1px 0 #452103,
        -1px  1px 0 #452103,
        1px  1px 0 #452103,
        -1px  0px 0 #452103,
        1px  0px 0 #452103,
        0px -1px 0 #452103,
        0px  1px 0 #452103
      `,
    });
    descPanel.appendChild(descText);

    // ── Action button ──
    const actionBtn = document.createElement("img");
    actionBtn.id = "cannonShopActionBtn";
    Object.assign(actionBtn.style, {
      position:       'absolute',
      left:           '15.5%',
      bottom:         '15%',
      width:          '22%',
      height:         'auto',
      imageRendering: 'pixelated',
      cursor:         'pointer',
      userSelect:     'none',
      zIndex:         '5',
      transition:     'transform 0.1s ease, filter 0.1s ease',
      filter:         'drop-shadow(1px 2px 3px rgba(0,0,0,0.7))',
    });
    actionBtn.addEventListener("mouseenter", () => {
      if (actionBtn.dataset.disabled !== "true") {
        actionBtn.style.transform = "scale(1.06) translateY(-2px)";
        actionBtn.style.filter =
          "brightness(1.2) drop-shadow(0 0 8px rgba(255,200,60,0.8))";
      }
    });
    actionBtn.addEventListener("mouseleave", () => {
      actionBtn.style.transform = "scale(1)";
      actionBtn.style.filter = "drop-shadow(1px 2px 3px rgba(0,0,0,0.7))";
    });

    // ── 2-col × 3-row grid (right panel) ──
    const grid = document.createElement("div");
    Object.assign(grid.style, {
      position: "absolute",
      left: "43%",
      top: "15%",
      width: "43%",
      height: "69%",
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(3, 1fr)",
      gap: "1%",
      boxSizing: "border-box",
    });

    SKINS.forEach((skin) => buildCard(skin, grid));

    modal.appendChild(closeBtn);
    modal.appendChild(skinNameLabel);
    modal.appendChild(previewImg);
    modal.appendChild(descPanel);
    modal.appendChild(actionBtn);
    modal.appendChild(grid);
    backdrop.appendChild(modal);

    const container = document.getElementById("container") || document.body;
    container.appendChild(backdrop);

    refreshActionBtn();
  }

  // ── BUILD ONE CARD ────────────────────────────────────────────────────────
  function buildCard(skin, grid) {
    const owned = isOwned(skin.id);
    const equipped = isEquipped(skin.id);

    const card = document.createElement("div");
    card.id = "cannonCard-" + skin.id;
    card.dataset.skinId = skin.id;
    Object.assign(card.style, {
      position: "relative",
      width: "100%",
      height: "100%",
      cursor: "pointer",
      userSelect: "none",
      lineHeight: "0",
      overflow: "hidden",
      filter: "drop-shadow(3px 4px 0px rgba(0,0,0,0.55))",
      transformOrigin: "center center",
      willChange: "transform, filter",
      transition:
        "transform 0.10s cubic-bezier(.22,.61,.36,1), filter 0.10s ease",
    });

    // Slot image
    const slotImg = document.createElement("img");
    slotImg.id = "cannonSlot-" + skin.id;
    slotImg.src = owned
      ? skin.unlockedSlot
      : skin.lockedSlot || skin.unlockedSlot;
    Object.assign(slotImg.style, {
      width: "100%",
      height: "100%",
      display: "block",
      imageRendering: "pixelated",
      objectFit: "cover",
      maxWidth: "100%",
      maxHeight: "100%",
    });

    // Price badge — locked skins only
    if (!owned && skin.price > 0) {
      const priceBadge = document.createElement("img");
      priceBadge.id = "cannonPrice-" + skin.id;
      priceBadge.src = "assets/cannon/price.png";
      Object.assign(priceBadge.style, {
        position: "absolute",
        bottom: "2px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "55%",
        height: "auto",
        imageRendering: "pixelated",
        pointerEvents: "none",
        zIndex: "4",
      });
      card.appendChild(priceBadge);
    }

    // Equipped checkmark
    const check = document.createElement("img");
    check.id = "cannonCheck-" + skin.id;
    check.src = "assets/balls/check.png";
    Object.assign(check.style, {
      position: "absolute",
      bottom: "3px",
      right: "3px",
      width: "35px",
      height: "35px",
      imageRendering: "pixelated",
      display: equipped ? "block" : "none",
      pointerEvents: "none",
      zIndex: "5",
    });

    card.appendChild(slotImg);
    card.appendChild(check);

    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.07) translateY(-3px)";
      card.style.filter =
        "brightness(1.22) drop-shadow(0 0 9px rgba(255,210,60,0.90)) drop-shadow(3px 4px 0px rgba(0,0,0,0.55))";
      card.style.zIndex = "10";
    });
    card.addEventListener("mousedown", () => {
      card.style.transform = "scale(0.91) translateY(3px)";
      card.style.filter =
        "brightness(1.55) drop-shadow(0 0 16px rgba(255,130,0,1)) drop-shadow(2px 2px 0px rgba(0,0,0,0.55))";
      card.style.transition = "transform 0.04s ease, filter 0.04s ease";
    });
    card.addEventListener("mouseup", () => {
      card.style.transition =
        "transform 0.10s cubic-bezier(.22,.61,.36,1), filter 0.10s ease";
      card.style.transform = "scale(1.07) translateY(-3px)";
      card.style.filter =
        "brightness(1.22) drop-shadow(0 0 9px rgba(255,210,60,0.90)) drop-shadow(3px 4px 0px rgba(0,0,0,0.55))";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transition =
        "transform 0.10s cubic-bezier(.22,.61,.36,1), filter 0.10s ease";
      card.style.transform = "scale(1)";
      card.style.filter = "drop-shadow(3px 4px 0px rgba(0,0,0,0.55))";
      card.style.zIndex = "";
    });

    card.addEventListener("click", () => {
      playClickSfx();
      onCardClick(skin.id);
    });
    grid.appendChild(card);
  }

  // ── INTERACTIONS ─────────────────────────────────────────────────────────
  function onCardClick(skinId) {
    selectedId = skinId;
    const preview = document.getElementById("cannonShopPreview");
    if (preview) preview.src = getSkin(skinId).previewSrc;

    // ── Update skin name label ──
    const nameLabel = document.getElementById('cannonShopSkinName');
    if (nameLabel) nameLabel.textContent = getSkin(skinId).name.toUpperCase();

    // ── Update description text ──
    const descText = document.getElementById('cannonShopDescText');
    if (descText) descText.textContent = getSkin(skinId).description;

    refreshActionBtn();
  }

  function refreshActionBtn() {
    const btn = document.getElementById("cannonShopActionBtn");
    if (!btn) return;
    btn.onclick = null;

    if (isEquipped(selectedId)) {
      btn.src = "assets/button/equippedButton.png";
      btn.dataset.disabled = "true";
      btn.style.cursor = "default";
    } else if (isOwned(selectedId)) {
      btn.src = "assets/button/equipButton.png";
      btn.dataset.disabled = "false";
      btn.style.cursor = "pointer";
      btn.onclick = () => {
        playClickSfx();
        equipSkin(selectedId);
      };
    } else {
      btn.src = "assets/button/buyButton.png";
      btn.dataset.disabled = "false";
      btn.style.cursor = "pointer";
      btn.onclick = () => {
        playClickSfx();
        buySkin(selectedId);
      }; // coin purchase
    }
  }

  function equipSkin(skinId) {
    equippedId = skinId;
    saveState();
    updateAllChecks();
    refreshActionBtn();
  }

  function buySkin(skinId) {
    const skin = getSkin(skinId);
    const coins = getCoins();
    if (coins < skin.price) {
      flashBtn();
      return;
    }

    spendCoins(skin.price);
    ownedIds.push(skinId);
    saveState();
    // if (typeof refreshCoinDisplay === 'function') refreshCoinDisplay();

    CoinAnimator.animateTo(getCoins());

    const slotImg = document.getElementById("cannonSlot-" + skinId);
    if (slotImg) slotImg.src = skin.unlockedSlot;

    const priceBadge = document.getElementById("cannonPrice-" + skinId);
    if (priceBadge) priceBadge.remove();

    equipSkin(skinId);
  }

  function flashBtn() {
    const btn = document.getElementById("cannonShopActionBtn");
    if (!btn) return;
    const shakes = ["-6px", "6px", "-4px", "4px", "0px"];
    let i = 0;
    const shake = () => {
      if (i >= shakes.length) {
        btn.style.transform = "scale(1)";
        btn.style.filter = "drop-shadow(1px 2px 3px rgba(0,0,0,0.7))";
        return;
      }
      btn.style.transform = `translateX(${shakes[i]})`;
      btn.style.filter =
        "drop-shadow(0 0 8px rgba(255,60,60,0.9)) brightness(0.85)";
      i++;
      setTimeout(shake, 80);
    };
    shake();
  }

  function updateAllChecks() {
    SKINS.forEach((s) => {
      const c = document.getElementById("cannonCheck-" + s.id);
      if (c) c.style.display = isEquipped(s.id) ? "block" : "none";
    });
  }

  // ── CLOSE ────────────────────────────────────────────────────────────────
  function closeShop() {
    const el = document.getElementById("cannonShopBackdrop");
    if (el) el.remove();
  }
})();
