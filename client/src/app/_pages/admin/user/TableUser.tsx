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
import { apiUserResType } from "@/schemasvalidation/user";
import { MetaFilterType } from "@/schemasvalidation/NewsCategory";
import DataTablePagination from "@/components/DataTablePagination";

interface DataTableProps {
  data: apiUserResType[];
  columns: ColumnDef<apiUserResType>[];
  meta: MetaFilterType;
  setCurrentPage: (page: number) => void;
}

export default function TableUser({
  data,
  columns,
  meta,
  setCurrentPage
}: DataTableProps) {

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border mb-10">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Không có kết quả phù hợp.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* pagination */}
      <div className="flex flex-col md:flex-row items-center py-4 px-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Hiển thị {data.length}/{meta?.totalItems} người dùng
        </span>

        <DataTablePagination meta={meta} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
