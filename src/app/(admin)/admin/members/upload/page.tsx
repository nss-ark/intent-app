"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CloudUpload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Static data ──────────────────────────────────────────────────────── */

const schemaColumns = [
  { field: "EMAIL", example: "arun@isb.edu", required: true },
  { field: "FULL NAME", example: "Arun Sharma", required: true },
  { field: "PROGRAM", example: "PGP", required: true },
  { field: "CLASS YEAR", example: "2024", required: true },
];

const pastUploads = [
  {
    id: "1",
    filename: "pgp_2025_batch.csv",
    date: "Apr 12, 2026",
    records: 142,
    status: "success" as const,
  },
  {
    id: "2",
    filename: "alumni_update_q1.csv",
    date: "Mar 28, 2026",
    records: 48,
    status: "success" as const,
  },
  {
    id: "3",
    filename: "faculty_list.csv",
    date: "Mar 15, 2026",
    records: 0,
    status: "error" as const,
  },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function CSVUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 md:px-8 md:py-8">
      {/* Back link */}
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      {/* Heading */}
      <h1 className="mb-6 font-heading text-xl font-semibold text-[var(--intent-text-primary)] md:text-2xl">
        Upload member list
      </h1>

      {/* Upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-[var(--intent-navy)] bg-[var(--intent-navy-subtle)]"
            : file
            ? "border-[var(--intent-green)] bg-[var(--intent-green-subtle)]"
            : "border-[var(--intent-text-tertiary)] bg-[var(--intent-navy-subtle)]/30"
        }`}
      >
        {file ? (
          <>
            <FileText className="mb-3 size-10 text-[var(--intent-green)]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[var(--intent-text-primary)]">
              {file.name}
            </p>
            <p className="mt-1 text-xs text-[var(--intent-text-secondary)]">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={() => setFile(null)}
              className="mt-2 text-xs font-medium text-[var(--intent-navy)] hover:underline"
            >
              Remove and choose another
            </button>
          </>
        ) : (
          <>
            <CloudUpload
              className="mb-3 size-10 text-[var(--intent-text-secondary)]"
              strokeWidth={1.5}
            />
            <p className="text-sm font-medium text-[var(--intent-text-primary)]">
              Drag and drop your CSV file here
            </p>
            <p className="mt-1 text-xs text-[var(--intent-text-secondary)]">
              or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </>
        )}
      </div>

      <p className="mt-2 text-xs text-[var(--intent-text-secondary)]">
        Accepted format: .csv &middot; Max 10,000 rows &middot; UTF-8 encoded
      </p>

      {/* Schema table */}
      <div className="mt-8">
        <h2 className="mb-3 font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          What we expect
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--intent-text-tertiary)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)]">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
                  Column
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
                  Example
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
                  Required
                </th>
              </tr>
            </thead>
            <tbody>
              {schemaColumns.map((col, i) => (
                <tr
                  key={col.field}
                  className={
                    i < schemaColumns.length - 1
                      ? "border-b border-[var(--intent-text-tertiary)]"
                      : ""
                  }
                >
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-[var(--intent-text-primary)]">
                    {col.field}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--intent-text-secondary)]">
                    {col.example}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {col.required && (
                      <span className="text-xs font-medium text-[var(--intent-navy)]">
                        Required
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--intent-navy)] hover:underline">
          <Download className="size-3.5" />
          Download template
        </button>
      </div>

      {/* Past uploads */}
      <div className="mt-8">
        <h2 className="mb-3 font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          Past uploads
        </h2>
        <div className="space-y-2">
          {pastUploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3"
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  upload.status === "success"
                    ? "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {upload.status === "success" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--intent-text-primary)] truncate">
                  {upload.filename}
                </p>
                <p className="text-xs text-[var(--intent-text-secondary)]">
                  {upload.date}
                  {upload.status === "success" && ` \u00b7 ${upload.records} records`}
                  {upload.status === "error" && " \u00b7 Failed"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload button */}
      <div className="mt-8">
        <Button
          disabled={!file}
          className="h-10 w-full rounded-lg bg-[var(--intent-navy)] text-sm font-medium text-white hover:bg-[var(--intent-navy-light)] disabled:opacity-40"
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
