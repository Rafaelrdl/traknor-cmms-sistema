import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

console.log('🚀 Iniciando Spark Proxy Server...');
console.log('📋 IMPORTANTE: Mantendo integração essencial com GitHub Spark');

// Configuração CORS completa para GitHub Spark
app.use(cors({
  origin: [
    'https://github.com',
    'https://*.github.com',
    'https://*.github.app',
    'https://spark-preview--traknor-cmms-sistema--rafaelrdl.github.app',
    'https://*.app.github.dev',
    /^https:\/\/.*\.github\.com$/,
    /^https:\/\/.*\.github\.app$/,
    true // Allow all origins for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Spark-Preview'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

// Headers CORS manuais para garantir compatibilidade com GitHub Spark
app.use((req, res, next) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Spark-Preview');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rota específica para o tema CSS - Essencial para Spark Preview
app.get('/css/theme', (req, res) => {
  res.header('Content-Type', 'text/css');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.send(`
    /* Theme CSS for GitHub Spark Preview */
    :root {
      --color-primary: #0969da;
      --color-background: #ffffff;
      --color-text: #1f2328;
    }
    
    /* Spark Preview compatibility styles */
    .spark-preview-container {
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
  `);
});

// Rota catch-all para qualquer theme CSS
app.get('*/theme*', (req, res) => {
  res.header('Content-Type', 'text/css');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.send(`/* TrakNor CMMS Theme - GitHub Spark Compatible */`);
});

// Rota para comunicação com GitHub Spark
app.get('/spark-status', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'active',
    port: 5175,
    proxy: 4000,
    github_spark: 'enabled'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'ok', 
    service: 'spark-proxy',
    timestamp: new Date().toISOString(),
    ports: {
      proxy: 4000,
      vite: 5175
    },
    github_spark: 'enabled'
  });
});

// Rota para API backend (se houver)
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',  // Ajuste para seu backend real
  changeOrigin: true,
  onError: (err, req, res) => {
    console.log('Backend não disponível, retornando mock');
    res.header('Access-Control-Allow-Origin', '*');
    res.json({ mock: true, message: 'Backend offline - usando dados mock' });
  }
}));

// Proxy para o servidor Vite na porta 5175 - Comunicação com GitHub Spark
const viteProxy = createProxyMiddleware({
  target: 'http://localhost:5175',
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
    proxyReq.setHeader('X-Forwarded-Proto', 'https');
    proxyReq.setHeader('X-Spark-Preview', 'true');
    console.log(`🔄 Proxying ${req.method} ${req.url} to Vite (GitHub Spark)`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to all proxied responses
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Spark-Preview';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error (GitHub Spark communication):', err.message);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end('Proxy error - GitHub Spark communication failed');
  }
});

// Aplicar proxy para todas as outras rotas - GitHub Spark integration
app.use('/', viteProxy);

// Iniciar servidor na porta 4000 (esperada pelo GitHub Spark)
const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Spark Proxy Server running on port ${PORT}`);
  console.log(`🔄 Proxying to Vite on port 5175`);
  console.log(`✨ GitHub Spark Preview integration active`);
  console.log(`📱 Access via: http://localhost:${PORT}`);
});
