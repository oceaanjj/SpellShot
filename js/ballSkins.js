(function () {
  const KEY_EQUIPPED = 'spellshot-ball-skin';

  const SKIN_SRCS = {
    'default': 'assets/cannonBall.png',
    'fire':    'assets/balls/themes/fire.png',
    'spike':   'assets/balls/themes/spike.png',
    'skull':   'assets/balls/themes/skull.png',
    'toxic':   'assets/balls/themes/toxic.png',
    'shadow':  'assets/balls/themes/shadow.png',
    'pink':    'assets/balls/themes/pink.png',
    'star':    'assets/balls/themes/star.png',
    'void':    'assets/balls/themes/void.png',
  };

  const imgCache = {};

  function getImgForSrc(src) {
    if (!imgCache[src]) {
      const img = new Image();
      img.src = src;
      imgCache[src] = img;
    }
    return imgCache[src];
  }

  // PUBLIC API 
  window.BallSkins = {

    getSelectedImg: function () {
      const equippedId = localStorage.getItem(KEY_EQUIPPED) || 'default';
      const src        = SKIN_SRCS[equippedId] || SKIN_SRCS['default'];
      const img        = getImgForSrc(src);

      return (img.complete && img.naturalWidth > 0) ? img : null;
    },

    getSelectedSrc: function () {
      const equippedId = localStorage.getItem(KEY_EQUIPPED) || 'default';
      return SKIN_SRCS[equippedId] || SKIN_SRCS['default'];
    },

  };

  const initialId  = localStorage.getItem(KEY_EQUIPPED) || 'default';
  const initialSrc = SKIN_SRCS[initialId] || SKIN_SRCS['default'];
  getImgForSrc(initialSrc);

})();