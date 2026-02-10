"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { apiCall } from "@/lib/api";
import { Calendar, AlertCircle } from "lucide-react";

export default function ApplyLeaveModal({ myEmployee, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const leaveTypes = [
    {
      value: "Casual Leave",
      label: "Casual Leave",
      balance: myEmployee?.leaveBalance?.casual ?? 12,
    },
    {
      value: "Sick Leave",
      label: "Sick Leave",
      balance: myEmployee?.leaveBalance?.sick ?? 12,
    },
    {
      value: "Earned Leave",
      label: "Earned Leave",
      balance: myEmployee?.leaveBalance?.earned ?? 15,
    },
    { value: "Unpaid Leave", label: "Unpaid Leave", balance: "∞" },
  ];

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays > 0 ? diffDays : 0;
  };

  const totalDays = calculateDays();

  const selectedLeaveType = leaveTypes.find(
    (lt) => lt.value === formData.leaveType
  );
  const hasInsufficientBalance =
    formData.leaveType !== "Unpaid Leave" &&
    totalDays > 0 &&
    selectedLeaveType?.balance < totalDays;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.startDate || !formData.endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please provide a reason for leave");
      return;
    }

    if (formData.reason.trim().length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }

    if (totalDays <= 0) {
      setError("End date must be after or equal to start date");
      return;
    }

    if (hasInsufficientBalance) {
      setError(
        `Insufficient leave balance. Available: ${selectedLeaveType?.balance} days, Requested: ${totalDays} days`
      );
      return;
    }

    setLoading(true);

    try {
      await apiCall("/leaves", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          totalDays,
        }),
      });

      alert("Leave application submitted successfully!");
      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error applying leave:", error);
      setError(error.message || "Failed to submit leave application");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal isOpen={true} onClose={onClose} title="Apply for Leave" size="lg">
      <form onSubmit={handleSubmit}>
        {/* Leave Balance Info */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-sm font-semibold text-black mb-3">
            Your Leave Balance
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {leaveTypes.map((type) => (
              <div
                key={type.value}
                className={`p-3 bg-white rounded-lg border-2 transition-all ${
                  formData.leaveType === type.value
                    ? "border-indigo-500 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <p className="text-xs text-black mb-1">{type.label}</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {type.balance === "∞" ? "∞" : type.balance}
                </p>
                <p className="text-xs text-black">
                  {type.balance === "∞" ? "Unlimited" : "days left"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
              required
            >
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} (
                  {type.balance === "∞"
                    ? "Unlimited"
                    : `${type.balance} days available`}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                required
              />
            </div>
          </div>

          {/* Total Days Calculation */}
          {totalDays > 0 && (
            <div
              className={`p-4 rounded-lg border-2 ${
                hasInsufficientBalance
                  ? "bg-red-50 border-red-300"
                  : "bg-green-50 border-green-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`w-5 h-5 ${
                      hasInsufficientBalance ? "text-red-600" : "text-green-600"
                    }`}
                  />
                  <span className="text-sm font-medium text-black">
                    Total Leave Duration:
                  </span>
                </div>
                <span
                  className={`text-2xl font-bold ${
                    hasInsufficientBalance ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {totalDays} {totalDays === 1 ? "day" : "days"}
                </span>
              </div>
              {hasInsufficientBalance && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Insufficient balance! Available: {
                    selectedLeaveType?.balance
                  }{" "}
                  days
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please provide a brief reason for your leave request..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-black"
              required
            />
            <p className="text-xs text-black mt-1">
              {formData.reason.length}/500 characters
            </p>
          </div>
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

        {/* Info Message */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Leave Approval Process:</p>
              <p>
                Your leave request will be sent to your reporting manager, HR,
                and Admin for approval. You will be notified once your leave is
                approved or rejected.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
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
            disabled={loading || hasInsufficientBalance}
            className="bg-black hover:bg-gray-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Submit Leave Application
                </div>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
