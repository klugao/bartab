// Script temporário para gerar ícones placeholder
// Os ícones SVG abaixo podem ser convertidos para PNG usando uma ferramenta online
// como https://convertio.co/svg-png/ ou usando ImageMagick

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const generateSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#2563eb"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">BT</text>
</svg>`;

sizes.forEach(size => {
  const svg = generateSVG(size);
  fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.svg`), svg);
  console.log(`Criado: icon-${size}x${size}.svg`);
});

console.log('\n✅ Ícones SVG placeholder criados com sucesso!');
console.log('\n📝 PRÓXIMOS PASSOS:');
console.log('   1. Para converter para PNG, use uma ferramenta online como:');
console.log('      - https://convertio.co/svg-png/');
console.log('      - https://cloudconvert.com/svg-to-png');
console.log('   2. Ou instale ImageMagick e execute:');
console.log('      brew install imagemagick');
console.log('      for file in *.svg; do convert "$file" "${file%.svg}.png"; done');
console.log('\n   3. Substitua estes placeholders por ícones profissionais do BarTab');

