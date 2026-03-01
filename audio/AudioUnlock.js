// Utilitário para desbloquear o WebAudio em browsers mobile (iOS Safari, etc.)
// Objetivo: permitir SFX após o primeiro gesto do usuário, SEM iniciar a música.
// Expõe: window.AudioUnlock.unlock()
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

    // Alguns browsers só desbloqueiam completamente quando algo é agendado no grafo de áudio.
    // Agendamos um bip inaudível (ganho mínimo + duração mínima) para garantir o desbloqueio.
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

            // Contexto SFX (usado pelo GameScene)
            const sfx = getSfxContext();
            await resumeContext(sfx);
            silentBlip(sfx);

            // Intencionalmente NÃO tocamos no sistema de música aqui.
            // A música deve ser iniciada explicitamente pelo código/UI quando habilitada.

            this.unlocked = true;
        }
    };
})();
