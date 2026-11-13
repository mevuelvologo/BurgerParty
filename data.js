// ===== DATOS DEL SITIO (única fuente de verdad) =====
// Para completar la lista: cargá `price` de cada producto (precio mayorista por unidad de venta).
// price:null se muestra como "A confirmar". Los packs NO llevan precio: se calcula sumando sus artículos.
// unit: unidad de venta ('unidad','kg','bolsa'...) · step: de a cuántos se agrega
// img: foto con fondo transparente (opcional) · logo: logo blanco de la marca (opcional)
const CATEGORIES = { hamburguesa:'Hamburguesas', pan:'Panes', papas:'Papas', nuggets:'Nuggets', queso:'Quesos', aderezo:'Aderezos', bebida:'Bebidas', snack:'Snacks', salchicha:'Salchichas' };

// Logos de marca (blancos). Si una marca no tiene logo acá, el sitio muestra un "?" en su lugar.
const LOGOS = { 'Unión Ganadera':'images/logos/ug.webp', 'Bimbo':'images/logos/bimbo.webp', 'Benidorm':'images/logos/benidorm.webp', 'Milkaut':'images/logos/milkaut.webp', 'Paty':'images/logos/paty.webp', 'Cool Mind':'images/logos/coolmind.webp', 'Coca-Cola':'images/logos/coca.webp', 'Fargo':'images/logos/fargo.webp' };
// Fotos de pilas de medallones: tamaño de la pila -> archivo. Si un producto no tiene img ni stacks, se muestra un "?".
const st = (f, s) => Object.fromEntries(s.map(n => [n, `images/p/${f}-${n}.webp`]));
// PRECIOS APROXIMADOS (deducidos de los packs y de la lista vieja): el cliente los corrige desde editar-lista.html
const PRODUCTS = [
  { id:'ug83',   cat:'hamburguesa', brand:'Unión Ganadera', title:'Hamburguesa Unión Ganadera 83 g', desc:'Medallón de carne congelado', unit:'unidad', step:2, price:1800, stacks:st('burger-83',[2,4,6]) },
  { id:'uggig',  cat:'hamburguesa', brand:'Unión Ganadera', title:'Hamburguesa UG Gigantes', desc:'Medallón gigante de carne congelado', unit:'unidad', step:2, price:2300, stacks:st('burger-gig',[2,4,6]) },
  { id:'ug55',   cat:'hamburguesa', brand:'Unión Ganadera', title:'Hamburguesa Unión Ganadera 55 g', desc:'Medallón de carne congelado', unit:'unidad', step:2, price:1000, stacks:st('burger-thin',[2,4,6]) },
  { id:'paty',   cat:'hamburguesa', brand:'Paty', title:'Hamburguesa Paty Clásica', desc:'Medallón de carne congelado', unit:'unidad', step:2, price:900, stacks:st('burger-thin',[2,4,6]) },
  { id:'calisa', cat:'hamburguesa', brand:'Calisa', title:'Hamburguesa de pollo Calisa Griller', desc:'Para plancha o parrilla', unit:'unidad', step:2, price:900, stacks:st('chicken',[2,4]) },
  { id:'bimbo',  cat:'pan', brand:'Bimbo', title:'Pan Bimbo Artesano', desc:'Pan para hamburguesa', unit:'unidad', step:1, price:600, img:'images/p/pan-bimbo.webp' },
  { id:'fargo',  cat:'pan', brand:'Fargo', title:'Pan Fargo con sésamo', desc:'Pan para hamburguesa', unit:'unidad', step:1, price:600, img:'images/p/pan-sesamo.webp' },
  { id:'fargos', cat:'pan', brand:'Fargo', title:'Pan Fargo para salchicha', desc:'Pan para pancho', unit:'unidad', step:1, price:500 },
  { id:'coolmind', cat:'papas', brand:'Cool Mind', title:'Papas Cool Mind congeladas', desc:'Papas bastón congeladas', unit:'kg', step:0.5, per:0.5, price:8800, img:'images/p/papas-coolmind.webp' },
  { id:'smiles', cat:'papas', brand:'', title:'Papas Smiles', desc:'Bolsa de 700 g', unit:'bolsa', step:1, price:8000, img:'images/papas-smiles.png' },
  { id:'baston', cat:'papas', brand:'', title:'Papas Bastón', desc:'Bolsa de 2 kg', unit:'bolsa', step:1, price:8000, img:'images/papas-baston.png' },
  { id:'nuggets', cat:'nuggets', brand:'', title:'Nuggets de pollo', desc:'Nuggets congelados', unit:'kg', step:0.5, per:0.5, price:null, img:'images/p/nuggets.webp' },
  { id:'cheddar', cat:'queso', brand:'Milkaut', title:'Cheddar en fetas Milkaut', desc:'Feta de cheddar', unit:'feta', step:1, per:8, price:300, img:'images/p/cheddar.webp' },
  { id:'benidorm', cat:'aderezo', brand:'Benidorm', title:'Aderezo Benidorm Barbacoa', desc:'500 g', unit:'unidad', step:1, price:1000, img:'images/p/benidorm.webp' },
  { id:'coca',   cat:'bebida', brand:'Coca-Cola', title:'Coca-Cola 2,25 L', desc:'Botella 2,25 litros', unit:'unidad', step:1, price:5400, img:'images/p/coca.webp' },
  { id:'latas',  cat:'bebida', brand:'', title:'Pack 6 latas de birra', desc:'Latas de 473 cc', unit:'pack', step:1, price:12000, img:'images/latas-birra.png' },
  { id:'salch',  cat:'salchicha', brand:'', title:'Salchichas largas', desc:'Salchichas largas congeladas', unit:'unidad', step:1, price:800 },
];

// items: [idProducto, cantidad]. color: fondo del pack (diferente en cada uno). accent: color del número.
const PACKS = [
  { n:1, title:'4 hamburguesas con pan y papas',          color:['#4a0a06','#a31a12'], accent:'#FFD400', items:[['ug83',4],['bimbo',4],['coolmind',0.5]] },
  { n:2, title:'8 hamburguesas con pan, papas y cheddar', color:['#052712','#0c5a2b'], accent:'#FFD400', items:[['ug83',8],['bimbo',8],['coolmind',1],['cheddar',8]] },
  { n:3, title:'60 hamburguesas con pan y aderezo',       color:['#06262a','#0b5559'], accent:'#00ff44', items:[['ug83',60],['bimbo',60],['benidorm',1]] },
  { n:4, title:'4 hamburguesas de pollo con pan',         color:['#16181c','#2d3138'], accent:'#FFD400', items:[['calisa',4],['bimbo',4]] },
  { n:5, title:'4 UG Gigantes con pan y papas',           color:['#0b2e1e','#1e5c3c'], accent:'#e0652a', items:[['uggig',4],['bimbo',4],['coolmind',0.5]] },
  { n:6, title:'4 hamburguesas con pan y Coca',           color:['#0a1a44','#17409a'], accent:'#e8933a', items:[['ug83',4],['bimbo',4],['coca',1]] },
  { n:7, title:'12 Paty Clásicos con pan y papas',        color:['#06293f','#0a5578'], accent:'#FFD400', items:[['paty',12],['fargo',12],['coolmind',1]] },
  { n:8, title:'8 Unión Ganadera con pan y papas',        color:['#1b2a06','#42650f'], accent:'#e0652a', items:[['uggig',8],['bimbo',8],['coolmind',1]] },
];

// Proporciones (ancho/alto) de cada foto, para dibujar las cantidades de cada pack
const AR = {"images/p/benidorm.webp": 0.408, "images/p/burger-83-2.webp": 1.992, "images/p/burger-83-4.webp": 0.787, "images/p/burger-83-6.webp": 0.527, "images/p/burger-gig-2.webp": 1.581, "images/p/burger-gig-4.webp": 1.026, "images/p/burger-gig-6.webp": 0.692, "images/p/burger-thin-2.webp": 1.793, "images/p/burger-thin-4.webp": 0.862, "images/p/burger-thin-6.webp": 0.594, "images/p/cheddar.webp": 2.971, "images/p/chicken-2.webp": 2.031, "images/p/chicken-4.webp": 1.063, "images/p/coca.webp": 0.302, "images/p/nuggets.webp": 1.763, "images/p/pan-bimbo.webp": 1.585, "images/p/pan-sesamo.webp": 1.469, "images/p/papas-coolmind.webp": 1.307, "images/papas-smiles.png": 1.128, "images/papas-baston.png": 1.247, "images/latas-birra.png": 1.25};
