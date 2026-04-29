"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  Loader2,
  Pause,
  Play,
  Save,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ── Types ───────────────────────────────────────────────────────────── */

interface TenantDetail {
  id: string;
  displayName: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL";
  planTier: string;
  userCount: number;
  adminCount: number;
  contractStartDate: string | null;
  contractEndDate: string | null;
  createdAt: string;
}

/* ── Status badge ────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: TenantDetail["status"] }) {
  const styles: Record<TenantDetail["status"], string> = {
    ACTIVE: "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]",
    SUSPENDED: "bg-red-50 text-red-700",
    TRIAL: "bg-[var(--intent-amber-subtle)] text-[var(--intent-amber)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const queryClient = useQueryClient();

  const [editName, setEditName] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editDirty, setEditDirty] = useState(false);

  const { data: tenant, isLoading, error } = useQuery<TenantDetail>({
    queryKey: ["superadmin-tenant", tenantId],
    queryFn: () => apiFetch(`/api/superadmin/tenants/${tenantId}`),
    // Seed edit fields once data arrives
  });

  // Seed the edit fields when data first loads
  const seeded = editName || editPlan;
  if (tenant && !seeded) {
    setEditName(tenant.displayName);
    setEditPlan(tenant.planTier);
  }

  const updateMutation = useMutation({
    mutationFn: (payload: { displayName?: string; planTier?: string }) =>
      apiFetch(`/api/superadmin/tenants/${tenantId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-tenant", tenantId] });
      setEditDirty(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (action: "suspend" | "activate") =>
      apiFetch(`/api/superadmin/tenants/${tenantId}/${action}`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-tenant", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-tenants"] });
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-[var(--intent-green)]" />
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
        <Link
          href="/superadmin/tenants"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
        >
          <ArrowLeft className="size-4" />
          Back to tenants
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">Could not load tenant details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Back */}
      <Link
        href="/superadmin/tenants"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
      >
        <ArrowLeft className="size-4" />
        Back to tenants
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--intent-green-subtle)]">
            <Building2 className="size-5 text-[var(--intent-green)]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)]">
              {tenant.displayName}
            </h1>
            <p className="font-mono text-xs text-[var(--intent-text-secondary)]">
              {tenant.slug}
            </p>
          </div>
        </div>
        <StatusBadge status={tenant.status} />
      </div>

      {/* Info card */}
      <div className="mb-6 rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Users
            </p>
            <p className="mt-1 font-heading text-lg font-semibold text-[var(--intent-text-primary)]">
              {tenant.userCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Admins
            </p>
            <p className="mt-1 font-heading text-lg font-semibold text-[var(--intent-text-primary)]">
              {tenant.adminCount}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Plan
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--intent-text-primary)]">
              {tenant.planTier}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Created
            </p>
            <p className="mt-1 text-sm text-[var(--intent-text-primary)]">
              {new Date(tenant.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {(tenant.contractStartDate || tenant.contractEndDate) && (
          <div className="mt-4 flex items-center gap-4 border-t border-[var(--intent-text-tertiary)] pt-4">
            <Calendar className="size-4 text-[var(--intent-text-secondary)]" strokeWidth={1.5} />
            <div className="flex flex-wrap gap-4 text-sm text-[var(--intent-text-secondary)]">
              {tenant.contractStartDate && (
                <span>
                  Start: {new Date(tenant.contractStartDate).toLocaleDateString()}
                </span>
              )}
              {tenant.contractEndDate && (
                <span>
                  End: {new Date(tenant.contractEndDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href={`/superadmin/tenants/${tenantId}/users`}>
          <Button
            variant="outline"
            className="h-9 gap-1.5 rounded-lg border-[var(--intent-text-tertiary)] text-sm font-medium text-[var(--intent-text-primary)]"
          >
            <Users className="size-4" />
            View Users
          </Button>
        </Link>
        <Link href={`/superadmin/tenants/${tenantId}/admins`}>
          <Button
            variant="outline"
            className="h-9 gap-1.5 rounded-lg border-[var(--intent-text-tertiary)] text-sm font-medium text-[var(--intent-text-primary)]"
          >
            <ShieldCheck className="size-4" />
            View Admins
          </Button>
        </Link>

        {tenant.status === "ACTIVE" || tenant.status === "TRIAL" ? (
          <Button
            variant="outline"
            onClick={() => statusMutation.mutate("suspend")}
            disabled={statusMutation.isPending}
            className="h-9 gap-1.5 rounded-lg border-red-200 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Pause className="size-4" />
            {statusMutation.isPending ? "Suspending..." : "Suspend Tenant"}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => statusMutation.mutate("activate")}
            disabled={statusMutation.isPending}
            className="h-9 gap-1.5 rounded-lg border-[var(--intent-green)] text-sm font-medium text-[var(--intent-green)] hover:bg-[var(--intent-green-subtle)]"
          >
            <Play className="size-4" />
            {statusMutation.isPending ? "Activating..." : "Activate Tenant"}
          </Button>
        )}
      </div>

      {/* Edit form */}
      <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-5">
        <h2 className="mb-4 font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          Edit Tenant
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({
              displayName: editName,
              planTier: editPlan,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-[var(--intent-text-primary)]">
              Display Name
            </Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditDirty(true);
              }}
              className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-plan" className="text-[var(--intent-text-primary)]">
              Plan Tier
            </Label>
            <Input
              id="edit-plan"
              value={editPlan}
              onChange={(e) => {
                setEditPlan(e.target.value);
                setEditDirty(true);
              }}
              className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
            />
          </div>

          {updateMutation.error && (
            <p className="text-sm text-red-600">
              {(updateMutation.error as Error).message}
            </p>
          )}

          <Button
            type="submit"
            disabled={!editDirty || updateMutation.isPending}
            className="h-9 gap-1.5 rounded-lg bg-[var(--intent-green)] text-sm font-medium text-white hover:bg-[var(--intent-green-light)] disabled:opacity-40"
          >
            <Save className="size-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
