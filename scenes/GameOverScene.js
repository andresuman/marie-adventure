class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    init(data) {
        this.finalScore  = data.score || 0;
        this.isNewRecord = window.HighScore ? window.HighScore.check(this.finalScore) : false;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.add.rectangle(W/2, H/2, W, H, 0x001030, 0.90);

        const txt = (x, y, str, style) =>
            this.add.text(x, y, str, { fontFamily: 'monospace', resolution: 3, ...style })
                .setOrigin(0.5);

        txt(W/2, 30, 'FIM DE JOGO', {
            fontSize: '28px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 6
        });

        txt(W/2, 62, 'Marie não chegou à água desta vez...', {
            fontSize: '13px',
            color: '#ff8844',
            stroke: '#000000',
            strokeThickness: 4
        });

        txt(W/2, 105, `PONTUAÇÃO   ${String(this.finalScore).padStart(5, '0')}`, {
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        if (this.isNewRecord) {
            txt(W/2, 130, '★  NOVO RECORDE!  ★', {
                fontSize: '13px',
                color: '#ffdd00',
                stroke: '#000000',
                strokeThickness: 4
            });
        } else {
            const hs = window.HighScore ? window.HighScore.get() : 0;
            txt(W/2, 130, `RECORDE   ${String(hs).padStart(5, '0')}`, {
                fontSize: '12px',
                color: '#aaaaaa',
                stroke: '#000000',
                strokeThickness: 3
            });
        }

        const btn = txt(W/2, 175, '▶  JOGAR NOVAMENTE', {
            fontSize: '14px',
            color: '#111111',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#ffe040',
            padding: { x: 16, y: 8 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover',  () => btn.setBackgroundColor('#ffffff'));
        btn.on('pointerout',   () => btn.setBackgroundColor('#ffe040'));
        btn.on('pointerdown',  () => this.scene.start('GameScene', { level: 1 }));

        // Crédito do desenvolvedor
        txt(W/2, 252, 'Desenvolvido por Andre Suman  |  @andresuman', {
            fontSize: '11px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Delay evita restart acidental por tecla ainda pressionada no fim do jogo
        this.time.delayedCall(1200, () => {
            this.input.keyboard.once('keydown', () => this.scene.start('GameScene', { level: 1 }));
        });

        this.tweens.add({ targets: btn, alpha: 0.5, duration: 550, yoyo: true, repeat: -1 });
    }
}
