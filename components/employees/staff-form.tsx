"use client";

import React, { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent, Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { EmployeeDto } from "@/lib/api2/employee/types";
import { useEmployee } from "@/lib/api2/employee";
import type { EmployeeDepartment, EmployeePosition } from "@/lib/api2/employee/types";

// Form validation schema
const staffValidationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  middle_name: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Valid email required"),
  phone_number: z.string().min(1, "Phone number is required"),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (date) => {
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        // Adjust age if birthday hasn't occurred yet this year
        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
          ? age - 1 
          : age;
        
        return adjustedAge >= 16;
      },
      {
        message: "Staff member must be at least 16 years old",
      }
    ),
  place_of_birth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  hire_date: z.string().min(1, "Hire date is required"),
  employment_status: z.enum(["active", "inactive", "on_leave", "retired"]).optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  is_teacher: z.boolean().optional(),
  photo: z.instanceof(File).optional(),
  initialize_user_account: z.boolean().optional(),
  username: z.string().optional(),
  role: z.enum(["admin", "teacher", "viewer"]).optional(),
}).refine(
  (data) => {
    if (data.initialize_user_account) {
      return !!data.role;
    }
    return true;
  },
  {
    message: "User role is required",
    path: ["role"],
  }
);

export type StaffFormSchema = z.infer<typeof staffValidationSchema>;

interface StaffFormProps {
  initialData?: EmployeeDto;
  isLoading?: boolean;
  onSubmit: (data: StaffFormSchema) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
}

export function StaffForm({
  initialData,
  isLoading = false,
  onSubmit,
  onCancel,
  submitButtonText = "Save Staff Member",
}: StaffFormProps) {
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(
    initialData?.photo_url || null
  );

  // Default form values
  const defaultValues = useMemo(
    () => ({
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      middle_name: initialData?.middle_name || "",
      email: initialData?.email || "",
      phone_number: initialData?.phone_number || "",
      gender: (initialData?.gender as any) || null,
      date_of_birth: initialData?.date_of_birth?.split("T")[0] || "",
      place_of_birth: initialData?.place_of_birth || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postal_code: initialData?.postal_code || "",
      country: initialData?.country || "",
      hire_date: initialData?.hire_date?.split("T")[0] || "",
      employment_status: (initialData?.employment_status as any) || "active",
      position: initialData?.position && typeof initialData.position === "object" 
        ? initialData.position.id 
        : (initialData?.position as string | null) || "",
      department: initialData?.department && typeof initialData.department === "object"
        ? initialData.department.id
        : (initialData?.department as string | null) || "",
      is_teacher: initialData?.is_teacher ?? false,
      photo: undefined,
      initialize_user_account: false,
      username: "",
      role: undefined,
    }),
    [initialData]
  );

  const form = useForm<StaffFormSchema>({
    resolver: zodResolver(staffValidationSchema),
    defaultValues: defaultValues as StaffFormSchema,
    mode: "onChange",
  });

  const initializeUserAccount = useWatch({
    control: form.control,
    name: "initialize_user_account",
  });

  const employeeApi = useEmployee();
  const { data: positionsData } = employeeApi.getEmployeePositions({});
  const { data: departmentsData } = employeeApi.getEmployeeDepartments({});

  const positions = useMemo<EmployeePosition[]>(() => {
    if (!positionsData) return [];
    if (Array.isArray(positionsData)) return positionsData as EmployeePosition[];
    if (Array.isArray(positionsData.results)) return positionsData.results as EmployeePosition[];
    return [];
  }, [positionsData]);

  const departments = useMemo<EmployeeDepartment[]>(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData as EmployeeDepartment[];
    if (Array.isArray(departmentsData.results)) return departmentsData.results as EmployeeDepartment[];
    return [];
  }, [departmentsData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("photo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: StaffFormSchema) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* Personal Information Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@school.com"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Michael" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not specified</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                        onChange={(date) => {
                          if (!date) {
                            field.onChange("");
                            return;
                          }
                          const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                          field.onChange(formatted);
                        }}
                        placeholder="MM/DD/YYYY"
                        allowFutureDates={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="place_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Birth</FormLabel>
                    <FormControl>
                      <Input placeholder="City/Country" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Address Information</h3>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Main Street"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Employment Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hire Date *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                        onChange={(date) => {
                          if (!date) {
                            field.onChange("");
                            return;
                          }
                          const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                          field.onChange(formatted);
                        }}
                        placeholder="MM/DD/YYYY"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not specified</SelectItem>
                        {positions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.title || position.department?.name || "Untitled position"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a position for this staff member
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not specified</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the primary department
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="is_teacher"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="mb-0 cursor-pointer">
                        Teacher Role
                      </FormLabel>
                      <FormDescription>
                        Enable if this staff member teaches classes.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photo Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Photo</h3>

            <div className="flex gap-4 items-start">
              {photoPreview && (
                <div className="flex flex-col gap-2">
                  <Image
                    src={photoPreview}
                    alt="Staff photo preview"
                    className="h-20 w-20 rounded-lg object-cover"
                    width={80}
                    height={80}
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhotoPreview(null);
                      form.setValue("photo", undefined);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="photo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upload Photo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended: JPG, PNG, max 5MB
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Account Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">User Account</h3>

            <FormField
              control={form.control}
              name="initialize_user_account"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="mb-0 cursor-pointer">
                    Create user account for this staff member
                  </FormLabel>
                </FormItem>
              )}
            />

            {initializeUserAccount && (
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john.doe"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to auto-generate from ID number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Role</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines system access level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
