const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- "Base de datos" en memoria (se reinicia al apagar el servidor) ----------
const usuario = {
  nombre: 'Mariano Martínez',
  alias: 'jorge.abuelo.mp',
  cvu: '0000003100012345678901',
  saldo: 323432.28
};

let contactos = [
  { iniciales: 'MM', nombre: 'Mariano Martínez', alias: 'mariano.martinez.mp', banco: 'Mercado Pago', tipo: 'mercadopago', vos: true },
  { iniciales: 'JR', nombre: 'Jose Ernesto Retamar', alias: 'retamar.construc', banco: 'Mercado Pago', tipo: 'mercadopago' },
  { iniciales: 'MB', nombre: 'Maria Guadalupe Bastian', alias: 'guada.bastian.mp', banco: 'Mercado Pago', tipo: 'mercadopago' }
];
let ids = 3;
const movimientos = [];

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add.html'));
});

app.post('/add', (req, res) => {
  ids++;
  contactos.push({
    id: ids,
    nombre: req.body.nombre,
    alias: req.body.alias,
    banco: req.body.banco,
    tipo: req.body.tipo,
    iniciales: req.body.iniciales
  })
  res.redirect('/')
});

// ---------- Rutas de la API ----------
app.get('/api/usuario', (req, res) => {
  res.json({ nombre: usuario.nombre, alias: usuario.alias, cvu: usuario.cvu, saldo: usuario.saldo });
});

app.get('/api/contactos', (req, res) => {
  res.json(contactos);
});

app.get('/api/movimientos', (req, res) => {
  res.json(movimientos);
});

app.post('/api/transferencia', (req, res) => {
  const { destino, monto, descripcion } = req.body;
  const cantidad = Number(monto);

  if (!destino) {
    return res.status(400).json({ error: 'Falta el alias o CVU de destino.' });
  }
  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a cero.' });
  }

  const contacto = contactos.find(c => c.alias === destino);
  if (!contacto) {
    return res.status(404).json({ error: 'No encontramos ese alias. Revisalo e intentá de nuevo.' });
  }

  if (cantidad > usuario.saldo) {
    return res.status(400).json({ error: 'No tenés saldo suficiente para esta transferencia.' });
  }

  usuario.saldo -= cantidad;

  const operacion = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    tipo: 'enviada',
    monto: cantidad,
    descripcion: descripcion || '',
    destinatario: contacto.nombre,
    alias: contacto.alias,
    banco: contacto.banco,
    codigo: String(Math.floor(100000000000 + Math.random() * 900000000000))
  };
  movimientos.unshift(operacion);

  res.json({ ok: true, operacion, saldo: usuario.saldo });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
