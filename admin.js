// Clave simple para desalentar el acceso casual. OJO: al ser un sitio estático,
// cualquiera que mire el código fuente puede verla — no reemplaza un login real.
const ADMIN_PASSWORD = 'burgerparty2026';
// Destino del envío: WhatsApp con código de país (ej. '5491112345678'). Vacío = menú de compartir / elegir contacto.
const SEND_WA = '';
const KEY = 'bp_lista_editada';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---- clave ----
// el navegador puede bloquear el almacenamiento (modo privado): nunca debe romper el panel
const sget = k => { try { return sessionStorage.getItem(k); } catch(e) { return null; } };
const sset = (k, v) => { try { sessionStorage.setItem(k, v); } catch(e) {} };
function unlock(){ $('#gate').hidden = true; $('#panel').hidden = false; sset('bp_admin_ok', '1'); }
function tryUnlock(){ if ($('#gate-input').value === ADMIN_PASSWORD) unlock(); else $('#gate-error').textContent = 'Clave incorrecta.'; }
$('#gate-btn').addEventListener('click', tryUnlock);
$('#gate-input').addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
if (sget('bp_admin_ok') === '1') unlock();

// ---- filas: título, descripción y precio (lo guardado pisa los valores iniciales) ----
let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e) {}
const val = (p, f) => (saved[p.id] && saved[p.id][f] != null) ? saved[p.id][f] : (f === 'price' ? (p.price == null ? '' : String(p.price)) : (p[f] || ''));
$('#rows').innerHTML = Object.keys(CATEGORIES).map(k => {
  const ps = PRODUCTS.filter(p => p.cat === k); if (!ps.length) return '';
  return `<h3 class="lh">${CATEGORIES[k]}</h3>` + ps.map(p => `<div class="ed-row">
    <div><label>Título</label><input data-id="${p.id}" data-f="title" value="${esc(val(p,'title'))}" spellcheck="false"></div>
    <div><label>Descripción</label><input data-id="${p.id}" data-f="desc" value="${esc(val(p,'desc'))}" spellcheck="false"></div>
    <div><label>Precio por ${esc(p.unit)} ($)</label><input class="ed-price" data-id="${p.id}" data-f="price" inputmode="numeric" placeholder="Falta" value="${esc(val(p,'price'))}"></div>
  </div>`).join('');
}).join('');

const say = t => $('#status').textContent = t;
$('#rows').addEventListener('input', e => {
  const i = e.target; if (!i.dataset.id) return;
  (saved[i.dataset.id] = saved[i.dataset.id] || {})[i.dataset.f] = i.value;
  try { localStorage.setItem(KEY, JSON.stringify(saved)); say('Guardado en este navegador.'); } catch(err) { say('No se pudo guardar en este navegador.'); }
});

const priceOf = v => String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
function build(){
  const lines = PRODUCTS.map(p => [p.id, val(p,'title').trim(), val(p,'desc').trim(), priceOf(val(p,'price')), p.unit].join(' | '));
  return 'Lista de precios - Burger Party (corregida)\nid | título | descripción | precio | unidad\n\n' + lines.join('\n');
}
$('#send').addEventListener('click', () => {
  const text = build();
  if (SEND_WA) { window.open('https://wa.me/' + SEND_WA + '?text=' + encodeURIComponent(text), '_blank'); say('Se abrió WhatsApp: tocá enviar.'); }
  else if (navigator.share) { navigator.share({ title: 'Lista de precios Burger Party', text }).then(() => say('Enviado.')).catch(() => {}); }
  else { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); say('Se abrió WhatsApp: elegí el contacto y enviá.'); }
});
$('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(build()); say('Resumen copiado — pegalo donde lo tengas que mandar.'); }
  catch(e) { say('No se pudo copiar automáticamente. Usá Enviar corrección.'); }
});
$('#reset').addEventListener('click', () => {
  if (confirm('¿Borrar tus cambios y volver a los valores iniciales?')) { try { localStorage.removeItem(KEY); } catch(e) {} location.reload(); }
});
