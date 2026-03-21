(function () {
  const KEY_EQUIPPED = 'spellshot-cannon-skin';

  const SKIN_PARTS = {
    'default': {
      barrel: 'assets/canon.png',   
      wheel:  'assets/wheel.png',
    },
    'gold': {
      barrel: 'assets/cannon/cannon/gold.png',
      wheel:  'assets/cannon/wheel/gold.png',
    },
    'ice': {
      barrel: 'assets/cannon/cannon/ice.png',
      wheel:  'assets/cannon/wheel/ice.png',
    },
    'lava': {
      barrel: 'assets/cannon/cannon/lava.png',
      wheel:  'assets/cannon/wheel/lava.png',
    },
    'punk': {
      barrel: 'assets/cannon/cannon/punk.png',
      wheel:  'assets/cannon/wheel/punk.png',
    },
    'stone': {
      barrel: 'assets/cannon/cannon/stone.png',
      wheel:  'assets/cannon/wheel/stone.png',
    },
  };

  const imgCache = {};

  function getCachedImg(src) {
    if (!imgCache[src]) {
      const img = new Image();
      img.src = src;
      imgCache[src] = img;
    }
    return imgCache[src];
  }

  function getParts() {
    const id = localStorage.getItem(KEY_EQUIPPED) || 'default';
    return SKIN_PARTS[id] || SKIN_PARTS['default'];
  }

  function readyOrNull(img) {
    return (img && img.complete && img.naturalWidth > 0) ? img : null;
  }

  window.CannonSkins = {

    getBarrelImg: function () {
      return readyOrNull(getCachedImg(getParts().barrel));
    },

    getWheelImg: function () {
      return readyOrNull(getCachedImg(getParts().wheel));
    },

    preloadAll: function () {
      Object.values(SKIN_PARTS).forEach(p => {
        getCachedImg(p.barrel);
        getCachedImg(p.wheel);
      });
    },
  };

  const parts = getParts();
  getCachedImg(parts.barrel);
  getCachedImg(parts.wheel);

})();