# 🚨 INSTRUÇÕES CRÍTICAS - NÃO MODIFICAR ARQUIVOS SPARK

## ⚠️ ARQUIVOS ABSOLUTAMENTE PROIBIDOS DE MODIFICAR

index.html             ⚠️  CUIDADO - Só al

src/main.tsx          ❌ NUNCA MODIFICAR - Conecta app com Spark runtime
src/main.css          ❌ NUNCA MODIFICAR - Estilos estruturais do Spark
index.html             ⚠️  CUIDADO - Só alterar <title> e meta tags
```

### Hooks e APIs do Spark (PROTEGIDOS)
// 
@github/spark/hooks    ❌ NUNCA IMPORTAR DIRETAMENTE
// ❌ ERRADO - NUNCA use localStorage diretamente
spark.kv              ✅ OK - Key-Value store
sessionStorage.setItem('temp', value)
useKV()               ✅ OK - Hook reativo para persistência
```

## 📋 REGRAS FUNDAMENTAIS DE INTEGRAÇÃO SPARK

### 1. **Persistência de Dados - OBRIGATÓRIO**
```typescript
// ✅ CORRETO - Use sempre useKV para dados persistentes
import { useKV } from '@github/spark/hooks'
  // ⚠️ CUIDADO: Spark pode injetar configurações

## 🗃️ INSTRUÇÕES PARA BACKEND DJANGO
localStorage.setItem('data', JSON.stringify(data))

// ❌ ERRADO - NUNCA use sessionStorage
├── package.json           ⚠️ CUIDADO
```


```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5001',  # ✅ Porta altern
]

python manage.py runserver 0.0.0.0:3333

```python
COR

    'authorization',
    'dnt',
    'user-agent',
    'x-requested-with',
]

```python
de
   



# ✅ SEMPRE usar wrapper
```
### URLs
# urls.py - MANTER exatamente como mock
    path('api/auth/login', LoginView.as_view()),   
    path('api/users', UserListView.as_view()),            # SEM 
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
# F12 -> Console -> Procurar por:
# - Erros de fetch para API
`
## 

1. Verificar se não alterou `src/main.ts


**Soluç
2

**Solução:**
2. Nunca misturar useKV com localStorage


- `
-
- P

- `index.html` (apenas meta tags)

-
- Configurações de 

1. **Sempre usar useKV para persistência**
3. **Manter formato de resposta da API**
5. 
7. **Testar compatibilidade após cada mudança**
-
⚡ *


































































































# F12 -> Console -> Procurar por:

# - Erros de fetch para API






**Solução:**














2. Nunca misturar useKV com localStorage













- `index.html` (apenas meta tags)









1. **Sempre usar useKV para persistência**

3. **Manter formato de resposta da API**



7. **Testar compatibilidade após cada mudança**



