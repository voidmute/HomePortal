"use client";

import { motion } from "framer-motion";
import { pageEnter, spring } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={pageEnter.initial}
      animate={pageEnter.animate}
      exit={pageEnter.exit}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}
