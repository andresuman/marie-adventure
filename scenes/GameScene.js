const GROUND_Y    = 238;
const TILE_W      = 64;
const TILE_H      = 48;
const MARIE_SCALE = 0.28;
const CAPY_SCALE  = 0.22;
const MARIE_SPEED = 140;
const JUMP_VY     = -440;
const LIVES_START = 3;
const CAPY_SPEED  = 60;
const LEVEL_WIDTH = 1946;   // largura exata do background.png
const TIME_START  = 60;     // 1 minuto em segundos

class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init() {
        this.score      = 0;
        this.lives      = LIVES_START;
        this.gameTime   = TIME_START;
        this.dead       = false;
        this.invincible = false;
    }

    create() {
        const H = this.scale.height;

        // ── Fundo (imagem estática de largura fixa) ──────────────────────────
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDepth(0);

        // ── Chão (gerado de uma vez para toda a fase) ─────────────────────────
        this.ground = this.physics.add.staticGroup();
        this.spawnGround(0, LEVEL_WIDTH);

        // ── Capivaras ────────────────────────────────────────────────────────
        this.capybaras = this.physics.add.group();
        this.nextCapyX = 380;

        // ── Garrafa (objetivo final) ──────────────────────────────────────────
        const bottleScale = 0.15;            // 316×718 → ~47×108 px (um pouco maior que Marie)
        const bottleX     = LEVEL_WIDTH - 80;
        const bottleY     = GROUND_Y - (718 * bottleScale) / 2 + 6;
        this.bottle = this.physics.add.staticSprite(bottleX, bottleY, 'bottle')
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
        this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, H);
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
                if (this.gameTime <= 0) this.triggerGameOver();
            },
            loop: true
        });

        this.scene.launch('HUDScene', { gameScene: this });
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
        if (this.marie.x < cam + 16)         this.marie.x = cam + 16;
        if (this.marie.x > LEVEL_WIDTH - 20) this.marie.x = LEVEL_WIDTH - 20;
        this.marie.setVelocityX(vx);

        // ── Pulo ──────────────────────────────────────────────────────────────
        const jumpPressed = this.cursors.up.isDown || this.cursors.space.isDown ||
                            this.wasd.W.isDown || this.btnJump;
        if (jumpPressed && onGround) { this.marie.setVelocityY(JUMP_VY); this.sndJump(); }

        // ── Animação ─────────────────────────────────────────────────────────
        if (vx !== 0) this.marie.anims.play('marie-walk', true);
        else          this.marie.anims.play('marie-idle', true);

        // ── Gerar capivaras (até a zona da garrafa) ──────────────────────────
        if (cam + 550 > this.nextCapyX && this.nextCapyX < LEVEL_WIDTH - 300) {
            this.spawnCapybara(this.nextCapyX);
            this.nextCapyX += Phaser.Math.Between(280, 460);
        }

        // ── Limpar capivaras fora da tela ─────────────────────────────────────
        this.capybaras.getChildren().forEach(c => { if (c.x < cam - 200) c.destroy(); });

        // ── Caiu no buraco ────────────────────────────────────────────────────
        if (this.marie.y > this.scale.height + 60) this.loseLife();
    }

    // ── Chão ─────────────────────────────────────────────────────────────────
    spawnGround(from, to) {
        for (let x = from; x < to; x += TILE_W) {
            const tile = this.ground.create(x + TILE_W/2, GROUND_Y + TILE_H/2, 'ground');
            tile.setDisplaySize(TILE_W, TILE_H).refreshBody();
        }
    }

    // ── Capivara ──────────────────────────────────────────────────────────────
    spawnCapybara(x) {
        const capy = this.capybaras.create(x, GROUND_Y - 30, 'capy_walk1')
            .setScale(CAPY_SCALE)
            .setVelocityX(-CAPY_SPEED)
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
            // Pulou em cima da capivara!
            const visualBottom = capy.y + capy.displayHeight / 2;
            capy.anims.stop();
            capy.setTexture(Phaser.Math.RND.pick(['capy_flat1', 'capy_flat2']));
            capy.setVelocityX(0);
            capy.body.enable = false;
            capy.y = visualBottom - capy.displayHeight / 2;
            this.sndStomp();

            this.score += 100;
            this.events.emit('scoreChanged', this.score);
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
        this.time.delayedCall(600, () => {
            this.scene.stop('HUDScene');
            this.scene.start('WinScene', { score: this.score, time: this.gameTime });
        });
    }

    // ── Perder vida ───────────────────────────────────────────────────────────
    loseLife() {
        if (this.invincible) return;
        this.sndHurt();
        this.lives--;
        this.events.emit('livesChanged', this.lives);

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
