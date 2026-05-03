const http = require('http');

const body = JSON.stringify({ username: 'doctor', password: 'doctor123' });
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
    process.exit(0);
  });
});
req.on('error', (e) => { console.error(e); process.exit(1); });
req.write(body);
req.end();
