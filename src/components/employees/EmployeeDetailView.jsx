'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import { 
  ArrowLeft, User, Mail, Briefcase, Calendar, DollarSign, 
  Clock, FileText, TrendingUp, AlertCircle, Edit
} from 'lucide-react'
import { TbCurrencyTaka } from "react-icons/tb";
import { BalanceCard } from '../leaves/LeavesView'
import LeaveTable from '../leaves/LeaveTable'

export default function EmployeeDetailView({ employeeId }) {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchEmployeeDetails()
  }, [employeeId])

  const fetchEmployeeDetails = async () => {
    try {
      const [empData, attData, leaveData, payrollData] = await Promise.all([
        apiCall(`/employees/${employeeId}`),
        apiCall(`/attendance?employeeId=${employeeId}`),
        apiCall(`/leaves?employeeId=${employeeId}`),
        apiCall(`/payroll?employeeId=${employeeId}`),
      ])
      
      setEmployee(empData)
      setAttendance(attData)
      setLeaves(leaveData)
      setPayrolls(payrollData)
    } catch (error) {
      console.error('Error fetching employee details:', error)
      alert('Error loading employee details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (!employee) return <div>Employee not found</div>

  // Calculate statistics
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  const currentMonthAttendance = attendance.filter(a => {
    const date = new Date(a.date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })

  const presentDays = currentMonthAttendance.filter(a => a.status === 'Present').length
  const absentDays = currentMonthAttendance.filter(a => a.status === 'Absent').length
  const lateDays = currentMonthAttendance.filter(a => a.lateMinutes > 0).length

  const approvedLeaves = leaves.filter(l => l.status === 'Approved')
  const pendingLeaves = leaves.filter(l => l.status === 'Pending')
  const totalLeavesTaken = approvedLeaves.reduce((acc, leave) => {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return acc + days
  }, 0)

  const totalAllowances = (employee.allowances?.houseRent || 0) + 
                          (employee.allowances?.medical || 0) + 
                          (employee.allowances?.transport || 0)

  const grossSalary = employee.basicSalary + totalAllowances

  const currentMonthPayroll = payrolls.find(p => p.month === currentMonth && p.year === currentYear)
  const lastMonthPayroll = payrolls.find(p => {
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear
    return p.month === lastMonth && p.year === lastYear
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/employees')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-black">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-black mt-1">{employee.designation} • {employee.department}</p>
          </div>
          <Button onClick={() => router.push(`/dashboard/employees`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Clock}
          label="Present This Month"
          value={presentDays}
          subValue={`${absentDays} Absent`}
          color="bg-green-500"
        />
        <StatsCard
          icon={Calendar}
          label="Leaves Taken"
          value={totalLeavesTaken}
          subValue={`${pendingLeaves.length} Pending`}
          color="bg-blue-500"
        />
        <StatsCard
          icon={TbCurrencyTaka}
          label="Gross Salary"
          value={`৳${grossSalary.toLocaleString()}`}
          subValue="Per Month"
          color="bg-purple-500"
        />
        <StatsCard
          icon={AlertCircle}
          label="Late Days"
          value={lateDays}
          subValue="This Month"
          color="bg-orange-500"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['overview', 'attendance', 'leaves', 'payroll'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-black hover:text-black hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              employee={employee} 
              currentMonthPayroll={currentMonthPayroll}
              lastMonthPayroll={lastMonthPayroll}
            />
          )}
          {activeTab === 'attendance' && <AttendanceTab attendance={attendance} employeeId={employeeId} />}
          {activeTab === 'leaves' && <LeavesTab leaves={leaves} myEmployee={employee}  />}
          {activeTab === 'payroll' && <PayrollTab payrolls={payrolls} employee={employee} />}
        </div>
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black mb-1">{label}</p>
          <p className="text-2xl font-bold text-black">{value}</p>
          <p className="text-xs text-black mt-1">{subValue}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ employee, currentMonthPayroll, lastMonthPayroll }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-black mb-4">Personal Information</h3>
        
        <InfoRow icon={User} label="Full Name" value={`${employee.firstName} ${employee.lastName}`} />
        <InfoRow icon={Mail} label="Employee Code" value={employee.employeeCode} />
        <InfoRow icon={Briefcase} label="Department" value={employee.department} />
        <InfoRow icon={Briefcase} label="Designation" value={employee.designation} />
        <InfoRow 
          icon={Calendar} 
          label="Joining Date" 
          value={new Date(employee.dateOfJoining).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} 
        />
        <InfoRow 
          icon={Calendar} 
          label="Date Of Birth" 
          value={new Date(employee.dateOfBirth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} 
        />
        <InfoRow 
          icon={TrendingUp} 
          label="Status" 
          value={employee.isActive ? 'Active' : 'Inactive'}
          badge={employee.isActive ? 'Active' : 'Inactive'}
          badgeColor={employee.isActive ? 'green' : 'red'}
        />
      </div>

      {/* Salary Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-black mb-4">Salary Breakdown</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <SalaryRow label="Basic Salary" amount={employee.basicSalary} />
          <SalaryRow label="House Rent Allowance" amount={employee.allowances?.houseRent || 0} />
          <SalaryRow label="Medical Allowance" amount={employee.allowances?.medical || 0} />
          <SalaryRow label="Transport Allowance" amount={employee.allowances?.transport || 0} />
          
          <div className="border-t border-gray-300 pt-3">
            <SalaryRow 
              label="Gross Salary" 
              amount={
                employee.basicSalary + 
                (employee.allowances?.houseRent || 0) + 
                (employee.allowances?.medical || 0) + 
                (employee.allowances?.transport || 0)
              }
              bold
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-black mt-6 mb-4">Work Schedule</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <InfoRow icon={Clock} label="Shift Start" value={employee.shiftStart} />
          <InfoRow icon={Clock} label="Shift End" value={employee.shiftEnd} />
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="lg:col-span-2">
        <h3 className="text-lg font-bold text-black mb-4">Payroll Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Month */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
            <h4 className="font-semibold text-black mb-4">Current Month</h4>
            {currentMonthPayroll ? (
              <div className="space-y-2">
                <SalaryRow label="Gross Earnings" amount={currentMonthPayroll.totalEarnings} />
                <SalaryRow label="Total Deductions" amount={currentMonthPayroll.totalDeductions} isDeduction />
                <div className="border-t border-indigo-300 pt-2 mt-2">
                  <SalaryRow label="Net Salary" amount={currentMonthPayroll.netSalary} bold />
                </div>
                <div className="mt-3">
                  <Badge status={currentMonthPayroll.status} />
                </div>
              </div>
            ) : (
              <p className="text-black text-sm">No payroll generated yet</p>
            )}
          </div>

          {/* Last Month */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-black mb-4">Last Month</h4>
            {lastMonthPayroll ? (
              <div className="space-y-2">
                <SalaryRow label="Gross Earnings" amount={lastMonthPayroll.totalEarnings} />
                <SalaryRow label="Total Deductions" amount={lastMonthPayroll.totalDeductions} isDeduction />
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <SalaryRow label="Net Salary" amount={lastMonthPayroll.netSalary} bold />
                </div>
                <div className="mt-3">
                  <Badge status={lastMonthPayroll.status} />
                </div>
              </div>
            ) : (
              <p className="text-black text-sm">No payroll data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Attendance Tab
function AttendanceTab({ attendance, employeeId }) {
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [filter, setFilter] = useState('all')
    
    // Filter attendance by selected month and year
    const monthFilteredAttendance = attendance.filter(a => {
      const date = new Date(a.date)
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear
    })
  
    const filteredAttendance = filter === 'all' 
      ? monthFilteredAttendance 
      : monthFilteredAttendance.filter(a => a.status === filter)
  
    // Calculate statistics for selected month
    const stats = {
      present: monthFilteredAttendance.filter(a => a.status === 'Present').length,
      absent: monthFilteredAttendance.filter(a => a.status === 'Absent').length,
      leave: monthFilteredAttendance.filter(a => a.status === 'Leave').length,
      late: monthFilteredAttendance.filter(a => a.lateMinutes > 0).length,
      totalWorkingDays: monthFilteredAttendance.length,
    }
  
    // Calculate total working hours
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
        {/* Month/Year Filter */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-6 border border-indigo-200">
          <h3 className="text-lg font-bold text-black mb-4">Select Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
              >
                {yearOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Status Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="all">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          </div>
        </div>
  
        {/* Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {selectedMonthName} {selectedYear} Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatBox label="Present" value={stats.present} color="text-green-600" bgColor="bg-green-50" />
            <StatBox label="Absent" value={stats.absent} color="text-red-600" bgColor="bg-red-50" />
            <StatBox label="On Leave" value={stats.leave} color="text-blue-600" bgColor="bg-blue-50" />
            <StatBox label="Late Days" value={stats.late} color="text-orange-600" bgColor="bg-orange-50" />
            <StatBox 
              label="Total Hours" 
              value={totalHours.toFixed(1)} 
              color="text-purple-600" 
              bgColor="bg-purple-50" 
            />
          </div>
        </div>
  
        {/* Attendance Records */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-black">
              Attendance Records ({filteredAttendance.length} {filteredAttendance.length === 1 ? 'record' : 'records'})
            </h3>
          </div>
  
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-black mx-auto mb-4" />
              <p className="text-black">No attendance records found for {selectedMonthName} {selectedYear}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">In Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Out Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Late</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendance.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => {
                    const date = new Date(record.date)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    
                    let workingHours = 0
                    if (record.inTime && record.outTime) {
                      workingHours = (new Date(record.outTime) - new Date(record.inTime)) / (1000 * 60 * 60)
                    }
  
                    return (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-black">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm text-black">
                          <span className={`font-semibold ${
                            dayName === 'Sat' || dayName === 'Sun' ? 'text-red-600' : 'text-black'
                          }`}>
                            {dayName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-black">
                          {record.inTime ? new Date(record.inTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-black">
                          {record.outTime ? new Date(record.outTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-black">
                          {workingHours > 0 ? `${workingHours.toFixed(1)}h` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge status={record.status} />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {record.lateMinutes > 0 ? (
                            <span className="text-orange-600 font-semibold">{record.lateMinutes} min</span>
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

// Leaves Tab
function LeavesTab({ leaves, myEmployee }) {
  return (
    <div>
      {/* ✅ Leave Balance */}
      {myEmployee && (
        <div className="bg-black rounded-xl shadow-lg p-6 mb-6">
          {/* <h2 className="text-xl font-bold text-white mb-4">
            Your Leave Balance
          </h2> */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BalanceCard
              label="Casual Leave"
              value={myEmployee.leaveBalance?.casual ?? 12}
              total={12}
            />
            <BalanceCard
              label="Sick Leave"
              value={myEmployee.leaveBalance?.sick ?? 12}
              total={12}
            />
            <BalanceCard
              label="Earned Leave"
              value={myEmployee.leaveBalance?.earned ?? 15}
              total={15}
            />
            <BalanceCard
              label="Unpaid Leave"
              value="Unlimited"
              isUnpaid
            />
          </div>
        </div>
      )}

      {/* Leave Table */}
      <LeaveTable leaves={leaves} />
    </div>
  );
}

// Payroll Tab
function PayrollTab({ payrolls, employee }) {
  return (
    <div className="space-y-6">
      {payrolls.length === 0 ? (
        <div className="text-center py-12">
          <TbCurrencyTaka className="w-16 h-16 text-black mx-auto mb-4" />
          <p className="text-black">No payroll records found</p>
        </div>
      ) : (
        payrolls.map((payroll) => {
          const monthName = new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' })
          
          return (
            <div key={payroll._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-black">{monthName} {payroll.year}</h3>
                  <Badge status={payroll.status} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-black">Net Salary</p>
                  <p className="text-2xl font-bold text-indigo-600">${payroll.netSalary?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <h4 className="font-semibold text-black mb-3">Earnings</h4>
                  <div className="space-y-2">
                    <SalaryRow label="Basic Salary" amount={payroll.basicSalary} />
                    <SalaryRow label="House Rent" amount={payroll.allowances?.houseRent || 0} />
                    <SalaryRow label="Medical" amount={payroll.allowances?.medical || 0} />
                    <SalaryRow label="Transport" amount={payroll.allowances?.transport || 0} />
                    {payroll.allowances?.other > 0 && (
                      <SalaryRow label="Other" amount={payroll.allowances.other} />
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <SalaryRow label="Total Earnings" amount={payroll.totalEarnings} bold />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="font-semibold text-black mb-3">Deductions</h4>
                  <div className="space-y-2">
                    <SalaryRow label="Tax" amount={payroll.deductions?.tax || 0} isDeduction />
                    <SalaryRow label="Provident Fund" amount={payroll.deductions?.providentFund || 0} isDeduction />
                    <SalaryRow label="Absent" amount={payroll.deductions?.absent || 0} isDeduction />
                    <SalaryRow label="Late" amount={payroll.deductions?.late || 0} isDeduction />
                    {payroll.deductions?.other > 0 && (
                      <SalaryRow label="Other" amount={payroll.deductions.other} isDeduction />
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <SalaryRow label="Total Deductions" amount={payroll.totalDeductions} bold isDeduction />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// Helper Components
function InfoRow({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-black mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-black">{label}</p>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-black">{value}</p>
          {badge && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              badgeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SalaryRow({ label, amount, bold, isDeduction }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${bold ? 'font-bold' : ''} text-black`}>{label}</span>
      <span className={`${bold ? 'font-bold text-lg' : ''} ${isDeduction ? 'text-red-600' : 'text-black'}`}>
        {isDeduction && '-'}৳{amount?.toLocaleString()}
      </span>
    </div>
  )
}

function StatBox({ label, value, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-center`}>
      <p className="text-sm text-black mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}