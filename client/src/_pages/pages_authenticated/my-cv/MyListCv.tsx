"use client";

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
import { ArrowRight, Sparkles } from "lucide-react";
import { useGetUserResumes } from "@/queries/useUserResume";
import { listTemplateMetadata } from "../cv-templates/ListTemplate";
import ListCvSkeleton from "@/components/skeletons/list-cv-skeleton";
import { generateSlugUrl } from "@/lib/utils";

import { useTranslations } from "next-intl";

export default function PageMyListCv() {
  const t = useTranslations("Candidate.MyCv");
  const tCommon = useTranslations("Common");
  const tTemplates = useTranslations("Candidate.CvTemplates");
  const { data: listMyCvFetch, isLoading } = useGetUserResumes();

  const getTemplateTranslation = (key: string) => {
    switch (key) {
      case "basicTemplate":
        return {
          title: tTemplates("Templates.basicTemplate.title"),
          description: tTemplates("Templates.basicTemplate.desc"),
        };
      case "impressiveTemplate":
        return {
          title: tTemplates("Templates.impressiveTemplate.title"),
          description: tTemplates("Templates.impressiveTemplate.desc"),
        };
      case "modernTemplate":
        return {
          title: tTemplates("Templates.modernTemplate.title"),
          description: tTemplates("Templates.modernTemplate.desc"),
        };
      case "simpleTemplate":
        return {
          title: tTemplates("Templates.simpleTemplate.title"),
          description: tTemplates("Templates.simpleTemplate.desc"),
        };
      default:
        return {
          title: "",
          description: "",
        };
    }
  };

  //- vì response trả về không có field image và title nên ta sẽ thêm vào và dùng listTemplateMetadata để map theo listMyCvFetch.templateID === listTemplateMetadata.id để lấy image và title tương ứng
  const listMyCv = listMyCvFetch?.data?.map((template) => {
    const templateMetadata = listTemplateMetadata.find(
      (item) => item.id === template.templateID,
    );
    if (!templateMetadata) return template;
    const { title: defaultTitle, description: defaultDescription } = getTemplateTranslation(templateMetadata.key);
    return {
      ...template,
      image: template.image || templateMetadata.image,
      title: template.resumeName || template.title || defaultTitle,
      description: template.description || defaultDescription,
    };
  });

  if (isLoading) {
    return <ListCvSkeleton />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {t("Title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t("MyCvDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listMyCv?.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-full">
            {t("NoCv")}
          </p>
        ) : (
          listMyCv?.map((template, index) => (
            <Card
              key={index}
              className="flex flex-col pb-2 overflow-hidden h-full group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50"
            >
              <div className="relative aspect-[3/3] w-full bg-muted overflow-hidden">
                <Image
                  src={template.image!}
                  alt={template.title!}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-2 flex-col px-4">
                  <Button
                    variant="default"
                    className="rounded-full w-full"
                    asChild
                  >
                    <Link
                      href={`/my-cv/${generateSlugUrl({ name: template.templateID, id: template._id })}?edit=true`}
                    >
                      {tCommon("Buttons.viewDetail")}
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-full w-full bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-md"
                    asChild
                  >
                    <Link
                      href={`/my-cv/${generateSlugUrl({ name: template.templateID, id: template._id })}/ai-score`}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {t("AiScoreBtn")}
                    </Link>
                  </Button>
                </div>
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

              <CardFooter className="pt-0 flex flex-col gap-2">
                {/*- hiển thị nhóm nút chỉnh sửa và chấm điểm ai trực tiếp trên mobile */}
                <div className="flex flex-col gap-2 w-full sm:hidden">
                  <Button className="w-full" variant="outline" asChild>
                    <Link
                      href={`/my-cv/${generateSlugUrl({ name: template.templateID, id: template._id })}?edit=true`}
                    >
                      {tCommon("Buttons.edit")}
                    </Link>
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-2 font-medium"
                    asChild
                  >
                    <Link
                      href={`/my-cv/${generateSlugUrl({ name: template.templateID, id: template._id })}/ai-score`}
                    >
                      <Sparkles className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {t("AiScoreBtn")}
                    </Link>
                  </Button>
                </div>

                {/*- hiển thị nút chỉnh sửa mặc định trên desktop */}
                <Button
                  className="w-full group/btn hidden sm:flex"
                  variant="outline"
                  asChild
                >
                  <Link
                    href={`/my-cv/${generateSlugUrl({ name: template.templateID, id: template._id })}?edit=true`}
                  >
                    {tCommon("Buttons.edit")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
