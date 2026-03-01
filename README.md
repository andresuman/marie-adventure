# A Aventura de Marie

Jogo 2D de plataforma em **Phaser 3** (HTML/JS puro), rodando direto no navegador — sem instalação.

Criado para celebrar os **100 anos da visita de Marie Curie a Águas de Lindóia** (1926–2026). A cientista corre pelas ruas da cidade termal desviando das capivaras que cruzam seu caminho.

## Como jogar

| Ação | Teclado | Mobile |
|------|---------|--------|
| Andar | ← / → ou A / D | ◄ ► |
| Pular | ↑ ou W ou Espaço | ▲ |

- Pise em cima de uma capivara para eliminá-la (+100 pontos).
- Encostar lateralmente na capivara custa uma vida.
- O jogo termina ao perder todas as 5 vidas.

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

## Estrutura

```
marie-adventure/
├── index.html          # Ponto de entrada
├── game.js             # Configuração do Phaser
├── scenes/
│   ├── BootScene.js    # Carregamento de assets e animações
│   ├── GameScene.js    # Loop principal do jogo
│   ├── HUDScene.js     # Pontos, vidas e tempo
│   └── GameOverScene.js
├── assets/             # Sprites e cenário (PNG)
└── docs/               # Referências visuais e spritesheets originais
```

## Créditos

- Engine: [Phaser 3](https://phaser.io/) v3.60
- Cenário: inspirado em Águas de Lindóia — Praça, Balneário Municipal, Hotel Glória, Igreja N.S. das Graças
- Desenvolvido por **Andre Suman** ([@andresuman](https://github.com/andresuman))
