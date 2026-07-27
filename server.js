/**
 * Landingspagina "Word gratis lid" voor zzp'ers in de zorg (SamenOntzorgen).
 * Serveert public/index.html en heeft een /contact-endpoint dat de aanmelding
 * via Resend mailt naar info@samenontzorgen.nl.
 *
 * Railway environment-variabelen:
 *   RESEND_API_KEY = de API-sleutel van het Resend-account (begint met re_)
 *   MAIL_TO        = ontvanger van de aanmeldingen (standaard info@samenontzorgen.nl)
 *   MAIL_FROM      = afzender (standaard SamenOntzorgen <onboarding@resend.dev>)
 *
 * Let op: zolang er nog geen eigen domein bij Resend is geverifieerd, kun je met
 * de afzender onboarding@resend.dev alleen versturen naar het e-mailadres waarmee
 * het Resend-account is aangemaakt. Zet MAIL_TO dan op dat adres.
 */
const express = require('express');
const path    = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { redirect: false }));

// Escapet gebruikersinvoer voor gebruik in de HTML-mail.
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Verstuurt een mail via Resend. Gooit een fout als het misgaat.
async function sendMail({ to, subject, html, replyTo }) {
  const apiKey   = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM || 'SamenOntzorgen <onboarding@resend.dev>';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY ontbreekt.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [to],
      reply_to: replyTo || undefined,
      subject,
      html
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend fout: ${response.status} ${detail}`);
  }
}

// Landingspagina
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Aanmeldformulier: mailt de aanmelding naar info@samenontzorgen.nl
app.post('/contact', async (req, res) => {
  const mailTo = process.env.MAIL_TO || 'info@samenontzorgen.nl';
  const apiKey = process.env.RESEND_API_KEY;
  const { naam, email, telefoon, bericht } = req.body;

  if (!naam || !bericht || (!email && !telefoon)) {
    return res.status(400).json({
      success: false,
      message: 'Naam, bericht en een e-mailadres of telefoonnummer zijn verplicht.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Vul een geldig e-mailadres in.' });
  }

  if (!apiKey) {
    console.error('RESEND_API_KEY ontbreekt. Zet die als environment-variabele op Railway.');
    return res.status(500).json({ success: false, message: 'Er ging iets mis bij het verzenden. Probeer het later nog eens.' });
  }

  try {
    await sendMail({
      to: mailTo,
      replyTo: email || undefined,
      subject: `Nieuwe aanmelding gratis lid van ${naam}`,
      html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1c2b2d;padding:22px;border-radius:8px 8px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:19px;">Nieuwe aanmelding via de zzp gratis-lid pagina</h1>
            </div>
            <div style="background:#f9f9f9;padding:22px;border:1px solid #e0e0e0;border-top:none;">
              <p style="color:#2C3E50;"><strong>Naam:</strong> ${escapeHtml(naam)}</p>
              ${email ? `<p style="color:#2C3E50;"><strong>E-mail:</strong> ${escapeHtml(email)}</p>` : ''}
              ${telefoon ? `<p style="color:#2C3E50;"><strong>Telefoon:</strong> ${escapeHtml(telefoon)}</p>` : ''}
              <hr style="border:none;border-top:1px solid #e0e0e0;margin:14px 0;">
              <p style="color:#2C3E50;line-height:1.6;white-space:pre-wrap;">${escapeHtml(bericht)}</p>
            </div>
            <div style="background:#19ada7;padding:12px 22px;border-radius:0 0 8px 8px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:13px;">SamenOntzorgen &middot; Minder zorgen, meer zorg</p>
            </div>
          </div>`
    });

    res.json({
      success: true,
      message: 'Bedankt voor je aanmelding. We nemen snel contact met je op.'
    });
  } catch (error) {
    console.error('Mail fout:', error);
    res.status(500).json({
      success: false,
      message: 'Er is iets misgegaan bij het verzenden. Probeer het later nog eens.'
    });
  }
});

// 404 valt terug op de landingspagina
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Landingspagina 'Word gratis lid' draait op http://localhost:${PORT}`);
});
