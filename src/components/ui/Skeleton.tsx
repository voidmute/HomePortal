"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <motion.div
      className={`rounded-inner bg-espresso/10 ${className}`}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function SkeletonText({ className = "" }: SkeletonProps) {
  return <Skeleton className={`h-4 ${className}`} />;
}

export function SkeletonRow({ className = "" }: SkeletonProps) {
  return (
    <div className={`flex items-center gap-3 px-6 py-4 ${className}`}>
      <Skeleton className="h-5 w-5 rounded-full" />
      <SkeletonText className="flex-1 max-w-[200px]" />
      <SkeletonText className="w-16" />
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-bezel bg-black/[0.03] p-1 ring-1 ring-black/5 ${className}`}>
      <div className="rounded-inner bg-cream p-4">
        <Skeleton className="mb-3 aspect-square w-full" />
        <SkeletonText className="mb-2 w-3/4" />
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRing({ className = "" }: SkeletonProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Skeleton className="h-[140px] w-[140px] rounded-full" />
      <SkeletonText className="mt-4 w-12" />
    </div>
  );
}
