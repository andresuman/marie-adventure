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

### Boas práticas de comentários

Prefira comentários que explicam o **porquê** — decisão técnica, limitação do browser, workaround — e não o **que** (que já é legível direto no código).

```js
// Bom: explica a razão da existência da linha
// Phaser pode acionar overlap mesmo após game over — evita triggerGameOver() duplo.
if (this.dead || this.invincible) return;

// Evite: apenas repete o que o código diz
// Verifica se está morto
if (this.dead) return;
```

## Como rodar localmente

Na raiz do projeto:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000` no navegador.

> **Hard refresh** se as mudanças em `.js` não aparecerem: `Cmd+Shift+R` (macOS) / `Ctrl+F5` (Windows/Linux).

Não há build step — o projeto é HTML/JS puro. Edite e recarregue.

## Como abrir um pull request

1. Faça um fork do repositório.
2. Crie uma branch descritiva: `git checkout -b minha-feature`.
3. Faça as alterações e commit em PT-BR:
   ```bash
   git commit -m "Adiciona suporte a ..."
   ```
4. Abra um Pull Request descrevendo **o que** mudou e **por que**.
