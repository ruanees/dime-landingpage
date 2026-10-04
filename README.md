# DIME — Landing page

Página estática (um único `public/index.html`, sem build), publicada como Cloudflare Worker com static assets.

## Deploy

Configuração em `wrangler.jsonc` (pasta publicada: `public/`). No Cloudflare (Workers & Pages → Import a repository):

- **Project name:** `dime-landingpage` (tem que ser igual ao `name` do `wrangler.jsonc`)
- **Build command:** (vazio)
- **Deploy command:** `npx wrangler deploy`

Todo push na branch de produção publica a página automaticamente.

## Pendências antes de divulgar

- `public/index.html`: trocar `55SEUNUMERO` pelo WhatsApp (55 + DDD + número, sem espaços) — 6 links.
- `public/index.html`: trocar `https://SEU-DOMINIO.com.br` em `og:url` e `og:image` pelo domínio final.
- Adicionar `og.png` (1200x630) em `public/` para o preview em redes sociais.
