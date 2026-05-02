import https from 'https';

https.get('https://raw.githubusercontent.com/lyc8503/baicizhan-word-meaning-API/master/data/words/cet4.txt', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.slice(0, 500));
  });
});
