# A Aventura de Marie Curie

Jogo 2D de plataforma em **Phaser 3** (HTML/JS puro), rodando direto no navegador — sem instalação, sem dependências de build.

Criado para celebrar os **100 anos da visita de Marie Curie a Águas de Lindóia** (1926–2026). Ajude a cientista a correr pelas ruas da cidade termal, desviar das capivaras que cruzam seu caminho e chegar até a garrafa de água antes que o tempo acabe — em **duas fases**: Thermas de Lindoya (1926) e Águas de Lindóia (2026).

## Jogar online

**https://andresuman.github.io/marie-adventure/**

## Como jogar

| Ação | Teclado | Mobile |
|------|---------|--------|
| Andar | ← / → ou A / D | ◄ ► |
| Pular | ↑ ou W ou Espaço | ▲ |

- **Objetivo:** chegue até a garrafa de água no fim de cada fase antes do tempo acabar.
- Desvie das capivaras pulando por cima — cada passagem limpa (no ar) vale **+100 × combo**.
- Capivaras aparecem continuamente e ficam mais rápidas com o passar do tempo.
- Pisar em uma capivara perde os pontos acumulados no combo atual e zera o multiplicador.
- Encostar de lado em uma capivara custa uma vida e zera o multiplicador.
- Nos últimos 10 segundos o cronômetro fica vermelho e um bip soa a cada segundo.
- O jogo tem **5 vidas**; o jogo termina ao perdê-las todas ou ao esgotar o tempo.
- Vidas e pontuação acumuladas na fase 1 **são mantidas** na fase 2; somente o combo é zerado.
- O **recorde** é salvo automaticamente no navegador (localStorage).

## Áudio

- **SFX** (pulo, passagem limpa, pisar em capivara, dano, vitória) ativos por padrão em todos os navegadores.
- **Música de fundo** — desligada por padrão; ative pelo botão **MÚSICA** na tela inicial antes de jogar.

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
├── HighScore.js            # Persistência de recorde (localStorage)
├── scenes/
│   ├── BootScene.js        # Carregamento de assets e animações
│   ├── TitleScene.js       # Tela inicial e toggle de música
│   ├── GameScene.js        # Loop principal do jogo
│   ├── HUDScene.js         # Pontos, vidas, tempo e combo
│   ├── GameOverScene.js    # Tela de fim de jogo
│   └── WinScene.js         # Tela de vitória
├── audio/
│   ├── AudioUnlock.js      # Desbloqueio da Web Audio API no mobile
│   ├── MusicManager.js     # Motor de música chiptune (WebAudio puro)
│   └── GameTheme.js        # Melodia da fase (valsa chiptune)
├── assets/                 # Sprites e cenário (PNG)
└── docs/                   # Referências visuais e spritesheets originais
```

## Licença

[MIT](LICENSE) — Andre Suman Pereira, 2026.
Contribuições são bem-vindas — veja o [guia de contribuição](CONTRIBUTING.md).

## Créditos

- Engine: [Phaser 3](https://phaser.io/) v3.60
