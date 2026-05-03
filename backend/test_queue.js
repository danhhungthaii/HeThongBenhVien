const http = require('http');

async function request(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 3000, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const login = await request('POST', '/api/v1/auth/login', { username: 'doctor', password: 'doctor123' });
  const token = login.body.data?.accessToken;
  const queue = await request('GET', '/api/v1/queue', null, token);
  console.log(JSON.stringify(queue.body, null, 2));
  process.exit(0);
})();
