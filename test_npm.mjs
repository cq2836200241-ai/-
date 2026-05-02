import https from 'https';

https.get('https://registry.npmjs.org/-/v1/search?text=cet4', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(JSON.parse(data).objects.slice(0, 3).map(o => o.package.name));
  });
});
