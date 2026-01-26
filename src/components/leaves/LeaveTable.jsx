import Badge from '@/components/common/Badge'
import { Check, XCircle } from 'lucide-react'

export default function LeaveTable({ leaves, onUpdateStatus, userRole, showEmployeeColumn = false }) {
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {showEmployeeColumn && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Days</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              {(userRole === 'Admin' || userRole === 'HR') && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.length === 0 ? (
              <tr>
                <td 
                  colSpan={showEmployeeColumn ? 8 : 7} 
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No leave requests found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => {
                const days = calculateDays(leave.startDate, leave.endDate)
                
                return (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                    {showEmployeeColumn && (
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                        <br />
                        <span className="text-xs text-gray-500">{leave.employee?.employeeCode}</span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        leave.leaveType === 'CL' ? 'bg-blue-100 text-blue-800' :
                        leave.leaveType === 'SL' ? 'bg-green-100 text-green-800' :
                        leave.leaveType === 'EL' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {leave.leaveType === 'CL' ? 'Casual' :
                         leave.leaveType === 'SL' ? 'Sick' :
                         leave.leaveType === 'EL' ? 'Earned' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {days} {days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <div className="line-clamp-2">{leave.reason}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge status={leave.status} />
                    </td>
                    {(userRole === 'Admin' || userRole === 'HR') && leave.status === 'Pending' && (
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateStatus(leave._id, 'Approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(leave._id, 'Rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    )}
                    {(userRole === 'Admin' || userRole === 'HR') && leave.status !== 'Pending' && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        -
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}