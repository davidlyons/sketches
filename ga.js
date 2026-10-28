const local = ['localhost', '192', '127'];
const isLocal = local.some((item) => window.location.hostname.includes(item));

if (!isLocal) {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  gtag('config', 'G-WTY198QNED');
}
