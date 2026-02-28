class HUDScene extends Phaser.Scene {
    constructor() { super({ key: 'HUDScene' }); }

    init(data) {
        this.gameScene = data.gameScene;
    }

    create() {
        const W = this.scale.width;

        const style = { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
                        stroke: '#000000', strokeThickness: 3 };

        // ── Score ─────────────────────────────────────────────────────────────
        this.add.text(8, 4, 'PONTOS', style);
        this.scoreTxt = this.add.text(8, 14, '000000', style);

        // ── Vidas (corações) ──────────────────────────────────────────────────
        this.heartIcons = [];
        for (let i = 0; i < LIVES_START; i++) {
            const h = this.add.image(W/2 - (LIVES_START * 16)/2 + i * 16 + 8, 8, 'heart')
                          .setOrigin(0.5, 0);
            this.heartIcons.push(h);
        }

        // ── Fase / Tempo ──────────────────────────────────────────────────────
        // Mantém a coluna de tempo à direita ("TEMPO" + número) e coloca o nome
        // do lugar imediatamente à esquerda para não sobrepor.
        const placeRightX = W - 48;
        this.add.text(placeRightX, 4, 'Termas de Lindoia', style).setOrigin(1, 0);
        this.add.text(placeRightX, 14, 'FASE 1-1', style).setOrigin(1, 0);

        this.add.text(W - 36, 4, 'TEMPO', style).setOrigin(0, 0);
        this.timeTxt = this.add.text(W - 28, 14, '000', style).setOrigin(0, 0);

        // ── Ouvir eventos do GameScene ────────────────────────────────────────
        this.gameScene.events.on('scoreChanged', (v) => {
            this.scoreTxt.setText(String(v).padStart(6, '0'));
        });
        this.gameScene.events.on('livesChanged', (v) => {
            this.heartIcons.forEach((h, i) => h.setAlpha(i < v ? 1 : 0.2));
        });
    }

    update() {
        if (!this.gameScene) return;
        const t = this.gameScene.gameTime;
        this.timeTxt.setText(String(t).padStart(3, '0'));
    }
}
