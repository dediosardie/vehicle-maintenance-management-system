import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'src', 'assets', 'logo-dark.svg');
const outputDir = path.join(__dirname, 'public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read SVG file
const svgBuffer = fs.readFileSync(svgPath);

// Generate 192x192 icon
sharp(svgBuffer)
  .resize(192, 192, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .png()
  .toFile(path.join(outputDir, 'icon-192.png'))
  .then(() => {
    console.log('✓ Generated icon-192.png (192x192)');
  })
  .catch(err => {
    console.error('Error generating 192x192 icon:', err);
  });

// Generate 512x512 icon
sharp(svgBuffer)
  .resize(512, 512, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .png()
  .toFile(path.join(outputDir, 'icon-512.png'))
  .then(() => {
    console.log('✓ Generated icon-512.png (512x512)');
  })
  .catch(err => {
    console.error('Error generating 512x512 icon:', err);
  });
