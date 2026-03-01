class WinScene extends Phaser.Scene {
    constructor() { super({ key: 'WinScene' }); }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalTime  = data.time  || 0;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Overlay verde-escuro
        this.add.rectangle(W/2, H/2, W, H, 0x002210, 0.88);

        const txt = (x, y, str, style) =>
            this.add.text(x, y, str, { fontFamily: 'monospace', resolution: 2, ...style })
                .setOrigin(0.5);

        txt(W/2, H/2 - 88, 'VOCÊ CHEGOU!', {
            fontSize: '22px',
            color: '#aaff44',
            stroke: '#000000',
            strokeThickness: 6
        });

        txt(W/2, H/2 - 62, 'Marie tomou sua água mineral!', {
            fontSize: '10px',
            color: '#ffe040',
            stroke: '#000000',
            strokeThickness: 3
        });

        txt(W/2, H/2 - 36, `PONTUAÇÃO   ${String(this.finalScore).padStart(6, '0')}`, {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        const m = Math.floor(this.finalTime / 60);
        const s = this.finalTime % 60;
        txt(W/2, H/2 - 18, `TEMPO RESTANTE  ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        txt(W/2, H/2 + 8, '100 anos da visita de Marie Curie', {
            fontSize: '9px',
            color: '#66ccff',
            stroke: '#000000',
            strokeThickness: 2
        });
        txt(W/2, H/2 + 22, 'Águas de Lindóia  •  1926 – 2026', {
            fontSize: '9px',
            color: '#66ccff',
            stroke: '#000000',
            strokeThickness: 2
        });

        const btn = txt(W/2, H/2 + 55, '▶  JOGAR NOVAMENTE', {
            fontSize: '12px',
            color: '#111111',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#aaff44',
            padding: { x: 14, y: 7 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover',  () => btn.setBackgroundColor('#ffffff'));
        btn.on('pointerout',   () => btn.setBackgroundColor('#aaff44'));
        btn.on('pointerdown',  () => this.scene.start('GameScene'));

        txt(W/2, H/2 + 90, 'Desenvolvido por Andre Suman  |  @andresuman', {
            fontSize: '8px',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 2
        });

        this.input.keyboard.once('keydown', () => this.scene.start('GameScene'));

        this.tweens.add({
            targets: btn,
            alpha: 0.5,
            duration: 550,
            yoyo: true,
            repeat: -1
        });
    }
}
