import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'

export default function MarkAttendanceModal({ employees, onClose, onMark }) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Mark Attendance"
      size="md"
    >
      <div className="space-y-4">
        {employees.map((emp) => (
          <div key={emp._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
              <p className="text-sm text-gray-600">{emp.employeeCode}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="success"
                onClick={() => {
                  onMark(emp.employeeCode, 'IN')
                  onClose()
                }}
              >
                IN
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onMark(emp.employeeCode, 'OUT')
                  onClose()
                }}
              >
                OUT
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}