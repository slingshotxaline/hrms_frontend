import { useState } from "react";
import Badge from "@/components/common/Badge";
import { formatTime } from "@/lib/utils";
import { Clock, TrendingUp, TrendingDown, Eye, Coffee } from "lucide-react";
import PunchDetailsModal from "./PunchDetailsModal";

export default function AttendanceTable({
  attendance,
  showEmployeeColumn = false,
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPunchModal, setShowPunchModal] = useState(false);

  // Helper function to get timing badge (IN time)
  const getTimingBadge = (record) => {
    if (record.isEarly) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Early
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {record.earlyMinutes} min early
          </span>
        </div>
      );
    }

    if (record.timingStatus === "On Time (Grace)" || record.usedGracePeriod) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            On Time
          </span>
          <span className="text-xs text-amber-600 mt-1">Used grace period</span>
        </div>
      );
    }

    if (record.timingStatus === "On Time" && record.lateMinutes === 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          On Time
        </span>
      );
    }

    if (record.isHalfDay) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Half Day
          </span>
          <span className="text-xs text-gray-500 mt-1">After 12:00 PM</span>
        </div>
      );
    }

    if (record.timingStatus === "Late" || record.lateMinutes > 0) {
      return (
        <div className="flex flex-col items-start">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
            Late
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {record.lateMinutes} min late
          </span>
        </div>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
        -
      </span>
    );
  };

  // Helper function to get overtime/early leave badge (OUT time)
  const getOvertimeBadge = (record) => {
    if (!record.outTime) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          Not punched out
        </span>
      );
    }

    if (record.hasOvertime && record.overtimeMinutes > 0) {
      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Overtime
            </span>
          </div>
          <span className="text-xs text-purple-600 mt-1 font-semibold">
            +{record.overtimeMinutes} min
          </span>
        </div>
      );
    }

    if (record.earlyLeave && record.earlyLeaveMinutes > 0) {
      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Early Leave
            </span>
          </div>
          <span className="text-xs text-red-600 mt-1 font-semibold">
            -{record.earlyLeaveMinutes} min
          </span>
        </div>
      );
    }

    // On time out
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        On Time
      </span>
    );
  };

  const viewPunchDetails = (record) => {
    setSelectedRecord(record);
    setShowPunchModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {showEmployeeColumn && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Employee
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Day
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  In Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Out Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex flex-col">
                    <span>Total Hours</span>
                    <span className="text-xs text-gray-400 font-normal">
                      Gross
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex flex-col">
                    <span>Working</span>
                    <span className="text-xs text-gray-400 font-normal">
                      Net
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex flex-col">
                    <span>Breaks</span>
                    <span className="text-xs text-gray-400 font-normal">
                      Total
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex flex-col">
                    <span>In Timing</span>
                    <span className="text-xs text-gray-400 font-normal">
                      Arrival
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex flex-col">
                    <span>Out Timing</span>
                    <span className="text-xs text-gray-400 font-normal">
                      Departure
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={showEmployeeColumn ? 12 : 11}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No attendance records found for this period
                  </td>
                </tr>
              ) : (
                attendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record) => {
                    const date = new Date(record.date);
                    const dayName = date.toLocaleDateString("en-US", {
                      weekday: "short",
                    });

                    // Gross working hours (first IN to last OUT)
                    let grossHours = 0;
                    if (record.inTime && record.outTime) {
                      grossHours =
                        (new Date(record.outTime) - new Date(record.inTime)) /
                        (1000 * 60 * 60);
                    }

                    // Net working hours (excluding breaks)
                    const netHours = (record.netWorkingMinutes || 0) / 60;

                    // Total break time
                    const breakHours = (record.totalBreakMinutes || 0) / 60;

                    // Punch count
                    const punchCount = record.punches?.length || 0;

                    return (
                      <tr
                        key={record._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {showEmployeeColumn && (
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div>
                              <p>
                                {record.employee?.firstName}{" "}
                                {record.employee?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {record.employee?.employeeCode}
                              </p>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`font-semibold ${
                              dayName === "Sat" || dayName === "Sun"
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {dayName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {record.inTime ? (
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {formatTime(record.inTime)}
                              </span>
                              {punchCount > 1 && (
                                <span className="text-xs text-blue-600">
                                  First punch
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {record.outTime ? (
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {formatTime(record.outTime)}
                              </span>
                              {punchCount > 1 && (
                                <span className="text-xs text-blue-600">
                                  Last punch
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {grossHours > 0 ? (
                            <span className="font-semibold text-indigo-600">
                              {grossHours.toFixed(1)}h
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {netHours > 0 ? (
                            <span className="font-semibold text-green-600">
                              {netHours.toFixed(1)}h
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {breakHours > 0 ? (
                            <div className="flex items-center gap-1">
                              <Coffee className="w-3 h-3 text-amber-600" />
                              <span className="font-semibold text-amber-600">
                                {breakHours.toFixed(1)}h
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge status={record.status} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getTimingBadge(record)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getOvertimeBadge(record)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => viewPunchDetails(record)}
                            className="flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-semibold">
                              {punchCount}{" "}
                              {punchCount === 1 ? "punch" : "punches"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Punch Details Modal */}
      {/* Punch Details Modal */}
      {showPunchModal && selectedRecord && (
        <PunchDetailsModal
          isOpen={showPunchModal}
          record={selectedRecord}
          onClose={() => {
            console.log("Closing modal");
            setShowPunchModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </>
  );
}
