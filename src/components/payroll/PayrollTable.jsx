import Badge from "@/components/common/Badge";
import { Download } from "lucide-react";

export default function PayrollTable({ payrolls }) {
  const calculateTotals = (payroll) => {
    const totalAllowances =
      (payroll.allowances?.houseRent || 0) +
      (payroll.allowances?.medical || 0) +
      (payroll.allowances?.transport || 0) +
      (payroll.allowances?.other || 0);

    const totalDeductions =
      (payroll.deductions?.tax || 0) +
      (payroll.deductions?.providentFund || 0) +
      (payroll.deductions?.absent || 0) +
      (payroll.deductions?.late || 0) +
      (payroll.deductions?.other || 0);

    return { totalAllowances, totalDeductions };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Employee
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Basic Salary
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Allowances
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Deductions
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Net Salary
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payrolls.map((payroll) => {
              const { totalAllowances, totalDeductions } =
                calculateTotals(payroll);

              return (
                <tr
                  key={payroll._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-black">
                    {payroll.employee?.firstName} {payroll.employee?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {payroll.employee?.employeeCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    ${payroll.basicSalary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    +${totalAllowances.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    {/* -${totalDeductions.toLocaleString()} */}
                    <div className="space-y-1">
                      {payroll.deductions.absent > 0 && (
                        <p className="text-xs text-red-600">
                          Absent: ৳{payroll.deductions.absent.toLocaleString()}
                        </p>
                      )}
                      {payroll.deductions.halfDay > 0 && (
                        <p className="text-xs text-red-600">
                          Half Day: ৳
                          {payroll.deductions.halfDay.toLocaleString()}
                        </p>
                      )}
                      {/* ✅ ADD THIS */}
                      {payroll.deductions.late > 0 && (
                        <p className="text-xs text-red-600">
                          Late: ৳{payroll.deductions.late.toLocaleString()}
                        </p>
                      )}
                      {payroll.attendance?.late > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          {payroll.attendance.late} late day(s)
                          {payroll.attendance.lateApproved > 0 && (
                            <span className="text-green-600">
                              ({payroll.attendance.lateApproved} approved)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                    ${payroll.netSalary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge status={payroll.status} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Download Payslip"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
