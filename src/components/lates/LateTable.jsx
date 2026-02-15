import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import { Calendar, CheckCircle, XCircle, Clock, User, Trash2, AlertCircle } from 'lucide-react'

export default function LateTable({ lates, onApprove, onReject, onDelete, canApprove, currentUserId }) {
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

  const getDeductionBadge = (late) => {
    if (!late.isDeducted) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          Not Deducted
        </span>
      )
    }

    if (late.deductionType === 'Salary') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          ₹{Math.round(late.deductionAmount)} Deducted
        </span>
      )
    }

    if (late.deductionType === 'Leave') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          {late.deductionAmount} Leave Deducted
        </span>
      )
    }

    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Late Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Late Count</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Deduction</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Approver</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lates.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p>No late applications found</p>
                </td>
              </tr>
            ) : (
              lates.map((late) => {
                // Check if current user can approve this specific late
                const canApproveThis = canApprove && 
                  late.status === 'Pending' && 
                  late.approvers?.some(approver => approver._id === currentUserId)
                
                // Check if this is user's own late
                const isOwnLate = late.user?._id === currentUserId

                return (
                  <tr key={late._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {late.employee?.firstName} {late.employee?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{late.employee?.employeeCode}</p>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                          {late.user?.role}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-semibold">
                            {new Date(late.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {late.attendance && (
                            <p className="text-xs text-gray-500">
                              {new Date(late.attendance.inTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-lg font-bold text-red-600">
                          {late.lateMinutes} min
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 w-fit">
                          {late.monthlyLateCount}
                          {late.monthlyLateCount === 1 ? 'st' : late.monthlyLateCount === 2 ? 'nd' : late.monthlyLateCount === 3 ? 'rd' : 'th'} Late
                        </span>
                        {late.monthlyLateCount <= 2 && (
                          <span className="text-xs text-green-600 font-medium">
                            Grace Period
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs">
                        <p className="line-clamp-2">{late.reason}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(late.status)}
                      {late.status === 'Rejected' && late.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {late.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getDeductionBadge(late)}
                    </td>
                    {/* Approver Column */}
                    <td className="px-6 py-4 text-sm">
                      {late.status === 'Pending' ? (
                        <div className="text-xs text-gray-500">
                          <p className="font-medium text-gray-700 mb-1">Can be approved by:</p>
                          {late.approvers?.slice(0, 2).map((approver, idx) => (
                            <p key={idx} className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {approver.name} ({approver.role})
                            </p>
                          ))}
                          {late.approvers && late.approvers.length > 2 && (
                            <p className="text-indigo-600">+{late.approvers.length - 2} more</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            late.status === 'Approved' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <User className={`w-4 h-4 ${
                              late.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {late.approvedBy?.name}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              late.approvedByRole === 'Admin' ? 'bg-red-100 text-red-800' :
                              late.approvedByRole === 'HR' ? 'bg-blue-100 text-blue-800' :
                              late.approvedByRole === 'Business Lead' ? 'bg-purple-100 text-purple-800' :
                              late.approvedByRole === 'Team Lead' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {late.approvedByRole}
                            </span>
                            {late.approvedAt && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(late.approvedAt).toLocaleDateString('en-US', {
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
                    {/* Actions Column */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {/* Show approve/reject buttons if user can approve this late */}
                        {canApproveThis && (
                          <>
                            <Button
                              onClick={() => onApprove(late._id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => onReject(late._id)}
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {/* Show delete button if it's user's own pending late */}
                        {isOwnLate && late.status === 'Pending' && (
                          <Button
                            onClick={() => onDelete(late._id)}
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}

                        {/* Show nothing if user can't approve and it's not their late */}
                        {!canApproveThis && !isOwnLate && (
                          <span className="text-xs text-gray-400">No actions available</span>
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