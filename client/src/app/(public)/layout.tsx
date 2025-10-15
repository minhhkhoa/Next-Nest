import { ModeToggle } from "@/components/ModeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <header className="sticky top-0 z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background">
        <div className="container mx-auto flex h-full items-center justify-between">
          <div className="flex items-center gap-2 mr-4">
            <ModeToggle />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
