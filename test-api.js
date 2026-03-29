const http = require('http');

const data = JSON.stringify({
  fullName: 'seddik',
  email: 'kacemi396@gmail.com',
  password: '123',
  role: 'PLAYER'
});

const options = {
  hostname: 'localhost',
  port: 8089,
  path: '/SpringSecurity/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log(`BODY: ${body}`); });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
