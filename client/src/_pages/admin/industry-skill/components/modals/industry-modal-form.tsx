"use client";

import type React from "react";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  cateIndustryCreate,
  CateIndustryCreateType,
  IndustryResType,
} from "@/schemasvalidation/industry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import SelectSearchIndustry from "../SelectSearchIndustry";
import { useCreateIndustry, useUpdateIndustry } from "@/queries/useIndustry";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

interface IndustryFormProps {
  industry?: IndustryResType;
  parentID?: string;
  onCancel: () => void;
}

export default function IndustryModalForm({
  industry,
  parentID,
  onCancel,
}: IndustryFormProps) {
  const form = useForm<CateIndustryCreateType>({
    resolver: zodResolver(cateIndustryCreate),
    defaultValues: {
      name: "",
      parentId: parentID || "",
    },
  });

  const { mutateAsync: createIndustryMutation, isPending: isCreating } =
    useCreateIndustry();

  const { mutateAsync: updateIndustryMutation, isPending: isUpdating } =
    useUpdateIndustry();

  const handleSubmit = async (values: CateIndustryCreateType) => {
    try {
      const payload = {
        name: values.name,
        parentId: values.parentId,
      };

      if (industry) {
        //- edit
        const resUpdate = await updateIndustryMutation({
          id: industry._id || "",
          payload,
        });

        if (resUpdate.isError) return;
        SoftSuccessSonner(resUpdate.message);
      } else {
        const resCreate = await createIndustryMutation(payload);

        if (resCreate.isError) return;
        SoftSuccessSonner(resCreate.message);
      }
    } catch (error) {
      console.log("errorr submit form industry: ", error);
    }
  };

  useEffect(() => {
    if (industry) {
      // Mode Edit
      form.reset({
        name: industry.name.vi,
        parentId: industry.parentId || "",
      });
    } else if (parentID) {
      // Mode Add Child từ nút Plus
      form.reset({
        name: "",
        parentId: parentID,
      });
    }
  }, [industry, parentID, form]);

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {industry
              ? "Chỉnh sửa ngành nghề"
              : parentID
                ? "Thêm ngành nghề con"
                : "Thêm ngành nghề mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên ngành nghề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên ngành nghề" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm ngành cha</FormLabel>
                  <FormControl>
                    <SelectSearchIndustry
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn danh mục cha..."
                      currentIndustryId={industry?._id} //- truyền vào để loại trừ khi edit
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isCreating || isUpdating}
              >
                Hủy
              </Button>
              <Button type="submit">
                {isCreating || isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : industry ? (
                  "Cập nhật"
                ) : (
                  "Thêm mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
