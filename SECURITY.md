# Segurança

## Como avisar sobre uma falha

Não abra issue pública. Use **Security → Report a vulnerability** neste
repositório no GitHub (aviso privado) ou fale direto com o responsável pelo
DIME. Descreva o que encontrou e como reproduzir.

## Como o DIME se protege

- Quem decide o que cada pessoa vê é o **Postgres** (RLS e RPCs
  `security definer` no Supabase). O `dime-back` repassa o JWT de quem chamou
  com a chave **anônima**; o `dime-front` não tem credencial nenhuma.
- A `service_role` do Supabase **nunca** entra nestes repositórios.
- A chave `anon` do Supabase é pública por design e aparece em
  `dime-back/wrangler.toml`. Isso não é vazamento: quem protege os dados é a RLS.
- Dependências são acompanhadas pelo Dependabot.
