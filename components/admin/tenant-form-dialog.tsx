"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DialogBox } from "@/components/ui/dialog-box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateTenantDto, UpdateTenantDto, TenantDetail } from "@/lib/api2/admin-tenant-types";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: tenant
      ? {
          name: tenant.name,
          short_name: tenant.short_name,
          schema_name: tenant.schema_name,
          email: tenant.email || "",
          phone: tenant.phone || "",
          website: tenant.website || "",
          slogan: tenant.slogan || "",
          description: tenant.description || "",
          address: tenant.address || "",
          city: tenant.city || "",
          state: tenant.state || "",
          country: tenant.country || "",
          postal_code: tenant.postal_code || "",
          funding_type: tenant.funding_type,
          school_type: tenant.school_type,
          status: tenant.status,
          is_active: tenant.is_active ?? tenant.active,
        }
      : {},
  });

  const handleFormSubmit = async (data: TenantFormValues) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      onCancel={handleCancel}
      title={isEdit ? "Edit Tenant" : "Create New Tenant"}
      description={
        isEdit
          ? "Update tenant information"
          : "Create a new tenant organization"
      }
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
              <Select
                onValueChange={(value) => setValue("funding_type", value ?? "")}
                defaultValue={tenant?.funding_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school_type">School Type</Label>
              <Select
                onValueChange={(value) => setValue("school_type", value ?? "")}
                defaultValue={tenant?.school_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="middle">Middle School</SelectItem>
                  <SelectItem value="high">High School</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status (Edit only) */}
        {isEdit && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Status</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => setValue("status", value ?? "")}
                  defaultValue={tenant?.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Active</Label>
                <Select
                  onValueChange={(value) => setValue("is_active", value === "true")}
                  defaultValue={(tenant?.is_active ?? tenant?.active) ? "true" : "false"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} loadingText="Saving...">
            {isEdit ? "Update Tenant" : "Create Tenant"}
          </Button>
        </div>
      </form>
    </DialogBox>
  );
}
