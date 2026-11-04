---
name: dime-landingpage
description: Como trabalhar no site do DIME (dime-landingpage — home de vendas, funcionalidades, planos e o Guia do lançamento). Use ao editar páginas, planos/preços, artigos do guia, CSS ou o build estático.
---

# dime-landingpage — Site

- Fonte em `src/`; `public/` é gerado por `node src/build.mjs` e **não** vai para o Git.
- Configuração (WhatsApp, domínio) só em `src/config.mjs`.
- Artigo novo: `src/guia/<slug>.html` com front-matter (`titulo`, `descricao`, `categoria`, `ordem`, `trilha`, `atualizado`, `relacionados`); cada `<h2>` entra no índice.
- Planos atuais: Solo, Crew, Gravadora. Mudou plano/preço → avise o Jimmy: o app pode mostrar plano.
- Sem dependências no build. Não adicione framework.

## Verificar
```bash
node src/build.mjs   # sem avisos novos
```
Abra a página mudada (Playwright/Chromium disponível) e confira no celular (largura 390px).
