"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Folder, Home, Menu, X, Icon } from "@/components/ui/Icon";
import { mobileSpring, staggerContainer, staggerItem, spring, tapScale } from "@/lib/motion";
import { msg } from "@/lib/messages";
import type { ComponentType } from "react";
import type { IconProps } from "react-feather";

const baseNavItems: {
  href: string;
  label: string;
  exact?: boolean;
  icon: ComponentType<IconProps>;
}[] = [
  { href: "/dashboard", label: msg.overview, exact: true, icon: Home },
  { href: "/dashboard/cloud", label: msg.files, icon: Folder },
];

const adminNavItems = [
  { href: "/dashboard/monitoring", label: msg.monitoring },
  { href: "/dashboard/backup", label: msg.backupLab },
];

export function DashboardNav({
  userName,
  isAdmin,
}: {
  userName: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [adminOpen, setAdminOpen] = useState(false);
  const mobileItems = baseNavItems;

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop / tablet top nav */}
      <nav className="fixed left-1/2 top-5 z-40 hidden w-[calc(100%-2.5rem)] max-w-4xl -translate-x-1/2 md:block">
        <div className="glass-panel flex items-center justify-between rounded-full px-8 py-3">
          <Link href="/dashboard" className="font-display text-2xl text-espresso">
            {msg.homelab}
          </Link>
          <div className="flex items-center gap-1">
            {mobileItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-touch rounded-full px-5 py-2.5 text-cozy transition-colors duration-300 ${
                  isActive(item.href, item.exact)
                    ? "bg-espresso text-cream"
                    : "text-stone hover:bg-espresso/5 hover:text-espresso"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin &&
              adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-h-touch rounded-full px-5 py-2.5 text-cozy transition-colors duration-300 ${
                    pathname.startsWith(item.href)
                      ? "bg-espresso text-cream"
                      : "text-stone hover:bg-espresso/5 hover:text-espresso"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cozy capitalize text-stone">{userName}</span>
            <Button variant="ghost" onClick={handleLogout} className="min-h-touch px-5 py-2.5 text-cozy">
              {msg.signOut}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-espresso/5 bg-glass/95 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:hidden">
        <div className="flex min-h-touch items-center justify-between">
          <Link href="/dashboard" className="font-display text-xl text-espresso">
            {msg.homelab}
          </Link>
          <div className="flex items-center gap-2">
            <span className="max-w-[80px] truncate text-sm capitalize text-stone">{userName}</span>
            {!isAdmin && (
              <motion.button
                type="button"
                {...tapScale}
                onClick={handleLogout}
                className="min-h-touch rounded-full bg-espresso/5 px-3 text-xs text-espresso"
              >
                {msg.signOut}
              </motion.button>
            )}
            {isAdmin && (
              <motion.button
                type="button"
                {...tapScale}
                onClick={() => setAdminOpen((o) => !o)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-espresso/5"
                aria-label="Дополнительное меню"
              >
                <Icon icon={adminOpen ? X : Menu} size={20} />
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile admin sheet */}
      <AnimatePresence>
        {isAdmin && adminOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-espresso/20 backdrop-blur-sm md:hidden"
              onClick={() => setAdminOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={mobileSpring}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border border-espresso/5 bg-cream px-5 pb-safe pt-4 md:hidden"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-espresso/15" />
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-2">
                {adminNavItems.map((item) => (
                  <motion.div key={item.href} variants={staggerItem}>
                    <Link
                      href={item.href}
                      onClick={() => setAdminOpen(false)}
                      className={`flex min-h-touch items-center rounded-2xl px-5 text-cozy ${
                        pathname.startsWith(item.href) ? "bg-espresso text-cream" : "text-stone"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div variants={staggerItem}>
                  <Button variant="ghost" onClick={handleLogout} className="min-h-touch w-full text-cozy">
                    {msg.signOut}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={mobileSpring}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-espresso/5 bg-glass/95 px-2 pb-safe pt-2 backdrop-blur-xl md:hidden"
      >
        <div className="grid grid-cols-2 gap-1">
          {mobileItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <motion.div key={item.href} whileTap={{ scale: 0.95 }} transition={spring}>
                <Link
                  href={item.href}
                  className={`flex min-h-touch flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 ${
                    active ? "bg-espresso/10 text-espresso" : "text-stone"
                  }`}
                >
                  <Icon icon={item.icon} size={20} className={active ? "text-amber-dark" : ""} />
                  <span className="text-[11px] font-medium leading-none">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
