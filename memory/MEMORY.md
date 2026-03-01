# Marie Adventure — Project Memory

## Stack
- Phaser 3.60.0 (CDN), vanilla JS, no build step
- HTML/CSS/JS only, served via any static HTTP server

## Project Structure
- `index.html` — entry point, loads all scripts globally
- `game.js` — Phaser config + `window.GAME_SETTINGS` (musicEnabled: false by default)
- `scenes/` — BootScene, TitleScene, GameScene, HUDScene, GameOverScene, WinScene
- `audio/` — AudioUnlock.js, MusicManager.js, GameTheme.js
- `assets/` — PNG sprites (marie, capy, bottle, ground, background)

## Audio Architecture
- **SFX**: Web Audio API in GameScene._sfx(), uses `window.SFX_AUDIO_CONTEXT` (set by AudioUnlock.js). No external files.
- **Music**: MusicManager.js (chiptune synthesizer, no external files). Song: GameTheme.js (G major waltz, 3/4, bpm=100, key: 'game-theme'). Music is OFF by default (`musicEnabled: false` in GAME_SETTINGS). To enable: `window.GAME_SETTINGS.musicEnabled = true` in console.
- **AudioUnlock.js**: unlocks SFX AudioContext on first user gesture (mobile). Does NOT touch music context.
- Music AudioContext is separate from SFX AudioContext.

## Key Constants (GameScene.js, global scope)
- GAME_WIDTH=480, GAME_HEIGHT=270
- GROUND_Y=238, LEVEL_WIDTH=1946
- MARIE_SPEED=140, JUMP_VY=-440, gravity.y=700
- LIVES_START=3, TIME_START=60
- LIVES_START is referenced from HUDScene (global scope dependency, works because GameScene.js loads first)

## Bugs Fixed (2026-02-28)
1. MusicManager._scheduled memory leak: added filter to remove finished oscillators in _scheduleLoop() before each new loop
2. MusicManager.stop() used Math.max(now, _stopAt) which could let future notes play on — changed to n.stop(now)
3. README: added TitleScene.js and audio/ folder to structure; added win condition; added audio section

## Mobile Support
- Touch controls: 3 on-screen buttons (◄ ►▲), setScrollFactor(0), multi-pointer support
- Viewport: 100dvh with -webkit-fill-available fallback for iOS Safari
- touch-action: none on canvas
- orientationchange → resize notification to Phaser

## Known Non-Bugs
- chapel.png and block_q.png are unused assets (future/leftover)
- Music disabled by design (code present but musicEnabled: false)
- No jump animation (uses walk/idle during airborne — design choice)
