import {documentReady} from 'https://unpkg.com/html-ready';
import {BrowserQRCodeSvgWriter} from 'https://unpkg.com/@zxing/library?module';

documentReady.then(() => {
  const summary  = document.querySelector('#summary');
  const start  = document.querySelector('#start');
  const end  = document.querySelector('#end');

  const qrcode = document.querySelector('#qrcode');

  // initialize inputs with search parameters
  summary.value = localStorage.getItem('summary') ?? '';
  start.value = localStorage.getItem('start') ?? '';
  end.value = localStorage.getItem('end') ?? '';

  generateCode();

  function iso8601(input) {
    const date = new Date(input);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  function generateString() {
    // https://github.com/zxing/zxing/wiki/Barcode-Contents#calendar-events
    const params = [];
    params.push('BEGIN:VEVENT');

    if (summary.value) {
      params.push(`SUMMARY:${summary.value}`);
    }

    if (start.value) {
      params.push(`DTSTART:${iso8601(start.value)}`);
    }

    if (end.value) {
      params.push(`DTEND:${iso8601(end.value)}`);
    }

    params.push('END:VEVENT');

    return params.join('\r\n');
  }

  function generateCode() {
    const qrcodeWriter = new BrowserQRCodeSvgWriter();
    const svg = qrcodeWriter.write(generateString(), 256, 256);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    qrcode.src = `data:image/svg+xml,${encodeURIComponent(svg.outerHTML.replaceAll(/\r?\n/g, ''))}`;
  }

  summary.addEventListener('input', () => {
    localStorage.setItem('summary', summary.value);

    generateCode();
  });

  start.addEventListener('input', () => {
    localStorage.setItem('start', start.value);

    generateCode();
  });

  end.addEventListener('input', () => {
    localStorage.setItem('end', end.value);

    generateCode();
  });
});
