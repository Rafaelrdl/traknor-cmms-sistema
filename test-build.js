// Test simple PostCSS configuration
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const css = '@tailwind base; @tailwind components; @tailwind utilities; .test { display: flex; }';

postcss([tailwindcss(), autoprefixer()])
  .process(css, { from: undefined })
  .then(result => {
    console.log('✅ PostCSS working! Generated CSS:', result.css.length, 'characters');
  })
  .catch(err => {
    console.error('❌ PostCSS Error:', err.message);
  });