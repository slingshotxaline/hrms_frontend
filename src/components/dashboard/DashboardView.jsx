'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiCall } from '@/lib/api'
import StatsCard from './StatsCard'

import Loading from '@/components/common/Loading'
import { Users, Clock, Calendar, AlertCircle, DollarSign } from 'lucide-react'
import OfficeCalendar from '../OfficeCalendar/OfficeCalendar'
import QuickActionsModal from './QuickActionsModal'

export default function DashboardView() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    lateToday: 0,
    totalPayroll: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get today's date in Bangladesh timezone
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      console.log('📊 Fetching dashboard data for:', todayStr)

      // Fetch all required data in parallel
      const [
        employeesData,
        attendanceData,
        leavesData,
        payrollData
      ] = await Promise.all([
        apiCall('/employees'),
        apiCall(`/attendance?startDate=${todayStr}&endDate=${todayStr}`),
        apiCall(`/leaves?status=Approved&startDate=${todayStr}&endDate=${todayStr}`),
        apiCall('/payroll').catch(() => [])
      ])

      console.log('✅ Employees:', employeesData.length)
      console.log('✅ Attendance today:', attendanceData.length)
      console.log('✅ Leaves today:', leavesData.length)

      // Count present employees
      const presentCount = attendanceData.filter(a => a.status === 'Present').length

      // Count late employees
      const lateCount = attendanceData.filter(a => 
        a.status === 'Present' && a.lateMinutes > 0
      ).length

      // Count employees on leave today
      const onLeaveCount = leavesData.length

      // Calculate total payroll for current month
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const currentMonthPayroll = payrollData.filter(p => {
        const payrollDate = new Date(p.month)
        return payrollDate.getMonth() === currentMonth && 
               payrollDate.getFullYear() === currentYear
      })

      const totalPayroll = currentMonthPayroll.reduce((sum, p) => sum + (p.netSalary || 0), 0)

      setStats({
        totalEmployees: employeesData.length,
        presentToday: presentCount,
        onLeave: onLeaveCount,
        lateToday: lateCount,
        totalPayroll: totalPayroll,
      })

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700 mt-2">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate attendance percentage
  const attendancePercentage = stats.totalEmployees > 0
    ? ((stats.presentToday / stats.totalEmployees) * 100).toFixed(1)
    : 0

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `৳${(amount / 10000000).toFixed(2)}Cr`
    } else if (amount >= 100000) {
      return `৳${(amount / 100000).toFixed(2)}L`
    } else if (amount >= 1000) {
      return `৳${(amount / 1000).toFixed(1)}K`
    } else {
      return `৳${amount.toLocaleString()}`
    }
  }

  const statsCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      icon: Users,
      color: 'bg-blue-500',
      subtitle: 'Active employees',
    },
    {
      title: 'Present Today',
      value: stats.presentToday.toString(),
      icon: Clock,
      color: 'bg-green-500',
      subtitle: `${attendancePercentage}% attendance`,
    },
    {
      title: 'On Leave',
      value: stats.onLeave.toString(),
      icon: Calendar,
      color: 'bg-yellow-500',
      subtitle: 'Approved leaves today',
    },
    {
      title: 'Late Today',
      value: stats.lateToday.toString(),
      icon: AlertCircle,
      color: 'bg-red-500',
      subtitle: 'Employees late',
    },
  ]

  // Add payroll card for Admin/HR
  if (user?.role === 'Admin' || user?.role === 'HR') {
    statsCards.push({
      title: 'Payroll This Month',
      value: formatCurrency(stats.totalPayroll),
      icon: DollarSign,
      color: 'bg-purple-500',
      subtitle: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-indigo-100">
          Here&apos;s what&apos;s happening with your organization today
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
          <span className="px-3 py-1 bg-white/20 rounded-full">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${
        statsCards.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
      } gap-6`}>
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today&apos;s Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendance Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Attendance
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Employees:</span>
                <span className="font-bold text-gray-900">{stats.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Present:</span>
                <span className="font-bold text-green-600">{stats.presentToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Absent:</span>
                <span className="font-bold text-red-600">
                  {stats.totalEmployees - stats.presentToday - stats.onLeave}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attendance Rate:</span>
                <span className="font-bold text-indigo-600">{attendancePercentage}%</span>
              </div>
            </div>
          </div>

          {/* Leave Summary */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              Leaves
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">On Leave Today:</span>
                <span className="font-bold text-yellow-600">{stats.onLeave}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available:</span>
                <span className="font-bold text-green-600">
                  {stats.totalEmployees - stats.onLeave}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Availability:</span>
                <span className="font-bold text-indigo-600">
                  {stats.totalEmployees > 0 
                    ? (((stats.totalEmployees - stats.onLeave) / stats.totalEmployees) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Punctuality Summary */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border-2 border-red-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Punctuality
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Late Today:</span>
                <span className="font-bold text-red-600">{stats.lateToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">On Time:</span>
                <span className="font-bold text-green-600">
                  {stats.presentToday - stats.lateToday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Punctuality Rate:</span>
                <span className="font-bold text-indigo-600">
                  {stats.presentToday > 0
                    ? (((stats.presentToday - stats.lateToday) / stats.presentToday) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Takes 2 columns */}
        <div className="lg:col-span-2">
          <OfficeCalendar userRole={user?.role} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActionsModal />
        </div>
      </div>
    </div>
  )
}