"use client";

import { useState } from "react";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ── Types ───────────────────────────────────────────────────────────── */

interface CrossTenantUser {
  id: string;
  name: string;
  email: string;
  tenantName: string;
  userType: "STUDENT" | "ALUMNI";
  lastActiveAt: string | null;
}

interface CrossTenantUsersResponse {
  users: CrossTenantUser[];
  total: number;
  page: number;
  pageSize: number;
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function AllUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error } = useQuery<CrossTenantUsersResponse>({
    queryKey: ["superadmin-users", page, search],
    queryFn: () =>
      apiFetch(
        `/api/superadmin/users?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      ),
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)] md:text-2xl">
          All Users
          {!isLoading && (
            <span className="ml-2 text-base font-normal text-[var(--intent-text-secondary)]">
              ({total})
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-[var(--intent-text-secondary)]">
          Search across all tenants.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--intent-text-secondary)]" />
        <Input
          placeholder="Search by name or email..."
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
          <p className="text-sm text-red-700">Could not load users.</p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-[var(--intent-green)]" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-12 text-center">
          <Users className="mx-auto mb-3 size-8 text-[var(--intent-text-secondary)]" strokeWidth={1.5} />
          <p className="text-sm text-[var(--intent-text-secondary)]">
            {search ? "No users match your search." : "No users found."}
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
                    Tenant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr
                    key={user.id}
                    className={
                      i < users.length - 1
                        ? "border-b border-[var(--intent-text-tertiary)]"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 font-medium text-[var(--intent-text-primary)]">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {user.tenantName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          user.userType === "STUDENT"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--intent-text-secondary)]">
                      {user.lastActiveAt
                        ? new Date(user.lastActiveAt).toLocaleDateString()
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--intent-text-primary)]">
                    {user.name}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      user.userType === "STUDENT"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {user.userType}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--intent-text-secondary)]">
                  {user.email}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--intent-text-secondary)]">
                  <span>{user.tenantName}</span>
                  <span>&middot;</span>
                  <span>
                    {user.lastActiveAt
                      ? `Active ${new Date(user.lastActiveAt).toLocaleDateString()}`
                      : "Never active"}
                  </span>
                </div>
              </div>
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
