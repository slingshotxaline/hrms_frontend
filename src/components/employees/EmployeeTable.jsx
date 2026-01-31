'use client'

import { useRouter } from 'next/navigation'
import { Edit, UserPlus, Eye, KeyRound } from 'lucide-react'

export default function EmployeeTable({ employees, onEdit, onCreateUser, onResetPassword }) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Designation</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Salary</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.employeeCode}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.firstName} {employee.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.department}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.designation}</td>
                <td className="px-6 py-4 text-sm text-gray-700">${employee.basicSalary?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  {employee.user ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">No Account</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/dashboard/employees/${employee._id}`)} className="text-blue-600 hover:text-blue-800" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(employee)} className="text-indigo-600 hover:text-indigo-800" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    {!employee.user ? (
                      <button onClick={() => onCreateUser(employee)} className="text-green-600 hover:text-green-800" title="Create Account">
                        <UserPlus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => onResetPassword(employee)} className="text-orange-600 hover:text-orange-800" title="Reset Password">
                        <KeyRound className="w-4 h-4" />
                      </button>
                    )}
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