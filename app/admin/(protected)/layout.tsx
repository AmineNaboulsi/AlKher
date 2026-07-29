import { LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-24 pb-16 min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <AdminNav />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </form>
        </div>
        {children}
      </div>
    </div>
  );
}
