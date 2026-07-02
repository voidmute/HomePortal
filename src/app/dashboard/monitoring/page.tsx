"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { BezelCard } from "@/components/ui/BezelCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Skeleton, SkeletonRing } from "@/components/ui/Skeleton";
import { spring } from "@/lib/motion";
import { msg } from "@/lib/messages";

interface Metrics {
  cpu: number;
  memory: { used: number; total: number; percent: number };
  disk: { used: number; total: number; percent: number };
  uptime: number;
  timestamp: number;
}

function ProgressRing({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#F5F1EB" strokeWidth="8" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={spring}
        />
      </svg>
      <div className="-mt-[88px] mb-12 text-center">
        <p className="text-2xl font-semibold text-espresso">
          <AnimatedNumber value={value} suffix="%" />
        </p>
        <p className="text-sm text-stone">{label}</p>
      </div>
    </div>
  );
}

function buildChartPath(history: number[], width: number, height: number): string {
  if (history.length < 2) return "";
  return history
    .map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (val / 100) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildAreaPath(history: number[], width: number, height: number): string {
  const line = buildChartPath(history, width, height);
  if (!line) return "";
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}д ${h}ч ${m}м`;
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 ** 3);
  return `${gb.toFixed(1)} ГБ`;
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);

  const chartWidth = 500;
  const chartHeight = 160;

  useEffect(() => {
    const es = new EventSource("/api/monitoring/stream");

    es.onmessage = (event) => {
      const data: Metrics = JSON.parse(event.data);
      if (!("error" in data)) {
        setMetrics(data);
        setCpuHistory((prev) => [...prev.slice(-59), data.cpu]);
      }
    };

    return () => es.close();
  }, []);

  const linePath = useMemo(
    () => buildChartPath(cpuHistory, chartWidth, chartHeight),
    [cpuHistory]
  );
  const areaPath = useMemo(
    () => buildAreaPath(cpuHistory, chartWidth, chartHeight),
    [cpuHistory]
  );

  const loading = !metrics;

  return (
    <div>
      <ModuleHeader
        eyebrow={msg.module02}
        title={msg.monitoring}
        description={msg.monitoringDescLong}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <BezelCard key={i}>
              <div className="flex justify-center p-8">
                <SkeletonRing />
              </div>
            </BezelCard>
          ))
        ) : (
          <>
            <BezelCard>
              <div className="flex justify-center p-8">
                <ProgressRing value={metrics.cpu} label={msg.cpu} color="#C4A574" />
              </div>
            </BezelCard>
            <BezelCard>
              <div className="flex justify-center p-8">
                <ProgressRing value={metrics.memory.percent} label={msg.memory} color="#8B9A7D" />
              </div>
            </BezelCard>
            <BezelCard>
              <div className="flex justify-center p-8">
                <ProgressRing value={metrics.disk.percent} label={msg.storage} color="#1A1410" />
              </div>
            </BezelCard>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <BezelCard>
          <div className="p-8">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-stone">{msg.cpuHistory}</h3>
            {loading || cpuHistory.length < 2 ? (
              <Skeleton className="h-[160px] w-full" />
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" preserveAspectRatio="none">
                <motion.path
                  d={areaPath}
                  fill="rgba(196, 165, 116, 0.15)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, d: areaPath }}
                  transition={spring}
                />
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="#C4A574"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1, d: linePath }}
                  transition={spring}
                />
              </svg>
            )}
          </div>
        </BezelCard>

        <BezelCard>
          <div className="p-8">
            <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-stone">{msg.systemDetails}</h3>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-stone">{msg.uptime}</dt>
                  <dd className="font-medium">{formatUptime(metrics.uptime)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone">{msg.memoryUsed}</dt>
                  <dd className="font-medium">
                    <AnimatedNumber value={metrics.memory.used / (1024 ** 3)} decimals={1} suffix=" ГБ" />
                    {" / "}
                    {formatBytes(metrics.memory.total)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone">{msg.diskUsed}</dt>
                  <dd className="font-medium">
                    <AnimatedNumber value={metrics.disk.used / (1024 ** 3)} decimals={1} suffix=" ГБ" />
                    {" / "}
                    {formatBytes(metrics.disk.total)}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </BezelCard>
      </div>
    </div>
  );
}
