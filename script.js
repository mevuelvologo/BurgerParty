// ---------- CONFIG ----------
  const WHATSAPP_PHONE = '5491163951550'; // 11 6395-1550 (AR)
  const INSTAGRAM_USER = 'burgerpartyfoods';
  const ADDRESS_QUERY  = 'Bonifacini 4691, Caseros, Provincia de Buenos Aires, Argentina';

  document.querySelectorAll('#ig-btn, #ig-btn-2').forEach(el => el.href = `https://instagram.com/${INSTAGRAM_USER}`);
  document.querySelectorAll('#wa-btn, #wa-btn-2').forEach(el => el.href = `https://wa.me/${WHATSAPP_PHONE}`);
  document.querySelectorAll('#map-btn, #map-btn-2').forEach(el => el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_QUERY)}`);

  // ---------- DATA ----------
  // mode 'replace': el nombre empieza con un número (ej "4 Super Burger") que se
  //   reemplaza directo por el total (4 -> 6 -> 8...), sin "x". Precio escala
  //   proporcional al total sobre baseCount.
  // mode 'multiply': el nombre no tiene número propio, se antepone "N× " y el
  //   precio es precio unitario x cantidad.
  const products = [
    { id:'p1', type:'photo', img:'images/papas-baston.png',   name:'Papas Bastón',        sub:'x 2 Kg',              price:'8.000',  step:1, mode:'multiply' },
    { id:'p2', type:'photo', img:'images/latas-birra.png',    name:'6 Latas De Birra',    sub:'x 473 cc',            price:'12.000', step:1, mode:'multiply' },
    { id:'p3', type:'photo', img:'images/super-burger.jpg',   name:'4 Super Burger',      sub:'con pan Bimbo Artesano',      price:'10.000', step:2, mode:'replace', baseCount:4, nameRest:' Super Burger' },
    { id:'p4', type:'photo', img:'images/burger-clasicas.jpg',name:'6 Burger Clásicas',   sub:'con pan Bimbo Artesano',      price:'14.000', step:2, mode:'replace', baseCount:6, minCount:4, nameRest:' Burger Clásicas' },
    { id:'p5', type:'photo', img:'images/papas-smiles.png',   name:'Papas Smiles',        sub:'x 700 gr',            price:'8.000',  step:1, mode:'multiply' },
    { id:'p6', type:'photo', img:'images/fernet-coca.png',    name:'Fernet con Coca',     sub:'4,5L + 750cc',        price:'27.500', step:1, mode:'multiply' },
    { id:'p7', type:'photo', img:'images/burger-union.jpg',   name:'4 Burger Unión 55 g', sub:'con pan Bimbo Artesano',      price:'6.500',  step:2, mode:'replace', baseCount:4, nameRest:' Burger Unión 55 g' },
    { id:'p8', type:'photo', img:'images/salchichas.jpg',     name:'6 Salchichas Largas', sub:'con Pan Fargo',       price:'8.000',  step:1, mode:'multiply' },
  ];

  // ---------- PACKS (3 pantallas rotando promos) ----------
  // Para agregar un pack nuevo en el futuro: subí las dos imágenes a images/
  // (miniatura: pack-N.jpg, grande para pantalla completa: pack-N-large.jpg)
  // y sumá un objeto acá, nada más.
  const packs = [
    { img:'images/pack-1.jpg', large:'images/pack-1-large.jpg', alt:'Pack 1 — 4 hamburguesas con pan y papas' },
    { img:'images/pack-2.jpg', large:'images/pack-2-large.jpg', alt:'Pack 2 — 8 hamburguesas con pan, papas y cheddar' },
    { img:'images/pack-3.jpg', large:'images/pack-3-large.jpg', alt:'Pack 3 — 60 hamburguesas con pan y aderezo' },
    { img:'images/pack-4.jpg', large:'images/pack-4-large.jpg', alt:'Pack 4 — 4 hamburguesas de pollo con pan' },
    { img:'images/pack-5.jpg', large:'images/pack-5-large.jpg', alt:'Pack 5 — 4 UG Gigantes con pan y papas' },
    { img:'images/pack-6.jpg', large:'images/pack-6-large.jpg', alt:'Pack 6 — 4 hamburguesas con pan y Coca-Cola' },
  ];

  (function setupPacksScreens(){
    const container = document.getElementById('packs-screens');
    if(!container || packs.length === 0) return;

    const SLOTS = 3;
    const ROTATE_MS = 3000;
    const FADE_MS = 500;

    // Si hay 3 packs o menos, se muestran fijos, sin rotar.
    const n = Math.min(SLOTS, packs.length);
    container.innerHTML = packs.slice(0, n).map((p, i) => `
      <div class="pack-screen" data-pack="${i}" role="button" tabindex="0" aria-label="Ver ${p.alt} en pantalla completa">
        <img src="${p.img}" alt="${p.alt}" loading="lazy">
      </div>
    `).join('');

    const screens = [...container.querySelectorAll('.pack-screen')];

    // ---------- PANTALLA COMPLETA (lightbox) ----------
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Pack en pantalla completa');
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Cerrar">&times;</button>
      <img class="lightbox-img" alt="">
    `;
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    let lightboxOpen = false;
    let lastFocused = null;

    function openLightbox(packIndex){
      const p = packs[packIndex];
      lightboxImg.src = p.large || p.img;
      lightboxImg.alt = p.alt;
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      lightboxOpen = true;
      document.body.classList.add('lightbox-open');
      lightboxClose.focus();
    }
    function closeLightbox(){
      if(!lightboxOpen) return;
      lightbox.hidden = true;
      lightboxOpen = false;
      document.body.classList.remove('lightbox-open');
      lightboxImg.removeAttribute('src');
      if(lastFocused && lastFocused.focus) lastFocused.focus();
    }

    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLightbox(); });

    screens.forEach(screen => {
      const open = () => openLightbox(parseInt(screen.dataset.pack, 10));
      screen.addEventListener('click', open);
      screen.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); }
      });
    });

    // ---------- ROTACIÓN ----------
    if(packs.length <= SLOTS) return;

    // "visible" = pack que muestra cada pantalla ahora; "queue" = packs que esperan su turno.
    const visible = [0, 1, 2];
    const queue = [];
    for(let i = SLOTS; i < packs.length; i++) queue.push(i);
    let slotPtr = 0;
    let hoverPaused = false;

    function swapSlot(slotIndex, packIndex){
      const screen = screens[slotIndex];
      const oldImg = screen.querySelector('img');
      const newImg = document.createElement('img');
      newImg.src = packs[packIndex].img;
      newImg.alt = packs[packIndex].alt;
      newImg.loading = 'lazy';
      newImg.style.opacity = '0';
      screen.appendChild(newImg);
      screen.dataset.pack = packIndex;
      screen.setAttribute('aria-label', `Ver ${packs[packIndex].alt} en pantalla completa`);
      // forzar reflow para que la transición de opacidad corra
      void newImg.offsetWidth;
      oldImg.classList.add('is-out');
      newImg.style.opacity = '1';
      setTimeout(() => oldImg.remove(), FADE_MS + 50);
    }

    function tick(){
      if(hoverPaused || lightboxOpen) return;
      const incoming = queue.shift();
      const outgoing = visible[slotPtr];
      visible[slotPtr] = incoming;
      swapSlot(slotPtr, incoming);
      queue.push(outgoing);
      slotPtr = (slotPtr + 1) % SLOTS;
    }

    container.addEventListener('mouseenter', () => { hoverPaused = true; });
    container.addEventListener('mouseleave', () => { hoverPaused = false; });

    setInterval(tick, ROTATE_MS);
  })();

  const grid = document.getElementById('grid');

  function parsePrice(str){
    const digits = (str || '').replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }
  function formatARS(n){
    return n.toLocaleString('es-AR');
  }

  function buildConsultMessage(name, sub, qty, totalPrice){
    let msg = `Hola! Quiero consultar por: ${name}${sub ? ' (' + sub + ')' : ''}`;
    msg += ` - Cantidad: ${qty}`;
    if(totalPrice) msg += ` - Precio: $${formatARS(totalPrice)}`;
    return msg;
  }
  function openWhatsApp(msg){
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ---------- CARRITO ----------
  const cartBtn = document.getElementById('cart-btn');
  const cartCountEl = document.getElementById('cart-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');

  function allCards(){
    return [...grid.querySelectorAll('.card')];
  }

  function updateCart(){
    let totalUnits = 0, subtotal = 0;
    allCards().forEach(card => {
      const qty = parseInt(card.dataset.qty || '0', 10);
      if(qty > 0){
        totalUnits += qty;
        subtotal += parseInt(card.dataset.totalPrice || '0', 10);
      }
    });
    cartCountEl.textContent = totalUnits;
    cartSubtotalEl.textContent = totalUnits === 0 ? 'Tu pedido' : `$ ${formatARS(subtotal)}`;
    cartBtn.classList.toggle('is-empty', totalUnits === 0);
  }

  cartBtn.addEventListener('click', () => {
    const active = allCards().filter(card => parseInt(card.dataset.qty || '0', 10) > 0);
    if(active.length === 0) return;

    let subtotal = 0;
    const lines = active.map(card => {
      const qty = parseInt(card.dataset.qty, 10);
      const lineTotal = parseInt(card.dataset.totalPrice, 10);
      subtotal += lineTotal;
      const name = card.dataset.name || '';
      const sub = card.dataset.sub || '';
      return `- ${name}${sub ? ' (' + sub + ')' : ''} x${qty} - $${formatARS(lineTotal)}`;
    });

    const msg = `Hola! Quiero hacer este pedido:\n${lines.join('\n')}\n\nSubtotal: $${formatARS(subtotal)}`;
    openWhatsApp(msg);
  });

  // ---------- TARJETAS DE PRODUCTO ----------
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = `card card--${p.type}`;
    card.draggable = true;
    card.dataset.id = p.id;

    card.innerHTML = `
      <div class="qty-stepper" data-step="${p.step}">
        <button class="qty-btn qty-minus" type="button" aria-label="Restar">&minus;</button>
        <span class="qty-value">0</span>
        <button class="qty-btn qty-plus" type="button" aria-label="Sumar">+</button>
      </div>
      ${p.type === 'photo' ? `<div class="art"><img src="${p.img}" alt="${p.name}"></div>` : ''}
      <h3><span class="qty-prefix"></span><span class="title-text">${p.name}</span></h3>
      <p class="sub">${p.sub}</p>
      <div class="price-box">${p.price}</div>
      <button class="consult-btn" type="button">Consultar x Wapp</button>
    `;

    grid.appendChild(card);
    setupCardBehavior(card, p);
  });

  // ---------- COMBO CARD ----------
  // Sacada por ahora (ocupaba 9 módulos abajo de todo). Para reactivarla,
  // descomentar este bloque.
  /*
  const comboData = { name:'Burger Party x4 unidades', sub:'', price:'8.000', step:1, mode:'multiply' };
  const combo = document.createElement('div');
  combo.className = 'card card--text combo';
  combo.draggable = true;
  combo.dataset.id = 'combo';
  combo.innerHTML = `
    <div class="qty-stepper" data-step="1">
      <button class="qty-btn qty-minus" type="button" aria-label="Restar">&minus;</button>
      <span class="qty-value">0</span>
      <button class="qty-btn qty-plus" type="button" aria-label="Sumar">+</button>
    </div>
    <img class="combo-img" src="images/hero.jpg" alt="Burger Party x4 unidades">
    <div class="combo-overlay">
      <div class="label"><span class="qty-prefix"></span>Precio <i>x4 unidades</i></div>
      <div class="price-box">8.000</div>
      <button class="consult-btn" type="button">Consultar x Wapp</button>
    </div>
  `;
  grid.appendChild(combo);
  setupCardBehavior(combo, comboData);
  */

  updateCart();

  // ---------- COMPORTAMIENTO DE CADA TARJETA ----------
  function setupCardBehavior(card, p){
    const { name, sub, price: basePriceText, step, mode, baseCount, minCount, nameRest } = p;

    card.dataset.name = name;
    card.dataset.sub = sub;
    card.dataset.qty = '0';
    card.dataset.unitPrice = parsePrice(basePriceText);
    card.dataset.basePriceText = basePriceText;
    card.dataset.totalPrice = '0';

    const priceBox = card.querySelector('.price-box');
    const consultBtn = card.querySelector('.consult-btn');
    const stepper = card.querySelector('.qty-stepper');
    const qtyValueEl = card.querySelector('.qty-value');
    const qtyPrefixEl = card.querySelector('.qty-prefix');
    const titleTextEl = card.querySelector('.title-text');
    const minusBtn = card.querySelector('.qty-minus');
    const plusBtn = card.querySelector('.qty-plus');

    function render(){
      const qty = parseInt(card.dataset.qty, 10);
      const unitPrice = parseInt(card.dataset.unitPrice, 10);

      qtyValueEl.textContent = qty;
      stepper.classList.toggle('has-qty', qty > 0);
      card.classList.toggle('selected', qty > 0);

      let totalPrice = 0;

      if(mode === 'replace'){
        const shown = qty > 0 ? qty : baseCount;
        if(titleTextEl) titleTextEl.textContent = `${shown}${nameRest}`;
        if(qtyPrefixEl) qtyPrefixEl.textContent = '';
        totalPrice = qty > 0 ? Math.round(unitPrice * qty / baseCount) : 0;
      } else {
        if(qtyPrefixEl) qtyPrefixEl.textContent = qty > 0 ? `${qty}\u00D7 ` : '';
        totalPrice = qty > 0 ? qty * unitPrice : 0;
      }

      card.dataset.totalPrice = totalPrice;
      priceBox.textContent = qty > 0 ? formatARS(totalPrice) : card.dataset.basePriceText;
    }

    function setQty(newQty){
      const floor = mode === 'replace' ? (minCount || baseCount) : step;
      card.dataset.qty = String(newQty < floor ? 0 : newQty);
      render();
      updateCart();
    }

    minusBtn.addEventListener('mousedown', e => e.stopPropagation());
    minusBtn.addEventListener('click', e => {
      e.stopPropagation();
      setQty(parseInt(card.dataset.qty, 10) - step);
    });

    plusBtn.addEventListener('mousedown', e => e.stopPropagation());
    plusBtn.addEventListener('click', e => {
      e.stopPropagation();
      const current = parseInt(card.dataset.qty, 10);
      const base = mode === 'replace' ? baseCount : step;
      setQty(current === 0 ? base : current + step);
    });

    consultBtn.addEventListener('mousedown', e => e.stopPropagation());
    consultBtn.addEventListener('click', e => {
      e.stopPropagation();
      const base = mode === 'replace' ? baseCount : step;
      const qty = Math.max(base, parseInt(card.dataset.qty, 10));
      const totalPrice = mode === 'replace'
        ? Math.round(parseInt(card.dataset.unitPrice, 10) * qty / baseCount)
        : qty * parseInt(card.dataset.unitPrice, 10);
      openWhatsApp(buildConsultMessage(name, sub, qty, totalPrice));
    });

    card.addEventListener('click', () => {
      if (isDragging) return;
      const current = parseInt(card.dataset.qty, 10);
      const base = mode === 'replace' ? baseCount : step;
      setQty(current > 0 ? 0 : base);
    });

    render();
  }

  // ---------- DRAG & DROP REORDER ----------
  let isDragging = false;

  grid.addEventListener('dragstart', e => {
    const card = e.target.closest('.card');
    if(!card) return;
    isDragging = true;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.id);
  });

  grid.addEventListener('dragend', e => {
    const card = e.target.closest('.card');
    if(card) card.classList.remove('dragging');
    setTimeout(() => { isDragging = false; }, 50);
  });

  grid.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging = grid.querySelector('.dragging');
    if(!dragging) return;
    const after = getDragAfterElement(grid, e.clientX, e.clientY);
    if(after == null){ grid.appendChild(dragging); }
    else { grid.insertBefore(dragging, after); }
  });

  function getDragAfterElement(container, x, y){
    const els = [...container.querySelectorAll('.card:not(.dragging)')];
    let closest = { offset: -Infinity, element: null };
    for(const el of els){
      const box = el.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      const sameRow = y >= box.top && y <= box.bottom;
      const offset = sameRow ? (x - centerX) : (y - centerY) * 1000;
      if(offset < 0 && offset > closest.offset){ closest = { offset, element: el }; }
    }
    return closest.element;
  }
