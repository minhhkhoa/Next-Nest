import { Briefcase, Plus, Trash2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelectTree } from "@/_pages/components/multi-select-industry";
import { MultiSelectSkills } from "@/_pages/components/multi-select-skills";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";

//- Địa điểm & Kỹ năng

export function LocationSkills({
  form,
  selectedIndustryOptions,
}: {
  form: UseFormReturn<any>;
  selectedIndustryOptions: any[];
}) {
  const industryIDs = form.watch("industryID") || [];

  // Sử dụng useFieldArray để quản lý mảng otherSkills
  const { fields, append, remove } = useFieldArray({
    //- fields: Một mảng các object. vd: [{ id: '1', value: 'React' }, { id: '2', value: 'Nest' }], id do react-hook-form tự sinh ra để theo dõi
    control: form.control, //- Kết nối với form chính
    name: "otherSkills", //- Tên trường mảng trong form
  });
  return (
    <Card className="shadow-sm gap-2">
      <CardHeader>
        <CardTitle className="text-lg !mt-2">Địa điểm & Kỹ năng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 mb-2">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Địa chỉ làm việc</FormLabel>
              <FormControl>
                <Input placeholder="Số nhà, tên đường..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="industryID"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Chuyên ngành liên quan
                </FormLabel>
                <FormControl>
                  <MultiSelectTree
                    selected={selectedIndustryOptions}
                    onChange={(opts) =>
                      field.onChange(opts.map((o: any) => o.value))
                    }
                    placeholder="Chọn ngành nghề..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Kỹ năng yêu cầu</FormLabel>
                <FormControl>
                  <MultiSelectSkills
                    selected={field.value || []}
                    onChange={field.onChange}
                    industryIDs={industryIDs}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Phần Kỹ năng khác --- */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <FormLabel className="font-semibold">
              Kỹ năng bổ sung (Tối đa 5)
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: "" })}
              disabled={fields.length >= 5} //- Khống chế Max 5
              className="h-8 gap-1"
            >
              <Plus className="w-4 h-4" /> Thêm kỹ năng
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`otherSkills.${index}.value`} //- Path tới value trong mảng(qua bên zod jobCreate xem otherSkills)
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Kỹ năng khác ${index + 1}...`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nút xóa: Không cho xóa nếu chỉ còn 1 input */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1} //- Khống chế Min 1
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
