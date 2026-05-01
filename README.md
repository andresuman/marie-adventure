# A Aventura de Marie Curie

Jogo 2D de plataforma + desafio de perguntas educativo em **Phaser 3** (HTML/JS puro), rodando direto no navegador — sem instalação, sem dependências de build.

Criado para celebrar os **100 anos da visita de Marie Curie a Águas de Lindóia** (1926–2026). Ajude a cientista a correr pelas ruas da cidade termal, desviar das capivaras, coletar blocos de perguntas com curiosidades históricas e chegar até a garrafa de água antes que o tempo acabe — em **duas fases**: Thermas de Lindoya (1926) e Águas de Lindóia (2026).

## Jogar online

**https://andresuman.github.io/marie-adventure/**

## Como jogar

| Ação | Teclado | Mobile |
|------|---------|--------|
| Andar | ← / → ou A / D | ◄ ► |
| Pular | ↑ ou W ou Espaço | ▲ |
| Selecionar resposta | ↑ / ↓ | toque na alternativa |
| Confirmar resposta | Enter, Espaço ou 1 / 2 / 3 | toque na alternativa |

- **Objetivo:** chegue até a garrafa de água no fim de cada fase antes do tempo acabar.
- Desvie das capivaras pulando por cima — cada passagem limpa (no ar) vale **+100 × combo**.
- Capivaras aparecem continuamente e ficam mais rápidas com o passar do tempo.
- Colete os **blocos de perguntas** no ar para responder curiosidades sobre Marie Curie, Thermas de Lindoya e Águas de Lindóia.
- Ao coletar um bloco, a ação pausa e uma pergunta aparece em tela cheia. Responda e leia a explicação histórica antes de continuar.
- Cada resposta correta no desafio de perguntas rende **+500 pontos**; respostas erradas não tiram vida nem pontos.
- Pisar em uma capivara perde os pontos acumulados no combo atual e zera o multiplicador.
- Encostar de lado em uma capivara custa uma vida e zera o multiplicador.
- Nos últimos 10 segundos o cronômetro fica vermelho e um bip soa a cada segundo.
- O jogo tem **5 vidas**; o jogo termina ao perdê-las todas ou ao esgotar o tempo.
- Vidas e pontuação acumuladas na fase 1 **são mantidas** na fase 2; somente o combo é zerado.
- O **recorde** é salvo automaticamente no navegador (localStorage).
- O desempenho no desafio de perguntas também é salvo no navegador e aparece no fim da partida como **Curiosidades: acertos/tentativas**.

## Desafio de perguntas educativo

- Cada fase sorteia até **3 perguntas** do banco correspondente em `data/quiz.json`.
- Os blocos de perguntas usam o sprite `assets/question-block.png` e ficam suspensos no cenário para incentivar o jogador a pular e coletar.
- As perguntas têm 1 resposta correta, 2 respostas erradas e uma explicação curta exibida após a escolha.
- As alternativas são embaralhadas automaticamente quando o desafio abre, então a resposta correta não fica presa a uma posição fixa.
- Ao voltar do desafio, as capivaras visíveis são removidas para evitar colisões surpresa imediatamente após a retomada.

Formato de cada pergunta em `data/quiz.json`:

```json
{
  "pergunta": "Texto da pergunta",
  "respostaCorreta": "Alternativa correta",
  "respostasErradas": [
    "Alternativa errada 1",
    "Alternativa errada 2"
  ],
  "explicacao": "Texto exibido após responder."
}
```

## Áudio

- **SFX** (pulo, passagem limpa, coleta de bloco de perguntas, resposta correta/errada, pisar em capivara, dano, vitória) ativos por padrão em todos os navegadores.
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
├── QuizStats.js            # Persistência de acertos/tentativas do desafio de perguntas (localStorage)
├── data/
│   └── quiz.json           # Banco de perguntas por fase
├── scenes/
│   ├── BootScene.js        # Carregamento de assets e animações
│   ├── TitleScene.js       # Tela inicial e toggle de música
│   ├── GameScene.js        # Loop principal, capivaras, blocos de perguntas e fases
│   ├── HUDScene.js         # Pontos, vidas, tempo e combo
│   ├── QuizScene.js        # Overlay do desafio de perguntas, alternativas, feedback e explicação
│   ├── GameOverScene.js    # Tela de fim de jogo
│   └── WinScene.js         # Tela de vitória
├── audio/
│   ├── AudioUnlock.js      # Desbloqueio da Web Audio API no mobile
│   ├── MusicManager.js     # Motor de música chiptune (WebAudio puro)
│   └── GameTheme.js        # Melodia da fase (valsa chiptune)
├── assets/                 # Sprites, cenário e bloco de perguntas (PNG)
└── docs/                   # Referências visuais e spritesheets originais
```

## Licença

[MIT](LICENSE) — Andre Suman Pereira, 2026.
Contribuições são bem-vindas — veja o [guia de contribuição](CONTRIBUTING.md).

## Créditos

- Engine: [Phaser 3](https://phaser.io/) v3.60
