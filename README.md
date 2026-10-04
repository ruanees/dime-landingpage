# DIME — Site

Site estático do DIME: home de vendas, funcionalidades, planos e o **Guia do lançamento** (conteúdo educativo para artistas iniciantes).

## Estrutura

```
src/
  config.mjs      ← WhatsApp e domínio (troque aqui)
  build.mjs       ← gera o site em public/ (sem dependências)
  pages/          ← home, funcionalidades, planos, guia, 404
  guia/           ← um arquivo por artigo → /guia/<nome-do-arquivo>/
  partials/       ← trechos reutilizáveis (CTA final, CTA dos artigos)
  assets/         ← CSS, JS, imagens, favicon, imagem de compartilhamento
```

`public/` é gerado e não vai para o Git. O Cloudflare roda `node src/build.mjs` sozinho antes de cada deploy (configurado em `wrangler.jsonc`).

## Ver no computador

```
node src/build.mjs
npx wrangler dev        # abre em http://localhost:8787
```

## Escrever um artigo novo

Crie `src/guia/meu-artigo.html`:

```html
---
titulo: Título que aparece no Google e na página
descricao: Uma ou duas frases. Aparece no card e no resultado de busca.
categoria: Primeiros passos | Distribuição | Direitos e dinheiro | Divulgação
ordem: 12
trilha: não
atualizado: 2026-10-04
relacionados: slug-de-outro-artigo, outro-slug
---
<p>Introdução…</p>
<h2>Seção</h2>   ← cada h2 entra no índice "Neste guia"
<p>…</p>
```

Componentes disponíveis no texto: `<div class="caixa">` (dica), `caixa caixa--alerta`, `caixa caixa--ok`, `<ol class="tempo">` (linha do tempo), `<ul class="checklist">`, tabelas.

`trilha: sim` coloca o artigo na trilha "Comece por aqui" e no rodapé.

## Deploy (Cloudflare Workers)

- **Project name:** `dime-landingpage` (igual ao `name` do `wrangler.jsonc`)
- **Build command:** (vazio)
- **Deploy command:** `npx wrangler deploy`

Todo push na branch de produção publica o site.

## Pendências

- `src/config.mjs`: colocar o WhatsApp (o build avisa enquanto não estiver configurado).
- `src/config.mjs`: confirmar o domínio final (`siteUrl`).
