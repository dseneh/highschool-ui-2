"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { CreateTenantDto, UpdateTenantDto, TenantDetail } from "@/lib/api2/admin-tenant-types";
import { SelectField } from "../ui/select-field";

const tenantFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  short_name: z.string().min(2, "Short name must be at least 2 characters"),
  schema_name: z.string().optional(),
  domain: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  slogan: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  funding_type: z.string().optional(),
  school_type: z.string().optional(),
  status: z.string().optional(),
  is_active: z.boolean().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: TenantDetail | null;
  onSubmit: (data: CreateTenantDto | UpdateTenantDto) => Promise<void>;
  isLoading?: boolean;
}

export default function TenantFormDialog({
  open,
  onOpenChange,
  tenant,
  onSubmit,
  isLoading = false,
}: TenantFormDialogProps) {
  const isEdit = !!tenant;

  const buildFormValues = (currentTenant?: TenantDetail | null): TenantFormValues => ({
    name: currentTenant?.name || "",
    short_name: currentTenant?.short_name || "",
    schema_name: currentTenant?.schema_name || "",
    domain: currentTenant?.domain || "",
    email: currentTenant?.email || "",
    phone: currentTenant?.phone || "",
    website: currentTenant?.website || "",
    slogan: currentTenant?.slogan || "",
    description: currentTenant?.description || "",
    address: currentTenant?.address || "",
    city: currentTenant?.city || "",
    state: currentTenant?.state || "",
    country: currentTenant?.country || "",
    postal_code: currentTenant?.postal_code || "",
    funding_type: currentTenant?.funding_type || "",
    school_type: currentTenant?.school_type || "",
    status: currentTenant?.status || "inactive",
    is_active: Boolean(currentTenant?.is_active ?? currentTenant?.active),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: buildFormValues(tenant),
  });

  const currentIsActive = useWatch({ control, name: "is_active" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(buildFormValues(tenant));
  }, [open, tenant, reset]);

  const handleFormSubmit = async (data: TenantFormValues) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const handleAction = async () => {
    await handleSubmit(handleFormSubmit)();
  };

  const fundingOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "other", label: "Other" },
  ]

  const schoolTypeOptions = [
    { value: "elementary", label: "Elementary" },
    { value: "middle", label: "Middle School" },
    { value: "high", label: "High School" },
    { value: "combined", label: "Combined" },
    { value: "other", label: "Other" },
  ]

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Tenant" : "Create New Tenant"}
      description={
        isEdit
          ? "Update tenant information"
          : "Create a new tenant organization"
      }
      className="max-w-3xl"
      actionLabel={isEdit ? "Update Tenant" : "Create Tenant"}
      actionLoading={isLoading}
      actionLoadingText="Saving..."
      onAction={handleAction}
    >
      <form id="tenant-form" className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="School Name"
              />
              {errors.name?.message && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_name">Short Name *</Label>
              <Input
                id="short_name"
                {...register("short_name")}
                placeholder="Short Name"
              />
              {errors.short_name?.message && <p className="text-xs text-destructive">{errors.short_name.message}</p>}
            </div>

            {!isEdit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="schema_name">Schema Name</Label>
                  <Input
                    id="schema_name"
                    {...register("schema_name")}
                    placeholder="Auto-generated if empty"
                  />
                  {errors.schema_name?.message && <p className="text-xs text-destructive">{errors.schema_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    {...register("domain")}
                    placeholder="school.ezyschool.com"
                  />
                  {errors.domain?.message && <p className="text-xs text-destructive">{errors.domain.message}</p>}
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              {...register("slogan")}
              placeholder="School motto or slogan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the institution"
              rows={3}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Contact Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contact@school.com"
              />
              {errors.email?.message && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register("website")}
                placeholder="https://school.com"
              />
              {errors.website?.message && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Address</h3>
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register("country")}
                placeholder="Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                {...register("postal_code")}
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        {/* School Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">School Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="funding_type">Funding Type</Label>
              <SelectField
                onValueChange={(value: any) => setValue("funding_type", value ?? "")}
                value={tenant?.funding_type}
                items={fundingOptions}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school_type">School Type</Label>
              <SelectField
                onValueChange={(value: any) => setValue("school_type", value ?? "")}
                value={tenant?.school_type}
                items={schoolTypeOptions}
              />
            </div>
          </div>
        </div>

        {/* Status (Edit only) */}
        {isEdit && (
          <div className="space-y-4">
            <div className="grid gap-4 ">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <SelectField
                onValueChange={(value) => setValue("status", String(value ?? ""))}
                  defaultValue={tenant?.status}
                  value={tenant?.status}
                  items={[
                    {value: 'active', label: 'Active'},
                    {value: 'inactive', label: 'Inactive'},
                    {value: 'suspended', label: 'Suspended'},
                    {value: 'trial', label: 'Trial'},
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Active</Label>
                <div className="grid gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setValue("is_active", true, { shouldDirty: true })}
                    className={cn(
                      "h-auto justify-start px-3 py-2 text-left",
                      currentIsActive
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                        : "border-border"
                    )}
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      <span>
                        <span className="block text-sm font-medium">Enabled</span>
                        <span className="block text-xs opacity-75">Users can access this workspace</span>
                      </span>
                      {currentIsActive ? <Check className="mt-0.5 size-4" /> : null}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setValue("is_active", false, { shouldDirty: true })}
                    className={cn(
                      "h-auto justify-start px-3 py-2 text-left",
                      !currentIsActive
                        ? "border-orange-500 bg-orange-50 text-orange-900 hover:bg-orange-100"
                        : "border-border"
                    )}
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      <span>
                        <span className="block text-sm font-medium">Disabled</span>
                        <span className="block text-xs opacity-75">Workspace login and actions are blocked</span>
                      </span>
                      {!currentIsActive ? <Check className="mt-0.5 size-4" /> : null}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </DialogBox>
  );
}
