# TrakNor CMMS - Tela de Login

## Visão Geral

A tela de login do TrakNor CMMS foi criada seguindo o design fornecido e implementa autenticação básica para o sistema de gestão de manutenção HVAC.

## Características

### Design
- **Layout split**: Formulário à esquerda, imagem HVAC à direita
- **Responsive**: Adapta-se a diferentes tamanhos de tela
- **Tipografia**: Usa a fonte Inter já configurada no projeto
- **Cores**: Segue a paleta de cores do TrakNor (azul petróleo/teal)

### Funcionalidades

#### Autenticação
- Validação de e-mail e senha
- Mensagens de erro em tempo real
- Botão de mostrar/ocultar senha
- Estados de carregamento durante login

#### Credenciais de Demonstração
O sistema inclui credenciais de teste:

- **Administrador**: admin@traknor.com / admin123
- **Técnico**: tecnico@traknor.com / tecnico123

#### Acessibilidade
- Labels apropriados para leitores de tela
- Mensagens de erro com `role="alert"`
- Foco gerenciado corretamente
- Suporte a navegação por teclado

### Arquitetura de Autenticação

#### Componentes
- `LoginPage.tsx` - Página principal de login
- `AuthProvider.tsx` - Provedor de contexto de autenticação
- `useAuth.ts` - Hook para gerenciar estado de autenticação

#### Fluxo de Autenticação
1. Usuário acessa a aplicação
2. `AuthProvider` verifica se há token de autenticação
3. Se não autenticado, redireciona para `/login`
4. Após login bem-sucedido, redireciona para dashboard principal
5. Dados do usuário ficam armazenados em `localStorage`

#### Persistência
- Token de autenticação: `auth:user`
- Papel do usuário: `auth:role`
- Dados ficam em `localStorage` para persistir entre sessões

### Segurança

#### Medidas Implementadas
- Validação de formato de e-mail
- Requisitos mínimos de senha
- Limpeza automática de dados inválidos
- Logout em todas as abas quando necessário

#### Mock Authentication
Para desenvolvimento, o sistema usa autenticação mock:
- Credenciais são validadas client-side
- Perfis de usuário são simulados
- Roles (admin, technician, requester) são aplicados automaticamente

### Próximos Passos

Para produção, será necessário:
1. Integrar com backend real de autenticação
2. Implementar JWT tokens
3. Adicionar refresh tokens
4. Implementar 2FA
5. Adicionar recuperação de senha

## Uso

### Acessar a Tela de Login
- URL: `/login`
- Redirecionamento automático quando não autenticado

### Fazer Login
1. Inserir e-mail e senha
2. Clicar em "Acessar"
3. Sistema valida credenciais
4. Redirecionamento para dashboard principal

### Logout
- Disponível no menu do usuário no canto superior direito
- Remove dados de autenticação
- Redireciona para tela de login

## Arquivos Relacionados

- `src/pages/LoginPage.tsx` - Componente principal
- `src/components/auth/AuthProvider.tsx` - Provedor de autenticação
- `src/hooks/useAuth.ts` - Hook de autenticação
- `src/data/usersStore.ts` - Store de usuários (atualizado)
- `src/components/Layout.tsx` - Layout principal (com logout)