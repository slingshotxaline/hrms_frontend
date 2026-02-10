import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { Lock, Copy, Check, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function ResetPasswordModal({ employee, onClose, onSubmit }) {
  const [newPassword, setNewPassword] = useState(generatePassword())
  const [useCustom, setUseCustom] = useState(false)
  const [customPassword, setCustomPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 14; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!confirmReset) return

    const password = useCustom ? customPassword : newPassword
    if (password.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    onSubmit({
      userId: employee.user,
      newPassword: password,
    })
  }

  const copyPassword = () => {
    const password = useCustom ? customPassword : newPassword
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Reset Password" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-black">{employee.firstName} {employee.lastName}</p>
              <p className="text-sm text-black">{employee.employeeCode} • {employee.department}</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Important Notice</p>
              <p className="text-xs text-amber-700 mt-1">
                Resetting the password will immediately change the employee&apos;s login credentials. 
                Make sure to share the new password securely with the employee.
              </p>
            </div>
          </div>
        </div>

        {/* Password Type Toggle */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setUseCustom(false)}
            className={`flex-1 p-4 rounded-lg border-2 text-center transition-colors ${
              !useCustom ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RefreshCw className={`w-5 h-5 mx-auto mb-2 ${!useCustom ? 'text-indigo-600' : 'text-black'}`} />
            <p className={`text-sm font-semibold ${!useCustom ? 'text-indigo-700' : 'text-black'}`}>Auto Generate</p>
            <p className="text-xs text-black mt-0.5">Strong random password</p>
          </button>
          <button
            type="button"
            onClick={() => setUseCustom(true)}
            className={`flex-1 p-4 rounded-lg border-2 text-center transition-colors ${
              useCustom ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Lock className={`w-5 h-5 mx-auto mb-2 ${useCustom ? 'text-indigo-600' : 'text-black'}`} />
            <p className={`text-sm font-semibold ${useCustom ? 'text-indigo-700' : 'text-black'}`}>Custom Password</p>
            <p className="text-xs text-black mt-0.5">Set your own password</p>
          </button>
        </div>

        {/* Password Display / Input */}
        {!useCustom ? (
          <div>
            <label className="block text-sm font-medium text-black mb-2">Generated Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  readOnly
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button type="button" variant="outline" onClick={() => setNewPassword(generatePassword())} title="Regenerate">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button type="button" variant="outline" onClick={copyPassword} title="Copy">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-black mb-2">Custom Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="confirmReset"
            checked={confirmReset}
            onChange={(e) => setConfirmReset(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-indigo-600"
          />
          <label htmlFor="confirmReset" className="text-sm text-black">
            I understand that this will change the password for <strong>{employee.firstName} {employee.lastName}</strong> and the employee will need the new password to log in.
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={!confirmReset}>
            <Lock className="w-4 h-4 mr-2 inline" />
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  )
}