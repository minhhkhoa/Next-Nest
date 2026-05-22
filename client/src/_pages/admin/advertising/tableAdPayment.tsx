"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DataTablePagination from "@/components/DataTablePagination";
import { useState } from "react";
import { AdPaymentDetailResType } from "@/schemasvalidation/adPayment";

interface TableAdPaymentProps {
  data: AdPaymentDetailResType[];
  columns: ColumnDef<AdPaymentDetailResType>[];
}

export default function TableAdPayment({ data, columns }: TableAdPaymentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  //- Phân trang ở phía client-side do API không hỗ trợ phân trang
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
  });

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const meta = {
    current: currentPage,
    pageSize: pageSize,
    totalPages: totalPages,
    totalItems: totalItems,
  };

  return (
    <div className="overflow-hidden rounded-md border mb-10 bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="font-semibold text-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {paginatedData.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="py-4" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Không có giao dịch thanh toán nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Phân trang */}
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row items-center py-4 px-4 border-t justify-between gap-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Hiển thị {paginatedData.length}/{totalItems} giao dịch
          </span>

          <DataTablePagination meta={meta} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
