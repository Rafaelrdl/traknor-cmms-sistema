import type { User, UserStatus, defaultPreferences, defaultSecurity } from '@/models/user';
import mockUsers from '@/mocks/users.json';

const USERS_KEY = 'users:db';
const CURRENT_USER_KEY = 'auth:current_user';

// Helper para carregar dados do localStorage ou usar seed
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
    console.error('Erro ao salvar no localStorage:', error);
  }
}

// Store de usuários
class UsersStore {
  private users: User[] = [];

  constructor() {
    this.users = load(USERS_KEY, mockUsers as User[]);
  }

  private saveUsers(): void {
    save(USERS_KEY, this.users);
  }

  listUsers(): User[] {
    return [...this.users];
  }

  getCurrentUser(): User {
    // Por simplicidade, retorna o primeiro admin como usuário atual
    // Em um cenário real, seria baseado em autenticação
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserId) {
      const user = this.users.find(u => u.id === currentUserId);
      if (user) return { ...user };
    }
    
    // Fallback para o primeiro admin
    const adminUser = this.users.find(u => u.role === 'admin' && u.status === 'active');
    if (adminUser) {
      localStorage.setItem(CURRENT_USER_KEY, adminUser.id);
      return { ...adminUser };
    }
    
    // Se não houver admin ativo, retorna o primeiro usuário ativo
    const activeUser = this.users.find(u => u.status === 'active');
    if (activeUser) {
      localStorage.setItem(CURRENT_USER_KEY, activeUser.id);
      return { ...activeUser };
    }
    
    throw new Error('Nenhum usuário ativo encontrado');
  }

  setCurrentUser(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user && user.status === 'active') {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      throw new Error('Usuário não encontrado ou inativo');
    }
  }

  updateCurrentUser(partial: Partial<User>): User {
    const currentUser = this.getCurrentUser();
    const updatedUser = {
      ...currentUser,
      ...partial,
      id: currentUser.id, // Não permitir alteração do ID
      email: currentUser.email, // Não permitir alteração do email por padrão
      updated_at: new Date().toISOString(),
    };

    // Garantir que preferências e segurança tenham valores padrão
    if (!updatedUser.preferences) {
      updatedUser.preferences = { ...defaultPreferences };
    }
    if (!updatedUser.security) {
      updatedUser.security = { ...defaultSecurity };
    }

    const userIndex = this.users.findIndex(u => u.id === currentUser.id);
    if (userIndex >= 0) {
      this.users[userIndex] = updatedUser;
      this.saveUsers();
    }

    return { ...updatedUser };
  }

  updateUser(id: string, partial: Partial<User>): User {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex < 0) {
      throw new Error('Usuário não encontrado');
    }

    const user = this.users[userIndex];
    const updatedUser = {
      ...user,
      ...partial,
      id: user.id, // Não permitir alteração do ID
      updated_at: new Date().toISOString(),
    };

    // Garantir que preferências e segurança tenham valores padrão
    if (!updatedUser.preferences) {
      updatedUser.preferences = { ...defaultPreferences };
    }
    if (!updatedUser.security) {
      updatedUser.security = { ...defaultSecurity };
    }

    this.users[userIndex] = updatedUser;
    this.saveUsers();

    return { ...updatedUser };
  }

  addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preferences: user.preferences || { ...defaultPreferences },
      security: user.security || { ...defaultSecurity },
    };

    this.users.push(newUser);
    this.saveUsers();

    return { ...newUser };
  }

  setUserStatus(id: string, status: UserStatus): void {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex >= 0) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        status,
        updated_at: new Date().toISOString(),
      };
      this.saveUsers();
    }
  }

  getUserByEmail(email: string): User | null {
    const user = this.users.find(u => u.email === email);
    return user ? { ...user } : null;
  }

  // Método para gerar códigos de recuperação 2FA
  generateRecoveryCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}

// Instância singleton
export const usersStore = new UsersStore();

// Hooks para React
export function useUsers() {
  return {
    listUsers: () => usersStore.listUsers(),
    getCurrentUser: () => usersStore.getCurrentUser(),
    setCurrentUser: (userId: string) => usersStore.setCurrentUser(userId),
    updateCurrentUser: (partial: Partial<User>) => usersStore.updateCurrentUser(partial),
    updateUser: (id: string, partial: Partial<User>) => usersStore.updateUser(id, partial),
    addUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => usersStore.addUser(user),
    setUserStatus: (id: string, status: UserStatus) => usersStore.setUserStatus(id, status),
    getUserByEmail: (email: string) => usersStore.getUserByEmail(email),
    generateRecoveryCodes: () => usersStore.generateRecoveryCodes(),
  };
}