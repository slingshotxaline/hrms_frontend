'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'

export default function QuickActions() {
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        <Button 
          variant="primary" 
          className="w-full"
          onClick={() => router.push('/dashboard/attendance')}
        >
          Mark Attendance
        </Button>
        <Button 
          variant="success" 
          className="w-full"
          onClick={() => router.push('/dashboard/leaves')}
        >
          Apply Leave
        </Button>
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => router.push('/dashboard/payroll')}
        >
          View Payslip
        </Button>
      </div>
    </div>
  )
}