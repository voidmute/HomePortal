"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { BezelCard } from "@/components/ui/BezelCard";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusDot";
import { ArrowRight, Icon } from "@/components/ui/Icon";
import { SkeletonCard, SkeletonRow } from "@/components/ui/Skeleton";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { auditActionLabel, msg, overallStatusLabel } from "@/lib/messages";

interface BackupStatus {
  schedule: string;
  database: { lastBackup: { filename: string; date: string; size: number } | null; healthy: boolean };
  cloud: { lastBackup: { filename: string; date: string; size: number } | null; healthy: boolean };
  overall: string;
}

interface AuditLog {
  id: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export default function BackupPage() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [triggering, setTriggering] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [statusRes, logsRes] = await Promise.all([
      fetch("/api/backup/status"),
      fetch("/api/backup/logs"),
    ]);
    setStatus(await statusRes.json());
    const logsData = await logsRes.json();
    setLogs(logsData.logs || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleTrigger() {
    setTriggering(true);
    await fetch("/api/backup/trigger", { method: "POST" });
    setTriggering(false);
    load();
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("ru-RU");
  }

  function formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} МБ`;
  }

  return (
    <div>
      <ModuleHeader
        eyebrow={msg.module04}
        title={msg.backupLab}
        description={msg.backupDescLong}
      />

      <motion.div
        className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <motion.div key={i} variants={staggerItem}>
              <SkeletonCard className="min-h-[160px]" />
            </motion.div>
          ))
        ) : (
          <>
            <motion.div variants={staggerItem}>
              <BezelCard>
                <div className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <StatusDot
                      status={triggering ? "running" : status?.overall === "healthy" ? "healthy" : "idle"}
                    />
                    <h3 className="font-medium">{msg.overallStatus}</h3>
                  </div>
                  <p className="text-2xl font-display capitalize text-espresso">
                    {overallStatusLabel(status?.overall)}
                  </p>
                  <p className="mt-2 text-sm text-stone">
                    {msg.schedule}: {status?.schedule || msg.dash}
                  </p>
                </div>
              </BezelCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <BezelCard>
                <div className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <StatusDot status={status?.database.healthy ? "healthy" : "warning"} />
                    <h3 className="font-medium">{msg.database}</h3>
                  </div>
                  {status?.database.lastBackup ? (
                    <>
                      <p className="truncate text-sm font-medium">{status.database.lastBackup.filename}</p>
                      <p className="text-xs text-stone">
                        {formatDate(status.database.lastBackup.date)} · {formatSize(status.database.lastBackup.size)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-stone">{msg.noBackupsYet}</p>
                  )}
                </div>
              </BezelCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <BezelCard>
                <div className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <StatusDot status={status?.cloud.healthy ? "healthy" : "warning"} />
                    <h3 className="font-medium">{msg.privateCloud}</h3>
                  </div>
                  {status?.cloud.lastBackup ? (
                    <>
                      <p className="truncate text-sm font-medium">{status.cloud.lastBackup.filename}</p>
                      <p className="text-xs text-stone">
                        {formatDate(status.cloud.lastBackup.date)} · {formatSize(status.cloud.lastBackup.size)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-stone">{msg.noBackupsYet}</p>
                  )}
                </div>
              </BezelCard>
            </motion.div>
          </>
        )}
      </motion.div>

      <div className="mb-10">
        <Button
          onClick={handleTrigger}
          disabled={triggering}
          className="group flex items-center gap-2"
        >
          {triggering ? msg.runningBackup : msg.triggerBackup}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Icon icon={ArrowRight} size={16} />
          </span>
        </Button>
      </div>

      <BezelCard>
        <div className="p-8">
          <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-stone">{msg.backupHistory}</h3>
          {loading ? (
            <div className="divide-y divide-espresso/5">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-stone">{msg.noBackupEvents}</p>
          ) : (
            <motion.div
              className="divide-y divide-espresso/5"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  variants={staggerItem}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot
                      status={log.action === "BACKUP_SUCCESS" ? "healthy" : log.action === "BACKUP_FAIL" ? "error" : "warning"}
                      pulse={false}
                    />
                    <span className="font-medium">{auditActionLabel(log.action)}</span>
                  </div>
                  <span className="text-sm text-stone">{formatDate(log.timestamp)}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </BezelCard>
    </div>
  );
}
