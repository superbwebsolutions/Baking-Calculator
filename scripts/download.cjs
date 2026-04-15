const fs = require('fs');
const https = require('https');
const path = require('path');

const icons = [
  { name: 'scale.png', url: 'https://img.icons8.com/fluency/96/scale.png' },
  { name: 'pie-chart.png', url: 'https://img.icons8.com/fluency/96/pie-chart.png' },
  { name: 'percentage.png', url: 'https://img.icons8.com/fluency/96/percentage.png' },
  { name: 'test-tube.png', url: 'https://img.icons8.com/fluency/96/test-tube.png' },
  { name: 'thermometer.png', url: 'https://img.icons8.com/fluency/96/thermometer.png' },
  { name: 'oven.png', url: 'https://img.icons8.com/fluency/96/fire-element.png' }
];

const yeastCandidates = [
  'https://img.icons8.com/fluency/96/bread.png',
  'https://img.icons8.com/fluency/96/wheat.png',
  'https://img.icons8.com/fluency/96/cereal.png',
  'https://img.icons8.com/fluency/96/bubbles.png'
];

fs.mkdirSync('public/icons', { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        resolve(false);
      }
    }).on('error', reject);
  });
}

async function main() {
  for (const icon of icons) {
    const success = await download(icon.url, path.join('public/icons', icon.name));
    console.log(`Downloaded ${icon.name}: ${success}`);
  }
  
  for (const url of yeastCandidates) {
    const success = await download(url, path.join('public/icons', 'yeast.png'));
    if (success) {
      console.log(`Downloaded yeast from ${url}`);
      break;
    }
  }
}

main();
