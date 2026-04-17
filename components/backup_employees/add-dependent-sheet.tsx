"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { addDependent } from "@/lib/api2/employee-service";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

interface AddDependentSheetProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDependentSheet({
  employeeId,
  open,
  onOpenChange,
}: AddDependentSheetProps) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();
  const [submitting, setSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined as Date | undefined,
    relationship: "",
    gender: "",
    nationalId: "",
  });

  function updateText(key: "firstName" | "lastName" | "relationship" | "gender" | "nationalId", value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm({
      firstName: "",
      lastName: "",
      dateOfBirth: undefined,
      relationship: "",
      gender: "",
      nationalId: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDependent(subdomain, employeeId, {
        employeeId,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        dateOfBirth: form.dateOfBirth
          ? form.dateOfBirth.toISOString()
          : new Date().toISOString(),
        relationship: form.relationship || null,
        gender: form.gender || null,
        nationalId: form.nationalId || null,
        createdBy: null,
      });
      await queryClient.invalidateQueries({
        queryKey: ["employee", subdomain, employeeId],
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to add dependent:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Dependent</SheetTitle>
          <SheetDescription>
            Add a new dependent for this employee.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label>First Name</Label>
            <Input
              value={form.firstName}
              onChange={(e) => updateText("firstName", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Last Name</Label>
            <Input
              value={form.lastName}
              onChange={(e) => updateText("lastName", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Date of Birth</Label>
            <DatePicker
              value={form.dateOfBirth}
              onChange={(date) => setForm((prev) => ({ ...prev, dateOfBirth: date }))}
              placeholder="Select date of birth"
              allowFutureDates={false}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Relationship</Label>
            <Input
              placeholder="e.g. Child, Spouse"
              value={form.relationship}
              onChange={(e) => updateText("relationship", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => updateText("gender", v!)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>National ID</Label>
            <Input
              value={form.nationalId}
              onChange={(e) => updateText("nationalId", e.target.value)}
            />
          </div>

          <SheetFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              loadingText="Adding..."
            >
              Add Dependent
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
