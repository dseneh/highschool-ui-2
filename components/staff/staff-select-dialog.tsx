"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogBox } from "@/components/ui/dialog-box";
import { useStaff } from "@/lib/api2/staff";
import { useStaffApi } from "@/lib/api2/staff/api";
import type { StaffListItem } from "@/lib/api2/staff/types";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { getQueryClient } from "@/lib/query-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

interface StaffSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function getStaffList(data: unknown): StaffListItem[] {
  if (Array.isArray(data)) return data as StaffListItem[];
  if (data && typeof data === "object" && "results" in data) {
    const result = (data as { results?: unknown }).results;
    return Array.isArray(result) ? (result as StaffListItem[]) : [];
  }
  return [];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function StaffSelectDialog({
  open,
  onOpenChange,
  onSuccess,
}: StaffSelectDialogProps) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const staffApi = useStaff();
  const rawApi = useStaffApi();
  const queryClient = getQueryClient();

  const { data, isLoading } = staffApi.getStaff(
    { page_size: 1000 },
    { enabled: open }
  );

  const allStaff = React.useMemo(() => getStaffList(data), [data]);

  const filteredStaff = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allStaff;
    return allStaff.filter((staff) => {
      const fullName = (staff.full_name || "").toLowerCase();
      const email = (staff.email || "").toLowerCase();
      const idNumber = (staff.id_number || "").toLowerCase();
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        idNumber.includes(query)
      );
    });
  }, [allStaff, search]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const start = (page - 1) * pageSize;
  const paginatedStaff = filteredStaff.slice(start, start + pageSize);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
    }
  }, [open]);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const toggleTeacher = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const response = await rawApi.patchStaffApi(id, { is_teacher: next });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      void queryClient.invalidateQueries({ queryKey: ["teachers"] });
      onSuccess?.();
    },
  });

  const handleToggle = async (staff: StaffListItem) => {
    const next = !staff.is_teacher;
    try {
      await toggleTeacher.mutateAsync({ id: staff.id, next });
      showToast.success(
        next ? "Set as teacher" : "Removed as teacher",
        `${staff.full_name} has been ${next ? "set as" : "removed as"} teacher`
      );
    } catch (error) {
      showToast.error("Update failed", getErrorMessage(error));
    }
  };

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Add From Staff"
      description="Select an existing staff member and set or remove teacher status."
      cancelLabel="Close"
      onCancel={() => onOpenChange(false)}
      className="sm:max-w-2xl h-[80vh]"
    >
      <div className="space-y-3 flex flex-col h-full">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or ID number"
            className="pl-9"
          />
        </div>

        <ScrollArea className="flex-1 min-h-0 border rounded-lg">
          <div className="p-2 space-y-2">
            {!isLoading && paginatedStaff.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No staff found.
              </p>
            )}

            {paginatedStaff.map((staff) => {
              const isUpdating =
                toggleTeacher.isPending &&
                toggleTeacher.variables?.id === staff.id;

              return (
                <div
                  key={staff.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Avatar>
                    <AvatarImage src={staff.photo ?? undefined} alt={staff.full_name} />
                    <AvatarFallback>{getInitials(staff.full_name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{staff.full_name}</p>
                      {staff.is_teacher && <Badge variant="secondary">Teacher</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {staff.id_number} • {staff.email || "No email"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant={staff.is_teacher ? "outline" : "default"}
                    loading={isUpdating}
                    onClick={() => handleToggle(staff)}
                  >
                    {staff.is_teacher ? "Remove as Teacher" : "Set as Teacher"}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>
            Showing {filteredStaff.length === 0 ? 0 : start + 1}–
            {Math.min(start + pageSize, filteredStaff.length)} of {filteredStaff.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DialogBox>
  );
}
