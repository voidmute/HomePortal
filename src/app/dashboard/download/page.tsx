"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IosInstallGuide } from "@/components/download/IosInstallGuide";
import { BezelCard } from "@/components/ui/BezelCard";
import { Download, Smartphone, Icon } from "@/components/ui/Icon";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { staggerContainer, staggerItem, spring } from "@/lib/motion";
import { msg } from "@/lib/messages";

const APK_URL = process.env.NEXT_PUBLIC_APK_URL ?? "";

function detectMobilePlatform(): "android" | "ios" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  return "other";
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other");
  const [iosOpen, setIosOpen] = useState(false);

  useEffect(() => {
    const detected = detectMobilePlatform();
    setPlatform(detected);
    if (detected === "ios") setIosOpen(true);
  }, []);

  const apkReady = APK_URL.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
      <ModuleHeader
        eyebrow={msg.downloadAppEyebrow}
        title={msg.downloadApp}
        description={msg.downloadAppDesc}
      />

      <motion.div
        className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <BezelCard className="h-full shadow-elevated">
            <div
              className={`p-8 md:p-10 ${
                platform === "android" ? "ring-2 ring-amber/30 ring-offset-2 ring-offset-cream" : ""
              }`}
            >
              <div className="mb-6 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/15">
                  <Icon icon={Smartphone} size={26} className="text-amber-dark" />
                </span>
                <div>
                  <h2 className="font-display text-2xl text-espresso md:text-3xl">
                    {msg.downloadAndroid}
                  </h2>
                  <p className="mt-1 text-cozy text-stone">{msg.downloadAndroidSub}</p>
                </div>
              </div>

              {apkReady ? (
                <motion.a
                  href={APK_URL}
                  download
                  className="mb-8 flex min-h-touch w-full items-center justify-center gap-3 rounded-full bg-espresso px-8 py-4 text-cozy-lg text-cream transition-colors hover:bg-charcoal"
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                >
                  <Icon icon={Download} size={20} />
                  {msg.downloadApkButton}
                </motion.a>
              ) : (
                <div className="mb-8 rounded-2xl border border-dashed border-stone/30 bg-espresso/[0.03] px-6 py-5 text-cozy text-stone">
                  {msg.downloadApkPending}
                </div>
              )}

              <div className="space-y-3 rounded-2xl bg-espresso/[0.03] p-5">
                <h3 className="font-medium text-espresso">{msg.downloadHowToInstall}</h3>
                <ol className="list-decimal space-y-2 pl-5 text-cozy text-stone">
                  <li>{msg.downloadAndroidStep1}</li>
                  <li>{msg.downloadAndroidStep2}</li>
                  <li>{msg.downloadAndroidStep3}</li>
                </ol>
              </div>
            </div>
          </BezelCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <BezelCard className="h-full shadow-elevated">
            <div
              className={`p-8 md:p-10 ${
                platform === "ios" ? "ring-2 ring-amber/30 ring-offset-2 ring-offset-cream" : ""
              }`}
            >
              <div className="mb-6 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/15 text-2xl">
                  
                </span>
                <div>
                  <h2 className="font-display text-2xl text-espresso md:text-3xl">
                    {msg.downloadIos}
                  </h2>
                  <p className="mt-1 text-cozy text-stone">{msg.downloadIosSub}</p>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={() => setIosOpen((open) => !open)}
                className="mb-6 flex min-h-touch w-full items-center justify-center rounded-full bg-espresso/5 px-8 py-4 text-cozy-lg text-espresso transition-colors hover:bg-espresso/10"
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                {iosOpen ? msg.downloadIosHide : msg.downloadIosShow}
              </motion.button>

              {iosOpen && <IosInstallGuide />}
            </div>
          </BezelCard>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
