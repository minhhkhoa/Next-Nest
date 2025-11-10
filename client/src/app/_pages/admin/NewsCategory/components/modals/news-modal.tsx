"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CategoryNewsResType,
  newsCreate,
  NewsCreateType,
  NewsResFilterType,
} from "@/schemasvalidation/NewsCategory";
import { Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handleInitName, uploadToCloudinary } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface NewsModalProps {
  news?: NewsResFilterType;
  categories: CategoryNewsResType[];
  onClose: () => void;
}

export function NewsModal({ news, categories, onClose }: NewsModalProps) {
  const isEditing = !!news?._id;
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<NewsCreateType>({
    resolver: zodResolver(newsCreate),
    defaultValues: {
      title: "",
      cateNewsID: categories[0]?._id || "",
      summary: "",
      description: "",
      image: "",
      status: "active",
    },
  });

  // Cập nhật dữ liệu khi mở modal sửa
  useEffect(() => {
    if (news) {
      form.reset({
        title: news.title.vi,
        cateNewsID: news.cateNewsID[0],
        summary: news.summary.vi,
        description: news.description.vi,
        image: news.image,
        status: news.status as "active" | "inactive",
      });
    } else if (categories.length > 0) {
      form.reset((prev) => ({
        ...prev,
        cateNewsID: categories[0]._id,
      }));
    }
  }, [news, categories, form]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const url = await uploadToCloudinary(file);
      // setFormData((prev) => ({ ...prev, avatar: url }));
    } catch (error) {
      console.log("Lỗi upload media: ", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (values: NewsCreateType) => {
    console.log("Form data:", values);
    // TODO: gọi API create/update
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa tin tức" : "Thêm tin tức mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Image */}
            <div className="flex items-center gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src={form?.watch("image") || ""}
                  alt={form.getValues("title")}
                />
                <AvatarFallback>
                  {handleInitName(form.getValues("title")) || "MK"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="image" className="text-sm font-medium">
                    Tải lên Avatar
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="cursor-pointer"
                    />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF (tối đa 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề tin tức" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="cateNewsID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cate) => (
                          <SelectItem key={cate._id} value={cate._id}>
                            {cate.name.vi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tóm tắt</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tóm tắt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chi tiết"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Hoạt Động</SelectItem>
                        <SelectItem value="inactive">
                          Không Hoạt Động
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit">
                {isEditing ? "Cập nhật" : "Thêm tin tức"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
