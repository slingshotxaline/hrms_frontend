'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import AttendanceTable from './AttendanceTable'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import { Clock, Calendar as CalendarIcon, Download, Filter } from 'lucide-react'
import MarkAttendanceModal from './MarkAttendanceModal'

export default function AttendanceView() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [myEmployee, setMyEmployee] = useState(null)
  const [userRole, setUserRole] = useState(null)
  
  // ✅ Date filters - DEFAULT TO TODAY
  const getTodayDate = () => new Date().toISOString().split('T')[0]
  
  const [startDate, setStartDate] = useState(getTodayDate())
  const [endDate, setEndDate] = useState(getTodayDate())
  
  // Legacy month/year filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Filter view type: 'date' or 'month'
  const [filterType, setFilterType] = useState('date')
  
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [startDate, endDate, selectedMonth, selectedYear, filterType])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching attendance data...')
      
      const profile = await apiCall('/auth/profile')
      console.log('👤 User profile:', profile)
      console.log('🎭 User role from profile:', profile.role)
      
      setUserRole(profile.role)
      
      const isAdmin = profile.role === 'Admin'
      const isHR = profile.role === 'HR'
      const isLeader = ['Business Lead', 'Team Lead'].includes(profile.role)
      const canSeeAll = isAdmin || isHR
      
      console.log('✅ Permissions:', { isAdmin, isHR, isLeader, canSeeAll })
      
      // Calculate date range based on filter type
      let queryStartDate, queryEndDate
      
      if (filterType === 'date') {
        queryStartDate = startDate
        queryEndDate = endDate
      } else {
        // Month-based filter
        queryStartDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0]
        queryEndDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
      }
      
      console.log('📅 Date range:', { queryStartDate, queryEndDate, filterType })
      
      if (canSeeAll) {
        console.log('✅ Admin/HR - Fetching all employees')
        
        const [attendanceData, employeesData] = await Promise.all([
          apiCall(`/attendance?startDate=${queryStartDate}&endDate=${queryEndDate}`),
          apiCall('/employees'),
        ])
        
        console.log('📊 All attendance records:', attendanceData.length)
        console.log('👥 All employees:', employeesData.length)
        
        setAttendance(attendanceData)
        setEmployees(employeesData)
        
        if (profile.employeeId) {
          const empData = await apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`)
          setMyEmployee(empData)
        }
        
      } else if (isLeader) {
        console.log('👔 Leader - Fetching team data')
        
        try {
          const teamData = await apiCall('/roles/my-team')
          console.log('👥 My team data:', teamData)
          
          let myEmpData = null
          if (profile.employeeId) {
            myEmpData = await apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`)
            setMyEmployee(myEmpData)
            console.log('✅ My employee record:', myEmpData.employeeCode)
          }
          
          const teamMembers = teamData.team || []
          const teamEmployeeIds = []
          const teamEmployeeRecords = []
          
          for (const member of teamMembers) {
            if (member.employeeId) {
              const empId = member.employeeId._id || member.employeeId
              teamEmployeeIds.push(empId)
              
              if (member.employeeId.firstName) {
                teamEmployeeRecords.push(member.employeeId)
              } else {
                try {
                  const empRecord = await apiCall(`/employees/${empId}`)
                  teamEmployeeRecords.push(empRecord)
                } catch (err) {
                  console.error('Error fetching employee:', empId, err)
                }
              }
            }
          }
          
          const allEmployeeIds = myEmpData 
            ? [myEmpData._id, ...teamEmployeeIds]
            : teamEmployeeIds
          
          console.log('🔍 Fetching attendance for employee IDs:', allEmployeeIds)
          
          if (allEmployeeIds.length > 0) {
            const attendancePromises = allEmployeeIds.map(empId => 
              apiCall(`/attendance?employeeId=${empId}&startDate=${queryStartDate}&endDate=${queryEndDate}`)
            )
            
            const attendanceResults = await Promise.all(attendancePromises)
            const allAttendance = attendanceResults.flat()
            
            console.log('✅ Total attendance records:', allAttendance.length)
            setAttendance(allAttendance)
          } else {
            setAttendance([])
          }
          
          const allEmployees = myEmpData 
            ? [myEmpData, ...teamEmployeeRecords]
            : teamEmployeeRecords
          
          console.log('👥 Total employees list:', allEmployees.length)
          setEmployees(allEmployees)
          
        } catch (error) {
          console.error('❌ Error fetching team data:', error)
          
          if (profile.employeeId) {
            const empData = await apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`)
            setMyEmployee(empData)
            
            const attendanceData = await apiCall(`/attendance?employeeId=${empData._id}&startDate=${queryStartDate}&endDate=${queryEndDate}`)
            setAttendance(attendanceData)
            setEmployees([empData])
          }
        }
        
      } else {
        console.log('👤 Regular employee - Fetching own data')
        
        if (!profile.employeeId) {
          alert('No employee record found')
          setLoading(false)
          return
        }
        
        const [empData, attendanceData] = await Promise.all([
          apiCall(`/employees/${profile.employeeId._id || profile.employeeId}`),
          apiCall(`/attendance?employeeId=${profile.employeeId._id || profile.employeeId}&startDate=${queryStartDate}&endDate=${queryEndDate}`),
        ])
        
        console.log('✅ Own attendance:', attendanceData.length)
        
        setMyEmployee(empData)
        setAttendance(attendanceData)
        setEmployees([empData])
      }
    } catch (error) {
      console.error('❌ Error fetching attendance:', error)
      alert('Error loading attendance data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (employeeCode, type) => {
    try {
      await apiCall('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          employeeCode,
          timestamp: new Date().toISOString(),
          type,
        }),
      })
      fetchData()
      setShowMarkModal(false)
      alert(`Attendance ${type} marked successfully!`)
    } catch (error) {
      alert(error.message)
    }
  }

  // ✅ FIXED: Quick date range presets
  const applyDatePreset = (preset) => {
    const today = new Date()
    let start, end
    
    switch(preset) {
      case 'today':
        start = today.toISOString().split('T')[0]
        end = today.toISOString().split('T')[0]
        break
        
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        start = yesterday.toISOString().split('T')[0]
        end = yesterday.toISOString().split('T')[0]
        break
        
      case 'thisWeek':
        const weekStart = new Date(today)
        const dayOfWeek = today.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday as first day
        weekStart.setDate(today.getDate() + diff)
        start = weekStart.toISOString().split('T')[0]
        end = today.toISOString().split('T')[0]
        break
        
      case 'lastWeek':
        const lastWeekEnd = new Date(today)
        const currentDayOfWeek = today.getDay()
        const daysToLastSunday = currentDayOfWeek === 0 ? 7 : currentDayOfWeek
        lastWeekEnd.setDate(today.getDate() - daysToLastSunday)
        
        const lastWeekStart = new Date(lastWeekEnd)
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6)
        
        start = lastWeekStart.toISOString().split('T')[0]
        end = lastWeekEnd.toISOString().split('T')[0]
        break
        
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        end = today.toISOString().split('T')[0]
        break
        
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        start = lastMonth.toISOString().split('T')[0]
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        end = lastDayOfLastMonth.toISOString().split('T')[0]
        break
        
      case 'last7days':
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 6)
        start = sevenDaysAgo.toISOString().split('T')[0]
        end = today.toISOString().split('T')[0]
        break
        
      case 'last30days':
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 29)
        start = thirtyDaysAgo.toISOString().split('T')[0]
        end = today.toISOString().split('T')[0]
        break
        
      default:
        return
    }
    
    console.log(`📅 Applying preset "${preset}":`, { start, end })
    
    setStartDate(start)
    setEndDate(end)
    setFilterType('date')
  }

  // Export to CSV
  const exportToCSV = () => {
    if (filteredAttendance.length === 0) {
      alert('No data to export')
      return
    }

    const headers = ['Employee Code', 'Name', 'Date', 'Day', 'In Time', 'Out Time', 'Total Hours', 'Working Hours', 'Break Time', 'Status', 'In Timing', 'Out Timing', 'Punches']
    
    const rows = filteredAttendance.map(record => {
      const date = new Date(record.date)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const grossHours = record.inTime && record.outTime 
        ? ((new Date(record.outTime) - new Date(record.inTime)) / (1000 * 60 * 60)).toFixed(1)
        : '0'
      const netHours = ((record.netWorkingMinutes || 0) / 60).toFixed(1)
      const breakHours = ((record.totalBreakMinutes || 0) / 60).toFixed(1)
      const punchCount = record.punches?.length || 0
      
      return [
        record.employee?.employeeCode || '',
        `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`,
        date.toLocaleDateString(),
        dayName,
        record.inTime ? new Date(record.inTime).toLocaleTimeString() : '-',
        record.outTime ? new Date(record.outTime).toLocaleTimeString() : '-',
        grossHours,
        netHours,
        breakHours,
        record.status,
        record.timingStatus || '-',
        record.hasOvertime ? `Overtime +${record.overtimeMinutes}min` : record.earlyLeave ? `Early Leave -${record.earlyLeaveMinutes}min` : 'On Time',
        punchCount
      ]
    })

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return <Loading />

  const isAdmin = userRole === 'Admin'
  const isHR = userRole === 'HR'
  const isLeader = ['Business Lead', 'Team Lead'].includes(userRole)
  const canSeeAll = isAdmin || isHR

  const filteredAttendance = filterEmployee === 'all' 
    ? attendance 
    : attendance.filter(a => a.employee?._id === filterEmployee)

  // Format display date range
  const displayStartDate = filterType === 'date' 
    ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    
  const displayEndDate = filterType === 'date'
    ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(selectedYear, selectedMonth, 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">
            {canSeeAll ? 'View and manage all employee attendance' :
             isLeader ? `View your team's attendance (${employees.length} ${employees.length === 1 ? 'member' : 'members'})` :
             'View your attendance records'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-5 h-5 mr-2 inline" />
            Export CSV
          </Button>
          <Button onClick={() => setShowMarkModal(true)}>
            <Clock className="w-5 h-5 mr-2 inline" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-2 px-6">
            <button
              onClick={() => setFilterType('date')}
              className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                filterType === 'date'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Date Range
            </button>
            <button
              onClick={() => setFilterType('month')}
              className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                filterType === 'month'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Month View
            </button>
          </nav>
        </div>

        <div className="p-6">
          {filterType === 'date' ? (
            <>
              {/* Date Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {(canSeeAll || (isLeader && employees.length > 1)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Employee</label>
                    <select
                      value={filterEmployee}
                      onChange={(e) => setFilterEmployee(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">All {isLeader ? 'Team Members' : 'Employees'}</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Quick Date Presets */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Quick Select:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyDatePreset('today')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => applyDatePreset('yesterday')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => applyDatePreset('last7days')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => applyDatePreset('thisWeek')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => applyDatePreset('lastWeek')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    Last Week
                  </button>
                  <button
                    onClick={() => applyDatePreset('thisMonth')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => applyDatePreset('lastMonth')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => applyDatePreset('last30days')}
                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Month View Filter */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i
                    return (
                      <option key={year} value={year}>{year}</option>
                    )
                  })}
                </select>
              </div>

              {(canSeeAll || (isLeader && employees.length > 1)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Employee</label>
                  <select
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All {isLeader ? 'Team Members' : 'Employees'}</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Date Range Info */}
          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-gray-700 font-medium">Showing: </span>
                <span className="text-indigo-900 font-bold">{displayStartDate}</span>
                <span className="text-gray-500 mx-2">to</span>
                <span className="text-indigo-900 font-bold">{displayEndDate}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-indigo-600 font-bold">
                  {filteredAttendance.length} {filteredAttendance.length === 1 ? 'record' : 'records'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Records"
          value={filteredAttendance.length}
          color="bg-blue-500"
        />
        <StatCard
          label="Present"
          value={filteredAttendance.filter(a => a.status === 'Present').length}
          color="bg-green-500"
        />
        <StatCard
          label="Absent"
          value={filteredAttendance.filter(a => a.status === 'Absent').length}
          color="bg-red-500"
        />
        <StatCard
          label="On Leave"
          value={filteredAttendance.filter(a => a.status === 'Leave').length}
          color="bg-yellow-500"
        />
        <StatCard
          label="Late Days"
          value={filteredAttendance.filter(a => a.lateMinutes > 0).length}
          color="bg-orange-500"
        />
      </div>

      {/* Attendance Table */}
      <AttendanceTable 
        attendance={filteredAttendance} 
        showEmployeeColumn={filterEmployee === 'all' && employees.length > 1}
      />

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <MarkAttendanceModal
          myEmployee={myEmployee}
          onClose={() => setShowMarkModal(false)}
          onMark={markAttendance}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center`}>
          <Clock className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

