"use client"

import { useState, useCallback } from "react"
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain"
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import {
  useStudentContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@/hooks/use-contacts"
import { isStudentReadOnly } from "@/hooks/use-student-page-actions"
import { WithdrawnBanner } from "@/components/students/withdrawn-banner"
import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DialogBox } from "@/components/ui/dialog-box"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  PencilEdit01Icon,
  Add01Icon,
  Call02Icon,
  Mail01Icon,
  Location01Icon,
  NoteIcon,
  RefreshIcon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { StudentContactDto, CreateStudentContactCommand, ContactRelationship } from '@/lib/api2/contacts-types'
import { getQueryClient } from "@/lib/query-client"
import { SelectField } from '@/components/ui/select-field'
import { relationshipOptions } from '@/app/[subdomain]/(with-shell)/students/[id_number]/util'
import PageLayout from "@/components/dashboard/page-layout"
import EmptyStateComponent from "@/components/shared/empty-state"
import { AuthButton } from "@/components/auth/auth-button"

const RELATIONSHIP_LABELS: Record<ContactRelationship, string> = {
  parent: "Parent",
  guardian: "Guardian",
  sibling: "Sibling",
  relative: "Relative",
  family_friend: "Family Friend",
  neighbor: "Neighbor",
  teacher: "Teacher",
  counselor: "Counselor",
  other: "Other",
}

function ContactsSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </PageContent>
  )
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

interface ContactFormData {
  first_name: string
  last_name: string
  relationship: ContactRelationship
  phone_number: string
  email: string
  address: string
  is_emergency: boolean
  is_primary: boolean
  notes: string
}

const emptyForm: ContactFormData = {
  first_name: "",
  last_name: "",
  relationship: "other",
  phone_number: "",
  email: "",
  address: "",
  is_emergency: false,
  is_primary: false,
  notes: "",
}

/* ------------------------------------------------------------------ */
/*  Detail Sheet                                                       */
/* ------------------------------------------------------------------ */

function ContactDetailSheet({
  contact,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  contact: StudentContactDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (contact: StudentContactDto) => void
  onDelete: (contact: StudentContactDto) => void
}) {
  if (!contact) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {contact.photo && <AvatarImage src={contact.photo} alt={contact.full_name} />}
              <AvatarFallback>{getInitials(contact.first_name, contact.last_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="text-base">{contact.full_name}</SheetTitle>
              <SheetDescription>
                {RELATIONSHIP_LABELS[contact.relationship] || contact.relationship}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {contact.is_primary && (
              <Badge variant="default" className="text-[10px]">Primary</Badge>
            )}
            {contact.is_emergency && (
              <Badge variant="destructive" className="text-[10px]">Emergency</Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {contact.phone_number && (
            <div className="flex items-center gap-3 text-sm">
              <HugeiconsIcon icon={Call02Icon} className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{contact.phone_number}</p>
              </div>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-3 text-sm">
              <HugeiconsIcon icon={Mail01Icon} className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{contact.email}</p>
              </div>
            </div>
          )}
          {contact.address && (
            <div className="flex items-start gap-3 text-sm">
              <HugeiconsIcon icon={Location01Icon} className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p>{contact.address}</p>
              </div>
            </div>
          )}
          {contact.notes && (
            <div className="flex items-start gap-3 text-sm">
              <HugeiconsIcon icon={NoteIcon} className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-muted-foreground">{contact.notes}</p>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 border-t pt-4">
          <AuthButton
           disable
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />}
            onClick={() => {
              onOpenChange(false)
              onEdit(contact)
            }}
            roles={["finance", "registrar", "accountant"]}
          >
            Edit
          </AuthButton>
          <AuthButton
           disable
            variant="destructive"
            size="sm"
            className="flex-1"
            icon={<HugeiconsIcon icon={Delete02Icon} className="size-4" />}
            onClick={() => {
              onOpenChange(false)
              onDelete(contact)
            }}
            roles={["finance", "registrar", "accountant"]}
          >
            Delete
          </AuthButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/*  Compact Card                                                       */
/* ------------------------------------------------------------------ */

function ContactCard({
  contact,
  onClick,
}: {
  contact: StudentContactDto
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar>
          {contact.photo && <AvatarImage src={contact.photo} alt={contact.full_name} />}
          <AvatarFallback className="text-xs">
            {getInitials(contact.first_name, contact.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{contact.full_name}</p>
            <div className="flex gap-1 shrink-0">
              {contact.is_primary && (
                <Badge variant="default" className="text-[10px] px-1.5">Primary</Badge>
              )}
              {contact.is_emergency && (
                <Badge variant="destructive" className="text-[10px] px-1.5">Emergency</Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {RELATIONSHIP_LABELS[contact.relationship] || contact.relationship}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {contact.phone_number && (
              <span className="flex items-center gap-1 truncate">
                <HugeiconsIcon icon={Call02Icon} className="size-3 shrink-0" />
                {contact.phone_number}
              </span>
            )}
            {contact.email && (
              <span className="flex items-center gap-1 truncate">
                <HugeiconsIcon icon={Mail01Icon} className="size-3 shrink-0" />
                {contact.email}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentContactsPage() {
  const idNumber = useResolvedStudentIdNumber()
  const subdomain = useTenantSubdomain()
  const queryClient = getQueryClient()

  const studentsApi = useStudentsApi()
  const { data: student, isLoading: studentLoading } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber,
  })

  const {
    data: contacts,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts,
  } = useStudentContacts(student?.id)

  const createMutation = useCreateContact(student?.id)
  const updateMutation = useUpdateContact(student?.id)
  const deleteMutation = useDeleteContact(student?.id)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<StudentContactDto | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<StudentContactDto | null>(null)
  const [form, setForm] = useState<ContactFormData>(emptyForm)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<StudentContactDto | null>(null)

  const handleCardClick = useCallback((contact: StudentContactDto) => {
    setSelectedContact(contact)
    setSheetOpen(true)
  }, [setSelectedContact, setSheetOpen])

  const handleRefresh = () => {
    void refetchContacts()
    void queryClient.invalidateQueries({ queryKey: ["student-contacts", subdomain, student?.id] })
    toast.info("Refreshing contacts...")
  }

  const handleOpenCreate = useCallback(() => {
    setEditingContact(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }, [setForm, setDialogOpen])

  const handleOpenEdit = (contact: StudentContactDto) => {
    setEditingContact(contact)
    setForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      relationship: contact.relationship,
      phone_number: contact.phone_number || "",
      email: contact.email || "",
      address: contact.address || "",
      is_emergency: contact.is_emergency,
      is_primary: contact.is_primary,
      notes: contact.notes || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = useCallback(async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error("First name and last name are required")
      return
    }
    const command: CreateStudentContactCommand = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      relationship: form.relationship,
      phone_number: form.phone_number.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      is_emergency: form.is_emergency,
      is_primary: form.is_primary,
      notes: form.notes.trim() || null,
    }
    try {
      if (editingContact) {
        await updateMutation.mutateAsync({ contactId: editingContact.id, command })
        toast.success("Contact updated")
      } else {
        await createMutation.mutateAsync(command)
        toast.success("Contact added")
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }, [form, editingContact, createMutation, updateMutation, setDialogOpen])

  const handleDelete = useCallback(async () => {
    if (!contactToDelete) return
    try {
      await deleteMutation.mutateAsync(contactToDelete.id)
      toast.success("Contact deleted")
      setDeleteDialogOpen(false)
      setContactToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }, [contactToDelete, deleteMutation, setDeleteDialogOpen, setContactToDelete])

  const isMutating = createMutation.isPending || updateMutation.isPending

  if (studentLoading) return <ContactsSkeleton />

  return (
    <PageLayout
    title="Contacts" 
    description="Emergency contacts and other important contacts"
    actions={
      <div className="flex items-center gap-2">
            {!isStudentReadOnly(student) && (
              <Button
                size="sm"
                icon={<HugeiconsIcon icon={Add01Icon} className="size-4" />}
                onClick={handleOpenCreate}
              >
                Add Contact
              </Button>
            )}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleRefresh}
              icon={<HugeiconsIcon icon={RefreshIcon} className="size-4" />}
              title="Refresh contacts"
            />
          </div>
    }
      skeleton={<ContactsSkeleton />}
      error={contactsError}
      noData={contacts && contacts.length === 0 || !student}
      emptyState={
        <EmptyStateComponent
          handleAction={handleOpenCreate}
          actionProps={{ disabled: isStudentReadOnly(student) }}
          title="No Contacts"
          description="No contacts have been added for this student yet. Add emergency contacts, parents, or other important contacts."
          actionTitle="Add First Contact"
        />
      }
      loading={contactsLoading}
      globalChildren={
        <>
         <ContactDetailSheet
        contact={selectedContact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleOpenEdit}
        onDelete={(c) => {
          setContactToDelete(c)
          setDeleteDialogOpen(true)
        }}
      />

      {/* Create/Edit Dialog */}
      <DialogBox
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        className="sm:max-w-lg"
        title={editingContact ? "Edit Contact" : "Add Contact"}
        description={editingContact
          ? "Update the contact information below."
          : "Add a new contact for this student."}
        actionLabel={editingContact ? "Update Contact" : "Add Contact"}
        onAction={handleSubmit}
        actionLoading={isMutating}
        actionLoadingText={editingContact ? "Updating..." : "Adding..."}
        cancelDisabled={isMutating}
      >
          <div className="grid gap-4 py-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <SelectField
                  id="g_relationship"
                  value={form.relationship}
                  onValueChange={(v) => setForm((f) => ({ ...f, relationship: v as ContactRelationship }))}
                  items={relationshipOptions}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone_number}
                  onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_emergency"
                  checked={form.is_emergency}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, is_emergency: checked === true }))}
                />
                <Label htmlFor="is_emergency" className="text-sm cursor-pointer">
                  Emergency Contact
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_primary"
                  checked={form.is_primary}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, is_primary: checked === true }))}
                />
                <Label htmlFor="is_primary" className="text-sm cursor-pointer">
                  Primary Contact
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
        title="Delete Contact"
        description={
          <>Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{contactToDelete?.full_name}</span>?
            This action cannot be undone.
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

        <WithdrawnBanner student={student} onReEnroll={() => {}} loading={false} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contacts?.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onClick={() => handleCardClick(contact)}
              />
            ))}
          </div>
      </div>
     
    </PageLayout>
  )
}
