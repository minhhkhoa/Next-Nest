import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TinyEditor from "@/components/tinyCustomize";
import { UseFormReturn } from "react-hook-form";

//- (Tiêu đề & Mô tả)

export function MainContent({ form }: { form: UseFormReturn<any> }) {
  return (
    <Card className="shadow-sm gap-2">
      <CardHeader>
        <CardTitle className="text-lg !mt-2">Nội dung hiển thị</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 mb-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Tiêu đề công việc <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ví dụ: Senior Frontend Developer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Mô tả & Yêu cầu <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <TinyEditor field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
