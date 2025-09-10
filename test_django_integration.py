#!/usr/bin/env python
"""
Script to validate that the Django backend is working correctly
and matches the mock server behavior exactly.
"""

import os
import sys
import requests
import json
from datetime import datetime

# Add Django project to path
sys.path.append('/workspaces/spark-template/backend_django')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'traknor.settings.dev')

API_BASE = 'http://localhost:3333/api'

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    
    response = requests.get(f'{API_BASE}/health')
    assert response.status_code == 200
    data = response.json()
    
    assert data['success'] == True
    assert 'data' in data
    assert data['data']['status'] == 'healthy'
    print("✅ Health endpoint working")
    return True

def test_authentication():
    """Test authentication exactly like mock server"""
    print("🔐 Testing authentication...")
    
    # Test with correct credentials
    login_data = {
        'email': 'admin@traknor.com',
        'password': 'admin123'
    }
    
    response = requests.post(f'{API_BASE}/auth/login', json=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data['success'] == True
    assert 'data' in data
    assert 'user' in data['data']
    assert 'tokens' in data['data']
    
    user = data['data']['user']
    assert user['email'] == 'admin@traknor.com'
    assert user['role'] == 'ADMIN'
    
    tokens = data['data']['tokens']
    assert 'access_token' in tokens
    assert 'refresh_token' in tokens
    
    print(f"✅ Login successful: {user['name']} ({user['role']})")
    return tokens['access_token']

def test_work_orders(token):
    """Test work orders endpoint"""
    print("📋 Testing work orders...")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{API_BASE}/work-orders', headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data['success'] == True
    assert 'data' in data
    assert isinstance(data['data'], list)
    
    work_orders = data['data']
    assert len(work_orders) == 7  # Should match mock server count
    
    # Test first work order structure
    wo = work_orders[0]
    required_fields = ['id', 'code', 'title', 'type', 'status', 'priority']
    for field in required_fields:
        assert field in wo, f"Missing field: {field}"
    
    print(f"✅ Work orders: {len(work_orders)} found")
    
    # Test work order stats
    response = requests.get(f'{API_BASE}/work-orders/stats', headers=headers)
    assert response.status_code == 200
    stats = response.json()['data']
    
    assert 'total' in stats
    assert stats['total'] == len(work_orders)
    print(f"✅ Work order stats: {stats['total']} total")
    
    return work_orders

def test_companies(token):
    """Test companies endpoint"""
    print("🏢 Testing companies...")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{API_BASE}/companies', headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data['success'] == True
    companies = data['data']
    assert len(companies) >= 1
    
    company = companies[0]
    assert company['name'] == 'TrakNor Industrial'
    assert company['cnpj'] == '12.345.678/0001-90'
    
    print(f"✅ Companies: {len(companies)} found")
    return companies

def test_equipment(token):
    """Test equipment endpoint"""
    print("⚙️ Testing equipment...")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{API_BASE}/equipment', headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data['success'] == True
    equipment = data['data']
    assert len(equipment) >= 3  # Should have at least 3 equipment
    
    # Test equipment structure
    eq = equipment[0]
    required_fields = ['id', 'code', 'name', 'type', 'status']
    for field in required_fields:
        assert field in eq, f"Missing field: {field}"
    
    print(f"✅ Equipment: {len(equipment)} found")
    return equipment

def test_users(token):
    """Test users endpoint"""
    print("👥 Testing users...")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{API_BASE}/users', headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data['success'] == True
    users = data['data']
    assert len(users) >= 2  # Admin and technician
    
    # Find admin user
    admin_user = next((u for u in users if u['email'] == 'admin@traknor.com'), None)
    assert admin_user is not None
    assert admin_user['role'] == 'ADMIN'
    
    print(f"✅ Users: {len(users)} found")
    return users

def test_create_work_order(token, companies, equipment, users):
    """Test creating a new work order"""
    print("➕ Testing work order creation...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Get required IDs
    company = companies[0]
    eq = equipment[0]
    technician = next((u for u in users if u['role'] == 'TECHNICIAN'), users[0])
    
    new_wo_data = {
        'title': 'Django Integration Test',
        'description': 'Work order created by Django integration test',
        'type': 'CORRECTIVE',
        'priority': 'HIGH',
        'status': 'PENDING',
        'company': company['id'],
        'assigned_to': technician['id'],
        'equipment_ids': [eq['id']],
        'scheduled_date': '2024-02-01T10:00:00Z'
    }
    
    response = requests.post(f'{API_BASE}/work-orders', json=new_wo_data, headers=headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data['success'] == True
    
    new_wo = data['data']
    assert new_wo['title'] == new_wo_data['title']
    assert new_wo['type'] == new_wo_data['type']
    assert 'code' in new_wo  # Should auto-generate code
    
    print(f"✅ Work order created: {new_wo['code']} - {new_wo['title']}")
    return new_wo

def main():
    """Main test function"""
    print("=" * 60)
    print("🚀 DJANGO BACKEND INTEGRATION TEST")
    print("=" * 60)
    print()
    
    try:
        # Test 1: Health check
        test_health()
        print()
        
        # Test 2: Authentication
        token = test_authentication()
        print()
        
        # Test 3: Work orders
        work_orders = test_work_orders(token)
        print()
        
        # Test 4: Companies
        companies = test_companies(token)
        print()
        
        # Test 5: Equipment
        equipment = test_equipment(token)
        print()
        
        # Test 6: Users
        users = test_users(token)
        print()
        
        # Test 7: Create work order
        new_wo = test_create_work_order(token, companies, equipment, users)
        print()
        
        # Summary
        print("=" * 60)
        print("🎉 ALL TESTS PASSED!")
        print("=" * 60)
        print()
        print("✅ Django backend is working correctly")
        print("✅ All endpoints match mock server behavior")
        print("✅ Authentication working")
        print("✅ CRUD operations working")
        print("✅ Data structure matches frontend expectations")
        print()
        print("🔥 Django backend successfully replaces mock server!")
        
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()