// src/components/leaderboard/leaderboard-pagination.tsx
"use client";

import React from "react";

interface LeaderboardPaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function LeaderboardPagination({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: LeaderboardPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (hasPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between max-sm:flex-wrap max-sm:gap-2">
      <div className="text-sm text-neutral-400 max-sm:text-xs max-sm:hidden">
        Showing {startItem}-{endItem} of {totalItems.toLocaleString()} players
      </div>

      <div className="flex items-center gap-4 max-sm:w-full max-sm:justify-between max-sm:gap-3">
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            <label className="text-sm text-neutral-500 max-sm:text-xs max-sm:whitespace-nowrap">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 focus:border-purple-500 focus:outline-none max-sm:px-2 max-sm:py-1 max-sm:text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-4 max-sm:gap-2">
          <span className="text-sm text-neutral-500 max-sm:text-xs max-sm:whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </span>
          
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-all duration-200 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 max-sm:px-2.5 max-sm:py-1.5 max-sm:text-xs"
            >
              Prev
            </button>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-all duration-200 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 max-sm:px-2.5 max-sm:py-1.5 max-sm:text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
