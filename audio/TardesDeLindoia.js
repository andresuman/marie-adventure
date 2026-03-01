// Registers a simplified (chiptune-ish) melody based on the provided lead line.
(function () {
    const MM = window.MusicManager;
    const U = window.MusicUtils;
    if (!MM || !U) return;

    // Default: slow waltz
    const bpm = 100;
    const beatsPerMeasure = 3; // 3/4

    // Lead melody tokens: [NOTE, DURATION_TOKEN]
    // Duration token is in sheet notation (4=quarter (1 beat), 2=half (2 beats), 2.=dotted half (3 beats))
    const leadTokens = [
        // Measures 1-4
        ['D4', '4'], ['G4', '4'], ['B4', '4'],
        ['D5', '2'], ['G5', '4'],
        ['F#5', '4'], ['E5', '4'], ['D5', '4'],
        ['C5', '2'], ['A4', '4'],

        // Measures 5-8
        ['D4', '4'], ['F#4', '4'], ['A4', '4'],
        ['C5', '2'], ['F#5', '4'],
        ['E5', '4'], ['D5', '4'], ['C5', '4'],
        // Close phrase: B4 dotted half
        ['B4', '2.'],

        // Measures 9-12
        ['B4', '4'], ['C5', '4'], ['D5', '4'],
        ['F#5', '2'], ['E5', '4'],
        ['E5', '4'], ['D5', '4'], ['C5', '4'],
        ['B4', '2'], ['G4', '4'],

        // Measures 13-16
        ['G4', '4'], ['A4', '4'], ['B4', '4'],
        ['D5', '2'], ['C5', '4'],
        ['C5', '4'], ['B4', '4'], ['A4', '4'],
        ['G4', '2.'],
    ];

    const lead = [];
    let beat = 0;
    for (const [note, durTok] of leadTokens) {
        const beats = U.durationTokenToBeats(durTok);
        lead.push({ note, startBeat: beat, beats });
        beat += beats;
    }

    // Total length: round up to full measures so the loop feels musical
    const measures = Math.ceil(beat / beatsPerMeasure);
    const totalBeats = measures * beatsPerMeasure;

    // Simple accompaniment (oom-pah-pah) following the harmonic hint.
    const roots = [
        'G2','G2','G2','G2',
        'D2','D2','D2','D2',
        'G2','G2','G2','G2',
        'G2','G2','G2','G2',
    ];
    const chords = {
        G2: ['G3', 'B3'],
        D2: ['F#3', 'A3'],
    };

    const bass = [];
    for (let m = 0; m < Math.min(measures, roots.length); m++) {
        const root = roots[m];
        const chord = chords[root] || [];
        const mStart = m * beatsPerMeasure;
        bass.push({ note: root, startBeat: mStart + 0, beats: 1 });
        chord.forEach(n => bass.push({ note: n, startBeat: mStart + 1, beats: 1 }));
        chord.forEach(n => bass.push({ note: n, startBeat: mStart + 2, beats: 1 }));
    }

    MM.registerSong('tardes-de-lindoia', {
        bpm,
        totalBeats,
        lead,
        bass,
        leadWave: 'square',
        bassWave: 'triangle',
        leadAmp: 0.11,
        bassAmp: 0.055,
    });
})();
