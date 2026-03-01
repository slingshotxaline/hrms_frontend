'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { Calendar, AlertCircle, TrendingDown } from 'lucide-react'

export default function ApplyLeaveModal({ onClose, onSuccess, monthlyUsage }) {
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalDays, setTotalDays] = useState(0)
  const [limitWarning, setLimitWarning] = useState('') // ✅ NEW

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      setTotalDays(days > 0 ? days : 0)

      // ✅ Check monthly limits
      checkMonthlyLimits(formData.leaveType, days)
    }
  }, [formData.startDate, formData.endDate, formData.leaveType])

  const checkMonthlyLimits = (leaveType, days) => {
    if (!monthlyUsage) return

    setLimitWarning('')

    if (leaveType === 'Annual Leave') {
      const remaining = monthlyUsage.remaining.annual
      if (days > remaining) {
        setLimitWarning(`⚠️ You can only take ${remaining} more day(s) of Annual Leave this month (2 days/month limit)`)
      }
    }

    if (leaveType === 'Casual Leave') {
      const remaining = monthlyUsage.remaining.casual
      if (days > 5) {
        setLimitWarning(`⚠️ Casual Leave cannot exceed 5 days at a time`)
      } else if (days > remaining) {
        setLimitWarning(`⚠️ You can only take ${remaining} more day(s) of Casual Leave this month (5 days/month limit)`)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (limitWarning) {
      setError(limitWarning)
      return
    }

    if (formData.reason.trim().length < 10) {
      setError('Reason must be at least 10 characters')
      return
    }

    if (totalDays <= 0) {
      setError('End date must be after start date')
      return
    }

    // ✅ Check balance
    if (monthlyUsage) {
      const leaveTypeMap = {
        'Casual Leave': 'casual',
        'Sick Leave': 'sick',
        'Annual Leave': 'annual',
      }
      const balanceKey = leaveTypeMap[formData.leaveType]
      if (balanceKey && monthlyUsage.balance[balanceKey] < totalDays) {
        setError(`Insufficient ${formData.leaveType} balance. Available: ${monthlyUsage.balance[balanceKey]} days`)
        return
      }
    }

    setLoading(true)

    try {
      await apiCall('/leaves', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      alert('Leave application submitted successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to submit leave application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Apply for Leave" size="lg">
      <form onSubmit={handleSubmit}>
        {/* ✅ NEW: Leave Policy Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Leave Policy:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Total Leave: 30 days (10 Sick + 10 Annual + 10 Casual)</li>
            <li>• Annual Leave: Maximum 2 days per month</li>
            <li>• Casual Leave: Maximum 5 days at a time or per month</li>
            <li>• If annual leave is exhausted, salary will be deducted</li>
          </ul>
        </div>

        {/* Leave Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type <span className="text-red-500">*</span>
          </label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Annual Leave">Annual Leave</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </select>

          {/* ✅ Show balance for selected type */}
          {monthlyUsage && formData.leaveType !== 'Unpaid Leave' && (
            <p className="text-sm text-gray-600 mt-2">
              Available: {
                formData.leaveType === 'Casual Leave' ? monthlyUsage.balance.casual :
                formData.leaveType === 'Sick Leave' ? monthlyUsage.balance.sick :
                formData.leaveType === 'Annual Leave' ? monthlyUsage.balance.annual : 0
              } days
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Total Days Display */}
        {totalDays > 0 && (
          <div className="mb-6 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-900">
              <span className="font-semibold">Total Days:</span> {totalDays} day{totalDays !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* ✅ Limit Warning */}
        {limitWarning && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingDown className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700">{limitWarning}</p>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please provide a reason for your leave (minimum 10 characters)"
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.reason.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !!limitWarning}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Submit Leave
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}


// "use client";

// import { useState } from "react";
// import Modal from "@/components/common/Modal";
// import Button from "@/components/common/Button";
// import { apiCall } from "@/lib/api";
// import { Calendar, AlertCircle } from "lucide-react";

// export default function ApplyLeaveModal({ myEmployee, onClose, onSubmit }) {
//   const [formData, setFormData] = useState({
//     leaveType: "Casual Leave",
//     startDate: "",
//     endDate: "",
//     reason: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const leaveTypes = [
//     {
//       value: "Casual Leave",
//       label: "Casual Leave",
//       balance: myEmployee?.leaveBalance?.casual ?? 12,
//     },
//     {
//       value: "Sick Leave",
//       label: "Sick Leave",
//       balance: myEmployee?.leaveBalance?.sick ?? 12,
//     },
//     {
//       value: "Earned Leave",
//       label: "Earned Leave",
//       balance: myEmployee?.leaveBalance?.earned ?? 15,
//     },
//     { value: "Unpaid Leave", label: "Unpaid Leave", balance: "∞" },
//   ];

//   const calculateDays = () => {
//     if (!formData.startDate || !formData.endDate) return 0;

//     const start = new Date(formData.startDate);
//     const end = new Date(formData.endDate);
//     const diffTime = end - start;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//     return diffDays > 0 ? diffDays : 0;
//   };

//   const totalDays = calculateDays();

//   const selectedLeaveType = leaveTypes.find(
//     (lt) => lt.value === formData.leaveType
//   );
//   const hasInsufficientBalance =
//     formData.leaveType !== "Unpaid Leave" &&
//     totalDays > 0 &&
//     selectedLeaveType?.balance < totalDays;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Validation
//     if (!formData.startDate || !formData.endDate) {
//       setError("Please select both start and end dates");
//       return;
//     }

//     if (!formData.reason.trim()) {
//       setError("Please provide a reason for leave");
//       return;
//     }

//     if (formData.reason.trim().length < 10) {
//       setError("Reason must be at least 10 characters");
//       return;
//     }

//     if (totalDays <= 0) {
//       setError("End date must be after or equal to start date");
//       return;
//     }

//     if (hasInsufficientBalance) {
//       setError(
//         `Insufficient leave balance. Available: ${selectedLeaveType?.balance} days, Requested: ${totalDays} days`
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       await apiCall("/leaves", {
//         method: "POST",
//         body: JSON.stringify({
//           ...formData,
//           totalDays,
//         }),
//       });

//       alert("Leave application submitted successfully!");
//       onSubmit();
//       onClose();
//     } catch (error) {
//       console.error("Error applying leave:", error);
//       setError(error.message || "Failed to submit leave application");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setError("");
//   };

//   // Get today's date in YYYY-MM-DD format
//   const today = new Date().toISOString().split("T")[0];

//   return (
//     <Modal isOpen={true} onClose={onClose} title="Apply for Leave" size="lg">
//       <form onSubmit={handleSubmit}>
//         {/* Leave Balance Info */}
//         <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
//           <h4 className="text-sm font-semibold text-black mb-3">
//             Your Leave Balance
//           </h4>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             {leaveTypes.map((type) => (
//               <div
//                 key={type.value}
//                 className={`p-3 bg-white rounded-lg border-2 transition-all ${
//                   formData.leaveType === type.value
//                     ? "border-indigo-500 shadow-md"
//                     : "border-gray-200"
//                 }`}
//               >
//                 <p className="text-xs text-black mb-1">{type.label}</p>
//                 <p className="text-2xl font-bold text-indigo-600">
//                   {type.balance === "∞" ? "∞" : type.balance}
//                 </p>
//                 <p className="text-xs text-black">
//                   {type.balance === "∞" ? "Unlimited" : "days left"}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="space-y-4 mb-6">
//           {/* Leave Type */}
//           <div>
//             <label className="block text-sm font-medium text-black mb-2">
//               Leave Type <span className="text-red-500">*</span>
//             </label>
//             <select
//               name="leaveType"
//               value={formData.leaveType}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
//               required
//             >
//               {leaveTypes.map((type) => (
//                 <option key={type.value} value={type.value}>
//                   {type.label} (
//                   {type.balance === "∞"
//                     ? "Unlimited"
//                     : `${type.balance} days available`}
//                   )
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Date Range */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-black mb-2">
//                 Start Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="startDate"
//                 value={formData.startDate}
//                 onChange={handleChange}
//                 min={today}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-black mb-2">
//                 End Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="endDate"
//                 value={formData.endDate}
//                 onChange={handleChange}
//                 min={formData.startDate || today}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
//                 required
//               />
//             </div>
//           </div>

//           {/* Total Days Calculation */}
//           {totalDays > 0 && (
//             <div
//               className={`p-4 rounded-lg border-2 ${
//                 hasInsufficientBalance
//                   ? "bg-red-50 border-red-300"
//                   : "bg-green-50 border-green-300"
//               }`}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Calendar
//                     className={`w-5 h-5 ${
//                       hasInsufficientBalance ? "text-red-600" : "text-green-600"
//                     }`}
//                   />
//                   <span className="text-sm font-medium text-black">
//                     Total Leave Duration:
//                   </span>
//                 </div>
//                 <span
//                   className={`text-2xl font-bold ${
//                     hasInsufficientBalance ? "text-red-600" : "text-green-600"
//                   }`}
//                 >
//                   {totalDays} {totalDays === 1 ? "day" : "days"}
//                 </span>
//               </div>
//               {hasInsufficientBalance && (
//                 <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
//                   <AlertCircle className="w-4 h-4" />
//                   Insufficient balance! Available: {
//                     selectedLeaveType?.balance
//                   }{" "}
//                   days
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Reason */}
//           <div>
//             <label className="block text-sm font-medium text-black mb-2">
//               Reason for Leave <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               name="reason"
//               value={formData.reason}
//               onChange={handleChange}
//               placeholder="Please provide a brief reason for your leave request..."
//               rows={4}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-black"
//               required
//             />
//             <p className="text-xs text-black mt-1">
//               {formData.reason.length}/500 characters
//             </p>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <div className="flex items-start gap-2">
//               <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
//               <p className="text-sm text-red-700">{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Info Message */}
//         <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//           <div className="flex items-start gap-2">
//             <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
//             <div className="text-sm text-blue-700">
//               <p className="font-medium mb-1">Leave Approval Process:</p>
//               <p>
//                 Your leave request will be sent to your reporting manager, HR,
//                 and Admin for approval. You will be notified once your leave is
//                 approved or rejected.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-3 justify-end">
//           <Button
//             type="button"
//             onClick={onClose}
//             variant="outline"
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             disabled={loading || hasInsufficientBalance}
//             className="bg-black hover:bg-gray-700"
//           >
//             {loading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                 Submitting...
//               </>
//             ) : (
//               <>
//                 <div className="flex items-center">
//                   <Calendar className="w-4 h-4 mr-2" />
//                   Submit Leave Application
//                 </div>
//               </>
//             )}
//           </Button>
//         </div>
//       </form>
//     </Modal>
//   );
// }
