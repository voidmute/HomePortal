"use client";

import { motion } from "framer-motion";
import { spring } from "@/lib/motion";
import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & {
  centered?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", centered = false, ...props }, ref) => {
    return (
      <motion.input
        ref={ref}
        initial={false}
        whileFocus={{
          boxShadow: "inset 0 2px 8px rgba(26, 20, 16, 0.06), 0 0 0 2px rgba(196, 165, 116, 0.2)",
          borderColor: "rgba(196, 165, 116, 1)",
        }}
        transition={spring}
        className={`w-full rounded-2xl border border-espresso/10 bg-cream-muted px-5 py-4 text-lg text-espresso outline-none transition-colors duration-300 placeholder:text-stone/50 focus:border-amber disabled:opacity-60 ${
          centered ? "text-center text-2xl tracking-[0.5em] placeholder:text-stone/30" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
