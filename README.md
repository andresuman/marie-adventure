# A Aventura de Marie

Jogo 2D de plataforma em **Phaser 3** (HTML/JS puro), rodando direto no navegador — sem instalação, sem dependências de build.

Criado para celebrar os **100 anos da visita de Marie Curie a Águas de Lindóia** (1926–2026). Ajude a cientista a correr pelas ruas da cidade termal, desviar das capivaras que cruzam seu caminho e chegar até a garrafa de água Lindoya antes que o tempo acabe.

## Jogar online

**https://andresuman.github.io/marie-adventure/**

## Como jogar

| Ação | Teclado | Mobile |
|------|---------|--------|
| Andar | ← / → ou A / D | ◄ ► |
| Pular | ↑ ou W ou Espaço | ▲ |

- **Objetivo:** chegue até a garrafa de água Lindoya no fim da fase.
- Pise em cima de uma capivara para eliminá-la (+100 pontos).
- Encostar lateralmente na capivara custa uma vida.
- O jogo termina ao perder todas as 3 vidas ou ao esgotar o tempo.

## Áudio

- **SFX** (pulo, pisar na capivara, dano, vitória) ativos por padrão em todos os navegadores.
- **Música de fundo** existe no código mas está desabilitada por padrão. Para ativar via console do navegador:
  ```js
  window.GAME_SETTINGS.musicEnabled = true;
  ```

## Rodar localmente

Na raiz do projeto:

```bash
python3 -m http.server 8000
```

Abra no navegador:

```
http://localhost:8000
```

> **Dica:** se o navegador não refletir uma alteração nos arquivos `.js`, faça *hard refresh*:
> `Cmd+Shift+R` (macOS) / `Ctrl+F5` (Windows/Linux)

## Requisitos

- Qualquer navegador moderno com suporte à Web Audio API (Chrome, Firefox, Safari, Edge).
- Para rodar localmente, um servidor HTTP simples (ex.: `python3 -m http.server`).

## Estrutura

```
marie-adventure/
├── index.html              # Ponto de entrada
├── game.js                 # Configuração do Phaser e GAME_SETTINGS
├── scenes/
│   ├── BootScene.js        # Carregamento de assets e animações
│   ├── TitleScene.js       # Tela inicial
│   ├── GameScene.js        # Loop principal do jogo
│   ├── HUDScene.js         # Pontos, vidas e tempo
│   ├── GameOverScene.js    # Tela de fim de jogo
│   └── WinScene.js         # Tela de vitória
├── audio/
│   ├── AudioUnlock.js      # Desbloqueio da Web Audio API no mobile
│   ├── MusicManager.js     # Motor de música chiptune (WebAudio puro)
│   └── TardesDeLindoia.js  # Melodia da fase (waltz em Sol maior)
├── assets/                 # Sprites e cenário (PNG)
└── docs/                   # Referências visuais e spritesheets originais
```

## Créditos

- Engine: [Phaser 3](https://phaser.io/) v3.60
- Cenário: inspirado em Águas de Lindóia — Praça, Balneário Municipal, Hotel Glória, Igreja N.S. das Graças
- Desenvolvido por **Andre Suman** ([@andresuman](https://github.com/andresuman))
