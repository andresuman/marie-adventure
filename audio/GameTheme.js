// Tardes em Lindóia — Zequinha de Abreu (1930). Domínio público.
// Transcrição da partitura (pág. 1/3) adaptada para o MusicManager.
// Valsa em Mi♭ maior, 3/4, ~70 BPM — 24 compassos.
// Caráter: valsa brasileira nostálgica; tema da cidade de Águas de Lindóia (SP).
(function () {
    const MM = window.MusicManager;
    const U  = window.MusicUtils;
    if (!MM || !U) return;

    const bpm             = 70;
    const beatsPerMeasure = 3;   // 3/4 (valsa)

    // ── Melodia (voz superior, clave de sol) ──────────────────────────────────
    // '4' = semínima (1 tempo) | '2' = mínima (2 tempos) | '2.' = mínima pontuada (3 tempos)
    //
    // Seção A  (c.1–6):   Mi♭ maior; abertura em notas longas e frase descendente
    // Seção B  (c.7–10):  Fá maior (II grau com terça natural Lá♮); contraste
    // Seção A' (c.11–14): reexposição em Mi♭
    // Seção C  (c.15–20): cadência C7→Fm→Si♭→Si♭7; tensão dramática
    // Coda     (c.21–24): Mi♭→F7→Si♭7→Mi♭; fechamento com loop limpo
    const leadTokens = [
        // === Seção A ===
        // c.1  — abertura: G5 sustentada (arpejo Eb na batida 1)
        ['G5', '2.'],
        // c.2  — resposta na tônica
        ['Eb5', '2.'],
        // c.3  — graus conjuntos ascendentes
        ['Bb4', '4'], ['C5', '4'], ['D5', '4'],
        // c.4  — resolução com bordão
        ['Eb5', '2'], ['D5', '4'],
        // c.5  — descida expressiva
        ['C5', '4'], ['Bb4', '4'], ['Ab4', '4'],
        // c.6  — Fm: repouso na subdominante menor
        ['G4', '2'], ['Ab4', '4'],

        // === Seção B — Fá maior ===
        // c.7  — Lá♮: terça de Fá maior (cromatismo expressivo)
        ['C5', '4'], ['Bb4', '4'], ['A4', '4'],
        // c.8  — descida até a fundamental
        ['G4', '2'], ['F4', '4'],
        // c.9  — ascendente de volta ao Si♭
        ['G4', '4'], ['A4', '4'], ['Bb4', '4'],
        // c.10 — retorno à tônica Mi♭
        ['Eb5', '2.'],

        // === Seção A' — reexposição ===
        // c.11
        ['G5', '2.'],
        // c.12
        ['Eb5', '2.'],
        // c.13
        ['Bb4', '4'], ['C5', '4'], ['D5', '4'],
        // c.14 — fecha a reexposição
        ['Eb5', '2.'],

        // === Seção C — C7 → Fm → Si♭ → Si♭7 ===
        // c.15 — C7: Mi♮ (sensível da dominante de Fm)
        ['E4', '4'], ['G4', '4'], ['Bb4', '4'],
        // c.16 — Fm: resolução
        ['Ab4', '2'], ['G4', '4'],
        // c.17 — Fm: elaboração ascendente
        ['F4', '4'], ['G4', '4'], ['Ab4', '4'],
        // c.18 — Si♭ maior: impulso ascendente
        ['D5', '2'], ['C5', '4'],
        // c.19 — Si♭7: tensão pré-cadência
        ['Bb4', '2'], ['Ab4', '4'],
        // c.20 — movimento cadencial descendente
        ['G4', '4'], ['F4', '4'], ['Eb4', '4'],

        // === Coda — Mi♭ → F7 → Si♭7 → Mi♭ ===
        // c.21 — Mi♭: respiração
        ['Bb4', '2.'],
        // c.22 — F7: Lá♮ (7ª de dominante)
        ['C5', '4'], ['A4', '4'], ['G4', '4'],
        // c.23 — Si♭7: penúltimo acorde
        ['F4', '2'], ['D4', '4'],
        // c.24 — Mi♭: repouso final (loop recomeça em G5)
        ['Eb4', '2.'],
    ];

    const lead = [];
    let beat = 0;
    for (const [note, durTok] of leadTokens) {
        const beats = U.durationTokenToBeats(durTok);
        lead.push({ note, startBeat: beat, beats });
        beat += beats;
    }

    const measures   = Math.ceil(beat / beatsPerMeasure);
    const totalBeats = measures * beatsPerMeasure;

    // ── Acompanhamento oom-pah-pah ─────────────────────────────────────────────
    // Cada linha: [baixo_batida1, acorde_batida2, acorde_batida3]
    const accompaniment = [
        ['Eb2', 'G3',  'Bb3'],  // c.1  Mi♭ maior
        ['Eb2', 'G3',  'Bb3'],  // c.2
        ['Eb2', 'G3',  'Bb3'],  // c.3
        ['Eb2', 'G3',  'Bb3'],  // c.4
        ['Eb2', 'G3',  'Bb3'],  // c.5
        ['F2',  'Ab3', 'C4' ],  // c.6  Fm
        ['F2',  'A3',  'C4' ],  // c.7  Fá maior (A♮)
        ['F2',  'A3',  'C4' ],  // c.8
        ['F2',  'A3',  'C4' ],  // c.9
        ['Eb2', 'G3',  'Bb3'],  // c.10 Mi♭
        ['Eb2', 'G3',  'Bb3'],  // c.11
        ['Eb2', 'G3',  'Bb3'],  // c.12
        ['Eb2', 'G3',  'Bb3'],  // c.13
        ['Eb2', 'G3',  'Bb3'],  // c.14
        ['C2',  'E3',  'G3' ],  // c.15 Dó7 (E♮)
        ['F2',  'Ab3', 'C4' ],  // c.16 Fm
        ['F2',  'Ab3', 'C4' ],  // c.17 Fm
        ['Bb2', 'D3',  'F3' ],  // c.18 Si♭
        ['Bb2', 'D3',  'Ab3'],  // c.19 Si♭7
        ['Bb2', 'D3',  'Ab3'],  // c.20 Si♭7
        ['Eb2', 'G3',  'Bb3'],  // c.21 Mi♭
        ['F2',  'A3',  'C4' ],  // c.22 F7 (A♮)
        ['Bb2', 'D3',  'Ab3'],  // c.23 Si♭7
        ['Eb2', 'G3',  'Bb3'],  // c.24 Mi♭ final
    ];

    const bass = [];
    for (let m = 0; m < accompaniment.length; m++) {
        const [root, ch1, ch2] = accompaniment[m];
        const mStart = m * beatsPerMeasure;
        bass.push({ note: root, startBeat: mStart,     beats: 1 });
        bass.push({ note: ch1,  startBeat: mStart + 1, beats: 1 });
        bass.push({ note: ch2,  startBeat: mStart + 2, beats: 1 });
    }

    MM.registerSong('game-theme', {
        bpm,
        totalBeats,
        lead,
        bass,
        leadWave: 'triangle',
        bassWave: 'triangle',
        leadAmp:  0.10,
        bassAmp:  0.050,
    });
})();
