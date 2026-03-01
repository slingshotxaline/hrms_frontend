'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import { 
  ArrowLeft, User, Mail, Briefcase, Calendar, DollarSign, 
  Clock, FileText, TrendingUp, AlertCircle, Edit, Phone, MapPin
} from 'lucide-react'
import { TbCurrencyTaka } from "react-icons/tb"

export default function EmployeeDetailView({ employeeId }) {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [lates, setLates] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchEmployeeDetails()
  }, [employeeId])

  const fetchEmployeeDetails = async () => {
    try {
      const [empData, attData, leaveData, lateData, payrollData] = await Promise.all([
        apiCall(`/employees/${employeeId}`),
        apiCall(`/attendance?employeeId=${employeeId}`),
        apiCall(`/leaves?employeeId=${employeeId}`),
        apiCall(`/lates?employeeId=${employeeId}`),
        apiCall(`/payroll?employeeId=${employeeId}`),
      ])
      
      setEmployee(empData)
      setAttendance(attData)
      setLeaves(leaveData)
      setLates(lateData)
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

  // Calculate current month statistics
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  const currentMonthAttendance = attendance.filter(a => {
    const date = new Date(a.date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })

  const presentDays = currentMonthAttendance.filter(a => a.status === 'Present').length
  const absentDays = currentMonthAttendance.filter(a => a.status === 'Absent').length
  const halfDays = currentMonthAttendance.filter(a => a.isHalfDay).length

  // Current month lates
  const currentMonthLates = lates.filter(l => {
    const date = new Date(l.date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })
  const lateDays = currentMonthLates.length
  const approvedLateDays = currentMonthLates.filter(l => l.status === 'Approved').length

  // Leave statistics
  const approvedLeaves = leaves.filter(l => l.status === 'Approved')
  const pendingLeaves = leaves.filter(l => l.status === 'Pending')

  // Salary calculation
  const totalAllowances = (employee.allowances?.houseRent || 0) + 
                          (employee.allowances?.medical || 0) + 
                          (employee.allowances?.transport || 0)
  const grossSalary = employee.basicSalary + totalAllowances

  // Current payroll
  const currentMonthPayroll = payrolls.find(p => {
    const payrollMonth = new Date(p.month)
    return payrollMonth.getMonth() + 1 === currentMonth && payrollMonth.getFullYear() === currentYear
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
            <h1 className="text-3xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{employee.designation} • {employee.department}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                employee.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </span>
              {employee.user && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Has Account
                </span>
              )}
            </div>
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
          subValue={`${absentDays} Absent • ${halfDays} Half Day`}
          color="bg-green-500"
        />
        <StatsCard
          icon={AlertCircle}
          label="Late This Month"
          value={lateDays}
          subValue={`${approvedLateDays} Approved`}
          color="bg-orange-500"
        />
        <StatsCard
          icon={Calendar}
          label="Leave Balance"
          value={`${employee.leaveBalance?.annual || 0}/${10}`}
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
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['overview', 'attendance', 'leaves', 'lates', 'payroll'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
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
            />
          )}
          {activeTab === 'attendance' && (
            <AttendanceTab 
              attendance={attendance} 
              employeeId={employeeId} 
            />
          )}
          {activeTab === 'leaves' && (
            <LeavesTab 
              leaves={leaves} 
              employee={employee}
            />
          )}
          {activeTab === 'lates' && (
            <LatesTab 
              lates={lates}
              employee={employee}
            />
          )}
          {activeTab === 'payroll' && (
            <PayrollTab 
              payrolls={payrolls} 
              employee={employee} 
            />
          )}
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
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subValue}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ employee, currentMonthPayroll }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
        
        <InfoRow icon={User} label="Full Name" value={`${employee.firstName} ${employee.lastName}`} />
        <InfoRow icon={Mail} label="Employee Code" value={employee.employeeCode} />
        <InfoRow icon={Mail} label="Email" value={employee.email} />
        {employee.phone && <InfoRow icon={Phone} label="Phone" value={employee.phone} />}
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
        {employee.dateOfBirth && (
          <InfoRow 
            icon={Calendar} 
            label="Date Of Birth" 
            value={new Date(employee.dateOfBirth).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} 
          />
        )}
        {employee.address && (
          <InfoRow icon={MapPin} label="Address" value={employee.address} />
        )}
      </div>

      {/* Salary & Work Schedule */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Salary Breakdown</h3>
        
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

        <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Leave Balance</h3>
        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
          <LeaveBalanceCard label="Sick Leave" value={employee.leaveBalance?.sick || 0} total={10} />
          <LeaveBalanceCard label="Annual Leave" value={employee.leaveBalance?.annual || 0} total={10} />
          <LeaveBalanceCard label="Casual Leave" value={employee.leaveBalance?.casual || 0} total={10} />
          <LeaveBalanceCard label="Unpaid" value="∞" total="∞" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Work Schedule</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <InfoRow icon={Clock} label="Shift Start" value={employee.shiftStart} />
          <InfoRow icon={Clock} label="Shift End" value={employee.shiftEnd} />
        </div>
      </div>

      {/* Current Month Payroll */}
      {currentMonthPayroll && (
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current Month Payroll</h3>
          <div className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Gross Salary</p>
                <p className="text-2xl font-bold text-gray-900">৳{currentMonthPayroll.grossSalary?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">-৳{currentMonthPayroll.totalDeductions?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Net Salary</p>
                <p className="text-2xl font-bold text-green-600">৳{currentMonthPayroll.netSalary?.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge status={currentMonthPayroll.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Attendance Tab
function AttendanceTab({ attendance, employeeId }) {
  const router = useRouter()
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  const currentMonthAttendance = attendance.filter(a => {
    const date = new Date(a.date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })

  const stats = {
    present: currentMonthAttendance.filter(a => a.status === 'Present').length,
    absent: currentMonthAttendance.filter(a => a.status === 'Absent').length,
    leave: currentMonthAttendance.filter(a => a.status === 'Leave').length,
    halfDay: currentMonthAttendance.filter(a => a.isHalfDay).length,
    late: currentMonthAttendance.filter(a => a.lateMinutes > 0).length,
  }

  return (
    <div>
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatBox label="Present" value={stats.present} color="text-green-600" bgColor="bg-green-50" />
        <StatBox label="Absent" value={stats.absent} color="text-red-600" bgColor="bg-red-50" />
        <StatBox label="On Leave" value={stats.leave} color="text-blue-600" bgColor="bg-blue-50" />
        <StatBox label="Half Days" value={stats.halfDay} color="text-orange-600" bgColor="bg-orange-50" />
        <StatBox label="Late Days" value={stats.late} color="text-yellow-600" bgColor="bg-yellow-50" />
      </div>

      {/* View Full Attendance Button */}
      <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-6 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">View Full Attendance Calendar</h4>
            <p className="text-sm text-gray-600">
              See detailed attendance with punch times, breaks, and overtime for all months
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/my-attendance')}>
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Recent Attendance Summary */}
      <h4 className="font-semibold text-gray-900 mb-4">Recent Attendance (Last 10 Days)</h4>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Day</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">In Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Out Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentMonthAttendance
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 10)
              .map((record) => {
                const date = new Date(record.date)
                return (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.inTime ? new Date(record.inTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.outTime ? new Date(record.outTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge status={record.status} />
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Leaves Tab
function LeavesTab({ leaves, employee }) {
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  }

  return (
    <div>
      {/* Leave Balance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <LeaveBalanceCard label="Sick Leave" value={employee.leaveBalance?.sick || 0} total={10} />
        <LeaveBalanceCard label="Annual Leave" value={employee.leaveBalance?.annual || 0} total={10} />
        <LeaveBalanceCard label="Casual Leave" value={employee.leaveBalance?.casual || 0} total={10} />
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Unpaid</p>
          <p className="text-3xl font-bold text-gray-900">∞</p>
        </div>
      </div>

      {/* Leave Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total Requests" value={stats.total} color="text-blue-600" bgColor="bg-blue-50" />
        <StatBox label="Pending" value={stats.pending} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatBox label="Approved" value={stats.approved} color="text-green-600" bgColor="bg-green-50" />
        <StatBox label="Rejected" value={stats.rejected} color="text-red-600" bgColor="bg-red-50" />
      </div>

      {/* Leave Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h4 className="font-semibold text-gray-900">Leave History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dates</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No leave records found
                  </td>
                </tr>
              ) : (
                leaves.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        leave.leaveType === 'Sick Leave' ? 'bg-red-100 text-red-800' :
                        leave.leaveType === 'Annual Leave' ? 'bg-green-100 text-green-800' :
                        leave.leaveType === 'Casual Leave' ? 'bg-blue-100 text-blue-800' :
                        leave.leaveType === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {!leave.isHalfDay && (
                        <> - {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {leave.isHalfDay ? '0.5' : leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge status={leave.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Lates Tab
function LatesTab({ lates, employee }) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  const currentMonthLates = lates.filter(l => {
    const date = new Date(l.date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })

  const stats = {
    total: currentMonthLates.length,
    pending: currentMonthLates.filter(l => l.status === 'Pending').length,
    approved: currentMonthLates.filter(l => l.status === 'Approved').length,
    rejected: currentMonthLates.filter(l => l.status === 'Rejected').length,
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total This Month" value={stats.total} color="text-orange-600" bgColor="bg-orange-50" />
        <StatBox label="Pending" value={stats.pending} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatBox label="Approved" value={stats.approved} color="text-green-600" bgColor="bg-green-50" />
        <StatBox label="Rejected" value={stats.rejected} color="text-red-600" bgColor="bg-red-50" />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Late Policy</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• First 2 lates per month: No deduction (grace period)</li>
          <li>• 3rd late onwards: 1 day annual leave OR 1 day salary deducted</li>
          <li>• Approved lates: No deduction</li>
          <li>• If annual leave exhausted: Salary deducted</li>
        </ul>
      </div>

      {/* Late Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h4 className="font-semibold text-gray-900">Late History (Current Month)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Late Minutes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentMonthLates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No late records for this month
                  </td>
                </tr>
              ) : (
                currentMonthLates.sort((a, b) => new Date(b.date) - new Date(a.date)).map((late, index) => (
                  <tr key={late._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(late.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-orange-600 font-semibold">
                      {late.lateMinutes} min
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {late.reason}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge status={late.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {late.isDeducted ? (
                        <span className={`text-xs ${
                          late.deductionType === 'Leave' ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {late.deductionType === 'Leave' 
                            ? `${late.deductionAmount} day leave` 
                            : `৳${Math.round(late.deductionAmount)}`
                          }
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {index < 2 ? 'Grace period' : 'Pending'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Payroll Tab
function PayrollTab({ payrolls, employee }) {
  return (
    <div className="space-y-6">
      {payrolls.length === 0 ? (
        <div className="text-center py-12">
          <TbCurrencyTaka className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No payroll records found</p>
        </div>
      ) : (
        payrolls.sort((a, b) => new Date(b.month) - new Date(a.month)).map((payroll) => {
          const monthName = new Date(payroll.month).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })
          
          return (
            <div key={payroll._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{monthName}</h3>
                  <Badge status={payroll.status} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Net Salary</p>
                  <p className="text-2xl font-bold text-green-600">৳{payroll.netSalary?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Earnings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Earnings</h4>
                  <div className="space-y-2">
                    <SalaryRow label="Basic Salary" amount={payroll.basicSalary} />
                    <SalaryRow label="Allowances" amount={payroll.totalAllowances} />
                    <div className="border-t border-gray-300 pt-2">
                      <SalaryRow label="Gross" amount={payroll.grossSalary} bold />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Deductions</h4>
                  <div className="space-y-2">
                    {payroll.deductions?.absent > 0 && (
                      <SalaryRow label="Absent" amount={payroll.deductions.absent} isDeduction />
                    )}
                    {payroll.deductions?.halfDay > 0 && (
                      <SalaryRow label="Half Day" amount={payroll.deductions.halfDay} isDeduction />
                    )}
                    {payroll.deductions?.late > 0 && (
                      <SalaryRow label="Late" amount={payroll.deductions.late} isDeduction />
                    )}
                    <div className="border-t border-gray-300 pt-2">
                      <SalaryRow label="Total" amount={payroll.totalDeductions} bold isDeduction />
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Attendance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Present:</span>
                      <span className="font-semibold text-green-600">{payroll.attendance?.present || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Absent:</span>
                      <span className="font-semibold text-red-600">{payroll.attendance?.absent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Leave:</span>
                      <span className="font-semibold text-blue-600">{payroll.attendance?.leave || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Half Day:</span>
                      <span className="font-semibold text-orange-600">{payroll.attendance?.halfDay || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Late:</span>
                      <span className="font-semibold text-yellow-600">{payroll.attendance?.late || 0}</span>
                    </div>
                    {payroll.overtime?.hours > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Overtime:</span>
                        <span className="font-semibold">{payroll.overtime.hours}h</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Adjustments */}
              {payroll.adjustments && payroll.adjustments.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Adjustments</h4>
                  <div className="space-y-1">
                    {payroll.adjustments.map((adj, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{adj.description}</span>
                        <span className={adj.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {adj.amount >= 0 ? '+' : ''}৳{adj.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// Helper Components
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function SalaryRow({ label, amount, bold, isDeduction }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${bold ? 'font-bold' : ''} text-gray-700`}>{label}</span>
      <span className={`${bold ? 'font-bold text-lg' : ''} ${isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
        {isDeduction && '-'}৳{amount?.toLocaleString()}
      </span>
    </div>
  )
}

function StatBox({ label, value, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-center`}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function LeaveBalanceCard({ label, value, total }) {
  const percentage = total === '∞' ? 100 : (value / total) * 100
  
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value}{total !== '∞' && `/${total}`}
      </p>
      {total !== '∞' && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full ${
              percentage > 50 ? 'bg-green-500' : 
              percentage > 20 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}