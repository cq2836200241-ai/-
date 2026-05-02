import https from 'https';

https.get('https://registry.npmjs.org/3000-words-list', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(Object.keys(JSON.parse(data).versions));
  });
});
