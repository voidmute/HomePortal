"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { Upload, Icon } from "@/components/ui/Icon";
import { mobileSpring, spring, staggerContainer, staggerItem } from "@/lib/motion";
import { msg } from "@/lib/messages";

type UploadStatus = "queued" | "uploading" | "success" | "error";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
}

interface AnimatedUploaderProps {
  currentPath: string;
  onComplete: () => void;
}

const DROPZONE_LAYOUT_ID = "upload-dropzone";

function uploadWithProgress(
  file: File,
  path: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("upload failed"));
    });

    xhr.addEventListener("error", () => reject(new Error("upload failed")));
    xhr.open("POST", "/api/cloud/upload");
    xhr.send(formData);
  });
}

function SuccessCheckmark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-sage" aria-hidden>
      <motion.path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={spring}
      />
    </svg>
  );
}

function SpinnerRing() {
  return (
    <motion.svg
      viewBox="0 0 40 40"
      className="h-10 w-10"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      aria-hidden
    >
      <motion.circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke="rgba(212, 169, 106, 0.25)"
        strokeWidth="3"
      />
      <motion.circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke="#D4A96A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="24 76"
      />
    </motion.svg>
  );
}

function UploadRow({ item, onRemove }: { item: UploadItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (item.status !== "success") return;
    const timer = setTimeout(() => onRemove(item.id), 2000);
    return () => clearTimeout(timer);
  }, [item.status, item.id, onRemove]);

  return (
    <motion.div
      layout
      variants={staggerItem}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={spring}
      className="overflow-hidden rounded-2xl bg-cream-muted/80 px-4 py-3"
    >
      <div className="mb-2 flex min-h-touch items-center justify-between gap-3">
        <p className="truncate text-cozy font-medium text-espresso">{item.file.name}</p>
        {item.status === "success" ? (
          <SuccessCheckmark />
        ) : (
          <span className="shrink-0 text-sm text-stone">{item.progress}%</span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-espresso/10">
        {item.status === "success" ? (
          <motion.div
            className="flex h-full items-center justify-center rounded-full bg-sage"
            initial={{ width: `${item.progress}%` }}
            animate={{ width: "100%" }}
            transition={spring}
          />
        ) : (
          <motion.div
            className="h-full rounded-full bg-amber"
            initial={{ width: 0 }}
            animate={{ width: `${item.progress}%` }}
            transition={spring}
          />
        )}
      </div>
      {item.status === "success" && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-sage"
        >
          {msg.uploadSuccess}
        </motion.p>
      )}
    </motion.div>
  );
}

export function AnimatedUploader({ currentPath, onComplete }: AnimatedUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const isSingleUploading = isBusy && queue.length === 1 && queue[0]?.status === "uploading";
  const showList = queue.length > 1;

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (!fileArray.length) return;

      const newItems: UploadItem[] = fileArray.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: "queued" as const,
      }));

      setQueue((prev) => [...prev, ...newItems]);
      setIsBusy(true);

      for (const item of newItems) {
        updateItem(item.id, { status: "uploading", progress: 0 });
        try {
          await uploadWithProgress(item.file, currentPath, (progress) => {
            updateItem(item.id, { progress });
          });
          updateItem(item.id, { status: "success", progress: 100 });
        } catch {
          updateItem(item.id, { status: "error", progress: 0 });
        }
      }

      setIsBusy(false);
      onComplete();
    },
    [currentPath, onComplete, updateItem]
  );

  useEffect(() => {
    if (!isBusy && queue.length > 0 && queue.every((q) => q.status === "success")) {
      const timer = setTimeout(() => setQueue([]), 2200);
      return () => clearTimeout(timer);
    }
  }, [isBusy, queue]);

  return (
    <LayoutGroup>
      <div className="mb-10">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <motion.div
          layout
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
          }}
          animate={{
            borderColor: dragOver ? "rgba(212, 169, 106, 0.9)" : "rgba(42, 34, 28, 0.12)",
            backgroundColor: dragOver ? "rgba(212, 169, 106, 0.08)" : "rgba(253, 248, 243, 0.6)",
            boxShadow: dragOver
              ? "0 0 32px rgba(212, 169, 106, 0.35)"
              : "0 8px 32px rgba(42, 34, 28, 0.06)",
          }}
          transition={spring}
          className="rounded-bezel border-2 border-dashed"
        >
          <motion.button
            type="button"
            layoutId={DROPZONE_LAYOUT_ID}
            onClick={() => !isBusy && inputRef.current?.click()}
            disabled={isBusy}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: isBusy ? 1 : 1.02 }}
            transition={spring}
            className="flex min-h-[120px] w-full flex-col items-center justify-center gap-3 px-6 py-10 md:min-h-[140px] md:py-12"
          >
            <AnimatePresence mode="wait">
              {isSingleUploading ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={spring}
                  className="flex flex-col items-center gap-3"
                >
                  <SpinnerRing />
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-cozy-lg text-stone"
                  >
                    {msg.uploading}
                  </motion.p>
                  <motion.div
                    className="h-1.5 w-48 overflow-hidden rounded-full bg-espresso/10"
                    layout
                  >
                    <motion.div
                      className="h-full rounded-full bg-amber"
                      animate={{ width: `${queue[0]?.progress ?? 0}%` }}
                      transition={spring}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={spring}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/15"
                    animate={dragOver ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={dragOver ? { duration: 0.8, repeat: Infinity } : spring}
                  >
                    <Icon icon={Upload} size={26} className="text-amber-dark" />
                  </motion.div>
                  <p className="text-cozy-lg font-medium text-espresso">{msg.upload}</p>
                  <p className="text-cozy text-stone">{msg.uploadTap}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showList && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className="mt-4 overflow-hidden"
            >
              <motion.div
                className="flex flex-col gap-3"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout">
                  {queue.map((item) => (
                    <UploadRow key={item.id} item={item} onRemove={removeItem} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
