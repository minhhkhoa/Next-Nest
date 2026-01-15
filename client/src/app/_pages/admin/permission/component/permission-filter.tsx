"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HTTP_METHODS } from "@/lib/constant";
import { X } from "lucide-react";
import React from "react";

interface PermissionFilterProps {
  filters: {
    name: string;
    method: string;
    module: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  listModules: string[];
}

export default function PermissionFilter({
  filters,
  setFilters,
  listModules
}: PermissionFilterProps) {


  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Tìm theo tên */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-foreground">
            Tìm theo tên
          </label>
          <div className="relative">
            <Input
              placeholder="Search name..."
              value={filters.name || ""}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="pr-10 w-full"
            />
            {filters.name && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-0 -translate-y-1/2"
                onClick={() => setFilters({ ...filters, name: "" })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* HTTP Method */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-foreground">
            HTTP Method
          </label>
          <Select
            value={filters.method || "all"}
            onValueChange={(value) => {
              return value === "all"
                ? setFilters({ ...filters, method: "" })
                : setFilters({ ...filters, method: value });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="max-h-52">
                <SelectItem value="all">All Methods</SelectItem>
                {HTTP_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Module */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-foreground">Module</label>
          <Select
            value={filters.module || "all"}
            onValueChange={(value) => {
              return value === "all"
                ? setFilters({ ...filters, module: "" })
                : setFilters({ ...filters, module: value });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="max-h-52">
                <SelectItem value="all">All Modules</SelectItem>
                {listModules?.map((module) => {
                  const replaceNameModule = module.replace("Module", "");
                  return (
                    <SelectItem
                      key={replaceNameModule}
                      value={replaceNameModule}
                    >
                      {replaceNameModule}
                    </SelectItem>
                  );
                })}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
