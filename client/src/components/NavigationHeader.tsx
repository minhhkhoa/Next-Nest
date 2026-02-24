"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { useGetListCategories } from "@/queries/useNewsCategory";
import { generateSlugUrl } from "@/lib/utils";
import { useAppStore } from "./TanstackProvider";
import { useTranslations } from "next-intl";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export default function NavigationHeaderMenu() {

  const t = useTranslations("Header.NavigateHeader");
  const isMobile = useIsMobile();
  const { isLogin } = useAppStore();

  const { data: listCateNews } = useGetListCategories();

  return (
    !isMobile && (
      <NavigationMenu orientation="vertical" viewport={isMobile}>
        <NavigationMenuList className="flex-col md:flex-row items-start md:items-center">
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/">{t("Home")}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>{t("Jobs")}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {isLogin && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Link href="/cv-templates">{t("CreateCv.Title")}</Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/cv-templates">
                        <div className="font-medium">{t("CreateCv.Item1.Title")}</div>
                        <div className="text-muted-foreground">
                          {t("CreateCv.Item1.Description")}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/cv-templates">
                        <div className="font-medium">{t("CreateCv.Item2.Title")}</div>
                        <div className="text-muted-foreground">
                          {t("CreateCv.Item2.Description")}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/cv-templates">
                        <div className="font-medium">{t("CreateCv.Item3.Title")}</div>
                        <div className="text-muted-foreground">
                          {t("CreateCv.Item3.Description")}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}

          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Link href="/cate-news">{t("Career")}</Link>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px]">
                {listCateNews?.data?.map((item) => (
                  <li key={item._id}>
                    <NavigationMenuLink asChild>
                      <Link
                        className="max-w-[200px]"
                        href={`/cate-news/${generateSlugUrl({
                          name: item.slug.vi,
                          id: item._id,
                        })}`}
                      >
                        <div className="font-medium !whitespace-nowrap truncate">
                          {item.name.vi}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <Separator className="" />
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
