import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function convertToPng() {
  console.log('🔄 Convertendo SVG para PNG...\n');
  
  for (const size of sizes) {
    const svgFile = path.join(__dirname, `icon-${size}x${size}.svg`);
    const pngFile = path.join(__dirname, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgFile)
        .resize(size, size)
        .png()
        .toFile(pngFile);
      
      console.log(`✅ Convertido: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erro ao converter icon-${size}x${size}:`, error.message);
    }
  }
  
  console.log('\n✅ Conversão concluída!');
  console.log('📝 Você pode remover os arquivos .svg se desejar, pois os PNGs estão prontos.');
}

convertToPng().catch(console.error);

