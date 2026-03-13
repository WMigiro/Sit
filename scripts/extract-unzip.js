import { createReadStream } from 'fs';
import { mkdir } from 'fs/promises';
import { Extract } from 'unzipper';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const zipPath = join(__dirname, '..', 'Dosage_20260313041844.zip');
const outputDir = join(__dirname, '..', 'flow-extracted');

async function extractZip() {
  try {
    await mkdir(outputDir, { recursive: true });
    
    await new Promise((resolve, reject) => {
      createReadStream(zipPath)
        .pipe(Extract({ path: outputDir }))
        .on('close', resolve)
        .on('error', reject);
    });
    
    console.log('Extraction complete to:', outputDir);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

extractZip();
