'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '@/lib/api'
import Loading from '@/components/common/Loading'
import { Shield, Users, CheckCircle, Clock, Calendar, TrendingUp, Award } from 'lucide-react'

export default function AdminInfoTab({ profile, employee }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [employees, leaves, payrolls] = await Promise.all([
        apiCall('/employees'),
        apiCall('/leaves'),
        apiCall('/payroll'),
      ])

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.isActive).length,
        pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
        approvedLeaves: leaves.filter(l => l.status === 'Approved').length,
        rejectedLeaves: leaves.filter(l => l.status === 'Rejected').length,
        totalPayrollsGenerated: payrolls.length,
        paidPayrolls: payrolls.filter(p => p.status === 'Paid').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  const isAdmin = profile.role === 'Admin'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Role Badge */}
      <div className={`bg-gradient-to-r ${
        isAdmin ? 'from-black to-gray-900' : 'from-blue-500 to-cyan-500'
      } rounded-xl p-6 mb-8 text-white`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">
              {isAdmin ? 'System Administrator' : 'HR Manager'}
            </h3>
            <p className="text-white/80 mt-1">
              {isAdmin 
                ? 'Full system access and control' 
                : 'Employee management and HR operations'}
            </p>
          </div>
        </div>
      </div>

      {/* Responsibilities */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Responsibilities & Permissions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(isAdmin ? adminResponsibilities : hrResponsibilities).map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-black">{item.title}</p>
                <p className="text-sm text-black mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          System Overview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Employees"
            value={stats.totalEmployees}
            subValue={`${stats.activeEmployees} Active`}
            color="bg-blue-500"
          />
          <StatCard
            icon={Clock}
            label="Pending Leaves"
            value={stats.pendingLeaves}
            subValue="Awaiting approval"
            color="bg-orange-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Approved Leaves"
            value={stats.approvedLeaves}
            subValue="This period"
            color="bg-green-500"
          />
          <StatCard
            icon={Calendar}
            label="Payrolls Generated"
            value={stats.totalPayrollsGenerated}
            subValue={`${stats.paidPayrolls} Paid`}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-lg font-bold text-black mb-4">Quick Access</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            title="Employee Management"
            description="Add, edit, and manage employee records"
            link="/dashboard/employees"
            icon={Users}
            color="from-blue-500 to-cyan-500"
          />
          <QuickActionCard
            title="Leave Approvals"
            description="Review and approve pending leave requests"
            link="/dashboard/leaves"
            icon={Calendar}
            color="from-green-500 to-emerald-500"
          />
          <QuickActionCard
            title="Payroll Management"
            description="Generate and manage employee payrolls"
            link="/dashboard/payroll"
            icon={TrendingUp}
            color="from-purple-500 to-pink-500"
          />
          <QuickActionCard
            title="Attendance Records"
            description="View and manage attendance data"
            link="/dashboard/attendance"
            icon={Clock}
            color="from-orange-500 to-red-500"
          />
        </div>
      </div>

      {/* Employee Info (if they have an employee record) */}
      {employee && (
        <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
          <h4 className="font-semibold text-indigo-900 mb-3">Your Employee Record</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem label="Employee Code" value={employee.employeeCode} />
            <InfoItem label="Department" value={employee.department} />
            <InfoItem label="Designation" value={employee.designation} />
            <InfoItem label="Joining Date" value={new Date(employee.joiningDate).toLocaleDateString()} />
          </div>
        </div>
      )}
    </div>
  )
}

// Responsibilities Data
const adminResponsibilities = [
  {
    title: 'User Management',
    description: 'Create, edit, and delete user accounts for all roles'
  },
  {
    title: 'System Configuration',
    description: 'Configure system settings and manage access controls'
  },
  {
    title: 'Employee Records',
    description: 'Full access to all employee information and records'
  },
  {
    title: 'Password Reset',
    description: 'Reset passwords for any user in the system'
  },
  {
    title: 'Payroll Management',
    description: 'Generate, approve, and manage all payroll operations'
  },
  {
    title: 'Leave Approvals',
    description: 'Approve or reject leave requests from any employee'
  },
  {
    title: 'Holiday Management',
    description: 'Declare and manage company holidays'
  },
  {
    title: 'Reports & Analytics',
    description: 'Access all system reports and analytics'
  },
]

const hrResponsibilities = [
  {
    title: 'Employee Onboarding',
    description: 'Create and manage new employee records'
  },
  {
    title: 'User Account Creation',
    description: 'Create user accounts for new employees'
  },
  {
    title: 'Leave Management',
    description: 'Approve or reject employee leave requests'
  },
  {
    title: 'Attendance Tracking',
    description: 'Monitor and manage employee attendance'
  },
  {
    title: 'Payroll Processing',
    description: 'Generate and process monthly payrolls'
  },
  {
    title: 'Holiday Declaration',
    description: 'Declare and manage company holidays'
  },
  {
    title: 'Employee Records',
    description: 'View and update employee information'
  },
  {
    title: 'HR Reports',
    description: 'Access HR-related reports and data'
  },
]

// Helper Components
function StatCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-black">{value}</p>
      <p className="text-xs text-black mt-1">{label}</p>
      <p className="text-xs text-black mt-1">{subValue}</p>
    </div>
  )
}

function QuickActionCard({ title, description, link, icon: Icon, color }) {
  return (
    <a
      href={link}
      className={`block p-6 bg-gradient-to-r ${color} rounded-xl text-white hover:shadow-xl transition-all transform hover:scale-105`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-lg">{title}</h5>
          <p className="text-sm text-white/80 mt-1">{description}</p>
        </div>
      </div>
    </a>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-indigo-600 font-medium">{label}</p>
      <p className="text-sm font-semibold text-indigo-900 mt-0.5">{value}</p>
    </div>
  )
}