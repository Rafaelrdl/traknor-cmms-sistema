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
    'https://*.app.github.dev'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

// Headers CORS manuais para garantir compatibilidade com GitHub Spark
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rota específica para o tema CSS - Essencial para Spark Preview
app.get('/css/theme', (req, res) => {
  res.header('Content-Type', 'text/css');
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
