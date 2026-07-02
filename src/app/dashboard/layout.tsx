import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { msg } from "@/lib/messages";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="family-bg min-h-[100dvh]">
      <DashboardNav
        userName={session.name || msg.user}
        isAdmin={session.role === "ADMIN"}
      />
      <main className="mx-auto max-w-6xl px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))] md:px-8 md:pb-28 md:pt-32">
        {children}
      </main>
    </div>
  );
}
