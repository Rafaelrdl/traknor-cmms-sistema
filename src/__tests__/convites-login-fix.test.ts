import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { invitesStore } from '@/data/invitesStore';
import { usersStore } from '@/data/usersStore';
import { credentialsStore } from '@/data/credentialsStore';

// Mock localStorage e window para Node.js
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Mock global objects
(global as any).localStorage = localStorageMock;
(global as any).window = {
  localStorage: localStorageMock,
  location: {
    origin: 'http://localhost:3000'
  }
};

describe('Sistema de Convites e Login - Correção', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorageMock.clear();
  });

  afterEach(() => {
    // Limpar localStorage após cada teste
    localStorageMock.clear();
  });

  describe('Fluxo completo de convite e login', () => {
    it('deve criar convite, aceitar convite e permitir login', () => {
      // 1. Criar um convite
      const invite = invitesStore.createInvite({
        email: 'novo.usuario@teste.com',
        role: 'technician',
        invited_by_user_id: 'admin-001',
      });

      expect(invite).toBeDefined();
      expect(invite.email).toBe('novo.usuario@teste.com');
      expect(invite.role).toBe('technician');
      expect(invite.status).toBe('pending');
      expect(invite.token).toBeDefined();

      // 2. Aceitar o convite com senha
      const userData = {
        name: 'Novo Usuário',
        password: 'MinhaSenh@123',
      };

      const newUser = invitesStore.acceptInvite(invite.token, userData);

      expect(newUser).toBeDefined();
      expect(newUser.name).toBe('Novo Usuário');
      expect(newUser.email).toBe('novo.usuario@teste.com');
      expect(newUser.role).toBe('technician');
      expect(newUser.status).toBe('active');

      // 3. Verificar se as credenciais foram salvas
      const isValidCredentials = credentialsStore.validateCredentials(
        'novo.usuario@teste.com',
        'MinhaSenh@123'
      );

      expect(isValidCredentials).toBe(true);

      // 4. Testar credenciais incorretas
      const isInvalidCredentials = credentialsStore.validateCredentials(
        'novo.usuario@teste.com',
        'SenhaErrada'
      );

      expect(isInvalidCredentials).toBe(false);

      // 5. Verificar se o usuário foi criado corretamente
      const userByEmail = usersStore.getUserByEmail('novo.usuario@teste.com');
      expect(userByEmail).toBeDefined();
      expect(userByEmail?.name).toBe('Novo Usuário');
      expect(userByEmail?.role).toBe('technician');
    });

    it('deve rejeitar login com senha incorreta', () => {
      // Criar e aceitar convite
      const invite = invitesStore.createInvite({
        email: 'usuario@teste.com',
        role: 'requester',
        invited_by_user_id: 'admin-001',
      });

      invitesStore.acceptInvite(invite.token, {
        name: 'Usuário Teste',
        password: 'SenhaCorreta123',
      });

      // Testar login com senha correta
      expect(credentialsStore.validateCredentials('usuario@teste.com', 'SenhaCorreta123')).toBe(true);

      // Testar login com senha incorreta
      expect(credentialsStore.validateCredentials('usuario@teste.com', 'SenhaErrada')).toBe(false);
    });

    it('deve rejeitar login para usuário inexistente', () => {
      // Testar login para usuário que não existe
      expect(credentialsStore.validateCredentials('inexistente@teste.com', 'qualquersenha')).toBe(false);
    });

    it('deve permitir atualização de senha', () => {
      // Criar e aceitar convite
      const invite = invitesStore.createInvite({
        email: 'usuario.senha@teste.com',
        role: 'technician',
        invited_by_user_id: 'admin-001',
      });

      const user = invitesStore.acceptInvite(invite.token, {
        name: 'Usuário Para Teste Senha',
        password: 'SenhaAntiga123',
      });

      // Verificar senha antiga
      expect(credentialsStore.validateCredentials('usuario.senha@teste.com', 'SenhaAntiga123')).toBe(true);

      // Atualizar senha
      credentialsStore.updatePassword(user.id, 'NovaSenha456');

      // Verificar que a senha antiga não funciona mais
      expect(credentialsStore.validateCredentials('usuario.senha@teste.com', 'SenhaAntiga123')).toBe(false);

      // Verificar que a nova senha funciona
      expect(credentialsStore.validateCredentials('usuario.senha@teste.com', 'NovaSenha456')).toBe(true);
    });
  });

  describe('Credenciais de Demonstração', () => {
    it('deve permitir login com credenciais de admin padrão', () => {
      const isValid = credentialsStore.validateCredentials('admin@traknor.com', 'admin123');
      expect(isValid).toBe(true);

      const user = usersStore.getUserByEmail('admin@traknor.com');
      expect(user).toBeTruthy();
      expect(user?.role).toBe('admin');
      expect(user?.status).toBe('active');
    });

    it('deve permitir login com credenciais de técnico padrão', () => {
      const isValid = credentialsStore.validateCredentials('tecnico@traknor.com', 'tecnico123');
      expect(isValid).toBe(true);

      const user = usersStore.getUserByEmail('tecnico@traknor.com');
      expect(user).toBeTruthy();
      expect(user?.role).toBe('technician');
      expect(user?.status).toBe('active');
    });

    it('deve rejeitar credenciais inválidas', () => {
      const isValid = credentialsStore.validateCredentials('admin@traknor.com', 'senhaerrada');
      expect(isValid).toBe(false);
    });
  });

  describe('CredentialsStore', () => {
    it('deve inicializar com credenciais padrão', () => {
      // As credenciais padrão devem ser criadas automaticamente
      expect(credentialsStore.validateCredentials('admin@traknor.com', 'admin123')).toBe(true);
      expect(credentialsStore.validateCredentials('tecnico@traknor.com', 'tecnico123')).toBe(true);
    });

    it('deve adicionar novas credenciais', () => {
      credentialsStore.addCredentials('user-123', 'teste@exemplo.com', 'minhasenha');
      expect(credentialsStore.validateCredentials('teste@exemplo.com', 'minhasenha')).toBe(true);
    });

    it('deve atualizar credenciais existentes', () => {
      credentialsStore.addCredentials('user-456', 'update@exemplo.com', 'senha1');
      expect(credentialsStore.validateCredentials('update@exemplo.com', 'senha1')).toBe(true);

      credentialsStore.addCredentials('user-456', 'update@exemplo.com', 'senha2');
      expect(credentialsStore.validateCredentials('update@exemplo.com', 'senha1')).toBe(false);
      expect(credentialsStore.validateCredentials('update@exemplo.com', 'senha2')).toBe(true);
    });

    it('deve remover credenciais', () => {
      credentialsStore.addCredentials('user-789', 'remover@exemplo.com', 'senha');
      expect(credentialsStore.validateCredentials('remover@exemplo.com', 'senha')).toBe(true);

      credentialsStore.removeCredentials('user-789');
      expect(credentialsStore.validateCredentials('remover@exemplo.com', 'senha')).toBe(false);
    });
  });
});
