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
import { MetaFilterType } from "@/schemasvalidation/NewsCategory";
import DataTablePagination from "@/components/DataTablePagination";
import { AdSlotResType } from "@/schemasvalidation/adSlot";

interface TableAdSlotProps {
  data: AdSlotResType[];
  columns: ColumnDef<AdSlotResType>[];
  meta: MetaFilterType;
  setCurrentPage: (page: number) => void;
}

export default function TableAdSlot({
  data,
  columns,
  meta,
  setCurrentPage,
}: TableAdSlotProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
  });

  return (
    <div className="overflow-hidden rounded-md border mb-10">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
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
                Không có slot nào phù hợp.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Phân trang */}
      <div className="flex flex-col md:flex-row items-center py-4 px-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Hiển thị {data.length}/{meta?.totalItems} slot
        </span>
        <DataTablePagination meta={meta} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
