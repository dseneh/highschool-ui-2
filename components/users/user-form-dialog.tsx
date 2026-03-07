"use client";

import React, { useState } from "react";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { DatePicker } from "@/components/ui/date-picker";
import type { RecreateUserDto, CreateUserDto } from "@/lib/api2/users";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecreateUserDto | CreateUserDto) => Promise<void>;
  loading?: boolean;
}

// Form mode options
const modeItems = [
  { value: "recreate", label: "From Existing Record" },
  { value: "create", label: "Manual Entry" },
];

// Account type options
const accountTypeItems = [
  { value: "student", label: "Student" },
  { value: "staff", label: "Staff" },
  { value: "parent", label: "Parent" },
];

// Role options
const roleItems = [
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
  { value: "PARENT", label: "Parent" },
  { value: "ADMIN", label: "Admin" },
  { value: "VIEWER", label: "Viewer" },
];

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: UserFormDialogProps) {
  const [formMode, setFormMode] = useState<"recreate" | "create">("recreate");
  const [formData, setFormData] = useState<RecreateUserDto | CreateUserDto>({
    account_type: "STUDENT",
    id_number: "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to format Date to YYYY-MM-DD without timezone issues
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to parse YYYY-MM-DD string as local date
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleInputChange = (
    field: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.account_type) {
      newErrors.account_type = "Account type is required";
    }
    if (!formData.id_number?.trim()) {
      newErrors.id_number = "ID number is required";
    }

    if (formMode === "recreate") {
      const recData = formData as RecreateUserDto;
      if (!recData.date_of_birth?.trim()) {
        newErrors.date_of_birth = "Date of birth is required for recreate mode";
      }
    } else {
      const createData = formData as CreateUserDto;
      if (!createData.email?.trim()) {
        newErrors.email = "Email is required";
      }
      if (!createData.first_name?.trim()) {
        newErrors.first_name = "First name is required";
      }
      if (!createData.last_name?.trim()) {
        newErrors.last_name = "Last name is required";
      }
      if (!createData.role) {
        newErrors.role = "Role is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await onSubmit(formData);
      // Reset form
    //   setFormData({
    //     account_type: "STUDENT",
    //     id_number: "",
    //     date_of_birth: "",
    //   });
      setFormMode("recreate");
      setErrors({});
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        account_type: "STUDENT",
        id_number: "",
        date_of_birth: "",
      });
      setFormMode("recreate");
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  const isRecreate = formMode === "recreate";

  return (
    <DialogBox
      open={open}
      onOpenChange={handleOpenChange}
      title="Create new user"
      description={isRecreate ? "Create a user from an existing record" : "Create a new user manually"}
      actionLabel={loading ? "Creating..." : "Create"}
      actionLoading={loading}
      onAction={handleSubmit}
    >
      <div className="space-y-4">
        {/* Mode Selector */}
        <div className="space-y-2">
          <Label htmlFor="mode">Mode</Label>
          <SelectField
            value={formMode}
            onValueChange={(value: any) => setFormMode(value)}
            items={modeItems}
            placeholder="Select mode"
          />
        </div>

        {/* Account Type */}
        <div className="space-y-2">
          <Label htmlFor="accountType">Account Type</Label>
          <SelectField
            value={formData.account_type}
            onValueChange={(value: any) => handleInputChange("account_type", value)}
            items={accountTypeItems}
            placeholder="Select account type"
          />
          {errors.account_type && (
            <p className="text-xs text-destructive">{errors.account_type}</p>
          )}
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            placeholder="e.g., STU001"
            value={formData.id_number}
            onChange={(e) => handleInputChange("id_number", e.target.value)}
          />
          {errors.id_number && (
            <p className="text-xs text-destructive">{errors.id_number}</p>
          )}
        </div>

        {isRecreate && (
          <>
            {/* Date of Birth (Recreate mode) */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <DatePicker
                value={
                  (formData as RecreateUserDto).date_of_birth 
                    ? parseLocalDate((formData as RecreateUserDto).date_of_birth!)
                    : undefined
                }
                onChange={(date) => {
                  // Convert Date to YYYY-MM-DD string format using local time
                  if (date) {
                    const formatted = formatLocalDate(date);
                    handleInputChange("date_of_birth", formatted);
                  } else {
                    handleInputChange("date_of_birth", "");
                  }
                }}
                placeholder="Select date of birth"
                allowFutureDates={false}
              />
              {errors.date_of_birth && (
                <p className="text-xs text-destructive">{errors.date_of_birth}</p>
              )}
            </div>

            {/* Optional Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                placeholder="Defaults to ID number"
                value={((formData as RecreateUserDto).username as string) || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
            </div>
          </>
        )}

        {!isRecreate && (
          <>
            {/* Email (Create mode) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={(formData as CreateUserDto).email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={(formData as CreateUserDto).first_name || ""}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
              />
              {errors.first_name && (
                <p className="text-xs text-destructive">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={(formData as CreateUserDto).last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
              />
              {errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <SelectField
                value={(formData as CreateUserDto).role || ""}
                onValueChange={(value: any) => handleInputChange("role", value)}
                items={roleItems}
                placeholder="Select role"
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                placeholder="Defaults to ID number"
                value={(formData as CreateUserDto).username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </DialogBox>
  );
}
