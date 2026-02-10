import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import { Calendar, CheckCircle, XCircle, Clock, User, Trash2 } from 'lucide-react'

export default function LeaveTable({ leaves, onApprove, onReject, onDelete, canApprove, currentUserId }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      Approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      Rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    }
    
    const config = statusConfig[status] || statusConfig.Pending
    const Icon = config.icon
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Leave Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Days</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Approver</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-black">
                  <Calendar className="w-16 h-16 text-black mx-auto mb-3" />
                  <p>No leave requests found</p>
                </td>
              </tr>
            ) : (
              leaves.map((leave) => {
                // ✅ Check if current user can approve this specific leave
                const canApproveThis = canApprove && 
                  leave.status === 'Pending' && 
                  leave.approvers?.some(approver => approver._id === currentUserId)
                
                // Check if this is user's own leave
                const isOwnLeave = leave.user?._id === currentUserId

                console.log(`Leave ${leave._id}:`, {
                  canApprove,
                  isPending: leave.status === 'Pending',
                  approvers: leave.approvers?.map(a => a.name),
                  currentUserId,
                  canApproveThis,
                  isOwnLeave
                })

                return (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-black">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </p>
                        <p className="text-xs text-black">{leave.employee?.employeeCode}</p>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                          {leave.user?.role}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-black" />
                        <div>
                          <p className="font-semibold">
                            {new Date(leave.startDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-black">to</p>
                          <p className="font-semibold">
                            {new Date(leave.endDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-lg font-bold text-indigo-600">
                        {leave.totalDays}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      <div className="max-w-xs">
                        <p className="line-clamp-2">{leave.reason}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(leave.status)}
                      {leave.status === 'Rejected' && leave.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {leave.rejectionReason}
                        </p>
                      )}
                    </td>
                    {/* ✅ Approver Column */}
                    <td className="px-6 py-4 text-sm">
                      {leave.status === 'Pending' ? (
                        <div className="text-xs text-black">
                          <p className="font-medium text-black mb-1">Can be approved by:</p>
                          {leave.approvers?.slice(0, 3).map((approver, idx) => (
                            <p key={idx} className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {approver.name} ({approver.role})
                            </p>
                          ))}
                          {leave.approvers && leave.approvers.length > 3 && (
                            <p className="text-indigo-600">+{leave.approvers.length - 3} more</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            leave.status === 'Approved' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <User className={`w-4 h-4 ${
                              leave.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-black">
                              {leave.approvedBy?.name}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              leave.approvedByRole === 'Admin' ? 'bg-red-100 text-red-800' :
                              leave.approvedByRole === 'HR' ? 'bg-blue-100 text-blue-800' :
                              leave.approvedByRole === 'Business Lead' ? 'bg-purple-100 text-purple-800' :
                              leave.approvedByRole === 'Team Lead' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-black'
                            }`}>
                              {leave.approvedByRole}
                            </span>
                            {leave.approvedAt && (
                              <p className="text-xs text-black mt-0.5">
                                {new Date(leave.approvedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    {/* ✅ Actions Column */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {/* ✅ Show approve/reject buttons if user can approve this leave */}
                        {canApproveThis && (
                          <>
                            <Button
                              onClick={() => onApprove(leave._id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => onReject(leave._id)}
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {/* ✅ Show delete button if it's user's own pending leave */}
                        {isOwnLeave && leave.status === 'Pending' && (
                          <Button
                            onClick={() => onDelete(leave._id)}
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-black hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}

                        {/* Show nothing if user can't approve and it's not their leave */}
                        {!canApproveThis && !isOwnLeave && (
                          <span className="text-xs text-black">No actions available</span>
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