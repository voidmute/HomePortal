"use client";

import { motion } from "framer-motion";
import { spring, staggerContainer, staggerItem } from "@/lib/motion";
import { msg } from "@/lib/messages";

function ShareIconAnimation() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="mx-auto h-28 w-28 text-amber-dark md:h-32 md:w-32"
      aria-hidden
    >
      <motion.rect
        x="24"
        y="52"
        width="72"
        height="44"
        rx="10"
        fill="currentColor"
        fillOpacity="0.12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
      />
      <motion.path
        d="M60 18 L60 62 M60 18 L46 32 M60 18 L74 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.15 }}
      />
      <motion.circle
        cx="60"
        cy="74"
        r="6"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 0.45, duration: 0.5 }}
      />
      <motion.g
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65, ...spring }}
      >
        <rect x="38" y="86" width="44" height="10" rx="5" fill="currentColor" fillOpacity="0.35" />
        <text
          x="60"
          y="94"
          textAnchor="middle"
          fontSize="7"
          fill="currentColor"
          fontFamily="system-ui, sans-serif"
        >
          +
        </text>
      </motion.g>
    </svg>
  );
}

const steps = [
  { key: "safari", label: msg.iosStepSafari },
  { key: "share", label: msg.iosStepShare },
  { key: "home", label: msg.iosStepHome },
] as const;

export function IosInstallGuide() {
  return (
    <div className="space-y-8">
      <ShareIconAnimation />
      <motion.ol
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {steps.map((step, index) => (
          <motion.li
            key={step.key}
            variants={staggerItem}
            className="flex items-start gap-4 rounded-2xl bg-espresso/[0.03] px-5 py-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber/20 font-display text-lg text-amber-dark">
              {index + 1}
            </span>
            <p className="pt-1 text-cozy-lg text-espresso">{step.label}</p>
          </motion.li>
        ))}
      </motion.ol>
      <p className="text-center text-cozy text-stone">{msg.iosInstallNote}</p>
    </div>
  );
}
