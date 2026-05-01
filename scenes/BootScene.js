class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }

    preload() {
        // Personagem
        this.load.image('marie_idle',  'assets/marie_idle.png');
        this.load.image('marie_walk1', 'assets/marie_walk1.png');
        this.load.image('marie_walk2', 'assets/marie_walk2.png');
        this.load.image('marie_walk3', 'assets/marie_walk3.png');
        this.load.image('marie_walk4', 'assets/marie_walk4.png');

        // Inimigos
        this.load.image('capy_walk1', 'assets/capy_walk1.png');
        this.load.image('capy_walk2', 'assets/capy_walk2.png');
        this.load.image('capy_walk3', 'assets/capy_walk3.png');
        this.load.image('capy_flat1', 'assets/capy_flat1.png');
        this.load.image('capy_flat2', 'assets/capy_flat2.png');

        // Cenário e itens
        this.load.image('ground',  'assets/ground.png');
        this.load.image('ground2', 'assets/ground2.png');
        this.load.image('bottle',  'assets/bottle.png');
        this.load.image('bottle2', 'assets/bottle2.png');
        this.load.image('background',  'assets/background.png');
        this.load.image('background2', 'assets/background2.png');

        // Banco de perguntas do quiz educativo
        this.load.json('quiz', 'data/quiz.json');

        // Coração e frasco gerados via canvas (síncrono)
        this.makeHeart();
        this.makeVial();
    }

    create() {
        // Animações da Marie
        this.anims.create({ key: 'marie-idle',
            frames: [{ key:'marie_idle' }], frameRate:1, repeat:-1 });
        this.anims.create({ key: 'marie-walk',
            frames: [
                { key:'marie_walk1' }, { key:'marie_walk2' },
                { key:'marie_walk3' }, { key:'marie_walk4'  }
            ], frameRate:8, repeat:-1 });

        // Animações da capivara
        this.anims.create({ key: 'capy-walk',
            frames: [
                { key:'capy_walk1' }, { key:'capy_walk2' }, { key:'capy_walk3' }
            ], frameRate:6, repeat:-1 });

        this.scene.start('TitleScene');
    }

    // ── Frasco verde (coletável do quiz) gerado via canvas ────────────────────
    makeVial() {
        const tex = this.textures.createCanvas('vial', 16, 26);
        const ctx = tex.getContext();

        // Tampa dourada
        ctx.fillStyle = '#ccaa00';
        ctx.fillRect(3, 0, 10, 3);

        // Gargalo (vidro escuro)
        ctx.fillStyle = '#446644';
        ctx.fillRect(5, 3, 6, 4);

        // Corpo do frasco (vidro verde translúcido)
        ctx.fillStyle = '#226633';
        ctx.fillRect(2, 7, 12, 17);

        // Conteúdo luminoso (verde radioativo)
        ctx.fillStyle = '#44ff88';
        ctx.fillRect(3, 9, 10, 14);

        // Brilho lateral (reflexo de vidro)
        ctx.fillStyle = 'rgba(200,255,220,0.55)';
        ctx.fillRect(3, 10, 2, 10);

        // Ponto de brilho no topo do líquido
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(4, 9, 4, 1);

        tex.refresh();
    }

    // ── Coração para HUD (canvas síncrono) ───────────────────────────────────
    makeHeart() {
        const tex = this.textures.createCanvas('heart', 14, 12);
        const ctx = tex.getContext();
        const rows = [
            '.RR.RR.', 'RRRRRRR', 'RRRRRRR',
            '.RRRRR.', '..RRR..', '...R...'
        ];
        const scale = 2;
        rows.forEach((row, y) => {
            row.split('').forEach((ch, x) => {
                if (ch === 'R') { ctx.fillStyle='#e83030'; ctx.fillRect(x*scale,y*scale,scale,scale); }
            });
        });
        tex.refresh();
    }
}
