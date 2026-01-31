'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Shield, AlertCircle } from 'lucide-react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Select from '@/components/common/Select'

export default function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1) // Step 1: User info, Step 2: Employee info
  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Admin',
    secretKey: '',
    
    // Employee data
    employeeCode: '',
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 50000,
    houseRent: 10000,
    medical: 5000,
    transport: 3000,
    shiftStart: '09:00',
    shiftEnd: '18:00',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNext = (e) => {
    e.preventDefault()
    setError('')

    // Validate step 1
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!formData.secretKey) {
      setError('Secret key is required')
      return
    }

    // Move to employee info
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
          employeeData: {
            firstName: formData.firstName || formData.name.split(' ')[0],
            lastName: formData.lastName || formData.name.split(' ')[1] || '',
            employeeCode: formData.employeeCode,
            department: formData.department || (formData.role === 'Admin' ? 'Administration' : 'Human Resources'),
            designation: formData.designation || (formData.role === 'Admin' ? 'System Administrator' : 'HR Manager'),
            joiningDate: formData.joiningDate,
            basicSalary: Number(formData.basicSalary),
            allowances: {
              houseRent: Number(formData.houseRent),
              medical: Number(formData.medical),
              transport: Number(formData.transport),
            },
            shiftStart: formData.shiftStart,
            shiftEnd: formData.shiftEnd,
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      alert('✅ Registration successful! Your employee profile has been created. You can now login.')
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
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 1 ? 'Admin Registration' : 'Employee Profile'}
            </h2>
            <p className="text-gray-600 mt-2">
              {step === 1 ? 'Step 1: Create your account' : 'Step 2: Complete your employee profile'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Restricted Access</p>
                <p className="text-xs text-amber-700 mt-1">
                  {step === 1 
                    ? 'This registration is only for Admin and HR roles. A valid secret key is required.'
                    : 'Creating your employee profile ensures you have access to all employee features including attendance, leaves, and payroll.'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: User Information */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
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
                  Contact system administrator for the secret key
                </p>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Next: Employee Profile →
              </Button>
            </form>
          )}

          {/* Step 2: Employee Information */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Employee Code"
                  type="text"
                  required
                  placeholder="EMP001"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                />

                <Input
                  label="First Name"
                  type="text"
                  value={formData.firstName || formData.name.split(' ')[0]}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />

                <Input
                  label="Last Name"
                  type="text"
                  value={formData.lastName || formData.name.split(' ')[1] || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />

                <Input
                  label="Department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder={formData.role === 'Admin' ? 'Administration' : 'Human Resources'}
                />

                <Input
                  label="Designation"
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder={formData.role === 'Admin' ? 'System Administrator' : 'HR Manager'}
                />

                <Input
                  label="Joining Date"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />

                <Input
                  label="Basic Salary"
                  type="number"
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                />

                <Input
                  label="House Rent Allowance"
                  type="number"
                  value={formData.houseRent}
                  onChange={(e) => setFormData({ ...formData, houseRent: e.target.value })}
                />

                <Input
                  label="Medical Allowance"
                  type="number"
                  value={formData.medical}
                  onChange={(e) => setFormData({ ...formData, medical: e.target.value })}
                />

                <Input
                  label="Transport Allowance"
                  type="number"
                  value={formData.transport}
                  onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                />

                <Input
                  label="Shift Start"
                  type="time"
                  value={formData.shiftStart}
                  onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                />

                <Input
                  label="Shift End"
                  type="time"
                  value={formData.shiftEnd}
                  onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}

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