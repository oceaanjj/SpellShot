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
    maxAmmo: 6,
    ammo: 6
  };

  let wordLists = null; 

  function loadWordsJson() {
    if (wordLists) return Promise.resolve(wordLists);

    return fetch('assets/words.json')
      .then(r => r.json())
      .then(data => {
        wordLists = {
          words_3: (data.words_3 || []).map(w => String(w).toUpperCase()),
          words_4: (data.words_4 || []).map(w => String(w).toUpperCase()),
          words_5: (data.words_5 || []).map(w => String(w).toUpperCase())
        };
        return wordLists;
      })
      .catch(() => {
        wordLists = { words_3: [], words_4: [], words_5: [] };
        return wordLists;
      });
  }

  function getNextWordInTier(tier) {
    if (!wordLists) return "SPELL";
    
    const tierKey = `words_${2 + tier}`;
    const words = wordLists[tierKey] || [];
    
    if (words.length === 0) return "SPELL";
    
    const randomIdx = Math.floor(Math.random() * words.length);
    return words[randomIdx];
  }

  function setTargetWord(word) {
    state.word = (word || 'SPELL').toUpperCase();
    state.progress = Array(state.word.length).fill(false);
    resetAmmo();
  }

  function adjustCoins(amount) {
    if (!amount) return state.coins;
    state.coins = Math.max(0, state.coins + amount);
    return state.coins;
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
    adjustCoins(-25);
    useAmmo();
    return state.lives;
  }

  function hasLives() {
    return state.lives > 0;
  }

  function onLetterHit(letter, isInOrder) {
    letter = (letter || '').toUpperCase();
    if (!letter) return;

    if (!isInOrder) {
      loseLife();
      adjustCoins(-25);
      useAmmo();
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
      adjustCoins(-25);
      useAmmo();
      return false;
    }

    state.progress[matchedIndex] = true;
    adjustCoins(100);
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
    const nextWord = getNextWordInTier(state.currentTier);
    setTargetWord(nextWord);
  }

  function drawTarget(ctx, letterImages, coinImage, heartImage) {
    if (!state.word || !letterImages) return;

    const spriteSize = 40;
    const gap = 2;
    const padding = 16;
    const coinSize = 64;
    const coinSpacing = 12;
    const heartSize = 32;
    const heartSpacing = 8;
    const defaultYOffset = 10;

    ctx.save();

    const hasCoin = coinImage && coinImage.complete && coinImage.naturalWidth > 0;
    const hasHeartSprite = heartImage && heartImage.complete && heartImage.naturalWidth > 0;
    const heartRowHeight = state.maxLives > 0 ? heartSize + heartSpacing : 0;
    const coinHeight = hasCoin ? coinSize + coinSpacing : 0;
    const y = padding + defaultYOffset + coinHeight + heartRowHeight;
    const heartsBaseY = padding + coinHeight + 6;

    if (hasCoin) {
      ctx.globalAlpha = 1;
      ctx.drawImage(coinImage, padding, padding, coinSize, coinSize);
      ctx.fillStyle = '#ffd207ff';
      ctx.font = 'bold 30px PixelFont';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${state.coins}`,
        padding + coinSize + 12,
        padding + coinSize / 2 + 4
      );
    } else {
      ctx.fillStyle = '#ffd207ff';
      ctx.font = 'bold 30px PixelFont';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${state.coins}`, padding, padding + 18);
    }

    if (state.maxLives > 0) {
        ctx.font = `${heartSize}px PixelFont`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < state.maxLives; i++) {
        const heartX = padding + i * (heartSize + heartSpacing);
        ctx.globalAlpha = i < state.lives ? 1 : 0.25;

        if (hasHeartSprite) {
          ctx.drawImage(heartImage, heartX, heartsBaseY, heartSize, heartSize);
        } else {
          ctx.fillStyle = i < state.lives ? 'rgba(255, 70, 70, 1)' : 'rgba(255, 70, 70, 0.25)';
          ctx.fillText('❤', heartX + heartSize / 2, heartsBaseY + heartSize / 2);
        }
      }

      ctx.globalAlpha = 1;
    }

    let x = padding;

    const wordY = y;

    for (let i = 0; i < state.word.length; i++) {
      const letter = state.word[i];
      const img = letterImages[letter];

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, x, wordY, spriteSize, spriteSize);
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = 'bold 20px PixelFont';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, x + spriteSize / 2, wordY + spriteSize / 2);
      }

      x += spriteSize + gap;
    }

    ctx.globalAlpha = 1;
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
    state: state
  };
})();
