'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import { 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  RefreshCw,
  History
} from 'lucide-react'

export default function PayrollDetailsModal({ payroll: initialPayroll, onClose }) {
  const [payroll, setPayroll] = useState(initialPayroll)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    // Fetch full payroll details with history
    fetchFullDetails()
  }, [initialPayroll._id])

  const fetchFullDetails = async () => {
    setLoading(true)
    try {
      const data = await apiCall(`/payroll/${initialPayroll._id}`)
      setPayroll(data)
    } catch (error) {
      console.error('Error fetching payroll details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Payroll Details" size="xl">
        <Loading />
      </Modal>
    )
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Payroll Details" size="xl">
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {payroll.employee?.firstName} {payroll.employee?.lastName}
              </h3>
              <p className="text-indigo-100">
                {payroll.employee?.employeeCode} • {payroll.employee?.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(payroll.month).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
            {payroll.isRegenerated && (
              <>
                <span className="mx-2">•</span>
                <RefreshCw className="w-4 h-4" />
                <span>Version {payroll.version}</span>
              </>
            )}
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Earnings
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Basic Salary</span>
                <span className="font-semibold text-gray-900">
                  ৳{payroll.basicSalary?.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-green-200 pt-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">Allowances:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">House Rent</span>
                    <span>৳{payroll.allowances?.houseRent?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medical</span>
                    <span>৳{payroll.allowances?.medical?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport</span>
                    <span>৳{payroll.allowances?.transport?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
              {payroll.overtime?.amount > 0 && (
                <div className="border-t border-green-200 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Overtime ({payroll.overtime.hours}h)
                    </span>
                    <span className="text-green-600 font-semibold">
                      +৳{payroll.overtime.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <div className="border-t-2 border-green-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Gross Salary</span>
                  <span className="font-bold text-green-600 text-lg">
                    ৳{payroll.grossSalary?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
            <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Deductions
            </h4>
            <div className="space-y-3">
              {payroll.deductions?.absent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    Absent ({payroll.attendance?.absent} days)
                  </span>
                  <span className="text-red-600">
                    -৳{payroll.deductions.absent.toLocaleString()}
                  </span>
                </div>
              )}
              {payroll.deductions?.halfDay > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    Half Day ({payroll.attendance?.halfDay} days)
                  </span>
                  <span className="text-red-600">
                    -৳{payroll.deductions.halfDay.toLocaleString()}
                  </span>
                </div>
              )}
              {payroll.deductions?.late > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    Late ({payroll.attendance?.late} days)
                  </span>
                  <span className="text-red-600">
                    -৳{payroll.deductions.late.toLocaleString()}
                  </span>
                </div>
              )}
              {payroll.deductions?.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Tax</span>
                  <span className="text-red-600">
                    -৳{payroll.deductions.tax.toLocaleString()}
                  </span>
                </div>
              )}
              {payroll.totalDeductions === 0 && (
                <p className="text-sm text-gray-500 italic">No deductions</p>
              )}
              <div className="border-t-2 border-red-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total Deductions</span>
                  <span className="font-bold text-red-600 text-lg">
                    -৳{payroll.totalDeductions?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Net Salary</p>
              <p className="text-4xl font-bold">
                ৳{payroll.netSalary?.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-16 h-16 opacity-50" />
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Attendance Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {payroll.attendance?.present || 0}
              </p>
              <p className="text-xs text-gray-600">Present</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {payroll.attendance?.absent || 0}
              </p>
              <p className="text-xs text-gray-600">Absent</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {payroll.attendance?.leave || 0}
              </p>
              <p className="text-xs text-gray-600">Leave</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {payroll.attendance?.late || 0}
              </p>
              <p className="text-xs text-gray-600">Late</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {payroll.attendance?.halfDay || 0}
              </p>
              <p className="text-xs text-gray-600">Half Day</p>
            </div>
          </div>
          {payroll.attendance?.lateApproved > 0 && (
            <p className="text-sm text-green-600 mt-3">
              ✓ {payroll.attendance.lateApproved} late(s) approved (no deduction)
            </p>
          )}
        </div>

        {/* ✅ Regeneration History */}
        {payroll.isRegenerated && payroll.regenerationHistory?.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Regeneration History ({payroll.regenerationHistory.length})
              </h4>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3">
                {payroll.regenerationHistory.map((history, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-lg p-4 border border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Regenerated by {history.regeneratedBy?.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(history.regeneratedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-semibold">
                        v{payroll.regenerationHistory.length - index}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Reason:</strong> {history.reason}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Previous Net Salary:</span>
                        <span className="ml-2 font-semibold text-red-600">
                          ৳{history.previousNetSalary?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">New Net Salary:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          ৳{history.newNetSalary?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {history.newNetSalary !== history.previousNetSalary && (
                      <div className="mt-2 pt-2 border-t border-orange-100">
                        <p className={`text-sm font-semibold ${
                          history.newNetSalary > history.previousNetSalary 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {history.newNetSalary > history.previousNetSalary ? '↑' : '↓'}
                          {' '}
                          ৳{Math.abs(history.newNetSalary - history.previousNetSalary).toLocaleString()}
                          {' '}
                          {history.newNetSalary > history.previousNetSalary ? 'increase' : 'decrease'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              payroll.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              payroll.status === 'Approved' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {payroll.status}
            </span>
          </div>
          {payroll.paidAt && (
            <div className="text-sm text-gray-600">
              Paid on: {new Date(payroll.paidAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}