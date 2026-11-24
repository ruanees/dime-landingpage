// Menu no celular
(function(){
  var topo = document.querySelector('header.topo');
  var btn = document.querySelector('.menu-btn');
  if (!topo || !btn) return;
  btn.addEventListener('click', function(){
    var aberto = topo.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', aberto);
    btn.textContent = aberto ? '✕' : '☰';
  });
  topo.querySelectorAll('.nav a').forEach(function(a){
    a.addEventListener('click', function(){ topo.classList.remove('aberto'); btn.setAttribute('aria-expanded', false); btn.textContent = '☰'; });
  });
})();

// Formulário que monta a mensagem e abre o WhatsApp
(function(){
  var form = document.querySelector('form[data-whatsapp]');
  if (!form) return;
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    var d = new FormData(form);
    var msg = 'Oi! Sou ' + d.get('nome') + ' (' + d.get('perfil') + ').';
    if (d.get('artistas')) msg += ' Trabalho com ' + d.get('artistas') + '.';
    msg += ' Quero conhecer o DIME.';
    window.open('https://wa.me/' + form.dataset.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();

// Barra de progresso de leitura nos artigos
(function(){
  var barra = document.querySelector('.progresso');
  var corpo = document.querySelector('.prosa');
  if (!barra || !corpo) return;
  function atualizar(){
    var r = corpo.getBoundingClientRect();
    var total = r.height - window.innerHeight * 0.6;
    var p = Math.min(1, Math.max(0, -r.top / (total || 1)));
    barra.style.width = (p * 100) + '%';
  }
  window.addEventListener('scroll', atualizar, { passive: true });
  atualizar();
})();

// Abas: perfis ("Conheça o DIME do seu jeito") e tour ("Explore o DIME na prática").
// Sem JS, todos os painéis aparecem um embaixo do outro.
(function(){
  document.querySelectorAll('[data-abas]').forEach(function(grupo){
    var abas = Array.prototype.slice.call(grupo.querySelectorAll('[role="tab"]'));
    function escolher(aba, foco){
      abas.forEach(function(a){
        var sel = a === aba;
        a.setAttribute('aria-selected', sel);
        a.tabIndex = sel ? 0 : -1;
        var p = document.getElementById(a.getAttribute('aria-controls'));
        if (p) p.hidden = !sel;
      });
      if (foco) aba.focus();
      if (aba.scrollIntoView && grupo.querySelector('.tour-abas')) {
        var lista = aba.parentElement;
        if (lista.scrollWidth > lista.clientWidth) lista.scrollTo({ left: aba.offsetLeft - 16, behavior: 'smooth' });
      }
    }
    abas.forEach(function(aba, i){
      aba.addEventListener('click', function(){ escolher(aba); });
      aba.addEventListener('keydown', function(ev){
        var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
        if (d) { ev.preventDefault(); escolher(abas[(i + d + abas.length) % abas.length], true); }
      });
    });
    var inicial = abas.filter(function(a){ return a.getAttribute('aria-selected') === 'true'; })[0] || abas[0];
    if (inicial) escolher(inicial);
  });
})();

// ---------- Animações e interação ----------
(function(){
  var raiz = document.documentElement;
  var anima = raiz.classList.contains('anima');
  var cursorFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Topo mais sólido depois de rolar
  var topo = document.querySelector('header.topo');
  if (topo) {
    var aoRolar = function(){ topo.classList.toggle('rolou', window.scrollY > 24); };
    window.addEventListener('scroll', aoRolar, { passive: true }); aoRolar();
  }

  // Elementos surgem ao entrar na tela (com atraso em cascata entre irmãos)
  if (anima && 'IntersectionObserver' in window) {
    var alvos = '.sec-topo, .perfis > *, .tour-abas, .recurso, .passos li, .compara > div, .compara-fim,'
      + ' .artigo-card, .faq details, .barra-cta, .plano, .mod, .trilha li, .card, .telas-mob figure, .cat-titulo, .aviso, .form';
    var els = Array.prototype.slice.call(document.querySelectorAll(alvos))
      .filter(function(el){ return !el.closest('.abertura'); });
    els.forEach(function(el){
      var irmaos = Array.prototype.filter.call(el.parentElement.children, function(x){ return x.matches(alvos); });
      el.style.setProperty('--i', Math.min(irmaos.indexOf(el), 6));
      el.classList.add('revelar');
    });
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function(el){ obs.observe(el); });
  }

  // "Como funciona": o passo que está no meio da tela acende
  var passos = document.querySelector('.passos');
  if (passos && 'IntersectionObserver' in window) {
    var itens = passos.querySelectorAll('li');
    passos.classList.add('ao-vivo'); itens[0].classList.add('ativo');
    var obsP = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){
        if (!e.isIntersecting) return;
        itens.forEach(function(li){ li.classList.toggle('ativo', li === e.target); });
      });
    }, { rootMargin: '-40% 0px -45% 0px' });
    itens.forEach(function(li){ obsP.observe(li); });
  }

  if (!cursorFino) return;

  // Luz que segue o cursor nos cards de vidro
  document.querySelectorAll('.vidro, .card, .artigo-card, .trilha a').forEach(function(c){
    c.classList.add('luzivel');
    c.addEventListener('pointermove', function(ev){
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  });

  // Notebook inclina de leve acompanhando o cursor
  if (!anima) return;
  document.querySelectorAll('.notebook').forEach(function(nb){
    var area = nb.closest('.tour-painel, .mod') || nb;
    area.addEventListener('pointermove', function(ev){
      var r = nb.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
      nb.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
      nb.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
    });
    area.addEventListener('pointerleave', function(){ nb.style.setProperty('--ry', '0deg'); nb.style.setProperty('--rx', '0deg'); });
  });
})();

// Onda sonora da abertura: barras ondulam sozinhas e crescem perto do cursor (ou do dedo).
(function(){
  var cv = document.querySelector('.abertura__onda');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var area = cv.parentElement;
  var parado = !document.documentElement.classList.contains('anima');
  var W = 0, H = 0, dpr = 1, alvoX = -1, mx = -1, forca = 0, alvoForca = 0, visivel = true, t0 = performance.now();

  function medir(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (parado) desenhar(0);
  }

  function desenhar(t){
    ctx.clearRect(0, 0, W, H);
    var passo = W < 600 ? 9 : 11, larg = W < 600 ? 3 : 4;
    var n = Math.floor(W / passo), sobra = (W - (n - 1) * passo) / 2;
    var grad = ctx.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, 'rgba(122,48,247,.85)');
    grad.addColorStop(1, 'rgba(224,123,234,.95)');
    ctx.fillStyle = grad;
    for (var i = 0; i < n; i++) {
      var x = sobra + i * passo, u = x / W;
      // ondulação de base: duas senoides lentas
      var base = 0.16 + 0.10 * Math.sin(u * 9 + t * 1.3) + 0.07 * Math.sin(u * 23 - t * 2.1);
      // crescimento perto do cursor (curva em sino)
      var bump = 0;
      if (mx >= 0) { var d = (x - mx) / (W < 600 ? 70 : 120); bump = Math.exp(-d * d) * 0.72 * forca; }
      var h = Math.max(3, Math.min(1, base + bump) * H);
      var y = (H - h) / 2;
      ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, base * 2 + bump);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - larg / 2, y, larg, h, larg / 2); else ctx.rect(x - larg / 2, y, larg, h);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function quadro(agora){
    if (visivel) {
      if (alvoX >= 0) mx = mx < 0 ? alvoX : mx + (alvoX - mx) * 0.12;
      forca += (alvoForca - forca) * 0.08;
      desenhar((agora - t0) / 1000);
    }
    requestAnimationFrame(quadro);
  }

  function apontar(ev){
    var r = cv.getBoundingClientRect();
    alvoX = ev.clientX - r.left; alvoForca = 1;
  }
  area.addEventListener('pointermove', apontar, { passive: true });
  area.addEventListener('pointerdown', apontar, { passive: true });
  area.addEventListener('pointerleave', function(){ alvoForca = 0; });
  area.addEventListener('pointerup', function(ev){ if (ev.pointerType !== 'mouse') alvoForca = 0; });

  window.addEventListener('resize', medir);
  medir();
  if (parado) return;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(e){ visivel = e[0].isIntersecting; }).observe(area);
  }
  requestAnimationFrame(quadro);
})();
