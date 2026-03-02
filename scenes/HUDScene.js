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

        // ── Tempo regressivo (MM:SS) ──────────────────────────────────────────
        this.add.text(W - 4, 4, 'TEMPO', style).setOrigin(1, 0);
        this.timeTxt = this.add.text(W - 4, 14, '01:00', style).setOrigin(1, 0);

        // ── Multiplicador de combo ────────────────────────────────────────────
        // Cor inicial cinza: ×1 significa "sem combo ativo"; fica amarelo quando combo > 1.
        this.comboTxt = this.add.text(W / 2, 21, '×1', {
            fontFamily: 'monospace', fontSize: '10px', color: '#888888',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 0);

        // ── Ouvir eventos do GameScene ────────────────────────────────────────
        this.gameScene.events.on('scoreChanged', (v) => {
            this.scoreTxt.setText(String(v).padStart(6, '0'));
        });
        this.gameScene.events.on('livesChanged', (v) => {
            this.heartIcons.forEach((h, i) => h.setAlpha(i < v ? 1 : 0.2));
        });
        this.gameScene.events.on('timeChanged', (v) => {
            this.timeTxt.setText(this._fmt(v));
            // Pisca vermelho no último 20 segundos
            this.timeTxt.setColor(v <= 20 ? '#ff4444' : '#ffffff');
        });
        this.gameScene.events.on('comboChanged', (v) => {
            this.comboTxt.setText(`×${v}`);
            // Destaque visual quando o multiplicador sobe
            this.comboTxt.setColor(v > 1 ? '#ffdd00' : '#888888');
        });
    }

    _fmt(secs) {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}
