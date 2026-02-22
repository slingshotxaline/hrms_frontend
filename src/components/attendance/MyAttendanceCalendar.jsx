'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import Button from '@/components/common/Button'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CheckCircle,
  XCircle,
  Coffee,
  Moon,
  Briefcase,
  AlertCircle
} from 'lucide-react'

export default function MyAttendanceCalendar() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState([])
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
    fetchEmployeeInfo()
  }, [selectedMonth])

  const fetchEmployeeInfo = async () => {
    try {
      const profile = await apiCall('/auth/profile')
      setEmployeeInfo(profile.employeeId)
    } catch (error) {
      console.error('Error fetching employee info:', error)
    }
  }

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1
      
      // Get first and last day of month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      console.log(`📅 Fetching attendance for ${startDate} to ${endDate}`)

      const data = await apiCall(`/attendance/my?startDate=${startDate}&endDate=${endDate}`)
      setAttendanceData(data)
      console.log(`✅ Loaded ${data.length} attendance records`)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date())
  }

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    
    const days = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split('T')[0]
      
      // Find attendance for this day
      const attendance = attendanceData.find(a => 
        new Date(a.date).toISOString().split('T')[0] === dateString
      )

      // Check if it's today or future
      const isToday = date.toDateString() === today.toDateString()
      const isFuture = date > today
      const isPast = date < today && !isToday

      days.push({
        day,
        date,
        dateString,
        attendance,
        isToday,
        isFuture,
        isPast,
      })
    }

    return days
  }

  const getStatusInfo = (dayInfo) => {
    const { attendance, isToday, isFuture, isPast } = dayInfo
    
    // Future days
    if (isFuture) {
      return {
        status: 'Upcoming',
        color: 'bg-gray-100 text-gray-400',
        icon: Calendar,
        borderColor: 'border-gray-200'
      }
    }

    // No attendance record
    if (!attendance) {
      // Check if it's weekend (Friday or Saturday in Bangladesh)
      const dayOfWeek = dayInfo.date.getDay()
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday = 5, Saturday = 6
        return {
          status: 'Weekend',
          color: 'bg-purple-50 text-purple-700',
          icon: Moon,
          borderColor: 'border-purple-200'
        }
      }

      // Past day without record = Absent
      if (isPast) {
        return {
          status: 'Absent',
          color: 'bg-red-50 text-red-700',
          icon: XCircle,
          borderColor: 'border-red-300'
        }
      }

      return {
        status: 'No Data',
        color: 'bg-gray-50 text-gray-500',
        icon: AlertCircle,
        borderColor: 'border-gray-200'
      }
    }

    // Has attendance
    if (attendance.status === 'Holiday') {
      return {
        status: 'Holiday',
        color: 'bg-blue-50 text-blue-700',
        icon: Briefcase,
        borderColor: 'border-blue-200'
      }
    }

    if (attendance.status === 'Leave') {
      return {
        status: 'Leave',
        color: 'bg-yellow-50 text-yellow-700',
        icon: Coffee,
        borderColor: 'border-yellow-200'
      }
    }

    if (attendance.status === 'Present') {
      return {
        status: attendance.timingStatus || 'Present',
        color: 'bg-green-50 text-green-700',
        icon: CheckCircle,
        borderColor: 'border-green-300'
      }
    }

    if (attendance.status === 'Absent') {
      return {
        status: 'Absent',
        color: 'bg-red-50 text-red-700',
        icon: XCircle,
        borderColor: 'border-red-300'
      }
    }

    return {
      status: attendance.status,
      color: 'bg-gray-50 text-gray-700',
      icon: AlertCircle,
      borderColor: 'border-gray-200'
    }
  }

  const formatTime = (dateTime) => {
    if (!dateTime) return '-'
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatMinutes = (minutes) => {
    if (!minutes || minutes === 0) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) return <Loading />

  const days = getDaysInMonth()
  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Calculate statistics
  const stats = {
    present: days.filter(d => d.attendance && d.attendance.status === 'Present').length,
    absent: days.filter(d => (!d.attendance && d.isPast && ![5, 6].includes(d.date.getDay())) || 
                              (d.attendance && d.attendance.status === 'Absent')).length,
    leave: days.filter(d => d.attendance && d.attendance.status === 'Leave').length,
    halfDay: days.filter(d => d.attendance && d.attendance.isHalfDay).length,
    weekend: days.filter(d => [5, 6].includes(d.date.getDay())).length,
    holiday: days.filter(d => d.attendance && d.attendance.status === 'Holiday').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">
            {employeeInfo?.firstName} {employeeInfo?.lastName} ({employeeInfo?.employeeCode})
          </p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
            <Button
              onClick={goToCurrentMonth}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Today
            </Button>
          </div>

          <Button
            onClick={goToNextMonth}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <StatCard label="Present" value={stats.present} color="bg-green-500" />
        <StatCard label="Absent" value={stats.absent} color="bg-red-500" />
        <StatCard label="Leave" value={stats.leave} color="bg-yellow-500" />
        <StatCard label="Half Day" value={stats.halfDay} color="bg-orange-500" />
        <StatCard label="Weekend" value={stats.weekend} color="bg-purple-500" />
        <StatCard label="Holiday" value={stats.holiday} color="bg-blue-500" />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Day</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">In Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Out Time</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Hours<br/><span className="text-[10px] font-normal">Gross</span></th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Working<br/><span className="text-[10px] font-normal">Net</span></th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Breaks<br/><span className="text-[10px] font-normal">Total</span></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">In Timing<br/><span className="text-[10px] font-normal">Arrival</span></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Out Timing<br/><span className="text-[10px] font-normal">Departure</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {days.map((dayInfo) => {
                const statusInfo = getStatusInfo(dayInfo)
                const StatusIcon = statusInfo.icon
                const attendance = dayInfo.attendance

                return (
                  <tr 
                    key={dayInfo.day}
                    className={`hover:bg-gray-50 transition-colors ${
                      dayInfo.isToday ? 'bg-indigo-50' : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold text-gray-900">
                        {dayInfo.day}
                      </div>
                    </td>

                    {/* Day */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dayInfo.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>

                    {/* In Time */}
                    <td className="px-4 py-3 text-sm">
                      {attendance ? (
                        <span className={`font-mono ${
                          attendance.lateMinutes > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatTime(attendance.inTime)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Out Time */}
                    <td className="px-4 py-3 text-sm">
                      {attendance && attendance.outTime ? (
                        <span className="font-mono text-gray-900">
                          {formatTime(attendance.outTime)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Total Hours (Gross) */}
                    <td className="px-4 py-3 text-sm text-right">
                      {attendance && attendance.inTime && attendance.outTime ? (
                        <span className="font-semibold text-gray-900">
                          {formatMinutes(
                            Math.floor((new Date(attendance.outTime) - new Date(attendance.inTime)) / 60000)
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Working Net */}
                    <td className="px-4 py-3 text-sm text-right">
                      {attendance && attendance.netWorkingMinutes ? (
                        <span className="font-semibold text-blue-600">
                          {formatMinutes(attendance.netWorkingMinutes)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Breaks Total */}
                    <td className="px-4 py-3 text-sm text-right">
                      {attendance && attendance.totalBreakMinutes > 0 ? (
                        <span className="text-orange-600">
                          {formatMinutes(attendance.totalBreakMinutes)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-sm">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color} ${statusInfo.borderColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.status}
                      </div>
                    </td>

                    {/* In Timing (Arrival) */}
                    <td className="px-4 py-3 text-sm">
                      {attendance ? (
                        <div className="space-y-1">
                          {attendance.lateMinutes > 0 && (
                            <div className="text-xs text-red-600">
                              Late: {formatMinutes(attendance.lateMinutes)}
                            </div>
                          )}
                          {attendance.isEarly && (
                            <div className="text-xs text-green-600">
                              Early: {formatMinutes(attendance.earlyMinutes)}
                            </div>
                          )}
                          {attendance.lateMinutes === 0 && !attendance.isEarly && (
                            <div className="text-xs text-green-600">
                              On Time
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Out Timing (Departure) */}
                    <td className="px-4 py-3 text-sm">
                      {attendance ? (
                        <div className="space-y-1">
                          {attendance.hasOvertime && attendance.overtimeMinutes > 0 && (
                            <div className="text-xs text-blue-600">
                              OT: {formatMinutes(attendance.overtimeMinutes)}
                            </div>
                          )}
                          {attendance.earlyLeave && attendance.earlyLeaveMinutes > 0 && (
                            <div className="text-xs text-orange-600">
                              Early: {formatMinutes(attendance.earlyLeaveMinutes)}
                            </div>
                          )}
                          {!attendance.hasOvertime && !attendance.earlyLeave && attendance.outTime && (
                            <div className="text-xs text-green-600">
                              On Time
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-yellow-600" />
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-600" />
            <span>Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-2 rounded-full`}>
          <Clock className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  )
}