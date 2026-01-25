import Badge from '@/components/common/Badge'
import { formatTime } from '@/lib/utils'

export default function AttendanceTable({ attendance }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">In Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Out Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Late (mins)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {record.employee?.firstName} {record.employee?.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {record.inTime ? formatTime(record.inTime) : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {record.outTime ? formatTime(record.outTime) : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Badge status={record.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{record.lateMinutes || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}