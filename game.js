const GAME_WIDTH  = 480;
const GAME_HEIGHT = 270;

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
    scene: [BootScene, GameScene, HUDScene, GameOverScene]
};

new Phaser.Game(config);
