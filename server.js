require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische bestanden
app.use(express.static(path.join(__dirname, 'public'), { redirect: false }));

// Landingspagina
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Aanmeldformulier: mailt de aanmelding naar info@samenontzorgen.nl
app.post('/contact', async (req, res) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const mailTo    = process.env.MAIL_TO || 'info@samenontzorgen.nl';
  const { naam, email, bericht } = req.body;

  if (!naam || !bericht || !email) {
    return res.status(400).json({
      success: false,
      message: 'Naam, e-mailadres en de overige velden zijn verplicht.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Vul een geldig e-mailadres in.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    await transporter.sendMail({
      from: `"SamenOntzorgen Landingspagina" <${emailUser}>`,
      to: mailTo,
      replyTo: email,
      subject: `Nieuwe aanmelding gratis lid van ${naam}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0e7c76; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nieuwe aanmelding: word gratis lid</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1c2b2d; width: 120px;">Naam:</td>
                <td style="padding: 8px 0; color: #1c2b2d;">${naam}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1c2b2d;">E-mail:</td>
                <td style="padding: 8px 0; color: #1c2b2d;"><a href="mailto:${email}" style="color: #0e7c76;">${email}</a></td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;">
            <p style="color: #1c2b2d; line-height: 1.6; white-space: pre-wrap;">${bericht}</p>
          </div>
          <div style="background-color: #19ada7; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 13px;">SamenOntzorgen &middot; Minder zorgen, meer zorg</p>
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Bedankt voor je aanmelding. We nemen snel contact met je op.'
    });
  } catch (error) {
    console.error('E-mail fout:', error);
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
