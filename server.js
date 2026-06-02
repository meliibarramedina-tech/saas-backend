require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// Middlewares
app.use(cors()); // Permite peticiones desde Netlify
app.use(express.json());
 
// Configurar el transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,     // tu@gmail.com
    pass: process.env.GMAIL_APP_PASS,  // contraseña de app de 16 caracteres
  },
});
 
// Ruta de health check
app.get('/', (req, res) => {
  res.send({ status: 'OK', mensaje: 'Servidor funcionando ✓' });
});
 
// Ruta principal: recibe el formulario y envía el email
app.post('/contacto', async (req, res) => {
  const { nombre, email, empresa, mensaje } = req.body;
 
  // Validación básica
  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }
 
  try {
    // Email que recibes TÚ (el fundador)
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `🚀 Nuevo interesado en tu SaaS: ${nombre}`,
      html: `
<h2>Nuevo registro de interés</h2>
<p><b>Nombre:</b> ${nombre}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Empresa:</b> ${empresa || 'No especificó'}</p>
<p><b>Mensaje:</b> ${mensaje || 'Sin mensaje adicional'}</p>
<hr>
<small>Enviado desde tu landing page vía Render</small>
      `,
    });
 
    // Email de confirmación al visitante
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: '¡Gracias por tu interés! Te contactaremos pronto',
      html: `
<h2>Hola ${nombre}, recibimos tu registro ✓</h2>
<p>Gracias por registrar tu interés. Nos pondremos en contacto
        contigo muy pronto para contarte más sobre el producto.</p>
<p>— El equipo</p>
      `,
    });
 
    res.json({ ok: true, mensaje: '¡Registro exitoso! Revisa tu correo.' });
 
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ error: 'Error al enviar el correo. Intenta de nuevo.' });
  }
});
 
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});