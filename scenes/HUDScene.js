class HUDScene extends Phaser.Scene {
    constructor() { super({ key: 'HUDScene' }); }

    init(data) {
        this.gameScene = data.gameScene;
        this.level     = data.level || 1;
    }

    create() {
        const W = this.scale.width;

        const style = { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
                        stroke: '#000000', strokeThickness: 3 };

        // ── Score + estrela de acertos (coluna esquerda) ─────────────────────
        this.add.text(8, 4, 'PONTOS', style);
        this.scoreTxt = this.add.text(8, 14, '00000', style);
        this.comboTxt = this.add.text(8, 24, '★0', {
            fontFamily: 'monospace', fontSize: '11px', color: '#888888',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0, 0);

        // ── Vidas (corações) — centro da tela ────────────────────────────────
        this.heartIcons = [];
        for (let i = 0; i < LIVES_START; i++) {
            const h = this.add.image(W/2 - (LIVES_START * 16)/2 + i * 16 + 8, 8, 'heart')
                          .setOrigin(0.5, 0);
            this.heartIcons.push(h);
        }

        // ── Tempo regressivo (MM:SS) ──────────────────────────────────────────
        this.add.text(W - 4, 4, 'TEMPO', style).setOrigin(1, 0);
        this.timeTxt = this.add.text(W - 4, 14, '01:00', style).setOrigin(1, 0);

        // ── Estado inicial: lê direto do gameScene para refletir dados carregados de fase anterior ──
        // Eventos só disparam em mudanças — sem isso pontos e vidas ficam zerados até o primeiro evento.
        this.scoreTxt.setText(String(this.gameScene.score).padStart(5, '0'));
        this.heartIcons.forEach((h, i) => h.setAlpha(i < this.gameScene.lives ? 1 : 0.2));

        // ── Ouvir eventos do GameScene ────────────────────────────────────────
        this.gameScene.events.on('scoreChanged', (v) => {
            this.scoreTxt.setText(String(v).padStart(5, '0'));
        });

        this.gameScene.events.on('livesChanged', (v) => {
            this.heartIcons.forEach((h, i) => h.setAlpha(i < v ? 1 : 0.2));
        });

        this.gameScene.events.on('timeChanged', (v) => {
            this.timeTxt.setText(this._fmt(v));
            this.timeTxt.setColor(v <= 10 ? '#ff4444' : '#ffffff');
        });

        this.gameScene.events.on('comboChanged', (v) => {
            // Mostra quantos acertos seguidos (combo 1 = zero acertos encadeados)
            const seguidos = v - 1;
            this.comboTxt.setText(`★${seguidos}`);

            const color = seguidos === 0 ? '#888888'
                        : seguidos <= 2  ? '#ffdd00'
                        : seguidos <= 5  ? '#ff9900'
                        :                  '#ff4444';
            this.comboTxt.setColor(color);

            if (seguidos > 0) {
                this.tweens.killTweensOf(this.comboTxt);
                this.tweens.add({
                    targets: this.comboTxt,
                    scaleX: 1.6, scaleY: 1.6,
                    duration: 120, yoyo: true,
                    onComplete: () => this.comboTxt.setScale(1),
                });
            }
        });
    }

    _fmt(secs) {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}
