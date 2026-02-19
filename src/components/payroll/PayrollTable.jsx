import { useState } from 'react'
import Button from '@/components/common/Button'
import { Eye, RefreshCw, AlertCircle, DollarSign, Info, Clock } from 'lucide-react'

export default function PayrollTable({ payrolls, onViewDetails, onRegenerate, onAddAdjustment, canManage }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      Approved: { color: 'bg-green-100 text-green-800', icon: '✓' },
      Paid: { color: 'bg-purple-100 text-purple-800', icon: '💰' },
    }
    
    const config = statusConfig[status] || statusConfig.Pending
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color} flex items-center gap-1 w-fit`}>
        <span>{config.icon}</span>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Month</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Basic Salary</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Deductions</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                <div className="flex items-center justify-end gap-1">
                  <span>Overtime</span>
                  <Info className="w-3 h-3 text-gray-400" title="Info only - not added to salary" />
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Adjustments</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Net Salary</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Version</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mb-3" />
                    <p>No payroll records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              payrolls.map((payroll) => (
                <tr 
                  key={payroll._id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    payroll.isRegenerated ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {payroll.employee?.firstName} {payroll.employee?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{payroll.employee?.employeeCode}</p>
                      <p className="text-xs text-indigo-600">{payroll.employee?.department}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(payroll.month).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    ৳{payroll.basicSalary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="space-y-1">
                      <p className="font-semibold text-red-600">
                        ৳{payroll.totalDeductions?.toLocaleString()}
                      </p>
                      <div className="text-xs text-gray-500">
                        {payroll.deductions?.absent > 0 && (
                          <p>Absent: ৳{payroll.deductions.absent.toLocaleString()}</p>
                        )}
                        {payroll.deductions?.halfDay > 0 && (
                          <p>Half Day: ৳{payroll.deductions.halfDay.toLocaleString()}</p>
                        )}
                        {payroll.deductions?.late > 0 && (
                          <p>Late: ৳{payroll.deductions.late.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* ✅ Overtime (INFO ONLY) */}
                  <td className="px-6 py-4 text-sm text-right">
                    {payroll.overtime?.amount > 0 ? (
                      <div className="relative group">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <p className="font-semibold text-blue-600">
                            {payroll.overtime.hours}h
                          </p>
                        </div>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                            <p>Overtime: {payroll.overtime.hours}h</p>
                            <p className="text-gray-300">ℹ️ Info only - not added to salary</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  {/* ✅ Adjustments */}
                  <td className="px-6 py-4 text-sm text-right">
                    {payroll.adjustments && payroll.adjustments.length > 0 ? (
                      <div className="space-y-1">
                        <p className={`font-semibold ${
                          payroll.totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {payroll.totalAdjustments >= 0 ? '+' : ''}৳{Math.abs(payroll.totalAdjustments).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payroll.adjustments.length} adjustment{payroll.adjustments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <p className="text-lg font-bold text-green-600">
                      ৳{payroll.netSalary?.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(payroll.status)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                        payroll.isRegenerated 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {payroll.isRegenerated ? (
                          <>
                            <RefreshCw className="w-3 h-3 inline mr-1" />
                            v{payroll.version || 1}
                          </>
                        ) : (
                          `v${payroll.version || 1}`
                        )}
                      </span>
                      {payroll.regenerationHistory?.length > 0 && (
                        <span className="text-xs text-orange-600">
                          {payroll.regenerationHistory.length} change(s)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onViewDetails(payroll)}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      {canManage && payroll.status !== 'Paid' && (
                        <>
                          <Button
                            onClick={() => onRegenerate(payroll)}
                            size="sm"
                            variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Regenerate
                          </Button>
                          {/* ✅ NEW: Adjustment Button */}
                          <Button
                            onClick={() => onAddAdjustment(payroll)}
                            size="sm"
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50"
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Adjust
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}