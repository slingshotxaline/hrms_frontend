'use client'

import { useRouter } from 'next/navigation'
import { Edit, UserPlus, Eye, KeyRound, Power } from 'lucide-react'
import { apiCall } from '@/lib/api'

export default function EmployeeTable({ employees, onEdit, onCreateUser, onResetPassword, onRefresh }) {
  const router = useRouter()

  const handleToggleStatus = async (employee) => {
    const action = employee.isActive ? 'deactivate' : 'activate'
    
    if (!confirm(`Are you sure you want to ${action} ${employee.firstName} ${employee.lastName}?`)) {
      return
    }

    try {
      await apiCall(`/employees/${employee._id}/toggle-status`, {
        method: 'PUT',
      })
      
      alert(`Employee ${action}d successfully!`)
      onRefresh() // Refresh the employee list
    } catch (error) {
      console.error(`Error ${action}ing employee:`, error)
      alert(`Failed to ${action} employee: ${error.message}`)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Department</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Designation</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Salary</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr 
                key={employee._id} 
                className={`hover:bg-gray-50 transition-colors ${
                  !employee.isActive ? 'bg-gray-100 opacity-60' : ''
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-black">{employee.employeeCode}</td>
                <td className="px-6 py-4 text-sm text-black">
                  {employee.firstName} {employee.lastName}
                  {!employee.isActive && (
                    <span className="ml-2 text-xs text-red-600">(Inactive)</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-black">{employee.department}</td>
                <td className="px-6 py-4 text-sm text-black">{employee.designation}</td>
                <td className="px-6 py-4 text-sm text-black">৳{employee.basicSalary?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-col gap-1">
                    {/* Account Status */}
                    {employee.user ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 w-fit">
                        Has Account
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 w-fit">
                        No Account
                      </span>
                    )}
                    
                    {/* Active Status */}
                    {employee.isActive ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 w-fit">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 w-fit">
                        Inactive
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/dashboard/employees/${employee._id}`)} 
                      className="text-blue-600 hover:text-blue-800" 
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => onEdit(employee)} 
                      className="text-indigo-600 hover:text-indigo-800" 
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {!employee.user ? (
                      <button 
                        onClick={() => onCreateUser(employee)} 
                        className="text-green-600 hover:text-green-800" 
                        title="Create Account"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => onResetPassword(employee)} 
                        className="text-orange-600 hover:text-orange-800" 
                        title="Reset Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* ✅ Toggle Active/Inactive */}
                    <button 
                      onClick={() => handleToggleStatus(employee)} 
                      className={employee.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                      title={employee.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}