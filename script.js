(function () {
  const state = {
    word: "SPELL",
    progress: [],
    level: 1,
    wordsCompletedInTier: 0,
    currentTier: 1,
    totalWordsCompletedInTier: 0,
    maxLives: 3,
    lives: 3,
    coins: 0,
    sessionCoins: 0,
    maxAmmo: 6,
    ammo: 6,
  };
  state.sessionBaselineCoins = state.coins;

  const HUD_PADDING = 60;

  function signalTargetWordOverlayUpdate() {
    if (typeof markTargetWordDirty === "function") {
      markTargetWordDirty();
    }
  }

  let wordLists = null;
  let usedWords = new Set();

  function loadWordsJson() {
    if (wordLists) return Promise.resolve(wordLists);

    // Cache-bust with timestamp to force fresh fetch
    const cacheBustUrl = `assets/words.json?t=${Date.now()}`;
    return fetch(cacheBustUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log("✓ Loaded words.json:", data);
        wordLists = {
          words_3: (data.words_3 || []).map((w) => String(w).toUpperCase()),
          words_4: (data.words_4 || []).map((w) => String(w).toUpperCase()),
          words_5: (data.words_5 || []).map((w) => String(w).toUpperCase()),
        };
        usedWords.clear();
        console.log("✓ Parsed wordLists:", wordLists);
        return wordLists;
      })
      .catch((err) => {
        console.error("✗ Failed to load words.json:", err);
        wordLists = { words_3: [], words_4: [], words_5: [] };
        usedWords.clear();
        return wordLists;
      });
  }

  // Load words immediately when script loads
  loadWordsJson();

  function getNextWordInTier(tier) {
    console.log(
      `🎲 getNextWordInTier(${tier}): wordLists=${wordLists ? "loaded" : "NULL"}`,
    );

    if (!wordLists) {
      console.error("✗ wordLists is null, returning SPELL fallback");
      return "SPELL";
    }

    // Cap tier at 3 (we only have words_3, words_4, words_5)
    const cappedTier = Math.min(3, Math.max(1, tier));
    const tierKey = `words_${2 + cappedTier}`;
    const words = wordLists[tierKey] || [];

    if (words.length === 0) {
      console.error(
        `✗ No words found for ${tierKey}, returning SPELL fallback`,
      );
      return "SPELL";
    }

    // Get available words that haven't been used in this tier
    const availableWords = words.filter((w) => !usedWords.has(w));

    // If all words in tier have been used, reset and use all words
    if (availableWords.length === 0) {
      usedWords.clear();
      const selected = words[Math.floor(Math.random() * words.length)];
      console.log(
        `✓ All tier ${cappedTier} words used, cycling. Selected: ${selected}`,
      );
      usedWords.add(selected);
      return selected;
    }

    const randomIdx = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIdx];
    usedWords.add(selectedWord);
    console.log(
      `✓ Selected word for tier ${cappedTier}: ${selectedWord} (${usedWords.size}/${words.length} used)`,
    );
    return selectedWord;
  }

  function setTargetWord(word) {
    state.word = (word || "SPELL").toUpperCase();
    state.progress = Array(state.word.length).fill(false);
    state.maxAmmo = state.word.length + 2;
    resetAmmo();
    signalTargetWordOverlayUpdate();
  }

  function adjustCoins(amount) {
    if (!amount) return state.sessionCoins;
    state.sessionCoins = Math.max(0, state.sessionCoins + amount);
    return state.sessionCoins;
  }

  function getAccumulatedCoins() {
    const baseline =
      typeof state.sessionBaselineCoins === "number"
        ? state.sessionBaselineCoins
        : 0;

    return Math.max(0, state.coins - baseline + state.sessionCoins);
  }

  function bankSessionCoins() {
    state.coins = Math.max(0, state.coins + state.sessionCoins);
    state.sessionCoins = 0;
  }

  function discardSessionCoins() {
    state.sessionCoins = 0;
  }

  function resetDisplayedCoins() {
    state.sessionBaselineCoins = state.coins;
    signalTargetWordOverlayUpdate();
  }

  function resetLives() {
    state.lives = state.maxLives;
  }

  function resetAmmo() {
    state.ammo = state.maxAmmo;
  }

  function useAmmo(amount = 1) {
    if (amount <= 0) return state.ammo;
    state.ammo = Math.max(0, state.ammo - amount);
    return state.ammo;
  }

  function loseLife(amount = 1) {
    if (amount <= 0) return state.lives;
    state.lives = Math.max(0, state.lives - amount);
    return state.lives;
  }

  function recordMiss() {
    loseLife();
    useAmmo();
    return state.lives;
  }

  function hasLives() {
    return state.lives > 0;
  }

  function onLetterHit(letter, isInOrder) {
    letter = (letter || "").toUpperCase();
    if (!letter) return;

    if (!isInOrder) {
      loseLife();
      return false;
    }
    let matchedIndex = -1;
    for (let i = 0; i < state.word.length; i++) {
      if (state.word[i] === letter && !state.progress[i]) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      loseLife();
      return false;
    }
    state.progress[matchedIndex] = true;
    adjustCoins(
      typeof window._pendingCoinReward === "number"
        ? window._pendingCoinReward
        : 25,
    );
    window._pendingCoinReward = null;
    return state.progress.every(Boolean);
  }

  function completeWord() {
    state.wordsCompletedInTier++;
    state.totalWordsCompletedInTier++;

    const tierComplete = state.wordsCompletedInTier >= 3;
    return tierComplete;
  }

  function advanceToNextTier() {
    state.currentTier++;
    state.wordsCompletedInTier = 0;

    const nextWord = getNextWordInTier(state.currentTier);
    setTargetWord(nextWord);
  }

  function loadNextWordInTier() {
    const nextWord = getNextWordInTier(state.currentTier);
    setTargetWord(nextWord);
    return nextWord;
  }

  function resetGameProgress() {
    state.currentTier = 1;
    state.wordsCompletedInTier = 0;
    state.totalWordsCompletedInTier = 0;
    resetLives();
    resetAmmo();
    resetDisplayedCoins();
    const nextWord = getNextWordInTier(state.currentTier);
    setTargetWord(nextWord);
  }

  function drawTarget(ctx, letterImages, coinImage, heartImage) {
    if (!state.word) return;

    const padding = HUD_PADDING;
    const coinWidth = 60;
    const coinHeight = 50;
    const coinSpacing = 10;
    const heartSize = 40;
    const heartSpacing = 2;

    ctx.save();
    const hasCoin =
      coinImage && coinImage.complete && coinImage.naturalWidth > 0;
    const coinLayoutHeight = hasCoin ? coinHeight + coinSpacing : 0;
    const heartsBaseY = padding + coinLayoutHeight + 4;

    if (hasCoin) {
      ctx.globalAlpha = 1;
      ctx.drawImage(coinImage, padding, padding, coinWidth, coinHeight);
      ctx.fillStyle = "#ffd207ff";
      ctx.font = "bold 20px PixelFont";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(
        Number(CoinAnimator.getCurrent()).toLocaleString(),
        padding + coinWidth + 10,
        padding + coinHeight / 2 + 4,
      );
    } else {
      ctx.fillStyle = "#ffd207ff";
      ctx.font = "bold 10px PixelFont";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${CoinAnimator.getCurrent()}`, padding, padding + 18);
    }

    if (state.maxLives > 0) {
      const hasHeartSprite =
        heartImage && heartImage.complete && heartImage.naturalWidth > 0;
      ctx.font = `24px PixelFont`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < state.maxLives; i++) {
        const heartX = padding + i * (heartSize + heartSpacing);
        ctx.globalAlpha = i < state.lives ? 1 : 0.25;

        if (hasHeartSprite) {
          ctx.drawImage(heartImage, heartX, heartsBaseY, heartSize, heartSize);
        } else {
          ctx.fillStyle =
            i < state.lives
              ? "rgba(255, 70, 70, 1)"
              : "rgba(255, 70, 70, 0.25)";
          ctx.fillText(
            "❤",
            heartX + heartSize / 2,
            heartsBaseY + heartSize / 2,
          );
        }
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  window.TargetWord = {
    init: function (opts) {
      return loadWordsJson().then(() => {
        resetLives();
        const word = getNextWordInTier(state.currentTier);
        setTargetWord(word);
        return word;
      });
    },
    setTargetWord: setTargetWord,
    onLetterHit: onLetterHit,
    completeWord: completeWord,
    advanceToNextTier: advanceToNextTier,
    draw: drawTarget,
    recordMiss: recordMiss,
    loseLife: loseLife,
    resetLives: resetLives,
    resetAmmo: resetAmmo,
    resetGameProgress: resetGameProgress,
    useAmmo: useAmmo,
    hasLives: hasLives,
    adjustCoins: adjustCoins,
    loadNextWordInTier: loadNextWordInTier,
    resetDisplayedCoins: resetDisplayedCoins,
    bankSessionCoins: bankSessionCoins,
    discardSessionCoins: discardSessionCoins,
    state: state,
    // Expose for debugging
    _wordLists: () => wordLists,
    _usedWords: () => usedWords,
  };
})();
