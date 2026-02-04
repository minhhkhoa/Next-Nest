import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LEVEL_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
} from "@/lib/constant";

//- Thông số tuyển dụng

const data = [
  { name: "level", label: "Cấp bậc", options: LEVEL_OPTIONS },
  {
    name: "employeeType",
    label: "Loại hình",
    options: EMPLOYEE_TYPE_OPTIONS,
  },
  {
    name: "experience",
    label: "Kinh nghiệm",
    options: EXPERIENCE_OPTIONS,
  },
];

const getPlaceholder = (name: string) => {
  switch (name) {
    case "level":
      return "Chọn cấp bậc";
    case "employeeType":
      return "Chọn loại hình";
    case "experience":
      return "Chọn kinh nghiệm";
    default:
      return "Chọn...";
  }
};

export function JobSpecs({ form }: { form: any }) {
  return (
    <Card className="shadow-sm gap-2">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase !mt-2">
          Thông số tuyển dụng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 mb-2">
        {data.map((spec) => (
          <FormField
            key={spec.name}
            control={form.control}
            name={spec.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{spec.label}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={getPlaceholder(spec.name)} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {spec.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số lượng tuyển dụng</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
