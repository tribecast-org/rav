"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { MotionProvider } from "@/lib/motion/MotionProvider";
import { clearThemeTransitionArtifacts } from "@/lib/motion/theme-spread";
import { makeQueryClient } from "@/lib/query-client";
import { applyEasyMode, loadEasyMode, useUiStore } from "@/stores/useUiStore";

const THEME_STORAGE_KEY = "rav-theme";

function ThemeInitializer() {
  useEffect(() => {
    clearThemeTransitionArtifacts();
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  return null;
}

function EasyModeInitializer() {
  const easyMode = useUiStore((s) => s.easyMode);
  const hydrated = useRef(false);
  useEffect(() => {
    // The pre-paint script in layout.tsx already set the class; sync the store to it.
    if (!hydrated.current) {
      hydrated.current = true;
      if (loadEasyMode()) {
        useUiStore.setState({ easyMode: true });
        return;
      }
    }
    applyEasyMode(easyMode);
  }, [easyMode]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <EasyModeInitializer />
      <LazyMotion features={domAnimation}>
        <MotionProvider>{children}</MotionProvider>
      </LazyMotion>
      <Toaster
        position="bottom-center"
        toastOptions={{
          className:
            "!bg-foreground !text-background !border-border !shadow-lg !rounded-lg !text-sm",
        }}
      />
    </QueryClientProvider>
  );
}
