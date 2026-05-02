import https from 'https';

const search = (q) => {
  https.get('https://registry.npmjs.org/-/v1/search?text=' + q, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(q, JSON.parse(data).objects.slice(0, 3).map(o => o.package.name));
    });
  });
}
search('english-chinese');
search('3000-words');
