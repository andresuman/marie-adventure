# A Aventura de Marie Curie

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
- Desvie das capivaras pulando por cima — cada passagem limpa vale **+100 × multiplicador** de combo.
- Pisar em uma capivara perde os pontos acumulados no combo atual e zera o multiplicador.
- Encostar de lado em uma capivara custa uma vida e zera o multiplicador.
- O jogo termina ao perder todas as 3 vidas ou ao esgotar o tempo.

## Áudio

- **SFX** (pulo, passar sobre capivara, dano, vitória) ativos por padrão em todos os navegadores.
- **Música de fundo** — valsa original em Fá maior, estilo salão anos 1920. Desligada por padrão; ative pelo botão **♪ MÚSICA** na tela inicial antes de jogar.

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
│   └── GameTheme.js        # Melodia da fase (valsa original em Fá maior, estilo anos 1920)
├── assets/                 # Sprites e cenário (PNG)
└── docs/                   # Referências visuais e spritesheets originais
```

## Licença

[MIT](LICENSE) — Andre Suman Pereira, 2026.
Contribuições são bem-vindas — veja o [guia de contribuição](CONTRIBUTING.md).

## Créditos

- Engine: [Phaser 3](https://phaser.io/) v3.60
