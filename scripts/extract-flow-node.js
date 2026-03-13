import AdmZip from 'adm-zip';
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

const zipPath = '/vercel/share/v0-project/Dosage_20260313041844.zip';
const extractPath = '/vercel/share/v0-project/flow-extracted';

try {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  
  console.log('Files in the zip archive:');
  zipEntries.forEach(entry => {
    console.log(`- ${entry.entryName} (${entry.header.size} bytes)`);
  });
  
  // Extract all files
  zip.extractAllTo(extractPath, true);
  console.log(`\nExtracted to: ${extractPath}`);
  
  // Read and display the main definition file if it exists
  const definitionEntry = zipEntries.find(e => e.entryName.includes('definition.json') || e.entryName.includes('workflow.json'));
  if (definitionEntry) {
    console.log('\n--- Flow Definition Content ---');
    console.log(definitionEntry.getData().toString('utf8'));
  }
} catch (error) {
  console.error('Error:', error.message);
}
