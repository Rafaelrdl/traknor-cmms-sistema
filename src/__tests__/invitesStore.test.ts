import { invitesStore } from '@/data/invitesStore';
import type { UserRole } from '@/models/user';

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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://exemplo.com',
  },
  writable: true,
});

describe('InvitesStore', () => {
  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]'); // Array vazio de convites
  });

  describe('createInvite', () => {
    const inviteParams = {
      email: 'teste@exemplo.com',
      role: 'technician' as UserRole,
      invited_by_user_id: 'user-123',
    };

    it('should create a new invite', () => {
      const invite = invitesStore.createInvite(inviteParams);

      expect(invite.id).toBeDefined();
      expect(invite.email).toBe(inviteParams.email);
      expect(invite.role).toBe(inviteParams.role);
      expect(invite.invited_by_user_id).toBe(inviteParams.invited_by_user_id);
      expect(invite.token).toBeDefined();
      expect(invite.url).toContain('https://exemplo.com/onboarding/accept?token=');
      expect(invite.status).toBe('pending');
      expect(invite.sent_at).toBeDefined();
      expect(invite.expires_at).toBeDefined();
    });

    it('should set expiration date to 7 days from now', () => {
      const beforeCreate = new Date();
      const invite = invitesStore.createInvite(inviteParams);
      const expiresAt = new Date(invite.expires_at);
      
      const daysDiff = (expiresAt.getTime() - beforeCreate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(7, 1);
    });

    it('should generate unique token', () => {
      const invite1 = invitesStore.createInvite(inviteParams);
      const invite2 = invitesStore.createInvite({
        ...inviteParams,
        email: 'outro@exemplo.com',
      });

      expect(invite1.token).not.toBe(invite2.token);
      expect(invite1.id).not.toBe(invite2.id);
    });

    it('should throw error for duplicate email', () => {
      // Criar primeiro convite
      invitesStore.createInvite(inviteParams);

      // Tentar criar segundo convite com mesmo email
      expect(() => {
        invitesStore.createInvite(inviteParams);
      }).toThrow('Já existe um convite pendente para este email');
    });
  });

  describe('listInvites', () => {
    it('should return empty array when no invites', () => {
      const invites = invitesStore.listInvites();
      
      expect(Array.isArray(invites)).toBe(true);
      expect(invites.length).toBe(0);
    });

    it('should return invites sorted by sent_at desc', () => {
      const invite1 = invitesStore.createInvite({
        email: 'primeiro@exemplo.com',
        role: 'technician',
        invited_by_user_id: 'user-123',
      });

      // Simular um pequeno atraso
      jest.advanceTimersByTime(1000);

      const invite2 = invitesStore.createInvite({
        email: 'segundo@exemplo.com',
        role: 'admin',
        invited_by_user_id: 'user-123',
      });

      const invites = invitesStore.listInvites();

      expect(invites.length).toBe(2);
      expect(invites[0].email).toBe(invite2.email); // Mais recente primeiro
      expect(invites[1].email).toBe(invite1.email);
    });
  });

  describe('getInviteByToken', () => {
    it('should return invite for valid token', () => {
      const createdInvite = invitesStore.createInvite({
        email: 'teste@exemplo.com',
        role: 'technician',
        invited_by_user_id: 'user-123',
      });

      const foundInvite = invitesStore.getInviteByToken(createdInvite.token);

      expect(foundInvite).toEqual(createdInvite);
    });

    it('should return null for invalid token', () => {
      const foundInvite = invitesStore.getInviteByToken('token-inexistente');

      expect(foundInvite).toBeNull();
    });

    it('should return null for expired invite', () => {
      const createdInvite = invitesStore.createInvite({
        email: 'teste@exemplo.com',
        role: 'technician',
        invited_by_user_id: 'user-123',
      });

      // Simular que o convite expirou
      jest.advanceTimersByTime(8 * 24 * 60 * 60 * 1000); // 8 dias

      const foundInvite = invitesStore.getInviteByToken(createdInvite.token);

      expect(foundInvite).toBeNull();
    });
  });

  describe('resendInvite', () => {
    it('should update sent_at and generate new token', () => {
      const originalInvite = invitesStore.createInvite({
        email: 'teste@exemplo.com',
        role: 'technician',
        invited_by_user_id: 'user-123',
      });

      // Simular um atraso
      jest.advanceTimersByTime(1000);

      const resentInvite = invitesStore.resendInvite(originalInvite.id);

      expect(resentInvite.id).toBe(originalInvite.id);
      expect(resentInvite.email).toBe(originalInvite.email);
      expect(resentInvite.token).not.toBe(originalInvite.token);
      expect(new Date(resentInvite.sent_at).getTime()).toBeGreaterThan(
        new Date(originalInvite.sent_at).getTime()
      );
    });

    it('should throw error for non-existent invite', () => {
      expect(() => {
        invitesStore.resendInvite('invite-inexistente');
      }).toThrow('Convite não encontrado');
    });
  });

  describe('revokeInvite', () => {
    it('should set invite status to revoked', () => {
      const invite = invitesStore.createInvite({
        email: 'teste@exemplo.com',
        role: 'technician',
        invited_by_user_id: 'user-123',
      });

      invitesStore.revokeInvite(invite.id);

      const invites = invitesStore.listInvites();
      const revokedInvite = invites.find(i => i.id === invite.id);

      expect(revokedInvite?.status).toBe('revoked');
    });
  });

  describe('acceptInvite', () => {
    it('should accept invite and create user', () => {
      const invite = invitesStore.createInvite({
        email: 'teste@exemplo.com',
        role: 'technician',
        invited_by_user_id: 'user-123',
      });

      const userData = {
        name: 'Nome Usuário',
        password: 'senha123',
      };

      const newUser = invitesStore.acceptInvite(invite.token, userData);

      expect(newUser.name).toBe(userData.name);
      expect(newUser.email).toBe(invite.email);
      expect(newUser.role).toBe(invite.role);
      expect(newUser.status).toBe('active');

      // Verificar se o convite foi marcado como aceito
      const invites = invitesStore.listInvites();
      const acceptedInvite = invites.find(i => i.id === invite.id);
      expect(acceptedInvite?.status).toBe('accepted');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        invitesStore.acceptInvite('token-inexistente', {
          name: 'Nome',
          password: 'senha123',
        });
      }).toThrow('Token de convite inválido ou expirado');
    });
  });

  describe('getInviteStats', () => {
    it('should return correct stats', () => {
      // Criar convites com diferentes status
      const invite1 = invitesStore.createInvite({
        email: 'pendente@exemplo.com',
        role: 'technician',
        invited_by_user_id: 'user-123',
      });

      const invite2 = invitesStore.createInvite({
        email: 'aceito@exemplo.com',
        role: 'admin',
        invited_by_user_id: 'user-123',
      });

      // Aceitar um convite
      invitesStore.acceptInvite(invite2.token, {
        name: 'Usuário Aceito',
        password: 'senha123',
      });

      // Revogar um convite seria necessário criar mais um, mas vamos testar com os existentes
      const stats = invitesStore.getInviteStats();

      expect(stats.pending).toBe(1);
      expect(stats.accepted).toBe(1);
      expect(stats.expired).toBe(0);
      expect(stats.revoked).toBe(0);
    });
  });
});

// Mock para Jest timers
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});