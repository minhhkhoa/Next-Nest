import { CV_TEMPLATES } from "@/lib/constant";
import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
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
import { useTranslations } from "next-intl";

export const listTemplateMetadata = [
  {
    id: CV_TEMPLATES.basicTemplate,
    key: "basicTemplate",
    image: "/image_template/basic_template.png",
    popular: true,
  },
  {
    id: CV_TEMPLATES.impressiveTemplate,
    key: "impressiveTemplate",
    image: "/image_template/impressive_template.png",
    popular: false,
  },
  {
    id: CV_TEMPLATES.modernTemplate,
    key: "modernTemplate",
    image: "/image_template/modern_template.png",
    popular: true,
  },
  {
    id: CV_TEMPLATES.simpleTemplate,
    key: "simpleTemplate",
    image: "/image_template/simple_template.png",
    popular: false,
  },
];

export default function PageListTemplate() {
  const t = useTranslations("Candidate.CvTemplates");

  const getTemplateTranslation = (key: string) => {
    switch (key) {
      case "basicTemplate":
        return {
          title: t("Templates.basicTemplate.title"),
          description: t("Templates.basicTemplate.desc"),
        };
      case "impressiveTemplate":
        return {
          title: t("Templates.impressiveTemplate.title"),
          description: t("Templates.impressiveTemplate.desc"),
        };
      case "modernTemplate":
        return {
          title: t("Templates.modernTemplate.title"),
          description: t("Templates.modernTemplate.desc"),
        };
      case "simpleTemplate":
        return {
          title: t("Templates.simpleTemplate.title"),
          description: t("Templates.simpleTemplate.desc"),
        };
      default:
        return {
          title: "",
          description: "",
        };
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {t("Title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t("SubTitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listTemplateMetadata.map((template, index) => {
          const { title, description } = getTemplateTranslation(template.key);

          return (
            <Card
              key={index}
              className="flex flex-col pb-2 overflow-hidden h-full group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50"
            >
              <div className="relative aspect-[3/3] w-full bg-muted overflow-hidden">
                <Image
                  src={template.image}
                  alt={title}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="default" className="rounded-full" asChild>
                    <Link href={`/cv-templates/${template.id}`}>
                      {t("ViewDetail")}
                    </Link>
                  </Button>
                </div>
                {template.popular && (
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/90 text-white hover:bg-yellow-500 font-medium shadow-sm gap-1"
                    >
                      <Star className="h-3 w-3 fill-current" /> {t("Popular")}
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                  {title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <CardDescription className="line-clamp-3 text-sm">
                  {description}
                </CardDescription>
              </CardContent>

              <CardFooter className="pt-0">
                <Button className="w-full group/btn" variant="outline" asChild>
                  <Link href={`/cv-templates/${template.id}`}>
                    {t("UseThis")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
