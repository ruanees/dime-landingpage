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
