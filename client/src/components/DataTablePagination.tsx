import React from 'react'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  meta: {
    current: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  onPageChange: (page: number) => void;
}

export default function DataTablePagination({ meta, onPageChange }: PaginationProps) {
  return (
    <Pagination className="flex justify-center md:justify-end">
      <PaginationContent>
        {/* Nút Trước */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(meta.current - 1)}
            aria-disabled={meta.current === 1}
            className={
              meta.current === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {/* Các trang */}
        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
          (page) => {
            // Nếu tổng số trang lớn, hiển thị rút gọn với Ellipsis
            if (meta.totalPages > 5) {
              const firstPage = page === 1;
              const lastPage = page === meta.totalPages;
              const nearCurrent = Math.abs(meta.current - page) <= 1;

              if (firstPage || lastPage || nearCurrent) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={meta.current === page}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              // Dấu "..." giữa các khoảng
              if (
                (page === 2 && meta.current > 3) ||
                (page === meta.totalPages - 1 &&
                  meta.current < meta.totalPages - 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return null;
            }

            // Trường hợp ít trang
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={meta.current === page}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          }
        )}

        {/* Nút Sau */}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(meta.current + 1)}
            aria-disabled={meta.current === meta.totalPages}
            className={
              meta.current === meta.totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
