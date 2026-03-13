import { createReadStream } from 'fs';
import { mkdir, writeFile, readdir, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { execSync } from 'child_process';

// Extract the zip file
try {
  execSync('unzip -o /vercel/share/v0-project/Dosage_20260313041844.zip -d /vercel/share/v0-project/flow-extracted', { stdio: 'inherit' });
  console.log('Extraction complete!');
  
  // List extracted files
  const files = execSync('find /vercel/share/v0-project/flow-extracted -type f', { encoding: 'utf-8' });
  console.log('\nExtracted files:');
  console.log(files);
} catch (error) {
  console.error('Error:', error.message);
}
