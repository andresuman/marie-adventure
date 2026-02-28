const GROUND_Y    = 238;
const TILE_W      = 64;
const TILE_H      = 48;
const MARIE_SCALE = 0.28;
const CAPY_SCALE  = 0.22;
const MARIE_SPEED = 140;
const JUMP_VY     = -440;
const LIVES_START = 5;
const CAPY_SPEED  = 60;

class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init() {
        this.score      = 0;
        this.lives      = LIVES_START;
        this.gameTime   = 0;
        this.dead       = false;
        this.invincible = false;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // ── Fundo (parallax) ────────────────────────────────────────────────
        this.bg = this.add.tileSprite(0, 0, W, H, 'bg')
            .setOrigin(0, 0).setScrollFactor(0).setDepth(0);

        // ── Chapel no fundo (parallax lento) ────────────────────────────────
        this.chapel = this.add.image(W * 0.72, H - 68, 'chapel')
            .setOrigin(0.5, 1)
            .setScale(0.18)
            .setScrollFactor(0.06)
            .setDepth(1);

        // ── Chão ─────────────────────────────────────────────────────────────
        this.ground = this.physics.add.staticGroup();
        this.groundRight = 0;
        this.spawnGround(0, W + 400);

        // ── Capivaras ────────────────────────────────────────────────────────
        this.capybaras = this.physics.add.group();
        this.nextCapyX = 380;

        // ── Marie Curie ──────────────────────────────────────────────────────
        // Dimensões reais do sprite idle: 192×302 → escala 0.28 → ~54×85px
        this.marie = this.physics.add.sprite(80, GROUND_Y - 50, 'marie_idle')
            .setScale(MARIE_SCALE)
            .setCollideWorldBounds(false)
            // Garante que a personagem fique sempre à frente do cenário (ex.: capela)
            .setDepth(10);

        // Body ajustado para o interior do sprite (exclui chapéu e saia)
        var mW = 192 * MARIE_SCALE * 0.55;
        var mH = 302 * MARIE_SCALE * 0.80;
        this.marie.body.setSize(
            192 * 0.55,
            302 * 0.80
        );
        this.marie.body.setOffset(192 * 0.22, 302 * 0.10);

        // ── Colisões ─────────────────────────────────────────────────────────
        this.physics.add.collider(this.marie,    this.ground);
        this.physics.add.collider(this.capybaras, this.ground);
        this.physics.add.overlap(this.marie, this.capybaras,
            this.onContact, null, this);

        // ── Câmera ───────────────────────────────────────────────────────────
        this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, H);
        this.cameras.main.startFollow(this.marie, true, 0.1, 0);

        // ── Controles ────────────────────────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd    = this.input.keyboard.addKeys('W,A,S,D');
        this.btnLeft = false; this.btnRight = false; this.btnJump = false;
        this.setupTouchControls();

        // ── Timer ────────────────────────────────────────────────────────────
        this.time.addEvent({
            delay: 1000,
            callback: () => { if (!this.dead) this.gameTime++; },
            loop: true
        });

        this.scene.launch('HUDScene', { gameScene: this });
    }

    update() {
        if (this.dead) return;

        const onGround = this.marie.body.blocked.down;
        const cam      = this.cameras.main.scrollX;

        // Parallax
        this.bg.tilePositionX = cam * 0.25;

        // ── Movimento ────────────────────────────────────────────────────────
        let vx = 0;
        const goLeft  = this.cursors.left.isDown  || this.wasd.A.isDown || this.btnLeft;
        const goRight = this.cursors.right.isDown || this.wasd.D.isDown || this.btnRight;

        if (goLeft)       { vx = -MARIE_SPEED; this.marie.setFlipX(true);  }
        else if (goRight) { vx =  MARIE_SPEED; this.marie.setFlipX(false); }

        if (this.marie.x < cam + 16) this.marie.x = cam + 16;
        this.marie.setVelocityX(vx);

        // ── Pulo ──────────────────────────────────────────────────────────────
        const jumpPressed = this.cursors.up.isDown || this.cursors.space.isDown ||
                            this.wasd.W.isDown || this.btnJump;
        if (jumpPressed && onGround) this.marie.setVelocityY(JUMP_VY);

        // ── Animação ─────────────────────────────────────────────────────────
        if (vx !== 0) this.marie.anims.play('marie-walk', true);
        else          this.marie.anims.play('marie-idle', true);

        // ── Gerar chão e inimigos ────────────────────────────────────────────
        if (this.groundRight < cam + 900) this.spawnGround(this.groundRight, this.groundRight + 500);
        if (cam + 550 > this.nextCapyX)   { this.spawnCapybara(this.nextCapyX); this.nextCapyX += Phaser.Math.Between(280, 460); }

        // ── Limpar objetos fora da tela ───────────────────────────────────────
        this.ground.getChildren().forEach(t => { if (t.x < cam - 200) t.destroy(); });
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
        this.groundRight = to;
    }

    // ── Capivara ──────────────────────────────────────────────────────────────
    spawnCapybara(x) {
        const capy = this.capybaras.create(x, GROUND_Y - 30, 'capy_walk1')
            .setScale(CAPY_SCALE)
            .setVelocityX(-CAPY_SPEED)
            // Os frames de caminhada estão virados para a direita no arquivo,
            // mas a capivara anda para a esquerda: espelha durante a caminhada.
            .setFlipX(true)
            // Inimigos também devem ficar à frente do cenário (ex.: capela)
            .setDepth(10);

        // Body: 276×200 → escala 0.22 → ~61×44px
        capy.body.setSize(276 * 0.72, 200 * 0.68);
        capy.body.setOffset(276 * 0.14, 200 * 0.22);
        capy.anims.play('capy-walk', true);
    }

    // ── Colisão Marie × Capivara ──────────────────────────────────────────────
    onContact(marie, capy) {
        if (this.invincible) return;
        const marieFeet = marie.body.bottom;
        const capyTop   = capy.body.top;

        if (marieFeet <= capyTop + 14 && marie.body.velocity.y > 0) {
            // Pisou na capivara!
            capy.anims.play('capy-flat', true);
            // Os sprites "flat" já estão na orientação correta, então remove o flip.
            capy.setFlipX(false);
            capy.setVelocityX(0);
            capy.body.enable = false;
            this.score += 100;
            this.events.emit('scoreChanged', this.score);
            marie.setVelocityY(JUMP_VY * 0.5);
            this.time.delayedCall(500, () => capy.destroy());
        } else {
            this.loseLife();
        }
    }

    // ── Perder vida ───────────────────────────────────────────────────────────
    loseLife() {
        if (this.invincible) return;
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
            c.add([bg, txt]); c.setSize(sz, sz); c.setInteractive();
            return c;
        };

        const left  = mkBtn(pad+sz/2,            H-pad-sz/2, '◄');
        const right = mkBtn(pad+sz*1.5+8,         H-pad-sz/2, '►');
        const jump  = mkBtn(W-pad-sz/2,            H-pad-sz/2, '▲');

        [[left,'btnLeft'],[right,'btnRight'],[jump,'btnJump']].forEach(([btn, prop]) => {
            btn.on('pointerdown', () => this[prop]=true);
            btn.on('pointerup',   () => this[prop]=false);
            btn.on('pointerout',  () => this[prop]=false);
        });
    }
}
