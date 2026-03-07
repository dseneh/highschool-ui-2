"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useStudents as useStudentsApi } from "@/lib/api2/student";
import {
  useStudentGuardians,
  useCreateGuardian,
  useUpdateGuardian,
  useDeleteGuardian,
} from "@/hooks/use-contacts";
import {
  useStudentPageActions, StudentPageDialogs,
  isStudentReadOnly
} from "@/hooks/use-student-page-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DialogBox } from "@/components/ui/dialog-box";
import { WithdrawnBanner } from "@/components/students/withdrawn-banner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit01Icon,
  Add01Icon,
  Call02Icon,
  Mail01Icon,
  Location01Icon,
  Briefcase01Icon,
  NoteIcon
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import type {
  StudentGuardianDto,
  CreateStudentGuardianCommand,
  GuardianRelationship,
} from "@/lib/api/contacts-types";
import { RefreshCcw } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { relationshipOptions } from "../util";
import PageLayout from "@/components/dashboard/page-layout";
import EmptyStateComponent from "@/components/shared/empty-state";
import { AuthButton } from "@/components/auth/auth-button";

const RELATIONSHIP_LABELS: Record<GuardianRelationship, string> = {
  father: "Father",
  mother: "Mother",
  stepfather: "Stepfather",
  stepmother: "Stepmother",
  grandfather: "Grandfather",
  grandmother: "Grandmother",
  uncle: "Uncle",
  aunt: "Aunt",
  legal_guardian: "Legal Guardian",
  foster_parent: "Foster Parent",
  other: "Other",
};

function GuardiansSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

interface GuardianFormData {
  first_name: string;
  last_name: string;
  relationship: GuardianRelationship;
  phone_number: string;
  email: string;
  address: string;
  occupation: string;
  workplace: string;
  is_primary: boolean;
  notes: string;
}

const emptyForm: GuardianFormData = {
  first_name: "",
  last_name: "",
  relationship: "other",
  phone_number: "",
  email: "",
  address: "",
  occupation: "",
  workplace: "",
  is_primary: false,
  notes: "",
};

/* ------------------------------------------------------------------ */
/*  Detail Sheet                                                       */
/* ------------------------------------------------------------------ */

function GuardianDetailSheet({
  guardian,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  guardian: StudentGuardianDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (guardian: StudentGuardianDto) => void;
  onDelete: (guardian: StudentGuardianDto) => void;
}) {
  if (!guardian) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {guardian.photo && (
                <AvatarImage src={guardian.photo} alt={guardian.full_name} />
              )}
              <AvatarFallback>
                {getInitials(guardian.first_name, guardian.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="text-base">
                {guardian.full_name}
              </SheetTitle>
              <SheetDescription>
                {RELATIONSHIP_LABELS[guardian.relationship] ||
                  guardian.relationship}
              </SheetDescription>
            </div>
          </div>
          {guardian.is_primary && (
            <div className="pt-1">
              <Badge variant="default" className="text-[10px]">
                Primary Guardian
              </Badge>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {guardian.phone_number && (
            <div className="flex items-center gap-3 text-sm">
              <HugeiconsIcon
                icon={Call02Icon}
                className="size-4 text-muted-foreground shrink-0"
              />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{guardian.phone_number}</p>
              </div>
            </div>
          )}
          {guardian.email && (
            <div className="flex items-center gap-3 text-sm">
              <HugeiconsIcon
                icon={Mail01Icon}
                className="size-4 text-muted-foreground shrink-0"
              />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{guardian.email}</p>
              </div>
            </div>
          )}
          {(guardian.occupation || guardian.workplace) && (
            <div className="flex items-center gap-3 text-sm">
              <HugeiconsIcon
                icon={Briefcase01Icon}
                className="size-4 text-muted-foreground shrink-0"
              />
              <div>
                <p className="text-xs text-muted-foreground">Occupation</p>
                <p className="font-medium">
                  {guardian.occupation}
                  {guardian.occupation && guardian.workplace && " at "}
                  {guardian.workplace}
                </p>
              </div>
            </div>
          )}
          {guardian.address && (
            <div className="flex items-start gap-3 text-sm">
              <HugeiconsIcon
                icon={Location01Icon}
                className="size-4 text-muted-foreground shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p>{guardian.address}</p>
              </div>
            </div>
          )}
          {guardian.notes && (
            <div className="flex items-start gap-3 text-sm">
              <HugeiconsIcon
                icon={NoteIcon}
                className="size-4 text-muted-foreground shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-muted-foreground">{guardian.notes}</p>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 border-t pt-4">
          <AuthButton
            disable
            roles={["finance", "registrar", "accountant"]}
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />}
            onClick={() => {
              onOpenChange(false);
              onEdit(guardian);
            }}
          >
            Edit
          </AuthButton>
          <AuthButton
            disable
            roles={["finance", "registrar", "accountant"]}
            variant="destructive"
            size="sm"
            className="flex-1"
            icon={<HugeiconsIcon icon={Delete02Icon} className="size-4" />}
            onClick={() => {
              onOpenChange(false);
              onDelete(guardian);
            }}
          >
            Delete
          </AuthButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact Card                                                       */
/* ------------------------------------------------------------------ */

function GuardianCard({
  guardian,
  onClick,
}: {
  guardian: StudentGuardianDto;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar>
          {guardian.photo && (
            <AvatarImage src={guardian.photo} alt={guardian.full_name} />
          )}
          <AvatarFallback className="text-xs">
            {getInitials(guardian.first_name, guardian.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{guardian.full_name}</p>
            {guardian.is_primary && (
              <Badge variant="default" className="text-[10px] px-1.5 shrink-0">
                Primary
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {RELATIONSHIP_LABELS[guardian.relationship] ||
              guardian.relationship}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {guardian.phone_number && (
              <span className="flex items-center gap-1 truncate">
                <HugeiconsIcon icon={Call02Icon} className="size-3 shrink-0" />
                {guardian.phone_number}
              </span>
            )}
            {guardian.email && (
              <span className="flex items-center gap-1 truncate">
                <HugeiconsIcon icon={Mail01Icon} className="size-3 shrink-0" />
                {guardian.email}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentGuardiansPage() {
  const params = useParams();
  const idNumber = params.id_number as string;

  const studentsApi = useStudentsApi();
  const { data: student, isLoading: studentLoading } =
    studentsApi.getStudent(idNumber, {
      enabled: !!idNumber && window.location.href.includes("/students/"),
    });
  const hookResult = useStudentPageActions(student);

  const {
    data: guardians,
    isLoading: guardiansLoading,
    error: guardiansError,
    refetch,
    isFetching,
  } = useStudentGuardians(student?.id);

  const createMutation = useCreateGuardian(student?.id);
  const updateMutation = useUpdateGuardian(student?.id);
  const deleteMutation = useDeleteGuardian(student?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] =
    useState<StudentGuardianDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guardianToDelete, setGuardianToDelete] =
    useState<StudentGuardianDto | null>(null);
  const [form, setForm] = useState<GuardianFormData>(emptyForm);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedGuardian, setSelectedGuardian] =
    useState<StudentGuardianDto | null>(null);

  const handleCardClick = useCallback((guardian: StudentGuardianDto) => {
    setSelectedGuardian(guardian);
    setSheetOpen(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingGuardian(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((guardian: StudentGuardianDto) => {
    setEditingGuardian(guardian);
    setForm({
      first_name: guardian.first_name,
      last_name: guardian.last_name,
      relationship: guardian.relationship,
      phone_number: guardian.phone_number || "",
      email: guardian.email || "",
      address: guardian.address || "",
      occupation: guardian.occupation || "",
      workplace: guardian.workplace || "",
      is_primary: guardian.is_primary,
      notes: guardian.notes || "",
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    const command: CreateStudentGuardianCommand = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      relationship: form.relationship,
      phone_number: form.phone_number.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      occupation: form.occupation.trim() || null,
      workplace: form.workplace.trim() || null,
      is_primary: form.is_primary,
      notes: form.notes.trim() || null,
    };
    try {
      if (editingGuardian) {
        await updateMutation.mutateAsync({
          guardianId: editingGuardian.id,
          command,
        });
        toast.success("Guardian updated");
      } else {
        await createMutation.mutateAsync(command);
        toast.success("Guardian added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [form, editingGuardian, createMutation, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!guardianToDelete) return;
    try {
      await deleteMutation.mutateAsync(guardianToDelete.id);
      toast.success("Guardian deleted");
      setDeleteDialogOpen(false);
      setGuardianToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [guardianToDelete, deleteMutation]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (studentLoading) return <GuardiansSkeleton />;

  return (
    <PageLayout
      title="Guardians"
      description="Parents and legal guardians"
      actions={
        <div className="flex items-center gap-2">
          {!isStudentReadOnly(student) && (
            <Button
              size="sm"
              icon={<HugeiconsIcon icon={Add01Icon} className="size-4" />}
              onClick={handleOpenCreate}
            >
              Add Guardian
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => refetch()}
            icon={<RefreshCcw className="size-4" />}
            loading={guardiansLoading || isFetching}
            title="Refresh guardians data"
          />
        </div>
      }
      skeleton={<GuardiansSkeleton />}
      loading={studentLoading || guardiansLoading}
      error={guardiansError}
      noData={guardians?.length === 0}
      emptyState={
        <EmptyStateComponent
          handleAction={handleOpenCreate}
          actionProps={{ disabled: isStudentReadOnly(student) }}
          title="No Guardians"
          description=" No guardians have been added yet. Add parents or legal guardians for this student."
          actionTitle="Add First Guardian"
        />
      }
      globalChildren={
        <>
          <GuardianDetailSheet
            guardian={selectedGuardian}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            onEdit={handleOpenEdit}
            onDelete={(g) => {
              setGuardianToDelete(g);
              setDeleteDialogOpen(true);
            }}
          />

          {/* Create/Edit Dialog */}
          <DialogBox
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            className="sm:max-w-2xl"
            title={editingGuardian ? "Edit Guardian" : "Add Guardian"}
            description={
              editingGuardian
                ? "Update the guardian information below."
                : "Add a new parent or guardian for this student."
            }
            actionLabel={editingGuardian ? "Update Guardian" : "Add Guardian"}
            onAction={handleSubmit}
            actionLoading={isMutating}
            actionLoadingText={editingGuardian ? "Updating..." : "Adding..."}
            cancelDisabled={isMutating}
          >
            <div className="grid gap-4 py-2 px-1 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="g_first_name">First Name *</Label>
                  <Input
                    id="g_first_name"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, first_name: e.target.value }))
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g_last_name">Last Name *</Label>
                  <Input
                    id="g_last_name"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, last_name: e.target.value }))
                    }
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="g_relationship">Relationship</Label>
                  <SelectField
                    id="g_relationship"
                    value={form.relationship}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        relationship: v as GuardianRelationship,
                      }))
                    }
                    items={relationshipOptions}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g_phone">Phone</Label>
                  <Input
                    id="g_phone"
                    value={form.phone_number}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone_number: e.target.value }))
                    }
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g_email">Email</Label>
                <Input
                  id="g_email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="Email address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="g_occupation">Occupation</Label>
                  <Input
                    id="g_occupation"
                    value={form.occupation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, occupation: e.target.value }))
                    }
                    placeholder="Job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g_workplace">Workplace</Label>
                  <Input
                    id="g_workplace"
                    value={form.workplace}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, workplace: e.target.value }))
                    }
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g_address">Address</Label>
                <Input
                  id="g_address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Street address"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="g_is_primary"
                  checked={form.is_primary}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, is_primary: checked === true }))
                  }
                />
                <Label
                  htmlFor="g_is_primary"
                  className="text-sm cursor-pointer"
                >
                  Primary Guardian
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g_notes">Notes</Label>
                <Input
                  id="g_notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Additional notes"
                />
              </div>
            </div>
          </DialogBox>

          {/* Delete Confirmation Dialog */}
          <DialogBox
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            className="sm:max-w-md"
            title="Delete Guardian"
            description={
              <>
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {guardianToDelete?.full_name}
                </span>
                ? This action cannot be undone.
              </>
            }
            actionLabel="Delete"
            actionVariant="destructive"
            onAction={handleDelete}
            actionLoading={deleteMutation.isPending}
            actionLoadingText="Deleting..."
            cancelDisabled={deleteMutation.isPending}
          />
        </>
      }
    >
      <div className="space-y-4">
        <WithdrawnBanner
          student={student}
          onReEnroll={hookResult.handleReinstate}
          loading={hookResult.reinstate.isPending}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guardians?.map((guardian) => (
            <GuardianCard
              key={guardian.id}
              guardian={guardian}
              onClick={() => handleCardClick(guardian)}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
