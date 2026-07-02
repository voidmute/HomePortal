"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { BezelCard } from "@/components/ui/BezelCard";
import { AnimatedUploader } from "@/components/ui/AnimatedUploader";
import { Button } from "@/components/ui/Button";
import { Download, File, Folder, Icon, X } from "@/components/ui/Icon";
import { SkeletonCard, SkeletonRow } from "@/components/ui/Skeleton";
import { fadeSlideUp, spring, staggerContainer, staggerItem, tapScale } from "@/lib/motion";
import { msg } from "@/lib/messages";

interface CloudItem {
  name: string;
  type: "file" | "directory";
  size: number;
  modified: string;
  path: string;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return msg.dash;
  const units = ["Б", "КБ", "МБ", "ГБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function CloudPage() {
  const [items, setItems] = useState<CloudItem[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async (path: string) => {
    setLoading(true);
    const res = await fetch(`/api/cloud?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.items) setItems(data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const breadcrumbs = currentPath ? currentPath.split("/").filter(Boolean) : [];

  function navigateTo(index: number) {
    const parts = breadcrumbs.slice(0, index + 1);
    setCurrentPath(parts.join("/"));
  }

  async function handleDelete(itemPath: string) {
    if (!confirm(msg.deleteConfirm)) return;
    await fetch(`/api/cloud?path=${encodeURIComponent(itemPath)}`, { method: "DELETE" });
    fetchFiles(currentPath);
  }

  function handleDownload(itemPath: string) {
    window.open(`/api/cloud/download?path=${encodeURIComponent(itemPath)}`, "_blank");
  }

  return (
    <div>
      <ModuleHeader
        eyebrow={msg.filesEyebrow}
        title={msg.files}
        description={msg.filesDescLong}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-2 text-cozy">
          <motion.button
            type="button"
            {...tapScale}
            onClick={() => setCurrentPath("")}
            className="min-h-touch rounded-full px-3 text-amber-dark"
          >
            {msg.root}
          </motion.button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-stone">/</span>
              <motion.button
                type="button"
                {...tapScale}
                onClick={() => navigateTo(i)}
                className="min-h-touch rounded-full px-2 text-amber-dark"
              >
                {crumb}
              </motion.button>
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "primary" : "ghost"}
            onClick={() => setView("grid")}
            className="min-h-touch px-4 py-2 text-sm"
          >
            {msg.grid}
          </Button>
          <Button
            variant={view === "list" ? "primary" : "ghost"}
            onClick={() => setView("list")}
            className="min-h-touch px-4 py-2 text-sm"
          >
            {msg.list}
          </Button>
        </div>
      </div>

      <AnimatedUploader currentPath={currentPath} onComplete={() => fetchFiles(currentPath)} />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <BezelCard>
                <div className="divide-y divide-espresso/5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              </BezelCard>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={currentPath + view}
            initial={fadeSlideUp.initial}
            animate={fadeSlideUp.animate}
            exit={fadeSlideUp.exit}
            transition={spring}
            layout
          >
            {view === "grid" ? (
              <motion.div
                className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {items.map((item) => (
                  <motion.div key={item.path} layout layoutId={item.path} variants={staggerItem}>
                    <BezelCard>
                      <motion.div
                        {...tapScale}
                        className="cursor-pointer p-4"
                        onClick={() => item.type === "directory" && setCurrentPath(item.path)}
                      >
                        <div className="mb-2 text-espresso">
                          <Icon icon={item.type === "directory" ? Folder : File} size={28} className="text-amber-dark" />
                        </div>
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-stone">{formatSize(item.size)}</p>
                        <div className="mt-2 flex gap-2">
                          {item.type === "file" && (
                            <motion.button
                              type="button"
                              {...tapScale}
                              onClick={(e) => { e.stopPropagation(); handleDownload(item.path); }}
                              className="flex h-11 w-11 items-center justify-center rounded-full text-amber-dark"
                              aria-label={msg.download}
                            >
                              <Icon icon={Download} size={16} />
                            </motion.button>
                          )}
                          <motion.button
                            type="button"
                            {...tapScale}
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.path); }}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-red-500"
                            aria-label={msg.delete}
                          >
                            <Icon icon={X} size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    </BezelCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <BezelCard>
                <motion.div
                  className="divide-y divide-espresso/5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.path}
                      layout
                      layoutId={item.path}
                      variants={staggerItem}
                      className="flex min-h-touch items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4"
                    >
                      <motion.button
                        type="button"
                        {...tapScale}
                        className="flex min-h-touch flex-1 cursor-pointer items-center gap-3 text-left"
                        onClick={() => item.type === "directory" && setCurrentPath(item.path)}
                      >
                        <Icon icon={item.type === "directory" ? Folder : File} size={20} className="shrink-0 text-amber-dark" />
                        <span className="truncate font-medium">{item.name}</span>
                      </motion.button>
                      <div className="flex shrink-0 items-center gap-2 text-sm text-stone sm:gap-4">
                        <span className="hidden sm:inline">{formatSize(item.size)}</span>
                        {item.type === "file" && (
                          <motion.button
                            type="button"
                            {...tapScale}
                            onClick={() => handleDownload(item.path)}
                            className="flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-full px-2 text-amber-dark"
                          >
                            <Icon icon={Download} size={16} />
                            <span className="hidden sm:inline">{msg.download}</span>
                          </motion.button>
                        )}
                        <motion.button
                          type="button"
                          {...tapScale}
                          onClick={() => handleDelete(item.path)}
                          className="flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-full px-2 text-red-500"
                        >
                          <Icon icon={X} size={16} />
                          <span className="hidden sm:inline">{msg.delete}</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </BezelCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
