'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { UserData, CreateUserResult, BulkUserResult } from '@/lib/user-service'

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CreateUserResult | BulkUserResult | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [formData, setFormData] = useState<UserData>({
    email: '',
    full_name: '',
    password: '',
    ojt_hours_required: 0
  })
  const [bulkUsers, setBulkUsers] = useState<Omit<UserData, 'password'>[]>([])
  const [bulkInput, setBulkInput] = useState('')

  const handleSingleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_single',
          user: formData
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setFormData({ email: '', full_name: '', password: '', ojt_hours_required: 0 })
        setShowCreateModal(false)
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Parse bulk input
      const lines = bulkInput.trim().split('\n')
      const users: UserData[] = lines.map(line => {
        const [email, fullName, ojtHours] = line.split(',').map(s => s.trim())
        return {
          email,
          full_name: fullName,
          password: `tempPassword${Math.random().toString(36).slice(-8)}`,
          ojt_hours_required: parseFloat(ojtHours) || 0
        }
      }).filter(user => user.email && user.full_name)

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_bulk',
          users
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setBulkInput('')
        setShowBulkModal(false)
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!formData.email || !formData.full_name || !formData.password) {
      setResult({
        success: false,
        error: 'Please fill in all required fields'
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_admin',
          user: formData,
          isAdmin: true
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setFormData({ email: '', full_name: '', password: '', ojt_hours_required: 0 })
        setShowCreateModal(false)
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Create and manage user accounts for the DTR Tracker system</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowCreateModal(true)}>
            <CardHeader>
              <CardTitle className="text-lg">Create Single User</CardTitle>
              <CardDescription>Create a new user account one at a time</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create User</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowBulkModal(true)}>
            <CardHeader>
              <CardTitle className="text-lg">Bulk Create Users</CardTitle>
              <CardDescription>Create multiple users from CSV data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Bulk Create</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Create Admin User</CardTitle>
              <CardDescription className="text-blue-700">Create a system administrator</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => setShowCreateModal(true)}
              >
                Create Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        {result && (
          <Card className={`mb-6 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Success!' : 'Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-2">
                  <p className="text-green-700">{result.message || 'Operation completed successfully'}</p>
                  {'user_id' in result && (
                    <div className="text-sm text-green-600">
                      <p><strong>User ID:</strong> {result.user_id}</p>
                      <p><strong>Email:</strong> {result.email}</p>
                      <p><strong>Name:</strong> {result.full_name}</p>
                      <p><strong>OJT Hours Required:</strong> {result.ojt_hours_required}</p>
                      {'is_admin' in result && (
                        <p><strong>Admin Status:</strong> {result.is_admin ? 'Yes' : 'No'}</p>
                      )}
                    </div>
                  )}
                  {'success_count' in result && (
                    <div className="text-sm text-green-600">
                      <p><strong>Total Users:</strong> {result.total_users}</p>
                      <p><strong>Successful:</strong> {result.success_count}</p>
                      <p><strong>Failed:</strong> {result.error_count}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-700">{result.error}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Single User Creation:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Fill in user details including email, full name, password, and required OJT hours</li>
                <li>Click "Create User" to register the account</li>
                <li>User will receive confirmation email (if enabled)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bulk User Creation:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Format: email, full name, ojt_hours (one per line)</li>
                <li>Example: john@example.com, John Doe, 300.00</li>
                <li>Temporary passwords will be automatically generated</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin User Creation:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Use the admin button to create users with administrative privileges</li>
                <li>Admin users can manage other users and system settings</li>
                <li>Default OJT hours for admin users is 0</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Single User Creation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <form onSubmit={handleSingleUserSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="Min 6 characters"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OJT Hours Required</label>
            <Input
              type="number"
              step="0.01"
              value={formData.ojt_hours_required}
              onChange={(e) => setFormData({...formData, ojt_hours_required: parseFloat(e.target.value) || 0})}
              required
              placeholder="300.00"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCreateAdmin}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Admin'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk User Creation Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Create Users"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Data (CSV format)
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="email@example.com, John Doe, 300.00&#10;jane@example.com, Jane Smith, 250.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: email, full name, ojt_hours (one per line)
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating Users...' : 'Create Bulk Users'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
