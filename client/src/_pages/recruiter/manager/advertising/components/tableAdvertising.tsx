"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetaFilterType } from "@/schemasvalidation/NewsCategory";
import DataTablePagination from "@/components/DataTablePagination";
import { AdBookingResType } from "@/schemasvalidation/adBooking";

interface DataTableProps {
  columns: ColumnDef<AdBookingResType>[];
  data: AdBookingResType[];
  meta: MetaFilterType;
  setCurrentPage: (page: number) => void;
}

export function TableAdvertising({
  columns,
  data,
  meta,
  setCurrentPage,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground italic"
                >
                  Bạn chưa có đơn đặt quảng cáo nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination control */}
      {meta && meta.totalItems > 0 && (
        <div className="flex flex-col md:flex-row items-center py-4 px-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Hiển thị {data.length}/{meta.totalItems} đơn
          </span>

          <DataTablePagination meta={meta} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
