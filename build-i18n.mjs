/**
 * build-i18n.mjs — genera las versiones por idioma del sitio para SEO.
 *
 * Lee index.html (fuente única, en español) y produce en/, fr/, de/, it/ con:
 *  - <html lang> correcto y <head> traducido (title, description, og, twitter, canonical, og:url)
 *  - rutas de assets root-absolute (/assets/...) para que funcionen desde subdirectorios
 *  - JSON-LD (descripción del negocio + FAQPage) traducido desde el propio i18n
 *  - hreflang heredado del index.html
 *
 * El contenido del <body> se traduce en runtime por JS (detecta el idioma por la ruta),
 * y Googlebot renderiza JS, así que cada URL indexa su idioma.
 *
 * Uso:  node build-i18n.mjs   (re-ejecutar tras editar index.html)
 */
import fs from 'fs';

const BASE = 'https://bitride.rent';
const LANGS = ['en', 'fr', 'de', 'it'];

// Metadatos del <head> y descripciones del negocio por idioma (el title sale del i18n).
const META = {
  en: {
    locale: 'en_US',
    desc: 'Hurricane 250cc motorcycle rental in Havana, Cuba. Unlimited mileage, helmet included and citywide delivery. Pay with Bitcoin or cash. From 30 USD/day.',
    bizDesc: 'Hurricane 250cc motorcycle rental in Havana, Cuba. Unlimited mileage and helmet included, delivery across Havana. Pay with Bitcoin (Lightning), cash or crypto.',
  },
  fr: {
    locale: 'fr_FR',
    desc: "Location de motos Hurricane 250cc à La Havane, Cuba. Kilométrage illimité, casque inclus et livraison dans toute la ville. Payez en Bitcoin ou espèces. Dès 30 USD/jour.",
    bizDesc: "Location de motos Hurricane 250cc à La Havane, Cuba. Kilométrage illimité et casque inclus, livraison dans toute La Havane. Payez en Bitcoin (Lightning), espèces ou crypto.",
  },
  de: {
    locale: 'de_DE',
    desc: 'Hurricane 250cc Motorradverleih in Havanna, Kuba. Unbegrenzte Kilometer, Helm inklusive und Lieferung stadtweit. Zahlung per Bitcoin oder bar. Ab 30 USD/Tag.',
    bizDesc: 'Hurricane 250cc Motorradverleih in Havanna, Kuba. Unbegrenzte Kilometer und Helm inklusive, Lieferung in ganz Havanna. Zahlung per Bitcoin (Lightning), bar oder Krypto.',
  },
  it: {
    locale: 'it_IT',
    desc: "Noleggio moto Hurricane 250cc a L'Avana, Cuba. Chilometraggio illimitato, casco incluso e consegna in tutta la città. Paga in Bitcoin o contanti. Da 30 USD/giorno.",
    bizDesc: "Noleggio moto Hurricane 250cc a L'Avana, Cuba. Chilometraggio illimitato e casco incluso, consegna in tutta L'Avana. Paga in Bitcoin (Lightning), contanti o cripto.",
  },
};

const ES_BIZ_DESC = 'Alquiler de motos Hurricane 250cc en La Habana, Cuba. Kilometraje ilimitado y casco incluido, entrega en toda La Habana. Paga en Bitcoin (Lightning), efectivo o cripto.';

const html = fs.readFileSync('index.html', 'utf8');

// Extraer el objeto TRANSLATIONS del HTML (fuente única de verdad).
const m = html.match(/const TRANSLATIONS = (\{[\s\S]*?\n\});/);
if (!m) { console.error('No se encontró TRANSLATIONS en index.html'); process.exit(1); }
const TRANSLATIONS = eval('(' + m[1] + ')');

const setMeta = (s, re, val) => s.replace(re, (_m, p1, p2) => p1 + val + p2);

function buildFaqBlock(T) {
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [1, 2, 3, 4].map(i => ({
      '@type': 'Question',
      name: T['faq.q' + i],
      acceptedAnswer: { '@type': 'Answer', text: T['faq.a' + i] },
    })),
  };
  const body = JSON.stringify(faq, null, 2).split('\n').map(l => '    ' + l).join('\n');
  return `  <!-- FAQ structured data (rich results) -->\n  <script type="application/ld+json">\n${body}\n  </script>`;
}

for (const lang of LANGS) {
  const T = TRANSLATIONS[lang];
  const meta = META[lang];
  let out = html;

  out = out.replace('<html lang="es">', `<html lang="${lang}">`);
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${T.title}</title>`);
  out = setMeta(out, /(<meta name="description" content=")[^"]*(">)/, meta.desc);
  out = setMeta(out, /(<meta property="og:title" content=")[^"]*(">)/, T.title);
  out = setMeta(out, /(<meta property="og:description" content=")[^"]*(">)/, meta.desc);
  out = out.replace('<meta property="og:locale" content="es_ES">', `<meta property="og:locale" content="${meta.locale}">`);
  out = setMeta(out, /(<meta name="twitter:title" content=")[^"]*(">)/, T.title);
  out = setMeta(out, /(<meta name="twitter:description" content=")[^"]*(">)/, meta.desc);

  // canonical + og:url → URL del idioma
  out = out.replace('<link rel="canonical" href="https://bitride.rent/">', `<link rel="canonical" href="${BASE}/${lang}/">`);
  out = out.replace('<meta property="og:url" content="https://bitride.rent/">', `<meta property="og:url" content="${BASE}/${lang}/">`);

  // JSON-LD: descripción del negocio + FAQPage traducidos
  out = out.replace(ES_BIZ_DESC, meta.bizDesc);
  out = out.replace(/  <!-- FAQ structured data \(rich results\) -->\n  <script type="application\/ld\+json">[\s\S]*?<\/script>/, buildFaqBlock(T));

  // assets relativos → root-absolute (funcionan desde /xx/)
  out = out.replace(/'assets\//g, "'/assets/").replace(/"assets\//g, '"/assets/');

  fs.mkdirSync(lang, { recursive: true });
  fs.writeFileSync(`${lang}/index.html`, out);
  console.log(`generado ${lang}/index.html  (lang=${lang}, title="${T.title}")`);
}

// ── Página de hosts (hosts.html) ──────────────────────
// El <body> se traduce en runtime por JS; aquí solo el <head> (SEO) por idioma.
const ANF_META = {
  en: {
    title: 'Rent out your motorcycle in Cuba and earn · Bitride',
    desc: 'Rent out your motorcycle in Cuba with Bitride and earn. You provide the bike; we bring the clients and handle bookings, payment and delivery. Fill in the form and we contact you.',
    svcName: 'Rent out your motorcycle with Bitride',
    svcType: 'Motorcycle rental management for owners',
    svcDesc: 'List your motorcycle in Cuba with Bitride. We bring the clients and handle bookings, payment and delivery; you get your share.',
  },
  fr: {
    title: 'Louez votre moto à Cuba et gagnez · Bitride',
    desc: "Louez votre moto à Cuba avec Bitride et gagnez. Vous fournissez la moto ; nous apportons les clients et gérons réservations, paiement et livraison. Remplissez le formulaire.",
    svcName: 'Louez votre moto avec Bitride',
    svcType: 'Gestion de location de motos pour propriétaires',
    svcDesc: "Proposez votre moto à Cuba avec Bitride. Nous apportons les clients et gérons réservations, paiement et livraison ; vous recevez votre part.",
  },
  de: {
    title: 'Vermiete dein Motorrad in Kuba und verdiene · Bitride',
    desc: 'Vermiete dein Motorrad in Kuba mit Bitride und verdiene. Du stellst das Motorrad; wir bringen die Kunden und übernehmen Buchung, Zahlung und Übergabe. Fülle das Formular aus.',
    svcName: 'Vermiete dein Motorrad mit Bitride',
    svcType: 'Vermietungsverwaltung von Motorrädern für Eigentümer',
    svcDesc: 'Biete dein Motorrad in Kuba mit Bitride an. Wir bringen die Kunden und übernehmen Buchung, Zahlung und Übergabe; du bekommst deinen Anteil.',
  },
  it: {
    title: 'Affitta la tua moto a Cuba e guadagna · Bitride',
    desc: 'Affitta la tua moto a Cuba con Bitride e guadagna. Tu fornisci la moto; noi portiamo i clienti e gestiamo prenotazioni, pagamento e consegna. Compila il modulo e ti contattiamo.',
    svcName: 'Affitta la tua moto con Bitride',
    svcType: 'Gestione del noleggio di moto per proprietari',
    svcDesc: "Metti la tua moto a rendere a Cuba con Bitride. Noi portiamo i clienti e gestiamo prenotazioni, pagamento e consegna; tu ricevi la tua parte.",
  },
};

const anfHtml = fs.readFileSync('hosts.html', 'utf8');
for (const lang of LANGS) {
  const meta = ANF_META[lang];
  let out = anfHtml;
  out = out.replace('<html lang="es">', `<html lang="${lang}">`);
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  out = setMeta(out, /(<meta name="description" content=")[^"]*(">)/, meta.desc);
  out = setMeta(out, /(<meta property="og:title" content=")[^"]*(">)/, meta.title);
  out = setMeta(out, /(<meta property="og:description" content=")[^"]*(">)/, meta.desc);
  out = out.replace('<meta property="og:locale" content="es_ES">', `<meta property="og:locale" content="${META[lang].locale}">`);
  out = out.replace('<link rel="canonical" href="https://bitride.rent/hosts.html">', `<link rel="canonical" href="${BASE}/${lang}/hosts.html">`);
  out = out.replace('<meta property="og:url" content="https://bitride.rent/hosts.html">', `<meta property="og:url" content="${BASE}/${lang}/hosts.html">`);
  // JSON-LD Service (programa para propietarios) traducido
  out = out.replace('"name": "Renta tu moto con Bitride"', `"name": ${JSON.stringify(meta.svcName)}`);
  out = out.replace('"serviceType": "Gestión de alquiler de motos para propietarios"', `"serviceType": ${JSON.stringify(meta.svcType)}`);
  out = out.replace('"description": "Pon tu moto a rentar en Cuba con Bitride. Nosotros ponemos los clientes y gestionamos reservas, cobro y entrega; tú recibes tu parte."', `"description": ${JSON.stringify(meta.svcDesc)}`);
  out = out.replace('"url": "https://bitride.rent/hosts.html"', `"url": "${BASE}/${lang}/hosts.html"`);
  out = out.replace(/'assets\//g, "'/assets/").replace(/"assets\//g, '"/assets/');
  fs.mkdirSync(lang, { recursive: true });
  fs.writeFileSync(`${lang}/hosts.html`, out);
  console.log(`generado ${lang}/hosts.html  (lang=${lang}, title="${meta.title}")`);
}

console.log('Listo. Re-ejecuta este script tras editar index.html o hosts.html.');
