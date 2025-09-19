# 🚨 INSTRUÇÕES CRÍTICAS - NÃO MODIFICAR ARQUIVOS SPARK

## ⚠️ ARQUIVOS ABSOLUTAMENTE PROIBIDOS DE MODIFICAR

### Arquivos Core do Spark (NUNCA ALTERAR)
```
src/main.tsx          ❌ NUNCA MODIFICAR - Conecta app com Spark runtime
src/main.css          ❌ NUNCA MODIFICAR - Estilos estruturais do Spark
index.html             ⚠️  CUIDADO - Só alterar <title> e meta tags
```

### Hooks e APIs do Spark (PROTEGIDOS)
```
@github/spark/hooks    ❌ NUNCA IMPORTAR DIRETAMENTE
spark.llm()           ✅ OK - API global do Spark
spark.kv              ✅ OK - Key-Value store
spark.user()          ✅ OK - Informações do usuário
useKV()               ✅ OK - Hook reativo para persistência
```

## 📋 REGRAS FUNDAMENTAIS DE INTEGRAÇÃO SPARK

### 1. **Persistência de Dados - OBRIGATÓRIO**
```typescript
// ✅ CORRETO - Use sempre useKV para dados persistentes
import { useKV } from '@github/spark/hooks'
const [todos, setTodos] = useKV("user-todos", [])

// ❌ ERRADO - NUNCA use localStorage diretamente
localStorage.setItem('data', JSON.stringify(data))

// ❌ ERRADO - NUNCA use sessionStorage
sessionStorage.setItem('temp', value)
```

### 2. **Assets e Importações - OBRIGATÓRIO**
```typescript
// ✅ CORRETO - Sempre importe assets explicitamente
import myImage from '@/assets/images/logo.png'
<img src={myImage} alt="Logo" />

// ❌ ERRADO - Nunca use paths como string
<img src="@/assets/images/logo.png" />
<img src="/src/assets/images/logo.png" />
```

### 3. **Configuração Vite - CUIDADO EXTREMO**
```typescript
// vite.config.ts - MODIFICAÇÕES PERMITIDAS LIMITADAS
export default defineConfig({
  plugins: [react()], // ✅ OK adicionar plugins compatíveis
  base: "/",          // ❌ NUNCA MODIFICAR
  // ⚠️ CUIDADO: Spark pode injetar configurações automáticas
})
```

## 🗃️ INSTRUÇÕES PARA BACKEND DJANGO

### Estrutura de Projeto Segura
```
projeto/
├── src/                    ✅ Frontend Spark (NÃO TOCAR)
├── backend_django/         ✅ Novo backend (SEGURO)
├── simple-mock-api.js     ⚠️ Pode remover após Django funcionar
├── package.json           ⚠️ CUIDADO - Scripts do Spark
├── vite.config.ts         ⚠️ CUIDADO - Configuração Spark
└── index.html             ⚠️ CUIDADO - Entry point Spark
```

### Configuração Django Compatível com Spark

#### 1. **Porta e CORS - CRÍTICO**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # ✅ Porta padrão do Spark
    'http://localhost:5001',  # ✅ Porta alternativa Spark
    'http://localhost:5000',  # ✅ Porta backup Spark
]

# NUNCA usar porta 8000 - conflita com Spark
# Django deve rodar na porta 3333 (mesma do mock atual)
python manage.py runserver 0.0.0.0:3333
```

#### 2. **Headers HTTP Obrigatórios**
```python
# settings.py
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-spark-session',  # ✅ Header específico do Spark
]
```

#### 3. **Formato de Resposta - MANTER COMPATIBILIDADE**
```python
# views.py - MANTER formato do mock server
def api_response(data, success=True, error=None):
    return Response({
        'success': success,
        'data': data,
        'error': error
    })

# ❌ NUNCA retornar apenas dados diretos
return Response(data)  # Quebra frontend

# ✅ SEMPRE usar wrapper
return api_response(data)  # Mantém compatibilidade
```

### URLs e Endpoints - COMPATIBILIDADE TOTAL
```python
# urls.py - MANTER exatamente como mock
urlpatterns = [
    path('api/auth/login', LoginView.as_view()),          # SEM barra final!
    path('api/auth/logout', LogoutView.as_view()),        # SEM barra final!
    path('api/users', UserListView.as_view()),            # SEM barra final!
    path('api/work-orders', WorkOrderListView.as_view()), # COM hífen!
    # ❌ NUNCA adicionar barra final - quebra frontend
    # ❌ NUNCA usar workorders (sem hífen) - frontend espera work-orders
]
```

## 🔧 CONFIGURAÇÕES AUTOMÁTICAS DO SPARK

### Package.json - SCRIPTS PROTEGIDOS
```json
{
  "scripts": {
    "dev": "vite",              // ✅ Spark usa este comando
    "build": "tsc && vite build", // ✅ Spark usa para build
    "preview": "vite preview"    // ✅ Spark usa para preview
    // ⚠️ NUNCA alterar estes scripts básicos
  }
}
```

### Dependências Críticas do Spark
```json
{
  "dependencies": {
    "react": "^18.2.0",           // ✅ Versão compatível
    "react-dom": "^18.2.0",       // ✅ Versão compatível
    "@github/spark": "*"          // ❌ NÃO APARECE - é injetado
  }
  // ⚠️ Spark pode injetar dependências automaticamente
}
```

## 🚀 CONFIGURAÇÃO DEVCONTAINER PARA DJANGO

### .devcontainer/devcontainer.json
```json
{
  "name": "TrakNor CMMS",
  "image": "mcr.microsoft.com/devcontainers/python:3.12-bullseye",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {"version": "20"},
    "ghcr.io/devcontainers/features/postgresql:1": {"version": "16"}
  },
  "forwardPorts": [5173, 3333, 8000, 5432],  // ✅ Inclui portas Spark
  "postCreateCommand": ".devcontainer/post-create.sh",
  "postStartCommand": ".devcontainer/post-start.sh",
  "remoteEnv": {
    "SPARK_ENV": "development",              // ✅ Indica ambiente Spark
    "FRONTEND_URL": "http://localhost:5173", // ✅ URL padrão Spark
    "BACKEND_URL": "http://localhost:3333"   // ✅ Backend Django
  }
}
```

### Scripts de Inicialização Compatíveis
```bash
#!/bin/bash
# .devcontainer/post-start.sh

# ✅ Mata processos conflitantes
pkill -f "python manage.py runserver" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node simple-mock-api.js" 2>/dev/null || true

# ✅ Backend Django na porta correta
cd backend_django
python manage.py runserver 0.0.0.0:3333 &

# ✅ Frontend Spark (NUNCA INTERFERIR)
cd /workspaces/spark-template
npm run dev &  # Spark controla este processo

sleep 3
echo "✅ Spark + Django iniciados com sucesso!"
```

## 📊 ESTRUTURA DE DADOS - COMPATIBILIDADE

### Formato de IDs - CRÍTICO
```typescript
// ✅ SEMPRE usar UUIDs como string
interface User {
  id: string  // "550e8400-e29b-41d4-a716-446655440000"
}

// ❌ NUNCA usar integer IDs
interface User {
  id: number  // Quebra frontend existente
}
```

### Datas e Timestamps
```python
# Django models.py - FORMATO OBRIGATÓRIO
class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

# Serializer - FORMATO ISO 8601
class UserSerializer(ModelSerializer):
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ')
```

## 🛡️ VALIDAÇÕES ANTES DE DEPLOY

### Checklist de Compatibilidade Spark
```bash
# ✅ Verificar se Spark ainda funciona
curl -s http://localhost:5173 | grep -q "TrakNor" && echo "✅ Frontend OK"

# ✅ Verificar se backend responde corretamente
curl -s http://localhost:3333/api/health | jq -r '.success' | grep -q "true" && echo "✅ Backend OK"

# ✅ Verificar formato de resposta
curl -s http://localhost:3333/api/users | jq -e '.success and .data' && echo "✅ Formato OK"

# ✅ Verificar CORS
curl -H "Origin: http://localhost:5173" -I http://localhost:3333/api/health | grep -q "Access-Control-Allow-Origin" && echo "✅ CORS OK"
```

### Logs de Debug Spark
```bash
# Verificar logs do Spark (se disponível)
tail -f /tmp/spark-debug.log 2>/dev/null || echo "Spark logs não disponíveis"

# Verificar console do browser
# F12 -> Console -> Procurar por:
# - Erros de CORS
# - Erros de fetch para API
# - Warnings sobre assets
```

## 🚨 TROUBLESHOOTING COMUM

### Problema: Spark não carrega após Django
**Solução:**
1. Verificar se não alterou `src/main.tsx` ou `src/main.css`
2. Confirmar porta 3333 livre para Django
3. Verificar CORS headers no Django
4. Reiniciar Codespace se necessário

### Problema: Assets não carregam
**Solução:**
1. Verificar se todos imports usam `import asset from '@/path'`
2. Nunca usar string paths para assets
3. Verificar `vite.config.ts` não foi modificado

### Problema: useKV não funciona
**Solução:**
1. Verificar se está dentro de componente React
2. Nunca misturar useKV com localStorage
3. Usar functional updates: `setData(prev => [...prev, newItem])`

## 📝 RESUMO EXECUTIVO

### ❌ NUNCA MODIFICAR:
- `src/main.tsx`
- `src/main.css`
- APIs do `@github/spark/*`
- Scripts básicos do `package.json`
- Porta padrão 5173 do frontend

### ⚠️ MODIFICAR COM CUIDADO:
- `vite.config.ts` (apenas plugins compatíveis)
- `index.html` (apenas meta tags)
- `package.json` (apenas dependências, não scripts core)

### ✅ LIVRE PARA MODIFICAR:
- Todos arquivos em `src/` exceto `main.tsx` e `main.css`
- Arquivos de backend Django
- Configurações de devcontainer
- Assets em `src/assets/`

### 🔑 REGRAS DE OURO:
1. **Sempre usar useKV para persistência**
2. **Sempre importar assets explicitamente**  
3. **Manter formato de resposta da API**
4. **Django na porta 3333**
5. **CORS habilitado para localhost:5173**
6. **UUIDs como strings, não integers**
7. **Testar compatibilidade após cada mudança**

---

⚡ **LEMBRE-SE**: O Spark controla o ambiente de desenvolvimento. Qualquer modificação que quebre essa integração pode tornar o projeto inutilizável no GitHub Codespaces.