'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import { Users, Shield, AlertCircle } from 'lucide-react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Select from '@/components/common/Select'

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Admin',
    secretKey: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    // Don't validate secret key on frontend - let backend handle it
    if (!formData.secretKey || formData.secretKey.trim() === '') {
      setError('Secret key is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          secretKey: formData.secretKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      alert('Registration successful! You can now login.')
      router.push('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'HR', label: 'HR Manager' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Registration</h2>
            <p className="text-gray-600 mt-2">Create your administrator account</p>
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Restricted Access</p>
                <p className="text-xs text-amber-700 mt-1">
                  This registration is only for Admin and HR roles. A valid secret key is required.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="admin@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />

            <div>
              <Input
                label="Secret Key"
                type="password"
                required
                placeholder="Enter your secret registration key"
                value={formData.secretKey}
                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'Admin' ? 'Admin Secret Key: 1234567899' : 'HR Secret Key: 22221111'}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm space-y-2">
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600">Already have an account?</p>
              <button
                onClick={() => router.push('/login')}
                className="text-indigo-600 hover:text-indigo-800 font-medium mt-1"
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Employee Registration
          </h3>
          <p className="text-sm text-gray-600">
            Regular employees cannot register directly. Admin or HR must create employee accounts 
            from the Employee Management section and provide login credentials.
          </p>
        </div>
      </div>
    </div>
  )
}