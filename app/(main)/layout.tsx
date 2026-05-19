import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AppBootstrap } from "@/components/layout/AppBootstrap";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppBootstrap />
      <Sidebar />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
