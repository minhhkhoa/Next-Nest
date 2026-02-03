import { Briefcase } from "lucide-react";
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
import { UseFormReturn } from "react-hook-form";

//- Địa điểm & Kỹ năng

export function LocationSkills({
  form,
  selectedIndustryOptions,
}: {
  form: UseFormReturn<any>;
  selectedIndustryOptions: any[];
}) {
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
                  <Briefcase className="w-4 h-4" /> Ngành nghề
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
