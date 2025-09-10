#!/usr/bin/env node

/**
 * Simple ACL Permission System Test Runner
 * Tests the permission system without requiring full testing infrastructure
 */

// Import the abilities configuration
import { abilities } from '../src/acl/abilities.js';

console.log('🔧 TrakNor CMMS - ACL Permission System Test');
console.log('='.repeat(50));

// Test data
const testResults = [];

function test(description, testFn) {
  try {
    testFn();
    console.log(`✅ ${description}`);
    testResults.push({ description, passed: true });
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    testResults.push({ description, passed: false, error: error.message });
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toContain(expected) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${expected}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toHaveLength(expected) {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${actual.length}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error('Expected value to be undefined');
      }
    }
  };
}

// Helper function to check if a role can perform an action on a subject
function canPerformAction(role, action, subject) {
  const rules = abilities[role] || [];
  return rules.some(rule => {
    const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
    const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
    
    const hasAction = actions.includes(action);
    const hasSubject = subjects.includes(subject) || subjects.includes('*');
    
    return hasAction && hasSubject;
  });
}

// Run Tests
console.log('\n📋 Running ACL Tests...\n');

// Test 1: Admin permissions
test('Admin should have full access to everything', () => {
  const adminRules = abilities.admin;
  expect(adminRules).toHaveLength(1);
  
  const rule = adminRules[0];
  const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
  const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
  
  expect(actions).toContain('view');
  expect(actions).toContain('create');
  expect(actions).toContain('edit');
  expect(actions).toContain('delete');
  expect(actions).toContain('manage');
  expect(subjects).toContain('*');
});

// Test 2: Technician view permissions
test('Technician should be able to view everything', () => {
  expect(canPerformAction('technician', 'view', 'workorder')).toBe(true);
  expect(canPerformAction('technician', 'view', 'asset')).toBe(true);
  expect(canPerformAction('technician', 'view', 'plan')).toBe(true);
  expect(canPerformAction('technician', 'view', 'user')).toBe(true);
});

// Test 3: Technician edit limitations
test('Technician should only edit work orders, inventory, and procedures', () => {
  expect(canPerformAction('technician', 'edit', 'workorder')).toBe(true);
  expect(canPerformAction('technician', 'edit', 'inventory')).toBe(true);
  expect(canPerformAction('technician', 'edit', 'procedure')).toBe(true);
  expect(canPerformAction('technician', 'edit', 'user')).toBe(false);
  expect(canPerformAction('technician', 'edit', 'asset')).toBe(false);
  expect(canPerformAction('technician', 'edit', 'plan')).toBe(false);
});

// Test 4: Technician create permissions
test('Technician should create work orders and solicitations', () => {
  expect(canPerformAction('technician', 'create', 'workorder')).toBe(true);
  expect(canPerformAction('technician', 'create', 'solicitation')).toBe(true);
  expect(canPerformAction('technician', 'create', 'user')).toBe(false);
  expect(canPerformAction('technician', 'create', 'asset')).toBe(false);
});

// Test 5: Technician delete restrictions
test('Technician should NOT be able to delete anything', () => {
  expect(canPerformAction('technician', 'delete', 'workorder')).toBe(false);
  expect(canPerformAction('technician', 'delete', 'asset')).toBe(false);
  expect(canPerformAction('technician', 'delete', 'user')).toBe(false);
  expect(canPerformAction('technician', 'delete', 'solicitation')).toBe(false);
});

// Test 6: Requester view permissions
test('Requester should be able to view everything', () => {
  expect(canPerformAction('requester', 'view', 'workorder')).toBe(true);
  expect(canPerformAction('requester', 'view', 'asset')).toBe(true);
  expect(canPerformAction('requester', 'view', 'plan')).toBe(true);
  expect(canPerformAction('requester', 'view', 'solicitation')).toBe(true);
});

// Test 7: Requester create/edit limitations
test('Requester should only create and edit solicitations', () => {
  expect(canPerformAction('requester', 'create', 'solicitation')).toBe(true);
  expect(canPerformAction('requester', 'edit', 'solicitation')).toBe(true);
  expect(canPerformAction('requester', 'create', 'workorder')).toBe(false);
  expect(canPerformAction('requester', 'edit', 'workorder')).toBe(false);
  expect(canPerformAction('requester', 'create', 'user')).toBe(false);
  expect(canPerformAction('requester', 'edit', 'asset')).toBe(false);
});

// Test 8: Requester delete restrictions
test('Requester should NOT be able to delete anything', () => {
  expect(canPerformAction('requester', 'delete', 'solicitation')).toBe(false);
  expect(canPerformAction('requester', 'delete', 'workorder')).toBe(false);
  expect(canPerformAction('requester', 'delete', 'asset')).toBe(false);
  expect(canPerformAction('requester', 'delete', 'user')).toBe(false);
});

// Test 9: Role hierarchy validation
test('Admin should have more permissions than technician', () => {
  expect(canPerformAction('admin', 'manage', 'workorder')).toBe(true);
  expect(canPerformAction('admin', 'delete', 'user')).toBe(true);
  expect(canPerformAction('technician', 'manage', 'workorder')).toBe(false);
  expect(canPerformAction('technician', 'delete', 'user')).toBe(false);
});

// Test 10: Technician convert permissions
test('Technician should be able to convert solicitations', () => {
  expect(canPerformAction('technician', 'convert', 'solicitation')).toBe(true);
  expect(canPerformAction('requester', 'convert', 'solicitation')).toBe(false);
  expect(canPerformAction('technician', 'convert', 'workorder')).toBe(false);
});

// Summary
console.log('\n' + '='.repeat(50));
const passed = testResults.filter(r => r.passed).length;
const total = testResults.length;

console.log(`📊 Test Results: ${passed}/${total} tests passed`);

if (passed === total) {
  console.log('🎉 All ACL permission tests passed!');
  console.log('✅ Permission system is working correctly');
} else {
  console.log('⚠️  Some tests failed. Please review the ACL configuration.');
  const failed = testResults.filter(r => !r.passed);
  failed.forEach(f => {
    console.log(`   ❌ ${f.description}: ${f.error}`);
  });
}

console.log('='.repeat(50));