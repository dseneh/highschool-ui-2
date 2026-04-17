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
import { Checkbox } from "@/components/ui/checkbox";
import { addContact } from "@/lib/api2/employee-service";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";

interface AddContactSheetProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContactSheet({
  employeeId,
  open,
  onOpenChange,
}: AddContactSheetProps) {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();
  const [submitting, setSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    contactType: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    relationship: "",
    isPrimary: false,
  });

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm({
      contactType: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      relationship: "",
      isPrimary: false,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addContact(subdomain, employeeId, {
        employeeId,
        contactType: form.contactType || null,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        phoneNumber: form.phoneNumber || null,
        email: form.email || null,
        relationship: form.relationship || null,
        address: null,
        isPrimary: form.isPrimary,
        createdBy: null,
      });
      await queryClient.invalidateQueries({
        queryKey: ["employee", subdomain, employeeId],
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to add contact:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Emergency Contact</SheetTitle>
          <SheetDescription>
            Add a new emergency contact for this employee.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label>Contact Type</Label>
            <Input
              placeholder="e.g. Emergency, Personal"
              value={form.contactType}
              onChange={(e) => update("contactType", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>First Name</Label>
            <Input
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Last Name</Label>
            <Input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Relationship</Label>
            <Input
              placeholder="e.g. Spouse, Parent, Sibling"
              value={form.relationship}
              onChange={(e) => update("relationship", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.isPrimary}
              onCheckedChange={(checked) => update("isPrimary", !!checked)}
            />
            <Label>Primary contact</Label>
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
              Add Contact
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
