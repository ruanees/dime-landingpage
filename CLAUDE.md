# dime-landingpage — instruções para o Claude

Site estático do DIME (vendas, funcionalidades, planos e o Guia do lançamento),
publicado na Cloudflare Workers. Sem framework e sem dependências: o
`src/build.mjs` gera `public/` a partir de `src/`. Detalhes no `README.md`.

Escreva textos, comentários, commits e respostas em **português**. O público
do site são artistas iniciantes: linguagem simples, sem jargão sem explicação.

## Comandos

```bash
node src/build.mjs     # gera public/ (não vai para o git)
npx wrangler dev       # http://localhost:8787
```

O build avisa enquanto o WhatsApp não estiver configurado em `src/config.mjs`;
isso é esperado até alguém preencher.

## Onde fica cada coisa

- `src/config.mjs` — WhatsApp e domínio do site
- `src/pages/` — páginas; `src/guia/` — um arquivo por artigo
- `src/partials/` — trechos reutilizáveis
- `src/assets/` — CSS, JS e imagens

Artigo novo segue o cabeçalho descrito no README (`titulo`, `descricao`,
`categoria`, `ordem`, `trilha`, `atualizado`, `relacionados`).

## Fluxo de trabalho

- Todo push na `main` publica o site. Nunca faça push direto nela: trabalhe em
  branch e abra PR.
- Antes de dar algo por pronto, rode `node src/build.mjs` e confira que não há
  erro.
