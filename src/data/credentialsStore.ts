const CREDENTIALS_KEY = 'credentials:db';

interface UserCredentials {
  userId: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

// Helper para carregar dados do localStorage ou usar seed vazio
function load<T>(key: string, seed: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : seed;
  } catch {
    return seed;
  }
}

// Helper para salvar dados no localStorage
function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao salvar credenciais no localStorage:', error);
  }
}

// Store de credenciais
class CredentialsStore {
  private credentials: UserCredentials[] = [];

  constructor() {
    this.credentials = load(CREDENTIALS_KEY, []);
    // Inicializar com credenciais padrão se necessário
    this.initializeDefaultCredentials();
  }

  private saveCredentials(): void {
    save(CREDENTIALS_KEY, this.credentials);
  }

  private initializeDefaultCredentials(): void {
    // Verificar se já existem credenciais para os usuários padrão
    const adminExists = this.credentials.find(c => c.email === 'admin@traknor.com');
    const techExists = this.credentials.find(c => c.email === 'tecnico@traknor.com');

    if (!adminExists) {
      this.credentials.push({
        userId: 'user-admin-001',
        email: 'admin@traknor.com',
        password: 'admin123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (!techExists) {
      this.credentials.push({
        userId: 'user-tech-002',
        email: 'tecnico@traknor.com',
        password: 'tecnico123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (!adminExists || !techExists) {
      this.saveCredentials();
    }
  }

  // Adicionar credenciais para um novo usuário
  addCredentials(userId: string, email: string, password: string): void {
    // Verificar se já existem credenciais para este usuário
    const existingIndex = this.credentials.findIndex(c => c.userId === userId || c.email === email);
    
    const credential: UserCredentials = {
      userId,
      email,
      password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Atualizar credenciais existentes
      this.credentials[existingIndex] = {
        ...this.credentials[existingIndex],
        password,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Adicionar novas credenciais
      this.credentials.push(credential);
    }

    this.saveCredentials();
  }

  // Validar credenciais de login
  validateCredentials(email: string, password: string): boolean {
    const credential = this.credentials.find(c => c.email === email);
    return credential ? credential.password === password : false;
  }

  // Atualizar senha de um usuário
  updatePassword(userId: string, newPassword: string): void {
    const index = this.credentials.findIndex(c => c.userId === userId);
    if (index >= 0) {
      this.credentials[index] = {
        ...this.credentials[index],
        password: newPassword,
        updatedAt: new Date().toISOString(),
      };
      this.saveCredentials();
    }
  }

  // Remover credenciais de um usuário
  removeCredentials(userId: string): void {
    this.credentials = this.credentials.filter(c => c.userId !== userId);
    this.saveCredentials();
  }

  // Obter credenciais por email (apenas para validação)
  getCredentialsByEmail(email: string): UserCredentials | null {
    const credential = this.credentials.find(c => c.email === email);
    return credential ? { ...credential } : null;
  }
}

// Instância singleton
export const credentialsStore = new CredentialsStore();

// Hooks para React
export function useCredentials() {
  return {
    addCredentials: (userId: string, email: string, password: string) =>
      credentialsStore.addCredentials(userId, email, password),
    validateCredentials: (email: string, password: string) =>
      credentialsStore.validateCredentials(email, password),
    updatePassword: (userId: string, newPassword: string) =>
      credentialsStore.updatePassword(userId, newPassword),
    removeCredentials: (userId: string) =>
      credentialsStore.removeCredentials(userId),
  };
}
