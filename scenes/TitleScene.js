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
        txt(W/2, 90, 'Ajude Marie Curie a chegar até a garrafa de', {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });

        txt(W/2, 108, 'água Lindoya antes que o tempo acabe.', {
            fontSize: '12px',
            color: '#ffffff',
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

        // Toggle de música (switcher)
        const musicOn = () => window.GAME_SETTINGS.musicEnabled;

        const swY   = 216;
        const pillW = 46;
        const pillH = 24;
        const pillR = 12;
        const knobR = 9;
        const pillX = W / 2 + 20;  // borda esquerda da pílula (afastada do label)

        const swBg    = this.add.graphics();
        const swKnob  = this.add.graphics();
        const swLabel = txt(W / 2 - 32, swY, '♪  MÚSICA', {
            fontSize: '13px',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 2,
        });

        const drawSwitch = (on) => {
            swBg.clear();
            swBg.fillStyle(on ? 0x339955 : 0x444444, 1);
            swBg.fillRoundedRect(pillX, swY - pillH / 2, pillW, pillH, pillR);

            swKnob.clear();
            swKnob.fillStyle(on ? 0xffffff : 0x888888, 1);
            const kx = on ? pillX + pillW - knobR - 3 : pillX + knobR + 3;
            swKnob.fillCircle(kx, swY, knobR);

            swLabel.setColor(on ? '#ffffff' : '#888888');
        };
        drawSwitch(musicOn());

        // Zona de toque: cobre label + pílula (altura generosa para mobile)
        this.add.zone(W / 2 + 2, swY, 136, 44)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                window.GAME_SETTINGS.musicEnabled = !window.GAME_SETTINGS.musicEnabled;
                drawSwitch(musicOn());
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
