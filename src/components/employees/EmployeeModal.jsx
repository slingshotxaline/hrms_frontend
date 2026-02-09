"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  DollarSign,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

export default function EmployeeModal({ isOpen, onClose, onSubmit, employee }) {
  const isEditMode = !!employee;

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    employeeCode: employee?.employeeCode || "",
    biometricId: employee?.biometricId || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    dateOfBirth: employee?.dateOfBirth
      ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
      : "",
    dateOfJoining: employee?.dateOfJoining
      ? new Date(employee.dateOfJoining).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    department: employee?.department || "",
    designation: employee?.designation || "",
    basicSalary: employee?.basicSalary || 30000,
    houseRent: employee?.allowances?.houseRent || 10000,
    medical: employee?.allowances?.medical || 5000,
    transport: employee?.allowances?.transport || 3000,
    shiftStart: employee?.shiftStart || "09:00",
    shiftEnd: employee?.shiftEnd || "18:00",
    address: employee?.address || "",
    emergencyContactName: employee?.emergencyContact?.name || "",
    emergencyContactRelationship:
      employee?.emergencyContact?.relationship || "",
    emergencyContactPhone: employee?.emergencyContact?.phone || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.employeeCode.trim())
      newErrors.employeeCode = "Employee code is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.dateOfJoining)
      newErrors.dateOfJoining = "Date of joining is required";

    if (formData.basicSalary < 0)
      newErrors.basicSalary = "Basic salary must be positive";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const employeeData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        employeeCode: formData.employeeCode.trim(),
        biometricId: formData.biometricId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth || new Date().toISOString(),
        dateOfJoining: formData.dateOfJoining,
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        basicSalary: Number(formData.basicSalary),
        allowances: {
          houseRent: Number(formData.houseRent),
          medical: Number(formData.medical),
          transport: Number(formData.transport),
        },
        shiftStart: formData.shiftStart,
        shiftEnd: formData.shiftEnd,
        address: formData.address.trim(),
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          relationship: formData.emergencyContactRelationship.trim(),
          phone: formData.emergencyContactPhone.trim(),
        },
      };

      console.log("📤 Submitting employee data:", employeeData);

      await onSubmit(employeeData);
      onClose();
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert(error.message || "Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  const grossSalary =
    Number(formData.basicSalary) +
    Number(formData.houseRent) +
    Number(formData.medical) +
    Number(formData.transport);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Employee" : "Add New Employee"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Doe"
              required
            />
            <Input
              label="Employee Code"
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleChange}
              error={errors.employeeCode}
              placeholder="EMP001"
              required
              disabled={isEditMode}
            />
            <Input
              label="Biometric ID (ZKTeco Device ID)"
              name="biometricId"
              value={formData.biometricId}
              onChange={handleChange}
              placeholder="101"
              helperText="Enter the user ID from ZKTeco device (optional)"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john.doe@company.com"
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="+880 1712-345678"
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
            />
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Employment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
              placeholder="Engineering"
              required
            />
            <Input
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              error={errors.designation}
              placeholder="Software Engineer"
              required
            />
            <Input
              label="Date of Joining"
              name="dateOfJoining"
              type="date"
              value={formData.dateOfJoining}
              onChange={handleChange}
              error={errors.dateOfJoining}
              required
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
              />
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Salary Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Basic Salary (৳)"
              name="basicSalary"
              type="number"
              value={formData.basicSalary}
              onChange={handleChange}
              error={errors.basicSalary}
              placeholder="30000"
              required
            />
            <Input
              label="House Rent Allowance (৳)"
              name="houseRent"
              type="number"
              value={formData.houseRent}
              onChange={handleChange}
              placeholder="10000"
            />
            <Input
              label="Medical Allowance (৳)"
              name="medical"
              type="number"
              value={formData.medical}
              onChange={handleChange}
              placeholder="5000"
            />
            <Input
              label="Transport Allowance (৳)"
              name="transport"
              type="number"
              value={formData.transport}
              onChange={handleChange}
              placeholder="3000"
            />
          </div>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Gross Salary:
              </span>
              <span className="text-2xl font-bold text-green-600">
                ৳{grossSalary.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Shift Timing */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Shift Timing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Shift Start"
              name="shiftStart"
              type="time"
              value={formData.shiftStart}
              onChange={handleChange}
              required
            />
            <Input
              label="Shift End"
              name="shiftEnd"
              type="time"
              value={formData.shiftEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Name"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="Emergency contact name"
            />
            <Input
              label="Relationship"
              name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={handleChange}
              placeholder="Father, Mother, Spouse"
            />
            <Input
              label="Phone"
              name="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              placeholder="+880 1712-345678"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Employee"
              : "Add Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
