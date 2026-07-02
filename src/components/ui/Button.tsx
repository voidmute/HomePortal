"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { buttonHover } from "@/lib/motion";

type ButtonVariant = "primary" | "ghost" | "danger";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "min-h-touch rounded-full bg-espresso px-8 py-4 text-cozy-lg text-cream transition-colors duration-300 hover:bg-charcoal disabled:opacity-50",
  ghost:
    "min-h-touch rounded-full bg-espresso/5 px-5 py-3 text-cozy text-espresso transition-colors duration-300 hover:bg-espresso/10 disabled:opacity-50",
  danger:
    "rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-500 transition-colors duration-300 hover:bg-red-500/20 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      {...buttonHover}
      disabled={disabled}
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
