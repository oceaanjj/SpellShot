# 🎯 Spell Shot

> A fun pixel-art spelling game where you fire cannonballs to spell words before time runs out!

---

<!-- Replace the path below with your actual screenshot -->
![Spell Shot Banner](assets/logo.png)

---

## 📖 About the Game

**Spell Shot** is a web-based spelling game built with HTML5 Canvas. You control a character with a cannon and must shoot the correct letters **in order** to spell the target word. Hit the wrong letter and you lose a life. Run out of time, lives, or ammo — and it's game over!

It's simple to learn but gets trickier as the levels go on. Earn coins, unlock cool cannon skins and ball skins, and try to clear all 15 levels across 3 maps!

---

## 🕹️ How to Play

1. **Aim** your cannon by moving your mouse
2. **Fire** by clicking or pressing `Space`
3. Hit the letters **in the correct order** to spell the word shown at the top
4. Complete the word before your **time**, **lives**, or **ammo** runs out
5. Earn **coins** for every correct letter hit
6. Use coins to unlock **cannon skins** and **ball skins** in the shop

### ⌨️ Controls

| Input | Action |
|---|---|
| Mouse Move | Aim cannon |
| Left Click / Space | Fire |
| Escape | Pause |
| R | Restart (on Game Over) |

---

## 🗺️ Maps & Levels

<!-- Add your map screenshots here -->
<!-- ![Map 1](assets/map1/background/background.png) -->

| Map | Levels | Time Limit |
|---|---|---|
| 🏰 Map 1 | 1 – 5 | 30 – 60 seconds |
| 🌊 Map 2 | 6 – 10 | 90 seconds |
| 🌋 Map 3 | 11 – 15 | 120 seconds |

Complete a level to unlock the next one. All 15 levels must be cleared to finish the game!

---

## 🛍️ Shop

Earn coins by hitting correct letters. Spend them on:

- 🎱 **Ball Skins** — Fire, Spike, Skull, Toxic, Shadow, Pink, Star, Void *(500 coins each)*
- 🔫 **Cannon Skins** — Gold, Ice, Lava, Punk, Stone *(1,000 coins each)*

---

## 👾 Characters

Choose from 4 playable characters before you start:

| Character | Name |
|---|---|
| 👧 | Girlie |
| 🧑 | Mark |
| 👩 | Pattie |
| 👦 | Peter |

---

## ✨ Features

- 🎮 15 levels across 3 unique maps
- 🏆 Combo system — chain correct hits for bonus reactions
- ❤️ Floating hearts — shoot them to recover a life
- 🎨 Unlockable ball and cannon skins
- 💾 Auto-save progress every 2.5 seconds
- 🔊 Background music + sound effects with volume controls
- 🎯 Aim guide toggle (turn off for a harder challenge)
- 🎉 Confetti celebration when you complete all levels

---

## 🚀 Getting Started

No installation needed — it runs entirely in the browser.

```bash
# Just open the folder and launch index.html
# Recommended: use a local server like Live Server (VS Code extension)
```

Or simply double-click `index.html` to open in your browser.

---

## 📁 Project Structure

```
spell-shot/
├── index.html          ← Main menu
├── level.html          ← Level select
├── game.html           ← Main game
├── tutorial.html       ← Tutorial
├── assets/             ← All images and fonts
│   ├── map1/           ← Map 1 assets
│   ├── map2/           ← Map 2 assets
│   ├── map3/           ← Map 3 assets
│   ├── balls/          ← Ball skin images
│   ├── cannon/         ← Cannon skin images
│   ├── character/      ← Character sprites
│   └── button/         ← UI button images
├── sounds/             ← Music and SFX
│   ├── tentative.mp3   ← Main menu music
│   ├── mainGame.mp3    ← In-game music
│   └── sfx/            ← Sound effects
├── js/                 ← Game scripts
│   ├── main.js         ← Entry point
│   ├── music.js        ← Background music
│   ├── sfx.js          ← Sound effects
│   ├── settings.js     ← Volume/aim settings
│   ├── coinAnimator.js ← Coin counter animation
│   ├── ballSkins.js    ← Ball skin bridge
│   ├── cannonSkins.js  ← Cannon skin bridge
│   ├── cannonBallShop.js ← Ball shop UI
│   ├── cannonSkinShop.js ← Cannon shop UI
│   ├── pause.js        ← Pause menu
│   └── tutorial.js     ← Tutorial slides
└── script.js           ← TargetWord system
```

## 🛠️ Built With

- **HTML5 Canvas** — Game rendering
- **Vanilla JavaScript** — All game logic
- **CSS3** — UI and animations
- **Press Start 2P** — Pixel font
- **localStorage / sessionStorage** — Save system

---

## 📝 License

This project was made for educational purposes. All game assets are original or used with permission.

---

<p align="center">Made with ❤️ by the Spell Shot Team</p>
