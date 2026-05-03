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
  // 1. Login
  const login = await request('POST', '/api/v1/auth/login', { username: 'doctor', password: 'doctor123' });
  const token = login.body.data?.accessToken;
  console.log('✅ Login:', login.status === 200 ? 'OK' : 'FAIL', token ? '' : '- NO TOKEN');

  // 2. Get patients
  const patients = await request('GET', '/api/v1/patients', null, token);
  console.log('✅ GET /patients:', patients.status, JSON.stringify(patients.body).substring(0, 200));

  // 3. Create patient
  const create = await request('POST', '/api/v1/patients', {
    full_name: 'Nguyen Test',
    gender: 'male',
    dob: '1990-01-01',
    phone: '0901234999',
    cccd: '079990000001'
  }, token);
  console.log('✅ POST /patients:', create.status, JSON.stringify(create.body).substring(0, 200));

  // 4. Get queue
  const queue = await request('GET', '/api/v1/queue', null, token);
  console.log('✅ GET /queue:', queue.status, JSON.stringify(queue.body).substring(0, 200));

  // 5. Get ICD10
  const icd = await request('GET', '/api/v1/master-data/icd10?search=viem', null, token);
  console.log('✅ GET /icd10:', icd.status, JSON.stringify(icd.body).substring(0, 200));

  process.exit(0);
})();
