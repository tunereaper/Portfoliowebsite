const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const terser = require('terser');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const cssSources = [
  'css/style.css',
  'css/modern-hero.css',
  'css/unified-theme.css',
  'css/research-carousel.css',
  'css/theme-switcher.css',
  'css/mobile-fixes.css',
  'css/subpage-hero.css'
];

const jsSources = [
  'js/main.js'
];

function ensureDistDir() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
}

function buildCssBundle() {
  const cssContent = cssSources
    .map((relativePath) => {
      const filePath = path.join(projectRoot, relativePath);
      if (!fs.existsSync(filePath)) {
        console.warn(`[build] CSS source missing: ${relativePath}. Skipping.`);
        return '';
      }
      return fs.readFileSync(filePath, 'utf8');
    })
    .join('\n\n');

  const minified = new CleanCSS({ level: 2 }).minify(cssContent);

  if (minified.errors.length) {
    console.error('[build] CSS minification failed:', minified.errors);
    process.exit(1);
  }

  const outputPath = path.join(distDir, 'site.min.css');
  fs.writeFileSync(outputPath, minified.styles);
  console.log(`[build] CSS bundle written to ${path.relative(projectRoot, outputPath)}`);
}

async function buildJsBundle() {
  const jsContent = jsSources
    .map((relativePath) => {
      const filePath = path.join(projectRoot, relativePath);
      if (!fs.existsSync(filePath)) {
        console.warn(`[build] JS source missing: ${relativePath}. Skipping.`);
        return '';
      }
      return fs.readFileSync(filePath, 'utf8');
    })
    .join('\n\n');

  const result = await terser.minify(jsContent, {
    compress: true,
    mangle: true,
  });

  if (result.error) {
    console.error('[build] JS minification failed:', result.error);
    process.exit(1);
  }

  const outputPath = path.join(distDir, 'main.min.js');
  fs.writeFileSync(outputPath, result.code);
  console.log(`[build] JS bundle written to ${path.relative(projectRoot, outputPath)}`);
}

(async function run() {
  ensureDistDir();
  buildCssBundle();
  await buildJsBundle();
})();
