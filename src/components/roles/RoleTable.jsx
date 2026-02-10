import { Crown, Users, Briefcase, UserCheck, Edit, UserPlus, XCircle } from 'lucide-react'
import Button from '@/components/common/Button'

export default function RoleTable({ users, onRoleChange, onAssignManager, onRemoveManager, isAdmin }) {
  const roleIcons = {
    'Admin': Crown,
    'HR': Users,
    'Business Lead': Briefcase,
    'Team Lead': UserCheck,
    'Employee': Users,
  }

  const roleColors = {
    'Admin': 'bg-red-100 text-red-800',
    'HR': 'bg-blue-100 text-blue-800',
    'Business Lead': 'bg-purple-100 text-purple-800',
    'Team Lead': 'bg-green-100 text-green-800',
    'Employee': 'bg-gray-100 text-black',
  }

  const roles = ['Admin', 'HR', 'Business Lead', 'Team Lead', 'Employee']

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">User</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Email</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Current Role</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Reports To</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Team Size</th>
            {isAdmin && (
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(user => {
            const RoleIcon = roleIcons[user.role] || Users

            return (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-black">{user.name}</p>
                      {user.employeeId && (
                        <p className="text-xs text-black">{user.employeeId.employeeCode}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-black">{user.email}</td>
                <td className="px-6 py-4">
                  {isAdmin ? (
                    <select
                      value={user.role}
                      onChange={(e) => onRoleChange(user._id, e.target.value)}
                      className="px-3 py-1 rounded-full text-xs font-semibold border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RoleIcon className="w-4 h-4" />
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.reportsTo ? (
                    <div className="flex items-center gap-2">
                      <span className="text-black">{user.reportsTo.name}</span>
                      <span className="text-xs text-black">({user.reportsTo.role})</span>
                    </div>
                  ) : (
                    <span className="text-black">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="font-semibold text-indigo-600">
                    {user.manages?.length || 0}
                  </span>
                  <span className="text-black ml-1">members</span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAssignManager(user)}
                        className="text-green-600 hover:text-green-800"
                        title="Assign Manager"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      {user.reportsTo && (
                        <button
                          onClick={() => onRemoveManager(user._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove Manager"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}