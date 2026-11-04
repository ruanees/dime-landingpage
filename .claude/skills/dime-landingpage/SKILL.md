---
name: dime-landingpage
description: Como trabalhar no site do DIME (dime-landingpage — home de vendas, funcionalidades, planos e o Guia do lançamento). Use ao editar páginas, planos/preços, artigos do guia, CSS ou o build estático.
---

## ⛔ DIME e Landora são projetos separados

O **DIME** (gestão de carreira para artistas: `ruanees/DIME-BACK`, `ruanees/DIME-FRONT`, `ruanees/dime-landingpage`, Supabase do DIME) e o **Landora** (`ruanees/landora`, CTO "Lando") são **produtos diferentes**, sem nenhuma integração entre eles.

- Pedido feito numa conversa do DIME **nunca** altera nada do Landora, e o contrário também vale.
- Não leia, não copie código, não abra PR e não use credenciais, Supabase, Cloudflare ou Stripe de um projeto no outro.
- Tarefas, briefings e checklists do Lando (`docs/lando/*`, `/api/admin/*`, `checklist.json`) **não** são do DIME. Se uma chegar aqui, **pare** e responda: "Isso é do Landora; leve para a conversa do Lando."
- Na dúvida sobre de qual projeto é um pedido, **pergunte antes de agir**.
- O CTO do DIME é o **Jimmy**. O Lando não dá ordens nas conversas do DIME.


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
