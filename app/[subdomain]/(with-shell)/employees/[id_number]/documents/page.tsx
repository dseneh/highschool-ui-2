"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { FileIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PageLayout from "@/components/dashboard/page-layout";
import RefreshButton from "@/components/shared/refresh-button";
import EmptyStateComponent from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeDocumentFormModal } from "@/components/employees/employee-document-form-modal";
import { useEmployee } from "@/lib/api2/employee";
import { useEmployeeDocuments, useDocumentMutations } from "@/hooks/use-hr";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import type {
  CreateEmployeeDocumentCommand,
  EmployeeDocumentDto,
} from "@/lib/api2/hr-types";

const COMPLIANCE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  valid: { label: "Valid", variant: "default" },
  expired: { label: "Expired", variant: "destructive" },
  expiring_soon: { label: "Expiring Soon", variant: "secondary" },
};

export default function EmployeeDocumentsPage() {
  const params = useParams();
  const idNumber = params.id_number as string;

  const employeeApi = useEmployee();
  const { data: employee, isLoading: employeeLoading } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"),
  });

  const {
    data: documents = [],
    isLoading: docsLoading,
    isFetching,
    error,
    refetch,
  } = useEmployeeDocuments(
    { employeeId: employee?.id ?? "" },
    { enabled: !!employee?.id },
  );

  const { create, update, remove } = useDocumentMutations(employee?.id);

  const isLoading = employeeLoading || docsLoading;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingDoc, setEditingDoc] = React.useState<EmployeeDocumentDto | undefined>();

  const handleCreate = () => {
    setEditingDoc(undefined);
    setModalOpen(true);
  };

  const handleEdit = (doc: EmployeeDocumentDto) => {
    setEditingDoc(doc);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      showToast.success("Deleted", "Document has been deleted");
      refetch();
    } catch (err) {
      showToast.error("Failed", getErrorMessage(err));
    }
  };

  const handleSubmit = async (data: CreateEmployeeDocumentCommand) => {
    try {
      if (editingDoc) {
        await update.mutateAsync({ id: editingDoc.id, cmd: data });
        showToast.success("Updated", "Document updated");
      } else {
        await create.mutateAsync(data);
        showToast.success("Created", "Document added");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      showToast.error("Failed", getErrorMessage(err));
    }
  };

  return (
    <PageLayout
      title="Documents"
      description="Contracts, licenses, and certifications"
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<HugeiconsIcon icon={Add01Icon} size={16} />}
            onClick={handleCreate}
          >
            Add Document
          </Button>
          <RefreshButton onClick={refetch} loading={isLoading || isFetching} />
        </div>
      }
      error={error}
      loading={isLoading}
      emptyState={
        <EmptyStateComponent
          title="No Documents"
          description="This employee has no documents yet. Add contracts, licenses, or certifications."
          icon={<HugeiconsIcon icon={FileIcon} />}
        />
      }
      noData={documents.length === 0}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {documents.map((doc) => {
          const compliance = doc.complianceStatus
            ? COMPLIANCE_BADGE[doc.complianceStatus]
            : null;

          return (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{doc.title}</h3>
                    {compliance ? (
                      <Badge variant={compliance.variant}>{compliance.label}</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {doc.documentType}
                    {doc.documentNumber ? ` · ${doc.documentNumber}` : ""}
                  </p>
                  {doc.issueDate || doc.expiryDate ? (
                    <p className="text-xs text-muted-foreground">
                      {doc.issueDate ? `Issued: ${doc.issueDate}` : ""}
                      {doc.issueDate && doc.expiryDate ? " · " : ""}
                      {doc.expiryDate ? `Expires: ${doc.expiryDate}` : ""}
                      {doc.daysUntilExpiry != null
                        ? ` (${doc.daysUntilExpiry} days)`
                        : ""}
                    </p>
                  ) : null}
                  {doc.issuingAuthority ? (
                    <p className="text-xs text-muted-foreground">
                      Issued by: {doc.issuingAuthority}
                    </p>
                  ) : null}
                  {doc.notes ? (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {doc.notes}
                    </p>
                  ) : null}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {doc.documentUrl ? (
                      <DropdownMenuItem
                        onClick={() => window.open(doc.documentUrl!, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => handleEdit(doc)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          );
        })}
      </div>

      {employee ? (
        <EmployeeDocumentFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
          employees={[employee]}
          initialData={editingDoc}
        />
      ) : null}
    </PageLayout>
  );
}
