import { describe, it, expect, beforeEach } from 'vitest';
import { abilities } from '@/acl/abilities';
import type { Role, Action, Subject } from '@/acl/abilities';

describe('ACL Permission System', () => {
  describe('Admin permissions', () => {
    const adminRules = abilities.admin;

    it('should allow admin to do everything', () => {
      expect(adminRules).toHaveLength(1);
      expect(adminRules[0]).toEqual({
        action: ['view', 'create', 'edit', 'delete', 'manage'],
        subject: '*'
      });
    });

    it('should grant admin access to all resources', () => {
      const testSubjects: Subject[] = ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'];
      const testActions: Action[] = ['view', 'create', 'edit', 'delete', 'manage'];
      
      const rule = adminRules[0];
      const ruleActions = Array.isArray(rule.action) ? rule.action : [rule.action];
      const ruleSubjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];

      testActions.forEach(action => {
        expect(ruleActions.includes(action)).toBe(true);
      });
      
      expect(ruleSubjects.includes('*' as Subject)).toBe(true);
    });
  });

  describe('Technician permissions', () => {
    const technicianRules = abilities.technician;

    it('should allow viewing everything', () => {
      const viewRule = technicianRules.find(rule => 
        Array.isArray(rule.action) ? rule.action.includes('view') : rule.action === 'view'
      );
      expect(viewRule).toBeDefined();
      expect(viewRule?.subject).toBe('*');
    });

    it('should allow editing work orders, inventory, and procedures only', () => {
      const editRule = technicianRules.find(rule => 
        Array.isArray(rule.action) ? rule.action.includes('edit') : rule.action === 'edit'
      );
      expect(editRule).toBeDefined();
      const subjects = Array.isArray(editRule?.subject) ? editRule.subject : [editRule?.subject];
      expect(subjects).toContain('workorder');
      expect(subjects).toContain('inventory');
      expect(subjects).toContain('procedure');
      expect(subjects).not.toContain('user');
      expect(subjects).not.toContain('asset');
    });

    it('should allow creating work orders and solicitations', () => {
      const createRule = technicianRules.find(rule => 
        Array.isArray(rule.action) ? rule.action.includes('create') : rule.action === 'create'
      );
      expect(createRule).toBeDefined();
      const subjects = Array.isArray(createRule?.subject) ? createRule.subject : [createRule?.subject];
      expect(subjects).toContain('workorder');
      expect(subjects).toContain('solicitation');
    });

    it('should allow converting solicitations', () => {
      const convertRule = technicianRules.find(rule => 
        Array.isArray(rule.action) ? rule.action.includes('convert') : rule.action === 'convert'
      );
      expect(convertRule).toBeDefined();
      const subjects = Array.isArray(convertRule?.subject) ? convertRule.subject : [convertRule?.subject];
      expect(subjects).toContain('solicitation');
    });

    it('should NOT allow deleting anything', () => {
      const hasDeleteRule = technicianRules.some(rule => {
        const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
        return actions.includes('delete');
      });
      expect(hasDeleteRule).toBe(false);
    });
  });

  describe('Requester permissions', () => {
    const requesterRules = abilities.requester;

    it('should allow viewing everything', () => {
      const viewRule = requesterRules.find(rule => 
        Array.isArray(rule.action) ? rule.action.includes('view') : rule.action === 'view'
      );
      expect(viewRule).toBeDefined();
      expect(viewRule?.subject).toBe('*');
    });

    it('should allow creating and editing solicitations only', () => {
      const modifyRule = requesterRules.find(rule => {
        const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
        return actions.includes('create') && actions.includes('edit');
      });
      expect(modifyRule).toBeDefined();
      const subjects = Array.isArray(modifyRule?.subject) ? modifyRule.subject : [modifyRule?.subject];
      expect(subjects).toEqual(['solicitation']);
    });

    it('should NOT allow deleting anything', () => {
      const hasDeleteRule = requesterRules.some(rule => {
        const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
        return actions.includes('delete');
      });
      expect(hasDeleteRule).toBe(false);
    });

    it('should NOT allow managing work orders directly', () => {
      const workOrderRule = requesterRules.find(rule => {
        const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
        const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
        return actions.some(a => ['create', 'edit', 'delete'].includes(a)) && 
               subjects.includes('workorder');
      });
      expect(workOrderRule).toBeUndefined();
    });
  });

  describe('Permission hierarchy validation', () => {
    it('should ensure admin has more permissions than technician', () => {
      const adminActions = abilities.admin.flatMap(rule => 
        Array.isArray(rule.action) ? rule.action : [rule.action]
      );
      const technicianActions = abilities.technician.flatMap(rule => 
        Array.isArray(rule.action) ? rule.action : [rule.action]
      );
      
      // Admin should have manage permission which technician doesn't
      expect(adminActions).toContain('manage');
      expect(technicianActions).not.toContain('manage');
      
      // Admin should have delete permission which technician doesn't
      expect(adminActions).toContain('delete');
      expect(technicianActions).not.toContain('delete');
    });

    it('should ensure technician has more permissions than requester', () => {
      // Technician can edit work orders, requester cannot
      const techWorkOrderRule = abilities.technician.find(rule => {
        const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
        const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
        return actions.includes('edit') && subjects.includes('workorder');
      });
      expect(techWorkOrderRule).toBeDefined();

      const reqWorkOrderRule = abilities.requester.find(rule => {
        const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
        const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
        return actions.includes('edit') && subjects.includes('workorder');
      });
      expect(reqWorkOrderRule).toBeUndefined();
    });
  });

  describe('Role definition consistency', () => {
    it('should have all required roles defined', () => {
      expect(abilities).toHaveProperty('admin');
      expect(abilities).toHaveProperty('technician');
      expect(abilities).toHaveProperty('requester');
    });

    it('should have rules for each role', () => {
      Object.keys(abilities).forEach(role => {
        expect(abilities[role as Role]).toBeInstanceOf(Array);
        expect(abilities[role as Role].length).toBeGreaterThan(0);
      });
    });

    it('should have valid action and subject types in all rules', () => {
      const validActions: Action[] = ['view', 'create', 'edit', 'delete', 'move', 'convert', 'manage'];
      const validSubjects: Subject[] = ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user', '*'];

      Object.values(abilities).forEach(rules => {
        rules.forEach(rule => {
          const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
          const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
          
          actions.forEach(action => {
            expect(validActions).toContain(action);
          });
          
          subjects.forEach(subject => {
            expect(validSubjects).toContain(subject);
          });
        });
      });
    });
  });
});