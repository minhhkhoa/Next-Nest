"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { GroupedPermissionRes } from "@/schemasvalidation/permission";
import { Control } from "react-hook-form";
import { RoleCreateType } from "@/schemasvalidation/role";

interface Props {
  control: Control<RoleCreateType>;
  groupModules: GroupedPermissionRes;
}

export function PermissionSelector({ control, groupModules }: Props) {
  return (
    <FormField
      control={control}
      name="permissions"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-base font-semibold">
            Phân quyền chi tiết
          </FormLabel>
          <FormControl>
            <Accordion
              type="multiple"
              className="w-full border rounded-md px-4"
            >
              {Object.entries(groupModules).map(([moduleName, permissions]) => (
                <AccordionItem
                  value={moduleName}
                  key={moduleName}
                  className="border-b-0"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="text-sm font-bold text-primary">
                      {moduleName} ({permissions.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {permissions.map((permission) => {
                      const isSelected = field.value?.includes(permission._id);

                      return (
                        <label
                          key={permission._id}
                          className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 cursor-pointer transition-colors
                          ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-accent"
                          }
                        `}
                        >
                          <FormControl>
                            <Checkbox
                              className="mt-1"
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                return checked
                                  ? field.onChange([
                                      ...currentValues,
                                      permission._id,
                                    ])
                                  : field.onChange(
                                      currentValues.filter(
                                        (value) => value !== permission._id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none select-none">
                            <p className="text-sm font-medium">
                              {permission.name.vi}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {permission.method} - {permission.apiPath}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
