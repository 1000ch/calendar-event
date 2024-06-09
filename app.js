import {documentReady} from 'https://unpkg.com/html-ready';
import {BrowserQRCodeSvgWriter} from 'https://unpkg.com/@zxing/library?module';
import {Temporal} from 'https://unpkg.com/temporal-polyfill?module';

await documentReady;

const summary = document.querySelector('#summary');
const start = document.querySelector('#start');
const end = document.querySelector('#end');
const qrcode = document.querySelector('#qrcode');

// initialize inputs
summary.value = localStorage.getItem('summary') ?? '';
start.value = localStorage.getItem('start') ?? '';
end.value = localStorage.getItem('end') ?? '';

function format(input) {
  const {timeZone} = Intl.DateTimeFormat().resolvedOptions();
  const zdt = Temporal.PlainDateTime.from(input).toZonedDateTime(timeZone);

  function padLeftWithZero(input) {
    return String(input).padStart(2, '0');
  }

  const month = padLeftWithZero(zdt.month);
  const day = padLeftWithZero(zdt.day);
  const hour = padLeftWithZero(zdt.hour);
  const minute = padLeftWithZero(zdt.minute);
  const second = padLeftWithZero(zdt.second);

  return `${zdt.year}${month}${day}T${hour}${minute}${second}Z`;
}

function generateString() {
  // https://github.com/zxing/zxing/wiki/Barcode-Contents#calendar-events
  const params = [];
  params.push('BEGIN:VEVENT');

  if (summary.value) {
    params.push(`SUMMARY:${summary.value}`);
  }

  if (start.value) {
    params.push(`DTSTART:${format(start.value)}`);
  }

  if (end.value) {
    params.push(`DTEND:${format(end.value)}`);
  }

  params.push('END:VEVENT');

  return params.join('\r\n');
}

function generateCode() {
  const text = generateString();
  const qrcodeWriter = new BrowserQRCodeSvgWriter();
  const svg = qrcodeWriter.write(text, 256, 256);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  qrcode.alt = text;
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

generateCode();
