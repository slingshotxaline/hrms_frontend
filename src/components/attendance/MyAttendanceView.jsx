'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import Badge from '@/components/common/Badge'
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react'

export default function MyAttendanceView() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  useEffect(() => {
    fetchMyAttendance()
  }, [])

  const fetchMyAttendance = async () => {
    try {
      // Fetch user's employee record
      const profile = await apiCall('/auth/profile')
      
      if (!profile.employeeId) {
        alert('No employee record linked to your account')
        return
      }

      const [empData, attData] = await Promise.all([
        apiCall(`/employees/${profile.employeeId._id}`),
        apiCall(`/attendance?employeeId=${profile.employeeId._id}`),
      ])
      
      setEmployee(empData)
      setAttendance(attData)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      alert('Error loading your attendance data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (!employee) return <div className="text-center py-12">No employee data found</div>

  // Filter attendance by selected month and year
  const monthFilteredAttendance = attendance.filter(a => {
    const date = new Date(a.date)
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear
  })

  // Calculate statistics
  const stats = {
    present: monthFilteredAttendance.filter(a => a.status === 'Present').length,
    absent: monthFilteredAttendance.filter(a => a.status === 'Absent').length,
    leave: monthFilteredAttendance.filter(a => a.status === 'Leave').length,
    late: monthFilteredAttendance.filter(a => a.lateMinutes > 0).length,
  }

  const totalHours = monthFilteredAttendance.reduce((acc, record) => {
    if (record.inTime && record.outTime) {
      const hours = (new Date(record.outTime) - new Date(record.inTime)) / (1000 * 60 * 60)
      return acc + hours
    }
    return acc
  }, 0)

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' })
  }))

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i
    return { value: year, label: year.toString() }
  })

  const selectedMonthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">My Attendance</h1>
        <p className="text-black mt-2">
          {employee.firstName} {employee.lastName} • {employee.employeeCode}
        </p>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-black mb-4">Select Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black mb-4">
          {selectedMonthName} {selectedYear} Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={Clock}
            label="Present"
            value={stats.present}
            color="bg-green-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Absent"
            value={stats.absent}
            color="bg-red-500"
          />
          <StatCard
            icon={Calendar}
            label="On Leave"
            value={stats.leave}
            color="bg-blue-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Late Days"
            value={stats.late}
            color="bg-orange-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Hours"
            value={totalHours.toFixed(1)}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-black">
            Attendance Records ({monthFilteredAttendance.length})
          </h3>
        </div>

        {monthFilteredAttendance.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-black mx-auto mb-4" />
            <p className="text-black">No attendance records for {selectedMonthName} {selectedYear}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Day</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">In Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Out Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthFilteredAttendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record) => {
                    const date = new Date(record.date)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    
                    let workingHours = 0
                    if (record.inTime && record.outTime) {
                      workingHours = (new Date(record.outTime) - new Date(record.inTime)) / (1000 * 60 * 60)
                    }

                    return (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-black">
                          {date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`font-semibold ${
                            dayName === 'Sat' || dayName === 'Sun' ? 'text-red-600' : 'text-black'
                          }`}>
                            {dayName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-black">
                          {record.inTime ? new Date(record.inTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-black">
                          {record.outTime ? new Date(record.outTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-black">
                          {workingHours > 0 ? `${workingHours.toFixed(1)}h` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge status={record.status} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {record.lateMinutes > 0 ? (
                            <span className="text-orange-600 font-semibold">
                              {record.lateMinutes} min
                            </span>
                          ) : (
                            <span className="text-green-600">On Time</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black mb-1">{label}</p>
          <p className="text-2xl font-bold text-black">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}