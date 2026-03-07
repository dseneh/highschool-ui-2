"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogBox } from "@/components/ui/dialog-box";
import { useUsers } from "@/lib/api2/users";
import { showToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils";
import { AuthButton } from "@/components/auth/auth-button";

interface BasicUserAccount {
  username?: string | null;
  email?: string | null;
  is_active?: boolean;
  role?: string | null;
  last_login?: string | null;
}

interface AccountInfoSectionProps {
  entityLabel: "Student" | "Staff";
  fullName: string;
  idNumber: string;
  accountType: "STUDENT" | "STAFF";
  dateOfBirth?: string | null;
  userAccount?: BasicUserAccount | null;
  onAccountCreated?: () => void | Promise<void>;
}

function normalizeDateString(dateOfBirth?: string | null): string | null {
  if (!dateOfBirth) return null;
  if (dateOfBirth.length >= 10) return dateOfBirth.slice(0, 10);
  return null;
}

export function AccountInfoSection({
  entityLabel,
  fullName,
  idNumber,
  accountType,
  dateOfBirth,
  userAccount,
  onAccountCreated,
}: AccountInfoSectionProps) {
  const [open, setOpen] = React.useState(false);
  const usersApi = useUsers();
  const createMutation = usersApi.createUser();

  const hasAccount = Boolean(userAccount?.username);
  const normalizedDob = normalizeDateString(dateOfBirth);

  const handleGenerateAccount = async () => {
    if (!normalizedDob) {
      showToast.error(
        "Cannot generate account",
        `${entityLabel} date of birth is required to create an account from existing record.`,
      );
      return;
    }

    try {
      await createMutation.mutateAsync({
        account_type: accountType,
        id_number: idNumber,
        date_of_birth: normalizedDob,
      });

      showToast.success("Account created", `${entityLabel} account was generated successfully.`);
      setOpen(false);
      await onAccountCreated?.();
    } catch (error) {
      showToast.error("Account creation failed", getErrorMessage(error));
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasAccount ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={userAccount?.is_active === false ? "secondary" : "default"}>
                  {userAccount?.is_active === false ? "Inactive" : "Active"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <span className="text-sm font-medium">{userAccount?.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm">{userAccount?.email || "—"}</span>
              </div>
              {userAccount?.role && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="text-sm">{userAccount.role}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm">
                  {userAccount?.last_login
                    ? new Date(userAccount.last_login).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary">No account</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This {entityLabel.toLowerCase()} does not have a user account yet.
              </p>
              <AuthButton
                roles={["admin"]}
                onClick={() => setOpen(true)}
                loading={createMutation.isPending}
                loadingText="Generating..."
              >
                Generate User Account
              </AuthButton>
            </>
          )}
        </CardContent>
      </Card>

      <DialogBox
        open={open}
        onOpenChange={setOpen}
        title={`Generate ${entityLabel} Account`}
        description="Confirm details below to generate the linked user account."
        actionLabel="Generate Account"
        actionLoading={createMutation.isPending}
        actionLoadingText="Generating..."
        actionDisabled={!normalizedDob}
        onAction={handleGenerateAccount}
        roles={["admin"]}
      >
        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <p className="text-sm font-medium">{fullName}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">ID Number</p>
            <p className="text-sm font-medium">{idNumber}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
            <p className="text-sm font-medium">{normalizedDob || "Missing"}</p>
          </div>
          {!normalizedDob && (
            <p className="text-xs text-destructive">
              Date of birth is missing. Add it first before generating the account.
            </p>
          )}
        </div>
      </DialogBox>
    </>
  );
}
