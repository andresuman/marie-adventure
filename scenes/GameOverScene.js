class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalTime  = data.time  || 0;
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
            color: '#ffe040',
            stroke: '#000000',
            strokeThickness: 6
        });

        txt(W/2, 62, 'As capivaras venceram dessa vez...', {
            fontSize: '13px',
            color: '#ff8844',
            stroke: '#000000',
            strokeThickness: 4
        });

        txt(W/2, 90, `PONTUAÇÃO   ${String(this.finalScore).padStart(6, '0')}`, {
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        const m = Math.floor(this.finalTime / 60);
        const s = this.finalTime % 60;
        txt(W/2, 111, `TEMPO RESTANTE   ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, {
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        // Crédito comemorativo
        txt(W/2, 138, '100 anos da visita de Marie Curie', {
            fontSize: '11px',
            color: '#66ccff',
            stroke: '#000000',
            strokeThickness: 3
        });
        txt(W/2, 153, 'Águas de Lindóia  •  1926 – 2026', {
            fontSize: '11px',
            color: '#66ccff',
            stroke: '#000000',
            strokeThickness: 3
        });

        const btn = txt(W/2, 185, '▶  JOGAR NOVAMENTE', {
            fontSize: '14px',
            color: '#111111',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#ffdd00',
            padding: { x: 16, y: 8 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover',  () => btn.setBackgroundColor('#ffffff'));
        btn.on('pointerout',   () => btn.setBackgroundColor('#ffdd00'));
        btn.on('pointerdown',  () => this.scene.start('GameScene'));

        // Crédito do desenvolvedor
        txt(W/2, 228, 'Desenvolvido por Andre Suman  |  @andresuman', {
            fontSize: '11px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
        });

        this.input.keyboard.once('keydown', () => this.scene.start('GameScene'));

        this.tweens.add({ targets: btn, alpha: 0.5, duration: 550, yoyo: true, repeat: -1 });
    }
}
