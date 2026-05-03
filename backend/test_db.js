const bcrypt = require('bcryptjs');
// Test what password matches the hash in DB
const hash = '$2a$10$9NYpMPGBn4PypAB5Noi2VuCe7KtKcUIC4ZLzeuNxlBXA039mrXURa';
const tests = ['123456', 'password', '12345678', 'doctor123', 'nurse123', '1234', 'Admin@123', 'admin'];
Promise.all(tests.map(async p => ({ p, match: await bcrypt.compare(p, hash) })))
  .then(results => {
    results.forEach(r => console.log(r.p, '->', r.match));
    process.exit(0);
  });
