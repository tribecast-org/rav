"use client";

import { useCallback, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  PenSquare,
  Users,
  Calendar,
  Settings,
  Moon,
  Sun,
  Keyboard,
  LogOut,
  Type,
} from "lucide-react";
import { Tooltip } from "radix-ui";
import { apiPost } from "@/lib/api";
import { runThemeSpreadTransition } from "@/lib/motion/theme-spread";
import { cn } from "@/lib/utils";
import { useComposeStore } from "@/stores/useComposeStore";
import { useUiStore } from "@/stores/useUiStore";
import { useUpdateDisplayPreferences } from "@/hooks/useDisplayPreferences";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { useWsStatus } from "@/lib/ws-context";
import { useQueryClient } from "@tanstack/react-query";
import { BrandMark } from "@/components/shared/BrandMark";

type NavButtonClickEvent = MouseEvent<Element>;

function NavButton({
  icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: (event: NavButtonClickEvent) => void;
}) {
  const tooltipLabel = disabled ? `${label} (coming soon)` : label;
  const shouldAnimate = useUiStore((s) => s.effectiveAnimationMode) !== "off";
  // Easy mode spells out every button instead of relying on icon + tooltip.
  const showLabel = useUiStore((s) => s.easyMode);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={tooltipLabel}
          className={cn(
            "flex items-center justify-center rounded-lg transition-colors",
            showLabel ? "w-full flex-col gap-0.5 px-1 py-1.5 text-xs font-medium" : "size-10",
            disabled
              ? "cursor-not-allowed text-sidebar-foreground/30"
              : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 active:bg-sidebar-foreground/15 hover:text-sidebar-foreground",
            active && "bg-sidebar-accent text-sidebar-foreground active:bg-sidebar-accent/80",
          )}
        >
          {icon}
          {showLabel && <span className="leading-tight">{label}</span>}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className={cn(
            "rounded-md bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md border border-border",
            shouldAnimate && "animate-in fade-in-0 zoom-in-95",
          )}
        >
          {tooltipLabel}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function useResolvedTheme() {
  const theme = useUiStore((s) => s.theme);
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

const THEME_STORAGE_KEY = "rav-theme";

export function NavRail() {
  const { status: wsStatus, failCount: wsFailCount } = useWsStatus();
  const router = useRouter();
  const queryClient = useQueryClient();
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const setTheme = useUiStore((s) => s.setTheme);
  const effectiveAnimationMode = useUiStore((s) => s.effectiveAnimationMode);
  const updatePrefs = useUpdateDisplayPreferences();
  const resolvedTheme = useResolvedTheme();
  const easyMode = useUiStore((s) => s.easyMode);
  const setEasyMode = useUiStore((s) => s.setEasyMode);

  const toggleTheme = useCallback((event: NavButtonClickEvent) => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    runThemeSpreadTransition({
      mode: effectiveAnimationMode,
      trigger: "explicit",
      origin: { x: event.clientX, y: event.clientY },
      applyTheme: () => setTheme(next),
      nextTheme: next,
    });
    localStorage.setItem(THEME_STORAGE_KEY, next);
    updatePrefs.mutate({ theme: next });
  }, [effectiveAnimationMode, resolvedTheme, setTheme, updatePrefs]);

  const handleLogout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch {
      // Even if the API call fails, redirect to login
    }
    queryClient.clear();
    router.replace("/");
  }, [router, queryClient]);

  return (
    <Tooltip.Provider delayDuration={400}>
      <div
        className={cn(
          "relative hidden md:flex h-full flex-col items-center border-r border-border bg-sidebar py-3",
          easyMode ? "w-24 px-1.5" : "w-14",
        )}
      >
        {/* Logo slot */}
        <div className="mb-4 flex size-10 items-center justify-center">
          <BrandMark />
        </div>

        {/* Top actions */}
        <div className={cn("flex flex-col items-center gap-1", easyMode && "w-full")}>
          {/* Compose - primary action, visually distinct from nav destinations */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => useComposeStore.getState().openCompose()}
                aria-label="Compose new message"
                className={cn(
                  "group mb-1 flex items-center justify-center transition-colors",
                  easyMode
                    ? "w-full flex-col gap-0.5 rounded-lg bg-primary px-1 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    : "size-10 rounded-full bg-primary/15 text-primary hover:bg-primary/25 active:bg-primary/30",
                )}
              >
                <PenSquare className="size-5" />
                {easyMode && <span>Write</span>}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className={cn(
                  "rounded-md bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md border border-border",
                  effectiveAnimationMode !== "off" && "animate-in fade-in-0 zoom-in-95",
                )}
              >
                Compose new message (C)
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <NavButton
            icon={<Mail className="size-5" />}
            label="Mail"
            active={viewMode === "mail"}
            onClick={() => setViewMode("mail")}
          />
          {/* Easy mode keeps the chrome to mail + settings */}
          {!easyMode && (
            <>
              <NavButton
                icon={<Users className="size-5" />}
                label="Contacts"
                active={viewMode === "contacts"}
                onClick={() => setViewMode(viewMode === "contacts" ? "mail" : "contacts")}
              />
              <NavButton
                icon={<Calendar className="size-5" />}
                label="Calendar"
                active={viewMode === "calendar"}
                onClick={() => setViewMode(viewMode === "calendar" ? "mail" : "calendar")}
              />
            </>
          )}
          <NavButton
            icon={<Settings className="size-5" />}
            label="Settings"
            active={viewMode === "settings"}
            onClick={() => setViewMode(viewMode === "settings" ? "mail" : "settings")}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        <ConnectionStatus status={wsStatus} failCount={wsFailCount} />

        {/* Bottom actions */}
        <div className={cn("flex flex-col items-center gap-1", easyMode && "w-full")}>
          <NavButton
            icon={
              resolvedTheme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )
            }
            label={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            onClick={toggleTheme}
          />
          <NavButton
            icon={<Type className="size-5" />}
            label={easyMode ? "Standard view" : "Easy mode"}
            active={easyMode}
            onClick={() => setEasyMode(!easyMode)}
          />
          {!easyMode && (
            <NavButton
              icon={<Keyboard className="size-5" />}
              label="Keyboard shortcuts"
              onClick={() => useUiStore.getState().setShortcutsOpen(true)}
            />
          )}
          <NavButton
            icon={<LogOut className="size-5" />}
            label="Logout"
            onClick={handleLogout}
          />
        </div>

      </div>
    </Tooltip.Provider>
  );
}
