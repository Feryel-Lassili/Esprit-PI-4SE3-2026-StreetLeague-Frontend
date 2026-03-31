const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8089,
  path: '/SpringSecurity/auth/register',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
});
req.end();
