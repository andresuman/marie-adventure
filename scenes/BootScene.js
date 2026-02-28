class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }

    preload() {
        // Personagem
        this.load.image('marie_idle',  'assets/marie_idle.png');
        this.load.image('marie_walk1', 'assets/marie_walk1.png');
        this.load.image('marie_walk2', 'assets/marie_walk2.png');
        this.load.image('marie_walk3', 'assets/marie_walk3.png');
        this.load.image('marie_run',   'assets/marie_run.png');

        // Inimigos
        this.load.image('capy_walk1', 'assets/capy_walk1.png');
        this.load.image('capy_walk2', 'assets/capy_walk2.png');
        this.load.image('capy_walk3', 'assets/capy_walk3.png');
        this.load.image('capy_flat1', 'assets/capy_flat1.png');
        this.load.image('capy_flat2', 'assets/capy_flat2.png');

        // Cenário
        this.load.image('chapel', 'assets/chapel.png');
        this.load.image('ground', 'assets/ground.png');

        // Items / HUD
        this.load.image('bottle',  'assets/bottle.png');
        this.load.image('block_q', 'assets/block_q.png');

        // Gera o coração e o fundo via canvas (síncrono)
        this.makeHeart();
        this.makeBackground();
    }

    create() {
        // Animações da Marie
        this.anims.create({ key: 'marie-idle',
            frames: [{ key:'marie_idle' }], frameRate:1, repeat:-1 });
        this.anims.create({ key: 'marie-walk',
            frames: [
                { key:'marie_walk1' }, { key:'marie_walk2' },
                { key:'marie_walk3' }, { key:'marie_run'   }
            ], frameRate:8, repeat:-1 });

        // Animações da capivara
        this.anims.create({ key: 'capy-walk',
            frames: [
                { key:'capy_walk1' }, { key:'capy_walk2' }, { key:'capy_walk3' }
            ], frameRate:6, repeat:-1 });
        this.anims.create({ key: 'capy-flat',
            frames: [{ key:'capy_flat1' }], frameRate:1, repeat:-1 });

        this.scene.start('GameScene');
    }

    // ── Coração para HUD (canvas síncrono) ───────────────────────────────────
    makeHeart() {
        var tex = this.textures.createCanvas('heart', 14, 12);
        var ctx = tex.getContext();
        var rows = [
            '.RR.RR.', 'RRRRRRR', 'RRRRRRR',
            '.RRRRR.', '..RRR..', '...R...'
        ];
        var scale = 2;
        rows.forEach(function(row, y) {
            row.split('').forEach(function(ch, x) {
                if (ch === 'R') { ctx.fillStyle='#e83030'; ctx.fillRect(x*scale,y*scale,scale,scale); }
            });
        });
        tex.refresh();
    }

    // ── Fundo 960×270: céu + colinas + nuvens (canvas síncrono) ──────────────
    makeBackground() {
        var W = 960, H = 270;
        var tex = this.textures.createCanvas('bg', W, H);
        var ctx = tex.getContext();

        // Céu gradiente
        var sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0,   '#2a58d8');
        sky.addColorStop(0.5, '#5090f8');
        sky.addColorStop(1,   '#90c4ff');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

        // Nuvens
        [
            [60,40,22], [240,28,28], [430,48,18],
            [620,33,25],[820,46,20]
        ].forEach(function(c) { drawCloud(ctx, c[0], c[1], c[2]); });

        // Colinas (3 camadas)
        [
            { y:230, amp:55, freq:0.0025, color:'#1a501a' },
            { y:242, amp:42, freq:0.0040, color:'#226022' },
            { y:252, amp:32, freq:0.0060, color:'#2e7c2e' },
        ].forEach(function(l) {
            ctx.fillStyle = l.color;
            ctx.beginPath(); ctx.moveTo(0, l.y);
            for (var x=0; x<=W; x+=4)
                ctx.lineTo(x, l.y - Math.abs(Math.sin(x*l.freq*Math.PI))*l.amp);
            ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
        });

        // Árvores de fundo
        var seed=7;
        function rng(){ seed=(seed*1664525+1013904223)&0xffffffff; return (seed>>>0)/0xffffffff; }
        var tx=20;
        while(tx < W+30){
            var th=30+rng()*20, tw=14+rng()*10;
            ctx.fillStyle=['#0d3d0d','#1a5c1a','#226022','#2a7a2a'][Math.floor(rng()*4)];
            ctx.beginPath(); ctx.arc(tx, 240-th, tw, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle='#3a1e08'; ctx.fillRect(tx-3, 240-th+tw-4, 6, 16);
            tx += tw*1.5 + rng()*15;
        }

        ctx.fillStyle = '#3a9c3a';
        ctx.fillRect(0, 258, W, H-258);

        tex.refresh();
    }
}

function drawCloud(ctx, x, y, r) {
    ctx.fillStyle='rgba(160,190,230,0.3)';
    ctx.beginPath(); ctx.ellipse(x+r*0.6, y+r*0.7, r*2.2, r*0.4, 0, 0, Math.PI*2); ctx.fill();
    [
        [0, 0, 0.85], [1, -0.35, 1.0], [2, 0, 0.9],
        [0.5, 0.25, 0.75], [1.5, 0.2, 0.75]
    ].forEach(function(b) {
        ctx.fillStyle='#ffffff';
        ctx.beginPath(); ctx.arc(x+r*b[0], y+r*b[1], r*b[2], 0, Math.PI*2); ctx.fill();
    });
}
