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
const money=n=>n==null?'Consultar':'$'+String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const fq=(q,p)=>String(q).replace('.',',')+(p&&p.unit==='kg'?' kg':'');
const unit=p=>p.price==null?'':' /'+(p.unit==='unidad'?'u':p.unit);
const total=it=>it.length&&it.every(([id])=>P[id].price!=null)?it.reduce((a,[id,n])=>a+P[id].price*n,0):null;
const waLink=m=>'https://wa.me/'+WA+'?text='+encodeURIComponent(m);
let q='',tab='packs',sort='n-asc';
const tokens=()=>norm(q).replace(/combos?/g,'pack').split(/\s+/).filter(Boolean); // "combo" sigue funcionando como búsqueda
const match=t=>{const h=norm(t);return tokens().every(k=>h.includes(k));};
const prodText=p=>[p.title,p.brand,p.desc,CATEGORIES[p.cat],p.kw||''].join(' ');
const packText=pk=>'pack '+pk.n+' '+pk.title+' '+pk.items.map(([id])=>prodText(P[id])).join(' ');
const relN={packs:0,build:0,list:0};
const part=it=>({sum:it.reduce((a,[id,n])=>a+(P[id].price!=null?P[id].price*n:0),0),unk:it.filter(([id])=>P[id].price==null)});
function related(){ // productos y packs relacionados con la búsqueda actual (misma categoría o "rel" cargado a mano)
  const hits=PRODUCTS.filter(p=>match(prodText(p))),H=new Set(hits.map(p=>p.id)),R=new Set();
  hits.forEach(p=>{(p.rel||[]).forEach(i=>R.add(i));PRODUCTS.forEach(x=>{if(x.cat===p.cat)R.add(x.id);});});
  H.forEach(i=>R.delete(i));
  const prods=[...R].map(i=>P[i]).slice(0,8),ids=new Set([...H,...R]);
  return {prods,packs:PACKS.filter(pk=>!match(packText(pk))&&pk.items.some(([id])=>ids.has(id)))};
}
const consultMsg=t=>'Hola! Quiero consultar por: '+t;
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

// ---------- ESCENARIO MODULAR ----------
// Módulo = una columna del alto de una pila de 4 hamburguesas. Cada 4 panes apilados (uno sobre otro) ocupan esa misma
// altura, y el resto de los productos entra en una celda del mismo tamaño. Así no quedan huecos entre las filas.
function cells(pk){
  const H=[],B=[],O=[];
  pk.items.forEach(([id,n])=>{const p=P[id];
    if(p.stacks){for(let r=n;r>0;r-=4){const k=Math.min(4,r);H.push({t:'img',src:p.stacks[k]||p.stacks[4]});}}
    else if(p.cat==='pan'){for(let r=n;r>0;r-=4)B.push({t:'buns',src:p.img,k:Math.min(4,r),n:p.title});}
    else for(let i=0,m=Math.max(1,Math.ceil(n/(p.per||1)-1e-9));i<m;i++)O.push({t:'one',src:p.img||null,n:p.title});});
  const L=[];for(let i=0;i<Math.max(H.length,B.length);i++){if(H[i])L.push(H[i]);if(B[i])L.push(B[i]);}
  return L.concat(O);
}
function stage(pk){
  const L=cells(pk),f=pk.items.map(([id])=>P[id]).find(p=>p.stacks),Hm=1/((f&&AR[f.stacks[4]])||1),GAP=.06,N=L.length;
  let best={w:0};
  for(let c=1;c<=N;c++){const r=Math.ceil(N/c),w=Math.min(100/(c+(c-1)*GAP),70/(r*Hm+(r-1)*GAP));if(w>best.w)best={c,r,w};}
  const w=Math.min(best.w,26),g=w*GAP,h=w*Hm,tot=best.r*h+(best.r-1)*g,Hs=Math.max(34,Math.min(70,tot+4));
  const put=(o,x,y,iw)=>`left:${x.toFixed(2)}%;top:${(y/Hs*100).toFixed(2)}%;width:${iw.toFixed(2)}%`;
  let html='';
  L.forEach((m,i)=>{const row=Math.floor(i/best.c),cnt=Math.min(best.c,N-row*best.c),x0=(100-(cnt*w+(cnt-1)*g))/2,cx=x0+(i%best.c)*(w+g),bot=(Hs-tot)/2+row*(h+g)+h,ar=(m.src&&AR[m.src])||1;
    if(m.t==='img')html+=`<img src="${m.src}" alt="" loading="lazy" style="${put(m,cx,bot-w/ar,w)}">`;
    else if(m.t==='buns'){const hb=w/ar,d=Math.max((h-hb)/3,w*.05);
      for(let j=0;j<m.k;j++)html+=`<img src="${m.src}" alt="" loading="lazy" style="${put(m,cx,bot-hb-(m.k-1-j)*d,w)}">`;}
    else if(m.src){const iw=ar>=w/h?w:h*ar;html+=`<img src="${m.src}" alt="" loading="lazy" style="${put(m,cx+(w-iw)/2,bot-iw/ar,iw)}">`;}
    else{const q=Math.min(w,h)*.5;html+=`<span class="q" style="${put(m,cx+(w-q)/2,bot-q,q)}" title="Falta la foto: ${esc(m.n)}">?</span>`;}});
  return `<div class="stage" style="aspect-ratio:100/${Hs.toFixed(1)}">${html}</div>`;
}

// ---------- PACKS ----------
function packCard(pk){
  const t=total(pk.items);
  const msg=t!=null?'Hola! Quiero el Pack '+pk.n+' - Precio: '+money(t):consultMsg('Pack '+pk.n);
  const brands=[...new Set(pk.items.map(([id])=>P[id].brand))].map(logo).join('');
  return `<article class="pack" style="--c1:${pk.color[0]};--c2:${pk.color[1]};--ac:${pk.accent}">
  <div class="pack-head"><span>PACK</span><b>${pk.n}</b></div><h3>${esc(pk.title)}</h3>
  ${stage(pk)}
  <ul class="pack-items">${pk.items.map(([id,n])=>`<li><b>${fq(n,P[id])}</b> ${esc(P[id].title)}</li>`).join('')}</ul>
  <div class="pack-brands">${brands}</div>
  <div class="pack-foot"><div class="pack-price${t==null?' tbc':''}">${money(t)}</div><a class="order" target="_blank" rel="noopener" href="${waLink(msg)}">${WAICON}<span>Quiero esto</span></a></div></article>`;
}
function renderPacks(){
  const list=PACKS.filter(pk=>match(packText(pk))),[k,d]=sort.split('-');
  const key=pk=>k==='n'?pk.n:k==='p'?total(pk.items):burgers(pk);
  list.sort((a,b)=>{const x=key(a),y=key(b);if(x==null&&y==null)return a.n-b.n;if(x==null)return 1;if(y==null)return -1;return(d==='asc'?x-y:y-x)||a.n-b.n;});
  let html=list.map(packCard).join(''),rn=0;
  if(tokens().length){const rp=related().packs;rn=rp.length;
    if(!list.length)html+='<p class="empty">No encontramos packs con esa búsqueda.</p>';
    if(rp.length)html+='<h3 class="lh rel">También te puede interesar</h3>'+rp.map(packCard).join('');}
  $('#packs-grid').innerHTML=html;relN.packs=rn;
  return list.length;
}

// ---------- LISTA DE PRECIOS (solo consulta) ----------
const lrow=p=>`<div class="lrow"><div><b>${esc(p.title)}</b><small>${esc(p.desc||'')}</small></div><div class="lp">${p.price==null?`<a class="consult" target="_blank" rel="noopener" href="${waLink(consultMsg(p.title))}">Consultar</a>`:`${money(p.price)}<small>por ${p.unit}</small>`}</div></div>`;
function renderList(){
  let c=0;
  let html=Object.keys(CATEGORIES).map(k=>{const ps=PRODUCTS.filter(p=>p.cat===k&&match(prodText(p)));c+=ps.length;
    return ps.length?`<h3 class="lh">${CATEGORIES[k]}</h3><div class="lrows">${ps.map(lrow).join('')}</div>`:'';}).join('');
  let rn=0;
  if(tokens().length){const r=related().prods;rn=r.length;if(r.length)html+=`<h3 class="lh">También te puede interesar</h3><div class="lrows">${r.map(lrow).join('')}</div>`;}
  $('#list').innerHTML=html||'<p class="empty">No encontramos productos con esa búsqueda.</p>';relN.list=rn;
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
  const it=items(),{sum,unk}=part(it);
  const same=PACKS.find(pk=>pk.items.length===it.length&&pk.items.every(([id,n])=>it.some(([i,m])=>i===id&&m===n)));
  const msg='Hola! Quiero armar este pack:\n'+it.map(([id,n])=>'- '+fq(n,P[id])+' '+P[id].title).join('\n')+(unk.length?'\n\nTotal: '+(sum?money(sum)+' + ':'')+'a consultar: '+unk.map(([id])=>P[id].title).join(', '):'\n\nTotal: '+money(sum));
  return `<div class="sum"><div class="sum-top"><b>Tu pack</b><span>${!it.length?'Todavía vacío':unk.length?(sum?money(sum)+' + consultar':'Consultar'):money(sum)}</span></div>
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
    const r=PRODUCTS.filter(p=>match(prodText(p))),rel=related().prods,card=p=>`<div class="opt">${th(p)}<b>${esc(p.title)}</b><small>${esc(p.desc||'')}</small><span class="op">${money(p.price)}<i>${unit(p)}</i></span><button type="button" class="ghost" data-act="add" data-id="${p.id}">Agregar</button></div>`;
    $('#builder').innerHTML=html+`<h3 class="lh">Resultados</h3><div class="opts">${r.map(card).join('')}</div>`+(rel.length?`<h3 class="lh">También te puede interesar</h3><div class="opts">${rel.map(card).join('')}</div>`:'');
    relN.build=rel.length;return r.length;
  }
  html+=STEPS.map((s,i)=>{const o=i===cur;return `<section class="step${o?' open':''}"><button type="button" class="step-h" data-act="open" data-i="${i}"><span class="num">${i+1}</span><b>${s.t}</b><small>${esc(stepSum(s,i))}</small></button>${o?`<div class="step-b">${stepBody(s,i)}<button type="button" class="next" data-act="next">${i===STEPS.length-1?'Listo':'Siguiente'}</button></div>`:''}</section>`;}).join('');
  $('#builder').innerHTML=html;relN.build=0;return PRODUCTS.length;
}
$('#builder').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id,p=P[id];
  if(a==='bq')S.bq=+b.dataset.v;
  else if(a==='bqinc')S.bq=S.bq?S.bq+2:4;
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
$('#q').addEventListener('input',e=>{q=e.target.value;let c=renderAll();if(tokens().length&&!c[tab]&&!relN[tab]){const n=KEYS.find(k=>c[k]);if(n){tab=n;renderAll();}}});
$('#sort').addEventListener('change',e=>{sort=e.target.value;renderPacks();});
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{tab=t.dataset.t;renderAll();}));
// tira de marcas del pie: tocar un logo = buscar esa marca
const strip=$('#brand-strip');
if(strip){strip.innerHTML=BRAND_STRIP.map(b=>`<button type="button" class="brand" data-q="${esc(b)}" aria-label="Buscar ${esc(b)}">${LOGOS[b]?`<img src="${LOGOS[b]}" alt="${esc(b)}" loading="lazy">`:Q('Falta el logo: '+b)}</button>`).join('');
  strip.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;const i=$('#q');i.value=b.dataset.q;i.dispatchEvent(new Event('input',{bubbles:true}));window.scrollTo({top:0,behavior:'smooth'});});}
renderAll();
})();
