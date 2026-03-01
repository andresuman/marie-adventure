class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalTime  = data.time  || 0;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Overlay escuro azul-marinho
        this.add.rectangle(W/2, H/2, W, H, 0x001030, 0.88);

        const txt = (x, y, str, style) =>
            this.add.text(x, y, str, { fontFamily: 'monospace', resolution: 2, ...style })
                .setOrigin(0.5);

        // Título
        txt(W/2, H/2 - 88, 'FIM DE JOGO', {
            fontSize: '22px',
            color: '#ffe040',
            stroke: '#000000',
            strokeThickness: 6
        });

        // Subtítulo
        txt(W/2, H/2 - 62, 'As capivaras venceram dessa vez...', {
            fontSize: '10px',
            color: '#ff8844',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Pontuação
        txt(W/2, H/2 - 36, `PONTUAÇÃO   ${String(this.finalScore).padStart(6, '0')}`, {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        txt(W/2, H/2 - 18, `TEMPO       ${String(this.finalTime).padStart(3, '0')} s`, {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Crédito comemorativo
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

        // Botão jogar de novo
        const btn = txt(W/2, H/2 + 55, '▶  JOGAR NOVAMENTE', {
            fontSize: '12px',
            color: '#111111',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#ffdd00',
            padding: { x: 14, y: 7 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover',  () => btn.setBackgroundColor('#ffffff'));
        btn.on('pointerout',   () => btn.setBackgroundColor('#ffdd00'));
        btn.on('pointerdown',  () => this.scene.start('GameScene'));

        // Créditos
        txt(W/2, H/2 + 90, 'Desenvolvido por Andre Suman  |  @andresuman', {
            fontSize: '8px',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Reinicia com qualquer tecla
        this.input.keyboard.once('keydown', () => this.scene.start('GameScene'));

        // Botão pisca
        this.tweens.add({
            targets: btn,
            alpha: 0.5,
            duration: 550,
            yoyo: true,
            repeat: -1
        });
    }
}
