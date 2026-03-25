(function () {
  const KEY_EQUIPPED = "spellshot-ball-skin";

  const SKIN_SRCS = {
    default: "assets/cannonBall.png",
    fire: "assets/balls/themes/fire.png",
    spike: "assets/balls/themes/spike.png",
    skull: "assets/balls/themes/skull.png",
    toxic: "assets/balls/themes/toxic.png",
    shadow: "assets/balls/themes/shadow.png",
    pink: "assets/balls/themes/pink.png",
    star: "assets/balls/themes/star.png",
    void: "assets/balls/themes/void.png",
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

  const TRAIL_COLORS = {
    default: "200, 200, 220", // silver
    fire: "255, 90, 15", // orange-red
    spike: "155, 50, 255", // purple  ← matches your mockup
    skull: "210, 210, 255", // ghostly white-blue
    toxic: "60, 255, 80", // toxic green
    shadow: "90, 0, 140", // deep purple
    pink: "255, 90, 190", // pink
    star: "255, 215, 40", // gold
    void: "25, 10, 200", // deep blue
  };

  const HIT_EFFECTS = {
    default: {
      colors: ["#ffffff", "#c8dcff", "#a0b8ff"],
      count: 22,
      speedMin: 3,
      speedMax: 8,
      sizeMin: 2,
      sizeMax: 4,
      decay: 0.022,
      gravity: 0.06,
      drag: 0.96,
      shape: "circle",
      blendMode: "lighter",
      flashColor: "rgba(200,220,255,",
    },
    fire: {
      colors: ["#ff4400", "#ff8800", "#ffcc00", "#ff2200"],
      count: 32,
      speedMin: 4,
      speedMax: 11,
      sizeMin: 2,
      sizeMax: 5,
      decay: 0.016,
      gravity: -0.1,
      drag: 0.97, // rises like flame
      shape: "circle",
      blendMode: "lighter",
      flashColor: "rgba(255,100,10,",
    },
    spike: {
      colors: ["#cc44ff", "#8800ff", "#ff88ff", "#6600cc"],
      count: 28,
      speedMin: 5,
      speedMax: 13,
      sizeMin: 1.5,
      sizeMax: 3.5,
      decay: 0.02,
      gravity: 0.05,
      drag: 0.94,
      shape: "shard", // sharp angular lines
      blendMode: "lighter",
      flashColor: "rgba(170,40,255,",
    },
    skull: {
      colors: ["#e8e8ff", "#aaaacc", "#ffffff", "#9999bb"],
      count: 20,
      speedMin: 1.5,
      speedMax: 5,
      sizeMin: 2,
      sizeMax: 5,
      decay: 0.012,
      gravity: -0.04,
      drag: 0.98, // float upward slowly
      shape: "circle",
      blendMode: "screen",
      flashColor: "rgba(200,200,255,",
    },
    toxic: {
      colors: ["#00ff44", "#44ff00", "#aaff00", "#00cc33"],
      count: 26,
      speedMin: 3,
      speedMax: 9,
      sizeMin: 3,
      sizeMax: 6, // bigger blobs
      decay: 0.014,
      gravity: 0.12,
      drag: 0.93, // heavy splat
      shape: "circle",
      blendMode: "lighter",
      flashColor: "rgba(20,255,60,",
    },
    shadow: {
      colors: ["#8800ff", "#440088", "#cc00ff", "#330066"],
      count: 24,
      speedMin: 2,
      speedMax: 7,
      sizeMin: 3,
      sizeMax: 7,
      decay: 0.01,
      gravity: -0.02,
      drag: 0.97, // slowly expands
      shape: "ring", // hollow circles
      blendMode: "screen",
      flashColor: "rgba(100,0,200,",
    },
    pink: {
      colors: ["#ff44cc", "#ff88dd", "#ff00aa", "#ffccee"],
      count: 30,
      speedMin: 3,
      speedMax: 9,
      sizeMin: 2,
      sizeMax: 4,
      decay: 0.018,
      gravity: -0.06,
      drag: 0.97,
      shape: "heart",
      blendMode: "lighter",
      flashColor: "rgba(255,60,180,",
    },
    star: {
      colors: ["#ffe800", "#ffcc00", "#ffffff", "#ffaa00"],
      count: 30,
      speedMin: 4,
      speedMax: 12,
      sizeMin: 2,
      sizeMax: 5,
      decay: 0.018,
      gravity: 0.04,
      drag: 0.95,
      shape: "star",
      blendMode: "lighter",
      flashColor: "rgba(255,220,0,",
    },
    void: {
      colors: ["#2255ff", "#0033cc", "#6688ff", "#001177"],
      count: 28,
      speedMin: 2,
      speedMax: 10,
      sizeMin: 2,
      sizeMax: 5,
      decay: 0.013,
      gravity: 0.0,
      drag: 0.98,
      shape: "ring",
      blendMode: "lighter",
      flashColor: "rgba(40,80,255,",
    },
  };

  // PUBLIC API
  window.BallSkins = {
    getSelectedImg: function () {
      const equippedId = localStorage.getItem(KEY_EQUIPPED) || "default";
      const src = SKIN_SRCS[equippedId] || SKIN_SRCS["default"];
      const img = getImgForSrc(src);

      return img.complete && img.naturalWidth > 0 ? img : null;
    },

    getSelectedSrc: function () {
      const equippedId = localStorage.getItem(KEY_EQUIPPED) || "default";
      return SKIN_SRCS[equippedId] || SKIN_SRCS["default"];
    },

    getTrailColor: function () {
      const id = localStorage.getItem(KEY_EQUIPPED) || "default";
      return TRAIL_COLORS[id] || TRAIL_COLORS["default"];
    },

    getHitEffect() {
      const id = localStorage.getItem(KEY_EQUIPPED) || "default";
      return HIT_EFFECTS[id] || HIT_EFFECTS["default"];
    },
  };

  const initialId = localStorage.getItem(KEY_EQUIPPED) || "default";
  const initialSrc = SKIN_SRCS[initialId] || SKIN_SRCS["default"];
  getImgForSrc(initialSrc);
})();
