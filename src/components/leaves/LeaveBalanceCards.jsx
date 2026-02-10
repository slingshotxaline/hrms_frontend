export default function LeaveBalanceCards({ leaveBalance, employeeName }) {
    const leaveTypes = [
      { key: 'CL', label: 'Casual Leave', color: 'from-blue-500 to-blue-600' },
      { key: 'SL', label: 'Sick Leave', color: 'from-green-500 to-green-600' },
      { key: 'EL', label: 'Earned Leave', color: 'from-purple-500 to-purple-600' },
    ]
  
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black mb-4">{employeeName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaveTypes.map(({ key, label, color }) => {
            const { total, taken } = leaveBalance[key]
            const remaining = total - taken
            const percentage = total > 0 ? (taken / total) * 100 : 0
  
            return (
              <div 
                key={key} 
                className={`bg-linear-to-br ${color} rounded-xl shadow-lg p-6 text-white`}
              >
                <h3 className="text-lg font-semibold mb-3">{label}</h3>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold">{remaining}</span>
                  <span className="text-white/80">/ {total} days</span>
                </div>
  
                <div className="w-full bg-white/30 rounded-full h-2 mb-3">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
  
                <div className="flex justify-between text-sm">
                  <span className="text-white/90">Used: {taken} days</span>
                  <span className="text-white/90">Remaining: {remaining} days</span>
                </div>
              </div>
            )
          })}
        </div>
  
        {/* Unpaid Leave Info */}
        {leaveBalance.Unpaid.taken > 0 && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>Unpaid Leave Taken:</strong> {leaveBalance.Unpaid.taken} days
            </p>
          </div>
        )}
      </div>
    )
  }