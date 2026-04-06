import { Check } from "lucide-react";
import type { Theme } from "../../contexts/ThemeContext";
import { useTheme } from "../../contexts/ThemeContext";

interface ThemeCardProps {
  themeOption: Theme;
}

export default function ThemeCard({ themeOption }: ThemeCardProps) {
  const { theme: activeTheme, setTheme } = useTheme();
  const isActive = activeTheme.id === themeOption.id;
  const t = themeOption;

  const swatchColors = [
    t.colors.background,
    t.colors.accent,
    t.colors.text,
    t.colors.textSecondary,
    t.colors.border,
  ];

  return (
    <button
      onClick={() => setTheme(t.id)}
      className="group relative w-full text-left transition-all cursor-pointer"
      style={{
        padding: "12px",
        backgroundColor: isActive
          ? `${activeTheme.colors.accent}12`
          : activeTheme.colors.surface,
        borderRadius: activeTheme.spacing.borderRadius,
        border: `1px solid ${isActive ? activeTheme.colors.accent : activeTheme.colors.border}`,
      }}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setTheme(t.id);
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="truncate text-sm font-medium"
              style={{ color: activeTheme.colors.text }}
            >
              {t.name}
            </span>
            <span
              className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: t.meta.isDark
                  ? activeTheme.meta.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
                  : activeTheme.meta.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                color: activeTheme.colors.textSecondary,
                borderRadius: "4px",
              }}
            >
              {t.meta.isDark ? "Dark" : "Light"}
            </span>
          </div>
        </div>

        {isActive && (
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            style={{
              backgroundColor: activeTheme.colors.accent,
              borderRadius: "50%",
            }}
          >
            <Check
              size={12}
              style={{
                color: activeTheme.meta.isDark ? "#000000" : "#ffffff",
              }}
            />
          </div>
        )}
      </div>

      {/* Color swatch strip */}
      <div className="mt-2 flex gap-0 overflow-hidden" style={{ borderRadius: "4px", height: "20px" }}>
        {swatchColors.map((color, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              backgroundColor: color,
              borderRight: i < swatchColors.length - 1 ? `1px solid ${activeTheme.colors.border}` : undefined,
            }}
          />
        ))}
      </div>
    </button>
  );
}
