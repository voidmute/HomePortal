"use client";

import { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cardHover, spring } from "@/lib/motion";

interface BezelCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const paddingMap = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
};

export function BezelCard({
  children,
  className = "",
  padding = "md",
  interactive = false,
  ...props
}: BezelCardProps) {
  return (
    <motion.div
      layout
      className={`rounded-bezel bg-black/[0.03] ring-1 ring-black/5 ${paddingMap[padding]} ${className}`}
      {...(interactive
        ? {
            ...cardHover,
            whileHover: {
              scale: 1.02,
              boxShadow: "0 32px 80px -24px rgba(42, 34, 28, 0.16), 0 8px 24px -8px rgba(212, 169, 106, 0.2)",
            },
            transition: spring,
          }
        : {})}
      {...props}
    >
      <div className="rounded-inner bg-cream shadow-ambient shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
        {children}
      </div>
    </motion.div>
  );
}
