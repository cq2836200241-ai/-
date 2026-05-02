import words from '3000-words-list';
console.log(typeof words, Array.isArray(words) ? words.length : Object.keys(words));
if(Array.isArray(words)) console.log(words.slice(0, 5));
