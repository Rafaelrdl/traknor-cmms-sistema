import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAbility } from '@/hooks/useAbility';
import { useCurrentRole } from '@/data/authStore';
import type { Role } from '@/acl/abilities';

// Mock the auth store
vi.mock('@/data/authStore', () => ({
  useCurrentRole: vi.fn()
}));

const mockUseCurrentRole = useCurrentRole as any;

describe('useAbility Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin abilities', () => {
    beforeEach(() => {
      mockUseCurrentRole.mockReturnValue(['admin', vi.fn()]);
    });

    it('should allow admin to do everything', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.role).toBe('admin');
      
      // Test all actions on all subjects
      expect(result.current.can('view', 'workorder')).toBe(true);
      expect(result.current.can('create', 'asset')).toBe(true);
      expect(result.current.can('edit', 'plan')).toBe(true);
      expect(result.current.can('delete', 'user')).toBe(true);
      expect(result.current.can('manage', 'inventory')).toBe(true);
      expect(result.current.can('convert', 'solicitation')).toBe(true);
    });

    it('should provide helper methods that work correctly', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.canView('workorder')).toBe(true);
      expect(result.current.canCreate('asset')).toBe(true);
      expect(result.current.canEdit('plan')).toBe(true);
      expect(result.current.canDelete('user')).toBe(true);
      expect(result.current.canManage('inventory')).toBe(true);
      expect(result.current.canConvert('solicitation')).toBe(true);
    });
  });

  describe('Technician abilities', () => {
    beforeEach(() => {
      mockUseCurrentRole.mockReturnValue(['technician', vi.fn()]);
    });

    it('should allow viewing everything', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.role).toBe('technician');
      
      // Can view all subjects
      expect(result.current.canView('workorder')).toBe(true);
      expect(result.current.canView('asset')).toBe(true);
      expect(result.current.canView('plan')).toBe(true);
      expect(result.current.canView('user')).toBe(true);
      expect(result.current.canView('inventory')).toBe(true);
      expect(result.current.canView('solicitation')).toBe(true);
      expect(result.current.canView('report')).toBe(true);
      expect(result.current.canView('procedure')).toBe(true);
    });

    it('should allow editing work orders, inventory, and procedures only', () => {
      const { result } = renderHook(() => useAbility());
      
      // Can edit these subjects
      expect(result.current.canEdit('workorder')).toBe(true);
      expect(result.current.canEdit('inventory')).toBe(true);
      expect(result.current.canEdit('procedure')).toBe(true);
      
      // Cannot edit these subjects
      expect(result.current.canEdit('asset')).toBe(false);
      expect(result.current.canEdit('plan')).toBe(false);
      expect(result.current.canEdit('user')).toBe(false);
      expect(result.current.canEdit('report')).toBe(false);
      expect(result.current.canEdit('solicitation')).toBe(false);
    });

    it('should allow creating work orders and solicitations', () => {
      const { result } = renderHook(() => useAbility());
      
      // Can create these
      expect(result.current.canCreate('workorder')).toBe(true);
      expect(result.current.canCreate('solicitation')).toBe(true);
      
      // Cannot create these
      expect(result.current.canCreate('asset')).toBe(false);
      expect(result.current.canCreate('plan')).toBe(false);
      expect(result.current.canCreate('user')).toBe(false);
      expect(result.current.canCreate('inventory')).toBe(false);
      expect(result.current.canCreate('procedure')).toBe(false);
      expect(result.current.canCreate('report')).toBe(false);
    });

    it('should allow converting solicitations', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.canConvert('solicitation')).toBe(true);
      expect(result.current.canConvert('workorder')).toBe(false);
      expect(result.current.canConvert('asset')).toBe(false);
    });

    it('should NOT allow deleting anything', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.canDelete('workorder')).toBe(false);
      expect(result.current.canDelete('asset')).toBe(false);
      expect(result.current.canDelete('plan')).toBe(false);
      expect(result.current.canDelete('user')).toBe(false);
      expect(result.current.canDelete('inventory')).toBe(false);
      expect(result.current.canDelete('solicitation')).toBe(false);
      expect(result.current.canDelete('report')).toBe(false);
      expect(result.current.canDelete('procedure')).toBe(false);
    });

    it('should NOT allow managing anything', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.canManage('workorder')).toBe(false);
      expect(result.current.canManage('asset')).toBe(false);
      expect(result.current.canManage('plan')).toBe(false);
      expect(result.current.canManage('user')).toBe(false);
    });
  });

  describe('Requester abilities', () => {
    beforeEach(() => {
      mockUseCurrentRole.mockReturnValue(['requester', vi.fn()]);
    });

    it('should allow viewing everything', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.role).toBe('requester');
      
      // Can view all subjects  
      expect(result.current.canView('workorder')).toBe(true);
      expect(result.current.canView('asset')).toBe(true);
      expect(result.current.canView('plan')).toBe(true);
      expect(result.current.canView('user')).toBe(true);
      expect(result.current.canView('inventory')).toBe(true);
      expect(result.current.canView('solicitation')).toBe(true);
      expect(result.current.canView('report')).toBe(true);
      expect(result.current.canView('procedure')).toBe(true);
    });

    it('should only allow creating and editing solicitations', () => {
      const { result } = renderHook(() => useAbility());
      
      // Can create/edit solicitations only
      expect(result.current.canCreate('solicitation')).toBe(true);
      expect(result.current.canEdit('solicitation')).toBe(true);
      
      // Cannot create anything else
      expect(result.current.canCreate('workorder')).toBe(false);
      expect(result.current.canCreate('asset')).toBe(false);
      expect(result.current.canCreate('plan')).toBe(false);
      expect(result.current.canCreate('user')).toBe(false);
      expect(result.current.canCreate('inventory')).toBe(false);
      expect(result.current.canCreate('procedure')).toBe(false);
      expect(result.current.canCreate('report')).toBe(false);
      
      // Cannot edit anything else
      expect(result.current.canEdit('workorder')).toBe(false);
      expect(result.current.canEdit('asset')).toBe(false);
      expect(result.current.canEdit('plan')).toBe(false);
      expect(result.current.canEdit('user')).toBe(false);
      expect(result.current.canEdit('inventory')).toBe(false);
      expect(result.current.canEdit('procedure')).toBe(false);
      expect(result.current.canEdit('report')).toBe(false);
    });

    it('should NOT allow deleting anything', () => {
      const { result } = renderHook(() => useAbility());
      
      expect(result.current.canDelete('workorder')).toBe(false);
      expect(result.current.canDelete('asset')).toBe(false);
      expect(result.current.canDelete('plan')).toBe(false);
      expect(result.current.canDelete('user')).toBe(false);
      expect(result.current.canDelete('inventory')).toBe(false);
      expect(result.current.canDelete('solicitation')).toBe(false);
      expect(result.current.canDelete('report')).toBe(false);
      expect(result.current.canDelete('procedure')).toBe(false);
    });

    it('should NOT allow managing or converting anything', () => {
      const { result } = renderHook(() => useAbility());
      
      // No manage permissions
      expect(result.current.canManage('workorder')).toBe(false);
      expect(result.current.canManage('solicitation')).toBe(false);
      
      // No convert permissions
      expect(result.current.canConvert('solicitation')).toBe(false);
      expect(result.current.canConvert('workorder')).toBe(false);
    });
  });

  describe('Hook behavior', () => {
    it('should memoize results to prevent unnecessary re-renders', () => {
      mockUseCurrentRole.mockReturnValue(['admin', vi.fn()]);
      
      const { result, rerender } = renderHook(() => useAbility());
      
      const firstResult = result.current;
      rerender();
      const secondResult = result.current;
      
      // Same role should return same object reference
      expect(firstResult).toBe(secondResult);
    });

    it('should handle invalid/undefined roles gracefully', () => {
      mockUseCurrentRole.mockReturnValue([undefined, vi.fn()]);
      
      const { result } = renderHook(() => useAbility());
      
      // Should not throw and should deny all permissions
      expect(() => result.current.can('view', 'workorder')).not.toThrow();
      expect(result.current.can('view', 'workorder')).toBe(false);
    });

    it('should update when role changes', () => {
      const setRole = vi.fn();
      mockUseCurrentRole.mockReturnValue(['requester', setRole]);
      
      const { result, rerender } = renderHook(() => useAbility());
      
      expect(result.current.role).toBe('requester');
      expect(result.current.canDelete('solicitation')).toBe(false);
      
      // Change role
      mockUseCurrentRole.mockReturnValue(['admin', setRole]);
      rerender();
      
      expect(result.current.role).toBe('admin');
      expect(result.current.canDelete('solicitation')).toBe(true);
    });
  });

  describe('Context-based permissions', () => {
    it('should support context-based rules when implemented', () => {
      mockUseCurrentRole.mockReturnValue(['admin', vi.fn()]);
      
      const { result } = renderHook(() => useAbility());
      
      // Test that context parameter is accepted (even if not used yet)
      expect(() => result.current.can('edit', 'workorder', { ownerId: 'user1' })).not.toThrow();
      expect(result.current.can('edit', 'workorder', { ownerId: 'user1' })).toBe(true);
    });
  });
});