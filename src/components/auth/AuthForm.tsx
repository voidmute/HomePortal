"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { verifyName, verifyTotp } from "@/actions/auth";
import { BezelCard } from "@/components/ui/BezelCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Icon } from "@/components/ui/Icon";
import { fadeSlideUp, spring } from "@/lib/motion";
import { msg } from "@/lib/messages";

type Step = "name" | "totp";

export function AuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      setError(msg.nameRequired);
      return;
    }

    setLoading(true);
    const result = await verifyName(name);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.qrCode) setQrCode(result.qrCode);
    setStep("totp");
  }

  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyTotp(name, code);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-14 text-center">
        <span className="mb-5 inline-block rounded-full bg-amber/15 px-4 py-2 text-sm font-medium text-amber-dark">
          {msg.secureAccess}
        </span>
        <h1 className="font-display text-5xl font-normal text-espresso md:text-6xl">
          {msg.homelab}
        </h1>
        <p className="mt-5 text-cozy-lg text-stone">{msg.enterCredentials}</p>
      </div>

      <BezelCard padding="lg" className="shadow-elevated">
        <div className="p-10 md:p-12">
          <form onSubmit={step === "name" ? handleNameSubmit : handleTotpSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  layout
                  animate={step === "totp" ? { scale: 0.98 } : { scale: 1 }}
                  transition={spring}
                >
                  <label className="mb-3 block text-sm font-medium text-stone">
                    {msg.name}
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={msg.enterName}
                    disabled={step === "totp"}
                    autoComplete="username"
                    autoFocus
                    className="py-4 text-xl"
                  />
                </motion.div>

                <AnimatePresence>
                  {step === "totp" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={spring}
                      className="overflow-hidden"
                    >
                      {qrCode && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, ...spring }}
                          className="mt-8 flex flex-col items-center"
                        >
                          <p className="mb-4 text-center text-cozy text-stone">
                            {msg.scanAuthenticator}
                          </p>
                          <img src={qrCode} alt={msg.totpQrAlt} className="rounded-2xl" />
                        </motion.div>
                      )}

                      <div className="mt-8">
                        <label className="mb-3 block text-sm font-medium text-stone">
                          {msg.totpCode}
                        </label>
                        <Input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          centered
                          autoComplete="one-time-code"
                          autoFocus
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={fadeSlideUp.initial}
                      animate={fadeSlideUp.animate}
                      exit={fadeSlideUp.exit}
                      transition={spring}
                      className="mt-6 rounded-2xl bg-rose/30 px-5 py-4 text-center text-cozy text-espresso"
                      role="alert"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={loading}
                  className="group mt-10 flex w-full items-center justify-center gap-3 py-4 text-cozy-lg"
                >
                  {loading ? msg.verifying : step === "name" ? msg.continue : msg.authenticate}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                    <Icon icon={ArrowRight} size={18} />
                  </span>
                </Button>
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      </BezelCard>
    </div>
  );
}
