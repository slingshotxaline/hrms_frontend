import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { Download, Printer } from 'lucide-react'

export default function PayslipModal({ payroll, onClose }) {
  const calculateTotals = () => {
    const earnings = {
      basic: payroll.basicSalary || 0,
      houseRent: payroll.allowances?.houseRent || 0,
      medical: payroll.allowances?.medical || 0,
      transport: payroll.allowances?.transport || 0,
      other: payroll.allowances?.other || 0,
    }

    const deductions = {
      tax: payroll.deductions?.tax || 0,
      pf: payroll.deductions?.providentFund || 0,
      absent: payroll.deductions?.absent || 0,
      late: payroll.deductions?.late || 0,
      other: payroll.deductions?.other || 0,
    }

    const totalEarnings = Object.values(earnings).reduce((a, b) => a + b, 0)
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0)

    return { earnings, deductions, totalEarnings, totalDeductions }
  }

  const { earnings, deductions, totalEarnings, totalDeductions } = calculateTotals()
  const monthName = new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' })

  return (
    <Modal isOpen={true} onClose={onClose} title="Payslip" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold text-black">PAYSLIP</h2>
          <p className="text-black mt-1">{monthName} {payroll.year}</p>
        </div>

        {/* Employee Details */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-black">Employee Name</p>
            <p className="font-semibold text-black">
              {payroll.employee?.firstName} {payroll.employee?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-black">Employee Code</p>
            <p className="font-semibold text-black">{payroll.employee?.employeeCode}</p>
          </div>
          <div>
            <p className="text-sm text-black">Department</p>
            <p className="font-semibold text-black">{payroll.employee?.department}</p>
          </div>
          <div>
            <p className="text-sm text-black">Designation</p>
            <p className="font-semibold text-black">{payroll.employee?.designation}</p>
          </div>
        </div>

        {/* Earnings and Deductions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Earnings */}
          <div>
            <h3 className="font-bold text-black mb-3 pb-2 border-b">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-black">Basic Salary</span>
                <span className="font-semibold">${earnings.basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">House Rent</span>
                <span className="font-semibold">${earnings.houseRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Medical</span>
                <span className="font-semibold">${earnings.medical.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Transport</span>
                <span className="font-semibold">${earnings.transport.toLocaleString()}</span>
              </div>
              {earnings.other > 0 && (
                <div className="flex justify-between">
                  <span className="text-black">Other</span>
                  <span className="font-semibold">${earnings.other.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-green-600">
                <span>Total Earnings</span>
                <span>${totalEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-bold text-black mb-3 pb-2 border-b">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-black">Tax</span>
                <span className="font-semibold">${deductions.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Provident Fund</span>
                <span className="font-semibold">${deductions.pf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Absent Deduction</span>
                <span className="font-semibold">${deductions.absent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Late Deduction</span>
                <span className="font-semibold">${deductions.late.toLocaleString()}</span>
              </div>
              {deductions.other > 0 && (
                <div className="flex justify-between">
                  <span className="text-black">Other</span>
                  <span className="font-semibold">${deductions.other.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-red-600">
                <span>Total Deductions</span>
                <span>${totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-black">Net Salary</span>
            <span className="text-2xl font-bold text-indigo-600">
              ${payroll.netSalary?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2 inline" />
            Print
          </Button>
          <Button variant="primary" onClick={onClose}>
            <Download className="w-4 h-4 mr-2 inline" />
            Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  )
}