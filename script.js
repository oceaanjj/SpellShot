(function () {
  const state = {
    word: "SPELL",
    progress: [],
    level: 1,
    wordsCompletedInTier: 0,  
    currentTier: 1,           
    totalWordsCompletedInTier: 0  
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
  }

  function onLetterHit(letter, isInOrder) {
    letter = (letter || '').toUpperCase();
    if (!letter) return;

    if (isInOrder) {
      for (let i = 0; i < state.word.length; i++) {
        if (state.word[i] === letter && !state.progress[i]) {
          state.progress[i] = true;
          break;
        }
      }
    }

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

  function drawTarget(ctx, letterImages) {
    if (!state.word || !letterImages) return;

    const spriteSize = 40;
    const gap = 2;
    const padding = 16;

    ctx.save();

    let x = padding;
    const y = padding;

    for (let i = 0; i < state.word.length; i++) {
      const letter = state.word[i];
      const img = letterImages[letter];

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, x, y, spriteSize, spriteSize);
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, x + spriteSize / 2, y + spriteSize / 2);
      }

      x += spriteSize + gap;
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  window.TargetWord = {
    init: function (opts) {
      return loadWordsJson().then(() => {
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
    state: state
  };
})();
