#!/usr/bin/env node

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

console.log('🔄 Iniciando Proxy Simples: 4000 → 5175');
console.log('📋 IMPORTANTE: Mantendo integração essencial com GitHub Spark');

// CORS para todas as rotas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Spark-Preview');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'simple-proxy',
    timestamp: new Date().toISOString(),
    redirect: '4000 → 5175',
    github_spark: 'enabled'
  });
});

// Proxy tudo para porta 5175
const proxy = createProxyMiddleware({
  target: 'http://localhost:5175',
  changeOrigin: true,
  ws: true, // WebSocket support
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
    proxyReq.setHeader('X-Forwarded-Proto', 'https');
    proxyReq.setHeader('X-Spark-Preview', 'true');
    console.log(`🔄 ${req.method} ${req.url} → :5175`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Garantir headers CORS em todas as respostas
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD';
    proxyRes.headers['Access-Control-Allow-Headers'] = '*';
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
      error: 'Proxy failed', 
      message: 'Vite server on port 5175 not available',
      timestamp: new Date().toISOString()
    }));
  }
});

// Aplicar proxy para todas as rotas exceto health
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  proxy(req, res, next);
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy rodando na porta ${PORT}`);
  console.log(`🔄 Redirecionando para porta 5175`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Acesso via: http://localhost:${PORT}`);
});
