// Audio unlock helper for mobile browsers (iOS Safari, etc.)
// Goal: allow SFX to play after the first user gesture WITHOUT starting music.
// Exposes: window.AudioUnlock.unlock()
(function () {
    function getSfxContext() {
        if (!window.SFX_AUDIO_CONTEXT) {
            window.SFX_AUDIO_CONTEXT = new (window.AudioContext || window.webkitAudioContext)();
        }
        return window.SFX_AUDIO_CONTEXT;
    }

    async function resumeContext(ac) {
        if (!ac) return;
        try {
            if (ac.state === 'suspended') await ac.resume();
        } catch (e) {}
    }

    // Some browsers only fully "unlock" after something is scheduled on the audio graph.
    // We schedule an inaudible blip (very low gain + very short duration).
    function silentBlip(ac) {
        try {
            const o = ac.createOscillator();
            const g = ac.createGain();
            g.gain.value = 0.00001;
            o.frequency.value = 440;
            o.connect(g);
            g.connect(ac.destination);
            const t = ac.currentTime;
            o.start(t);
            o.stop(t + 0.02);
        } catch (e) {}
    }

    window.AudioUnlock = window.AudioUnlock || {
        unlocked: false,
        async unlock() {
            if (this.unlocked) return;

            // SFX context (used by GameScene)
            const sfx = getSfxContext();
            await resumeContext(sfx);
            silentBlip(sfx);

            // Intentionally do NOT touch the music system here.
            // If/when music is enabled, it should be started explicitly by code/UI.

            this.unlocked = true;
        }
    };
})();
