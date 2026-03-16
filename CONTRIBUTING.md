# Guia de Contribuição

Obrigado pelo interesse em contribuir com **A Aventura de Marie Curie**!

## Convenções de código

### Idioma

| O quê | Idioma |
|---|---|
| Nomes de variáveis, funções, classes | Inglês |
| Comentários no código | Português (PT-BR) |
| Mensagens de commit | Português (PT-BR) |
| Strings visíveis ao jogador | Português (PT-BR) |

### Comentários — explique o porquê, não o quê

Comentários devem registrar a **razão** de uma decisão, limitação do browser ou workaround — não parafrasear o código.

```js
// BOM: documenta a razão da existência da linha
// Phaser pode acionar overlap mesmo após game over — evita triggerGameOver() duplo.
if (this.dead || this.invincible) return;

// EVITE: apenas repete o que o código diz
// Verifica se está morto
if (this.dead) return;
```

```js
// BOM: explica por que 0.001 e não 0
// exponentialRamp não aceita zero como destino — usamos 0.001 para evitar clique de áudio.
g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

// EVITE: sem contexto
g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12); // fade out
```

Use separadores visuais `// ── Título ───` para demarcar seções dentro de um arquivo longo (padrão já adotado no projeto).

### Sem build step

O projeto é HTML/JS puro — sem npm, sem bundler, sem transpiler. Não adicione dependências de build.
Todo novo arquivo `.js` deve ser carregado diretamente no `index.html` via `<script src="...">`.

### Cache-bust obrigatório

Ao modificar qualquer arquivo `.js`, atualize o parâmetro `?v=YYYYMMDD` correspondente no `index.html`:

```html
<!-- Antes -->
<script src="scenes/GameScene.js?v=20260301"></script>

<!-- Depois (data da modificação) -->
<script src="scenes/GameScene.js?v=20260317"></script>
```

Sem isso o navegador pode servir a versão antiga do cache.

## Como rodar localmente

Na raiz do projeto:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000` no navegador.

> **Hard refresh** se as mudanças em `.js` não aparecerem: `Cmd+Shift+R` (macOS) / `Ctrl+F5` (Windows/Linux).

## Como abrir um pull request

1. Faça um fork do repositório.
2. Crie uma branch descritiva: `git checkout -b minha-feature`.
3. Faça as alterações, atualize o `?v=YYYYMMDD` nos arquivos modificados e commit em PT-BR:
   ```bash
   git commit -m "Adiciona suporte a ..."
   ```
4. Abra um Pull Request descrevendo **o que** mudou e **por que**.
