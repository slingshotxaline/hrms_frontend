import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'
import { Copy, Check, RefreshCw } from 'lucide-react'

export default function CreateUserModal({ employee, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: `${employee.firstName} ${employee.lastName}`,
    email: '',
    password: generatePassword(),
    role: 'Employee',
  })
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function generatePassword() {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...formData, employeeId: employee._id })
  }

  const copyCredentials = () => {
    const credentials = `Email: ${formData.email}\nPassword: ${formData.password}`
    navigator.clipboard.writeText(credentials)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regeneratePassword = () => {
    setFormData({ ...formData, password: generatePassword() })
  }

  const roleOptions = [
    { value: 'Employee', label: 'Employee' },
    { value: 'HR', label: 'HR Manager' },
    { value: 'Admin', label: 'Administrator' },
  ]

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create User Account"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Employee:</strong> {employee.firstName} {employee.lastName}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Code:</strong> {employee.employeeCode}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Department:</strong> {employee.department}
          </p>
        </div>

        <Input
          label="Full Name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="employee@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-Generated Password
          </label>
          <div className="flex gap-2">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '🙈' : '👁️'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={regeneratePassword}
              title="Generate new password"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Select
          label="Role"
          options={roleOptions}
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            📋 Important - Share Credentials Securely
          </p>
          <div className="space-y-2">
            <div className="bg-white rounded p-3 text-sm font-mono">
              <p className="text-gray-700"><strong>Email:</strong> {formData.email || 'Not set'}</p>
              <p className="text-gray-700"><strong>Password:</strong> {formData.password}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={copyCredentials}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 inline" />
                  Credentials Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2 inline" />
                  Copy Credentials
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Account
          </Button>
        </div>
      </form>
    </Modal>
  )
}