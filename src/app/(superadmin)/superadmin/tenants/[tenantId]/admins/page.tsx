"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";

/* ── Types ───────────────────────────────────────────────────────────── */

interface TenantAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface TenantAdminsResponse {
  admins: TenantAdmin[];
  tenantName: string;
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function TenantAdminsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const { data, isLoading, error } = useQuery<TenantAdminsResponse>({
    queryKey: ["superadmin-tenant-admins", tenantId],
    queryFn: () => apiFetch(`/api/superadmin/tenants/${tenantId}/admins`),
  });

  const admins = data?.admins ?? [];
  const tenantName = data?.tenantName ?? "Tenant";

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Back */}
      <Link
        href={`/superadmin/tenants/${tenantId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
      >
        <ArrowLeft className="size-4" />
        Back to tenant
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)] md:text-2xl">
          Admins &mdash; {tenantName}
          {!isLoading && (
            <span className="ml-2 text-base font-normal text-[var(--intent-text-secondary)]">
              ({admins.length})
            </span>
          )}
        </h1>
      </div>

      {/* Error */}
      {error && !isLoading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">Could not load admins.</p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-[var(--intent-green)]" />
        </div>
      ) : admins.length === 0 ? (
        <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-12 text-center">
          <ShieldCheck className="mx-auto mb-3 size-8 text-[var(--intent-text-secondary)]" strokeWidth={1.5} />
          <p className="text-sm text-[var(--intent-text-secondary)]">
            No admins found for this tenant.
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
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, i) => (
                  <tr
                    key={admin.id}
                    className={
                      i < admins.length - 1
                        ? "border-b border-[var(--intent-text-tertiary)]"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 font-medium text-[var(--intent-text-primary)]">
                      {admin.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {admin.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-[var(--intent-green-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {admin.status}
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {new Date(admin.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--intent-text-primary)]">
                    {admin.name}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-[var(--intent-green-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
                    {admin.role}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--intent-text-secondary)]">
                  {admin.email}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--intent-text-secondary)]">
                  <span>{admin.status}</span>
                  <span>&middot;</span>
                  <span>Joined {new Date(admin.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
