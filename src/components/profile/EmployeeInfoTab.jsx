import { useState } from 'react'
import { Briefcase, DollarSign, Clock, Calendar, TrendingUp } from 'lucide-react'

export default function EmployeeInfoTab({ employee }) {
  const [activeSection, setActiveSection] = useState('details')

  const totalAllowances =
    (employee.allowances?.houseRent || 0) +
    (employee.allowances?.medical || 0) +
    (employee.allowances?.transport || 0)

  const grossSalary = employee.basicSalary + totalAllowances

  return (
    <div className="max-w-3xl mx-auto">
      {/* Section Tabs */}
      <div className="flex gap-2 mb-6">
        {['details', 'salary', 'schedule'].map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeSection === section
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Details Section */}
      {activeSection === 'details' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-black mb-4">Employee Details</h3>
          <InfoRow icon={Briefcase} label="Employee Code" value={employee.employeeCode} />
          <InfoRow icon={Briefcase} label="Full Name" value={`${employee.firstName} ${employee.lastName}`} />
          <InfoRow icon={Briefcase} label="Department" value={employee.department} />
          <InfoRow icon={Briefcase} label="Designation" value={employee.designation} />
          <InfoRow 
            icon={Calendar} 
            label="Joining Date" 
            value={new Date(employee.joiningDate).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })} 
          />
          <InfoRow 
            icon={TrendingUp} 
            label="Status" 
            value={employee.isActive ? 'Active' : 'Inactive'}
            statusActive={employee.isActive}
          />
        </div>
      )}

      {/* Salary Section */}
      {activeSection === 'salary' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-black">Salary Breakdown</h3>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm">Monthly Gross Salary</p>
            <p className="text-4xl font-bold mt-1">${grossSalary.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <SalaryRow label="Basic Salary" amount={employee.basicSalary} />
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-black uppercase mb-3">Allowances</p>
              <div className="space-y-3 pl-4">
                <SalaryRow label="House Rent Allowance" amount={employee.allowances?.houseRent || 0} />
                <SalaryRow label="Medical Allowance" amount={employee.allowances?.medical || 0} />
                <SalaryRow label="Transport Allowance" amount={employee.allowances?.transport || 0} />
              </div>
            </div>
            <div className="border-t pt-4">
              <SalaryRow label="Total Allowances" amount={totalAllowances} highlight />
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <SalaryRow label="Gross Salary" amount={grossSalary} bold />
            </div>
          </div>
        </div>
      )}

      {/* Schedule Section */}
      {activeSection === 'schedule' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-black mb-4">Work Schedule</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-black">Shift Start</p>
                  <p className="text-2xl font-bold text-green-600">{employee.shiftStart}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-black">Shift End</p>
                  <p className="text-2xl font-bold text-red-600">{employee.shiftEnd}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="mt-6">
            <h4 className="font-semibold text-black mb-4">Weekly Schedule</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Timing</th>
                  </tr>
                </thead>
                <tbody>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const isWeekend = day === 'Saturday' || day === 'Sunday'
                    return (
                      <tr key={day} className={isWeekend ? 'bg-red-50' : 'bg-white'}>
                        <td className="px-6 py-3 text-sm font-medium text-black">{day}</td>
                        <td className="px-6 py-3 text-sm">
                          {isWeekend ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Off Day</span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Working Day</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-black">
                          {isWeekend ? '-' : `${employee.shiftStart} - ${employee.shiftEnd}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, statusActive }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-black">{label}</p>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-black">{value}</p>
          {statusActive !== undefined && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              statusActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {statusActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SalaryRow({ label, amount, bold, highlight }) {
  return (
    <div className={`flex justify-between items-center ${highlight ? 'text-indigo-600' : ''}`}>
      <span className={`text-black ${bold ? 'font-bold text-lg' : ''}`}>{label}</span>
      <span className={`${bold ? 'font-bold text-xl text-indigo-600' : 'font-semibold text-black'}`}>
        ${amount?.toLocaleString()}
      </span>
    </div>
  )
}