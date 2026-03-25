(function () {
  // SKIN DEFINITIONS
  const SKINS = [
    {
      id: "default",
      name: "Default",
      price: 0,
      unlockedSlot: "assets/balls/unlocked/default.png",
      lockedSlot: null,
      previewSrc: "assets/balls/themes/default.png",
    },
    {
      id: "fire",
      name: "Fire",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/fire.png",
      lockedSlot: "assets/balls/locked/fire.png",
      previewSrc: "assets/balls/themes/fire.png",
    },
    {
      id: "spike",
      name: "Spike",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/spike.png",
      lockedSlot: "assets/balls/locked/spike.png",
      previewSrc: "assets/balls/themes/spike.png",
    },
    {
      id: "skull",
      name: "Skull",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/skull.png",
      lockedSlot: "assets/balls/locked/skull.png",
      previewSrc: "assets/balls/themes/skull.png",
    },
    {
      id: "toxic",
      name: "Toxic",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/toxic.png",
      lockedSlot: "assets/balls/locked/toxic.png",
      previewSrc: "assets/balls/themes/toxic.png",
    },
    {
      id: "shadow",
      name: "Shadow",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/shadow.png",
      lockedSlot: "assets/balls/locked/shadow.png",
      previewSrc: "assets/balls/themes/shadow.png",
    },
    {
      id: "pink",
      name: "Pink",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/pink.png",
      lockedSlot: "assets/balls/locked/pink.png",
      previewSrc: "assets/balls/themes/pink.png",
    },
    {
      id: "star",
      name: "Star",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/star.png",
      lockedSlot: "assets/balls/locked/star.png",
      previewSrc: "assets/balls/themes/star.png",
    },
    {
      id: "void",
      name: "Void",
      price: 500,
      unlockedSlot: "assets/balls/unlocked/void.png",
      lockedSlot: "assets/balls/locked/void.png",
      previewSrc: "assets/balls/themes/void.png",
    },
  ];

  // --------------------------------------------------
  // PERSISTENCE
  // --------------------------------------------------
  const KEY_EQUIPPED = "spellshot-ball-skin";
  const KEY_OWNED = "spellshot-ball-owned";

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

  // COINS — reads TargetWord if in-game, else localStorage
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

  // PUBLIC API
  window.getEquippedBallSrc = function () {
    return getSkin(equippedId).previewSrc;
  };

  window.openBallShop = openShop;

  // OPEN MODAL
  function openShop() {
    if (document.getElementById("ballShopBackdrop")) return;
    selectedId = equippedId;

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "ballShopBackdrop";
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

    // ── Modal ──
    const modal = document.createElement("div");
    modal.id = "ballShopModal";
    Object.assign(modal.style, {
      position: "relative",
      width: "680px",
      height: "460px",
      backgroundImage: "url(assets/balls/modalBg-low.png)",
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

    // ── Preview image ──
    const previewImg = document.createElement("img");
    previewImg.id = "ballShopPreview";
    previewImg.src = getSkin(selectedId).previewSrc;
    Object.assign(previewImg.style, {
      position: "absolute",
      left: "10%",
      top: "28%",
      width: "30%",
      height: "auto",
      maxHeight: "35%",
      imageRendering: "pixelated",
      objectFit: "contain",
    });

    // ── Action button image ──
    const actionBtn = document.createElement("img");
    actionBtn.id = "ballShopActionBtn";
    Object.assign(actionBtn.style, {
      position: "absolute",
      left: "15%",
      top: "65%",
      width: "20%",
      height: "auto",
      imageRendering: "pixelated",
      cursor: "pointer",
      userSelect: "none",
      zIndex: "2",
      transition: "transform 0.1s ease, filter 0.1s ease",
      filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.7))",
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

    // ── 3×3 card grid ──
    const grid = document.createElement("div");
    Object.assign(grid.style, {
      position: "absolute",
      left: "40%",
      top: "17%",
      width: "45%",
      height: "65%",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(3, 1fr)",
      gap: "4%",
      boxSizing: "border-box",
    });

    SKINS.forEach((skin) => buildCard(skin, grid));

    modal.appendChild(closeBtn);
    modal.appendChild(previewImg);
    modal.appendChild(actionBtn);
    modal.appendChild(grid);
    backdrop.appendChild(modal);

    const container = document.getElementById("container") || document.body;
    container.appendChild(backdrop);

    refreshActionBtn();
  }

  // BUILD ONE CARD
  function buildCard(skin, grid) {
    const owned = isOwned(skin.id);
    const equipped = isEquipped(skin.id);

    const card = document.createElement("div");
    card.id = "ballCard-" + skin.id;
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

    const slotImg = document.createElement("img");
    slotImg.id = "ballSlot-" + skin.id;
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

    if (!owned && skin.price > 0) {
      const priceBadge = document.createElement("img");
      priceBadge.id = "ballPrice-" + skin.id;
      priceBadge.src = "assets/balls/price.png";
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

    const check = document.createElement("img");
    check.id = "ballCheck-" + skin.id;
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
        "brightness(1.22) " +
        "drop-shadow(0 0 9px rgba(255,210,60,0.90)) " +
        "drop-shadow(3px 4px 0px rgba(0,0,0,0.55))";
      card.style.zIndex = "10";
    });

    card.addEventListener("mousedown", () => {
      card.style.transform = "scale(0.91) translateY(3px)";
      card.style.filter =
        "brightness(1.55) " +
        "drop-shadow(0 0 16px rgba(255,130,0,1)) " +
        "drop-shadow(2px 2px 0px rgba(0,0,0,0.55))";
      card.style.transition = "transform 0.04s ease, filter 0.04s ease";
    });

    card.addEventListener("mouseup", () => {
      card.style.transition =
        "transform 0.10s cubic-bezier(.22,.61,.36,1), filter 0.10s ease";
      card.style.transform = "scale(1.07) translateY(-3px)";
      card.style.filter =
        "brightness(1.22) " +
        "drop-shadow(0 0 9px rgba(255,210,60,0.90)) " +
        "drop-shadow(3px 4px 0px rgba(0,0,0,0.55))";
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

  // INTERACTIONS
  function onCardClick(skinId) {
    selectedId = skinId;
    const preview = document.getElementById("ballShopPreview");
    if (preview) preview.src = getSkin(skinId).previewSrc;
    refreshActionBtn();
  }

  function refreshActionBtn() {
    const btn = document.getElementById("ballShopActionBtn");
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
      }; // coin purchase dapat
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

    // STRICT check — must have enough coins
    if (coins < skin.price) {
      flashBtn();
      return;
    }

    spendCoins(skin.price);
    ownedIds.push(skinId);
    saveState();
    // if (typeof refreshCoinDisplay === 'function') refreshCoinDisplay();

    CoinAnimator.animateTo(getCoins());

    const slotImg = document.getElementById("ballSlot-" + skinId);
    if (slotImg) slotImg.src = skin.unlockedSlot;

    const priceBadge = document.getElementById("ballPrice-" + skinId);
    if (priceBadge) priceBadge.remove();

    equipSkin(skinId);
  }

  function flashBtn() {
    const btn = document.getElementById("ballShopActionBtn");
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
      const c = document.getElementById("ballCheck-" + s.id);
      if (c) c.style.display = isEquipped(s.id) ? "block" : "none";
    });
  }

  // CLOSE
  function closeShop() {
    const el = document.getElementById("ballShopBackdrop");
    if (el) el.remove();
  }
})();
