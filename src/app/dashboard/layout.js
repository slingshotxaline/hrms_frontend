import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HRMS - Human Resource Management System',
  description: 'Complete HR Management Solution',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


// 'use client';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { LayoutDashboard, Users, Calendar, DollarSign, LogOut } from 'lucide-react';

// export default function DashboardLayout({ children }) {
//   const router = useRouter();

//   const handleLogout = () => {
//     Cookies.remove('token');
//     Cookies.remove('userInfo');
//     router.push('/login');
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white shadow-md">
//         <div className="p-6 border-b">
//           <h1 className="text-2xl font-bold text-blue-600">HRMS</h1>
//         </div>
//         <nav className="p-4 space-y-2">
//           <Link href="/dashboard" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
//             <LayoutDashboard size={20} />
//             <span>Dashboard</span>
//           </Link>
//           <Link href="/dashboard/employees" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
//             <Users size={20} />
//             <span>Employees</span>
//           </Link>
//           <Link href="/dashboard/attendance" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
//             <Calendar size={20} />
//             <span>Attendance</span>
//           </Link>
//           <Link href="/dashboard/payroll" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
//             <DollarSign size={20} />
//             <span>Payroll</span>
//           </Link>
//         </nav>
//         <div className="absolute bottom-0 w-64 p-4 border-t">
//           <button
//             onClick={handleLogout}
//             className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
//           >
//             <LogOut size={20} />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 overflow-y-auto p-8">
//         {children}
//       </main>
//     </div>
//   );
// }
