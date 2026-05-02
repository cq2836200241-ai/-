import https from 'https';
import fs from 'fs';

https.get('https://raw.githubusercontent.com/Lanyifan/CET4words/master/cet4.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    console.log(list.length);
    const tsContent = `export interface WordItem {
  id: number;
  word: string;
  brief: string;
}

export const wordsList: WordItem[] = ${JSON.stringify(list.slice(0, 3000).map((item, i) => ({
  id: i + 1,
  word: item.word,
  brief: item.translate
})), null, 2)};
`;
    fs.writeFileSync('src/data/words.ts', tsContent);
  });
});
