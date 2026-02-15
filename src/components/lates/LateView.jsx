"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/lib/api";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import LateTable from "./LateTable";
import ApplyLateModal from "./ApplyLateModal";
import RejectLateModal from "./RejectLateModal";
import LateSettingsModal from "./LateSettingsModal";
import { Clock, Plus, Filter, Settings } from "lucide-react";

export default function LateView() {
  const { user } = useAuth();
  const [lates, setLates] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedLate, setSelectedLate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const isAdmin = user?.role === "Admin";
  const isHR = user?.role === "HR";
  const isLeader = ["Business Lead", "Team Lead"].includes(user?.role);
  const canApprove = isAdmin || isHR || isLeader;

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching late data...");

      // Get lates based on filter
      const query = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const latesData = await apiCall(`/lates${query}`);

      console.log(`📋 Fetched ${latesData.length} late applications`);
      setLates(latesData);

      // ✅ Get my late attendances (for applying) - ALL ROLES CAN APPLY
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      // ✅ Fetch attendances for current user
      const profile = await apiCall("/auth/profile");
      console.log("👤 Current user profile:", profile);

      if (profile.employeeId) {
        const empId = profile.employeeId._id || profile.employeeId;
        const attendanceData = await apiCall(
          `/attendance?startDate=${startDate}&endDate=${endDate}&employeeId=${empId}`
        );

        console.log(
          `📊 Fetched ${attendanceData.length} attendances for employee ${empId}`
        );

        // Filter only late attendances that don't have applications
        const lateAttendances = attendanceData.filter((a) => {
          const hasLateApp = latesData.some((l) => {
            const lateAttId = l.attendance?._id || l.attendance;
            return lateAttId === a._id;
          });
          return a.lateMinutes > 0 && !hasLateApp;
        });

        setAttendances(lateAttendances);
        console.log(
          `⏰ Found ${lateAttendances.length} unapplied late attendances`
        );
      }
    } catch (error) {
      console.error("❌ Error fetching lates:", error);
      alert("Error loading late data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (lateId) => {
    if (!confirm("Are you sure you want to approve this late application?")) {
      return;
    }

    try {
      console.log(`✅ Approving late ${lateId}`);

      await apiCall(`/lates/${lateId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Approved" }),
      });

      alert("Late approved successfully!");
      fetchData();
    } catch (error) {
      console.error("❌ Error approving late:", error);
      alert("Error approving late: " + error.message);
    }
  };

  const handleReject = (lateId) => {
    console.log(`❌ Opening reject modal for late ${lateId}`);
    setSelectedLate(lateId);
    setShowRejectModal(true);
  };

  const confirmReject = async (rejectionReason) => {
    try {
      console.log(`❌ Rejecting late ${selectedLate}`);

      await apiCall(`/lates/${selectedLate}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "Rejected",
          rejectionReason,
        }),
      });

      alert("Late rejected successfully!");
      setShowRejectModal(false);
      setSelectedLate(null);
      fetchData();
    } catch (error) {
      console.error("❌ Error rejecting late:", error);
      alert("Error rejecting late: " + error.message);
    }
  };

  const handleDelete = async (lateId) => {
    if (!confirm("Are you sure you want to delete this late application?")) {
      return;
    }

    try {
      await apiCall(`/lates/${lateId}`, {
        method: "DELETE",
      });

      alert("Late application deleted successfully!");
      fetchData();
    } catch (error) {
      alert("Error deleting late: " + error.message);
    }
  };

  if (loading) return <Loading />;

  // Statistics
  const stats = {
    total: lates.length,
    pending: lates.filter((l) => l.status === "Pending").length,
    approved: lates.filter((l) => l.status === "Approved").length,
    rejected: lates.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Late Management</h1>
          <p className="text-gray-600 mt-1">
            {canApprove
              ? "Manage employee late applications"
              : "View and apply for late approvals"}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button
              onClick={() => setShowSettingsModal(true)}
              variant="outline"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
          )}
          {/* ✅ FIX: Allow all roles to apply for late (not just non-admin/HR) */}
          {attendances.length > 0 && (
            <Button onClick={() => setShowApplyModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Apply for Late
            </Button>
          )}
        </div>
      </div>

      {/* ✅ FIX: Show warning for all roles */}
      {attendances.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">
                You have {attendances.length} unapplied late arrival(s) this
                month
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Apply for late approval to avoid deductions from your salary or
                leave balance.
              </p>
              <Button
                onClick={() => setShowApplyModal(true)}
                size="sm"
                className="mt-3 bg-yellow-600 hover:bg-yellow-700"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Applications"
          value={stats.total}
          color="bg-blue-500"
          icon={Clock}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="bg-yellow-500"
          icon={Clock}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          color="bg-green-500"
          icon={Clock}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          color="bg-red-500"
          icon={Clock}
        />
      </div>

      {/* Unapplied Lates Warning */}
      {!isAdmin && !isHR && attendances.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">
                You have {attendances.length} unapplied late arrival(s) this
                month
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Apply for late approval to avoid deductions from your salary or
                leave balance.
              </p>
              <Button
                onClick={() => setShowApplyModal(true)}
                size="sm"
                className="mt-3 bg-yellow-600 hover:bg-yellow-700"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <div className="flex gap-2">
            <FilterButton
              active={filterStatus === "all"}
              onClick={() => setFilterStatus("all")}
              label="All"
            />
            <FilterButton
              active={filterStatus === "Pending"}
              onClick={() => setFilterStatus("Pending")}
              label="Pending"
              color="yellow"
            />
            <FilterButton
              active={filterStatus === "Approved"}
              onClick={() => setFilterStatus("Approved")}
              label="Approved"
              color="green"
            />
            <FilterButton
              active={filterStatus === "Rejected"}
              onClick={() => setFilterStatus("Rejected")}
              label="Rejected"
              color="red"
            />
          </div>
        </div>
      </div>

      {/* Late Table */}
      <LateTable
        lates={lates}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        canApprove={canApprove}
        currentUserId={user?._id}
      />

      {/* Apply Late Modal */}
      {showApplyModal && (
        <ApplyLateModal
          attendances={attendances}
          onClose={() => setShowApplyModal(false)}
          onSubmit={fetchData}
        />
      )}

      {/* Reject Late Modal */}
      {showRejectModal && (
        <RejectLateModal
          onClose={() => {
            setShowRejectModal(false);
            setSelectedLate(null);
          }}
          onConfirm={confirmReject}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <LateSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onUpdate={fetchData}
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

function FilterButton({ active, onClick, label, color = "indigo" }) {
  const colors = {
    indigo: active
      ? "bg-indigo-600 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    yellow: active
      ? "bg-yellow-600 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    green: active
      ? "bg-green-600 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    red: active
      ? "bg-red-600 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colors[color]}`}
    >
      {label}
    </button>
  );
}
