"use client"

import { ShieldCheck, MessageSquare, Bell, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Header({
  mode,
  onModeChange,
}: {
  mode: "chemistry" | "comments"
  onModeChange: (m: "chemistry" | "comments") => void
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card/60 px-5 py-3 backdrop-blur-xl">
      <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
        <ShieldCheck className="size-4 text-primary" />
        Қорғау
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {/* center toggle */}
      <div className="flex items-center rounded-full border border-border bg-secondary/60 p-1">
        <button
          onClick={() => onModeChange("chemistry")}
          className={cn(
            "rounded-full px-5 py-1.5 text-sm font-medium transition-all",
            mode === "chemistry"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Химия
        </button>
        <button
          onClick={() => onModeChange("comments")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-medium transition-all",
            mode === "comments"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MessageSquare className="size-3.5" />
          Пікірлер
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Хабарламалар"
          className="relative flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-card" />
        </button>
        <Button className="rounded-full px-5">Тіркелу</Button>
      </div>
    </header>
  )
}
