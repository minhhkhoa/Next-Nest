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

//- Lương & Thời gian

export function SalaryDeadline({ form }: { form: any }) {
  const currency = form.watch("salary.currency");

  return (
    <Card className="shadow-sm gap-2">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase !mt-2">
          Lương & Thời gian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 mb-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="font-semibold">Mức lương</FormLabel>
            <FormField
              control={form.control}
              name="salary.currency"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[80px] h-8 text-xs font-bold border-none bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent align="end">
                    <SelectItem value="VND">VNĐ</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["min", "max"].map((type) => (
              <FormField
                key={type}
                control={form.control}
                name={`salary.${type}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder={type === "min" ? "Tối thiểu" : "Tối đa"}
                          className="pr-12"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                          {currency}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {form.formState.errors.salary?.root?.message && (
            <p className="text-xs font-medium text-destructive">
              {String(form.formState.errors.salary.root.message)}
            </p>
          )}
        </div>
        {["startDate", "endDate"].map((dateField) => (
          <FormField
            key={dateField}
            control={form.control}
            name={dateField}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dateField === "startDate" ? "Ngày bắt đầu" : "Ngày hết hạn"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
}
