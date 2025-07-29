// Teste simples para verificar se PostCSS está funcionando
const postcss = require('postcss');



const css = '@tailwind base; @tailwind components; @tailwind utilities; .test { display: flex; }';

postcss([tailwindcss(), autoprefixer()])
  .process(css, { from: undefined })
  .then(result => {
  });
    console.log('Resultado de teste:', result.css.length, 'caracteres');
  })
  .catch(err => {
    console.error('❌ Erro no PostCSS:', err.message);
  });