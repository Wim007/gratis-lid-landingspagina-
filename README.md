# Landingspagina "Word gratis lid" (zzp'ers)

Op zichzelf staande landingspagina voor zzp'ers in de zorg. Dit is de bestemming
van de "Word gratis lid"-knop onder de social posts. Staat bewust los van de
hoofdsite (`samenontzorgen-website`), zodat teksten en aanbod hier apart en snel
aangepast kunnen worden zonder de site te raken.

Klein Express-projectje met dezelfde huisstijl als de hoofdsite. Het formulier
mailt de aanmelding via nodemailer naar `info@samenontzorgen.nl`.

## Structuur

- `server.js` — Express-server + `/contact`-endpoint (nodemailer)
- `public/index.html` — de landingspagina
- `public/css/style.css`, `public/js/main.js`, `public/images/` — huisstijl, kopie van de hoofdsite

De foto van Wim komt op `public/images/wim.jpg`. Zolang dat bestand er niet is,
toont de pagina automatisch een nette placeholder met de tekst "Foto van Wim".

## Lokaal draaien

```
npm install
EMAIL_USER=... EMAIL_PASS=... node server.js
```

Daarna: http://localhost:3000

## Omgevingsvariabelen

- `EMAIL_USER` — Gmail-account dat de mail verstuurt
- `EMAIL_PASS` — Gmail app-wachtwoord
- `MAIL_TO` — optioneel, standaard `info@samenontzorgen.nl`

## Deployen (Railway)

Aparte Railway-service, gekoppeld aan deze repo. Railway deployt automatisch bij
een push naar `main`.

- Root Directory: `/` (repo-root)
- Build: nixpacks (automatisch)
- Start Command: `node server.js`
- Variabelen: `EMAIL_USER`, `EMAIL_PASS`, optioneel `MAIL_TO`
