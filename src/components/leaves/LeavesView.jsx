"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/lib/api";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import LeaveTable from "./LeaveTable";
import ApplyLeaveModal from "./ApplyLeaveModal";
import RejectLeaveModal from "./RejectLeaveModal";
import { Calendar, Plus, Filter } from "lucide-react";

export default function LeavesView() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [myEmployee, setMyEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const isAdmin = user?.role === "Admin";
  const isHR = user?.role === "HR";
  const isLeader = ["Business Lead", "Team Lead"].includes(user?.role);
  const canViewAll = isAdmin || isHR;

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching leave data...");

      // Get user profile to check employeeId
      const profile = await apiCall("/auth/profile");
      console.log("👤 User profile:", profile);

      // Get leaves based on filter
      const query = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const leavesData = await apiCall(`/leaves${query}`);

      console.log(`📋 Fetched ${leavesData.length} leaves`);
      console.log("Leaves data:", leavesData);

      setLeaves(leavesData);

      // Get my employee record if exists
      if (profile.employeeId) {
        const empId = profile.employeeId._id || profile.employeeId;
        const empData = await apiCall(`/employees/${empId}`);
        setMyEmployee(empData);
        console.log("✅ My employee data:", empData);
      }

      // Get all employees if admin/HR
      if (canViewAll) {
        const employeesData = await apiCall("/employees");
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error("❌ Error fetching leaves:", error);
      alert("Error loading leave data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    if (!confirm("Are you sure you want to approve this leave request?")) {
      return;
    }

    try {
      console.log(`✅ Approving leave ${leaveId}`);

      await apiCall(`/leaves/${leaveId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Approved" }),
      });

      alert("Leave approved successfully!");
      fetchData();
    } catch (error) {
      console.error("❌ Error approving leave:", error);
      alert("Error approving leave: " + error.message);
    }
  };

  const handleReject = (leaveId) => {
    console.log(`❌ Opening reject modal for leave ${leaveId}`);
    setSelectedLeave(leaveId);
    setShowRejectModal(true);
  };

  const confirmReject = async (rejectionReason) => {
    try {
      console.log(`❌ Rejecting leave ${selectedLeave}`);

      await apiCall(`/leaves/${selectedLeave}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "Rejected",
          rejectionReason,
        }),
      });

      alert("Leave rejected successfully!");
      setShowRejectModal(false);
      setSelectedLeave(null);
      fetchData();
    } catch (error) {
      console.error("❌ Error rejecting leave:", error);
      alert("Error rejecting leave: " + error.message);
    }
  };

  const handleDelete = async (leaveId) => {
    if (!confirm("Are you sure you want to delete this leave request?")) {
      return;
    }

    try {
      await apiCall(`/leaves/${leaveId}`, {
        method: "DELETE",
      });

      alert("Leave request deleted successfully!");
      fetchData();
    } catch (error) {
      alert("Error deleting leave: " + error.message);
    }
  };

  if (loading) return <Loading />;

  // ✅ Check if user can approve - must be Admin, HR, or Leader
  const canApprove = isAdmin || isHR || isLeader;

  console.log("👤 User role:", user?.role);
  console.log("✅ Can approve?", canApprove);
  console.log("📋 Total leaves:", leaves.length);

  // Filter leaves based on current filter
  const filteredLeaves = leaves;

  // Statistics
  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            {canViewAll
              ? "Manage all employee leave requests"
              : isLeader
              ? "Manage your team leave requests"
              : "View and apply for leaves"}
          </p>
        </div>
        <Button onClick={() => setShowApplyModal(true)}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Apply Leave
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Requests"
          value={stats.total}
          color="bg-blue-500"
          icon={Calendar}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="bg-yellow-500"
          icon={Calendar}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          color="bg-green-500"
          icon={Calendar}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          color="bg-red-500"
          icon={Calendar}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("Pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === "Pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("Approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === "Approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("Rejected")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === "Rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Leave Balance (for employees) */}
      {myEmployee && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Your Leave Balance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BalanceCard
              label="Casual Leave"
              value={myEmployee.leaveBalance?.casual ?? 12}
              total={12}
            />
            <BalanceCard
              label="Sick Leave"
              value={myEmployee.leaveBalance?.sick ?? 12}
              total={12}
            />
            <BalanceCard
              label="Earned Leave"
              value={myEmployee.leaveBalance?.earned ?? 15}
              total={15}
            />
            <BalanceCard label="Unpaid Leave" value="Unlimited" isUnpaid />
          </div>
        </div>
      )}

      {/* Leave Table */}
      <LeaveTable
        leaves={filteredLeaves}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        canApprove={canApprove}
        currentUserId={user?._id}
      />

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <ApplyLeaveModal
          myEmployee={myEmployee}
          onClose={() => setShowApplyModal(false)}
          onSubmit={fetchData}
        />
      )}

      {/* Reject Leave Modal */}
      {showRejectModal && (
        <RejectLeaveModal
          onClose={() => {
            setShowRejectModal(false);
            setSelectedLeave(null);
          }}
          onConfirm={confirmReject}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ label, value, total, isUnpaid }) {
  const percentage = isUnpaid ? 100 : (value / total) * 100;

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
      <p className="text-sm text-white text-opacity-90 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white mb-2">
        {isUnpaid ? value : `${value} / ${total}`}
      </p>
      {!isUnpaid && (
        <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
