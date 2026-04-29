"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

/* ── Types ───────────────────────────────────────────────────────────── */

interface Tenant {
  id: string;
  displayName: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL";
  userCount: number;
  adminCount: number;
  planTier: string;
  createdAt: string;
}

interface TenantsResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  pageSize: number;
}

/* ── Status badge helper ─────────────────────────────────────────────── */

function StatusBadge({ status }: { status: Tenant["status"] }) {
  const styles: Record<Tenant["status"], string> = {
    ACTIVE: "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]",
    SUSPENDED: "bg-red-50 text-red-700",
    TRIAL: "bg-[var(--intent-navy-subtle)] text-[var(--intent-navy)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function TenantsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");

  const { data, isLoading, error } = useQuery<TenantsResponse>({
    queryKey: ["superadmin-tenants", page, search],
    queryFn: () =>
      apiFetch(
        `/api/superadmin/tenants?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      ),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { displayName: string; slug: string }) =>
      apiFetch("/api/superadmin/tenants", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-tenants"] });
      setDialogOpen(false);
      setNewTenantName("");
      setNewTenantSlug("");
    },
  });

  const tenants = data?.tenants ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filteredDisplay = tenants;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)] md:text-2xl">
            Tenants
            {!isLoading && (
              <span className="ml-2 text-base font-normal text-[var(--intent-text-secondary)]">
                ({total})
              </span>
            )}
          </h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="h-9 gap-1.5 rounded-lg bg-[var(--intent-green)] text-sm font-medium text-white hover:bg-[var(--intent-green-light)]" />
            }
          >
            <Plus className="size-4" />
            Create Tenant
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  displayName: newTenantName,
                  slug: newTenantSlug,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="tenant-name" className="text-[var(--intent-text-primary)]">
                  Display Name
                </Label>
                <Input
                  id="tenant-name"
                  placeholder="e.g., ISB Hyderabad"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tenant-slug" className="text-[var(--intent-text-primary)]">
                  Slug
                </Label>
                <Input
                  id="tenant-slug"
                  placeholder="e.g., isb-hyderabad"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value)}
                  className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
                  required
                />
              </div>
              {createMutation.error && (
                <p className="text-sm text-red-600">
                  {(createMutation.error as Error).message}
                </p>
              )}
              <DialogFooter>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg text-sm"
                    />
                  }
                >
                  Cancel
                </DialogClose>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-9 rounded-lg bg-[var(--intent-green)] text-sm font-medium text-white hover:bg-[var(--intent-green-light)]"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--intent-text-secondary)]" />
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white pl-9 text-sm"
        />
      </div>

      {/* Error */}
      {error && !isLoading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Could not load tenants. You may not have SuperAdmin access.
          </p>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-[var(--intent-green)]" />
        </div>
      ) : filteredDisplay.length === 0 ? (
        <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-12 text-center">
          <Building2 className="mx-auto mb-3 size-8 text-[var(--intent-text-secondary)]" strokeWidth={1.5} />
          <p className="text-sm text-[var(--intent-text-secondary)]">
            {search ? "No tenants match your search." : "No tenants yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-[var(--intent-text-tertiary)] bg-white md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)]">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Users
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Admins
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDisplay.map((tenant, i) => (
                  <tr
                    key={tenant.id}
                    onClick={() => router.push(`/superadmin/tenants/${tenant.id}`)}
                    className={`cursor-pointer transition-colors hover:bg-[var(--intent-green-subtle)]/50 ${
                      i < filteredDisplay.length - 1
                        ? "border-b border-[var(--intent-text-tertiary)]"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[var(--intent-text-primary)]">
                      {tenant.displayName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--intent-text-secondary)]">
                      {tenant.slug}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--intent-text-secondary)]">
                      {tenant.userCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--intent-text-secondary)]">
                      {tenant.adminCount}
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {tenant.planTier}
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {filteredDisplay.map((tenant) => (
              <Link
                key={tenant.id}
                href={`/superadmin/tenants/${tenant.id}`}
                className="block rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 transition-colors active:bg-[var(--intent-green-subtle)]/30"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--intent-text-primary)]">
                    {tenant.displayName}
                  </p>
                  <StatusBadge status={tenant.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-[var(--intent-text-secondary)]">
                  {tenant.slug}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-[var(--intent-text-secondary)]">
                  <span>{tenant.userCount} users</span>
                  <span>{tenant.adminCount} admins</span>
                  <span>{tenant.planTier}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-[var(--intent-text-secondary)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 gap-1 rounded-lg border-[var(--intent-text-tertiary)] text-xs"
                >
                  <ChevronLeft className="size-3" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 gap-1 rounded-lg border-[var(--intent-text-tertiary)] text-xs"
                >
                  Next
                  <ChevronRight className="size-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
