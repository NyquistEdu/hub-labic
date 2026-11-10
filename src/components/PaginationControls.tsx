"use client";

import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [15, 20, 50],
  className = "",
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  if (totalItems === 0) {
    return null;
  }

  // Gera lista inteligente de páginas (com elipses quando houver muitas)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span>
          Exibindo <strong className="text-zinc-200">{startItem}-{endItem}</strong> de{" "}
          <strong className="text-zinc-200">{totalItems}</strong> registro(s)
        </span>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-zinc-500">Exibir:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="bg-[#111318] border border-zinc-800 rounded px-2 py-1 text-zinc-200 cursor-pointer focus:outline-none focus:border-zinc-600"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} por página
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="px-2.5 py-1 rounded bg-[#111318] border border-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 hover:text-white transition-colors"
        >
          ← Anterior
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-zinc-600">
                  ...
                </span>
              );
            }
            const isActive = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-[#111318] border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="px-2.5 py-1 rounded bg-[#111318] border border-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
