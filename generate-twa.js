/**
 * Generate TWA project using Bubblewrap's programmatic API (no interactive prompts).
 * Designed to work both locally and in GitHub Actions.
 */
const path = require('path');
const fs = require('fs');

// @bubblewrap/core is available as a dependency of @bubblewrap/cli
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');

async function main() {
  const manifestUrl = process.argv[2];
  const outputDir = process.argv[3] || 'twa-build';
  
  if (!manifestUrl) {
    console.error('Usage: node generate-twa.js <manifest-url> [output-dir]');
    process.exit(1);
  }

  console.log(`Fetching manifest from: ${manifestUrl}`);
  const twaManifest = await TwaManifest.fromWebManifest(manifestUrl);
  
  // Ensure output directory exists
  await fs.promises.mkdir(outputDir, { recursive: true });

  // Save the manifest
  const manifestFile = path.join(outputDir, 'twa-manifest.json');
  await twaManifest.saveToFile(manifestFile);
  console.log(`\nSaved manifest to: ${manifestFile}`);

  // Generate the project
  console.log(`\nGenerating TWA project in: ${outputDir}`);
  const generator = new TwaGenerator();
  const log = new ConsoleLog('twa-gen');
  await generator.createTwaProject(outputDir, twaManifest, log);
  
  console.log(`\n✅ TWA project generated successfully at: ${outputDir}`);
}

main().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
