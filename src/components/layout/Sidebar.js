'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, Clock, Calendar, DollarSign, FileText, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'employees', name: 'Employees', icon: Users, path: '/dashboard/employees', roles: ['Admin', 'HR'] },
    { id: 'attendance', name: 'Attendance', icon: Clock, path: '/dashboard/attendance' },
    { id: 'leaves', name: 'Leave Management', icon: Calendar, path: '/dashboard/leaves' },
    { id: 'payroll', name: 'Payroll', icon: DollarSign, path: '/dashboard/payroll', roles: ['Admin', 'HR'] },
    { id: 'holidays', name: 'Holidays', icon: FileText, path: '/dashboard/holidays' },
  ]

  // Add guard clause for when user is not loaded
  if (!user) {
    return null // or a loading skeleton
  }

  const filteredNav = navigation.filter(
    item => !item.roles || item.roles.includes(user.role)
  )

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-all duration-300 flex flex-col min-h-screen`}>
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h1 className="text-2xl font-bold">HRMS</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {filteredNav.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-indigo-900 shadow-lg'
                  : 'hover:bg-indigo-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="font-medium">{item.name}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-indigo-700">
        <div className={`flex items-center gap-3 px-4 py-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
            {user.name?.charAt(0) || 'U'}
          </div>
          {isOpen && (
            <div className="flex-1">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-indigo-300">{user.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}