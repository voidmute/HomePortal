"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeSlideUp, spring } from "@/lib/motion";

export function SpringTransition({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={fadeSlideUp.initial}
      animate={fadeSlideUp.animate}
      exit={fadeSlideUp.exit}
      transition={spring}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { spring };
