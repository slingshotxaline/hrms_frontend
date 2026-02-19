import Button from '@/components/common/Button'
import { Check, X, Trash2, Clock, Calendar } from 'lucide-react'

export default function LeaveTable({ leaves, onApprove, onReject, onDelete, canApprove, currentUserId }) {
  const getStatusBadge = (status) => {
    const config = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      Approved: { color: 'bg-green-100 text-green-800', icon: '✓' },
      Rejected: { color: 'bg-red-100 text-red-800', icon: '✗' },
    }
    
    const { color, icon } = config[status] || config.Pending
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color} flex items-center gap-1 w-fit`}>
        <span>{icon}</span>
        {status}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Leave Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dates</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No leave applications found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => {
                const isOwnLeave = leave.user?._id === currentUserId
                const canApproveThis = canApprove && 
                  leave.status === 'Pending' && 
                  !isOwnLeave &&
                  leave.approvers?.some(approver => approver._id === currentUserId)

                return (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{leave.employee?.employeeCode}</p>
                        <p className="text-xs text-indigo-600">{leave.user?.role}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {/* ✅ Show icon for half day */}
                      <div className="flex items-center gap-2">
                        {leave.isHalfDay && (
                          <Clock className="w-4 h-4 text-orange-500" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          leave.leaveType === 'Casual Leave' ? 'bg-blue-100 text-blue-800' :
                          leave.leaveType === 'Sick Leave' ? 'bg-red-100 text-red-800' :
                          leave.leaveType === 'Annual Leave' ? 'bg-green-100 text-green-800' :
                          leave.leaveType === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {leave.leaveType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {leave.isHalfDay ? (
                        <div>
                          <p className="font-medium">
                            {new Date(leave.halfDayDate || leave.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-orange-600">Half Day</p>
                        </div>
                      ) : (
                        <div>
                          <p>
                            {new Date(leave.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">to</p>
                          <p>
                            {new Date(leave.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-semibold text-gray-900">
                        {leave.isHalfDay ? '0.5' : leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <p className="truncate" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-2">
                        {getStatusBadge(leave.status)}
                        {leave.status === 'Approved' && leave.approvedBy && (
                          <p className="text-xs text-gray-500">
                            by {leave.approvedBy.name} ({leave.approvedByRole})
                          </p>
                        )}
                        {leave.status === 'Rejected' && leave.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Reason: {leave.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {canApproveThis && (
                          <>
                            <Button
                              onClick={() => onApprove(leave._id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => onReject(leave._id)}
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {isOwnLeave && leave.status === 'Pending' && (
                          <Button
                            onClick={() => onDelete(leave._id)}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
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