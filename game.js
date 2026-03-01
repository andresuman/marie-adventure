const GAME_WIDTH  = 480;
const GAME_HEIGHT = 270;

// Configurações globais simples do jogo (pode ser alterado via console)
window.GAME_SETTINGS = window.GAME_SETTINGS || {
    // Música desligada por padrão (pode ligar depois setando para true)
    musicEnabled: false,
};

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#5c94fc',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false
        }
    },
    scene: [BootScene, TitleScene, GameScene, HUDScene, GameOverScene, WinScene]
};

new Phaser.Game(config);
