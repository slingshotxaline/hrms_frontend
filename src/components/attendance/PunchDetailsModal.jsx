import { X, Clock, LogIn, LogOut, MapPin, Smartphone } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { formatTime } from '@/lib/utils'

export default function PunchDetailsModal({ record, onClose }) {
  const punches = record.punches || []
  
  // Sort punches by timestamp
  const sortedPunches = [...punches].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  )

  // Calculate break periods
  const breakPeriods = []
  for (let i = 0; i < sortedPunches.length - 1; i++) {
    const currentPunch = sortedPunches[i]
    const nextPunch = sortedPunches[i + 1]
    
    if (currentPunch.type === 'OUT' && nextPunch.type === 'IN') {
      const breakStart = new Date(currentPunch.timestamp)
      const breakEnd = new Date(nextPunch.timestamp)
      const breakMinutes = Math.floor((breakEnd - breakStart) / (1000 * 60))
      
      breakPeriods.push({
        start: currentPunch.timestamp,
        end: nextPunch.timestamp,
        minutes: breakMinutes
      })
    }
  }

  const grossHours = record.inTime && record.outTime 
    ? ((new Date(record.outTime) - new Date(record.inTime)) / (1000 * 60 * 60)).toFixed(1)
    : 0

  const netHours = ((record.netWorkingMinutes || 0) / 60).toFixed(1)
  const breakHours = ((record.totalBreakMinutes || 0) / 60).toFixed(1)

  return (
    <Modal onClose={onClose} size="large">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Punch Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {record.employee?.firstName} {record.employee?.lastName} ({record.employee?.employeeCode})
            </p>
            <p className="text-sm text-gray-500">
              {new Date(record.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-indigo-700 font-medium">Total Time</span>
            </div>
            <p className="text-2xl font-bold text-indigo-900">{grossHours}h</p>
            <p className="text-xs text-indigo-600">First IN to Last OUT</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Working Time</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{netHours}h</p>
            <p className="text-xs text-green-600">Excluding breaks</p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 font-medium">Break Time</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{breakHours}h</p>
            <p className="text-xs text-amber-600">{breakPeriods.length} breaks taken</p>
          </div>
        </div>

        {/* Punch Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Punch Timeline</h3>
          <div className="space-y-3">
            {sortedPunches.map((punch, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                  punch.type === 'IN'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  punch.type === 'IN' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {punch.type === 'IN' ? (
                    <LogIn className="w-5 h-5 text-white" />
                  ) : (
                    <LogOut className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${
                      punch.type === 'IN' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {formatTime(punch.timestamp)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      punch.type === 'IN'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}>
                      Punch {punch.type}
                    </span>
                    {index === 0 && punch.type === 'IN' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">
                        Office Entry
                      </span>
                    )}
                    {index === sortedPunches.length - 1 && punch.type === 'OUT' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-200 text-purple-800">
                        Office Exit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {punch.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{punch.location}</span>
                      </div>
                    )}
                    {punch.deviceId && (
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>{punch.deviceId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Break Periods */}
        {breakPeriods.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Periods</h3>
            <div className="space-y-2">
              {breakPeriods.map((breakPeriod, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatTime(breakPeriod.start)} - {formatTime(breakPeriod.end)}
                      </p>
                      <p className="text-xs text-gray-600">Break duration</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-900">
                      {breakPeriod.minutes} min
                    </p>
                    <p className="text-xs text-amber-600">
                      {(breakPeriod.minutes / 60).toFixed(1)}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}