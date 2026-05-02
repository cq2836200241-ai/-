import https from 'https';

https.get('https://raw.githubusercontent.com/yishn/chinese-english-wordlist/master/wordlist.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("status:", res.statusCode);
  });
});
