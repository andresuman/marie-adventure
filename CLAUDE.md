# CLAUDE.md — Guia de Implementação para A Aventura de Marie Curie

Arquivo de referência para o Claude Code em futuras sessões de desenvolvimento.
Leia antes de qualquer modificação no projeto.

---

## Visão Geral

Jogo 2D de plataforma + quiz educativo em **Phaser 3** (HTML/JS puro, sem build step).
Celebra os 100 anos da visita de Marie Curie a Águas de Lindóia (1926–2026).
Deploy via GitHub Pages: `https://andresuman.github.io/marie-adventure/`

Loop principal atual: correr/pular, desviar de capivaras, coletar blocos de quiz suspensos, responder curiosidades históricas e chegar à garrafa de água no fim de cada fase antes do tempo acabar.

---

## Convenções obrigatórias

| O quê | Idioma |
|---|---|
| Variáveis, funções, classes | Inglês |
| Comentários no código | PT-BR |
| Commits | PT-BR |
| Strings visíveis ao jogador | PT-BR |

- Comentários explicam o **porquê** (decisão, limitação, workaround), não o que.
- Sem build step. Sem transpiler. Sem npm. HTML/JS puro.
- Todo arquivo JS novo deve ser adicionado ao `index.html` com cache-bust `?v=YYYYMMDD`.

---

## Estrutura de arquivos

```
marie-adventure/
├── index.html              # Entrada; carrega scripts com ?v=YYYYMMDD
├── game.js                 # Config Phaser (480×270) + window.GAME_SETTINGS
├── HighScore.js            # Persistência de recorde em localStorage (window.HighScore)
├── QuizStats.js            # Persistência de acertos/tentativas do quiz (window.QuizStats)
├── data/
│   └── quiz.json           # Banco de perguntas por fase (fase1/fase2)
├── scenes/
│   ├── BootScene.js        # preload() de assets + create() de animações → inicia TitleScene
│   ├── TitleScene.js       # Tela inicial; toggle de música; high score; inicia GameScene
│   ├── GameScene.js        # Loop principal; física; capivaras; blocos de quiz; SFX; controles
│   ├── HUDScene.js         # Overlay de pontos/vidas/tempo/combo (cena paralela)
│   ├── QuizScene.js        # Overlay de pergunta, alternativas, feedback e explicação
│   ├── GameOverScene.js    # Fim de jogo; high score; restart → GameScene
│   └── WinScene.js         # Vitória; high score; restart → GameScene
├── audio/
│   ├── AudioUnlock.js      # Cria window.SFX_AUDIO_CONTEXT; método unlock()
│   ├── MusicManager.js     # Motor chiptune WebAudio; window.MusicManager
│   └── GameTheme.js        # Valsa em Fá maior, 80 BPM, 24 compassos
├── assets/                 # Sprites PNG (não alterar sem atualizar BootScene)
└── docs/                   # Referências visuais — NUNCA carregadas pelo jogo
```

---

## Constantes globais (GameScene.js — topo do arquivo)

```js
const GROUND_Y    = 248;    // Y do chão em px (coordenada do topo do tile)
const TILE_W      = 64;     // Largura do tile de chão
const TILE_H      = 48;     // Altura do tile de chão
const MARIE_SCALE = 0.28;   // Escala do sprite da Marie (192×302 px original)
const CAPY_SCALE  = 0.22;   // Escala do sprite da capivara (276×200 px original)
const MARIE_SPEED = 140;    // Velocidade horizontal da Marie (px/s)
const JUMP_VY     = -440;   // Velocidade vertical do pulo
const LIVES_START = 5;      // Vidas iniciais (usado tb em HUDScene — dependência global)
const CAPY_SPEED  = 60;     // Velocidade base das capivaras na fase 1
const LEVEL_WIDTH = 1946;   // Largura exata do background.png (fase 1)
const TIME_START  = 60;     // Tempo de jogo em segundos

// Parâmetros da fase 2 (mais difícil)
const LEVEL_WIDTH_2 = 2972; // Largura exata do background2.png (~50% mais longa)
const CAPY_SPEED_2  = 85;   // Velocidade base das capivaras na fase 2 (~40% mais rápidas)

// Parâmetros de spawn das capivaras
const SPAWN_DELAY_MAX    = 3500; // intervalo inicial entre spawns (ms)
const SPAWN_DELAY_MIN    = 1500; // intervalo mínimo ao fim da fase (ms)
const SPAWN_DELAY_JITTER = 400;  // variação aleatória ±400ms no intervalo
const SPAWN_SPEED_RAMP   = 0.8;  // fator de aceleração máxima (80% acima do base)

// Tolerâncias de colisão e timings de transição
const STOMP_TOLERANCE     = 14;  // px de tolerância para detectar pisada no topo da capivara
const GAMEOVER_DELAY      = 700; // ms de espera antes de exibir GameOverScene
const PHASE_TRANS_DELAY   = 600; // ms de espera antes de transição de fase
const INVINCIBLE_REPEAT   = 10;  // repetições do piscar após levar dano
const INVINCIBLE_DURATION = 90;  // duração de cada piscar de invencibilidade (ms)
```

`LIVES_START` é global de script-tag e é referenciado diretamente em `HUDScene.js`.
Se renomear, atualizar nos dois arquivos.

---

## Configuração Phaser (game.js)

```js
// Dimensões canônicas — nunca alterar sem revisar todas as cenas
const GAME_WIDTH  = 480;
const GAME_HEIGHT = 270;

window.GAME_SETTINGS = {
    musicEnabled: false,  // usuário ativa pelo toggle na TitleScene
};
```

- Física arcade com `gravity.y = 700`.
- Scale mode `FIT + CENTER_BOTH` — funciona em desktop e mobile sem código extra.
- `debug: false` em produção; pode setar `true` para visualizar hitboxes.

---

## High Score (HighScore.js)

```js
window.HighScore.get()        // Retorna o recorde salvo (int, 0 se nunca jogou)
window.HighScore.check(score) // Salva se for novo recorde; retorna true/false
```

Persistência via `localStorage` (chave `'marie-highscore'`).
Usado em `TitleScene` (exibe recorde), `GameOverScene` e `WinScene` (verifica/exibe novo recorde).

---

## Estatísticas do quiz (QuizStats.js)

```js
window.QuizStats.getTotal()        // Total lifetime de perguntas respondidas
window.QuizStats.getAcertos()      // Total lifetime de respostas corretas
window.QuizStats.registrar(true)   // Incrementa total e acertos
window.QuizStats.registrar(false)  // Incrementa apenas total
```

Persistência via `localStorage`:
- `'marie-quiz-total'`
- `'marie-quiz-acertos'`

Usado em `QuizScene._responder()` para registrar cada resposta e em `GameOverScene`/`WinScene` para exibir `Curiosidades: X/Y corretas`.
Essas estatísticas são acumuladas entre partidas, assim como o recorde.

---

## Fluxo de cenas

```
BootScene → TitleScene → GameScene (fase 1) + HUDScene (paralela)
                         ↕ QuizScene (overlay, quando coleta bloco)
                                ↓
                         GameScene (fase 2) + HUDScene (paralela)
                         ↕ QuizScene (overlay, quando coleta bloco)
                                ↓
                            WinScene
                  (ou GameOverScene de qualquer fase)
                                ↓
                         GameScene (restart, fase 1)
```

- `HUDScene` é lançada com `this.scene.launch('HUDScene', { gameScene: this, level: this.level })`.
- `HUDScene` recebe referência à `GameScene` em `init(data)` e escuta eventos via `this.gameScene.events.on(...)`.
- `QuizScene` é lançada como overlay com `this.scene.launch('QuizScene', { ...pergunta, gameScene: this })` após `GameScene` ser pausada.
- `QuizScene._fechar()` retoma `GameScene`, para a própria cena e emite `quiz-resolvido` na instância de `GameScene`.
- Ao terminar o jogo: `this.scene.stop('HUDScene')` antes de iniciar GameOver/Win.

---

## Eventos entre GameScene e HUDScene

| Evento | Payload | Quando |
|---|---|---|
| `scoreChanged` | `(number)` | Pontuação muda |
| `livesChanged` | `(number)` | Vida perdida |
| `timeChanged` | `(number)` | A cada segundo |
| `comboChanged` | `(number)` | Combo muda (passagem limpa ou reset) |

Emit em GameScene: `this.events.emit('nomeDoEvento', valor)`.
Escuta em HUDScene: `this.gameScene.events.on('nomeDoEvento', callback)`.

---

## Evento entre GameScene e QuizScene

| Evento | Payload | Quando |
|---|---|---|
| `quiz-resolvido` | `{ acertou: boolean }` | Emitido por `QuizScene._fechar()` após o jogador responder e clicar/teclar continuar |

Fluxo obrigatório:
1. `GameScene._onCollect()` faz `this.scene.pause()` e lança `QuizScene`.
2. `GameScene` registra `this.events.once('quiz-resolvido', ({ acertou }) => { ... })` antes de pausar.
3. `QuizScene._fechar()` faz `this.scene.resume('GameScene')`, `this.scene.stop()` e então `gs.events.emit('quiz-resolvido', { acertou: this._acertou })`.

Usar `once`, não `on`, para evitar listeners acumulados entre coletas.

---

## Sistema de pontuação

```
Passagem limpa (capivara passa por Marie sem ser pisada):
  → score += 100 × combo
  → comboPoints += pts   (acumulado para possível devolução)
  → combo++

Pisar na capivara (pulo em cima):
  → score = Math.max(0, score - comboPoints)  (devolve pontos do streak atual)
  → combo = 1
  → comboPoints = 0

Encosto lateral (loseLife()):
  → perde 1 vida
  → combo = 1
  → comboPoints = 0   (pontos já "bankeados" são mantidos)

Quiz correto:
  → score += 500
  → combo não muda

Quiz errado ou cancelado por Escape:
  → sem bônus e sem penalidade direta
```

- `combo` começa em 1; HUD exibe `★N` (N = combo - 1 = acertos seguidos).
- Cores do combo no HUD: `#aaaaaa` (0), `#ffdd00` (1–2), `#ff9900` (3–5), `#ff4444` (6+).
- Passagem limpa detectada em `update()`: `capy.x < this.marie.x - 40 && !capy._scored && !capy._stomped && !capy._missed` e Marie deve estar no ar (`!marieOnGround`). Se Marie está no chão, marca `capy._missed = true` (sem pontos, sem nova tentativa).
- Bônus do quiz emite `scoreChanged` e mostra texto flutuante `+500`.

---

## Sistema de quiz educativo

### Banco de perguntas (`data/quiz.json`)

Formato obrigatório:

```json
{
  "fase1": [
    {
      "pergunta": "Texto da pergunta",
      "respostaCorreta": "Alternativa correta",
      "respostasErradas": [
        "Alternativa errada 1",
        "Alternativa errada 2"
      ],
      "explicacao": "Texto exibido após responder."
    }
  ],
  "fase2": []
}
```

- `fase1`: perguntas sobre Marie Curie, visita de 1926 e Thermas de Lindoya.
- `fase2`: perguntas sobre Águas de Lindóia, legado histórico e contexto de 2026.
- Cada pergunta deve ter exatamente 1 `respostaCorreta` e exatamente 2 itens em `respostasErradas`.
- Não usar o formato antigo com `alternativas` + índice `correta`.
- `QuizScene` monta as 3 alternativas a partir de `respostaCorreta + respostasErradas`, embaralha a ordem e recalcula internamente o índice correto.
- Manter exatamente 3 alternativas no total por pergunta: `QuizScene` posiciona 3 botões fixos (`btnYs = [100, 150, 200]`).

### Sorteio e blocos em GameScene

Estado inicial em `GameScene.init()`:

```js
this._quizActive = false; // impede abrir dois quizzes simultâneos
this._quizQueue  = [];    // fila de perguntas sorteadas para a fase atual
```

Métodos principais:

| Método | Responsabilidade |
|---|---|
| `_sortearQuiz()` | Lê `this.cache.json.get('quiz')`, escolhe `fase1`/`fase2`, embaralha e pega até 3 perguntas |
| `_spawnCollectibles()` | Cria os blocos `questionBlock` sem gravidade, com tweens de flutuação/alpha |
| `_onCollect(marie, item)` | Consome próxima pergunta, destrói bloco, toca coleta, pausa jogo e abre `QuizScene` |

Posições atuais dos blocos:

```js
// fase 1
[380, 970, 1560]

// fase 2
[560, 1480, 2600]

const ITEM_Y = 110;
```

Ao retornar do quiz:
- `_quizActive = false`.
- `this.capybaras.clear(true, true)` remove capivaras visíveis para evitar colisão surpresa.
- Se `acertou`, aplica `+500` pontos.

### QuizScene

Payload esperado em `init(data)`:

```js
{
  pergunta: string,
  respostaCorreta: string,
  respostasErradas: string[], // exatamente 2 itens
  explicacao: string,
  gameScene: GameScene
}
```

`QuizScene.init()` chama `_montarAlternativasEmbaralhadas(respostaCorreta, respostasErradas)` para criar `this.alternativas` e `this.correta` somente como estado interno da cena.

Controles:
- Teclado: `↑/↓` selecionam alternativa; `Enter` ou `Espaço` confirmam; `1/2/3` respondem diretamente; `Esc` responde como erro (`indice = -1`).
- Mouse/touch: tocar/clicar na alternativa responde; tocar/clicar em `CONTINUAR` fecha após o feedback.
- Após responder, `Enter` ou `Espaço` também fecham o quiz.

Feedback:
- Correto: botão correto verde, texto `✔  CORRETO!`, SFX `_sndCorrect()`.
- Errado: botão escolhido vermelho, correto verde, texto com a resposta correta, SFX `_sndWrong()`.
- A explicação histórica sempre é exibida antes de continuar.
- `window.QuizStats.registrar(this._acertou)` é chamado exatamente uma vez por resposta.

---

## Sistema de áudio — arquitetura

### Dois AudioContext separados

| Contexto | Onde criado | Para quê |
|---|---|---|
| `window.SFX_AUDIO_CONTEXT` | `AudioUnlock.js` | SFX inline de GameScene |
| `MusicManager._ac` | `MusicManager.js` | Música de fundo (chiptune) |

**Nunca misturar os dois.** GameScene usa `window.SFX_AUDIO_CONTEXT` via `this._sfx(fn)`.

### SFX disponíveis em GameScene

| Método | Timbre | Quando |
|---|---|---|
| `sndJump()` | square, 180→420 Hz | Pulo |
| `sndCollect()` | square, arpejo asc. | Coletar bloco de quiz |
| `sndStomp()` | square, 320→55 Hz | Pisar em capivara |
| `sndCleanPass(combo)` | square, notas C5–A5 | Passagem limpa (evolui com combo: quinta em ≥3, oitava em ≥5) |
| `sndHurt()` | sawtooth, 220→70 Hz | Encostar em capivara (dano) |
| `sndTick()` | square, 880 Hz | Últimos 10s do timer (dobra nos últimos 5s) |
| `sndWin()` | square, 4 notas asc. | Transição fase 1 → fase 2 |
| `sndVictory()` | square, 5 notas asc. | Vitória final (fase 2 concluída) |
| `sndGameOver()` | sawtooth, 4 notas desc. | Game over |

`QuizScene` também toca SFX inline usando o mesmo `window.SFX_AUDIO_CONTEXT`:
- `_sndCorrect()`: arpejo ascendente em Fá maior ao acertar.
- `_sndWrong()`: dois tons descendentes suaves ao errar.

### Adicionar um novo SFX em GameScene

```js
sndMeuSom() {
    this._sfx(ac => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'square'; // square | sawtooth | triangle | sine
        o.frequency.setValueAtTime(440, ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.10);
        g.gain.setValueAtTime(0.18, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
        o.start(ac.currentTime); o.stop(ac.currentTime + 0.12);
    });
}
```

- Sempre usar `exponentialRampToValueAtTime` para evitar cliques de áudio.
- Nunca setar `g.gain` para exatamente 0 com ramp — usar `0.001` como destino.

### MusicManager — adicionar nova música

```js
// Em um novo arquivo audio/MinhaMúsica.js:
window.MusicManager.registerSong('minha-key', {
    bpm: 90,
    totalBeats: 72,  // múltiplo de beatsPerMeasure
    lead: [ { note: 'C4', startBeat: 0, beats: 1 }, ... ],
    bass: [ { note: 'C2', startBeat: 0, beats: 1 }, ... ],
    leadWave: 'square',
    bassWave: 'triangle',
    leadAmp: 0.10,
    bassAmp: 0.055,
});
```

Notas aceitas: `C4`, `F#5`, `Bb3`, `R` (silêncio).
Duração em beats (4/beat → 1, 2/beat → 2, 8/beat → 0.5).
Use `window.MusicUtils.durationTokenToBeats(tok)` para converter notação de pauta.

---

## Sprites e hitboxes

### Marie (192×302 px, MARIE_SCALE=0.28)
```js
this.marie.body.setSize(192 * 0.55, 302 * 0.80);
this.marie.body.setOffset(192 * 0.22, 302 * 0.10);
```

### Capivara (276×200 px, CAPY_SCALE=0.22)
```js
capy.body.setSize(276 * 0.72, 200 * 0.68);
capy.body.setOffset(276 * 0.14, 200 * 0.22);
```

Hitboxes reduzidas intencionalmente para gameplay justo.
Ao mudar escala: recalcular proporções e testar visualmente com `debug: true`.

---

## Controles touch (GameScene.setupTouchControls)

- Três botões: ◄ (esquerda), ► (direita), ▲ (pulo).
- Cada botão rastreia `pointerId` para suportar multi-touch correto.
- `this.input.addPointer(2)` habilita até 3 ponteiros simultâneos.
- Ao liberar: `pointerout`, `pointerup` e `pointercancel` no input global chamam `releasePointer()`.
- Botões usam `setScrollFactor(0)` — ficam fixos na câmera.

---

## Deteccão de colisão Marie × Capivara

```js
onContact(marie, capy) {
    // OBRIGATÓRIO: guard contra overlap pós-gameover
    if (this.dead || this.invincible) return;

    const marieFeet = marie.body.bottom;
    const capyTop   = capy.body.top;

    if (marieFeet <= capyTop + STOMP_TOLERANCE && marie.body.velocity.y > 0) {
        // Pisou (stomped)
    } else {
        // Encostou lateralmente
        this.loseLife();
    }
}
```

`STOMP_TOLERANCE` (14px) compensa diferença de velocidade de frame.
O guard `if (this.dead || this.invincible)` é CRÍTICO — sem ele `triggerGameOver()` é chamado múltiplas vezes.

---

## Câmera e mundo

- `this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, H)` — câmera não sai do mundo.
- `this.cameras.main.startFollow(this.marie, true, 0.1, 0)` — lerp horizontal suave.
- Marie não pode sair da câmera à esquerda: `if (this.marie.x < cam + 16) this.marie.x = cam + 16`.
- Capivaras fora da tela à esquerda são destruídas: `if (capy.x < cam - 200) capy.destroy()`.
- Spawn de capivaras agendado por timer em `_scheduleNextCapy()` — independente da posição de Marie.
- Intervalo diminui de 3500ms no início para 1500ms ao fim da fase (dificuldade crescente).
- Velocidade de cada capivara cresce até 80% acima do base conforme o tempo passa.

---

## Textos e UI — padrão visual

Todas as cenas usam a helper local:
```js
const txt = (x, y, str, style) =>
    this.add.text(x, y, str, { fontFamily: 'monospace', resolution: 3, ...style })
        .setOrigin(0.5);
```

Paleta padrão:
- Título: `#ffe040` (amarelo ouro)
- Subtítulo/info: `#66ccff` (azul claro)
- Texto normal: `#ffffff`
- Texto inativo: `#888888`
- Positivo: `#44ff88` (verde neon)
- Negativo/alerta: `#ff4444` (vermelho)
- Botão fundo: `#ffe040` | hover: `#ffffff`
- Stroke padrão: `#000000`, strokeThickness: 3–6

Fonte: `monospace` com `resolution: 3` para nitidez em telas de alta densidade.

---

## Texto flutuante de pontuação

```js
this._floatText('+300', this.marie.x, this.marie.y - 40, '#44ff88');
this._floatText('-200', this.marie.x, this.marie.y - 40, '#ff4444');
```

Fica parado 500ms (para o jogador ler), sobe 44px e some em 700ms. Profundidade 20 (acima de tudo).
Tamanho da fonte escala com o combo: 14px (normal), 16px (combo ≥3), 18px (combo ≥5).

---

## Assets disponíveis (todos carregados em BootScene)

| Chave | Arquivo | Uso |
|---|---|---|
| `marie_idle` | marie_idle.png | Animação idle |
| `marie_walk1–4` | marie_walk1–4.png | Animação caminhada |
| `capy_walk1–3` | capy_walk1–3.png | Animação capivara andando |
| `capy_flat1–2` | capy_flat1–2.png | Capivara pisada |
| `ground` | ground.png | Tile de chão fase 1 (64×48) |
| `ground2` | ground2.png | Tile de chão fase 2 (calçada) |
| `bottle` | bottle.png | Objetivo fase 1 — garrafa Lindoya antiga (316×718 px) |
| `bottle2` | bottle2.png | Objetivo fase 2 — garrafa Lindóia moderna (102×226 px) |
| `background` | background.png | Cenário fase 1 (1946 px largura) |
| `background2` | background2.png | Cenário fase 2 (2972 px largura) |
| `questionBlock` | question-block.png | Bloco coletável que abre o quiz educativo |
| `heart` | gerado via canvas em BootScene | Ícone de vida no HUD |

Para adicionar asset: colocar em `assets/`, adicionar `this.load.image(...)` em `BootScene.preload()`.
Para adicionar/alterar perguntas: editar `data/quiz.json` e manter `this.load.json('quiz', 'data/quiz.json')` em `BootScene.preload()`.

---

## Animações disponíveis (criadas em BootScene.create)

| Chave | Frames | frameRate | repeat |
|---|---|---|---|
| `marie-idle` | marie_idle | 1 | -1 |
| `marie-walk` | marie_walk1–4 | 8 | -1 |
| `capy-walk` | capy_walk1–3 | 6 | -1 |

---

## Cache-bust no index.html

Ao modificar qualquer arquivo JS, atualizar o `?v=YYYYMMDD` correspondente em `index.html`.
Formato: `?v=20260301` (ano 4 dígitos + mês 2 + dia 2).

---

## Bugs conhecidos (já corrigidos — não reverter)

1. **triggerGameOver() duplo**: `onContact()` sem guard `if (this.dead || this.invincible)` causava chamada dupla porque Phaser pode acionar overlap após `dead = true`.

2. **MusicManager memory leak**: `_scheduled` crescia ilimitadamente. Corrigido com filtro `this._scheduled = this._scheduled.filter(o => (o._stopAt || 0) > now)` em `_scheduleLoop()`.

3. **MusicManager.stop() travava**: usava `Math.max(now, _stopAt)` — corrigido para `n.stop(now)`.

4. **comboTxt cor inicial errada**: inicializava amarelo (`#ffdd00`) mas deveria ser cinza (`#888888`) porque ×1 não é combo ativo.

---

## Padrões a seguir em novas implementações

### Nova cena
```js
class MinhaScene extends Phaser.Scene {
    constructor() { super({ key: 'MinhaScene' }); }
    init(data) { /* recebe dados da cena anterior */ }
    create() { /* setup */ }
    update() { /* loop */ }
}
```
Adicionar ao array de scenes em `game.js` e carregar script no `index.html`.

### Novo evento HUD
1. Emitir em GameScene: `this.events.emit('meuEvento', valor)`.
2. Escutar em HUDScene: `this.gameScene.events.on('meuEvento', (v) => { ... })`.

### Invencibilidade após dano
```js
this.invincible = true;
this.tweens.add({
    targets: this.marie, alpha: 0.25, duration: INVINCIBLE_DURATION,
    yoyo: true, repeat: INVINCIBLE_REPEAT,
    onComplete: () => { this.marie.setAlpha(1); this.invincible = false; }
});
```

### Reiniciar a fase
Em qualquer cena: `this.scene.start('GameScene', { level: 1 })` — `GameScene.init()` reseta todos os estados.
Sempre passar `{ level: 1 }` explicitamente para garantir que o restart volta à fase 1.

### Transição fase 1 → fase 2
Passar `score` **e** `lives` para preservar o progresso do jogador:
```js
this.scene.start('GameScene', { level: 2, score: this.score, lives: this.lives });
```
`init()` usa `data.lives` se presente; caso contrário cai no `LIVES_START`.
O `combo` e `comboPoints` são zerados automaticamente por `init()` na troca de fase.

---

## Como rodar localmente

```bash
python3 -m http.server 8000
# Abrir: http://localhost:8000
```

Hard refresh se JS não atualizar: `Cmd+Shift+R` (macOS) / `Ctrl+F5` (Windows/Linux).
