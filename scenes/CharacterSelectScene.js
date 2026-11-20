// Tela de escolha de personagem — entre TitleScene e GameScene.
// O jogo é o mesmo para todos; só o personagem muda (sprite + animação).
// A escolha é salva no registry para sobreviver ao restart de GameOver/WinScene,
// que voltam direto para GameScene sem passar por aqui.
class CharacterSelectScene extends Phaser.Scene {
    constructor() { super({ key: 'CharacterSelectScene' }); }

    create() {
        const W = this.scale.width;

        // Fundo + overlay escuro (mesmo padrão da TitleScene)
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.add.rectangle(W / 2, this.scale.height / 2, W, this.scale.height, 0x000a1a, 0.82);

        const txt = (x, y, str, style) =>
            this.add.text(x, y, str, { fontFamily: 'monospace', resolution: 3, ...style })
                .setOrigin(0.5);

        // Título
        txt(W / 2, 20, 'ESCOLHA SEU PERSONAGEM', {
            fontSize: '20px',
            color: '#ffe040',
            stroke: '#000000',
            strokeThickness: 5
        });

        // Voltar para a tela inicial
        const back = txt(10, 10, '← VOLTAR', {
            fontSize: '9px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        back.on('pointerover', () => back.setColor('#ffffff'));
        back.on('pointerout',  () => back.setColor('#cccccc'));
        back.on('pointerdown', () => this.scene.start('TitleScene'));

        // ── Personagens (mesmo conteúdo do protótipo character-select.html) ──
        // Rafinha usa escala menor no card: o carrinho é largo (335px), os outros têm ~190px.
        const CHARACTERS = [
            { key: 'marie', name: 'MARIE CURIE',   desc: 'Duas vezes Prêmio Nobel, de Física e de Química.', tag: '▶ SELECIONADA ◀', idle: 'marie_idle', scale: 0.30 },
            { key: 'andre', name: 'ANDRÉ SUMAN',   desc: 'Torcedor do Baltimore Ravens.',                   tag: '▶ SELECIONADO ◀',  idle: 'andre_idle', scale: 0.30 },
            { key: 'thais', name: 'THAIS GORZALKA', desc: 'Química e maratonista.',                        tag: '▶ SELECIONADA ◀', idle: 'thais_idle', scale: 0.30 },
            { key: 'rafinha', name: 'RAFINHA',     desc: 'Fã de Ray Conniff.',                            tag: '▶ SELECIONADO ◀',  idle: 'rafinha_idle', scale: 0.24 },
        ];
        const CARD_W = 110, CARD_H = 180, CARD_Y = 128;
        const CARD_XS = [60, 178, 296, 414];

        this._cards = [];
        CHARACTERS.forEach((ch, i) => {
            const cx = CARD_XS[i];
            const container = this.add.container(cx, 0);

            // Fundo do card: painel escuro, borda branca; amarela quando selecionado
            const bg = this.add.rectangle(0, CARD_Y, CARD_W, CARD_H, 0x000a1a, 0.85);
            bg.setStrokeStyle(3, 0xffffff);
            container.add(bg);

            const sprite = this.add.image(0, 88, ch.idle).setScale(ch.scale);
            container.add(sprite);

            const name = txt(0, 146, ch.name, {
                fontSize: '11px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            });
            container.add(name);

            const desc = this.add.text(0, 160, ch.desc, {
                fontFamily: 'monospace', fontSize: '9px', resolution: 3,
                color: '#ffffff', stroke: '#000000', strokeThickness: 3,
                align: 'center', wordWrap: { width: CARD_W - 16 }, lineSpacing: 2,
            }).setOrigin(0.5, 0);
            container.add(desc);

            const tag = txt(0, 206, ch.tag, {
                fontSize: '9px',
                color: '#ffe040',
                stroke: '#000000',
                strokeThickness: 3
            }).setVisible(false);
            container.add(tag);

            // Zona clicável do card inteiro
            const zone = this.add.zone(0, CARD_Y, CARD_W, CARD_H)
                .setInteractive({ useHandCursor: true });
            zone.on('pointerdown', () => this._select(i));
            zone.on('pointerover', () => { if (this._selected !== i) bg.setStrokeStyle(3, 0x66ccff); });
            zone.on('pointerout',  () => { if (this._selected !== i) bg.setStrokeStyle(3, 0xffffff); });
            container.add(zone);

            this._cards.push({ key: ch.key, bg, tag, container });
        });

        // Botão começar (mesmo estilo do JOGAR da TitleScene)
        const btn = txt(W / 2, 244, '▶  COMEÇAR AVENTURA', {
            fontSize: '14px',
            color: '#111111',
            stroke: '#000000',
            strokeThickness: 1,
            backgroundColor: '#ffe040',
            padding: { x: 20, y: 8 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setBackgroundColor('#ffffff'));
        btn.on('pointerout',  () => btn.setBackgroundColor('#ffe040'));
        btn.on('pointerdown', () => this._startGame());

        this.tweens.add({ targets: btn, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });

        // Teclado: setas trocam o personagem, Enter começa, Esc volta
        this.input.keyboard.on('keydown-LEFT',  () => this._select((this._selected + 3) % 4));
        this.input.keyboard.on('keydown-RIGHT', () => this._select((this._selected + 1) % 4));
        this.input.keyboard.on('keydown-ENTER', () => this._startGame());
        this.input.keyboard.on('keydown-ESC',   () => this.scene.start('TitleScene'));

        // Marie pré-selecionada (igual ao protótipo)
        this._select(0);
    }

    _select(i) {
        this._selected = i;
        this._cards.forEach((card, j) => {
            const selected = j === i;
            card.bg.setStrokeStyle(3, selected ? 0xffe040 : 0xffffff);
            card.tag.setVisible(selected);
            // Card selecionado sobe 4px (mesmo efeito do protótipo)
            card.container.setY(selected ? -4 : 0);
        });
    }

    _startGame() {
        const key = this._cards[this._selected].key;
        // Salva no registry: GameOver/WinScene reiniciam direto na GameScene,
        // então a escolha precisa sobreviver sem passar por esta cena.
        this.registry.set('character', key);
        this.scene.start('GameScene', { level: 1, character: key });
    }
}
