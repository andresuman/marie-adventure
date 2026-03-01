// Simple WebAudio music manager (no external files)
// Exposes: window.MusicManager
(function () {
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function noteToMidi(note) {
        // Examples: C4, F#5, Bb3
        const m = /^([A-G])([#b]?)(-?\d+)$/.exec(String(note).trim());
        if (!m) return null;

        const name = m[1];
        const accidental = m[2] || '';
        const octave = parseInt(m[3], 10);

        const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[name];
        const acc = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
        // MIDI: C-1 = 0, C4 = 60
        return (octave + 1) * 12 + base + acc;
    }

    function midiToFreq(midi) {
        // A4 = 440Hz = MIDI 69
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function noteToFreq(note) {
        if (note == null) return null;
        const n = String(note).trim();
        if (!n || n.toUpperCase() === 'R' || n.toLowerCase() === 'rest') return null;
        const midi = noteToMidi(n);
        return midi == null ? null : midiToFreq(midi);
    }

    function durationTokenToBeats(tok) {
        // Uses the common sheet notation: 4=quarter (1 beat), 2=half (2 beats), 8=eighth (0.5 beat)
        // Dotted: 2. = dotted half (3 beats)
        const s = String(tok).trim();
        const dotted = s.endsWith('.');
        const denom = parseFloat(dotted ? s.slice(0, -1) : s);
        if (!denom || !isFinite(denom)) return 1;
        let beats = 4 / denom;
        if (dotted) beats *= 1.5;
        return beats;
    }

    class _MusicManager {
        constructor() {
            this._songs = new Map();
            this._playingKey = null;
            this._loopTimer = null;
            this._scheduled = [];
            this._volume = 0.18;
        }

        registerSong(key, song) {
            this._songs.set(key, song);
        }

        ensureAudioContext() {
            if (!this._ac) {
                this._ac = new (window.AudioContext || window.webkitAudioContext)();
                this._master = this._ac.createGain();
                this._master.gain.value = this._volume;
                this._master.connect(this._ac.destination);
            }
            return this._ac;
        }

        setVolume(v) {
            this._volume = clamp(v, 0, 1);
            if (this._master) this._master.gain.value = this._volume;
        }

        isPlaying(key) {
            return this._playingKey === key;
        }

        async play(key, opts) {
            const song = this._songs.get(key);
            if (!song) throw new Error(`Song not registered: ${key}`);
            if (this._playingKey === key) return;

            this.stop();
            this._playingKey = key;

            const ac = this.ensureAudioContext();

            // Autoplay policies: resume may need to be triggered by a user gesture.
            try { if (ac.state === 'suspended') await ac.resume(); } catch (e) {}

            this._loop = !(opts && opts.loop === false);
            this._nextStart = ac.currentTime + 0.06;
            this._scheduleLoop();
        }

        stop() {
            this._playingKey = null;
            if (this._loopTimer) { clearTimeout(this._loopTimer); this._loopTimer = null; }
            // stop any scheduled oscillators that haven't played yet
            const now = this._ac ? this._ac.currentTime : 0;
            this._scheduled.forEach(n => {
                try {
                    if (n.stop) n.stop(now);
                } catch (e) {}
            });
            this._scheduled = [];
        }

        _scheduleLoop() {
            if (!this._playingKey) return;
            const song = this._songs.get(this._playingKey);
            const ac = this.ensureAudioContext();

            // Clean up already-finished oscillators to prevent unbounded memory growth
            const now = ac.currentTime;
            this._scheduled = this._scheduled.filter(o => (o._stopAt || 0) > now);

            const secondsPerBeat = 60 / (song.bpm || 100);
            const totalBeats = song.totalBeats;
            const totalSeconds = totalBeats * secondsPerBeat;

            const startAt = this._nextStart;
            this._scheduleSong(song, startAt);

            this._nextStart = startAt + totalSeconds;
            if (this._loop) {
                // Schedule next loop slightly before the end.
                const ms = Math.max(10, (totalSeconds - 0.15) * 1000);
                this._loopTimer = setTimeout(() => this._scheduleLoop(), ms);
            }
        }

        _scheduleSong(song, startAt) {
            const ac = this.ensureAudioContext();
            const spb = 60 / (song.bpm || 100);

            const playOsc = (freq, when, dur, type, amp) => {
                if (!freq) return;
                const o = ac.createOscillator();
                const g = ac.createGain();
                o.type = type;
                o.frequency.setValueAtTime(freq, when);

                const attack = 0.01;
                const release = 0.03;
                const end = when + Math.max(0.02, dur);

                g.gain.setValueAtTime(0.0001, when);
                g.gain.linearRampToValueAtTime(amp, when + attack);
                g.gain.setValueAtTime(amp, Math.max(when + attack, end - release));
                g.gain.linearRampToValueAtTime(0.0001, end);

                o.connect(g);
                g.connect(this._master);
                o.start(when);
                o.stop(end);

                o._stopAt = end;
                this._scheduled.push(o);
            };

            // Lead
            (song.lead || []).forEach(ev => {
                const when = startAt + ev.startBeat * spb;
                const dur = ev.beats * spb;
                playOsc(noteToFreq(ev.note), when, dur, song.leadWave || 'square', song.leadAmp ?? 0.10);
            });

            // Bass (waltz oom-pah-pah)
            (song.bass || []).forEach(ev => {
                const when = startAt + ev.startBeat * spb;
                const dur = ev.beats * spb;
                playOsc(noteToFreq(ev.note), when, dur, song.bassWave || 'triangle', song.bassAmp ?? 0.06);
            });
        }
    }

    window.MusicManager = new _MusicManager();
    window.MusicUtils = { noteToFreq, durationTokenToBeats };
})();
