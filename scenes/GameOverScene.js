class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalTime  = data.time  || 0;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Fundo escurecido
        const bg = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.75);

        // Título
        this.add.text(W/2, H/2 - 70, 'FIM DE JOGO', {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#ff4444',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);

        // Subtítulo temático
        this.add.text(W/2, H/2 - 38, 'As capivaras venceram dessa vez...', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#ffddaa',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Pontuação
        this.add.text(W/2, H/2 - 10, `Pontuação: ${String(this.finalScore).padStart(6,'0')}`, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(W/2, H/2 + 10, `Tempo: ${this.finalTime}s`, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Crédito comemorativo
        this.add.text(W/2, H/2 + 36, '100 anos da visita de Marie Curie', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#aaddff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add.text(W/2, H/2 + 50, 'Águas de Lindóia • 1926 – 2026', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#aaddff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Botão jogar de novo
        const btn = this.add.text(W/2, H/2 + 80, '[ JOGAR NOVAMENTE ]', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 3,
            backgroundColor: '#333300',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover',  () => btn.setColor('#ffffff'));
        btn.on('pointerout',   () => btn.setColor('#ffff00'));
        btn.on('pointerdown',  () => this.scene.start('GameScene'));

        // Créditos
        this.add.text(W/2, H/2 + 104, 'Desenvolvido por: Andre Suman | @andresuman', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Também reinicia com qualquer tecla
        this.input.keyboard.once('keydown', () => this.scene.start('GameScene'));

        // Animação piscando no botão
        this.tweens.add({
            targets: btn,
            alpha: 0.4,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
    }
}
