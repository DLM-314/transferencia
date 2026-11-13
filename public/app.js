// ---------- Utilidades ----------
const $ = (id) => document.getElementById(id);
const esperar = (ms) => new Promise(r => setTimeout(r, ms));
const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(n);

const btn = document.getElementById('btnPantallaCompleta');

btn.addEventListener('click', () => {
  const elem = document.documentElement; // Selecciona toda la página

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari / iOS */
    elem.webkitRequestFullscreen();
  }
});

function mostrarToast(texto) {
  const t = $('toast');
  t.textContent = texto;
  t.className = 'toast visible';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = 'toast'), 2500);
}

// ---------- Navegación ----------
let actual = 'inicio';
const historial = [];

function irA(id, { reemplazar = false } = {}) {
  const anterior = $(actual);
  const nueva = $(id);
  if (!nueva || anterior === nueva) return;
  if (!reemplazar) historial.push(actual);

  anterior.classList.remove('activa');
  nueva.classList.add('activa');
  actual = id;
}

function volver() {
  const previa = historial.pop() || 'inicio';
  const anterior = $(actual);
  const nueva = $(previa);
  anterior.classList.remove('activa');
  nueva.classList.add('activa');
  actual = previa;
}

document.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => irA(b.dataset.ir)));
document.querySelectorAll('[data-volver]').forEach(b => b.addEventListener('click', volver));
document.querySelectorAll('[data-toast]').forEach(b => b.addEventListener('click', () => mostrarToast(b.dataset.toast)));

// ---------- Logos Oficiales en SVG para Bancos ----------
const LOGOS = {
  mercadopago: '<img id="manitos-azules" src="img/mp-azul.jpg">',
  uala: `<img style="width: 100%; border-radius: 100%" src="img/uala.jpg">`,
  brubank: `<img style="width: 100%; border-radius: 100%" src="img/brubank.png">`,
  santander: `<img style="width: 100%; border-radius: 100%" src="img/santander.png">`,
  galicia: `<img style="width: 100%; border-radius: 100%" src="img/galicia.png">`
};

// ---------- Estado con Usuario MARIANO MARTÍNEZ ----------
let usuario = { nombre: 'Mariano Martínez', saldo: 323432.28 };
let destino = { nombre: 'BAUTISTA MELGAREJO', alias: 'bautimelgarejo.mp', banco: 'Mercado Pago', tipo: 'mercadopago' };
let montoStr = '0';

// ---------- Lista de Contactos Inventados ----------
const sugeridos = [
  { iniciales: 'AM', nombre: 'Alexandra Marcela Sosa Muñiz', alias: 'perro.cinta.calle', banco: 'Brubank', tipo: 'brubank' },
  { iniciales: 'BM', nombre: 'Bautista Melgarejo', alias: 'bautimelgarejo.mp', banco: 'Mercado Pago', tipo: 'mercadopago' },
  { iniciales: 'MM', nombre: 'Mariano Rodrigo Martinez', alias: 'marianomart93', banco: 'Mercado Pago', tipo: 'mercadopago' },
  {'iniciales': 'RP', 'nombre':'Raúl Perez', 'alias':'coche.radio.alojo', 'banco':'Mercado Pago', 'tipo':'mercadopago'},
  { iniciales: 'CP', nombre: 'Cecilia Beatriz Perez', alias: 'comedor.fcs', banco: 'Mercado Pago', tipo: 'mercadopago' },
  { iniciales: 'SL', nombre: 'Santiago Tomas Luna', alias: 'santiluna1590', banco: 'Banco Santander', tipo: 'santander' }
];

async function recientes() {
  try {
    const respuesta = await fetch('/api/contactos');

    if (!respuesta.ok) {
      throw new Error('Error en la respuesta de la red');
    }

    const datos = await respuesta.json();

    console.log('Datos recibidos:', datos);

    return datos;

  } catch (error) {
    console.error(error);
    return [];
  }
}

function pintarContactos(listaEl, datos) {
  listaEl.innerHTML = '';
  datos.forEach(c => {
    const li = document.createElement('li');
    li.className = 'mp-contact-item';
    li.innerHTML = `
      <div class="mp-contact-avatar">${c.iniciales}</div>
      <div class="mp-contact-info">
        <strong>${c.nombre} ${c.vos ? '<span class="badge-vos">Vos</span>' : ''}</strong>
        <small>
          <span class="mp-bank-icon-badge">${LOGOS[c.tipo] || ''}</span>
          ${c.alias}
        </small>
      </div>
      <button class="mp-dots-btn">⋮</button>`;
    li.addEventListener('click', () => {
      destino = { nombre: c.nombre.toUpperCase(), alias: c.alias, banco: c.banco, tipo: c.tipo };
      abrirMonto();
    });
    listaEl.appendChild(li);
  });
}

async function cargarContactos() {
  pintarContactos($('lista-contactos-sugeridos'), sugeridos);

  const datosRecientes = await recientes();

  pintarContactos($('lista-contactos-recientes'), datosRecientes);
}

// Búsqueda en vivo
$('input-alias').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  const fSugeridos = sugeridos.filter(c => c.nombre.toLowerCase().includes(q) || c.alias.toLowerCase().includes(q));
  const fRecientes = recientes.filter(c => c.nombre.toLowerCase().includes(q) || c.alias.toLowerCase().includes(q));
  pintarContactos($('lista-contactos-sugeridos'), fSugeridos);
  pintarContactos($('lista-contactos-recientes'), fRecientes);
});

// ---------- Pantalla: Ingresá el monto ----------
function abrirMonto() {
  $('monto-nombre').textContent = destino.nombre;
  $('monto-alias').textContent = destino.alias;
  $('monto-disponible').textContent = fmt(usuario.saldo);
  
  const logoBadge = LOGOS[destino.tipo] || LOGOS.mercadopago;
  $('monto-badge-icon').innerHTML = logoBadge;
  $('confirmar-badge-icon').innerHTML = logoBadge;
  $('comp-badge-icon').innerHTML = logoBadge;

  montoStr = '0';
  actualizarDisplayMonto();
  irA('monto');
}

function actualizarDisplayMonto() {
  $('monto-texto').textContent = montoStr ? Number(montoStr).toLocaleString('es-AR') : '0';
  $('error-monto').textContent = '';
}

function fijarMonto(val) {
  montoStr = String(val);
  actualizarDisplayMonto();
}

function teclaAndroid(t) {
  if (t === '⌫') {
    montoStr = montoStr.slice(0, -1);
  } else if (/^\d$/.test(t)) {
    if (montoStr.length >= 7) return;
    if (montoStr === '0') montoStr = '';
    montoStr += t;
  }
  actualizarDisplayMonto();
}

// Teclado Android
function renderTecladoAndroid() {
  const cont = $('teclado-monto');
  cont.innerHTML = `
    <button onclick="teclaAndroid('1')">1</button>
    <button onclick="teclaAndroid('2')">2</button>
    <button onclick="teclaAndroid('3')">3</button>
    <button class="action-col" onclick="mostrarToast('Menú')">-</button>
    
    <button onclick="teclaAndroid('4')">4</button>
    <button onclick="teclaAndroid('5')">5</button>
    <button onclick="teclaAndroid('6')">6</button>
    <button class="action-col" onclick="mostrarToast('Copiar')">⎵</button>
    
    <button onclick="teclaAndroid('7')">7</button>
    <button onclick="teclaAndroid('8')">8</button>
    <button onclick="teclaAndroid('9')">9</button>
    <button class="action-col" onclick="teclaAndroid('⌫')">⌫</button>
    
    <button onclick="mostrarToast(',')">,</button>
    <button onclick="teclaAndroid('0')">0</button>
    <button onclick="mostrarToast('.')">.</button>
    <button class="enter-btn" onclick="$('btn-continuar-monto').click()">➔</button>
  `;
}

// Continuar al medio de pago
$('btn-continuar-monto').addEventListener('click', () => {
  const n = Number(montoStr);
  if (!n || n <= 0) {
    $('error-monto').textContent = 'Ingresá un monto válido.';
    return;
  }
  if (n > usuario.saldo) {
    $('error-monto').textContent = 'No tenés suficiente saldo disponible.';
    return;
  }

  $('confirmar-monto').textContent = `$ ${n.toLocaleString('es-AR')}`;
  $('confirmar-nombre').textContent = destino.nombre;
  $('confirmar-alias').textContent = destino.alias;
  irA('confirmar');
});

// ---------- Confirmación y Procesamiento ----------
$('btn-ir-pin').addEventListener('click', async () => {
  irA('procesando');
  await esperar(1200);

  const n = Number(montoStr);
  usuario.saldo -= n;

  // Actualizar inicio
  const p = usuario.saldo.toFixed(2).split('.');
  $('saldo-entero').textContent = Number(p[0]).toLocaleString('es-AR');
  $('saldo-centavos').textContent = p[1];

  // Comprobante
  $('comp-monto').textContent = `$ ${n.toLocaleString('es-AR')}`;
  $('comp-nombre').textContent = destino.nombre;
  $('comp-alias').textContent = destino.alias;
  $('comp-banco').textContent = destino.banco;

  historial.length = 0;
  irA('comprobante', { reemplazar: true });
});

$('btn-cerrar-comprobante').addEventListener('click', () => irA('inicio', { reemplazar: true }));
$('btn-otra-transferencia').addEventListener('click', () => irA('destino', { reemplazar: true }));

// ---------- Ocultar saldo en inicio ----------
let oculto = false;
$('btn-ocultar').addEventListener('click', () => {
  oculto = !oculto;
  $('saldo-entero').textContent = oculto ? '••••' : Number(usuario.saldo.toFixed(2).split('.')[0]).toLocaleString('es-AR');
  $('saldo-centavos').textContent = oculto ? '' : usuario.saldo.toFixed(2).split('.')[1];
});

// ---------- Inicio ----------
cargarContactos();
renderTecladoAndroid();

function isFullDocumentScreen() {
  return Boolean(document.fullscreenElement);
}

if (isFullDocumentScreen()) {
  console.log("El documento está actualmente en modo pantalla completa.");
}
