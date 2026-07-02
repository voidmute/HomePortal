import { getSession } from "@/lib/auth";
import { DashboardModules } from "@/components/dashboard/DashboardModules";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { msg } from "@/lib/messages";

export default async function DashboardPage() {
  const session = await getSession();
  const isAdmin = session.role === "ADMIN";

  return (
    <div>
      <ModuleHeader
        eyebrow={msg.dashboardEyebrow}
        title={msg.dashboardTitle}
        description={msg.dashboardDescription}
      />
      <DashboardModules isAdmin={isAdmin} />
    </div>
  );
}
