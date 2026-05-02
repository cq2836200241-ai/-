import https from 'https';

https.get('https://raw.githubusercontent.com/kajweb/dict/master/cet4.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("status:", res.statusCode);
    console.log(data.slice(0, 500));
  });
});
