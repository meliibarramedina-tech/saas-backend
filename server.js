require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS seguro para Netlify
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json({ limit: '1mb' }));

// Check env
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
  console.log('⚠️ Faltan variables de entorno');
}

// Email config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// Health check
app.get('/', (req, res) => {
  res.send({ status: 'OK', mensaje: 'Servidor funcionando ✓' });
});

// CONTACTO
app.post('/contacto', async (req, res) => {
  const { nombre, email, empresa, mensaje } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `🚀 Nuevo interesado: ${nombre}`,
      html: `
        <h2>Nuevo registro</h2>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Empresa:</b> ${empresa || 'N/A'}</p>
        <p><b>Mensaje:</b> ${mensaje || 'N/A'}</p>
      `,
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Gracias por tu interés',
      html: `<h2>Hola ${nombre}</h2><p>Gracias por registrarte 👍</p>`,
    });

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error enviando correo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});