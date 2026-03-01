// Tema original composto para "Marie Adventure".
// Valsa em Fá maior, 3/4, 80 BPM — 24 compassos (A · A' · B).
// Caráter: nostalgia de salão, à moda das valsas brasileiras dos anos 1920.
// Obra inédita; qualquer semelhança com composições existentes é mera coincidência
// de estilo de época, não de melodia ou harmonia.
(function () {
    const MM = window.MusicManager;
    const U = window.MusicUtils;
    if (!MM || !U) return;

    const bpm = 80;
    const beatsPerMeasure = 3; // 3/4

    // ── Melodia principal ─────────────────────────────────────────────────────
    // Duração: 4 = semínima (1 tempo) | 2 = mínima (2 tempos) | 2. = mínima pontuada (3 tempos)
    //
    // Seção A (compassos 1–8): abertura em arpejos e graus conjuntos
    //   Harmonia: Fá maior → Dó maior (meia cadência no c.8)
    //
    // Seção A' (compassos 9–16): variação cantabile
    //   c.11 traz Mi natural (IVm → sensível para Fá): toque cromático sutil
    //
    // Seção B (compassos 17–24): contraste em Sib maior
    //   c.18 Mib5 (b7 do campo de Sib) e c.19/22 Lá natural (terça picante):
    //   dois cromatismos característicos dos salões de 1920
    const leadTokens = [
        // ── Seção A ──────────────────────────────────────────────────────────
        // c.1  — arpejo ascendente em Fá (abertura clássica de valsa)
        ['C4','4'], ['F4','4'], ['A4','4'],
        // c.2  — sobe à 5ª, recua suavemente para Sib
        ['C5','2'], ['Bb4','4'],
        // c.3  — descida em graus conjuntos
        ['A4','4'], ['G4','4'], ['F4','4'],
        // c.4  — repouso na tônica
        ['F4','2.'],

        // c.5  — reabre o arpejo
        ['C4','4'], ['F4','4'], ['A4','4'],
        // c.6  — desta vez chega à 6ª (Ré), colorindo mais
        ['D5','2'], ['C5','4'],
        // c.7  — descida por Sib–Lá–Sol
        ['Bb4','4'], ['A4','4'], ['G4','4'],
        // c.8  — meia cadência em Dó (V)
        ['C5','2.'],

        // ── Seção A' ─────────────────────────────────────────────────────────
        // c.9  — retorno do arpejo
        ['C4','4'], ['F4','4'], ['A4','4'],
        // c.10 — Sib na cabeça, Lá no terceiro tempo (ligeiro ornamento)
        ['Bb4','2'], ['A4','4'],
        // c.11 — Mi natural: sensível secundária, dá brilho à frase
        ['G4','4'], ['F4','4'], ['E4','4'],
        // c.12 — cadência perfeita em Fá
        ['F4','2.'],

        // c.13 — escala ascendente cantabile
        ['F4','4'], ['G4','4'], ['A4','4'],
        // c.14 — abre para Sib, retorna a Sol
        ['Bb4','2'], ['G4','4'],
        // c.15 — descida espelhada
        ['A4','4'], ['G4','4'], ['F4','4'],
        // c.16 — cadência em Fá, fecha a seção
        ['F4','2.'],

        // ── Seção B ──────────────────────────────────────────────────────────
        // c.17 — arpejo de Sib: contraste de cor harmônica
        ['F4','4'], ['Bb4','4'], ['D5','4'],
        // c.18 — Mib5: colorismo típico dos anos 1920 (b7 sobre Sib)
        ['Eb5','2'], ['D5','4'],
        // c.19 — Lá natural sobre campo de Sib: tensão cromática expressiva
        ['C5','4'], ['Bb4','4'], ['A4','4'],
        // c.20 — resolução em Sib
        ['Bb4','2.'],

        // c.21 — descida melódica de Ré
        ['D5','4'], ['C5','4'], ['Bb4','4'],
        // c.22 — bordão: Lá natural + Sib (suspiro cromático)
        ['A4','2'], ['Bb4','4'],
        // c.23 — prepara a cadência final
        ['C5','4'], ['Bb4','4'], ['G4','4'],
        // c.24 — repouso final em Fá
        ['F4','2.'],
    ];

    const lead = [];
    let beat = 0;
    for (const [note, durTok] of leadTokens) {
        const beats = U.durationTokenToBeats(durTok);
        lead.push({ note, startBeat: beat, beats });
        beat += beats;
    }

    // Arredonda para compassos completos (garantia de loop limpo)
    const measures = Math.ceil(beat / beatsPerMeasure);
    const totalBeats = measures * beatsPerMeasure;

    // ── Acompanhamento oom-pah-pah ────────────────────────────────────────────
    // Um acorde por compasso; harmonia segue o contorno melódico.
    const roots = [
        'F2', 'F2',   // c.1–2   Fá maior
        'F2', 'C2',   // c.3–4   Fá → Dó
        'F2', 'F2',   // c.5–6   Fá maior
        'C2', 'C2',   // c.7–8   Dó maior (meia cadência)
        'F2', 'F2',   // c.9–10  Fá maior
        'D2', 'F2',   // c.11–12 Ré menor → Fá (cadência perfeita)
        'F2', 'Bb2',  // c.13–14 Fá → Sib
        'C2', 'F2',   // c.15–16 Dó → Fá
        'Bb2','Bb2',  // c.17–18 Sib maior
        'Bb2','Bb2',  // c.19–20 Sib maior
        'Bb2','C2',   // c.21–22 Sib → Dó
        'C2', 'F2',   // c.23–24 Dó → Fá (cadência final)
    ];

    const chords = {
        F2:  ['A3', 'C4'],   // Fá maior
        C2:  ['E3', 'G3'],   // Dó maior (V)
        D2:  ['F3', 'A3'],   // Ré menor (ii)
        Bb2: ['D3', 'F3'],   // Sib maior (IV)
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

    MM.registerSong('game-theme', {
        bpm,
        totalBeats,
        lead,
        bass,
        leadWave: 'square',
        bassWave: 'triangle',
        leadAmp: 0.10,
        bassAmp: 0.055,
    });
})();
