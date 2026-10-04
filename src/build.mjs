// Gera o site estático em public/ a partir de src/. Sem dependências: `node src/build.mjs`.
//
// src/pages/*.html  → páginas (front matter: titulo, descricao, caminho, nav)
// src/guia/*.html   → artigos do guia em /guia/<arquivo>/ (front matter: titulo, descricao, categoria, ordem, atualizado)
// src/partials/*.html → trechos reutilizáveis, usados com {{parcial:nome}}
// src/assets/       → copiado para public/assets/
//
// Marcadores disponíveis no HTML:
//   {{wa}} / {{wa:mensagem}}   link do WhatsApp (com mensagem padrão ou própria)
//   {{whatsapp}}               número puro
//   {{artigos:slug,slug}}      cards dos artigos indicados
//   {{guia:trilha}}            trilha numerada "comece por aqui"
//   {{guia:categorias}}        todos os artigos agrupados por categoria
//   {{parcial:nome}}           conteúdo de src/partials/nome.html

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.mjs';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(SRC, '..', 'public');

const CATEGORIAS = ['Primeiros passos', 'Distribuição', 'Direitos e dinheiro', 'Divulgação'];

// ---------- utilidades ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const semTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const slugify = (s) => semTags(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const url = (caminho) => config.siteUrl + caminho;
const wa = (msg = config.mensagemPadrao) => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`;

function lerComFrontMatter(arquivo) {
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const m = bruto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`Sem front matter: ${arquivo}`);
  const dados = {};
  for (const linha of m[1].split('\n')) {
    const i = linha.indexOf(':');
    if (i > 0) dados[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
  }
  return { ...dados, corpo: m[2] };
}

function dataBR(iso) {
  const [a, m, d] = iso.split('-');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${Number(d)} ${meses[Number(m) - 1]} ${a}`;
}

// ---------- artigos ----------
const artigos = fs.readdirSync(path.join(SRC, 'guia'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => {
    const a = lerComFrontMatter(path.join(SRC, 'guia', f));
    a.slug = f.replace(/\.html$/, '');
    a.caminho = `/guia/${a.slug}/`;
    a.ordem = Number(a.ordem || 99);
    a.leitura = Math.max(2, Math.round(semTags(a.corpo).split(' ').length / 200));
    if (!CATEGORIAS.includes(a.categoria)) throw new Error(`Categoria desconhecida em ${f}: ${a.categoria}`);
    return a;
  })
  .sort((x, y) => x.ordem - y.ordem);
const porSlug = Object.fromEntries(artigos.map((a) => [a.slug, a]));

const cardArtigo = (a) => `
      <a class="artigo-card" href="${a.caminho}">
        <span class="rotulo">${esc(a.categoria)}</span>
        <h3>${esc(a.titulo)}</h3>
        <p>${esc(a.descricao)}</p>
        <span class="mono">${a.leitura} min de leitura</span>
      </a>`;

function cardsArtigos(slugs) {
  return `<div class="artigos">${slugs.map((s) => {
    if (!porSlug[s]) throw new Error(`Artigo não encontrado: ${s}`);
    return cardArtigo(porSlug[s]);
  }).join('')}\n    </div>`;
}

function trilha() {
  const itens = artigos.filter((a) => a.trilha === 'sim');
  return `<ol class="trilha">${itens.map((a, i) => `
      <li><a href="${a.caminho}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(a.titulo)}</b><span class="d">${esc(a.descricao)}</span></span><span class="t">${a.leitura} min</span></a></li>`).join('')}
    </ol>`;
}

function categorias() {
  return CATEGORIAS.map((c) => {
    const lista = artigos.filter((a) => a.categoria === c);
    if (!lista.length) return '';
    return `
    <div class="cat-titulo"><h2 id="${slugify(c)}">${esc(c)}</h2><span class="mono">${lista.length} ${lista.length > 1 ? 'guias' : 'guia'}</span></div>
    <div class="artigos">${lista.map(cardArtigo).join('')}\n    </div>`;
  }).join('\n');
}

// ---------- marcadores ----------
const parciais = {};
for (const f of fs.readdirSync(path.join(SRC, 'partials'))) {
  parciais[f.replace(/\.html$/, '')] = fs.readFileSync(path.join(SRC, 'partials', f), 'utf8');
}

function aplicarMarcadores(html) {
  // parciais primeiro, porque elas também podem ter marcadores
  html = html.replace(/\{\{parcial:([\w-]+)\}\}/g, (_, n) => {
    if (!(n in parciais)) throw new Error(`Parcial não encontrada: ${n}`);
    return parciais[n];
  });
  return html
    .replace(/\{\{wa\}\}/g, () => esc(wa()))
    .replace(/\{\{wa:([^}]+)\}\}/g, (_, msg) => esc(wa(msg)))
    .replace(/\{\{whatsapp\}\}/g, config.whatsapp)
    .replace(/\{\{artigos:([^}]+)\}\}/g, (_, s) => cardsArtigos(s.split(',').map((x) => x.trim())))
    .replace(/\{\{guia:trilha\}\}/g, trilha)
    .replace(/\{\{guia:categorias\}\}/g, categorias);
}

// ---------- layout ----------
const NAV = [
  { chave: 'funcionalidades', href: '/funcionalidades/', texto: 'Funcionalidades' },
  { chave: 'planos', href: '/planos/', texto: 'Planos' },
  { chave: 'guia', href: '/guia/', texto: 'Guia do lançamento' },
];

function layout({ titulo, descricao, caminho, nav, corpo, jsonld = [], tipo = 'website', classeBody = '' }) {
  const tituloCompleto = caminho === '/' ? titulo : `${titulo} · DIME`;
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="theme-color" content="#0C0A12">
<link rel="canonical" href="${url(caminho)}">

<meta property="og:site_name" content="DIME">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(tituloCompleto)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:type" content="${tipo}">
<meta property="og:url" content="${url(caminho)}">
<meta property="og:image" content="${url('/assets/og.jpg')}">
<meta name="twitter:card" content="summary_large_image">

<script>try{var t=localStorage.getItem('dime-tema');if(t)document.documentElement.dataset.theme=t;}catch(e){}</script>
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Roboto+Slab:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
${ld}
</head>
<body${classeBody ? ` class="${classeBody}"` : ''}>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="marca" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="15" fill="#2A1060"/>
      <g fill="#B9A3FF"><path d="M18 17 L41 32 L18 47 Z"/><rect x="44" y="17" width="6.5" height="30" rx="3"/></g>
    </symbol>
  </defs>
</svg>

<header class="topo">
  <div class="wrap">
    <a class="logo" href="/" aria-label="DIME — início">
      <svg viewBox="0 0 64 64"><use href="#marca"/></svg><b>DIME</b>
    </a>
    <nav class="nav" id="menu" aria-label="Principal">
${NAV.map((n) => `      <a href="${n.href}"${n.chave === nav ? ' aria-current="page"' : ''}>${n.texto}</a>`).join('\n')}
      <a class="btn btn--primario" href="${esc(wa())}" target="_blank" rel="noopener">Falar no WhatsApp</a>
    </nav>
    <div class="hdr">
      <button class="tema" onclick="alternarTema()" aria-label="Alternar tema claro e escuro"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg></button>
      <a class="btn btn--primario btn--sm" href="${esc(wa())}" target="_blank" rel="noopener">Falar no WhatsApp</a>
      <button class="menu-btn" aria-label="Abrir menu" aria-controls="menu" aria-expanded="false">☰</button>
    </div>
  </div>
</header>

<main id="conteudo">
${corpo}
</main>

<footer class="rodape">
  <div class="wrap">
    <div class="rodape__grid">
      <div class="rodape__marca">
        <a class="logo" href="/" style="font-size:16px" aria-label="DIME — início"><svg viewBox="0 0 64 64"><use href="#marca"/></svg><b>DIME</b></a>
        <p>Gestão de carreira musical. Do arquivo pronto à faixa no ar, sem planilha paralela.</p>
      </div>
      <div>
        <h4>Produto</h4>
        <ul>
          <li><a href="/funcionalidades/">Funcionalidades</a></li>
          <li><a href="/planos/">Planos e preços</a></li>
          <li><a href="/planos/#duvidas">Dúvidas frequentes</a></li>
        </ul>
      </div>
      <div>
        <h4>Guia do lançamento</h4>
        <ul>
${artigos.filter((a) => a.trilha === 'sim').slice(0, 4).map((a) => `          <li><a href="${a.caminho}">${esc(a.titulo)}</a></li>`).join('\n')}
          <li><a href="/guia/">Ver todos os guias</a></li>
        </ul>
      </div>
      <div>
        <h4>Contato</h4>
        <ul>
          <li><a href="${esc(wa())}" target="_blank" rel="noopener">WhatsApp</a></li>
        </ul>
      </div>
    </div>
    <div class="rodape__base">
      <small>DIME · Gestão de carreira musical · ${esc(config.cidade)}</small>
      <small>© ${new Date().getFullYear()} DIME</small>
    </div>
  </div>
</footer>

<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

function faqJsonLd(html) {
  const perguntas = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)];
  if (!perguntas.length) return null;
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: perguntas.map(([, q, r]) => ({
      '@type': 'Question', name: semTags(q),
      acceptedAnswer: { '@type': 'Answer', text: semTags(r) },
    })),
  };
}

function paginaArtigo(a) {
  // ids nos h2 + índice
  const indice = [];
  let corpo = a.corpo.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => {
    const id = slugify(t);
    indice.push({ id, t: semTags(t) });
    return `<h2 id="${id}">${t}</h2>`;
  });
  corpo = aplicarMarcadores(corpo);

  const i = artigos.indexOf(a);
  const proximo = artigos[i + 1] || artigos[0];
  const relacionados = (a.relacionados ? a.relacionados.split(',').map((s) => s.trim()) : [])
    .filter((s) => s !== proximo.slug).slice(0, 2);

  const html = `
<div class="progresso" aria-hidden="true"></div>
<article>
  <div class="artigo-topo">
    <div class="wrap">
      <nav class="trilha-nav" aria-label="Você está em"><a href="/guia/">Guia do lançamento</a><span aria-hidden="true">›</span><a href="/guia/#${slugify(a.categoria)}">${esc(a.categoria)}</a></nav>
      <h1>${esc(a.titulo)}</h1>
      <p class="lead">${esc(a.descricao)}</p>
      <div class="artigo-meta"><span>${a.leitura} min de leitura</span><span>Atualizado em ${dataBR(a.atualizado)}</span></div>
    </div>
  </div>

  <div class="artigo-corpo">
${indice.length > 2 ? `    <nav class="indice" aria-label="Neste guia">
      <span class="rotulo">Neste guia</span>
      <ol>
${indice.map((h) => `        <li><a href="#${h.id}">${esc(h.t)}</a></li>`).join('\n')}
      </ol>
    </nav>` : ''}
    <div class="prosa">
${corpo.trim()}
    </div>

${aplicarMarcadores(parciais['cta-artigo'])}

    <a class="proximo" href="${proximo.caminho}">
      <span class="rotulo">Próxima leitura</span>
      <b>${esc(proximo.titulo)}</b>
    </a>
  </div>
</article>
${relacionados.length ? `
<section class="compacta faixa">
  <div class="wrap">
    <div class="sec-topo"><span class="rotulo">Continue no guia</span><h2>Leia também</h2></div>
    ${cardsArtigos(relacionados)}
  </div>
</section>` : ''}
`;

  return layout({
    titulo: a.titulo, descricao: a.descricao, caminho: a.caminho, nav: 'guia', tipo: 'article', corpo: html,
    jsonld: [
      {
        '@context': 'https://schema.org', '@type': 'Article',
        headline: a.titulo, description: a.descricao, inLanguage: 'pt-BR',
        dateModified: a.atualizado, datePublished: a.publicado || a.atualizado,
        mainEntityOfPage: url(a.caminho), image: url('/assets/og.jpg'),
        author: { '@type': 'Organization', name: 'DIME' },
        publisher: { '@type': 'Organization', name: 'DIME', logo: { '@type': 'ImageObject', url: url('/assets/favicon.svg') } },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Guia do lançamento', item: url('/guia/') },
          { '@type': 'ListItem', position: 2, name: a.titulo, item: url(a.caminho) },
        ],
      },
    ],
  });
}

// ---------- gerar ----------
function escrever(caminho, html) {
  const destino = caminho.endsWith('.html') ? path.join(OUT, caminho) : path.join(OUT, caminho, 'index.html');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(SRC, 'assets'), path.join(OUT, 'assets'), { recursive: true });

const paginas = fs.readdirSync(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html'))
  .map((f) => lerComFrontMatter(path.join(SRC, 'pages', f)));

for (const p of paginas) {
  const corpo = aplicarMarcadores(p.corpo);
  const jsonld = [];
  if (p.caminho === '/') {
    jsonld.push({
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'DIME',
      applicationCategory: 'BusinessApplication', operatingSystem: 'Web',
      description: p.descricao, url: url('/'), inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '59', priceCurrency: 'BRL' },
    });
  }
  const faq = faqJsonLd(corpo);
  if (faq) jsonld.push(faq);
  escrever(p.caminho, layout({ ...p, corpo, jsonld }));
}

for (const a of artigos) escrever(a.caminho, paginaArtigo(a));

// sitemap e robots
const urls = [...paginas.filter((p) => p.caminho.endsWith('/')).map((p) => p.caminho), ...artigos.map((a) => a.caminho)];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${url(u)}</loc></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);

const avisos = [];
if (!/^\d{12,13}$/.test(config.whatsapp)) avisos.push('WhatsApp ainda não configurado em src/config.mjs');
console.log(`Site gerado em public/: ${paginas.length} páginas + ${artigos.length} artigos.`);
for (const a of avisos) console.warn(`⚠ ${a}`);
