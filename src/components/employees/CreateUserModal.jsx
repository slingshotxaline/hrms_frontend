'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { User, Mail, Lock, Shield } from 'lucide-react'

export default function CreateUserModal({ isOpen, onClose, employee, onSuccess }) {
  const [formData, setFormData] = useState({
    name: `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim(),
    email: employee?.email || '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const roles = ['Employee', 'Team Lead', 'Business Lead', 'HR', 'Admin']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log('👤 Creating user account for employee:', employee._id)

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        employeeId: employee._id,
      }

      await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      console.log('✅ User account created successfully')
      alert('User account created successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('❌ Error creating user account:', error)
      alert(error.message || 'Failed to create user account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create User Account"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Employee Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Code:</span>
              <span className="ml-2 font-semibold">{employee?.employeeCode}</span>
            </div>
            <div>
              <span className="text-gray-600">Department:</span>
              <span className="ml-2 font-semibold">{employee?.department}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Designation:</span>
              <span className="ml-2 font-semibold">{employee?.designation}</span>
            </div>
          </div>
        </div>

        {/* User Account Details */}
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="John Doe"
            required
            icon={User}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="john.doe@company.com"
            required
            icon={Mail}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
            icon={Lock}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
            icon={Lock}
          />
        </div>

        {/* Info Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Important:</p>
              <p>The user will be able to login with this email and password. Make sure to share the credentials securely.</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create User Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}