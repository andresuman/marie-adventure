const GROUND_Y    = 248;
const TILE_W      = 64;
const TILE_H      = 48;
const MARIE_SCALE = 0.28;
const CAPY_SCALE  = 0.22;
const MARIE_SPEED = 140;
const JUMP_VY     = -440;
const LIVES_START = 3;
const CAPY_SPEED  = 60;
const LEVEL_WIDTH = 1946;   // largura exata do background.png (fase 1)
const TIME_START  = 60;     // 1 minuto em segundos

// Parâmetros específicos da fase 2 (mais difícil: capivaras mais rápidas, fase mais longa)
const LEVEL_WIDTH_2 = 2972; // largura exata do background2.png
const CAPY_SPEED_2  = 85;   // capivaras 40% mais rápidas na fase 2

class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init(data) {
        this.level       = data && data.level ? data.level : 1;
        this.score       = data && data.score ? data.score : 0;  // carrega pontuação da fase anterior
        this.lives       = LIVES_START;
        this.gameTime    = TIME_START;
        this.dead        = false;
        this.invincible  = false;
        this.combo       = 1;   // multiplicador de passagem limpa
        this.comboPoints = 0;   // pontos acumulados na sequência atual (devolvidos se pisar)
    }

    create() {
        const H = this.scale.height;

        // Parâmetros que variam entre fases
        this._levelWidth = this.level === 2 ? LEVEL_WIDTH_2 : LEVEL_WIDTH;
        this._capySpeed  = this.level === 2 ? CAPY_SPEED_2  : CAPY_SPEED;
        this._bgKey      = this.level === 2 ? 'background2' : 'background';
        this._groundKey  = this.level === 2 ? 'ground2'     : 'ground';

        // ── Fundo (imagem estática de largura fixa) ──────────────────────────
        this.add.image(0, 0, this._bgKey).setOrigin(0, 0).setDepth(0);

        // ── Chão (gerado de uma vez para toda a fase) ─────────────────────────
        this.ground = this.physics.add.staticGroup();
        this.spawnGround(0, this._levelWidth);

        // ── Capivaras ────────────────────────────────────────────────────────
        this.capybaras = this.physics.add.group();

        // ── Garrafa (objetivo final) ──────────────────────────────────────────
        // Fase 1: garrafa antiga (316×718); Fase 2: garrafa Lindoya moderna (105×240)
        const bottleKey   = this.level === 2 ? 'bottle2' : 'bottle';
        const bottleH     = this.level === 2 ? 240 : 718;
        const bottleScale = this.level === 2 ? 0.48 : 0.15;
        const bottleX     = this._levelWidth - 80;
        const bottleY     = GROUND_Y - (bottleH * bottleScale) / 2 + 6;
        this.bottle = this.physics.add.staticSprite(bottleX, bottleY, bottleKey)
            .setScale(bottleScale)
            .setDepth(10);
        this.bottle.refreshBody();

        // ── Marie Curie ──────────────────────────────────────────────────────
        this.marie = this.physics.add.sprite(80, GROUND_Y - 50, 'marie_idle')
            .setScale(MARIE_SCALE)
            .setCollideWorldBounds(false)
            .setDepth(10);

        this.marie.body.setSize(192 * 0.55, 302 * 0.80);
        this.marie.body.setOffset(192 * 0.22, 302 * 0.10);

        // ── Colisões ─────────────────────────────────────────────────────────
        this.physics.add.collider(this.marie,    this.ground);
        this.physics.add.collider(this.capybaras, this.ground);
        this.physics.add.overlap(this.marie, this.capybaras,
            this.onContact, null, this);
        this.physics.add.overlap(this.marie, this.bottle,
            this.onReachBottle, null, this);

        // ── Câmera ───────────────────────────────────────────────────────────
        this.cameras.main.setBounds(0, 0, this._levelWidth, H);
        this.cameras.main.startFollow(this.marie, true, 0.1, 0);

        // ── Controles ────────────────────────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd    = this.input.keyboard.addKeys('W,A,S,D');
        this.btnLeft = false; this.btnRight = false; this.btnJump = false;

        this.input.addPointer(2);
        this.setupTouchControls();

        // ── Timer regressivo ─────────────────────────────────────────────────
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.dead) return;
                this.gameTime--;
                this.events.emit('timeChanged', this.gameTime);
                if (this.gameTime <= 0) { this.triggerGameOver(); return; }
                if (this.gameTime <= 10) this.sndTick();
            },
            loop: true
        });

        this.scene.launch('HUDScene', { gameScene: this, level: this.level });
        this._showPhaseAnnouncement();
        this._scheduleNextCapy();
    }

    update() {
        if (this.dead) return;

        const onGround = this.marie.body.blocked.down || this.marie.body.touching.down;
        const cam      = this.cameras.main.scrollX;

        // ── Movimento ────────────────────────────────────────────────────────
        let vx = 0;
        const goLeft  = this.cursors.left.isDown  || this.wasd.A.isDown || this.btnLeft;
        const goRight = this.cursors.right.isDown || this.wasd.D.isDown || this.btnRight;

        if (goLeft)       { vx = -MARIE_SPEED; this.marie.setFlipX(true);  }
        else if (goRight) { vx =  MARIE_SPEED; this.marie.setFlipX(false); }

        // Limites horizontais: não sai da fase nem fica atrás da câmera
        if (this.marie.x < cam + 16)                  this.marie.x = cam + 16;
        if (this.marie.x > this._levelWidth - 20) this.marie.x = this._levelWidth - 20;
        this.marie.setVelocityX(vx);

        // ── Pulo ──────────────────────────────────────────────────────────────
        const jumpPressed = this.cursors.up.isDown || this.cursors.space.isDown ||
                            this.wasd.W.isDown || this.btnJump;
        if (jumpPressed && onGround) { this.marie.setVelocityY(JUMP_VY); this.sndJump(); }

        // ── Animação ─────────────────────────────────────────────────────────
        if (vx !== 0) this.marie.anims.play('marie-walk', true);
        else          this.marie.anims.play('marie-idle', true);

        // ── Detectar passagem limpa + limpar capivaras fora da tela ──────────
        const marieOnGround = this.marie.body.blocked.down || this.marie.body.touching.down;
        this.capybaras.getChildren().forEach(capy => {
            // Momento em que a capivara cruza Marie: decide se pontua ou não
            if (!capy._scored && !capy._stomped && !capy._missed && capy.x < this.marie.x - 40) {
                if (!marieOnGround) {
                    // Marie estava no ar — passagem limpa válida
                    capy._scored = true;
                    const usedCombo = this.combo;
                    const pts = 100 * usedCombo;
                    this.sndCleanPass(usedCombo);
                    this.score       += pts;
                    this.comboPoints += pts;
                    this.combo++;
                    this.events.emit('scoreChanged', this.score);
                    this.events.emit('comboChanged',  this.combo);
                    this._floatText(`+${pts}`, this.marie.x, this.marie.y - 40, '#44ff88', usedCombo);
                } else {
                    // Marie estava no chão — sem pontos, não tenta novamente
                    capy._missed = true;
                }
            }
            if (capy.x < cam - 200) capy.destroy();
        });

        // ── Caiu no buraco ────────────────────────────────────────────────────
        if (this.marie.y > this.scale.height + 60) this.loseLife();
    }

    // ── Chão ─────────────────────────────────────────────────────────────────
    spawnGround(from, to) {
        for (let x = from; x < to; x += TILE_W) {
            const tile = this.ground.create(x + TILE_W/2, GROUND_Y + TILE_H/2, this._groundKey);
            tile.setDisplaySize(TILE_W, TILE_H).refreshBody();
        }
    }

    // ── Agendar próxima capivara por timer (intervalo e velocidade crescem com o tempo) ─
    _scheduleNextCapy() {
        const elapsed  = TIME_START - this.gameTime;
        const progress = elapsed / TIME_START;  // 0 no início, 1 no fim
        // Intervalo diminui de 3500ms para 1500ms ao longo da fase
        const baseDelay = Math.max(1500, 3500 - 2000 * progress);
        const delay = baseDelay + Phaser.Math.Between(-400, 400);

        this.time.delayedCall(delay, () => {
            if (this.dead) return;
            const cam    = this.cameras.main.scrollX;
            const spawnX = cam + this.scale.width + 60;
            this.spawnCapybara(spawnX);
            this._scheduleNextCapy();
        });
    }

    // ── Capivara ──────────────────────────────────────────────────────────────
    spawnCapybara(x) {
        // Velocidade cresce até 80% acima do base conforme o tempo passa
        const elapsed  = TIME_START - this.gameTime;
        const progress = elapsed / TIME_START;
        const speed    = this._capySpeed * (1 + 0.8 * progress);

        const capy = this.capybaras.create(x, GROUND_Y - 30, 'capy_walk1')
            .setScale(CAPY_SCALE)
            .setVelocityX(-speed)
            .setDepth(10);

        capy.body.setSize(276 * 0.72, 200 * 0.68);
        capy.body.setOffset(276 * 0.14, 200 * 0.22);
        capy.anims.play('capy-walk', true);
    }

    // ── Colisão Marie × Capivara ──────────────────────────────────────────────
    onContact(marie, capy) {
        // Guard: Phaser pode acionar overlap mesmo após game over — evita triggerGameOver() duplo.
        if (this.dead || this.invincible) return;
        const marieFeet = marie.body.bottom;
        const capyTop   = capy.body.top;

        if (marieFeet <= capyTop + 14 && marie.body.velocity.y > 0) {
            // Pisou na capivara — penalidade: perde os pontos do combo atual
            capy._stomped = true;
            const visualBottom = capy.y + capy.displayHeight / 2;
            capy.anims.stop();
            capy.setTexture(Phaser.Math.RND.pick(['capy_flat1', 'capy_flat2']));
            capy.setVelocityX(0);
            capy.body.enable = false;
            capy.y = visualBottom - capy.displayHeight / 2;
            this.sndStomp();

            if (this.comboPoints > 0) {
                this.score = Math.max(0, this.score - this.comboPoints);
                this._floatText(`-${this.comboPoints}`, marie.x, marie.y - 40, '#ff4444');
            }
            this.combo       = 1;
            this.comboPoints = 0;
            this.events.emit('scoreChanged', this.score);
            this.events.emit('comboChanged',  this.combo);
            marie.setVelocityY(JUMP_VY * 0.5);
            this.time.delayedCall(500, () => capy.destroy());
        } else {
            this.loseLife();
        }
    }

    // ── Chegou na garrafa! ────────────────────────────────────────────────────
    onReachBottle(marie, bottle) {
        if (this.dead) return;
        this.dead = true;
        bottle.destroy();
        marie.setVelocityX(0);
        this.sndWin();

        if (this.level === 1) {
            this.time.delayedCall(600, () => {
                this.scene.stop('HUDScene');
                this.scene.start('GameScene', { level: 2, score: this.score });
            });
        } else {
            // Fase 2 concluída — vitória final
            this.time.delayedCall(600, () => {
                this.scene.stop('HUDScene');
                this.scene.start('WinScene', { score: this.score, time: this.gameTime, level: this.level });
            });
        }
    }

    // ── Perder vida ───────────────────────────────────────────────────────────
    loseLife() {
        if (this.invincible) return;
        this.sndHurt();
        this.lives--;
        this.events.emit('livesChanged', this.lives);
        // Encostou de lado: zera o combo mas não perde pontos já ganhos
        this.combo       = 1;
        this.comboPoints = 0;
        this.events.emit('comboChanged', this.combo);

        if (this.lives <= 0) { this.triggerGameOver(); return; }

        this.invincible = true;
        this.tweens.add({
            targets: this.marie, alpha: 0.25, duration: 90,
            yoyo: true, repeat: 10,
            onComplete: () => { this.marie.setAlpha(1); this.invincible = false; }
        });

        const cam = this.cameras.main.scrollX;
        this.marie.setPosition(cam + 80, GROUND_Y - 80);
        this.marie.setVelocity(0, 0);
    }

    // ── Game Over ─────────────────────────────────────────────────────────────
    triggerGameOver() {
        this.dead = true;
        this.marie.setVelocity(0, 0);
        this.time.delayedCall(700, () => {
            this.scene.stop('HUDScene');
            this.scene.start('GameOverScene', { score: this.score, time: this.gameTime });
        });
    }

    // ── Sons (Web Audio API — sem arquivos externos) ──────────────────────────
    // ── Som de passagem limpa (square, campo de Fá maior, evolui com o combo) ──
    sndCleanPass(combo) {
        this._sfx(ac => {
            // Notas do campo harmônico de Fá maior (hexacorde de Dó a Lá) — sobe um grau a cada passagem limpa.
            // Mesmo timbre square dos outros SFX; harmonicamente compatível com a trilha em Fá maior.
            const notes = [523, 587, 659, 698, 784, 880]; // C5 D5 E5 F5 G5 A5
            const base  = notes[Math.min(combo - 1, notes.length - 1)];
            const now   = ac.currentTime;

            // "Ping" curto: nota + leve slide de um semitom para cima (brilho retro)
            const ping = (freq, t, amp) => {
                const o = ac.createOscillator(), g = ac.createGain();
                o.connect(g); g.connect(ac.destination);
                o.type = 'square';
                o.frequency.setValueAtTime(freq, now + t);
                o.frequency.exponentialRampToValueAtTime(freq * 1.06, now + t + 0.07);
                g.gain.setValueAtTime(amp, now + t);
                g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.10);
                o.start(now + t); o.stop(now + t + 0.10);
            };

            ping(base,       0,    0.14); // nota principal (sempre)
            if (combo >= 3) ping(base * 1.5, 0.08, 0.10); // quinta justa — combo médio
            if (combo >= 5) ping(base * 2,   0.15, 0.07); // oitava acima — combo alto
        });
    }

    // ── Texto flutuante de pontuação ──────────────────────────────────────────
    // usedCombo opcional: se > 1 exibe "×N" junto para reforçar o multiplicador
    _floatText(text, x, y, color, usedCombo) {
        const label = text;
        const size  = usedCombo && usedCombo >= 5 ? '18px' : usedCombo && usedCombo >= 3 ? '16px' : '14px';
        const t = this.add.text(x, y, label, {
            fontFamily: 'monospace', fontSize: size,
            color, stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(20);
        // Fica parado 500ms para a criança ler, depois sobe e some
        this.tweens.add({
            targets: t, y: y - 44, alpha: 0,
            delay: 500, duration: 700,
            onComplete: () => t.destroy(),
        });
    }

    // ── Anúncio de fase no início ─────────────────────────────────────────────
    _showPhaseAnnouncement() {
        const W   = this.scale.width;
        const H   = this.scale.height;
        const cidade = this.level === 2 ? 'Águas de Lindóia  ·  2026'
                                        : 'Thermas de Lindoya  ·  1926';

        const title = this.add.text(W / 2, H / 2 - 16, `FASE ${this.level}`, {
            fontFamily: 'monospace', fontSize: '36px',
            color: '#ffe040', stroke: '#000000', strokeThickness: 8,
        }).setOrigin(0.5).setDepth(30).setScrollFactor(0);

        const sub = this.add.text(W / 2, H / 2 + 18, cidade, {
            fontFamily: 'monospace', fontSize: '13px',
            color: '#66ccff', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(30).setScrollFactor(0);

        this.tweens.add({
            targets: [title, sub], alpha: 0,
            delay: 2800, duration: 700,
            onComplete: () => { title.destroy(); sub.destroy(); },
        });
    }

    _sfx(fn) {
        try {
            // Reutiliza o contexto SFX já desbloqueado pelo AudioUnlock.js (evita contextos duplicados)
            if (!this._ac) {
                this._ac = window.SFX_AUDIO_CONTEXT || new (window.AudioContext || window['webkitAudioContext'])();
            }
            if (this._ac.state === 'suspended') this._ac.resume();
            fn(this._ac);
        } catch (e) {}
    }

    sndJump() {
        this._sfx(ac => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'square';
            o.frequency.setValueAtTime(180, ac.currentTime);
            o.frequency.exponentialRampToValueAtTime(420, ac.currentTime + 0.10);
            g.gain.setValueAtTime(0.18, ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
            o.start(ac.currentTime); o.stop(ac.currentTime + 0.12);
        });
    }

    sndStomp() {
        this._sfx(ac => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'square';
            o.frequency.setValueAtTime(320, ac.currentTime);
            o.frequency.exponentialRampToValueAtTime(55, ac.currentTime + 0.14);
            g.gain.setValueAtTime(0.22, ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
            o.start(ac.currentTime); o.stop(ac.currentTime + 0.15);
        });
    }

    sndWin() {
        this._sfx(ac => {
            [[523, 0], [659, 0.11], [784, 0.22], [1047, 0.34]].forEach(([f, d]) => {
                const o = ac.createOscillator(), g = ac.createGain();
                o.connect(g); g.connect(ac.destination);
                o.type = 'square';
                o.frequency.value = f;
                g.gain.setValueAtTime(0.15, ac.currentTime + d);
                g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d + 0.18);
                o.start(ac.currentTime + d); o.stop(ac.currentTime + d + 0.20);
            });
        });
    }

    sndTick() {
        // Bip agudo e curto para contagem regressiva dos últimos 10 segundos
        this._sfx(ac => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'square';
            o.frequency.setValueAtTime(880, ac.currentTime);
            g.gain.setValueAtTime(0.10, ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
            o.start(ac.currentTime); o.stop(ac.currentTime + 0.06);
        });
    }

    sndHurt() {
        // Som curto de “dano”: descida rápida de frequência + ruído leve
        this._sfx(ac => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(220, ac.currentTime);
            o.frequency.exponentialRampToValueAtTime(70, ac.currentTime + 0.18);
            g.gain.setValueAtTime(0.18, ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.20);
            o.start(ac.currentTime);
            o.stop(ac.currentTime + 0.20);
        });
    }

    // ── Controles touch ───────────────────────────────────────────────────────
    setupTouchControls() {
        const W = this.scale.width;
        const H = this.scale.height;
        const sz = 48, pad = 10;

        const mkBtn = (x, y, label) => {
            const c = this.add.container(x, y).setScrollFactor(0).setDepth(20);
            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.45); bg.fillRoundedRect(-sz/2,-sz/2,sz,sz,10);
            bg.lineStyle(2, 0xffffff, 0.5); bg.strokeRoundedRect(-sz/2,-sz/2,sz,sz,10);
            const txt = this.add.text(0, 1, label, {
                fontSize:'20px', color:'#fff', fontFamily:'monospace'
            }).setOrigin(0.5);
            c.add([bg, txt]);
            c.setSize(sz, sz);
            c.setInteractive();
            return c;
        };

        const left  = mkBtn(pad+sz/2,        H-pad-sz/2, '◄');
        const right = mkBtn(pad+sz*1.5+8,    H-pad-sz/2, '►');
        const jump  = mkBtn(W-pad-sz/2,      H-pad-sz/2, '▲');

        this._touchBtns = [
            { btn: left,  prop: 'btnLeft',  pointerId: null },
            { btn: right, prop: 'btnRight', pointerId: null },
            { btn: jump,  prop: 'btnJump',  pointerId: null },
        ];

        const releasePointer = (pointer) => {
            this._touchBtns.forEach((b) => {
                if (b.pointerId === pointer.id) {
                    b.pointerId = null;
                    this[b.prop] = false;
                }
            });
        };

        this._touchBtns.forEach((b) => {
            b.btn.on('pointerdown', (pointer) => {
                if (b.pointerId !== null) return;
                b.pointerId = pointer.id;
                this[b.prop] = true;
            });
            b.btn.on('pointerout', (pointer) => releasePointer(pointer));
            b.btn.on('pointerup',  (pointer) => releasePointer(pointer));
        });

        this.input.on('pointerup',     (pointer) => releasePointer(pointer));
        this.input.on('pointercancel', (pointer) => releasePointer(pointer));
    }
}
