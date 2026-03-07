"use client";

import type { ContactDto } from "@/lib/api2/employee-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EmployeeContactsTabProps {
  contacts: ContactDto[] | null;
  onAddContact: () => void;
}

export function EmployeeContactsTab({
  contacts,
  onAddContact,
}: EmployeeContactsTabProps) {
  const list = contacts ?? [];

  if (list.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          No emergency contacts have been added yet.
        </p>
        <button
          onClick={onAddContact}
          className="text-sm font-medium text-primary hover:underline"
        >
          Add a contact
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-sm font-semibold">Emergency Contacts</h2>
        <button
          onClick={onAddContact}
          className="text-sm font-medium text-primary hover:underline"
        >
          Add Contact
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-muted-foreground font-medium">Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Type</TableHead>
              <TableHead className="text-muted-foreground font-medium">Relationship</TableHead>
              <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
              <TableHead className="text-muted-foreground font-medium">Email</TableHead>
              <TableHead className="text-muted-foreground font-medium">Primary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {[c.firstName, c.lastName].filter(Boolean).join(" ") || "--"}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.contactType ?? "--"}</TableCell>
                <TableCell className="text-muted-foreground">{c.relationship ?? "--"}</TableCell>
                <TableCell className="text-muted-foreground">{c.phoneNumber ?? "--"}</TableCell>
                <TableCell className="text-muted-foreground">{c.email ?? "--"}</TableCell>
                <TableCell>
                  {c.isPrimary ? (
                    <Badge variant="secondary" className="text-xs">Primary</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">--</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
