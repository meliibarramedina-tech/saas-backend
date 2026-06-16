require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json());

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
    await resend.emails.send({
      from: 'Kursia <onboarding@resend.dev>',
      to: 'meliibarramedina@gmail.com',
      subject: `🚀 Nuevo lead: ${nombre}`,
      html: `
        <h2>Nuevo registro</h2>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Empresa:</b> ${empresa || 'N/A'}</p>
        <p><b>Mensaje:</b> ${mensaje || 'N/A'}</p>
      `
    });

    res.json({ ok: true, mensaje: 'Correo enviado correctamente' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error enviando correo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});