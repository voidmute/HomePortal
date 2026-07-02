"use client";

import { motion } from "framer-motion";
import { spring } from "@/lib/motion";

interface ModuleHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function ModuleHeader({ eyebrow, title, description }: ModuleHeaderProps) {
  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      {eyebrow && (
        <span className="mb-5 inline-block rounded-full bg-amber/15 px-4 py-1.5 text-sm font-medium text-amber-dark">
          {eyebrow}
        </span>
      )}
      <h1 className="font-display text-4xl font-normal text-espresso md:text-6xl">{title}</h1>
      {description && <p className="mt-5 max-w-2xl text-cozy-lg text-stone">{description}</p>}
    </motion.div>
  );
}
