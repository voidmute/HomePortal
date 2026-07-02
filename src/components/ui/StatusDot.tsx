"use client";

import { motion } from "framer-motion";

interface StatusDotProps {
  status: "healthy" | "warning" | "error" | "idle" | "running";
  pulse?: boolean;
}

const statusColors = {
  healthy: "bg-sage",
  warning: "bg-amber",
  error: "bg-red-500",
  idle: "bg-stone/40",
  running: "bg-amber",
};

const glowColors = {
  healthy: "rgba(139, 154, 125, 0.6)",
  warning: "rgba(196, 165, 116, 0.6)",
  error: "rgba(239, 68, 68, 0.5)",
  running: "rgba(196, 165, 116, 0.7)",
  idle: "transparent",
};

export function StatusDot({ status, pulse = true }: StatusDotProps) {
  const shouldPulse = pulse && status !== "idle";
  const glow = glowColors[status];

  return (
    <span className="relative inline-flex h-3 w-3">
      {shouldPulse && (
        <motion.span
          className={`absolute inline-flex h-full w-full rounded-full ${statusColors[status]}`}
          animate={{
            boxShadow: [
              `0 0 0 0 ${glow}`,
              `0 0 0 4px transparent`,
              `0 0 0 0 ${glow}`,
            ],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: status === "running" ? 1.5 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      <span className={`relative inline-flex h-3 w-3 rounded-full ${statusColors[status]}`} />
    </span>
  );
}
