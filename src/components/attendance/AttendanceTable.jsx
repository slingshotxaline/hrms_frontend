import Badge from '@/components/common/Badge'
import { formatTime } from '@/lib/utils'

export default function AttendanceTable({ attendance, showEmployeeColumn = false }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {showEmployeeColumn && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Day</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">In Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Out Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Late</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={showEmployeeColumn ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                  No attendance records found for this period
                </td>
              </tr>
            ) : (
              attendance
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((record) => {
                  const date = new Date(record.date)
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                  
                  let workingHours = 0
                  if (record.inTime && record.outTime) {
                    workingHours = (new Date(record.outTime) - new Date(record.inTime)) / (1000 * 60 * 60)
                  }

                  return (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      {showEmployeeColumn && (
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div>
                            <p>{record.employee?.firstName} {record.employee?.lastName}</p>
                            <p className="text-xs text-gray-500">{record.employee?.employeeCode}</p>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-semibold ${
                          dayName === 'Sat' || dayName === 'Sun' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {dayName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.inTime ? formatTime(record.inTime) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.outTime ? formatTime(record.outTime) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {workingHours > 0 ? `${workingHours.toFixed(1)}h` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge status={record.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {record.lateMinutes > 0 ? (
                          <span className="text-orange-600 font-semibold">{record.lateMinutes} min</span>
                        ) : (
                          <span className="text-green-600">On Time</span>
                        )}
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