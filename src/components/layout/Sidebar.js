// 'use client'

// import { useState } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { Home, Users, Clock, Calendar, DollarSign, FileText, Menu, X, LogOut, ChevronRight,User,Shield } from 'lucide-react'
// import { useAuth } from '@/contexts/AuthContext'

// export default function Sidebar() {
//   const { user, logout } = useAuth()
//   const router = useRouter()
//   const pathname = usePathname()
//   const [isOpen, setIsOpen] = useState(true)

//   const navigation = [
//     { id: 'dashboard', name: 'Dashboard', icon: Home, path: '/dashboard' },
//     { id: 'employees', name: 'Employees', icon: Users, path: '/dashboard/employees', roles: ['Admin', 'HR'] },
//     { id: 'roles', name: 'Role Management', icon: Shield, path: '/dashboard/roles', roles: ['Admin', 'HR'] },
//     { id: 'attendance', name: 'Attendance', icon: Clock, path: '/dashboard/attendance', roles: ['Admin', 'HR'] },
//     { id: 'my-attendance', name: 'My Attendance', icon: Clock, path: '/dashboard/my-attendance', roles: ['Employee', 'Team Lead', 'Business Lead'] },
//     { id: 'leaves', name: 'Leave Management', icon: Calendar, path: '/dashboard/leaves' },
//     { id: 'payroll', name: 'Payroll', icon: DollarSign, path: '/dashboard/payroll', roles: ['Admin', 'HR'] },
//     { id: 'holidays', name: 'Holidays', icon: FileText, path: '/dashboard/holidays' },
//     { id: 'profile', name: 'My Profile', icon: User, path: '/dashboard/profile' },
//   ]

//   if (!user) {
//     return null
//   }

//   const filteredNav = navigation.filter(
//     item => !item.roles || item.roles.includes(user.role)
//   )

//   return (
//     <aside className={`${isOpen ? 'w-72' : 'w-20'} bg-black text-white transition-all duration-300 flex flex-col min-h-screen relative border-r border-slate-700/50 shadow-2xl`}>
//       {/* Decorative gradient overlay */}
//       <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
//       {/* Header */}
//       <div className="relative p-6 flex items-center justify-between border-b border-slate-700/50">
//         {isOpen && (
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
//               <span className="text-xl font-bold">HR</span>
//             </div>
//             <div>
//               <h1 className="text-xl font-bold bg-linear-to-br from-white to-gray-300 bg-clip-text text-transparent">HRMS Pro</h1>
//               <p className="text-xs text-slate-400">Management Suite</p>
//             </div>
//           </div>
//         )}
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="p-2 hover:bg-slate-700/50 rounded-xl transition-all hover:scale-110 active:scale-95"
//         >
//           {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <nav className="relative flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
//         {filteredNav.map((item) => {
//           const isActive = pathname === item.path
//           return (
//             <button
//               key={item.id}
//               onClick={() => router.push(item.path)}
//               className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
//                 isActive
//                   ? 'bg-linear-to-r from-slate-700/50 to-blue-200/50 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
//                   : 'hover:bg-slate-700/50 text-slate-300 hover:text-white hover:translate-x-1'
//               }`}
//             >
//               {/* Active indicator */}
//               {isActive && (
//                 <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent" />
//               )}
              
//               <item.icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${
//                 isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
//               }`} />
              
//               {isOpen && (
//                 <>
//                   <span className="font-medium relative z-10 flex-1 text-left">{item.name}</span>
//                   {isActive && (
//                     <ChevronRight className="w-4 h-4 relative z-10 animate-pulse" />
//                   )}
//                 </>
//               )}
              
//               {/* Hover glow effect */}
//               {!isActive && (
//                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-r from-indigo-500/10 to-transparent transition-opacity duration-300" />
//               )}
//             </button>
//           )
//         })}
//       </nav>

//       {/* User Profile Section */}
//       <div className="relative p-4 border-t border-slate-700/50 bg-slate-800/50">
//         <div className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-700/30 backdrop-blur-sm ${!isOpen && 'justify-center'}`}>
//           <div className="relative">
//             <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30">
//               {user.name?.charAt(0) || 'U'}
//             </div>
//             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-800" />
//           </div>
          
//           {isOpen && (
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold text-sm truncate">{user.name}</p>
//               <p className="text-xs text-indigo-400 font-medium">{user.role}</p>
//             </div>
//           )}
//         </div>
        
//         <button
//           onClick={logout}
//           className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-95"
//         >
//           <LogOut className="w-4 h-4" />
//           {isOpen && <span>Logout</span>}
//         </button>
//       </div>
//     </aside>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, Clock, Calendar, DollarSign, FileText, Menu, X, LogOut, User, Shield,AlertCircle } from 'lucide-react'

export default function Sidebar() {
  const { user, logout, refreshUserProfile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  // ✅ Refresh user profile on sidebar mount
  useEffect(() => {
    refreshUserProfile()
  }, [])

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'employees', name: 'Employees', icon: Users, path: '/dashboard/employees', roles: ['Admin', 'HR'] },
    { id: 'attendance', name: 'Attendance', icon: Clock, path: '/dashboard/attendance', roles: ['Admin', 'HR'] },
    { id: 'my-attendance', name: 'Attendance', icon: Clock, path: '/dashboard/attendance', roles: ['Employee', 'Team Lead', 'Business Lead'] },
    { id: 'leaves', name: 'Leave Management', icon: Calendar, path: '/dashboard/leaves' },
    { id: 'lates', name: 'Late Management', icon: AlertCircle, path: '/dashboard/lates' },
    { id: 'payroll', name: 'Payroll', icon: DollarSign, path: '/dashboard/payroll', roles: ['Admin', 'HR'] },
    { id: 'holidays', name: 'Holidays', icon: FileText, path: '/dashboard/holidays' },
    { id: 'roles', name: 'Role Management', icon: Shield, path: '/dashboard/roles', roles: ['Admin', 'HR', ] },
    { id: 'profile', name: 'My Profile', icon: User, path: '/dashboard/profile' },
  ]

  const filteredNav = navigation.filter(
    item => !item.roles || item.roles.includes(user.role)
  )

  // ✅ Badge colors for roles
  const roleColors = {
    'Admin': 'bg-red-100 text-red-800',
    'HR': 'bg-blue-100 text-blue-800',
    'Business Lead': 'bg-purple-100 text-purple-800',
    'Team Lead': 'bg-green-100 text-green-800',
    'Employee': 'bg-gray-100 text-black',
  }

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-20'} bg-black text-white transition-all duration-300 flex flex-col min-h-screen relative border-r border-slate-700/50 shadow-2xl`}>
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
                  ? 'bg-linear-to-r from-slate-700/50 to-blue-200/50 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                   : 'hover:bg-slate-700/50 text-slate-300 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="font-medium">{item.name}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4">
        <div className={`flex items-center gap-3 px-4 py-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold">
            {user.name.charAt(0)}
          </div>
          {isOpen && (
            <div className="flex-1">
              <p className="font-semibold">{user.name}</p>
              {/* ✅ Show role with color badge */}
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role] || 'bg-gray-100 text-black'}`}>
                {user.role}
              </span>
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