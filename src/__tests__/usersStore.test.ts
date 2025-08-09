import { usersStore } from '@/data/usersStore';
import type { User, UserStatus } from '@/models/user';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UsersStore', () => {
  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getCurrentUser', () => {
    it('should return the current user', () => {
      const user = usersStore.getCurrentUser();
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.status).toBe('active');
    });

    it('should have default preferences', () => {
      const user = usersStore.getCurrentUser();
      
      expect(user.preferences).toBeDefined();
      expect(user.preferences?.theme).toBe('system');
      expect(user.preferences?.language).toBe('pt-BR');
      expect(user.preferences?.notifications).toBeDefined();
    });

    it('should have default security settings', () => {
      const user = usersStore.getCurrentUser();
      
      expect(user.security).toBeDefined();
      expect(user.security?.two_factor_enabled).toBe(false);
      expect(user.security?.recovery_codes).toBeDefined();
    });
  });

  describe('updateCurrentUser', () => {
    it('should update current user data', () => {
      const currentUser = usersStore.getCurrentUser();
      const updateData = {
        name: 'Nome Atualizado',
        phone: '+55 11 98765-4321',
      };

      const updatedUser = usersStore.updateCurrentUser(updateData);

      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.phone).toBe(updateData.phone);
      expect(updatedUser.id).toBe(currentUser.id); // ID não deve mudar
      expect(updatedUser.email).toBe(currentUser.email); // Email não deve mudar
    });

    it('should update preferences', () => {
      const newPreferences = {
        theme: 'dark' as const,
        language: 'en-US' as const,
        date_format: 'YYYY-MM-DD' as const,
        time_format: '12h' as const,
        notifications: {
          email: false,
          push: true,
        },
      };

      const updatedUser = usersStore.updateCurrentUser({ preferences: newPreferences });

      expect(updatedUser.preferences).toEqual(newPreferences);
    });

    it('should update security settings', () => {
      const newSecurity = {
        two_factor_enabled: true,
        recovery_codes: ['CODE1', 'CODE2', 'CODE3'],
      };

      const updatedUser = usersStore.updateCurrentUser({ security: newSecurity });

      expect(updatedUser.security).toEqual(newSecurity);
    });

    it('should update updated_at timestamp', () => {
      const beforeUpdate = new Date();
      
      const updatedUser = usersStore.updateCurrentUser({ name: 'Teste' });
      
      const afterUpdate = new Date(updatedUser.updated_at);
      expect(afterUpdate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('addUser', () => {
    it('should create a new user', () => {
      const newUserData = {
        name: 'Novo Usuário',
        email: 'novo@exemplo.com',
        role: 'technician' as const,
        status: 'active' as UserStatus,
      };

      const newUser = usersStore.addUser(newUserData);

      expect(newUser.id).toBeDefined();
      expect(newUser.name).toBe(newUserData.name);
      expect(newUser.email).toBe(newUserData.email);
      expect(newUser.role).toBe(newUserData.role);
      expect(newUser.status).toBe(newUserData.status);
      expect(newUser.created_at).toBeDefined();
      expect(newUser.updated_at).toBeDefined();
    });

    it('should assign default preferences and security', () => {
      const newUserData = {
        name: 'Novo Usuário',
        email: 'novo@exemplo.com',
        role: 'requester' as const,
        status: 'active' as UserStatus,
      };

      const newUser = usersStore.addUser(newUserData);

      expect(newUser.preferences).toBeDefined();
      expect(newUser.preferences?.theme).toBe('system');
      expect(newUser.security).toBeDefined();
      expect(newUser.security?.two_factor_enabled).toBe(false);
    });
  });

  describe('setUserStatus', () => {
    it('should update user status', () => {
      const users = usersStore.listUsers();
      const testUser = users.find(u => u.status === 'active');
      
      if (testUser) {
        usersStore.setUserStatus(testUser.id, 'disabled');
        
        const updatedUsers = usersStore.listUsers();
        const updatedUser = updatedUsers.find(u => u.id === testUser.id);
        
        expect(updatedUser?.status).toBe('disabled');
      }
    });
  });

  describe('getUserByEmail', () => {
    it('should find user by email', () => {
      const users = usersStore.listUsers();
      const firstUser = users[0];
      
      const foundUser = usersStore.getUserByEmail(firstUser.email);
      
      expect(foundUser).toEqual(firstUser);
    });

    it('should return null for non-existent email', () => {
      const foundUser = usersStore.getUserByEmail('naoexiste@exemplo.com');
      
      expect(foundUser).toBeNull();
    });
  });

  describe('generateRecoveryCodes', () => {
    it('should generate recovery codes', () => {
      const codes = usersStore.generateRecoveryCodes();
      
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBe(8);
      
      codes.forEach(code => {
        expect(typeof code).toBe('string');
        expect(code.length).toBe(6);
        expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
      });
    });

    it('should generate unique codes', () => {
      const codes1 = usersStore.generateRecoveryCodes();
      const codes2 = usersStore.generateRecoveryCodes();
      
      expect(codes1).not.toEqual(codes2);
    });
  });

  describe('listUsers', () => {
    it('should return array of users', () => {
      const users = usersStore.listUsers();
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      
      users.forEach(user => {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.role).toMatch(/^(admin|technician|requester)$/);
        expect(user.status).toMatch(/^(active|invited|disabled)$/);
      });
    });
  });
});