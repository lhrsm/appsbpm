import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppearanceSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: "light", label: "Claro", icon: Sun },
    { id: "dark", label: "Escuro", icon: Moon },
    { id: "system", label: "Sistema", icon: Monitor },
  ] as const;

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.id;
        return (
          <Button
            key={option.id}
            variant="outline"
            size="sm"
            onClick={() => setTheme(option.id)}
            className={cn(
              "flex h-auto min-h-[54px] flex-col items-center justify-center gap-1.5 rounded-[10px] border px-2 py-2 transition-all duration-200",
              active
                ? "border-[#168a49] bg-[#F0FDF4]/96 text-[#166534] dark:bg-green-500/14 dark:text-[#86efac]"
                : "border-[#168a49]/24 bg-white text-[#263244] hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}