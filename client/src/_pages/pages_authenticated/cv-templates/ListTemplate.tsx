import { CV_TEMPLATES } from "@/lib/constant";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";

export const listTemplateMetadata = [
  {
    id: CV_TEMPLATES.basicTemplate,
    title: "Mẫu Cv cơ bản",
    description:
      "Mẫu CV đơn giản, dễ nhìn, phù hợp với nhiều ngành nghề khác nhau.",
    image: "/image_template/basic_template.png",
    popular: true,
  },
  {
    id: CV_TEMPLATES.impressiveTemplate,
    title: "Mẫu Cv ấn tượng",
    description:
      "Mẫu CV ấn tượng, nổi bật với thiết kế sáng tạo và chuyên nghiệp.",
    image: "/image_template/impressive_template.png",
    popular: false,
  },
  {
    id: CV_TEMPLATES.modernTemplate,
    title: "Mẫu Cv hiện đại",
    description: "Mẫu CV hiện đại, phù hợp với xu hướng thiết kế mới nhất.",
    image: "/image_template/modern_template.png",
    popular: true,
  },
  {
    id: CV_TEMPLATES.simpleTemplate,
    title: "Mẫu Cv đơn giản",
    description:
      "Mẫu CV đơn giản, tập trung vào nội dung và thông tin cá nhân.",
    image: "/image_template/simple_template.png",
    popular: false,
  },
];

export default function PageListTemplate() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Danh sách mẫu CV chuyên nghiệp
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Chọn một mẫu CV phù hợp với phong cách và ngành nghề của bạn để bắt
          đầu tạo CV ấn tượng ngay hôm nay.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listTemplateMetadata.map((template, index) => (
          <Card
            key={index}
            className="flex flex-col pb-2 overflow-hidden h-full group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50"
          >
            <div className="relative aspect-[3/3] w-full bg-muted overflow-hidden">
              <Image
                src={template.image}
                alt={template.title}
                fill
                priority
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button variant="default" className="rounded-full" asChild>
                  <Link href={`/cv-templates/${template.id}`}>
                    Xem chi tiết
                  </Link>
                </Button>
              </div>
              {template.popular && (
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/90 text-white hover:bg-yellow-500 font-medium shadow-sm gap-1"
                  >
                    <Star className="h-3 w-3 fill-current" /> Phổ biến
                  </Badge>
                </div>
              )}
            </div>

            <CardHeader>
              <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                {template.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow">
              <CardDescription className="line-clamp-3 text-sm">
                {template.description}
              </CardDescription>
            </CardContent>

            <CardFooter className="pt-0">
              <Button className="w-full group/btn" variant="outline" asChild>
                <Link href={`/cv-templates/${template.id}`}>
                  Sử dụng mẫu này
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
