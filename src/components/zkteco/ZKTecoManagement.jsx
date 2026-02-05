'use client'

import { useState } from 'react'
import { apiCall } from '@/lib/api'
import Button from '@/components/common/Button'
import { RefreshCw, Server, Users, Trash2, Info } from 'lucide-react'

export default function ZKTecoManagement() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)
    
    try {
      const response = await apiCall('/zkteco/sync', {
        method: 'POST',
      })
      
      setResult(response)
      alert('Sync completed successfully!')
    } catch (error) {
      alert('Sync failed: ' + error.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Server className="w-6 h-6" />
        ZKTeco Device Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {syncing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Sync Attendance
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Sync Results:</h3>
          {result.results?.map((deviceResult, idx) => (
            <div key={idx} className="text-sm text-green-800 mb-2">
              <p className="font-medium">{deviceResult.device}:</p>
              <p>Processed: {deviceResult.processed} | Errors: {deviceResult.errors}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}