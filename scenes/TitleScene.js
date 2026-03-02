class TitleScene extends Phaser.Scene {
    constructor() { super({ key: 'TitleScene' }); }

    _ensureMusicStarted() {
        try {
            if (!window.MusicManager) return;
            if (window.GAME_SETTINGS && window.GAME_SETTINGS.musicEnabled === false) return;
            // Só inicia uma vez (e evita retrigger em hover/click repetidos)
            if (!window.MusicManager.isPlaying('game-theme')) {
                window.MusicManager.play('game-theme', { loop: true });
            }
        } catch (e) {}
    }

    async _ensureAudioUnlocked() {
        // Browsers mobile exigem um gesto do usuário antes de reproduzir qualquer WebAudio.
        // Este desbloqueio é apenas para SFX; não inicia a música.
        try {
            if (window.AudioUnlock && window.AudioUnlock.unlock) {
                await window.AudioUnlock.unlock();
            }
        } catch (e) {}
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Fundo: imagem do jogo com overlay escuro
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.add.rectangle(W/2, H/2, W, H, 0x000a1a, 0.82);

        const txt = (x, y, str, style) =>
            this.add.text(x, y, str, { fontFamily: 'monospace', resolution: 3, ...style })
                .setOrigin(0.5);

        // Título
        txt(W/2, 28, 'A AVENTURA DE MARIE CURIE', {
            fontSize: '22px',
            color: '#ffe040',
            stroke: '#000000',
            strokeThickness: 6
        });

        txt(W/2, 57, 'Thermas de Lindóia  •  1926', {
            fontSize: '11px',
            color: '#66ccff',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Objetivo
        txt(W/2, 90, 'Chegue à garrafa desviando das capivaras.', {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        txt(W/2, 108, 'Passagens limpas valem mais pontos!', {
            fontSize: '12px',
            color: '#ffe040',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Botão jogar
        const btn = txt(W/2, 170, '▶  JOGAR', {
            fontSize: '16px',
            color: '#111111',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#ffe040',
            padding: { x: 22, y: 9 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover',  () => btn.setBackgroundColor('#ffffff'));
        btn.on('pointerout',   () => btn.setBackgroundColor('#ffe040'));
        btn.on('pointerdown',  () => {
            this._ensureAudioUnlocked();
            this._ensureMusicStarted();
            this.scene.start('GameScene');
        });

        // Botão de música: ícone desenhado (caixinha + ondas / X) + label
        const musicOn = () => window.GAME_SETTINGS.musicEnabled;
        const swY = 216;
        const ix  = W / 2 - 47; // aresta esquerda do ícone

        const swLabel = txt(W / 2 + 20, swY, 'MÚSICA', {
            fontSize: '14px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
        });
        const swIcon = this.add.graphics();

        const drawMusicBtn = (on) => {
            swIcon.clear();
            const hex = on ? 0xffffff : 0x888888;

            const hornPts = [
                { x: ix + 6,  y: swY - 5 },
                { x: ix + 16, y: swY - 8 },
                { x: ix + 16, y: swY + 8 },
                { x: ix + 6,  y: swY + 5 },
            ];

            // Formas sólidas (preenchimento)
            swIcon.fillStyle(hex, 1);
            swIcon.fillRect(ix, swY - 5, 6, 10);
            swIcon.fillPoints(hornPts, true);

            // Contorno preto (harmônico com o strokeThickness dos textos)
            swIcon.lineStyle(2, 0x000000, 1);
            swIcon.strokeRect(ix, swY - 5, 6, 10);
            swIcon.strokePoints(hornPts, true);

            if (on) {
                // Ondas sonoras: preto por baixo (mais espesso), cor por cima
                swIcon.lineStyle(4, 0x000000, 1);
                swIcon.beginPath();
                swIcon.arc(ix + 16, swY, 5, -Math.PI * 0.4, Math.PI * 0.4, false);
                swIcon.strokePath();
                swIcon.beginPath();
                swIcon.arc(ix + 16, swY, 10, -Math.PI * 0.4, Math.PI * 0.4, false);
                swIcon.strokePath();

                swIcon.lineStyle(2, hex, 1);
                swIcon.beginPath();
                swIcon.arc(ix + 16, swY, 5, -Math.PI * 0.4, Math.PI * 0.4, false);
                swIcon.strokePath();
                swIcon.beginPath();
                swIcon.arc(ix + 16, swY, 10, -Math.PI * 0.4, Math.PI * 0.4, false);
                swIcon.strokePath();
            } else {
                // X de mudo: preto por baixo, cor por cima
                swIcon.lineStyle(4, 0x000000, 1);
                swIcon.beginPath();
                swIcon.moveTo(ix + 19, swY - 5);
                swIcon.lineTo(ix + 26, swY + 5);
                swIcon.strokePath();
                swIcon.beginPath();
                swIcon.moveTo(ix + 26, swY - 5);
                swIcon.lineTo(ix + 19, swY + 5);
                swIcon.strokePath();

                swIcon.lineStyle(2, hex, 1);
                swIcon.beginPath();
                swIcon.moveTo(ix + 19, swY - 5);
                swIcon.lineTo(ix + 26, swY + 5);
                swIcon.strokePath();
                swIcon.beginPath();
                swIcon.moveTo(ix + 26, swY - 5);
                swIcon.lineTo(ix + 19, swY + 5);
                swIcon.strokePath();
            }

            swLabel.setColor(on ? '#ffffff' : '#888888');
        };
        drawMusicBtn(musicOn());

        // Zona interativa generosa para mobile
        this.add.zone(W / 2 - 10, swY, 140, 36)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                window.GAME_SETTINGS.musicEnabled = !window.GAME_SETTINGS.musicEnabled;
                drawMusicBtn(musicOn());
                if (window.GAME_SETTINGS.musicEnabled) {
                    this._ensureMusicStarted();
                } else {
                    if (window.MusicManager) window.MusicManager.stop();
                }
            });

        // Crédito
        txt(W/2, 252, 'Desenvolvido por Andre Suman  |  @andresuman', {
            fontSize: '11px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Teclado também inicia
        this.input.keyboard.once('keydown', () => {
            this._ensureAudioUnlocked();
            this._ensureMusicStarted();
            this.scene.start('GameScene');
        });

        // iOS/Safari: às vezes só destrava áudio em 'pointerdown' do canvas.
        this.input.once('pointerdown', () => this._ensureAudioUnlocked());

        this.tweens.add({ targets: btn, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
}
