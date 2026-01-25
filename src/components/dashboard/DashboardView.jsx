'use client'

import { useState, useEffect } from 'react'
import { apiCall } from '@/lib/api'
import StatsCard from './StatsCard'
import QuickActions from './QuickActions'
import RecentActivity from './RecentActivity'
import Loading from '@/components/common/Loading'
import { Users, Check, Calendar, DollarSign } from 'lucide-react'

export default function DashboardView() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    thisMonthPayroll: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const [employees, attendance, leaves] = await Promise.all([
        apiCall('/employees'),
        apiCall(`/attendance?startDate=${today}&endDate=${today}`),
        apiCall('/leaves'),
      ])

      setStats({
        totalEmployees: employees.length,
        presentToday: attendance.filter(a => a.status === 'Present').length,
        pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
        thisMonthPayroll: 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  const statCards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'bg-blue-500' },
    { title: 'Present Today', value: stats.presentToday, icon: Check, color: 'bg-green-500' },
    { title: 'Pending Leaves', value: stats.pendingLeaves, icon: Calendar, color: 'bg-orange-500' },
    { title: 'Payroll (Month)', value: `$${stats.thisMonthPayroll}`, icon: DollarSign, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  )
}