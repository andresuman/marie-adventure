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
        // Mobile browsers require a user gesture before any WebAudio can play.
        // This unlock is for SFX only; it does NOT start music.
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
        txt(W/2, 90, 'Ajude Marie a chegar até a garrafa de', {
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
        const btn = txt(W/2, 185, '▶  JOGAR', {
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

        // Dev
        txt(W/2, 228, 'Desenvolvido por Andre Suman  |  @andresuman', {
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
        // Aqui destravamos apenas o WebAudio (SFX). Música continua desligada por padrão.
        this.input.once('pointerdown', () => this._ensureAudioUnlocked());

        this.tweens.add({ targets: btn, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
}
