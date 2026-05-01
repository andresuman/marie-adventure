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
        this._selectedIndex = 0;
    }

    create() {
        const W = this.scale.width;   // 480
        const H = this.scale.height;  // 270
        const BODY_FONT = 'Arial, Verdana, sans-serif';
        const UI_FONT   = 'monospace';

        // ── Overlay escurecido ────────────────────────────────────────────────
        this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88).setDepth(0);

        // ── Painel pergaminho ─────────────────────────────────────────────────
        // Margens menores para privilegiar leitura/toque em telas pequenas.
        const px = 8, py = 6, pw = W - 16, ph = H - 12;
        const panel = this.add.graphics().setDepth(1);
        panel.fillStyle(0xf2e4c0, 1);
        panel.fillRoundedRect(px, py, pw, ph, 8);
        panel.lineStyle(2.5, 0x8b5a2b, 1);
        panel.strokeRoundedRect(px, py, pw, ph, 8);
        // Detalhe interno (borda dupla sutil)
        panel.lineStyle(1, 0xc8a060, 0.6);
        panel.strokeRoundedRect(px + 4, py + 4, pw - 8, ph - 8, 6);

        const txt = (x, y, str, style) =>
            this.add.text(x, y, str, { fontFamily: UI_FONT, resolution: 3, ...style })
                .setOrigin(0.5).setDepth(2);

        // ── Pergunta ──────────────────────────────────────────────────────────
        this._questionTxt = this.add.text(W/2, py + 36, this.pergunta, {
            fontFamily: BODY_FONT, fontSize: '13px', color: '#111111',
            wordWrap: { width: pw - 30 }, align: 'center', resolution: 3,
            lineSpacing: 3,
        }).setOrigin(0.5).setDepth(2);

        // ── Botões das alternativas ───────────────────────────────────────────
        this._btns = [];
        const btnW = pw - 30, btnH = 40;
        const btnYs = [100, 150, 200];

        this.alternativas.forEach((alt, i) => {
            this._btns.push(this._makeBtn(W/2, btnYs[i], btnW, btnH, `${i + 1}.  ${alt}`, i));
        });

        this._instructionTxt = null;

        // ── Área de feedback (oculta até responder) ───────────────────────────
        this._feedbackTxt = this.add.text(W/2, 48, '', {
            fontFamily: UI_FONT, fontSize: '13px', color: '#004400',
            resolution: 3, align: 'center', wordWrap: { width: pw - 34 },
        }).setOrigin(0.5).setDepth(2).setVisible(false);

        this._explicacaoTxt = this.add.text(W/2, 132, '', {
            fontFamily: BODY_FONT, fontSize: '13px', color: '#111111',
            wordWrap: { width: pw - 34 }, align: 'center', resolution: 3,
            lineSpacing: 4,
        }).setOrigin(0.5).setDepth(2).setVisible(false);

        // ── Botão CONTINUAR (oculto até responder) ────────────────────────────
        this._continuarBtn = txt(W/2, 234, '  CONTINUAR  ', {
            fontSize: '13px', color: '#111111',
            backgroundColor: '#ffe040',
            padding: { x: 14, y: 6 },
        }).setInteractive({ useHandCursor: true }).setVisible(false);

        this._continuarBtn.on('pointerover', () => this._continuarBtn.setBackgroundColor('#ffffff'));
        this._continuarBtn.on('pointerout',  () => this._continuarBtn.setBackgroundColor('#ffe040'));
        this._continuarBtn.on('pointerdown', () => this._fechar());

        this._selectAnswer(0);

        // ── Suporte a teclado ─────────────────────────────────────────────────
        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.SPACE,
            Phaser.Input.Keyboard.KeyCodes.ENTER,
            Phaser.Input.Keyboard.KeyCodes.ESC,
        ]);

        this.input.keyboard.on('keydown', (e) => {
            if (this.respondeu) {
                if (e.key === 'Enter' || e.key === ' ') this._fechar();
                return;
            }

            if (this._isKey(e, 'ArrowUp', 'ArrowUp', 38)) {
                e.preventDefault();
                this._selectAnswer(this._selectedIndex - 1);
            } else if (this._isKey(e, 'ArrowDown', 'ArrowDown', 40)) {
                e.preventDefault();
                this._selectAnswer(this._selectedIndex + 1);
            } else if (this._isKey(e, 'Enter', 'Enter', 13) || this._isKey(e, ' ', 'Space', 32)) {
                e.preventDefault();
                this._responder(this._selectedIndex);
            } else if (this._isKey(e, 'Escape', 'Escape', 27)) {
                e.preventDefault();
                this._responder(-1);
            } else if (e.key === '1') this._responder(0);
            else if (e.key === '2') this._responder(1);
            else if (e.key === '3') this._responder(2);
        });
    }

    _isKey(e, key, code, keyCode) {
        return e.key === key || e.code === code || e.keyCode === keyCode;
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

        const t = this.add.text(cx - w/2 + 14, cy, label, {
            fontFamily: 'Arial, Verdana, sans-serif', fontSize: '11px', color: '#111111',
            resolution: 3, wordWrap: { width: w - 28 }, align: 'left', lineSpacing: 2,
            fixedWidth: w - 28,
        }).setOrigin(0, 0.5).setDepth(3);

        const zone = this.add.zone(cx, cy, w, h).setDepth(4).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => { if (!this.respondeu) this._selectAnswer(index); });
        zone.on('pointerdown', () => this._responder(index));

        return { g, t, cx, cy, w, h, zone, drawBg };
    }

    // ── Seleção visual usada por teclado e mouse, sem afetar o toque direto ───
    _selectAnswer(index) {
        if (!this._btns || this._btns.length === 0 || this.respondeu) return;

        const total = this._btns.length;
        this._selectedIndex = ((index % total) + total) % total;

        this._btns.forEach((btn, i) => {
            if (i === this._selectedIndex) {
                btn.drawBg(0xfde8a0, 0x8b5a2b);
            } else {
                btn.drawBg(0xffffff, 0x8b5a2b);
            }
            btn.t.setColor('#111111');
        });
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

        // Troca para um modo de leitura: a explicação ganha espaço e fonte maior.
        this._btns.forEach(btn => {
            btn.g.setVisible(false);
            btn.t.setVisible(false);
            btn.zone.setVisible(false);
        });
        if (this._instructionTxt) this._instructionTxt.setVisible(false);
        this._questionTxt.setVisible(false);

        // Feedback textual
        if (this._acertou) {
            this._feedbackTxt.setText('✔  CORRETO!').setColor('#004400');
            this._sndCorrect();
        } else {
            this._feedbackTxt.setText(`✘  QUASE!\nResposta correta: ${this.alternativas[this.correta]}`).setColor('#662200');
            this._sndWrong();
        }
        this._feedbackTxt.setVisible(true);
        this._explicacaoTxt.setText(this.explicacao).setVisible(true);
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
