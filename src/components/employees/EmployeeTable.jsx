import { Edit } from 'lucide-react'

export default function EmployeeTable({ employees, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Designation</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Salary</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.employeeCode}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.firstName} {employee.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.department}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.designation}</td>
                <td className="px-6 py-4 text-sm text-gray-700">${employee.basicSalary}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onEdit(employee)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}