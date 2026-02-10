'use client'

import { Clock, LogIn, LogOut, MapPin, Smartphone, Coffee } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { formatTime } from '@/lib/utils'

export default function PunchDetailsModal({ isOpen, record, onClose }) {
  if (!record) return null

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
    : '0.0'

  const netHours = ((record.netWorkingMinutes || 0) / 60).toFixed(1)
  const breakHours = ((record.totalBreakMinutes || 0) / 60).toFixed(1)

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Punch Details - ${record.employee?.firstName} ${record.employee?.lastName}`}
      size="lg"
    >
      {/* Employee Info */}
      <div className="mb-6 p-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-black">Employee Code</p>
            <p className="text-lg font-bold text-black">{record.employee?.employeeCode}</p>
          </div>
          <div>
            <p className="text-sm text-black">Date</p>
            <p className="text-lg font-bold text-black">
              {new Date(record.date).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-indigo-700 font-medium">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">{grossHours}h</p>
          <p className="text-xs text-indigo-600">First IN to Last OUT</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Working Time</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{netHours}h</p>
          <p className="text-xs text-green-600">Excluding breaks</p>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">Break Time</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">{breakHours}h</p>
          <p className="text-xs text-amber-600">{breakPeriods.length} break(s) taken</p>
        </div>
      </div>

      {/* Punch Timeline */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Punch Timeline ({sortedPunches.length} punches)
        </h3>
        
        {sortedPunches.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Clock className="w-12 h-12 text-black mx-auto mb-2" />
            <p className="text-black">No punches recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPunches.map((punch, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  punch.type === 'IN'
                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                    : 'border-red-200 bg-red-50 hover:bg-red-100'
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
                  <div className="flex items-center gap-3 flex-wrap">
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
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800 flex items-center gap-1">
                        <LogIn className="w-3 h-3" />
                        Office Entry
                      </span>
                    )}
                    {index === sortedPunches.length - 1 && punch.type === 'OUT' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-200 text-purple-800 flex items-center gap-1">
                        <LogOut className="w-3 h-3" />
                        Office Exit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-black">
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
        )}
      </div>

      {/* Break Periods */}
      {breakPeriods.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Break Periods ({breakPeriods.length})
          </h3>
          <div className="space-y-2">
            {breakPeriods.map((breakPeriod, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-amber-50 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {formatTime(breakPeriod.start)} - {formatTime(breakPeriod.end)}
                    </p>
                    <p className="text-xs text-black">Break duration</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-900">
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

      {/* Summary Section */}
      {sortedPunches.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-black mb-2">Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-black">First Punch:</span>
              <span className="ml-2 font-semibold text-black">
                {formatTime(sortedPunches[0].timestamp)} ({sortedPunches[0].type})
              </span>
            </div>
            <div>
              <span className="text-black">Last Punch:</span>
              <span className="ml-2 font-semibold text-black">
                {formatTime(sortedPunches[sortedPunches.length - 1].timestamp)} ({sortedPunches[sortedPunches.length - 1].type})
              </span>
            </div>
            <div>
              <span className="text-black">Total Punches:</span>
              <span className="ml-2 font-semibold text-black">
                {sortedPunches.length}
              </span>
            </div>
            <div>
              <span className="text-black">Net Productive Time:</span>
              <span className="ml-2 font-semibold text-green-600">
                {netHours}h
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}