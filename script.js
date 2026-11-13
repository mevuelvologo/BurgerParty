(function(){
const WA='5491163951550', IG='burgerpartyfoods', ADDR='Bonifacini 4691, Caseros, Provincia de Buenos Aires, Argentina';
document.querySelectorAll('[id^="ig-btn"]').forEach(e=>e.href='https://instagram.com/'+IG);
document.querySelectorAll('[id^="wa-btn"]').forEach(e=>e.href='https://wa.me/'+WA);
document.querySelectorAll('[id^="map-btn"]').forEach(e=>e.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(ADDR));
const WAICON=(document.querySelector('[id^="wa-btn"] svg')||{}).outerHTML||'';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const P=Object.fromEntries(PRODUCTS.map(p=>[p.id,p]));
const money=n=>n==null?'A confirmar':'$'+String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const fq=(q,p)=>String(q).replace('.',',')+(p&&p.unit==='kg'?' kg':'');
const unit=p=>p.price==null?'':' /'+(p.unit==='unidad'?'u':p.unit);
const total=it=>it.length&&it.every(([id])=>P[id].price!=null)?it.reduce((a,[id,n])=>a+P[id].price*n,0):null;
const waLink=m=>'https://wa.me/'+WA+'?text='+encodeURIComponent(m);
let q='',tab='packs',sort='n-asc';
const tokens=()=>norm(q).replace(/combos?/g,'pack').split(/\s+/).filter(Boolean); // "combo" sigue funcionando como búsqueda
const match=t=>{const h=norm(t);return tokens().every(k=>h.includes(k));};
const prodText=p=>[p.title,p.brand,p.desc,CATEGORIES[p.cat]].join(' ');
const packText=pk=>'pack '+pk.n+' '+pk.title+' '+pk.items.map(([id])=>prodText(P[id])).join(' ');
const burgers=pk=>pk.items.reduce((a,[id,n])=>a+(P[id].cat==='hamburguesa'?n:0),0);

// ---------- IMÁGENES ----------
const Q=t=>`<span class="q" title="${esc(t)}">?</span>`;
function photos(p,n){ // fotos de un producto para una cantidad n; null = falta la foto
  if(p.stacks){const sz=Object.keys(p.stacks).map(Number).sort((a,b)=>b-a);let r=n,o=[];
    while(r>0&&o.length<2){const k=sz.find(x=>x<=r)||sz[sz.length-1];o.push(p.stacks[k]);r-=k;}return o;}
  return [p.img||null];
}
const th=p=>{const f=p.img||(p.stacks&&(p.stacks[4]||Object.values(p.stacks)[0]));return `<span class="th">${f?`<img src="${f}" alt="" loading="lazy">`:Q('Falta la foto: '+p.title)}</span>`;};
const logo=b=>!b?'':LOGOS[b]?`<img src="${LOGOS[b]}" alt="${esc(b)}">`:`<span class="q q-s" title="Falta el logo: ${esc(b)}">?</span>`;

// ---------- ESCENARIO: dibuja TODAS las unidades del pack, achicadas para que entren ----------
function units(p,n){
  if(p.stacks){const t=p.stacks,o=[];let r=n;if(r%4===2){const b=t[6]&&r>=6?6:2;o.push(t[b]);r-=b;}for(;r>=4;r-=4)o.push(t[4]);if(r>0)o.push(t[2]);return o;}
  return Array(Math.max(1,Math.ceil(n/(p.per||1)-1e-9))).fill(p.img||null);
}
function fit(imgs,s){const g=s*.1,rows=[];let cur=null,x=0;
  for(const m of imgs){const w=s*(m.eq?1:Math.sqrt(m.ar)),h=w/m.ar;if(w>100)return null;
    if(!cur||x+w>100){cur={it:[],w:0,h:0};rows.push(cur);x=0;}
    cur.it.push({m,w,h});cur.w=x+w;cur.h=Math.max(cur.h,h);x+=w+g;}
  const tot=rows.reduce((a,r)=>a+r.h,0)+g*(rows.length-1);return tot<=70?{rows,g,tot}:null;}
function stage(pk){
  const imgs=pk.items.flatMap(([id,n])=>units(P[id],n).map(src=>({src,ar:(src&&AR[src])||1,t:P[id].title,eq:P[id].cat==='hamburguesa'||P[id].cat==='pan'})));
  let lo=1,hi=34,best=fit(imgs,1);
  for(let i=0;i<30;i++){const mid=(lo+hi)/2,r=fit(imgs,mid);if(r){lo=mid;best=r;}else hi=mid;}
  let y=(70-best.tot)/2,html='';
  for(const r of best.rows){let x=(100-r.w)/2;
    for(const o of r.it){const pos=`left:${x.toFixed(2)}%;top:${((y+r.h-o.h)/70*100).toFixed(2)}%;width:${o.w.toFixed(2)}%`;
      html+=o.m.src?`<img src="${o.m.src}" alt="" loading="lazy" style="${pos}">`:`<span class="q" style="${pos}" title="Falta la foto: ${esc(o.m.t)}">?</span>`;x+=o.w+best.g;}
    y+=r.h+best.g;}
  return html;
}

// ---------- PACKS ----------
function packCard(pk){
  const t=total(pk.items);
  const msg='Hola! Quiero el Pack '+pk.n+(t!=null?' - Precio: '+money(t):'');
  const brands=[...new Set(pk.items.map(([id])=>P[id].brand))].map(logo).join('');
  return `<article class="pack" style="--c1:${pk.color[0]};--c2:${pk.color[1]};--ac:${pk.accent}">
  <div class="pack-head"><span>PACK</span><b>${pk.n}</b></div><h3>${esc(pk.title)}</h3>
  <div class="stage">${stage(pk)}</div>
  <ul class="pack-items">${pk.items.map(([id,n])=>`<li><b>${fq(n,P[id])}</b> ${esc(P[id].title)}</li>`).join('')}</ul>
  <div class="pack-brands">${brands}</div>
  <div class="pack-foot"><div class="pack-price${t==null?' tbc':''}">${money(t)}</div><a class="order" target="_blank" rel="noopener" href="${waLink(msg)}">${WAICON}<span>Quiero esto</span></a></div></article>`;
}
function renderPacks(){
  const list=PACKS.filter(pk=>match(packText(pk))),[k,d]=sort.split('-');
  const key=pk=>k==='n'?pk.n:k==='p'?total(pk.items):burgers(pk);
  list.sort((a,b)=>{const x=key(a),y=key(b);if(x==null&&y==null)return a.n-b.n;if(x==null)return 1;if(y==null)return -1;return(d==='asc'?x-y:y-x)||a.n-b.n;});
  $('#packs-grid').innerHTML=list.map(packCard).join('')||'<p class="empty">No encontramos packs con esa búsqueda.</p>';
  return list.length;
}

// ---------- LISTA DE PRECIOS (solo consulta) ----------
function renderList(){
  let c=0;
  const html=Object.keys(CATEGORIES).map(k=>{const ps=PRODUCTS.filter(p=>p.cat===k&&match(prodText(p)));c+=ps.length;
    return ps.length?`<h3 class="lh">${CATEGORIES[k]}</h3><div class="lrows">${ps.map(p=>`<div class="lrow"><div><b>${esc(p.title)}</b><small>${esc(p.desc||'')}</small></div><div class="lp">${money(p.price)}<small>${p.price==null?'':'por '+p.unit}</small></div></div>`).join('')}</div>`:'';}).join('');
  $('#list').innerHTML=html||'<p class="empty">No encontramos productos con esa búsqueda.</p>';
  return c;
}

// ---------- ARMADOR (Productos) ----------
const S={bq:0,bid:null,pid:null,x:{}};let cur=0;
const STEPS=[
  {t:'Hamburguesas',cats:['hamburguesa']},{t:'Panes',cats:['pan']},{t:'Papas y nuggets',cats:['papas','nuggets']},
  {t:'Bebidas',cats:['bebida']},{t:'Quesos, aderezos y snacks',cats:['queso','aderezo','snack','salchicha']}
].map(s=>({...s,items:PRODUCTS.filter(p=>s.cats.includes(p.cat))})).filter(s=>s.items.length);
const SUG={papas:{per:.125,lbl:'kg de papas',unit:'kg'},queso:{per:1,lbl:'fetas de queso',unit:'feta'}};
const items=()=>{const a=[];if(S.bid&&S.bq)a.push([S.bid,S.bq]);if(S.pid&&S.bq)a.push([S.pid,S.bq]);for(const id in S.x)if(S.x[id]>0)a.push([id,S.x[id]]);return a;};
const opt=(p,act,on)=>`<button type="button" class="opt${on?' on':''}" data-act="${act}" data-id="${p.id}">${th(p)}<b>${esc(p.title)}</b><small>${esc(p.desc||'')}</small><span class="op">${money(p.price)}<i>${unit(p)}</i></span></button>`;
const stp=(id,v,p)=>`<div class="stp"><button type="button" data-act="xdec" data-id="${id}">−</button><b>${fq(v,p)}</b><button type="button" data-act="xinc" data-id="${id}">+</button></div>`;
function summary(){
  const it=items(),t=total(it);
  const same=PACKS.find(pk=>pk.items.length===it.length&&pk.items.every(([id,n])=>it.some(([i,m])=>i===id&&m===n)));
  const msg='Hola! Quiero armar este pack:\n'+it.map(([id,n])=>'- '+fq(n,P[id])+' '+P[id].title).join('\n')+(t!=null?'\n\nTotal: '+money(t):'');
  return `<div class="sum"><div class="sum-top"><b>Tu pack</b><span>${it.length?money(t):'Todavía vacío'}</span></div>
  <div class="sum-chips">${it.map(([id,n])=>`<span>${fq(n,P[id])} × ${esc(P[id].title)}</span>`).join('')||'<span class="muted">Elegí hamburguesas para empezar</span>'}</div>
  ${same?`<p class="sum-note">¡Es igual al Pack ${same.n}!</p>`:''}
  ${it.length?`<div class="sum-act"><a class="order" target="_blank" rel="noopener" href="${waLink(msg)}">${WAICON}<span>Pedir este pack</span></a><button type="button" class="ghost" data-act="clear">Vaciar</button></div>`:''}</div>`;
}
function stepSum(s,i){
  if(i===0)return S.bid?S.bq+' × '+P[S.bid].title:'';
  if(i===1)return S.pid?P[S.pid].title:'';
  const n=s.items.filter(p=>S.x[p.id]>0).length;return n?n+' elegido'+(n>1?'s':''):'Opcional';
}
function stepBody(s,i){
  if(i===0)return `<p class="lbl">¿Cuántas hamburguesas?</p><div class="chips">${[4,8,12,20,40,60].map(v=>`<button type="button" class="chip${S.bq===v?' on':''}" data-act="bq" data-v="${v}">${v}</button>`).join('')}</div>
  <div class="stp"><button type="button" data-act="bqdec">−</button><b>${S.bq}</b><button type="button" data-act="bqinc">+</button></div>
  <p class="lbl">Marca y gramaje</p><div class="opts">${s.items.map(p=>opt(p,'bid',S.bid===p.id)).join('')}</div>`;
  if(i===1)return S.bq?`<p class="lbl">${S.bq} panes, uno por hamburguesa. ¿De qué marca?</p><div class="opts">${s.items.map(p=>opt(p,'pid',S.pid===p.id)).join('')}</div>`:'<p class="muted">Primero elegí cuántas hamburguesas.</p>';
  const hints=S.bq?s.cats.map(c=>{const g=SUG[c],p=g&&PRODUCTS.find(x=>x.cat===c&&x.unit===g.unit);if(!p)return'';const v=S.bq*g.per;
    return `<p class="hint">Para ${S.bq} hamburguesas sugerimos ${String(v).replace('.',',')} ${g.lbl}. <button type="button" class="link" data-act="sug" data-id="${p.id}" data-v="${v}">Agregar sugerido</button></p>`;}).join(''):'';
  return hints+`<div class="opts">${s.items.map(p=>`<div class="opt${S.x[p.id]>0?' on':''}">${th(p)}<b>${esc(p.title)}</b><small>${esc(p.desc||'')}</small><span class="op">${money(p.price)}<i>${unit(p)}</i></span>${stp(p.id,S.x[p.id]||0,p)}</div>`).join('')}</div>`;
}
function renderBuilder(){
  let html=summary();
  if(tokens().length){
    const r=PRODUCTS.filter(p=>match(prodText(p)));
    $('#builder').innerHTML=html+`<h3 class="lh">Resultados</h3><div class="opts">${r.map(p=>`<div class="opt">${th(p)}<b>${esc(p.title)}</b><small>${esc(p.desc||'')}</small><span class="op">${money(p.price)}<i>${unit(p)}</i></span><button type="button" class="ghost" data-act="add" data-id="${p.id}">Agregar</button></div>`).join('')}</div>`;
    return r.length;
  }
  html+=STEPS.map((s,i)=>{const o=i===cur;return `<section class="step${o?' open':''}"><button type="button" class="step-h" data-act="open" data-i="${i}"><span class="num">${i+1}</span><b>${s.t}</b><small>${esc(stepSum(s,i))}</small></button>${o?`<div class="step-b">${stepBody(s,i)}<button type="button" class="next" data-act="next">${i===STEPS.length-1?'Listo':'Siguiente'}</button></div>`:''}</section>`;}).join('');
  $('#builder').innerHTML=html;return PRODUCTS.length;
}
$('#builder').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id,p=P[id];
  if(a==='bq')S.bq=+b.dataset.v;
  else if(a==='bqinc')S.bq+=2;
  else if(a==='bqdec')S.bq=Math.max(0,S.bq-2);
  else if(a==='bid'){S.bid=id;if(!S.bq)S.bq=4;}
  else if(a==='pid'){S.pid=id;if(!S.bq)S.bq=4;}
  else if(a==='xinc'||a==='xdec'){const st=p.step||1;S.x[id]=Math.max(0,+((S.x[id]||0)+(a==='xinc'?st:-st)).toFixed(2));}
  else if(a==='sug'){const st=p.step||1;S.x[id]=Math.max(st,Math.round(+b.dataset.v/st)*st);}
  else if(a==='next')cur=Math.min(STEPS.length,cur+1);
  else if(a==='open')cur=+b.dataset.i;
  else if(a==='add'){if(p.cat==='hamburguesa'){S.bid=id;if(!S.bq)S.bq=4;}else if(p.cat==='pan'){S.pid=id;if(!S.bq)S.bq=4;}else S.x[id]=(S.x[id]||0)+(p.step||1);}
  else if(a==='clear'){S.bq=0;S.bid=S.pid=null;S.x={};cur=0;}
  renderBuilder();
});

// ---------- BUSCADOR, ORDEN Y PESTAÑAS ----------
const KEYS=['packs','build','list'];
function renderAll(){
  const c={packs:renderPacks(),build:renderBuilder(),list:renderList()};
  document.querySelectorAll('.tab').forEach(t=>{t.querySelector('i').textContent=tokens().length?c[t.dataset.t]:'';t.classList.toggle('on',t.dataset.t===tab);});
  KEYS.forEach(k=>$('#sec-'+k).hidden=k!==tab);
  return c;
}
$('#q').addEventListener('input',e=>{q=e.target.value;let c=renderAll();if(tokens().length&&!c[tab]){const n=KEYS.find(k=>c[k]);if(n){tab=n;renderAll();}}});
$('#sort').addEventListener('change',e=>{sort=e.target.value;renderPacks();});
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{tab=t.dataset.t;renderAll();}));
renderAll();
})();
