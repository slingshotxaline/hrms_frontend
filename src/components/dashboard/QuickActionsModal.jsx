'use client'

import { X, Clock, Calendar, FileText, DollarSign, Users, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function QuickActionsModal({ isOpen, onClose, selectedDate, userRole }) {
  const router = useRouter()

  if (!isOpen) return null

  const date = new Date(selectedDate)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isAdmin = userRole === 'Admin'
  const isHR = userRole === 'HR'
  const isLeader = ['Business Lead', 'Team Lead'].includes(userRole)

  const quickActions = [
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      description: 'Punch IN/OUT for today',
      icon: Clock,
      color: 'bg-blue-500',
      action: () => {
        onClose()
        router.push('/dashboard/my-attendance')
      },
      show: true
    },
    {
      id: 'apply-leave',
      title: 'Apply Leave',
      description: 'Request time off',
      icon: Calendar,
      color: 'bg-green-500',
      action: () => {
        onClose()
        router.push('/dashboard/leaves')
      },
      show: true
    },
    {
      id: 'view-attendance',
      title: 'View Attendance',
      description: 'Check attendance records',
      icon: FileText,
      color: 'bg-indigo-500',
      action: () => {
        onClose()
        router.push('/dashboard/attendance')
      },
      show: isAdmin || isHR || isLeader
    },
    {
      id: 'view-employees',
      title: 'View Employees',
      description: 'Manage employee records',
      icon: Users,
      color: 'bg-purple-500',
      action: () => {
        onClose()
        router.push('/dashboard/employees')
      },
      show: isAdmin || isHR
    },
    {
      id: 'view-payroll',
      title: 'View Payroll',
      description: 'Check salary details',
      icon: DollarSign,
      color: 'bg-emerald-500',
      action: () => {
        onClose()
        router.push('/dashboard/payroll')
      },
      show: isAdmin || isHR
    },
    {
      id: 'manage-holidays',
      title: 'Manage Holidays',
      description: 'Add or view holidays',
      icon: Sun,
      color: 'bg-orange-500',
      action: () => {
        onClose()
        router.push('/dashboard/holidays')
      },
      show: isAdmin || isHR
    },
  ].filter(action => action.show)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Quick Actions</h2>
                <p className="text-indigo-100 mt-1">{formattedDate}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Actions Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                />
              ))}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ action }) {
  const Icon = action.icon

  return (
    <button
      onClick={action.action}
      className="group relative bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg hover:scale-105"
    >
      {/* Icon */}
      <div className={`${action.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <div className="text-left">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
          {action.title}
        </h3>
        <p className="text-sm text-gray-600">
          {action.description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}