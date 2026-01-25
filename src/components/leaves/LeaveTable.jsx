import Badge from '@/components/common/Badge'
import { Check, XCircle } from 'lucide-react'

export default function LeaveTable({ leaves, onUpdateStatus, userRole }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              {(userRole === 'Admin' || userRole === 'HR') && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {leave.employee?.firstName} {leave.employee?.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{leave.leaveType}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(leave.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(leave.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{leave.reason}</td>
                <td className="px-6 py-4 text-sm">
                  <Badge status={leave.status} />
                </td>
                {(userRole === 'Admin' || userRole === 'HR') && leave.status === 'Pending' && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateStatus(leave._id, 'Approved')}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(leave._id, 'Rejected')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}