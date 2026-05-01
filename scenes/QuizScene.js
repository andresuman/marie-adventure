class QuizScene extends Phaser.Scene {
    constructor() { super({ key: 'QuizScene' }); }

    init(data) {
        this.pergunta     = data.pergunta;
        this.alternativas = data.alternativas;
        this.correta      = data.correta;
        this.explicacao   = data.explicacao;
        this.gameScene    = data.gameScene;
        this.respondeu    = false;
        this._acertou     = false;
    }

    create() {
        const W = this.scale.width;   // 480
        const H = this.scale.height;  // 270

        // ── Overlay escurecido ────────────────────────────────────────────────
        this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.82).setDepth(0);

        // ── Painel pergaminho ─────────────────────────────────────────────────
        const px = 18, py = 10, pw = W - 36, ph = H - 20;
        const panel = this.add.graphics().setDepth(1);
        panel.fillStyle(0xf2e4c0, 1);
        panel.fillRoundedRect(px, py, pw, ph, 8);
        panel.lineStyle(2.5, 0x8b5a2b, 1);
        panel.strokeRoundedRect(px, py, pw, ph, 8);
        // Detalhe interno (borda dupla sutil)
        panel.lineStyle(1, 0xc8a060, 0.6);
        panel.strokeRoundedRect(px + 4, py + 4, pw - 8, ph - 8, 6);

        const txt = (x, y, str, style) =>
            this.add.text(x, y, str, { fontFamily: 'monospace', resolution: 3, ...style })
                .setOrigin(0.5).setDepth(2);

        // ── Rótulo do painel ──────────────────────────────────────────────────
        txt(W/2, py + 13, '★  CURIOSIDADE HISTÓRICA  ★', {
            fontSize: '8px', color: '#f5e4c0',
            backgroundColor: '#7a3e00',
            padding: { x: 8, y: 3 },
        });

        // ── Pergunta ──────────────────────────────────────────────────────────
        this.add.text(W/2, py + 42, this.pergunta, {
            fontFamily: 'monospace', fontSize: '9px', color: '#2c1204',
            wordWrap: { width: pw - 24 }, align: 'center', resolution: 3,
        }).setOrigin(0.5).setDepth(2);

        // ── Botões das alternativas ───────────────────────────────────────────
        this._btns = [];
        const btnW = pw - 30, btnH = 22;
        const btnYs = [107, 133, 159];

        this.alternativas.forEach((alt, i) => {
            this._btns.push(this._makeBtn(W/2, btnYs[i], btnW, btnH, `${i + 1}.  ${alt}`, i));
        });

        // ── Área de feedback (oculta até responder) ───────────────────────────
        this._feedbackTxt = txt(W/2, 188, '', { fontSize: '9px', color: '#004400' });

        this._explicacaoTxt = this.add.text(W/2, 206, '', {
            fontFamily: 'monospace', fontSize: '7px', color: '#3a1a00',
            wordWrap: { width: pw - 24 }, align: 'center', resolution: 3,
        }).setOrigin(0.5).setDepth(2);

        // ── Botão CONTINUAR (oculto até responder) ────────────────────────────
        this._continuarBtn = txt(W/2, 248, '  CONTINUAR  ', {
            fontSize: '11px', color: '#111111',
            backgroundColor: '#ffe040',
            padding: { x: 12, y: 5 },
        }).setInteractive({ useHandCursor: true }).setVisible(false);

        this._continuarBtn.on('pointerover', () => this._continuarBtn.setBackgroundColor('#ffffff'));
        this._continuarBtn.on('pointerout',  () => this._continuarBtn.setBackgroundColor('#ffe040'));
        this._continuarBtn.on('pointerdown', () => this._fechar());

        // ── Suporte a teclado ─────────────────────────────────────────────────
        this.input.keyboard.on('keydown', (e) => {
            if (this.respondeu) {
                if (e.key === 'Enter' || e.key === ' ') this._fechar();
                return;
            }
            if (e.key === '1') this._responder(0);
            if (e.key === '2') this._responder(1);
            if (e.key === '3') this._responder(2);
        });
    }

    // ── Cria um botão de alternativa com estado de hover ──────────────────────
    _makeBtn(cx, cy, w, h, label, index) {
        const g = this.add.graphics().setDepth(2);
        const drawBg = (fill, stroke) => {
            g.clear();
            g.fillStyle(fill, 1);
            g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 4);
            g.lineStyle(1.5, stroke, 1);
            g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 4);
        };
        drawBg(0xffffff, 0x8b5a2b);

        const t = this.add.text(cx, cy, label, {
            fontFamily: 'monospace', fontSize: '8px', color: '#2c1204',
            resolution: 3, wordWrap: { width: w - 16 },
        }).setOrigin(0.5).setDepth(3);

        const zone = this.add.zone(cx, cy, w, h).setDepth(4).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => { if (!this.respondeu) drawBg(0xfde8a0, 0x8b5a2b); });
        zone.on('pointerout',  () => { if (!this.respondeu) drawBg(0xffffff, 0x8b5a2b); });
        zone.on('pointerdown', () => this._responder(index));

        return { g, t, cx, cy, w, h, zone, drawBg };
    }

    // ── Processa a resposta do jogador ────────────────────────────────────────
    _responder(indice) {
        if (this.respondeu) return;
        this.respondeu = true;
        this._acertou  = indice === this.correta;

        // Atualiza estatísticas de lifetime
        window.QuizStats && window.QuizStats.registrar(this._acertou);

        // Feedback visual nos botões
        this._btns.forEach((btn, i) => {
            btn.zone.disableInteractive();

            if (i === this.correta) {
                // Botão correto → verde
                btn.drawBg(0x44bb66, 0x226633);
                btn.t.setColor('#ffffff');
            } else if (i === indice) {
                // Botão escolhido errado → vermelho
                btn.drawBg(0xdd4444, 0x882222);
                btn.t.setColor('#ffffff');
            } else {
                // Botão neutro → cinza
                btn.drawBg(0xddccaa, 0xaa8855);
            }
        });

        // Feedback textual
        if (this._acertou) {
            this._feedbackTxt.setText('✔  CORRETO! +500 pontos e +5 segundos!').setColor('#004400');
            this._sndCorrect();
        } else {
            this._feedbackTxt.setText('✘  Resposta correta está destacada em verde').setColor('#662200');
            this._sndWrong();
        }
        this._explicacaoTxt.setText(this.explicacao);
        this._continuarBtn.setVisible(true);
    }

    // ── Fecha o quiz e retoma o jogo ──────────────────────────────────────────
    _fechar() {
        const gs = this.gameScene;
        this.scene.resume('GameScene');  // retoma GameScene antes de parar
        this.scene.stop();               // para esta cena
        gs.events.emit('quiz-resolvido', { acertou: this._acertou });
    }

    // ── SFX inline (usa o mesmo AudioContext dos SFX do jogo) ─────────────────
    _snd(fn) {
        try {
            const ac = window.SFX_AUDIO_CONTEXT || new (window.AudioContext || window.webkitAudioContext)();
            if (ac.state === 'suspended') ac.resume();
            fn(ac);
        } catch (e) {}
    }

    _sndCorrect() {
        // Arpejo ascendente em Fá maior — coerente com o tema musical do jogo
        this._snd(ac => {
            [[523, 0], [659, 0.10], [784, 0.20], [1047, 0.33]].forEach(([f, d]) => {
                const o = ac.createOscillator(), g = ac.createGain();
                o.connect(g); g.connect(ac.destination);
                o.type = 'square';
                o.frequency.setValueAtTime(f, ac.currentTime + d);
                g.gain.setValueAtTime(0.11, ac.currentTime + d);
                g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d + 0.15);
                o.start(ac.currentTime + d); o.stop(ac.currentTime + d + 0.16);
            });
        });
    }

    _sndWrong() {
        // Dois tons descendentes suaves — neutro, não punitivo
        this._snd(ac => {
            [[392, 0], [370, 0.12]].forEach(([f, d]) => {
                const o = ac.createOscillator(), g = ac.createGain();
                o.connect(g); g.connect(ac.destination);
                o.type = 'triangle';
                o.frequency.setValueAtTime(f, ac.currentTime + d);
                g.gain.setValueAtTime(0.09, ac.currentTime + d);
                g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d + 0.16);
                o.start(ac.currentTime + d); o.stop(ac.currentTime + d + 0.18);
            });
        });
    }
}
