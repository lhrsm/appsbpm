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
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aparência</h3>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          const active = theme === option.id;
          return (
            <Button
              key={option.id}
              variant={active ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center gap-2 h-auto py-3 px-2 transition-all",
                active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
              )}
              onClick={() => setTheme(option.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{option.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
