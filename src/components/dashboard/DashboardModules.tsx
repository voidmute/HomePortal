"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BezelCard } from "@/components/ui/BezelCard";
import { ArrowRight, Icon } from "@/components/ui/Icon";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { msg } from "@/lib/messages";

const baseSections = [
  {
    href: "/dashboard/cloud",
    title: msg.files,
    description: msg.filesDesc,
    eyebrow: msg.filesEyebrow,
  },
  {
    href: "/dashboard/download",
    title: msg.downloadApp,
    description: msg.downloadAppDesc,
    eyebrow: msg.downloadAppEyebrow,
  },
];

const adminSections = [
  {
    href: "/dashboard/monitoring",
    title: msg.monitoring,
    description: msg.monitoringDesc,
    eyebrow: msg.adminEyebrow,
  },
  {
    href: "/dashboard/backup",
    title: msg.backupLab,
    description: msg.backupDesc,
    eyebrow: msg.adminEyebrow,
  },
];

export function DashboardModules({ isAdmin }: { isAdmin: boolean }) {
  const sections = isAdmin ? [...baseSections, ...adminSections] : baseSections;

  return (
    <motion.div
      className={`grid grid-cols-1 gap-8 ${isAdmin ? "md:grid-cols-2" : "md:grid-cols-2"}`}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {sections.map((section) => (
        <motion.div key={section.href} variants={staggerItem} className="group">
          <Link href={section.href} className="block h-full">
            <BezelCard interactive className="h-full shadow-elevated">
              <div className="flex min-h-[260px] flex-col justify-between p-10 md:min-h-[300px] md:p-12">
                <div>
                  <span className="mb-5 inline-block rounded-full bg-amber/15 px-4 py-1.5 text-sm font-medium text-amber-dark">
                    {section.eyebrow}
                  </span>
                  <h2 className="font-display text-3xl text-espresso md:text-4xl">{section.title}</h2>
                  <p className="mt-4 text-cozy-lg text-stone">{section.description}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-3 text-cozy font-medium text-amber-dark transition-transform duration-300 group-hover:translate-x-1">
                  {msg.openSection}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber/15">
                    <Icon icon={ArrowRight} size={18} className="text-amber-dark" />
                  </span>
                </span>
              </div>
            </BezelCard>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
