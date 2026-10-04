// Tema claro/escuro (o tema salvo já é aplicado por um script no <head>)
function alternarTema(){
  var n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = n;
  try { localStorage.setItem('dime-tema', n); } catch (e) {}
  document.querySelector('meta[name=theme-color]').setAttribute('content', n === 'dark' ? '#0C0A12' : '#F6F5FA');
}

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
